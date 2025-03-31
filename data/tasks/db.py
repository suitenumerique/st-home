import datetime
import os
from collections import defaultdict
from typing import Any, Dict

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
    if not issues:
        return

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


def get_data_checks_by_siret(all_data_checks, siret: str):
    """Get issues from checks for a given SIRET. We must have at least one row of each type of check."""

    issues_for_siret = []
    for check in all_data_checks.get(siret, []):
        issues_for_siret.extend(check["issues"])

    expected_types = data_checks_doable(issues_for_siret)
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
