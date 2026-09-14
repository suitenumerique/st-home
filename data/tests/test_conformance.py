from ..tasks.conformance import (
    Issues,
    RcpntRefs,
    data_checks_doable,
    get_rcpnt_conformance,
    is_generic_website_domain,
    is_idna_domain,
    to_punycode,
    validate_conformance,
)
from ..tasks.defs import GENERIC_EMAIL_DOMAINS, GENERIC_WEBSITE_DOMAINS


def test_strict_email_and_website():
    """Test str(Issue)"""
    assert str(Issues.EMAIL_DOMAIN_MISMATCH) == "EMAIL_DOMAIN_MISMATCH"


def test_valid_email_and_website():
    """Test case with valid email and website from same domain"""
    issues = validate_conformance("contact@example.com", "https://example.com")
    assert Issues.EMAIL_DOMAIN_MISMATCH not in issues


def test_missing_email():
    """Test case with missing email"""
    issues = validate_conformance("", "https://example.com")
    assert Issues.EMAIL_MISSING in issues


def test_missing_website():
    """Test case with missing website"""
    issues = validate_conformance("contact@example.com", "")
    assert Issues.WEBSITE_MISSING in issues


def test_malformed_email():
    """Test cases with malformed emails"""
    invalid_emails = [
        "not-an-email",
        "@nodomain.com",
        "no-at-sign.com",
        "spaces @domain.com",
        "special#chars@domain.com",
    ]

    for email in invalid_emails:
        issues = validate_conformance(email, "https://example.com")
        assert Issues.EMAIL_MALFORMED in issues


def test_malformed_website():
    """Test cases with malformed websites"""
    invalid_websites = [
        "not-a-website",
        "ftp://example.com",
        "http:/example.com",
        "https://example",
        "example.com",
        "http://localhost",
        "http://localhost:8080",
    ]

    for website in invalid_websites:
        issues = validate_conformance("contact@example.com", website)
        assert Issues.WEBSITE_MALFORMED in issues


def test_domain_mismatch():
    """Test case where email and website domains don't match"""
    issues = validate_conformance("contact@example.com", "https://different-domain.com")
    assert Issues.EMAIL_DOMAIN_MISMATCH in issues

    issues = validate_conformance("contact@example.com", "")
    assert Issues.EMAIL_DOMAIN_MISMATCH not in issues

    issues = validate_conformance("", "https://different-domain.com")
    assert Issues.EMAIL_DOMAIN_MISMATCH not in issues


def test_www_prefix_handling():
    """Test that www. prefix is properly handled in domain matching"""
    issues = validate_conformance("contact@example.com", "https://www.example.com")
    assert Issues.EMAIL_DOMAIN_MISMATCH not in issues


def test_multiple_issues():
    """Test case with multiple validation issues"""
    issues = validate_conformance("invalid-email", "invalid-website")
    assert Issues.EMAIL_MALFORMED in issues
    assert Issues.WEBSITE_MALFORMED in issues


def test_generic_email_domain():
    """Test case with generic email domain"""
    issues = validate_conformance("contact@gmail.com", "https://example.com")
    assert Issues.EMAIL_DOMAIN_GENERIC in issues

    issues = validate_conformance("contact@mamairie.fr", "")
    assert Issues.EMAIL_DOMAIN_GENERIC not in issues

    # Distributed by a CDG / agence technique départementale
    issues = validate_conformance("balignac@info82.com", "")
    assert Issues.EMAIL_DOMAIN_GENERIC in issues

    # Domains are case-insensitive
    issues = validate_conformance("contact@GMail.com", "")
    assert Issues.EMAIL_DOMAIN_GENERIC in issues


