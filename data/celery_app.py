import os

from celery import Celery

from tasks.db import init_db

# Initialize database tables
init_db()

if os.getenv("SCALINGO_REDIS_URL"):
    broker_url = os.getenv("SCALINGO_REDIS_URL") + "/0?ssl_cert_reqs=CERT_NONE"
    backend = os.getenv("SCALINGO_REDIS_URL") + "/1?ssl_cert_reqs=CERT_NONE"
else:
    broker_url = os.getenv("CELERY_BROKER_URL")
    backend = os.getenv("CELERY_RESULT_BACKEND")

app = Celery(
    "st-home-tasks",
    broker=broker_url,
    backend=backend,
    include=["tasks.check_website", "tasks.check_dns"],
)
