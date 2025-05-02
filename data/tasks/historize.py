import json
import logging

from celery_app import app

from .db import historize_table

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


@app.task(time_limit=600, acks_late=True)
def run():
    historize_table("st_organizations")
    historize_table("data_rcpnt_stats")
    return "ok"


if __name__ == "__main__":
    # Run with command line arguments
    ret = run()
    logger.info(json.dumps(ret, indent=2))
