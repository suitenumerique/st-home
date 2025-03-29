import re

import dns.exception
import dns.resolver

from celery_app import app

from .conformance import Issues, validate_conformance
from .db import upsert_issues
from .lib import get_org_by_siret, iter_dila


@app.task
def run(siret):
    org = get_org_by_siret(siret)

    if len(org["email"]) > 0:
        conformance_issues = validate_conformance(org["email"], "")
        if (
            Issues.EMAIL_MALFORMED in conformance_issues
            or Issues.EMAIL_DOMAIN_GENERIC in conformance_issues
        ):
            return

        issues = check_dns(org["email"].split("@")[1])

        if issues is not None:  # Only store if we got results
            upsert_issues(siret, "dns", issues)


@app.task
def queue_all():
    for mairie in iter_dila("mairie"):
        run.apply_async(args=[mairie["siret"]], queue="check_dns")


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

    except dns.exception.DNSException as e:
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

    except dns.exception.DNSException as e:
        issues[Issues.DNS_DMARC_MISSING] = f"No DMARC record found for {email_domain}"