def test_is_generic_website_domain():
    """Shared platforms match on the domain itself and on any subdomain"""
    assert is_generic_website_domain("facebook.com")
    assert is_generic_website_domain("www.facebook.com")
    assert is_generic_website_domain("WWW.Facebook.COM")
    assert is_generic_website_domain("annoisin-chatelans.wixsite.com")
    assert is_generic_website_domain("station.illiwap.com")
    assert is_generic_website_domain("mybujdp.cluster030.hosting.ovh.net")

    # Plateformes mutualisées de CDG: a subdomain per commune, but the domain is
    # the platform's. The .fr made them pass criterion 1.2 on the extension alone.
    assert is_generic_website_domain("abbevillelesconflans.mairie54.fr")
    assert is_generic_website_domain("somloire.mairie49.fr")
    assert is_generic_website_domain("estagel.reseaudescommunes.fr")
    assert is_generic_website_domain("communederonsenac.live-website.com")
    assert is_generic_website_domain("arracourt.wifeo.com")

    # A collectivité's own domain that merely ends with the same letters
    assert not is_generic_website_domain("mairie-tudeils.fr")
    assert not is_generic_website_domain("bilheres-mairie.com")
    assert not is_generic_website_domain("mairiedelapleau-correze.net")
    # Narrow entries must not swallow their parent domain
    assert not is_generic_website_domain("google.com")
    # A mairie d'arrondissement's own host, not a mairie54.fr-style platform
    assert not is_generic_website_domain("mairie19.paris.fr")
    # State service, allowed as a fallback site (WEBSITE_REDIRECT_DOMAINS_ALLOWED)
    assert not is_generic_website_domain("collectivite.fr")


def test_generic_website_domain():
    """A site on a shared platform counts as no site at all"""
    issues = validate_conformance(
        "mairie@example.fr", "https://www.facebook.com/mairiedethimonville"
    )
    assert Issues.WEBSITE_DOMAIN_GENERIC in issues
    # The platform's domain must not be judged in place of the collectivité's
    assert Issues.WEBSITE_DOMAIN_EXTENSION not in issues
    assert Issues.EMAIL_DOMAIN_MISMATCH not in issues
    assert Issues.WEBSITE_MISSING not in issues

    # .fr platforms used to pass criterion 1.2 on the extension alone
    issues = validate_conformance("", "https://lapagelocale.fr/02130-saponay")
    assert Issues.WEBSITE_DOMAIN_GENERIC in issues

    issues = validate_conformance("", "https://www.mairie-tudeils.fr")
    assert Issues.WEBSITE_DOMAIN_GENERIC not in issues


def test_generic_website_domain_blocks_website_criteria():
    """1.1 and everything that depends on the site fall with it, and no website
    check is queued for a platform page"""
    rcpnt = get_rcpnt_conformance([Issues.WEBSITE_DOMAIN_GENERIC])
    for ref in ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8", "2.3"]:
        assert ref not in rcpnt

    assert "website" not in data_checks_doable([str(Issues.WEBSITE_DOMAIN_GENERIC)])
    assert "dns" in data_checks_doable([str(Issues.WEBSITE_DOMAIN_GENERIC)])

    # 2.3 is dropped from the messagerie groups rather than held against the
    # collectivité, as it is for a missing site
    assert "2.a" in rcpnt
    assert "2.aa" in rcpnt


def test_other_org_domains_block_criteria():
    """Domains borrowed from another collectivité are detected in sync.py, but the
    criteria they cost are decided here"""

    rcpnt = get_rcpnt_conformance([Issues.WEBSITE_DOMAIN_OTHER_ORG])
    for ref in ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8", "2.3"]:
        assert ref not in rcpnt
    assert "2.a" in rcpnt  # 2.3 dropped from the group, not held against the org
    assert "website" not in data_checks_doable([str(Issues.WEBSITE_DOMAIN_OTHER_ORG)])

    # A mailbox on another collectivité's domain is generic for this one
    rcpnt = get_rcpnt_conformance([Issues.EMAIL_DOMAIN_OTHER_ORG])
    assert "2.2" not in rcpnt
    assert "2.3" not in rcpnt
    assert "1.a" in rcpnt


def test_website_domains_are_not_email_domains():
    """The two lists are matched differently — exact for email, suffix for websites —
    so a domain shared through subdomains belongs in only one of them. intramuros.org
    sat in GENERIC_EMAIL_DOMAINS, where it matched nothing."""
    assert "intramuros.org" in GENERIC_WEBSITE_DOMAINS
    assert "intramuros.org" not in GENERIC_EMAIL_DOMAINS


