import re
from enum import Enum

from .defs import DOMAIN_EXTENSIONS_ALLOWED, GENERIC_EMAIL_DOMAINS


class Issues(Enum):
    # Declarative issues from DILA data
    EMAIL_MISSING = "EMAIL_MISSING"  # No known email
    EMAIL_MALFORMED = "EMAIL_MALFORMED"  # Bad syntax
    WEBSITE_MISSING = "WEBSITE_MISSING"  # No known website
    WEBSITE_MALFORMED = "WEBSITE_MALFORMED"  # Bad syntax
    WEBSITE_DECLARED_HTTP = "WEBSITE_DECLARED_HTTP"  # Website declared as HTTP
    EMAIL_DOMAIN_MISMATCH = "EMAIL_DOMAIN_MISMATCH"  # Email domain does not match website domain
    EMAIL_DOMAIN_GENERIC = "EMAIL_DOMAIN_GENERIC"  # Email domain is generic
    WEBSITE_DOMAIN_EXTENSION = "WEBSITE_DOMAIN_EXTENSION"  # Website domain extension not allowed
    EMAIL_DOMAIN_EXTENSION = "EMAIL_DOMAIN_EXTENSION"  # Email domain extension not allowed

    # Absence of issues from asynchronous checks
    IN_PROGRESS = "IN_PROGRESS"

    # Issues that are tested in check_website
    WEBSITE_DOWN = "WEBSITE_DOWN"  # timeout, unreachable, 404, ..
    WEBSITE_SSL = "WEBSITE_SSL"  # SSL certificate issues
    WEBSITE_DOMAIN_REDIRECT = "WEBSITE_DOMAIN_REDIRECT"  # website redirects to a different domain
    WEBSITE_HTTP_REDIRECT = "WEBSITE_HTTP_REDIRECT"  # website does not redirect to HTTPS
    WEBSITE_HTTPS_NOWWW = "WEBSITE_HTTPS_NOWWW"  # HTTPS URL without "www" doesn't work/redirect
    WEBSITE_HTTP_NOWWW = "WEBSITE_HTTP_NOWWW"  # HTTP URL without "www" does not work or redirect

    # Issues that are tested in check_dns
    DNS_DOWN = "DNS_DOWN"  # DNS lookup failed on the email domain
    DNS_MX_MISSING = "DNS_MX_MISSING"  # MX record missing on the email domain
    DNS_SPF_MISSING = "DNS_SPF_MISSING"  # SPF record missing on the email domain
    DNS_DMARC_MISSING = "DNS_DMARC_MISSING"  # DMARC record missing, or p=none
    DNS_DMARC_WEAK = "DNS_DMARC_WEAK"  # DMARC record is too weak: anything below p=quarantine;pct=100. relaxed alignment is okay for now.
    DNS_MX_OUTSIDE_EU = "DNS_MX_OUTSIDE_EU"  # MX record is outside of the EU

    def __str__(self):
        return self.name


RcpntRefs = {
    "1.1",
    "1.2",
    "1.3",
    "1.4",
    "1.5",
    "1.6",
    "1.7",
    "1.8",
    "2.1",
    "2.2",
    "2.3",
    "2.4",
    "2.5",
    "2.6",
    "2.7",
    "2.8",
    "1.a",
    "1.aa",
    "2.a",
    "2.aa",
    "a",
    "aa",
}


# This regex is purposefully stricter than what is possible. But we want simple addresses for users.
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-z]{2,10}$")
WEBSITE_REGEX = re.compile(
    r"^https?://[-a-zA-Z0-9.]{2,256}\.[a-z]{2,10}(\/[a-zA-Z0-9._\/\?\=-]*)?$"
)

# Version with accents allowed:
# EMAIL_REGEX = re.compile(r"^[a-zA-Zéèçî0-9._-]+@[a-zA-Zéèçî0-9.-]+\.[a-z]{2,10}$")
# WEBSITE_REGEX = re.compile(
#     r"^https?://[-a-zA-Zéèçî0-9.]{2,256}\.[a-z]{2,10}(\/[a-zA-Z0-9._\/\?\=-]*)?$"
# )


def validate_conformance(email, website, bypass_website_regex=False):
    issues = []

    email_domain = ""
    website_domain = ""
    website_domain_extension = ""
    email_domain_extension = ""

    if len(email) == 0:
        issues.append(Issues.EMAIL_MISSING)
    elif not EMAIL_REGEX.match(email):
        issues.append(Issues.EMAIL_MALFORMED)
    else:
        email_domain = email.split("@")[1]
        email_domain_extension = email_domain.split(".")[-1]

    if len(website) == 0:
        issues.append(Issues.WEBSITE_MISSING)
    elif not WEBSITE_REGEX.match(website) and not bypass_website_regex:
        issues.append(Issues.WEBSITE_MALFORMED)
    else:
        website_domain = re.sub(r"^www\.", "", website.split("/")[2])
        website_domain_extension = website_domain.split(".")[-1]

        if website.startswith("http://"):
            issues.append(Issues.WEBSITE_DECLARED_HTTP)

    if len(email_domain) > 0 and len(website_domain) > 0 and email_domain != website_domain:
        issues.append(Issues.EMAIL_DOMAIN_MISMATCH)

    if email_domain and email_domain in GENERIC_EMAIL_DOMAINS:
        issues.append(Issues.EMAIL_DOMAIN_GENERIC)

    if website_domain_extension and website_domain_extension not in DOMAIN_EXTENSIONS_ALLOWED:
        issues.append(Issues.WEBSITE_DOMAIN_EXTENSION)

    if email_domain_extension and email_domain_extension not in DOMAIN_EXTENSIONS_ALLOWED:
        issues.append(Issues.EMAIL_DOMAIN_EXTENSION)

    # print("%s - %s : %s" % (email, website, ", ".join(str(x) for x in issues)))

    return issues


