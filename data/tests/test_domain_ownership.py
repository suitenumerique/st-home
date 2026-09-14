"""Domains borrowed from another collectivité.

Ownership is judged across orgs, so it lives in sync.py rather than in conformance.py.
"""

from tasks.conformance import Issues
from tasks.sync import declared_domains, index_domain_owners, validate_domain_ownership


def org(
    type="commune",
    name="Certines",
    siren="210100785",
    siret="21010078500019",
    website="",
    email="",
    epci_siren=None,
    insee_dep="01",
    insee_reg="84",
):
    o = {
        "type": type,
        "name": name,
        "siren": siren,
        "siret": siret,
        "insee_dep": insee_dep,
        "insee_reg": insee_reg,
        "_st_website": website,
        "_st_email": email,
        "_st_dila": {"id": "dila-" + siret},
    }
    if epci_siren:
        o["_st_epci"] = {"siren": epci_siren, "name": "CA Grand Bourg Agglomération"}
    return o


EPCI = org(
    type="epci",
    name="CA Grand Bourg Agglomération",
    siren="200070118",
    siret="20007011800011",
    website="https://www.grandbourg.fr/",
    email="contact@grandbourg.fr",
)


def test_declared_domains():
    assert declared_domains(org(website="https://certines.grandbourg.fr/x")) == (
        "grandbourg.fr",
        None,
    )
    assert declared_domains(org(website="https://www.certines.fr")) == ("certines.fr", None)
    assert declared_domains(org(email="mairie@certines.grandbourg.fr")) == (None, "grandbourg.fr")

    # Nothing usable: must not raise, and must not feed the index
    assert declared_domains(org()) == (None, None)
    assert declared_domains(org(website="not-a-url")) == (None, None)
    assert declared_domains(org(email="no-at-sign")) == (None, None)
    assert declared_domains(org(email="mairie@localhost")) == (None, None)


def test_index_domain_owners():
    owners = index_domain_owners([EPCI, org(website="https://www.certines.fr")])

    # Only EPCI / département / région declarations are ownership claims
    assert owners["grandbourg.fr"] == {"200070118"}
    assert "certines.fr" not in owners


def test_index_ignores_generic_and_shared_domains():
    """An EPCI on gmail.com or on Facebook owns neither, and must not drag every
    commune on those domains into WEBSITE/EMAIL_DOMAIN_OTHER_ORG."""

    owners = index_domain_owners(
        [
            org(
                type="epci",
                name="CC de test",
                siren="200070159",
                siret="20007015900013",
                website="https://www.facebook.com/cc-de-test",
                email="contact@gmail.com",
            )
        ]
    )

    assert "facebook.com" not in owners
    assert "gmail.com" not in owners


def test_generic_platform_under_a_subdomain():
    """A Google Sites page is on "sites.google.com", which reduces to "google.com":
    a domain on no list, which would have been indexed as owned by the EPCI and
    flagged as borrowed on every commune hosted there."""

    epci = org(
        type="epci",
        name="CC de test",
        siren="200070159",
        siret="20007015900013",
        website="https://sites.google.com/view/cc-de-test",
    )
    commune = org(website="https://sites.google.com/view/certines")

    assert declared_domains(commune) == (None, None)

    owners = index_domain_owners([epci])
    assert "google.com" not in owners
    assert validate_domain_ownership(commune, owners) == []


def test_commune_on_its_epci_domain():
    owners = index_domain_owners([EPCI])
    commune = org(
        website="https://certines.grandbourg.fr",
        email="mairie@grandbourg.fr",
        epci_siren="200070118",
    )

    issues = validate_domain_ownership(commune, owners)
    assert Issues.WEBSITE_DOMAIN_OTHER_ORG in issues
    assert Issues.EMAIL_DOMAIN_OTHER_ORG in issues


def test_commune_on_its_own_domain():
    owners = index_domain_owners([EPCI])
    commune = org(website="https://www.certines.fr", email="mairie@certines.fr")

    assert validate_domain_ownership(commune, owners) == []


def test_epci_on_its_own_domain_is_never_flagged():
    """The bug that put copler.fr and selonnet.fr on the blocklist: penalising the
    owner. Only communes are judged, and only against other SIRENs."""

    owners = index_domain_owners([EPCI])
    assert validate_domain_ownership(EPCI, owners) == []


def test_arrondissement_shares_its_parent_siren():
    """Paris 19e on mairie19.paris.fr, Lyon 1er on mairie1.lyon.fr: établissements of
    the collectivité that owns the domain, so they carry its SIREN."""

    paris = org(
        type="departement",
        name="Paris",
        siren="217500016",
        siret="21750001600019",
        website="https://www.paris.fr/",
    )
    arrondissement = org(
        name="Paris 19e Arrondissement",
        siren="217500016",
        siret="21750001608855",
        website="https://mairie19.paris.fr/",
    )

    assert validate_domain_ownership(arrondissement, index_domain_owners([paris])) == []


def test_ville_centre_keeps_its_own_domain():
    """Brest on brest.fr, also declared by Brest Métropole: the domain carries the
    commune's name, so the commune is the one it belongs to."""

    metropole = org(
        type="epci",
        name="Brest Métropole",
        siren="242900314",
        siret="24290031400029",
        website="https://www.brest.fr/",
        insee_dep="29",
    )
    brest = org(
        name="Brest",
        siren="212900190",
        siret="21290019000012",
        website="https://www.brest.fr/",
        insee_dep="29",
    )

    assert validate_domain_ownership(brest, index_domain_owners([metropole])) == []


def test_ville_centre_exemption_is_name_based_not_blanket():
    """A neighbouring commune on the same domain stays flagged"""

    metropole = org(
        type="epci",
        name="Brest Métropole",
        siren="242900314",
        siret="24290031400029",
        website="https://www.brest.fr/",
        insee_dep="29",
    )
    guilers = org(
        name="Guilers",
        siren="212900620",
        siret="21290062000014",
        website="https://www.brest.fr/",
        insee_dep="29",
    )

    assert Issues.WEBSITE_DOMAIN_OTHER_ORG in validate_domain_ownership(
        guilers, index_domain_owners([metropole])
    )
