from unittest.mock import MagicMock, patch

import dns.exception
import dns.resolver
import pytest

from ..tasks.check_dns import check_dns
from ..tasks.conformance import Issues


# Mock DNS responses
class MockAnswer:
    def __init__(self, records):
        self.records = records

    def __iter__(self):
        return iter(self.records)


class MockRecord:
    def __init__(self, txt):
        self._txt = txt

    def to_text(self):
        return f'"{self._txt}"'


@pytest.fixture
def mock_resolver():
    with patch("dns.resolver.resolve") as mock_resolve:

        def resolve_mock(qname, rdtype, **kwargs):
            # Convert domain and type to a key for our mock responses
            key = (str(qname), rdtype)

            if key not in resolve_mock.responses:
                raise dns.resolver.NXDOMAIN()

            response = resolve_mock.responses[key]
            if isinstance(response, Exception):
                raise response
            return response

        # Store mock responses in the function object
        resolve_mock.responses = {}

        # Helper to set responses
        def add_response(domain, type, response):
            resolve_mock.responses[(domain, type)] = response

        resolve_mock.add_response = add_response
        mock_resolve.side_effect = resolve_mock
        yield mock_resolve


def test_valid_domain(mock_resolver):
    """Test domain with valid MX, SPF and strong DMARC"""
    domain = "good-domain.fr"
    mock_resolver.side_effect.add_response(domain, "MX", MockAnswer([MagicMock()]))
    mock_resolver.side_effect.add_response(
        domain, "TXT", MockAnswer([MockRecord("v=spf1 include:_spf.example.com ~all")])
    )
    mock_resolver.side_effect.add_response(
        f"_dmarc.{domain}", "TXT", MockAnswer([MockRecord("v=DMARC1; p=reject; pct=100")])
    )

    issues = check_dns(domain)
    assert len(issues) == 0


def test_missing_mx(mock_resolver):
    """Test domain with no MX records"""
    domain = "no-mx.fr"
    mock_resolver.side_effect.add_response(domain, "MX", MockAnswer([]))

    issues = check_dns(domain)
    assert Issues.DNS_MX_MISSING in issues


def test_dns_down(mock_resolver):
    """Test when DNS lookup fails"""
    domain = "dns-error.fr"
    mock_resolver.side_effect.add_response(domain, "MX", dns.exception.DNSException("DNS timeout"))

    issues = check_dns(domain)
    assert Issues.DNS_DOWN in issues


def test_missing_spf(mock_resolver):
    """Test domain with no SPF record"""
    domain = "no-spf.fr"
    mock_resolver.side_effect.add_response(domain, "MX", MockAnswer([MagicMock()]))
    mock_resolver.side_effect.add_response(
        domain, "TXT", MockAnswer([MockRecord("something-else")])
    )
    mock_resolver.side_effect.add_response(
        f"_dmarc.{domain}", "TXT", MockAnswer([MockRecord("v=DMARC1; p=reject; pct=100")])
    )

    issues = check_dns(domain)
    assert Issues.DNS_SPF_MISSING in issues


def test_missing_dmarc(mock_resolver):
    """Test domain with no DMARC record"""
    domain = "no-dmarc.fr"
    mock_resolver.side_effect.add_response(domain, "MX", MockAnswer([MagicMock()]))
    mock_resolver.side_effect.add_response(
        domain, "TXT", MockAnswer([MockRecord("v=spf1 include:_spf.example.com ~all")])
    )
    # No DMARC record - default NXDOMAIN response will be used

    issues = check_dns(domain)
    assert Issues.DNS_DMARC_MISSING in issues


def test_weak_dmarc_policy(mock_resolver):
    """Test domain with weak DMARC policy"""
    domain = "weak-dmarc.fr"
    mock_resolver.side_effect.add_response(domain, "MX", MockAnswer([MagicMock()]))
    mock_resolver.side_effect.add_response(
        domain, "TXT", MockAnswer([MockRecord("v=spf1 include:_spf.example.com ~all")])
    )
    mock_resolver.side_effect.add_response(
        f"_dmarc.{domain}", "TXT", MockAnswer([MockRecord("v=DMARC1; p=quarantine; pct=50")])
    )

    issues = check_dns(domain)
    assert Issues.DNS_DMARC_WEAK in issues


def test_none_dmarc_policy(mock_resolver):
    """Test domain with p=none DMARC policy"""
    domain = "none-dmarc.fr"
    mock_resolver.side_effect.add_response(domain, "MX", MockAnswer([MagicMock()]))
    mock_resolver.side_effect.add_response(
        f"_dmarc.{domain}", "TXT", MockAnswer([MockRecord("v=DMARC1; p=none;")])
    )

    issues = check_dns(domain)
    assert Issues.DNS_DMARC_WEAK in issues
    assert Issues.DNS_DMARC_MISSING not in issues


def test_full_quarantine_dmarc_policy(mock_resolver):
    """Test domain with full quarantine DMARC policy"""
    domain = "full-quarantine-dmarc.fr"
    mock_resolver.side_effect.add_response(domain, "MX", MockAnswer([MagicMock()]))
    mock_resolver.side_effect.add_response(
        f"_dmarc.{domain}", "TXT", MockAnswer([MockRecord("v=DMARC1; p=quarantine; pct=100")])
    )

    issues = check_dns(domain)
    assert Issues.DNS_DMARC_WEAK not in issues
    assert Issues.DNS_DMARC_MISSING not in issues


def test_empty_domain():
    """Test with empty domain"""
    issues = check_dns("")
    assert issues is None


def test_real_domains():
    """Test some real domains - these might need adjustment based on actual policies"""

    # Impots.gouv.fr should have everything set up correctly
    issues = check_dns("impots.gouv.fr")
    assert Issues.DNS_DOWN not in issues
    assert Issues.DNS_MX_MISSING not in issues
    assert Issues.DNS_SPF_MISSING not in issues
    assert Issues.DNS_DMARC_MISSING not in issues

    # suiteterritoriale.anct.gouv.fr should be missing most records
    issues = check_dns("suiteterritoriale.anct.gouv.fr")
    assert Issues.DNS_DOWN not in issues
    assert Issues.DNS_MX_MISSING in issues
    assert Issues.DNS_SPF_MISSING in issues
    assert Issues.DNS_DMARC_MISSING in issues

    # willneverexist.gouv.fr should not be resolving at all
    issues = check_dns("willneverexist.gouv.fr")
    assert Issues.DNS_DOWN in issues
    assert len(issues) == 1


def test_valid_domain_all_records(mock_resolver):
    """Test domain with valid MX, SPF, and strong DMARC"""
    domain = "good-domain.fr"
    mock_resolver.side_effect.add_response(domain, "MX", MockAnswer([MagicMock()]))
    mock_resolver.side_effect.add_response(
        domain, "TXT", MockAnswer([MockRecord("v=spf1 include:_spf.example.com ~all")])
    )
    mock_resolver.side_effect.add_response(
        f"_dmarc.{domain}", "TXT", MockAnswer([MockRecord("v=DMARC1; p=reject;")])
    )

    issues = check_dns(domain)
    assert len(issues) == 0