def test_consumer_webmail_domains_are_blocklisted():
    """Webmail and ISP domains that are kept as defences even when nothing matches
    them today, so a single commune moving to one is caught right away."""
    for domain in [
        "aol.com",
        "club.fr",
        "club-internet.fr",
        "gmail.fr",
        "mailo.com",
        "netcourrier.fr",
        "netcourrier.com",
        "net-c.fr",
        "online.fr",
        "9online.fr",
    ]:
        assert domain in GENERIC_EMAIL_DOMAINS, domain
        assert Issues.EMAIL_DOMAIN_GENERIC in validate_conformance(f"mairie@{domain}", "")


def test_domain_extension():
    """Test case with domain extension"""
    issues = validate_conformance("", "https://example.com")
    assert Issues.WEBSITE_DOMAIN_EXTENSION in issues

    issues = validate_conformance("", "https://example.re")
    assert Issues.WEBSITE_DOMAIN_EXTENSION not in issues

    issues = validate_conformance("test@example.com", "")
    assert Issues.EMAIL_DOMAIN_EXTENSION in issues

    issues = validate_conformance("test@example.fr", "")
    assert Issues.EMAIL_DOMAIN_EXTENSION not in issues


def test_is_idna_domain():
    """Test IDNA detection on both forms of a domain"""
    assert is_idna_domain("héry.fr")
    assert is_idna_domain("mont-lozère-et-goulet.fr")
    assert is_idna_domain("xn--hry-bma.fr")
    assert is_idna_domain("XN--HRY-BMA.FR")
    assert is_idna_domain("xn--hry-bma.mairie.fr")
    assert not is_idna_domain("hery.fr")
    assert not is_idna_domain("mairie-xn-hery.fr")


def test_to_punycode():
    """Test conversion to the ASCII form of a domain"""
    assert to_punycode("héry.fr") == "xn--hry-bma.fr"
    assert to_punycode("hery.fr") == "hery.fr"
    assert to_punycode("xn--hry-bma.fr") == "xn--hry-bma.fr"

    # UTS-46, like requests, and not the IDNA 2003 codec of the stdlib, which maps
    # this domain to "fass.de" and would make it look like a redirect to another domain
    assert to_punycode("faß.de") == "xn--fa-hia.de"

    # Non-encodable domains are left untouched
    assert to_punycode("héry..fr") == "héry..fr"


def test_website_domain_idna():
    """Test that internationalized website domains are rejected, in both forms"""
    for website in [
        "https://héry.fr",
        "https://www.héry.fr/",
        "https://www.mont-lozère-et-goulet.fr/",
        "https://xn--hry-bma.fr",
        "https://www.xn--hry-bma.fr/annuaire",
    ]:
        issues = validate_conformance("", website)
        assert Issues.WEBSITE_DOMAIN_IDNA in issues, website
        assert Issues.WEBSITE_MALFORMED not in issues, website
        assert Issues.WEBSITE_DOMAIN_EXTENSION not in issues, website

    issues = validate_conformance("", "https://hery.fr")
    assert Issues.WEBSITE_DOMAIN_IDNA not in issues

    # The website is still checked asynchronously
    assert data_checks_doable(validate_conformance("", "https://héry.fr")) == {"website"}


def test_website_domain_idna_rcpnt():
    """Test that internationalized website domains only invalidate criterion 1.2"""
    for website in ["https://www.héry.fr", "https://www.xn--hry-bma.fr"]:
        issues = validate_conformance("", website)
        assert get_rcpnt_conformance(issues) == {
            "1.1",
            "1.3",
            "1.4",
            "1.5",
            "1.6",
            "1.7",
            "1.8",
        }, website

    # Both forms of the domain are equivalent when comparing with the email domain
    issues = validate_conformance("contact@xn--hry-bma.fr", "https://héry.fr")
    assert Issues.EMAIL_DOMAIN_MISMATCH not in issues

    issues = validate_conformance("contact@héry.fr", "https://héry.fr")
    assert Issues.EMAIL_MALFORMED in issues

    # As with a non-sovereign extension, we don't require 2.3 against an IDNA domain
    issues = validate_conformance("contact@mairie-hery.fr", "https://héry.fr")
    assert Issues.EMAIL_DOMAIN_MISMATCH in issues
    assert get_rcpnt_conformance(issues) == RcpntRefs - {"1.2", "1.a", "1.aa", "2.3", "a", "aa"}


