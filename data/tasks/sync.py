import csv
import json
import logging
import os
import re
from collections import defaultdict

from sentry_sdk.crons import monitor

from celery_app import app

from .conformance import Issues, get_rcpnt_conformance, validate_conformance
from .db import (
    get_all_data_checks,
    get_data_checks_by_siret,
    init_db,
    update_rcpnt_stats,
)
from .defs import HARDCODED_COMMUNES, HARDCODED_DILA_SIRETS
from .dumps import (
    add_dila_issue,
    dump_dila,
    dump_filtered_sirene,
    dump_groupements_memberships,
    dump_insee_communes,
    dump_insee_departements,
    dump_insee_population,
    dump_insee_regions,
    dump_perimetre_epci,
    dump_service_usages,
    dump_services,
    reset_dila_issues,
    upload_file_to_data_gouv,
)
from .lib import (
    duplicates,
    iter_dila,
    iter_groupements_memberships,
    iter_insee_communes,
    iter_insee_departements,
    iter_insee_population,
    iter_insee_regions,
    iter_perimetre_epci,
    iter_repertoire_collectivites,
    iter_repertoire_structures,
    iter_sirene,
    normalize,
)
from .repertoire import dump_repertoire_collectivites, dump_repertoire_structures

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


@app.task
@monitor(
    monitor_slug="sync.run",
    monitor_config={
        "schedule": {"type": "crontab", "value": "20 7 * * *"},
        "timezone": "UTC",
        "checkin_margin": 60,  # in minutes
        "max_runtime": 20,
        "failure_issue_threshold": 1,
        "recovery_threshold": 3,
    },
)
def run():
    """Main data sync workflow"""

    logger.info("Starting data sync workflow")

    # Create the "dumps/" directory if it doesn't exist
    os.makedirs("dumps", exist_ok=True)
    init_db()
    reset_dila_issues()

    dump_insee_communes()
    dump_insee_departements()
    dump_insee_regions()
    dump_insee_population()
    dump_dila()
    dump_repertoire_structures()
    dump_repertoire_collectivites()
    dump_perimetre_epci()
    dump_groupements_memberships()
    dump_services()
    dump_service_usages()

    communes = list_communes()

    logger.info("Count of communes from INSEE: %d", len(communes))

    associate_epci_to_communes(communes)

    communes = filter_invalid_communes(communes)

    # "nature_juridique": "CC",
    # "mode_financ": "FPU",
    epcis = list_epcis()

    departements = list_departements()

    regions = list_regions()

    orgs = regions + departements + epcis + communes

    sirene_row_count = dump_filtered_sirene(orgs)

    logger.info("Dumped filtered sirene: %s rows", sirene_row_count)

    associate_siret_to_organizations(orgs)

    # Remove orgs with no SIRET (warning emitted in the method above)
    orgs = [x for x in orgs if x.get("siret")]

    associate_dila_to_organizations(orgs)

    # Associate Repertoire data to communes
    associate_repertoire_to_orgs(orgs)

    associate_structures_to_orgs(orgs)

    associate_memberships_to_orgs(orgs)

    compute_slug_for_communes(orgs)

    associate_conformance_to_orgs(orgs)

    # Update data issues statistics
    update_rcpnt_stats(orgs)

    create_new_dumps(orgs)


def list_communes():
    """List all communes from INSEE"""

    population_by_insee = {x["GEO"]: int(x["OBS_VALUE"]) for x in iter_insee_population()}

    return [
        {
            "type": "commune" if x["TYPECOM"] == "COM" else "arrondissement",
            "name": x["LIBELLE"],
            "insee_com": x["COM"],
            "insee_dep": x["DEP"],
            "insee_reg": x["REG"],
            "insee_ncc": x["NCC"],
            "population": population_by_insee.get(x["COM"]) or 0,
        }
        for x in iter_insee_communes()
    ]


