import socket
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest

from ..tasks.check_website import check_website
from ..tasks.conformance import Issues


class LocalhostHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"OK")

        elif self.path == "/https_redirect":
            self.send_response(302)
            self.send_header("Location", "https://localhost:8443")
            self.end_headers()

        elif self.path == "/domain_redirect":
            self.send_response(302)
            self.send_header("Location", "https://suiteterritoriale.anct.gouv.fr")
            self.end_headers()

        elif self.path == "/slow":
            time.sleep(1)
            self.send_response(200)
            self.end_headers()

        elif self.path == "/timeout":
            time.sleep(10)
            self.send_response(200)
            self.end_headers()

        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Suppress log messages
        pass


@pytest.fixture(scope="function")
def force_all_to_localhost(monkeypatch):
    """Monkeypatch DNS resolution to redirect www.test.com to 127.0.0.1"""
    original_getaddrinfo = socket.getaddrinfo

    def fake_getaddrinfo(host, *args, **kwargs):
        if host in ["www.localexample.fr", "localexample.fr"]:
            return original_getaddrinfo("127.0.0.1", *args, **kwargs)
        return original_getaddrinfo(host, *args, **kwargs)

    monkeypatch.setattr(socket, "getaddrinfo", fake_getaddrinfo)


@pytest.fixture(scope="session")
def http_server():
    server = HTTPServer(("localhost", 8080), LocalhostHandler)
    thread = threading.Thread(target=server.serve_forever)
    thread.daemon = True
    thread.start()

    yield server

    server.server_close()


def test_ok(http_server):
    """Test a site that should always work"""
    issues = check_website("http://suiteterritoriale.anct.gouv.fr/")
    assert len(issues) == 0


def test_https_www_redirect_nok(http_server, force_all_to_localhost):
    """Test a site that doesnt redirect its www correctly"""
    issues = check_website("http://www.localexample.fr/")
    assert Issues.WEBSITE_HTTP_NOWWW in issues


def test_https_www_redirect_ok(http_server):
    """Test a site that redirects its www correctly"""
    issues = check_website("https://www.anct.gouv.fr/")
    assert Issues.WEBSITE_HTTPS_NOWWW not in issues


def test_http_only(http_server):
    """Test a site that doesn't redirect to HTTPS"""
    issues = check_website("http://localhost:8080/")
    assert Issues.WEBSITE_HTTP_REDIRECT in issues


def test_https_redirect(http_server):
    """Test proper HTTP to HTTPS redirect"""
    issues = check_website("http://localhost:8080/https_redirect")
    assert Issues.WEBSITE_HTTP_REDIRECT not in issues


def test_domain_redirect(http_server):
    """Test detection of domain redirect"""
    issues = check_website("http://localhost:8080/domain_redirect")
    assert Issues.WEBSITE_DOMAIN_REDIRECT in issues


def test_ssl_error():
    """Test SSL certificate validation failure"""
    issues = check_website("https://self-signed.badssl.com")
    assert Issues.WEBSITE_SSL in issues


def test_down_website():
    """Test unreachable website"""
    issues = check_website("http://localhost:8888")
    assert Issues.WEBSITE_DOWN in issues

    issues = check_website("http://localhost:8080/slow")
    assert Issues.WEBSITE_DOWN not in issues

    issues = check_website("http://localhost:8080/timeout")
    assert Issues.WEBSITE_DOWN in issues


# def test_www_handling(http_server, https_server):
#     """Test handling of www/non-www variants"""
#     # Test with working www setup
#     issues = check_website("https://www.localhost:8443", bypass_website_regex=True)
#     assert Issues.WEBSITE_HTTPS_NOWWW not in issues

#     # Test with non-working non-www
#     issues = check_website("https://localhost:8444", bypass_website_regex=True)  # Wrong port
#     assert Issues.WEBSITE_HTTPS_NOWWW in issues
