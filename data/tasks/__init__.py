import os

if os.getenv("DATA_SENTRY_DSN"):
    import sentry_sdk

    # Initializing Sentry SDK in our process
    sentry_sdk.init(
        dsn=os.getenv("DATA_SENTRY_DSN"),
        environment=os.getenv("DATA_SENTRY_ENV"),
        release="st-home-data@" + (os.getenv("GITHUB_SHA") or os.getenv("CONTAINER_VERSION")),
        send_default_pii=True,
    )
