import logging
import re
import sys
from urllib.parse import urlparse, urlunparse

import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning
from sentry_sdk.crons import monitor

from broker import register_task

from .conformance import Issues, data_checks_doable, validate_conformance
from .db import find_org_by_siret, list_all_orgs, upsert_issues
from .defs import WEBSITE_REDIRECT_DOMAINS_ALLOWED, WEBSITE_REDIRECT_MAX_HOPS

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# We disable warnings for SSL errors because we handle them in the code.
# Some requests we explicitly want to do without verifying the SSL certificate,
# to show more precise errors to users.
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)


@register_task(name="check_website.run", queue="check_website", time_limit=120_000, max_retries=1)
def run(siret):
    org = find_org_by_siret(siret)

    if not org:
        logger.warning(f"Organization {siret} not found")
        return

    if len(org.get("website_url") or "") > 0:
        conformance_issues = validate_conformance("", org["website_url"])
        if "website" not in data_checks_doable(conformance_issues):
            return

        issues = check_website(org["website_url"])
        if issues is not None:
            upsert_issues(siret, "website", issues, {})


@register_task(name="check_website.queue_all")
@monitor(
    monitor_slug="check_website.queue_all",
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
        run.send(org["siret"])


def check_website(url, force_http_url=None):
    """
    Check website reachability and HTTPS redirect behavior
    Returns a dict of Issues with explanations
    """
    issues = {}

    parsed = urlparse(url)
    domain = parsed.netloc
    base_domain = re.sub(r"^www\.", "", domain)

    # Prepare all URL variants we need to test
    urls_to_test = {
        "http": force_http_url
        or urlunparse(("http", parsed.netloc, parsed.path, parsed.params, parsed.query, "")),
        "https": urlunparse(
            ("https", parsed.netloc, parsed.path, parsed.params, parsed.query, "")
        ),
    }

    if base_domain != domain:
        urls_to_test["http_no_www"] = urlunparse(
            ("http", base_domain, parsed.path, parsed.params, parsed.query, "")
        )
        urls_to_test["https_no_www"] = urlunparse(
            ("https", base_domain, parsed.path, parsed.params, parsed.query, "")
        )

    request_kwargs = {
        "timeout": 10,
        "allow_redirects": True,
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.3"
        },
        "verify": True,
    }

    final_domain_http = check_http(url, urls_to_test, issues, request_kwargs)
    final_domain_https = check_https(url, urls_to_test, issues, request_kwargs)
    check_non_www(
        final_domain_https or final_domain_http or base_domain,
        url,
        urls_to_test,
        issues,
        request_kwargs,
    )

    return issues


def normalize_domain(netloc):
    """Lowercase a netloc and strip the default ports and a leading "www."."""
    netloc = netloc.lower()
    netloc = re.sub(r":(80|443)$", "", netloc)
    netloc = re.sub(r"^www\.", "", netloc)
    return netloc


def is_allowed_redirect_domain(domain):
    """
    Whether a website may redirect to (or through) `domain` without breaking RPNT
    criterion 1.6. Matches the allow-listed domains and any of their subdomains.
    """
    domain = normalize_domain(domain)
    return any(
        domain == allowed or domain.endswith("." + allowed)
        for allowed in WEBSITE_REDIRECT_DOMAINS_ALLOWED
    )


def is_trusted_redirect_chain(response, expected_domain):
    """
    Whether the redirect chain that produced `response` stayed within trusted
    domains (the expected domain or an allow-listed one, see is_allowed_redirect_domain)
    across at most WEBSITE_REDIRECT_MAX_HOPS hops. This keeps RPNT criterion 1.6 valid
    when a declared site redirects to — or bounces through — collectivite.fr or *.gouv.fr.
    """
    if len(response.history) > WEBSITE_REDIRECT_MAX_HOPS:
        return False
    for hop in [*response.history, response]:
        domain = normalize_domain(urlparse(hop.url).netloc)
        if domain != expected_domain and not is_allowed_redirect_domain(domain):
            return False
    return True


def check_http(base_url, urls_to_test, issues, request_kwargs):
    """
    Check HTTP URL
    """

    try:
        http_response = requests.get(urls_to_test["http"], **{**request_kwargs, "verify": False})

        if http_response.status_code != 200:
            if base_url.startswith("https://"):
                issues[Issues.WEBSITE_HTTP_REDIRECT] = (
                    f"HTTP redirect returned status {http_response.status_code}"
                )
            else:
                issues[Issues.WEBSITE_DOWN] = f"HTTP returned status {http_response.status_code}"
        else:
            # Check if HTTP properly redirects to HTTPS
            if not http_response.url.startswith("https://"):
                issues[Issues.WEBSITE_HTTP_REDIRECT] = f"Site stays on HTTP: {http_response.url}"

            # Check if final domain matches original
            expected_domain = normalize_domain(urlparse(urls_to_test["https"]).netloc)
            final_domain = normalize_domain(urlparse(http_response.url).netloc)
            if final_domain != expected_domain and not is_trusted_redirect_chain(
                http_response, expected_domain
            ):
                issues[Issues.WEBSITE_DOMAIN_REDIRECT] = (
                    f"HTTP Site redirects to different domain: {final_domain} vs. {expected_domain}"
                )

            return final_domain

    except requests.exceptions.SSLError as e:
        issues[Issues.WEBSITE_SSL] = f"SSL error: {str(e)}"
    except Exception as e:
        if base_url.startswith("https://"):
            issues[Issues.WEBSITE_HTTP_REDIRECT] = "HTTP redirect is down"
        else:
            issues[Issues.WEBSITE_DOWN] = f"HTTP error: {str(e)}"