def list_departements():
    """List all departements from INSEE"""

    communes_to_departments = {x["COM"]: x["DEP"] for x in iter_insee_communes()}
    population_by_insee = {x["GEO"]: int(x["OBS_VALUE"]) for x in iter_insee_population()}

    # Some COM/TOM will be filtered here : https://www.insee.fr/fr/information/7929495
    dila_sirens = {
        communes_to_departments[x["pivot"][0]["code_insee_commune"][0]]: x["siret"][0:9]
        for x in iter_dila("cg")
        if x["pivot"][0]["code_insee_commune"][0] in communes_to_departments
    }

    # Hotfix some issues waiting for DILA fix
    dila_sirens["01"] = "220100010"

    return [
        {
            "type": "departement",
            "name": x["LIBELLE"],
            "insee_dep": x["DEP"],
            "insee_reg": x["REG"],
            "insee_com": x["CHEFLIEU"],
            "siren": dila_sirens.get(x["DEP"]),
            "population": population_by_insee.get(x["DEP"]) or 0,
        }
        for x in iter_insee_departements()
    ]


def list_epcis():
    insee_region_map = {x["DEP"]: x["REG"] for x in iter_insee_departements()}

    return list(
        {
            x["siren"]: {
                "type": "epci",
                "siren": x["siren"],
                "name": x["raison_sociale"],
                "insee_dep": x["dept"],
                "insee_reg": insee_region_map[x["dept"]],
                "population": int(x["total_pop_mun"].replace(" ", "") or 0),
            }
            for x in iter_perimetre_epci()
        }.values()
    )


def list_regions():
    """List all regions from INSEE"""
    communes_to_regions = {x["COM"]: x["REG"] for x in iter_insee_communes()}
    population_by_insee = {x["GEO"]: int(x["OBS_VALUE"]) for x in iter_insee_population()}

    dila_sirens = {
        communes_to_regions[x["pivot"][0]["code_insee_commune"][0]]: x["siret"][0:9]
        for x in iter_dila("cr")
    }

    # Hotfix some issues waiting for DILA fix
    dila_sirens["84"] = "200053767"

    return [
        {
            "type": "region",
            "name": x["LIBELLE"],
            "insee_reg": x["REG"],
            "insee_com": x["CHEFLIEU"],
            "siren": dila_sirens.get(x["REG"]),
            "population": population_by_insee.get(x["REG"]) or 0,
        }
        for x in iter_insee_regions()
    ]


def filter_invalid_communes(communes: list):
    """Remove communes with zero population or no SIREN"""
    len_communes = len(communes)
    communes = [x for x in communes if x["population"] > 0]
    logger.info(
        "Removed %d communes with zero population (from WW2)", len_communes - len(communes)
    )
    assert len_communes - len(communes) < 10

    len_communes = len(communes)
    communes = [x for x in communes if x.get("siren")]
    if len_communes - len(communes) > 0:
        logger.warning("Removed %d communes with no SIREN", len_communes - len(communes))

    return communes


def associate_epci_to_communes(communes: list):
    """Associate EPCIs to communes. Add SIREN as a benefit of this data source."""
    perimetre_epci_by_insee = {x["insee"]: x for x in iter_perimetre_epci()}

    for commune in communes:
        if commune["type"] != "commune":
            continue
        insee = commune["insee_com"]
        if insee in perimetre_epci_by_insee:
            commune["_st_epci"] = perimetre_epci_by_insee[insee]
            commune["siren"] = commune["_st_epci"]["siren_membre"]
            commune["population"] = int(commune["_st_epci"]["pmun_2025"].replace(" ", "") or 0)
        elif insee in HARDCODED_COMMUNES:
            commune["siren"] = HARDCODED_COMMUNES[insee]["siren"]
            commune["population"] = HARDCODED_COMMUNES[insee]["pmun_2025"]
            commune["siret"] = HARDCODED_COMMUNES[insee]["siret"]
            commune["zipcode"] = HARDCODED_COMMUNES[insee]["zipcode"]
        else:
            logger.warning(f"Missing insee in perimetre_epci: {commune['name']} {insee}")