def test_email_domain_idna():
    """Test that punycode email domains are rejected"""
    issues = validate_conformance("contact@xn--hry-bma.fr", "")
    assert Issues.EMAIL_DOMAIN_IDNA in issues
    assert Issues.EMAIL_MALFORMED not in issues

    issues = validate_conformance("contact@hery.fr", "")
    assert Issues.EMAIL_DOMAIN_IDNA not in issues

    # Accented email domains are still a syntax error, which blocks all of 2.x
    issues = validate_conformance("contact@héry.fr", "")
    assert Issues.EMAIL_MALFORMED in issues
    assert Issues.EMAIL_DOMAIN_IDNA not in issues


def test_email_domain_idna_rcpnt():
    """Test that a punycode email domain invalidates 2.3, and is not excused when the
    website is missing (the 2.3 relaxation must not reward the second fault)"""

    issues = validate_conformance("contact@xn--hry-bma.fr", "")
    assert get_rcpnt_conformance(issues) == {"2.1", "2.2", "2.4", "2.5", "2.6", "2.7", "2.8"}

    # Same without the IDNA domain: 2.3 is not needed, so the groups are validated
    issues = validate_conformance("contact@hery.fr", "")
    assert get_rcpnt_conformance(issues) == {
        "2.1",
        "2.2",
        "2.4",
        "2.5",
        "2.6",
        "2.7",
        "2.8",
        "2.a",
        "2.aa",
    }

    # A punycode website and its matching punycode email invalidate 1.2 and 2.3
    issues = validate_conformance("contact@xn--hry-bma.fr", "https://www.xn--hry-bma.fr")
    assert Issues.EMAIL_DOMAIN_MISMATCH not in issues
    assert get_rcpnt_conformance(issues) == RcpntRefs - {
        "1.2",
        "2.3",
        "1.a",
        "1.aa",
        "2.a",
        "2.aa",
        "a",
        "aa",
    }


def test_data_checks_doable():
    """Test that data_checks_doable returns the correct set of checks"""
    issues = validate_conformance("", "https://example.com")
    assert data_checks_doable(issues) == {"website"}

    issues = validate_conformance("", "https://exa mple.com")
    assert data_checks_doable(issues) == set()

    issues = validate_conformance("azer  @ville.fr", "")
    assert data_checks_doable(issues) == set()

    issues = validate_conformance("azer@ville.fr", "")
    assert data_checks_doable(issues) == {"dns"}

    issues = validate_conformance("azer@ville.fr", "https://example.com")
    assert data_checks_doable(issues) == {"dns", "website"}


