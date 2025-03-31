import os

from celery import Celery

from tasks.db import init_db

# Initialize database tables
init_db()

if os.getenv("SCALINGO_REDIS_URL"):
    broker_url = (
        os.getenv("SCALINGO_REDIS_URL")
        + "/0?ssl_cert_reqs=required&ssl_ca_certs="
        + os.getenv("SCALINGO_REDIS_CA_CERT")
    )
    backend = (
        os.getenv("SCALINGO_REDIS_URL")
        + "/1?ssl_cert_reqs=required&ssl_ca_certs="
        + os.getenv("SCALINGO_REDIS_CA_CERT")
    )
else:
    broker_url = os.getenv("CELERY_BROKER_URL")
    backend = os.getenv("CELERY_RESULT_BACKEND")

app = Celery(
    "st-home-tasks",
    broker=broker_url,
    broker_use_ssl={
        "ssl_cert_reqs": "required",
        "ssl_ca_certs": os.getenv("SCALINGO_REDIS_CA_CERT"),
    }
    if os.getenv("SCALINGO_REDIS_URL")
    else None,
    backend_use_ssl={
        "ssl_cert_reqs": "required",
        "ssl_ca_certs": os.getenv("SCALINGO_REDIS_CA_CERT"),
    }
    if os.getenv("SCALINGO_REDIS_URL")
    else None,
    backend=backend,
    include=["tasks.check_website", "tasks.check_dns"],
)