def associate_siret_to_organizations(orgs: list):
    """Associate SIRETs to orgs, using SIREN as pivot. Add Address & zipcode as a benefit of this data source."""

    siren_index = {}
    for row in iter_sirene():
        if row["siren"] in siren_index:
            logger.warning(f"Duplicate siren in SIRENE: {row['siren']} {row['siret']}")
        else:
            siren_index[row["siren"]] = row

    for org in orgs:
        if org["siren"] not in siren_index:
            logger.warning(f"Missing siren in SIRENE: {org['name']} {org['siren']}")
        else:
            org["siret"] = siren_index[org["siren"]]["siret"]
            # commune["_st_address"] = siren_index[commune["siren"]]["libelleVoieEtablissement"]
            org["zipcode"] = siren_index[org["siren"]]["codePostalEtablissement"]


def associate_dila_to_organizations(orgs: list):
    """Associate DILA data to orgs, with INSEE or SIRETs as pivot: email & website"""

    # INSEE seems more reliable than SIRETs in DILA data. However there are duplicates.
    mairies_dila_by_insee = defaultdict(list)
    for mairie in iter_dila("mairie"):
        mairies_dila_by_insee[mairie["pivot"][0]["code_insee_commune"][0]].append(mairie)

    orgs_dila_by_siret = defaultdict(list)
    orgs_dila_by_siren = defaultdict(list)
    orgs_dila_by_id = {}
    for type_service_local in ["mairie", "epci", "cg", "cr"]:
        for dila_row in iter_dila(type_service_local):
            orgs_dila_by_siret[dila_row["siret"]].append(dila_row)
            orgs_dila_by_siren[dila_row["siret"][0:9]].append(dila_row)
            orgs_dila_by_id[dila_row["id"]] = dila_row

    for org in orgs:
        dila_match = None

        # Simple cases first

        # Harcoded special cases
        if (
            org["siret"] in HARDCODED_DILA_SIRETS
            and HARDCODED_DILA_SIRETS[org["siret"]] in orgs_dila_by_id
        ):
            dila_match = orgs_dila_by_id[HARDCODED_DILA_SIRETS[org["siret"]]]

        # Match by INSEE for communes
        elif org["type"] == "commune" and len(mairies_dila_by_insee[org["insee_com"]]) == 1:
            dila_match = mairies_dila_by_insee[org["insee_com"]][0]

        # Match by SIRET for all
        elif len(orgs_dila_by_siret[org["siret"]]) == 1:
            dila_match = orgs_dila_by_siret[org["siret"]][0]

        # Match by SIREN for all
        elif len(orgs_dila_by_siren[org["siren"]]) == 1:
            dila_match = orgs_dila_by_siren[org["siren"]][0]

        # Zero matches
        elif (
            (
                (org["type"] == "commune" and len(mairies_dila_by_insee[org["insee_com"]]) == 0)
                or (org["type"] != "commune")
            )
            and len(orgs_dila_by_siret[org["siret"]]) == 0
            and len(orgs_dila_by_siren[org["siren"]]) == 0
        ):
            logger.warning(
                f"No match for INSEE+SIRET in DILA for org {org['name']} (pop. {org['population']}) {org.get('insee_com')} {org['siret']}"
            )
            continue

        # Multiple matches
        else:
            all_matches = {
                x["id"]: x
                for x in (
                    mairies_dila_by_insee[org["insee_com"]] if org["type"] == "commune" else []
                )
                + orgs_dila_by_siret[org["siret"]]
                + orgs_dila_by_siren[org["siren"]]
            }

            # We try to find the best match by name
            if org["type"] == "commune":
                normalized_search = normalize("Mairie - " + org["name"])
                normalized_matches = {
                    normalize(x["nom"]): x
                    for x in all_matches.values()
                    if not re.match(r"^mairie.+(déléguée|annexe)", x["nom"], flags=re.IGNORECASE)
                }

                if normalized_search in normalized_matches:
                    dila_match = normalized_matches[normalized_search]

            if not dila_match:
                logger.warning(
                    f"Multiple matches (SIRET or INSEE) in DILA for {org['name']} (pop. {org['population']}) {org.get('insee_com')} {org['siret']}: {[(x['nom'], x['url_service_public']) for x in all_matches.values()]}. Picking none!"
                )
                # We don't pick the first match anymore, preferring to alert communes with missing data.

                # if len(matches) == 1:
                #     dila_match = list(matches.values())[0]
                # else:
                #     logger.warning(
                #         f"Multiple matches (SIRET or INSEE) in DILA for {org['name']} {org['insee_com']}: {[x['nom'] for x in all_matches.values()]}. Picking first!"
                #     )
                #     # No real way here to choose, we pick the first one alphabetically just to be stable.
                #     dila_match = sorted(all_matches.values(), key=lambda x: x["nom"].lower())[0]

        if dila_match:
            org["_st_email"] = (
                dila_match["adresse_courriel"][0]
                if len(dila_match.get("adresse_courriel") or []) > 0
                else ""
            )
            org["_st_website"] = (
                dila_match["site_internet"][0].get("valeur", "")
                if len(dila_match.get("site_internet") or []) > 0
                else ""
            )
            # Remove trailing anchor from website
            org["_st_website"] = org["_st_website"].strip().split("#")[0]

            org["_st_dila"] = dila_match


