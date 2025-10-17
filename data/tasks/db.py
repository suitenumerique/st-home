import datetime
import json
import os
import random
from collections import defaultdict
from typing import Dict, Optional

from psycopg2 import connect as pg_connect
from psycopg2.extras import DictCursor

from .conformance import Issues, RcpntRefs, data_checks_doable


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
                    metadata JSONB NOT NULL,
                    dt TIMESTAMP WITH TIME ZONE NOT NULL,
                    PRIMARY KEY (siret, type)
                );
            """)
            db.commit()


def upsert_issues(
    siret: str, check_type: str, issues: Dict[Issues, str], metadata: Dict[str, str]
):
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
                INSERT INTO data_checks (siret, type, issues, details, metadata, dt)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (siret, type) DO UPDATE SET
                    issues = EXCLUDED.issues,
                    details = EXCLUDED.details,
                    metadata = EXCLUDED.metadata,
                    dt = EXCLUDED.dt
            """,
                (
                    siret,
                    check_type,
                    issue_keys,
                    issue_details,
                    json.dumps(metadata or {}),
                    datetime.datetime.now(datetime.timezone.utc),
                ),
            )
        db.commit()


def get_all_data_checks():
    """Get issues from checks for all SIRETs."""

    all_data_checks = defaultdict(list)

    with get_db() as db:
        with db.cursor() as cur:
            cur.execute("SELECT siret, type, issues, details, metadata, dt FROM data_checks")
            for check in cur.fetchall():
                all_data_checks[check["siret"]].append(check)

    return all_data_checks


def get_data_checks_by_siret(all_data_checks, conformance_issues, siret: str):
    """Get issues and metadata from checks for a given SIRET.
    We must have at least one row of each type of check."""

    min_dt = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0)

    expected_types = data_checks_doable(conformance_issues)
    checked_types = {check["type"] for check in all_data_checks.get(siret, [])}
    if not expected_types.issubset(checked_types):
        return (
            {
                "IN_PROGRESS": "Checks still in progress: %s"
                % ", ".join(expected_types - checked_types)
            },
            {},
            {},
            min_dt,
        )

    email_metadata = {}
    website_metadata = {}
    issues = {}
    for check in all_data_checks[siret]:
        for idx, issue in enumerate(check["issues"]):
            issues[issue] = check["details"][idx]
        if check["type"] == "dns":
            email_metadata = check.get("metadata", {})
        elif check["type"] == "website":
            website_metadata = check.get("metadata", {})
        min_dt = min(min_dt, check["dt"])

    return issues, website_metadata, email_metadata, min_dt.replace(microsecond=0)


def find_org_by_siret(siret: str):
    """Find an organization by SIRET."""

    with get_db() as db:
        with db.cursor() as cur:
            cur.execute("SELECT * FROM st_organizations WHERE siret = %s", (siret,))
            return cur.fetchone()


def list_all_orgs(type_filter: Optional[str] = None):
    """List all organizations."""
    with get_db() as db:
        with db.cursor() as cur:
            if type_filter:
                cur.execute("SELECT * FROM st_organizations WHERE type = %s", (type_filter,))
            else:
                cur.execute("SELECT * FROM st_organizations")
            return cur.fetchall()


