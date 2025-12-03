import json
import logging
import re
import sys

import dns.exception
import dns.resolver
import tldextract
from sentry_sdk.crons import monitor

from celery_app import app

from .conformance import Issues, data_checks_doable, validate_conformance
from .db import find_org_by_siret, list_all_orgs, upsert_issues
from .defs import EU_COUNTRIES
from .lib import geoip_countries_by_hostname

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


@app.task(time_limit=60, acks_late=True)
def run(siret):
    org = find_org_by_siret(siret)

    if not org:
        logger.warning(f"Organization {siret} not found")
        return

    if len(org.get("email_official") or "") > 0:
        conformance_issues = validate_conformance(org["email_official"], "")
        if "dns" not in data_checks_doable(conformance_issues):
            return

        issues, metadata = check_dns(org["email_official"].split("@")[1])

        if issues is not None:  # Only store if we got results
            upsert_issues(siret, "dns", issues, metadata)

        return {
            "issues": {str(x): issues[x] for x in issues.keys()},
            "metadata": metadata,
        }


@app.task
@monitor(
    monitor_slug="check_dns.queue_all",
    monitor_config={
        "schedule": {"type": "crontab", "value": "00 2 * * *"},
        "timezone": "UTC",
        "checkin_margin": 60,  # in minutes
        "max_runtime": 60,
        "failure_issue_threshold": 1,
        "recovery_threshold": 3,
    },
)
def queue_all():
    for org in list_all_orgs():
        run.apply_async(args=[org["siret"]], queue="check_dns")


def check_dns(email_domain):
    """
    Check DNS records (MX, SPF, DKIM, and DMARC) for an email domain
    Returns a dict of Issues with explanations
    """
    if not email_domain:
        return None, None

    issues = {}
    metadata = {}

    # Check MX records
    try:
        mx_records = dns.resolver.resolve(
            email_domain, "MX", raise_on_no_answer=False, lifetime=10
        )
        non_empty_mx_records = [
            record for record in sorted(mx_records, key=lambda x: x.preference) if record.exchange
        ]
    except dns.exception.DNSException as e:
        return {Issues.DNS_DOWN: f"DNS MX lookup failed for {email_domain}: {str(e)}"}, None

    if not non_empty_mx_records:
        issues[Issues.DNS_MX_MISSING] = f"No MX records found for domain {email_domain}"
    else:
        for record in non_empty_mx_records:
            if type(record.exchange.to_text()) != str:
                continue
            ips, countries = geoip_countries_by_hostname(record.exchange.to_text())
            if ips is None or countries is None:
                continue
            non_empty_countries = {c for c in countries if c}
            ips = set(ips)
            if len(non_empty_countries) == 0:
                continue
            metadata["mx_countries"] = list(non_empty_countries)
            metadata["mx_tld"] = str(
                tldextract.extract(record.exchange.to_text()).top_domain_under_public_suffix
            ).lower()
            metadata["mx_ips"] = list(ips)

            outside_eu = [
                country for country in metadata["mx_countries"] if country not in EU_COUNTRIES
            ]
            if len(outside_eu) > 0:
                metadata["mx_countries_outside_eu"] = outside_eu
                issues[Issues.DNS_MX_OUTSIDE_EU] = (
                    f"MX record for {email_domain} has an IP in {outside_eu[0]}, outside of the EU"
                )
            break

    check_spf(email_domain, issues)
    check_dmarc(email_domain, issues)

    return issues, metadata


def check_spf(email_domain, issues):
    """
    Check SPF record
    """
    try:
        spf_records = dns.resolver.resolve(
            email_domain, "TXT", raise_on_no_answer=False, lifetime=10
        )
        spf_found = False
        for record in spf_records:
            # Records can be split into multiple strings, join them
            txt = "".join(
                s.decode("utf-8") if isinstance(s, bytes) else str(s) for s in record.strings
            ).strip()
            if txt.startswith("v=spf1"):
                spf_found = True
                break  # Found one, no need to check others
        if not spf_found:
            issues[Issues.DNS_SPF_MISSING] = f"No SPF record found for {email_domain}"
    except dns.exception.DNSException:
        # Keep existing behavior: report as missing if lookup fails
        issues[Issues.DNS_SPF_MISSING] = f"No SPF record found for {email_domain}"


def check_dmarc(email_domain, issues):
    """
    Check DMARC record
    """
    dmarc_domain = f"_dmarc.{email_domain}"
    try:
        dmarc_records = dns.resolver.resolve(
            dmarc_domain, "TXT", raise_on_no_answer=False, lifetime=10
        )

        dmarc_found = False
        for record in dmarc_records:
            # Join potential multiple strings in one TXT record
            txt = "".join(
                s.decode("utf-8") if isinstance(s, bytes) else str(s) for s in record.strings
            ).strip()
            if txt.startswith("v=DMARC1"):
                dmarc_found = True

                # Parse DMARC policy and percentage, ignoring case for tags
                policy_match = re.search(r"p\s*=\s*(\w+)", txt, re.IGNORECASE)
                pct_match = re.search(r"pct\s*=\s*(\d+)", txt, re.IGNORECASE)

                # Default policy is 'none' if 'p' tag is missing (RFC 7489 Section 6.3)
                policy = policy_match.group(1).lower() if policy_match else "none"
                # Default pct is 100 if 'pct' tag is missing (RFC 7489 Section 6.3)
                pct = int(pct_match.group(1)) if pct_match else 100

                if policy == "none":
                    issues[Issues.DNS_DMARC_WEAK] = (
                        f"DMARC policy (p=) is 'none' for {dmarc_domain}"
                    )
                elif policy == "quarantine" and pct < 100:
                    issues[Issues.DNS_DMARC_WEAK] = (
                        f"DMARC policy (p=) is 'quarantine' with percentage (pct=) < 100 ({pct}%) for {dmarc_domain}"
                    )
                elif policy not in ["quarantine", "reject"]:
                    # Treat policies other than quarantine/reject as weak
                    issues[Issues.DNS_DMARC_WEAK] = (
                        f"DMARC policy (p=) is not 'quarantine' or 'reject' ('{policy}') for {dmarc_domain}"
                    )

                # Process only the first valid DMARC record found (RFC 7489 Section 6.6.3)
                break

        if not dmarc_found:
            issues[Issues.DNS_DMARC_MISSING] = f"No DMARC record found for {dmarc_domain}"

    except dns.exception.DNSException:
        # Keep existing behavior: report as missing if lookup fails
        issues[Issues.DNS_DMARC_MISSING] = f"No DMARC record found for {dmarc_domain}"


if __name__ == "__main__":
    # Run with command line arguments
    siret = sys.argv[1]
    if "." in siret:
        logger.info(check_dns(siret))
    else:
        issues = run(siret)
        logger.info(json.dumps(issues, indent=2))