def associate_repertoire_to_orgs(orgs: list):
    """Associate Grist Repertoire data to orgs"""

    communes_by_insee = {
        x["Code_INSEE_geographique"]: x
        for x in iter_repertoire_collectivites()
        if x["Typologie"] == "Commune"
    }

    epcis_by_siren = {
        x["Numero_SIREN"]: x
        for x in iter_repertoire_collectivites()
        if x["Typologie"] == "EPCI à fiscalité propre"
    }

    for org in orgs:
        if org["type"] == "commune" and org["insee_com"] in communes_by_insee:
            org["_st_repertoire"] = communes_by_insee[org["insee_com"]]
        elif org["type"] == "epci" and org["siren"] in epcis_by_siren:
            org["_st_repertoire"] = epcis_by_siren[org["siren"]]
        elif org["type"] in {"departement", "region", "arrondissement"}:
            pass
        else:
            logger.warning(
                f"Missing commune INSEE or EPCI SIREN in Repertoire: {org['name']} {org.get('insee_com')} {org['siren']}"
            )


def associate_structures_to_orgs(orgs: list):
    """Associate mutualization structures from Repertoire to orgs"""

    colls_by_repertoire_id = {x["id"]: x for x in iter_repertoire_collectivites()}

    structure_mappings = defaultdict(list)

    # "Couverture" is a list of Grist IDs, that can be of any kind.
    for structure in iter_repertoire_structures():
        if not structure["Groupe_Pilote"]:
            continue
        if not structure["Typologie"] or len(structure["Typologie"]) < 2:
            continue
        if len(set(structure["Typologie"][1:]).intersection({"OPSN", "Centre de gestion"})) == 0:
            continue
        if structure["Couverture"] and len(structure["Couverture"]) > 1:
            for couv in structure["Couverture"][1:]:
                structure_mappings[couv].append(structure["id"])

    for org in orgs:
        org["_st_structures"] = []
        if not org.get("_st_repertoire"):
            continue

        # Add all structures scoped to this department, single commune and region
        org["_st_structures"] = (
            structure_mappings[org["_st_repertoire"]["Code_INSEE_departement"]]
            + structure_mappings[org["_st_repertoire"]["Code_INSEE_commune"]]
            + structure_mappings[org["_st_repertoire"]["Code_INSEE_region"]]
        )

        # Scope can also be an EPCI
        # /!\ Numero_SIREN_EPCI is actually a Grist ID, not a SIREN
        if org["_st_repertoire"]["Numero_SIREN_EPCI"]:
            org["_st_structures"].extend(
                structure_mappings[
                    colls_by_repertoire_id[org["_st_repertoire"]["Numero_SIREN_EPCI"]]["id"]
                ]
            )

        # Remove duplicates
        org["_st_structures"] = list(set(org["_st_structures"]))


