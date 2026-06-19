"""Standalone web dashboard for the dramatiq Redis Streams broker.

Runs as its own process: started by ``scripts/scalingo_run_web`` in production
(behind Caddy with IP allowlist + HTTP basic auth) and by the ``dashboard``
service in docker-compose for local development.

It only reads from Redis (queues are discovered via SCAN) — it never imports the
task modules nor touches the database.

Environment variables:
    WORKER_DASHBOARD_HOST  bind address (default 127.0.0.1)
    WORKER_DASHBOARD_PORT  bind port (default 8090)
    WORKER_DASHBOARD_URL   URL path it is mounted at (default "worker-dashboard")
"""

import os
from socketserver import ThreadingMixIn
from wsgiref.simple_server import WSGIServer, make_server

from dramatiq_redis_streams import StreamsBroker
from dramatiq_redis_streams.dashboard import DashboardApp

import redis_conn


class _ThreadingWSGIServer(ThreadingMixIn, WSGIServer):
    """Handle requests in threads so a slow Redis call can't block the UI."""

    daemon_threads = True


def main():
    host = os.getenv("WORKER_DASHBOARD_HOST", "127.0.0.1")
    port = int(os.getenv("WORKER_DASHBOARD_PORT", "8090"))
    # DashboardApp normalizes the prefix (strips slashes, adds a leading one).
    prefix = os.getenv("WORKER_DASHBOARD_URL", "worker-dashboard")

    # middleware=[] : this broker is read-only, it must not run task middleware.
    broker = StreamsBroker(middleware=[], **redis_conn.broker_kwargs())
    app = DashboardApp(broker, prefix=prefix)

    httpd = make_server(host, port, app, server_class=_ThreadingWSGIServer)
    print(f"Dashboard listening on http://{host}:{port}{prefix or '/'}")  # noqa: T201
    try:
        httpd.serve_forever()
    finally:
        httpd.server_close()
        broker.close()


if __name__ == "__main__":
    main()
