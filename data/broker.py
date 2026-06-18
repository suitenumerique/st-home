"""Background task broker setup and the ``@register_task`` decorator.

Task modules decorate their functions with ``@register_task`` (imported from
here), which both configures the global broker and keeps the modules free of any
direct dependency on the queue implementation.

In tests we use a ``StubBroker``: registering a task eagerly creates Redis
consumer groups on the real broker (and thus requires a running Redis). The stub
keeps everything in memory so importing task modules stays cheap and offline.
"""

import os

import dramatiq

from tasks.db import init_db

# Initialize database tables (no-op when DATABASE_URL is unset, e.g. in tests).
init_db()


class _SentryMiddleware(dramatiq.Middleware):
    """Report unhandled task exceptions to Sentry.

    dramatiq has no first-party Sentry integration, so we wire it up ourselves.
    """

    def after_process_message(self, broker, message, *, result=None, exception=None):
        if exception is not None:
            import sentry_sdk

            sentry_sdk.capture_exception(exception)


def _make_broker():
    if os.getenv("WORKER_TESTING") == "1":
        from dramatiq.brokers.stub import StubBroker

        return StubBroker()

    from dramatiq_redis_streams import StreamsBroker

    import redis_conn

    instance = StreamsBroker(**redis_conn.broker_kwargs())

    if os.getenv("DATA_SENTRY_DSN"):
        instance.add_middleware(_SentryMiddleware())

    return instance


broker = _make_broker()
dramatiq.set_broker(broker)


def register_task(fn=None, *, name=None, queue="default", time_limit=None, max_retries=None):
    """Register a function as a background task.

    Implementation-agnostic wrapper so task modules don't reference the queue
    library directly. The returned object can be called to run the task
    synchronously, and exposes ``.send(*args)`` to enqueue it.

    Args:
        name: unique task name (defaults to the function name).
        queue: queue to route the task to.
        time_limit: max run time in milliseconds.
        max_retries: number of retries on failure.
    """
    options = {}
    if time_limit is not None:
        options["time_limit"] = time_limit
    if max_retries is not None:
        options["max_retries"] = max_retries

    def decorator(func):
        return dramatiq.actor(func, actor_name=name or func.__name__, queue_name=queue, **options)

    return decorator(fn) if fn is not None else decorator
