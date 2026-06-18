import json
import logging

from sentry_sdk.crons import monitor

from broker import register_task

from .db import historize_table

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


@register_task(name="historize.run", time_limit=600_000)
@monitor(
    monitor_slug="historize.run",
    monitor_config={
        "schedule": {"type": "crontab", "value": "0 0 1 * *"},
        "timezone": "UTC",
        "checkin_margin": 60,  # in minutes
        "max_runtime": 60,
        "failure_issue_threshold": 1,
        "recovery_threshold": 3,
    },
)
def run():
    historize_table("st_organizations")
    historize_table("st_services")
    historize_table("st_organizations_to_services")
    historize_table("st_organizations_to_operators")
    historize_table("st_operators")
    historize_table("st_services_to_operators")
    historize_table("data_rcpnt_stats")
    return "ok"


if __name__ == "__main__":
    # Run with command line arguments
    ret = run()
    logger.info(json.dumps(ret, indent=2))
