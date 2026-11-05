"""Which collectivités an OPSN covers: its départements, its EPCIs, or both."""

import pytest

from tasks import sync


def org(type, siren, insee_dep="01", epci_siren=None):
    o = {"type": type, "siren": siren, "siret": siren + "00011", "insee_dep": insee_dep}
    if epci_siren:
        o["_st_epci"] = {"siren": epci_siren}
    return o


OPERATORS = [
    {"id": "dep", "departements": ["01"], "epcis": []},
    {"id": "epci", "departements": [], "epcis": ["200070118"]},
    {"id": "both", "departements": ["38"], "epcis": ["200070118"]},
    # A dump written before the column existed
    {"id": "old", "departements": ["01"]},
]


@pytest.fixture(autouse=True)
def operators(monkeypatch):
    monkeypatch.setattr(sync, "iter_operators", lambda: iter(OPERATORS))
    monkeypatch.setattr(sync, "iter_adherents", lambda: iter([]))


def perimetre(o):
    orgs = [o]
    sync.associate_operators_to_orgs(orgs)

    return {link["id"] for link in o["_st_operators"] if link["is_perimetre"]}


def test_a_commune_is_covered_through_its_departement():
    assert perimetre(org("commune", "210100785", insee_dep="01")) == {"dep", "old"}


def test_a_commune_is_covered_through_its_epci():
    assert perimetre(org("commune", "210100785", insee_dep="02", epci_siren="200070118")) == {
        "epci",
        "both",
    }


def test_a_commune_covered_both_ways_is_listed_once():
    o = org("commune", "210100785", insee_dep="38", epci_siren="200070118")
    perimetre(o)

    assert sorted(link["id"] for link in o["_st_operators"]) == ["both", "epci"]


def test_an_epci_is_covered_through_its_own_siren():
    assert perimetre(org("epci", "200070118", insee_dep="02")) == {"epci", "both"}


def test_a_commune_outside_every_scope_has_no_operator():
    assert perimetre(org("commune", "210100785", insee_dep="02", epci_siren="200000000")) == set()
