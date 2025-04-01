import datetime
import os
from collections import defaultdict
from typing import Dict

from psycopg2 import connect as pg_connect
from psycopg2.extras import DictCursor

from .conformance import Issues, data_checks_doable


def get_db():
    """Get a database connection"""
    return pg_connect(os.environ.get("DATABASE_URL"), cursor_factory=DictCursor)


def init_db():
    """Initialize database tables"""
    if not os.getenv("DATABASE_URL"):
        return

    with get_db() as db:
        with db.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS data_checks (
                    siret VARCHAR(14) NOT NULL,
                    type VARCHAR(16) NOT NULL,
                    issues VARCHAR(64)[] NOT NULL,
                    details TEXT[] NOT NULL,
                    dt TIMESTAMP WITH TIME ZONE NOT NULL,
                    PRIMARY KEY (siret, type)
                );
            """)
            db.commit()


def upsert_issues(siret: str, check_type: str, issues: Dict[Issues, str]):
    """
    Insert or update issues for a given SIRET and check type

    Args:
        siret: The SIRET number
        check_type: Type of check ('website' or 'dns')
        issues: Dictionary of Issues enum to explanation string
    """

    # Convert the issues dict to two parallel arrays
    issue_keys = []
    issue_details = []
    for key, detail in issues.items():
        issue_keys.append(key.name)  # Use .name to get the string value of the enum
        issue_details.append(detail)

    # Store in database
    with get_db() as db:
        with db.cursor() as cur:
            cur.execute(
                """
                INSERT INTO data_checks (siret, type, issues, details, dt)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (siret, type) DO UPDATE SET
                    issues = EXCLUDED.issues,
                    details = EXCLUDED.details,
                    dt = EXCLUDED.dt
            """,
                (
                    siret,
                    check_type,
                    issue_keys,
                    issue_details,
                    datetime.datetime.now(datetime.timezone.utc),
                ),
            )
        db.commit()


def get_all_data_checks():
    """Get issues from checks for all SIRETs."""

    all_data_checks = defaultdict(list)

    with get_db() as db:
        with db.cursor() as cur:
            cur.execute("SELECT siret, type, issues, details, dt FROM data_checks")
            for check in cur.fetchall():
                all_data_checks[check["siret"]].append(check)

    return all_data_checks


def get_data_checks_by_siret(all_data_checks, conformance_issues, siret: str):
    """Get issues from checks for a given SIRET. We must have at least one row of each type of check."""

    for check in all_data_checks.get(siret, []):
        conformance_issues.extend(check["issues"])

    expected_types = data_checks_doable(conformance_issues)
    checked_types = {check["type"] for check in all_data_checks.get(siret, [])}
    if not expected_types.issubset(checked_types):
        return {
            "IN_PROGRESS": "Checks still in progress: %s"
            % ", ".join(expected_types - checked_types)
        }

    issues = {}

    for check in all_data_checks[siret]:
        for idx, issue in enumerate(check["issues"]):
            issues[issue] = check["details"][idx]

    return issues


def find_org_by_siret(siret: str):
    """Find an organization by SIRET."""

    with get_db() as db:
        with db.cursor() as cur:
            cur.execute("SELECT * FROM st_organizations WHERE siret = %s", (siret,))
            return cur.fetchone()


def list_all_orgs():
    """List all organizations."""
    with get_db() as db:
        with db.cursor() as cur:
            cur.execute("SELECT * FROM st_organizations")
            return cur.fetchall()


def update_data_issues_stats(communes: list):
    """
    Create and populate the data_issues_stats table with statistics about each issue.

    Args:
        communes: List of commune dictionaries containing conformance data
    """
    total_communes = len(communes)

    with get_db() as db:
        with db.cursor() as cur:
            # Drop and recreate the table
            cur.execute("""
                DROP TABLE IF EXISTS data_issues_stats;
                CREATE TABLE data_issues_stats (
                    issue VARCHAR(64) PRIMARY KEY,
                    count INTEGER NOT NULL,
                    percentage DECIMAL(5,2) NOT NULL,
                    sample_with_issue VARCHAR(14)[] NOT NULL,
                    sample_without_issue VARCHAR(14)[] NOT NULL,
                    last_updated TIMESTAMP WITH TIME ZONE NOT NULL
                );
            """)

            # For each possible issue, compute stats
            for issue in Issues:
                # Get communes with and without this issue
                with_issue = [
                    c for c in communes if issue.name in c["_st_conformite"] and c.get("_st_siret")
                ]
                without_issue = [
                    c
                    for c in communes
                    if issue.name not in c["_st_conformite"] and c.get("_st_siret")
                ]

                # Calculate count and percentage
                count = len(with_issue)
                percentage = (count / total_communes) * 100

                # Get random samples (up to 3) of INSEE codes
                import random

                sample_with = (
                    [c["_st_siret"] for c in random.sample(with_issue, min(3, len(with_issue)))]
                    if with_issue
                    else []
                )
                sample_without = (
                    [
                        c["_st_siret"]
                        for c in random.sample(without_issue, min(3, len(without_issue)))
                    ]
                    if without_issue
                    else []
                )

                # Insert the stats
                cur.execute(
                    """
                    INSERT INTO data_issues_stats (issue, count, percentage, sample_with_issue, sample_without_issue, last_updated)
                    VALUES (%s, %s, %s, %s, %s, now())
                """,
                    (issue.name, count, percentage, sample_with, sample_without),
                )

            db.commit()