def historize_table(table_name: str):
    """
    Appends the current data from a table to its corresponding history table,
    adding `history_date` (DATE) and `history_month` (VARCHAR(7)) columns
    with the current date and month. Creates the history table (schema only)
    if it doesn't exist.

    Args:
        table_name: The name of the table to historize.
    """
    history_table_name = f"{table_name}_history"

    with get_db() as db:
        with db.cursor() as cur:
            # Check if history table exists
            cur.execute(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = %s);",
                (history_table_name,),
            )
            table_exists = cur.fetchone()[0]

            if not table_exists:
                # Create the history table by copying schema ONLY from the original
                cur.execute(
                    f"CREATE TABLE {history_table_name} AS TABLE {table_name} WITH NO DATA;"
                )
                # Add the history columns
                cur.execute(f"ALTER TABLE {history_table_name} ADD COLUMN history_date DATE;")
                cur.execute(
                    f"ALTER TABLE {history_table_name} ADD COLUMN history_month VARCHAR(7);"
                )
                # No need to populate history columns here, the INSERT below handles it.

            # Get column names from the original table
            # This needs to be done *after* potential table creation
            cur.execute(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = %s
                  AND table_schema = 'public'  -- Assuming public schema, adjust if needed
                ORDER BY ordinal_position;
            """,
                (table_name,),
            )
            columns = [row[0] for row in cur.fetchall()]
            column_list = ", ".join(f'"{col}"' for col in columns)  # Quote column names

            # Insert current data from original table into history table,
            # adding the current date and month for the new history columns.
            # This runs regardless of whether the table was just created or already existed.
            insert_column_list = f"{column_list}, history_date, history_month"
            select_column_list = f"{column_list}, CURRENT_DATE, TO_CHAR(NOW(), 'YYYY-MM')"

            cur.execute(f"""
                INSERT INTO {history_table_name} ({insert_column_list})
                SELECT {select_column_list}
                FROM {table_name};
            """)  # noqa: S608

        db.commit()


def calculate_stats_for_scope(communes, scope_communes):
    """
    Calculate statistics for a given scope of communes.

    Args:
        communes: List of all communes for sampling without_issue
        scope_communes: List of communes in this scope

    Returns:
        List of tuples (issue, count, total, sample_with, sample_without)
    """
    total = len(scope_communes)
    stats = []

    # Pre-compute siret lookup for scope_communes
    scope_sirets = {c["siret"] for c in scope_communes}

    # Pre-compute RCPNT conformance for all communes
    conformity_map = defaultdict(set)
    pop_map = {c["siret"]: c["population"] for c in scope_communes}
    for c in scope_communes:
        for ref in c.get("_st_rcpnt", []):
            conformity_map[ref].add(c["siret"])

    for ref in RcpntRefs:
        valid = conformity_map.get(ref, set())
        count = len(valid)
        count_pop = sum(pop_map.get(siret, 0) for siret in valid)
        total_pop = sum(pop_map.get(siret, 0) for siret in scope_sirets)

        # Get samples - convert sets to lists for random.sample
        sample_valid = random.sample(list(valid), min(3, count)) if valid else []
        sample_invalid = []
        invalid = scope_sirets - valid

        # Pick invalid samples with the fewest other issues
        if invalid:
            # Create a map to count issues for invalid SIRETs
            valid_count = dict.fromkeys(invalid, 0)
            for c in scope_communes:
                if c["siret"] in invalid:
                    valid_count[c["siret"]] += len(c.get("_st_rcpnt", []))

            # Sort invalid SIRETs by issue count and select samples
            least_issues_invalid = sorted(
                invalid, key=lambda siret: valid_count[siret], reverse=True
            )[0:12]
            sample_invalid = random.sample(least_issues_invalid, min(3, len(least_issues_invalid)))

        stats.append((ref, count, total, count_pop, total_pop, sample_valid, sample_invalid))

    return stats


def update_rcpnt_stats(orgs: list):
    """
    Create and populate the data_rcpnt_stats table with statistics about each RCPNT criterion,
    segmented by different geographical scopes.
    """

    # TODO: stats for EPCIs ?
    communes = [x for x in orgs if x["type"] == "commune"]
    epcis = [x for x in orgs if x["type"] == "epci"]

    population_ranges = [200, 500, 1000, 2000, 3500, 5000, 10000, 20000, 50000, 100000]

    def get_population_range(population):
        min_pop = 0
        for max_pop in population_ranges:
            if population <= max_pop:
                return f"{min_pop}-{max_pop}"
            min_pop = max_pop
        return "100000-"

    # Define scopes configuration
    scopes = [
        {"name": "global", "group_by": lambda c: None},
        {"name": "global-epci", "group_by": lambda c: None},
        {"name": "epci", "group_by": lambda c: c.get("_st_epci", {}).get("siren") or None},
        {"name": "dep", "group_by": lambda c: c["insee_dep"]},
        {"name": "reg", "group_by": lambda c: c["insee_reg"]},
        {
            "name": "pop",
            "group_by": lambda c: get_population_range(c["population"]),
        },
    ]

    with get_db() as db:
        with db.cursor() as cur:
            # Drop and recreate the table with index
            cur.execute("""
                DROP TABLE IF EXISTS data_rcpnt_stats;
                CREATE TABLE data_rcpnt_stats (
                    scope VARCHAR(16) NOT NULL,
                    scope_id VARCHAR(16),
                    ref VARCHAR(8) NOT NULL,
                    valid INTEGER NOT NULL,
                    total INTEGER NOT NULL,
                    valid_pop INTEGER NOT NULL,
                    total_pop INTEGER NOT NULL,
                    sample_valid VARCHAR(14)[] NOT NULL,
                    sample_invalid VARCHAR(14)[] NOT NULL,
                    last_updated TIMESTAMP WITH TIME ZONE NOT NULL
                );
                CREATE INDEX idx_data_rcpnt_stats_scope ON data_rcpnt_stats (scope, scope_id);
                CREATE INDEX idx_data_rcpnt_stats_ref ON data_rcpnt_stats (scope, ref);
            """)

            # Process each scope
            for scope in scopes:
                all_scope = communes

                # Group communes by scope
                if scope["name"] == "global":
                    groups = {None: communes}
                elif scope["name"] == "global-epci":
                    groups = {None: epcis}
                    all_scope = epcis
                else:
                    groups = defaultdict(list)
                    for commune in communes:
                        scope_id = scope["group_by"](commune)
                        if scope_id:
                            groups[scope_id].append(commune)

                # Calculate and insert stats for each group
                for scope_id, scope_communes in groups.items():
                    stats = calculate_stats_for_scope(all_scope, scope_communes)
                    for (
                        ref,
                        valid,
                        total,
                        valid_pop,
                        total_pop,
                        sample_valid,
                        sample_invalid,
                    ) in stats:
                        cur.execute(
                            """
                            INSERT INTO data_rcpnt_stats
                            (scope, scope_id, ref, valid, total, valid_pop, total_pop, sample_valid, sample_invalid, last_updated)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, now())
                            """,
                            (
                                scope["name"],
                                scope_id,
                                ref,
                                valid,
                                total,
                                valid_pop,
                                total_pop,
                                sample_valid,
                                sample_invalid,
                            ),
                        )

            db.commit()
