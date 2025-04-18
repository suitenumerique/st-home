import logging
import re
import sys

import dns.exception
import dns.resolver
from sentry_sdk.crons import monitor

from celery_app import app

from .conformance import Issues, data_checks_doable, validate_conformance
from .db import find_org_by_siret, list_all_orgs, upsert_issues

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

        issues = check_dns(org["email_official"].split("@")[1])

        if issues is not None:  # Only store if we got results
            upsert_issues(siret, "dns", issues)

        return {str(x): issues[x] for x in issues.keys()}


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
        return None

    issues = {}

    # Check MX records
    try:
        mx_records = dns.resolver.resolve(email_domain, "MX", raise_on_no_answer=False, lifetime=5)
        non_empty_mx_records = [record for record in mx_records if record.exchange]
        if not non_empty_mx_records:
            issues[Issues.DNS_MX_MISSING] = f"No MX records found for domain {email_domain}"
    except dns.exception.DNSException as e:
        return {Issues.DNS_DOWN: f"DNS MX lookup failed for {email_domain}: {str(e)}"}

    check_spf(email_domain, issues)
    check_dmarc(email_domain, issues)

    return issues


def check_spf(email_domain, issues):
    """
    Check SPF record
    """

    try:
        spf_records = dns.resolver.resolve(
            email_domain, "TXT", raise_on_no_answer=False, lifetime=5
        )
        spf_found = False

        for record in spf_records:
            txt = record.to_text().strip('"')
            if txt.startswith("v=spf1"):
                spf_found = True
                break

        if not spf_found:
            issues[Issues.DNS_SPF_MISSING] = f"No SPF record found for {email_domain}"

    except dns.exception.DNSException:
        issues[Issues.DNS_SPF_MISSING] = f"No SPF record found for {email_domain}"


def check_dmarc(email_domain, issues):
    """
    Check DMARC record
    """

    try:
        dmarc_records = dns.resolver.resolve(
            f"_dmarc.{email_domain}", "TXT", raise_on_no_answer=False, lifetime=5
        )

        dmarc_found = False
        for record in dmarc_records:
            txt = record.to_text().strip('"')
            if txt.startswith("v=DMARC1"):
                dmarc_found = True

                # Parse DMARC policy and percentage
                policy_match = re.search(r"p=(\w+)", txt)
                pct_match = re.search(r"pct=(\d+)", txt)

                policy = policy_match.group(1) if policy_match else "none"
                pct = int(pct_match.group(1)) if pct_match else 100

                if policy == "none":
                    issues[Issues.DNS_DMARC_WEAK] = (
                        f"DMARC policy is set to 'none' for {email_domain}"
                    )
                elif policy == "quarantine" and pct < 100:
                    issues[Issues.DNS_DMARC_WEAK] = (
                        f"DMARC policy is set to 'quarantine' with pct<100 for {email_domain}"
                    )
                # elif policy == 'quarantine' or pct < 100:
                #    issues[Issues.DNS_DMARC_WEAK] = f"DMARC policy is weak: p={policy}, pct={pct} for {email_domain}"
                break

        if not dmarc_found:
            issues[Issues.DNS_DMARC_MISSING] = f"No DMARC record found for {email_domain}"

    except dns.exception.DNSException:
        issues[Issues.DNS_DMARC_MISSING] = f"No DMARC record found for {email_domain}"


if __name__ == "__main__":
    # Run with command line arguments
    siret = sys.argv[1]
    issues = run(siret)
    logger.info(issues)
