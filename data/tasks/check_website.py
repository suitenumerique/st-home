import json
import logging
import re
import sys
from urllib.parse import urljoin, urlparse, urlunparse

import requests
from bs4 import BeautifulSoup
from requests.packages.urllib3.exceptions import InsecureRequestWarning

from celery_app import app

from .conformance import Issues, data_checks_doable, validate_conformance
from .db import find_org_by_siret, list_all_orgs, upsert_issues

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# We disable warnings for SSL errors because we handle them in the code.
# Some requests we explicitly want to do without verifying the SSL certificate,
# to show more precise errors to users.
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)


@app.task(time_limit=60, acks_late=True)
def run(siret):
    org = find_org_by_siret(siret)

    if not org:
        logger.warning(f"Organization {siret} not found")
        return

    if len(org.get("website_url") or "") > 0:
        conformance_issues = validate_conformance("", org["website_url"])
        if "website" not in data_checks_doable(conformance_issues):
            return

        issues, metadata = check_website(org["website_url"])
        if issues is not None:
            upsert_issues(siret, "website", issues, metadata)

        return {str(x): issues[x] for x in issues.keys()}


@app.task
def queue_all():
    for org in list_all_orgs():
        run.apply_async(args=[org["siret"]], queue="check_website")


def check_website(url, force_http_url=None):
    """
    Check website reachability and HTTPS redirect behavior

    Returns:
        tuple: (dict of Issues with explanations, dict of metadata)
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
        "timeout": 5,
        "allow_redirects": True,
        "headers": {
            # https://cdn.jsdelivr.net/gh/microlinkhq/top-user-agents@master/src/desktop.json
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
        },
        "verify": True,
    }

    final_domain_http, http_response = check_http(url, urls_to_test, issues, request_kwargs)
    final_domain_https, https_response = check_https(url, urls_to_test, issues, request_kwargs)
    check_non_www(
        final_domain_https or final_domain_http or base_domain,
        url,
        urls_to_test,
        issues,
        request_kwargs,
    )

    # Test the contents of the declared domain & protocol
    tested_response = http_response if parsed.scheme == "http" else https_response
    metadata = {}
    if tested_response:
        metadata = check_content(tested_response, issues, base_url=urls_to_test["https"])

    return issues, metadata


def check_http(
    base_url, urls_to_test, issues, request_kwargs
) -> tuple[str | None, requests.Response | None]:
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
            expected_domain = re.sub(r"^www\.", "", urlparse(urls_to_test["https"]).netloc)
            final_domain = urlparse(http_response.url).netloc
            final_domain = re.sub(r"\:(80|443)", "", final_domain)
            final_domain = re.sub(r"^www\.", "", final_domain)
            if final_domain != expected_domain:
                issues[Issues.WEBSITE_DOMAIN_REDIRECT] = (
                    f"HTTP Site redirects to different domain: {final_domain} vs. {expected_domain}"
                )

            return final_domain, http_response

    except requests.exceptions.SSLError as e:
        issues[Issues.WEBSITE_SSL] = f"SSL error: {str(e)}"
    except Exception as e:
        if base_url.startswith("https://"):
            issues[Issues.WEBSITE_HTTP_REDIRECT] = "HTTP redirect is down"
        else:
            issues[Issues.WEBSITE_DOWN] = f"HTTP error: {str(e)}"

    return None, None


def check_https(
    base_url, urls_to_test, issues, request_kwargs
) -> tuple[str | None, requests.Response | None]:
    """
    Check HTTPS URL
    """

    try:
        https_response = requests.get(urls_to_test["https"], **request_kwargs)
        if https_response.status_code != 200:
            issues[Issues.WEBSITE_DOWN] = f"HTTPS returned status {https_response.status_code}"
        else:
            # Check if final domain matches original
            expected_domain = re.sub(r"^www\.", "", urlparse(urls_to_test["https"]).netloc)
            final_domain = urlparse(https_response.url).netloc
            final_domain = re.sub(r"\:(80|443)", "", final_domain)
            final_domain = re.sub(r"^www\.", "", final_domain)
            if final_domain != expected_domain:
                issues[Issues.WEBSITE_DOMAIN_REDIRECT] = (
                    f"HTTPS Site redirects to different domain: {final_domain} vs. {expected_domain}"
                )

            return final_domain, https_response

    except requests.exceptions.SSLError as e:
        issues[Issues.WEBSITE_SSL] = f"SSL error: {str(e)}"
    except requests.exceptions.RequestException as e:
        issues[Issues.WEBSITE_DOWN] = f"HTTPS access failed: {str(e)}"
    except Exception as e:
        issues[Issues.WEBSITE_DOWN] = f"HTTPS error: {str(e)}"

    return None, None


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
                final_domain = urlparse(response.url).netloc
                final_domain = re.sub(r"\:(80|443)", "", final_domain)
                final_domain = re.sub(r"^www\.", "", final_domain)
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


def check_content(response, issues, base_url):
    """
    Check the content of the website for accessibility declaration

    Returns:
        dict: Metadata containing a11y_url if found
    """
    metadata = {}

    try:
        html_content = response.text
        soup = BeautifulSoup(html_content, "html.parser")

        # Look for links containing accessibility-related terms
        # Common French terms: "accessibilité", "déclaration", "déclaration d'accessibilité"
        accessibility_keywords = [
            "déclaration d'accessibilité",
            "declaration d'accessibilite",
            "accessibilité",
            "accessibilite",
            "accessibility statement",
            "accessibility",
        ]

        # Search in all anchor tags
        found_url = None
        for link in soup.find_all("a", href=True):
            href = link.get("href", "").strip()
            link_text = link.get_text(strip=True).lower()

            # Check if link text contains accessibility keywords
            for keyword in accessibility_keywords:
                if keyword.lower() in link_text:
                    # Resolve relative URLs to absolute
                    if href:
                        found_url = urljoin(base_url, href)
                        break

            if found_url:
                break

        # Also check common URL patterns if no link text match found
        if not found_url:
            for link in soup.find_all("a", href=True):
                href = link.get("href", "").strip().lower()
                # Common URL patterns for accessibility pages
                url_patterns = [
                    "/accessibilite",
                    "/accessibilite/",
                    "/accessibility",
                    "/declaration-accessibilite",
                    "/declaration-accessibilite/",
                    "/accessibility-statement",
                ]

                for pattern in url_patterns:
                    if pattern in href:
                        found_url = urljoin(base_url, link.get("href"))
                        break

                if found_url:
                    break

        if found_url:
            metadata["a11y_url"] = found_url
        else:
            issues[Issues.WEBSITE_A11Y_MISSING] = f"Accessibility declaration not found on {response.url}"

    except Exception as e:
        logger.warning(f"Error checking website content for accessibility: {str(e)}")

    return metadata


if __name__ == "__main__":
    # Run with command line arguments
    siret = sys.argv[1]
    if "." in siret:
        issues, metadata = check_website(siret)
        logger.info(f"Issues: {issues}")
        logger.info(f"Metadata: {metadata}")
    else:
        issues = run(siret)
        logger.info(json.dumps(issues, indent=2))
