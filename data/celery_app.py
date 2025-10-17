import os

from celery import Celery

from tasks.db import init_db

# Initialize database tables
init_db()

kwargs = {
    "include": ["tasks.sync", "tasks.check_website", "tasks.check_dns"],
}

if (os.getenv("SCALINGO_REDIS_URL") or "").startswith("rediss://"):
    kwargs["broker"] = (
        os.getenv("SCALINGO_REDIS_URL")
        + "/0?ssl_cert_reqs=required&ssl_ca_certs="
        + os.getenv("SCALINGO_REDIS_CA_CERT")
    )
    kwargs["backend"] = (
        os.getenv("SCALINGO_REDIS_URL")
        + "/1?ssl_cert_reqs=required&ssl_ca_certs="
        + os.getenv("SCALINGO_REDIS_CA_CERT")
    )
    kwargs["broker_use_ssl"] = {
        "ssl_cert_reqs": "required",
        "ssl_ca_certs": os.getenv("SCALINGO_REDIS_CA_CERT"),
    }
    kwargs["backend_use_ssl"] = {
        "ssl_cert_reqs": "required",
        "ssl_ca_certs": os.getenv("SCALINGO_REDIS_CA_CERT"),
    }
elif os.getenv("SCALINGO_REDIS_URL"):
    kwargs["broker"] = os.getenv("SCALINGO_REDIS_URL") + "/0"
    kwargs["backend"] = os.getenv("SCALINGO_REDIS_URL") + "/1"
else:
    kwargs["broker"] = os.getenv("CELERY_BROKER_URL")
    kwargs["backend"] = os.getenv("CELERY_RESULT_BACKEND")


app = Celery("st-home-tasks", **kwargs)
