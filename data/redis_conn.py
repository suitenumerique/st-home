"""Shared Redis connection setup for the dramatiq broker and the dashboard.

Scalingo provides ``SCALINGO_REDIS_URL`` (sometimes a TLS ``rediss://`` URL that
needs the CA cert), otherwise we fall back to ``WORKER_BROKER_URL`` for local
development.
"""

import os


def broker_kwargs() -> dict:
    """Return kwargs for ``StreamsBroker``: either ``{"url": ...}`` or ``{"client": ...}``.

    A pre-configured ``redis.Redis`` client is returned for TLS connections,
    since the streams broker has no dedicated SSL options (it just forwards a
    client). Plain connections use the ``url`` parameter directly.
    """
    scalingo_url = os.getenv("SCALINGO_REDIS_URL")
    if scalingo_url:
        url = scalingo_url + "/0"
        if url.startswith("rediss://"):
            import redis

            client = redis.Redis.from_url(
                url,
                ssl_cert_reqs="required",
                ssl_ca_certs=os.getenv("SCALINGO_REDIS_CA_CERT"),
            )
            return {"client": client}
        return {"url": url}

    return {"url": os.getenv("WORKER_BROKER_URL", "redis://localhost:6379/0")}
