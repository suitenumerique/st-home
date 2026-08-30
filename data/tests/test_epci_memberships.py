import json

import pytest

from tasks import lib
from tasks.defs import EPCI_FP_NATURES
from tasks.lib import iter_epci_memberships


def membership(siren="200070159", nature="CC", membre="211201850", categorie="commune"):
    return {
        "Nom du groupement": "CC de test",
        "N° SIREN": siren,
        "Nature juridique": nature,
        "Département": "12 - Aveyron",
        "Nom membre": "Pont-de-Salars",
        "Siren membre": membre,
        "Catégorie des membres du groupement": categorie,
    }


@pytest.fixture
def banatic(tmp_path, monkeypatch):
    """Écrit un dumps/groupements_memberships.json que lib.py saura lire."""

    def write(rows):
        (tmp_path / "dumps").mkdir(exist_ok=True)
        (tmp_path / "dumps" / "groupements_memberships.json").write_text(json.dumps(rows))
        monkeypatch.chdir(tmp_path)

    return write


def test_keeps_only_epci_a_fiscalite_propre(banatic):
    banatic(
        [
            membership(siren="200070159", nature="CC"),
            membership(siren="200070167", nature="CA"),
            membership(siren="200054781", nature="METRO"),
            # Un syndicat : hors périmètre
            membership(siren="251200016", nature="SIVU"),
            # Un EPT du Grand Paris : hors fiscalité propre
            membership(siren="200057867", nature="EPT"),
        ]
    )
    assert [r["N° SIREN"] for r in iter_epci_memberships()] == [
        "200070159",
        "200070167",
        "200054781",
    ]


def test_keeps_only_commune_members(banatic):
    banatic(
        [
            membership(membre="211201850", categorie="commune"),
            # Les groupements peuvent être membres d'autres groupements
            membership(membre="200070159", categorie="EPCI à fiscalité propre"),
            membership(membre="251200016", categorie="syndicat mixte fermé"),
        ]
    )
    assert [r["Siren membre"] for r in iter_epci_memberships()] == ["211201850"]


def test_natures_cover_every_epci_category():
    """Garde-fou : si BANATIC introduit une nature d'EPCI-FP, on doit le savoir."""
    assert EPCI_FP_NATURES == {"CC", "CA", "CU", "METRO", "MET69"}


def test_paris_lyon_marseille_are_remapped_to_the_parent_commune(banatic, monkeypatch):
    """SIRENE situe le siège de ces trois communes dans un arrondissement municipal."""
    banatic([membership(membre=s) for s in ("217500016", "216901231", "211300553", "211201850")])

    monkeypatch.setattr(
        lib,
        "iter_insee_communes",
        lambda: iter(
            [
                {"COM": "75104", "TYPECOM": "ARM", "COMPARENT": "75056"},
                {"COM": "69381", "TYPECOM": "ARM", "COMPARENT": "69123"},
                {"COM": "13202", "TYPECOM": "ARM", "COMPARENT": "13055"},
                {"COM": "12185", "TYPECOM": "COM", "COMPARENT": ""},
            ]
        ),
    )
    monkeypatch.setattr(
        lib,
        "iter_sirene",
        lambda: iter(
            [
                {
                    "siren": "217500016",
                    "siret": "21750001600019",
                    "codeCommuneEtablissement": "75104",
                },
                {
                    "siren": "216901231",
                    "siret": "21690123100011",
                    "codeCommuneEtablissement": "69381",
                },
                {
                    "siren": "211300553",
                    "siret": "21130055300016",
                    "codeCommuneEtablissement": "13202",
                },
                {
                    "siren": "211201850",
                    "siret": "21120185000011",
                    "codeCommuneEtablissement": "12185",
                },
                # La mairie du 12e partage le SIREN de la Ville de Paris. Elle vient
                # après le siège et la placerait ailleurs si elle n'était pas ignorée,
                # d'où le code volontairement aberrant.
                {
                    "siren": "217500016",
                    "siret": "21750001608343",
                    "codeCommuneEtablissement": "12185",
                },
                # Un SIREN qui n'est pas une commune membre : ignoré
                {
                    "siren": "200070159",
                    "siret": "20007015900013",
                    "codeCommuneEtablissement": "12185",
                },
            ]
        ),
    )

    assert lib.insee_by_commune_siren() == {
        "217500016": "75056",
        "216901231": "69123",
        "211300553": "13055",
        "211201850": "12185",
    }
