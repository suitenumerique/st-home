from ..tasks.export_domains import OUTPUT, domains_json


def test_domains_json_is_up_to_date():
    assert OUTPUT.read_text() == domains_json(), (
        "data/domains.json is out of date, run `python -m tasks.export_domains`"
    )