def check_https(base_url, urls_to_test, issues, request_kwargs):
    """
    Check HTTPS URL
    """

    try:
        https_response = requests.get(urls_to_test["https"], **request_kwargs)
        if https_response.status_code != 200:
            issues[Issues.WEBSITE_DOWN] = f"HTTPS returned status {https_response.status_code}"
        else:
            # Check if final domain matches original
            expected_domain = normalize_domain(urlparse(urls_to_test["https"]).netloc)
            final_domain = normalize_domain(urlparse(https_response.url).netloc)
            if final_domain != expected_domain and not is_trusted_redirect_chain(
                https_response, expected_domain
            ):
                issues[Issues.WEBSITE_DOMAIN_REDIRECT] = (
                    f"HTTPS Site redirects to different domain: {final_domain} vs. {expected_domain}"
                )

            return final_domain

    except requests.exceptions.SSLError as e:
        issues[Issues.WEBSITE_SSL] = f"SSL error: {str(e)}"
    except requests.exceptions.RequestException as e:
        issues[Issues.WEBSITE_DOWN] = f"HTTPS access failed: {str(e)}"
    except Exception as e:
        issues[Issues.WEBSITE_DOWN] = f"HTTPS error: {str(e)}"


def check_non_www(base_final_domain, base_url, urls_to_test, issues, request_kwargs):
    """
    Check non-www variants
    """

    for url_type in ["http_no_www", "https_no_www"]:
        if url_type not in urls_to_test:
            continue
        try:
            response = requests.get(urls_to_test[url_type], **{**request_kwargs, "verify": False})
            if response.status_code != 200 and not response.history:
                if url_type == "http_no_www":
                    issues[Issues.WEBSITE_HTTP_NOWWW] = (
                        f"HTTP without www does not work: {urls_to_test[url_type]}"
                    )
                else:
                    issues[Issues.WEBSITE_HTTPS_NOWWW] = (
                        f"HTTPS without www does not work: {urls_to_test[url_type]}"
                    )
            else:
                # Check if final domain matches original
                final_domain = normalize_domain(urlparse(response.url).netloc)
                if final_domain != base_final_domain:
                    if url_type == "http_no_www":
                        issues[Issues.WEBSITE_HTTP_NOWWW] = (
                            f"HTTP without www redirected to another domain: {final_domain} vs {base_final_domain}"
                        )
                    else:
                        issues[Issues.WEBSITE_HTTPS_NOWWW] = (
                            f"HTTPS without www redirected to another domain: {final_domain}"
                        )

                # In the case of a needed and successful HTTPS redirect,
                # verify the base URL has a correct SSL certificate
                if url_type == "https_no_www" and Issues.WEBSITE_HTTPS_NOWWW not in issues:
                    try:
                        requests.get(base_url, **{**request_kwargs, "allow_redirects": False})
                    except requests.exceptions.SSLError:
                        issues[Issues.WEBSITE_HTTPS_NOWWW] = (
                            f"SSL certificate error on base URL before redirect: {base_url}"
                        )

        except requests.exceptions.RequestException as e:
            if url_type == "http_no_www":
                issues[Issues.WEBSITE_HTTP_NOWWW] = f"HTTP without www failed: {str(e)}"
            else:
                issues[Issues.WEBSITE_HTTPS_NOWWW] = f"HTTPS without www failed: {str(e)}"
        except Exception as e:
            if url_type == "http_no_www":
                issues[Issues.WEBSITE_HTTP_NOWWW] = f"HTTP error: {str(e)}"
            else:
                issues[Issues.WEBSITE_HTTPS_NOWWW] = f"HTTPS error: {str(e)}"


if __name__ == "__main__":
    # CLI: pass a URL to check it directly, or a SIRET to check that org's
    # website. Prints check_website()'s return value; no DB write.
    arg = sys.argv[1]
    if "." in arg:
        print(check_website(arg))  # noqa: T201
    else:
        org = find_org_by_siret(arg)
        url = (org or {}).get("website_url")
        print(check_website(url) if url else f"No website for org {arg}")  # noqa: T201
