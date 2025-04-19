import os
import socket
import ssl
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest
import requests

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

        elif self.path == "/harmless_redirect":
            self.send_response(302)
            self.send_header("Location", "/")
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
        if host in ["www.localexample.fr", "localexample.fr", "www.localhost"]:
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


@pytest.fixture(scope="session")
def ssl_certs():
    """Generate temporary self-signed certificates for testing"""
    import subprocess
    import tempfile

    # Create temporary file for OpenSSL config
    openssl_config = tempfile.NamedTemporaryFile(delete=False)

    # Create OpenSSL config with SAN for localhost
    with open(openssl_config.name, "w") as f:
        f.write("""
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
DNS.2 = www.localhost
        """)

    # Create temporary files for certificates and keys
    valid_key = tempfile.NamedTemporaryFile(delete=False)
    valid_cert = tempfile.NamedTemporaryFile(delete=False)

    # Generate valid certificate with SAN
    subprocess.run(  # noqa: S603
        [
            "openssl",
            "req",
            "-x509",
            "-nodes",
            "-days",
            "1",
            "-newkey",
            "rsa:2048",
            "-keyout",
            valid_key.name,
            "-out",
            valid_cert.name,
            "-config",
            openssl_config.name,
        ],
        check=True,
    )

    yield (valid_key.name, valid_cert.name)

    # Clean up
    for file in [valid_key, valid_cert, openssl_config]:
        os.unlink(file.name)


@pytest.fixture(scope="session")
def ssl_context():
    """Create a self-signed certificate context for testing"""
    context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    context.load_cert_chain(
        certfile=os.path.join(os.path.dirname(__file__), "localhost.crt"),
        keyfile=os.path.join(os.path.dirname(__file__), "localhost.key"),
    )
    return context


@pytest.fixture(scope="session")
def https_server(ssl_certs):
    """HTTPS server with valid certificate"""
    key_path, cert_path = ssl_certs

    context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    context.load_cert_chain(certfile=cert_path, keyfile=key_path)

    server = HTTPServer(("localhost", 8443), LocalhostHandler)
    server.socket = context.wrap_socket(server.socket, server_side=True)
    thread = threading.Thread(target=server.serve_forever)
    thread.daemon = True
    thread.start()
    yield server
    server.server_close()


@pytest.fixture(scope="function")
def patch_requests_for_local_certs(monkeypatch, ssl_certs):
    """Add the local certificate to requests verification"""
    import requests

    _, cert_path = ssl_certs

    original_get = requests.get

    def patched_get(url, *args, **kwargs):
        if "localhost:8443" in url:
            kwargs["verify"] = cert_path
        return original_get(url, *args, **kwargs)

    monkeypatch.setattr(requests, "get", patched_get)


def test_ok(http_server):
    """Test a site that should always work"""
    issues = check_website("http://suiteterritoriale.anct.gouv.fr/")
    assert len(issues) == 0


def test_http_www_redirect_nok(http_server, force_all_to_localhost):
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


def test_local_ssl(
    http_server, https_server, patch_requests_for_local_certs, force_all_to_localhost
):
    """Test handling of www/non-www variants"""

    # Do a request to the local server
    response = requests.get("https://localhost:8443")
    assert response.status_code == 200

    # Will raise an SSLError because the certificate is not valid for www.localexample.fr
    with pytest.raises(requests.exceptions.SSLError):
        requests.get("https://www.localexample.fr:8443")

    # Test with working https setup. Only issue is http://localhost:8443 will be down.
    issues = check_website("https://localhost:8443")
    assert issues.keys() == {Issues.WEBSITE_HTTP_REDIRECT}

    issues = check_website("https://localhost:8443/harmless_redirect")
    assert issues.keys() == {Issues.WEBSITE_HTTP_REDIRECT}

    # Test with working www setup. Only issue is http://localhost:8443 will be down.
    issues = check_website("https://www.localhost:8443/https_redirect")
    assert issues.keys() == {Issues.WEBSITE_HTTP_REDIRECT, Issues.WEBSITE_HTTP_NOWWW}

    # Test with working www setup. Only issue is http://localhost:8443 will be down.
    issues = check_website("https://www.localhost:8443")
    assert issues.keys() == {Issues.WEBSITE_HTTP_REDIRECT, Issues.WEBSITE_HTTP_NOWWW}

    # Test with nonworking https setup.
    issues = check_website("https://www.localexample.fr:8443")
    assert issues.keys() == {
        Issues.WEBSITE_SSL,
        Issues.WEBSITE_HTTP_REDIRECT,
        Issues.WEBSITE_HTTP_NOWWW,
        Issues.WEBSITE_HTTPS_NOWWW,
    }