def associate_memberships_to_orgs(orgs: list):
    """Associate memberships to orgs"""
    structures_with_banatic_name = [
        x for x in iter_repertoire_structures() if x.get("Libelle_BANATIC")
    ]
    memberships = []
    for structure in structures_with_banatic_name:
        memberships.extend(
            [
                {**x, "structure_id": structure.get("id")}
                for x in iter_groupements_memberships()
                if x.get("Nom du groupement") == structure.get("Libelle_BANATIC")
            ]
        )

    # group by siren membre
    memberships_by_siren = defaultdict(list)
    for membership in memberships:
        memberships_by_siren[membership.get("Siren membre")].append(membership)

    for org in orgs:
        org["_st_memberships"] = []
        # If the commune siren is in the memberships, add the memberships structure_id to the commune memberships
        if org.get("siren") in memberships_by_siren:
            org["_st_memberships"] = [
                x.get("structure_id") for x in memberships_by_siren[org.get("siren")]
            ]
        elif org.get("_st_epci", {}).get("siren") in memberships_by_siren:
            org["_st_memberships"] = [
                x.get("structure_id")
                for x in memberships_by_siren[org.get("_st_epci", {}).get("siren")]
            ]

        # Remove duplicates
        org["_st_memberships"] = list(set(org["_st_memberships"]))


def compute_slug_for_communes(orgs: list):
    """Create a unique slug for each commune"""

    communes = [x for x in orgs if x["type"] == "commune"]

    for commune in communes:
        commune["_st_slug"] = commune["insee_ncc"].split("(")[0].lower().strip().replace(" ", "-")
        if not re.match(r"^[a-z0-9-]+$", commune["_st_slug"]):
            raise Exception(f"Invalid slug: {commune['_st_slug']}")

    dupes = duplicates(commune["_st_slug"] for commune in communes)

    logger.warning(f"Duplicate slugs after first pass: {len(dupes)}")

    # Second pass: add department code
    for commune in communes:
        if commune["_st_slug"] in dupes:
            commune["_st_slug"] = f"{commune['_st_slug']}{commune['insee_dep']}"

    dupes = duplicates(commune["_st_slug"] for commune in communes)

    # Third pass: add SIREN
    for commune in communes:
        if commune["_st_slug"] in dupes:
            commune["_st_slug"] = f"{commune['_st_slug']}{commune['siren']}"

    dupes = duplicates(commune["_st_slug"] for commune in communes)
    assert len(dupes) == 0

    # Print top 100 longest slugs with their websites and email domains
    for commune in sorted(communes, key=lambda x: len(x["_st_slug"]), reverse=True)[:100]:
        logger.info(
            f"{commune['_st_slug']} {commune['_st_website'] if len(commune['_st_website']) > 0 else ''} {commune['_st_email'] if len(commune['_st_email']) > 0 else ''}"
        )

    # Count communes with a slug longer than 25 characters
    logger.warning(
        f"Communes with a slug longer than 25 characters: {sum(1 for commune in communes if len(commune['_st_slug']) > 25)}"
    )