def data_checks_doable(conformance_issues):
    needed = set()

    if (
        len(
            {
                Issues.EMAIL_MISSING.name,
                Issues.EMAIL_MALFORMED.name,
            }.intersection([str(x) for x in conformance_issues])
        )
        == 0
    ):
        needed.add("dns")

    if (
        len(
            {
                Issues.WEBSITE_MISSING.name,
                Issues.WEBSITE_MALFORMED.name,
            }.intersection([str(x) for x in conformance_issues])
        )
        == 0
    ):
        needed.add("website")

    return needed


def get_rcpnt_conformance(issue_list):
    """Transform a list of issues into RCPNT conformance items"""

    issues = {str(x) for x in issue_list}

    # List of groups of criteria
    groups = {
        "1.a": {"1.1", "1.2", "1.3", "1.4", "1.5", "1.6"},
        "1.aa": {"1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8"},
        "a": {"1.1", "1.2", "1.3", "1.4", "1.5", "2.1", "2.2", "2.3", "2.4", "2.5", "2.8"},
        "aa": {
            "1.1",
            "1.2",
            "1.3",
            "1.4",
            "1.5",
            "1.6",
            "1.7",
            "1.8",
            "2.1",
            "2.2",
            "2.3",
            "2.4",
            "2.5",
            "2.6",
            "2.7",
            "2.8",
        },
    }

    if (
        str(Issues.WEBSITE_MISSING) in issues
        or str(Issues.WEBSITE_MALFORMED) in issues
        or str(Issues.WEBSITE_DOMAIN_EXTENSION) in issues
    ) and (str(Issues.EMAIL_DOMAIN_EXTENSION) not in issues):
        # No need for 2.3 in this case
        groups.update(
            {
                "2.a": {"2.1", "2.2", "2.4", "2.5", "2.8"},
                "2.aa": {"2.1", "2.2", "2.4", "2.5", "2.6", "2.7", "2.8"},
            }
        )
    else:
        groups.update(
            {
                "2.a": {"2.1", "2.2", "2.3", "2.4", "2.5", "2.8"},
                "2.aa": {"2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8"},
            }
        )

    # List of criterion that can't be valid if issues are absent (dependencies)
    blocking_issues = {
        # Declarative issues from DILA data
        str(Issues.EMAIL_MISSING): {"2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8"},
        str(Issues.EMAIL_MALFORMED): {"2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8"},
        str(Issues.WEBSITE_MISSING): {
            "1.1",
            "1.2",
            "1.3",
            "1.4",
            "1.5",
            "1.6",
            "1.7",
            "1.8",
            "2.3",
        },
        str(Issues.WEBSITE_MALFORMED): {
            "1.1",
            "1.2",
            "1.3",
            "1.4",
            "1.5",
            "1.6",
            "1.7",
            "1.8",
            "2.3",
        },
        str(Issues.WEBSITE_DECLARED_HTTP): {"1.8"},
        str(Issues.EMAIL_DOMAIN_MISMATCH): {"2.3"},
        str(Issues.EMAIL_DOMAIN_GENERIC): {"2.2", "2.3"},
        str(Issues.WEBSITE_DOMAIN_EXTENSION): {"1.2"},
        str(Issues.EMAIL_DOMAIN_EXTENSION): {"2.3"},
        # Issues that are tested in check_website
        str(Issues.WEBSITE_DOWN): {"1.3", "1.4", "1.5", "1.6", "1.7"},
        str(Issues.WEBSITE_SSL): {"1.5"},
        str(Issues.WEBSITE_DOMAIN_REDIRECT): {"1.6"},
        str(Issues.WEBSITE_HTTP_REDIRECT): {"1.4", "1.7"},
        str(Issues.WEBSITE_HTTPS_NOWWW): {"1.7"},
        str(Issues.WEBSITE_HTTP_NOWWW): {"1.7"},
        # Issues that are tested in check_dns
        str(Issues.DNS_DOWN): {"2.4", "2.5", "2.6", "2.7", "2.8"},
        str(Issues.DNS_MX_MISSING): {"2.4", "2.5", "2.6", "2.7", "2.8"},
        str(Issues.DNS_SPF_MISSING): {"2.5"},
        str(Issues.DNS_DMARC_MISSING): {"2.6", "2.7"},
        str(Issues.DNS_DMARC_WEAK): {"2.7"},
        str(Issues.DNS_MX_OUTSIDE_EU): {"2.8"},
    }

    # By default we're AA
    conformance_items = set(groups["aa"])

    # Remove criteria that can't be valid if issues are absent
    for issue, criteria in blocking_issues.items():
        if issue in issues:
            conformance_items.difference_update(criteria)

    # Add group if all criteria are present
    for group, criteria in groups.items():
        if criteria.issubset(conformance_items):
            conformance_items.add(group)

    return conformance_items
