import datetime
import os
from collections import defaultdict
from typing import Any, Dict

from psycopg2 import connect as pg_connect
from psycopg2.extras import DictCursor

from .conformance import Issues


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


def get_all_issues():
    """Get issues from checks for all SIRETs."""

    all_issues = defaultdict(list)

    with get_db() as db:
        with db.cursor() as cur:
            cur.execute("SELECT siret, type, issues, details, dt FROM data_checks")
            for check in cur.fetchall():
                all_issues[check["siret"]].append(check)

    return all_issues


def get_issues_by_siret(all_issues, siret: str):
    """Get issues from checks for a given SIRET. We must have at least one row of each type of check."""

    expected_types = {"website", "dns"}

    issues = {}

    # Check that we have at least one row for each expected type
    for expected_type in expected_types:
        if not any(check["type"] == expected_type for check in all_issues[siret]):
            return {"IN_PROGRESS": "Check %s is in progress" % expected_type}

    for check in all_issues[siret]:
        for idx, issue in enumerate(check["issues"]):
            issues[issue] = check["details"][idx]

    return issues
