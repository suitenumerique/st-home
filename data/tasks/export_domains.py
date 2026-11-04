"""Writes the domain lists of `defs` that the web app reads too (src/lib/domains.ts):
`python -m tasks.export_domains`. A test fails when the file is out of date."""

import json
from pathlib import Path

from .defs import DOMAIN_EXTENSIONS_ALLOWED, GENERIC_EMAIL_DOMAINS, GENERIC_WEBSITE_DOMAINS

OUTPUT = Path(__file__).resolve().parent.parent / "domains.json"


def domains_json():
    return (
        json.dumps(
            {
                "extensions_allowed": DOMAIN_EXTENSIONS_ALLOWED,
                "generic_email_domains": GENERIC_EMAIL_DOMAINS,
                "generic_website_domains": GENERIC_WEBSITE_DOMAINS,
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n"
    )


if __name__ == "__main__":
    OUTPUT.write_text(domains_json())
