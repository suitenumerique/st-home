import os

from celery import Celery

from tasks.db import init_db

# Initialize database tables
init_db()

app = Celery(
    "st-home-tasks",
    # broker=os.getenv('CELERY_BROKER_URL'),
    # backend=os.getenv('CELERY_RESULT_BACKEND'),
    include=["tasks.check_website", "tasks.check_dns"],
)
