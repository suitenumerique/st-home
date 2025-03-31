import logging
import re
from urllib.parse import urlparse, urlunparse

import requests

from celery_app import app

from .conformance import Issues, validate_conformance
from .db import find_org_by_siret, list_all_orgs, upsert_issues

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


@app.task
def run(siret):
    org = find_org_by_siret(siret)

    if not org:
        logger.warning(f"Organization {siret} not found")
        return

    if len(org.get("website_url") or "") > 0:
        conformance_issues = validate_conformance("", org["website_url"])
        if "website" not in data_checks_needed(conformance_issues):
            return

        issues = check_website(org["website_url"])
        if issues is not None:
            upsert_issues(siret, "website", issues)


@app.task
def queue_all():
    for org in list_all_orgs():
        run.apply_async(args=[org["siret"]], queue="check_website")


def check_website(url):
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
        "http": urlunparse(("http", parsed.netloc, parsed.path, parsed.params, parsed.query, "")),
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
        "timeout": 5,
        "allow_redirects": True,
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.3"
        },
        "verify": True,
    }

    check_http(urls_to_test, issues, request_kwargs)
    check_https(urls_to_test, issues, request_kwargs)
    check_non_www(urls_to_test, issues, request_kwargs)

    return issues


def check_http(urls_to_test, issues, request_kwargs):
    """
    Check HTTP URL
    """

    try:
        http_response = requests.get(urls_to_test["http"], **request_kwargs)

        # Check if HTTP properly redirects to HTTPS
        if not http_response.url.startswith("https://"):
            issues[Issues.WEBSITE_HTTP_REDIRECT] = f"Site stays on HTTP: {http_response.url}"

        # Check if final domain matches original
        final_domain = urlparse(http_response.url).netloc
        if re.sub(r"^www\.", "", final_domain) != re.sub(
            r"^www\.", "", urlparse(urls_to_test["http"]).netloc
        ):
            issues[Issues.WEBSITE_DOMAIN_REDIRECT] = (
                f"HTTP Site redirects to different domain: {final_domain}"
            )

    except requests.exceptions.SSLError as e:
        issues[Issues.WEBSITE_SSL] = f"SSL error: {str(e)}"
    except requests.exceptions.RequestException as e:
        issues[Issues.WEBSITE_DOWN] = f"HTTP access failed: {str(e)}"
    except Exception as e:
        issues[Issues.WEBSITE_DOWN] = f"HTTP error: {str(e)}"


def check_https(urls_to_test, issues, request_kwargs):
    """
    Check HTTPS URL
    """

    try:
        https_response = requests.get(urls_to_test["https"], **request_kwargs)
        if https_response.status_code != 200:
            issues[Issues.WEBSITE_DOWN] = f"HTTPS returned status {https_response.status_code}"

        # Check if final domain matches original
        final_domain = urlparse(https_response.url).netloc
        if re.sub(r"^www\.", "", final_domain) != re.sub(
            r"^www\.", "", urlparse(urls_to_test["https"]).netloc
        ):
            issues[Issues.WEBSITE_DOMAIN_REDIRECT] = (
                f"HTTPS Site redirects to different domain: {final_domain}"
            )

    except requests.exceptions.SSLError as e:
        issues[Issues.WEBSITE_SSL] = f"SSL error: {str(e)}"
    except requests.exceptions.RequestException as e:
        issues[Issues.WEBSITE_DOWN] = f"HTTPS access failed: {str(e)}"
    except Exception as e:
        issues[Issues.WEBSITE_DOWN] = f"HTTPS error: {str(e)}"


def check_non_www(urls_to_test, issues, request_kwargs):
    """
    Check non-www variants
    """

    for url_type in ["http_no_www", "https_no_www"]:
        if url_type not in urls_to_test:
            continue
        try:
            response = requests.get(urls_to_test[url_type], **request_kwargs)
            if response.status_code != 200 and not response.history:
                if url_type == "http_no_www":
                    issues[Issues.WEBSITE_HTTP_NOWWW] = (
                        f"HTTP without www does not work: {urls_to_test[url_type]}"
                    )
                else:
                    issues[Issues.WEBSITE_HTTPS_NOWWW] = (
                        f"HTTPS without www does not work: {urls_to_test[url_type]}"
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