def associate_conformance_to_orgs(orgs: list):
    """Associate conformance to orgs"""

    all_data_checks = get_all_data_checks()

    logger.info("Fetched data_checks for %d orgs", len(all_data_checks))

    for org in orgs:
        org["_st_conformite"] = [
            str(issue)
            for issue in validate_conformance(
                org.get("_st_email") or "", org.get("_st_website") or ""
            )
        ]

        # Add the issues added in asynchronous checks
        issues, website_metadata, email_metadata, min_dt = get_data_checks_by_siret(
            all_data_checks, org["_st_conformite"], org["siret"]
        )

        org["_st_conformite"].extend([str(x) for x in issues.keys()])
        org["_st_conformite_checks"] = issues
        org["_st_conformite_checks_dt"] = min_dt
        org["_st_website_metadata"] = website_metadata
        org["_st_email_metadata"] = email_metadata

        # Add the RCPNT conformance info
        org["_st_rcpnt"] = get_rcpnt_conformance(org["_st_conformite"])

        # Report issues to Dila
        if "EMAIL_MALFORMED" in org["_st_conformite"]:
            add_dila_issue(
                org.get("_st_dila", {}).get("id"),
                "EMAIL_MALFORMED",
                repr(org["_st_email"]),
            )
        if "WEBSITE_MALFORMED" in org["_st_conformite"]:
            add_dila_issue(
                org.get("_st_dila", {}).get("id"),
                "WEBSITE_MALFORMED",
                repr(org["_st_website"]),
            )
        if not org.get("_st_dila"):
            add_dila_issue("", "MISSING", org["siret"], "")
        else:
            if org.get("siret") and org["siret"] != org.get("_st_dila", {}).get("siret"):
                add_dila_issue(
                    org.get("_st_dila", {}).get("id"),
                    "SIRET_MISMATCH",
                    org["siret"],
                    "versus in DILA: %s" % org.get("_st_dila", {}).get("siret"),
                )
            if org["type"] == "commune" and org["insee_com"] != org.get("_st_dila", {}).get(
                "code_insee_commune"
            ):
                add_dila_issue(
                    org.get("_st_dila", {}).get("id"),
                    "INSEE_MISMATCH",
                    org["insee_com"],
                    "versus in DILA: %s" % org.get("_st_dila", {}).get("code_insee_commune"),
                )

    logger.info("Conformance statistics:")
    for issue in Issues:
        logger.info(f" - {issue}: {sum(1 for org in orgs if issue.name in org['_st_conformite'])}")


