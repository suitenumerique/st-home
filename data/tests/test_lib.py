from tasks.lib import geoip_country_by_hostname, geoip_country_by_ip


def test_geoip_country_by_ip():
    assert geoip_country_by_ip("82.67.1.1") == "FR"
    assert geoip_country_by_ip("8.8.8.8") == "US"
    assert geoip_country_by_ip("128.65.192.1") == "CH"


def test_geoip_country_by_hostname():
    assert geoip_country_by_hostname("elysee.fr") == "FR"
    assert geoip_country_by_hostname("whitehouse.gov") == "US"
    assert geoip_country_by_hostname("doesntexist.gouv.fr") is None
