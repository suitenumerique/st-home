from ..tasks.conformance import Issues, data_checks_doable, validate_conformance


def test_strict_email_and_website():
    """Test str(Issue)"""
    assert str(Issues.EMAIL_DOMAIN_MISMATCH) == "EMAIL_DOMAIN_MISMATCH"


def test_valid_email_and_website():
    """Test case with valid email and website from same domain"""
    issues = validate_conformance("contact@example.com", "https://example.com")
    assert Issues.EMAIL_DOMAIN_MISMATCH not in issues


def test_missing_email():
    """Test case with missing email"""
    issues = validate_conformance("", "https://example.com")
    assert Issues.EMAIL_MISSING in issues


def test_missing_website():
    """Test case with missing website"""
    issues = validate_conformance("contact@example.com", "")
    assert Issues.WEBSITE_MISSING in issues


def test_malformed_email():
    """Test cases with malformed emails"""
    invalid_emails = [
        "not-an-email",
        "@nodomain.com",
        "no-at-sign.com",
        "spaces @domain.com",
        "special#chars@domain.com",
    ]

    for email in invalid_emails:
        issues = validate_conformance(email, "https://example.com")
        assert Issues.EMAIL_MALFORMED in issues


def test_malformed_website():
    """Test cases with malformed websites"""
    invalid_websites = [
        "not-a-website",
        "ftp://example.com",
        "http:/example.com",
        "https://example",
        "example.com",
        "http://localhost",
        "http://localhost:8080",
    ]

    for website in invalid_websites:
        issues = validate_conformance("contact@example.com", website)
        assert Issues.WEBSITE_MALFORMED in issues


def test_domain_mismatch():
    """Test case where email and website domains don't match"""
    issues = validate_conformance("contact@example.com", "https://different-domain.com")
    assert Issues.EMAIL_DOMAIN_MISMATCH in issues


def test_www_prefix_handling():
    """Test that www. prefix is properly handled in domain matching"""
    issues = validate_conformance("contact@example.com", "https://www.example.com")
    assert Issues.EMAIL_DOMAIN_MISMATCH not in issues


def test_multiple_issues():
    """Test case with multiple validation issues"""
    issues = validate_conformance("invalid-email", "invalid-website")
    assert Issues.EMAIL_MALFORMED in issues
    assert Issues.WEBSITE_MALFORMED in issues


def test_generic_email_domain():
    """Test case with generic email domain"""
    issues = validate_conformance("contact@gmail.com", "https://example.com")
    assert Issues.EMAIL_DOMAIN_GENERIC in issues

    issues = validate_conformance("contact@mamairie.fr", "")
    assert Issues.EMAIL_DOMAIN_GENERIC not in issues


def test_domain_extension():
    """Test case with domain extension"""
    issues = validate_conformance("", "https://example.com")
    assert Issues.WEBSITE_DOMAIN_EXTENSION in issues

    issues = validate_conformance("", "https://example.re")
    assert Issues.WEBSITE_DOMAIN_EXTENSION not in issues

    issues = validate_conformance("test@example.com", "")
    assert Issues.EMAIL_DOMAIN_EXTENSION in issues

    issues = validate_conformance("test@example.fr", "")
    assert Issues.EMAIL_DOMAIN_EXTENSION not in issues


def test_data_checks_doable():
    """Test that data_checks_doable returns the correct set of checks"""
    issues = validate_conformance("", "https://example.com")
    assert data_checks_doable(issues) == {"website"}

    issues = validate_conformance("", "https://exa mple.com")
    assert data_checks_doable(issues) == set()

    issues = validate_conformance("azer  @ville.fr", "")
    assert data_checks_doable(issues) == set()

    issues = validate_conformance("azer@ville.fr", "")
    assert data_checks_doable(issues) == {"dns"}

    issues = validate_conformance("azer@ville.fr", "https://example.com")
    assert data_checks_doable(issues) == {"dns", "website"}