def create_new_dumps(orgs: list):
    """Create new dumps of the orgs"""

    # Dump as JSON
    seen_sirets = set()
    final_data = []
    for org in orgs:
        if org.get("siret") and org.get("siret") in seen_sirets:
            logger.warning(
                f"Skipping org with duplicate SIRET: {org.get('siret')} {org.get('type')} {org.get('name')}"
            )
            continue
        seen_sirets.add(org.get("siret"))

        website_domain = None
        email_domain = None
        website_tld = None
        email_tld = None
        email_official = None
        website_official = None
        slug = None
        st_eligible = False
        if not {"WEBSITE_MALFORMED", "WEBSITE_MISSING"}.intersection(org["_st_conformite"]):
            website_domain = org["_st_website"].split("://")[1].split("/")[0]
            website_tld = website_domain.split(".")[-1]
            website_official = org["_st_website"]
        if not {"EMAIL_MALFORMED", "EMAIL_MISSING"}.intersection(org["_st_conformite"]):
            email_domain = org["_st_email"].split("@")[1]
            email_tld = email_domain.split(".")[-1]
            email_official = org["_st_email"]

        if org["type"] == "commune":
            org["epci_population"] = int(
                org.get("_st_epci", {}).get("total_pop_mun", "").replace(" ", "") or 0
            )
            st_eligible = org["population"] <= 3500 or org["epci_population"] <= 15000
            slug = org["_st_slug"]
        elif org["type"] == "epci":
            st_eligible = org["population"] <= 15000
            slug = "epci-" + org["siren"]
        elif org["type"] == "departement":
            slug = "departement-" + org["insee_dep"]
        elif org["type"] == "region":
            slug = "region-" + org["insee_reg"]
        elif org["type"] == "arrondissement":
            slug = "arrondissement-" + org["insee_com"]

        phone = (
            org["_st_dila"]["telephone"][0]["valeur"]
            if len(org.get("_st_dila", {}).get("telephone", [])) > 0
            else None
        )

        url_sp = org.get("_st_dila", {}).get("url_service_public") or None
        id_sp = org.get("_st_dila", {}).get("id") or None

        # Is it currently active in Suite territoriale ?
        st_active = False

        final_data.append(
            {
                "type": org["type"],
                "siret": org["siret"],
                "siren": org["siren"],
                "slug": slug,
                "name": org["name"],
                "insee_com": org.get("insee_com"),
                "insee_dep": org.get("insee_dep"),
                "insee_reg": org["insee_reg"],
                "rcpnt": sorted(org["_st_rcpnt"]) if org.get("_st_rcpnt") else None,
                "issues": org.get("_st_conformite"),
                "issues_last_checked": str(org.get("_st_conformite_checks_dt") or ""),
                "email_official": email_official,
                "email_metadata": org.get("_st_email_metadata") or None,
                "website_url": website_official,
                "website_domain": website_domain,
                "email_domain": email_domain,
                "website_tld": website_tld,
                "website_metadata": org.get("_st_website_metadata") or None,
                "email_tld": email_tld,
                "zipcode": org.get("zipcode") or None,
                "phone": phone,
                "population": org["population"],
                "epci_population": org.get("epci_population"),
                "epci_name": org.get("_st_epci", {}).get("raison_sociale") or None,
                "epci_siren": org.get("_st_epci", {}).get("siren") or None,
                "service_public_url": url_sp,
                "service_public_id": id_sp,
                "st_eligible": st_eligible,
                "st_active": st_active,
                "structures": org.get("_st_structures") or [],
                "memberships": org.get("_st_memberships") or [],
            }
        )

    logger.info("Dumping %d orgs", len(final_data))

    with open("dumps/organizations.json", "w") as f:
        json.dump(final_data, f, ensure_ascii=False, indent=4)

    # Dump public files for data.gouv.fr
    full_dpnt = []
    for row in final_data:
        full_dpnt.append(
            {
                "type": row["type"],
                "siret": row["siret"],
                "siren": row["siren"],
                "libelle": row["name"],
                "population": row["population"],
                "code_insee": row["insee_com"],
                "code_postal": row["zipcode"],
                "epci_libelle": row["epci_name"],
                "epci_siren": row["epci_siren"],
                "epci_population": row["epci_population"],
                "departement_code_insee": row["insee_dep"],
                "region_code_insee": row["insee_reg"],
                "adresse_messagerie": row["email_official"],
                "site_internet": row["website_url"],
                "telephone": row["phone"],
                "rpnt": row["rcpnt"],
                "service_public_url": row["service_public_url"],
            }
        )
    with open("dumps/dpnt-quotidien.json", "w") as f:
        json.dump(full_dpnt, f, separators=(",", ":"))
    os.system("rm -rf dumps/dpnt-quotidien.json.gz && gzip -9 -f dumps/dpnt-quotidien.json")
    upload_file_to_data_gouv(
        "fd73a12f-572c-4b04-89e9-91cc8c6ebcb3", "dumps/dpnt-quotidien.json.gz"
    )

    # Write the same data in a zipped CSV
    with open("dumps/dpnt-quotidien.csv", "w") as f:
        writer = csv.DictWriter(f, fieldnames=full_dpnt[0].keys(), delimiter=";")
        writer.writeheader()
        for row in full_dpnt:
            row["rpnt"] = ",".join(row["rpnt"]) if row.get("rpnt") else ""
            writer.writerow(row)
    os.system("rm -rf dumps/dpnt-quotidien.csv.gz && cd dumps && gzip -9 -f dpnt-quotidien.csv")
    upload_file_to_data_gouv("551a41a5-4ac7-40df-99cb-930aedb3c3ac", "dumps/dpnt-quotidien.csv.gz")


@app.task
def debug_sentry():
    raise Exception("This is a test exception for Sentry")


if __name__ == "__main__":
    run()