def test_get_rcpnt_conformance():
    """Test that get_rcpnt_conformance returns the correct set of conformance items"""

    FULL_CONFORMANCE = RcpntRefs

    issues = validate_conformance("", "")
    assert Issues.EMAIL_MISSING in issues
    assert Issues.WEBSITE_MISSING in issues
    assert get_rcpnt_conformance(issues) == set()

    issues = validate_conformance("valide@maville.fr", "")
    assert get_rcpnt_conformance(issues) == {
        "2.1",
        "2.2",
        "2.4",
        "2.5",
        "2.6",
        "2.7",
        "2.8",
        "2.a",
        "2.aa",
    }

    issues = validate_conformance("valide@maville.fr", "") + [Issues.DNS_DOWN]
    assert get_rcpnt_conformance(issues) == {"2.1", "2.2"}

    issues = validate_conformance("valide@maville.fr", "") + [Issues.DNS_DMARC_MISSING]
    assert get_rcpnt_conformance(issues) == {"2.1", "2.2", "2.4", "2.5", "2.8", "2.a"}

    issues = validate_conformance("valide@maville.fr", "") + [Issues.DNS_MX_OUTSIDE_EU]
    assert get_rcpnt_conformance(issues) == {"2.1", "2.2", "2.4", "2.5", "2.6", "2.7"}

    issues = validate_conformance("valide@maville.fr", "") + [
        Issues.DNS_DMARC_MISSING,
        Issues.IN_PROGRESS,
    ]
    assert get_rcpnt_conformance(issues) == {"2.1", "2.2", "2.4", "2.5", "2.8", "2.a"}

    issues = validate_conformance("maville@wanadoo.fr", "")
    assert get_rcpnt_conformance(issues) == {"2.1", "2.4", "2.5", "2.6", "2.7", "2.8"}

    issues = validate_conformance("valide@maville.fr", "https://www.maville.fr")
    assert get_rcpnt_conformance(issues) == FULL_CONFORMANCE

    issues = validate_conformance("valide@maville.fr", "https://www.maville.fr") + [
        Issues.DNS_DMARC_WEAK
    ]
    assert get_rcpnt_conformance(issues) == FULL_CONFORMANCE - {"2.7", "2.aa", "aa"}

    issues = validate_conformance("valide@maville.fr", "https://www.maville.fr") + [
        Issues.WEBSITE_DECLARED_HTTP
    ]
    assert get_rcpnt_conformance(issues) == FULL_CONFORMANCE - {"1.8", "1.aa", "aa"}

    issues = validate_conformance("", "https://www.maville.fr")
    assert get_rcpnt_conformance(issues) == {
        "1.1",
        "1.2",
        "1.3",
        "1.4",
        "1.5",
        "1.6",
        "1.7",
        "1.8",
        "1.a",
        "1.aa",
    }

    issues = validate_conformance("", "https://www.maville.fr") + [Issues.WEBSITE_DOWN]
    assert get_rcpnt_conformance(issues) == {"1.1", "1.2", "1.8"}

    issues = validate_conformance("", "https://www.maville.com")
    assert get_rcpnt_conformance(issues) == {"1.1", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8"}

    issues = validate_conformance("test@maville.com", "")
    assert get_rcpnt_conformance(issues) == {"2.1", "2.2", "2.4", "2.5", "2.6", "2.7", "2.8"}

    issues = validate_conformance("test@maville.fr", "https://www.monautreville.fr")
    assert get_rcpnt_conformance(issues) == {
        "2.1",
        "2.2",
        "2.4",
        "2.5",
        "2.6",
        "2.7",
        "2.8",
        "1.1",
        "1.2",
        "1.3",
        "1.4",
        "1.5",
        "1.6",
        "1.7",
        "1.8",
        "1.a",
        "1.aa",
    }

    issues = validate_conformance("test@maville.fr", "http://www.monautreville.com")
    assert get_rcpnt_conformance(issues) == {
        "2.1",
        "2.2",
        "2.4",
        "2.5",
        "2.6",
        "2.7",
        "2.8",
        "1.1",
        "1.3",
        "1.4",
        "1.5",
        "1.6",
        "1.7",
        "2.a",
        "2.aa",
    }

    issues = validate_conformance("", "https://www.maville.com") + [Issues.WEBSITE_DOMAIN_REDIRECT]
    assert get_rcpnt_conformance(issues) == {"1.1", "1.3", "1.4", "1.5", "1.7", "1.8"}

    # This is somewhat hacky, but in this case we don't validate 2.3 (email_domain=website_domain)
    # because we want to somehow invalidate the email with .com
    issues = validate_conformance("test@maville.com", "https://maville.com")
    assert get_rcpnt_conformance(issues) == {
        "1.1",
        "1.3",
        "1.4",
        "1.5",
        "1.6",
        "1.7",
        "1.8",
        "2.1",
        "2.2",
        "2.4",
        "2.5",
        "2.6",
        "2.7",
        "2.8",
    }
