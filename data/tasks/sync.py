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
from .defs import HARDCODED_COMMUNES
from .dumps import (
    add_dila_issue,
    dump_dila,
    dump_filtered_sirene,
    dump_groupements_memberships,
    dump_insee_communes,
    dump_perimetre_epci,
    reset_dila_issues,
)
from .lib import (
    duplicates,
    iter_dila,
    iter_groupements_memberships,
    iter_insee_communes,
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
    dump_dila()
    dump_repertoire_structures()
    dump_repertoire_collectivites()
    dump_perimetre_epci()
    dump_groupements_memberships()

    communes = [{"_st_insee": x} for x in iter_insee_communes()]

    logger.info("Count of communes from INSEE: %d", len(communes))

    associate_epci_to_communes(communes)

    # Remove communes with zero population
    len_communes = len(communes)
    communes = [
        x for x in communes if x.get("_st_pmun") and int(x.get("_st_pmun").replace(" ", "")) > 0
    ]
    logger.info("Removed %d communes with zero population", len_communes - len(communes))

    sirene_row_count = dump_filtered_sirene(communes)

    logger.info("Dumped filtered sirene: %s rows", sirene_row_count)

    associate_siret_to_communes(communes)

    associate_dila_to_communes(communes)

    logger.info(
        "Count of mairies with full metadata: %d",
        len([x for x in communes if x.get("_st_siret") and x.get("_st_dila")]),
    )

    # Associate Repertoire data to communes
    associate_repertoire_to_communes(communes)
    associate_structures_to_communes(communes)
    associate_memberships_to_communes(communes)

    compute_slug_for_communes(communes)

    all_data_checks = get_all_data_checks()

    logger.info("Fetched data_checks for %d mairies", len(all_data_checks))

    for commune in communes:
        commune["_st_conformite"] = [
            str(issue)
            for issue in validate_conformance(
                commune.get("_st_email") or "", commune.get("_st_website") or ""
            )
        ]

        # Add the issues added in asynchronous checks
        if commune.get("_st_siret"):
            issues, website_metadata, email_metadata, min_dt = get_data_checks_by_siret(
                all_data_checks, commune["_st_conformite"], commune["_st_siret"]
            )

            commune["_st_conformite"].extend([str(x) for x in issues.keys()])
            commune["_st_conformite_checks"] = issues
            commune["_st_conformite_checks_dt"] = min_dt
            commune["_st_website_metadata"] = website_metadata
            commune["_st_email_metadata"] = email_metadata

        # Add the RCPNT conformance info
        if commune.get("_st_siret"):
            commune["_st_rcpnt"] = get_rcpnt_conformance(commune["_st_conformite"])

        # Report issues to Dila
        if "EMAIL_MALFORMED" in commune["_st_conformite"]:
            add_dila_issue(
                commune.get("_st_dila", {}).get("id"),
                "EMAIL_MALFORMED",
                repr(commune["_st_email"]),
            )
        if "WEBSITE_MALFORMED" in commune["_st_conformite"]:
            add_dila_issue(
                commune.get("_st_dila", {}).get("id"),
                "WEBSITE_MALFORMED",
                repr(commune["_st_website"]),
            )
        if not commune.get("_st_dila"):
            add_dila_issue("", "MISSING", commune["_st_insee"]["COM"], "")
        else:
            if commune.get("_st_siret") and commune["_st_siret"] != commune.get(
                "_st_dila", {}
            ).get("siret"):
                add_dila_issue(
                    commune.get("_st_dila", {}).get("id"),
                    "SIRET_MISMATCH",
                    commune["_st_siret"],
                    "versus in DILA: %s" % commune.get("_st_dila", {}).get("siret"),
                )
            if commune["_st_insee"]["COM"] != commune.get("_st_dila", {}).get(
                "code_insee_commune"
            ):
                add_dila_issue(
                    commune.get("_st_dila", {}).get("id"),
                    "INSEE_MISMATCH",
                    commune["_st_insee"]["COM"],
                    "versus in DILA: %s" % commune.get("_st_dila", {}).get("code_insee_commune"),
                )

    logger.info("Conformance statistics:")
    for issue in Issues:
        logger.info(
            f" - {issue}: {sum(1 for commune in communes if issue.name in commune['_st_conformite'])}"
        )

    # Update data issues statistics
    update_rcpnt_stats(communes)

    # Count mairies without structures
    percentage = (
        sum(1 for commune in communes if len(commune["_st_structures"]) == 0) / len(communes) * 100
    )
    logger.info(
        "Communes without structures: %d (%.2f%%)",
        sum(1 for commune in communes if len(commune["_st_structures"]) == 0),
        percentage,
    )

    # Count mairies with >1 structure (often there is always a CDG)
    percentage = (
        sum(1 for commune in communes if len(commune["_st_structures"]) > 1) / len(communes) * 100
    )
    logger.info(
        "Communes with >1 structure: %d (%.2f%%)",
        sum(1 for commune in communes if len(commune["_st_structures"]) > 1),
        percentage,
    )

    # Dump as JSON
    final_data = []
    for commune in communes:
        website_domain = None
        email_domain = None
        website_tld = None
        email_tld = None
        if not {"WEBSITE_MALFORMED", "WEBSITE_MISSING"}.intersection(commune["_st_conformite"]):
            website_domain = commune["_st_website"].split("://")[1].split("/")[0]
            website_tld = website_domain.split(".")[-1]
        if not {"EMAIL_MALFORMED", "EMAIL_MISSING"}.intersection(commune["_st_conformite"]):
            email_domain = commune["_st_email"].split("@")[1]
            email_tld = email_domain.split(".")[-1]

        pop = int(commune.get("_st_pmun", {}).replace(" ", "") or 0)
        commune["_st_epci_pop"] = int(
            commune.get("_st_epci", {}).get("total_pop_mun", "").replace(" ", "") or 0
        )

        phone = (
            commune["_st_dila"]["telephone"][0]["valeur"]
            if len(commune.get("_st_dila", {}).get("telephone", [])) > 0
            else None
        )

        url_sp = commune.get("_st_dila", {}).get("url_service_public") or None
        id_sp = commune.get("_st_dila", {}).get("id") or None

        # Is it directly eligible for Suite territoriale ?
        st_eligible = pop <= 3500 or commune["_st_epci_pop"] <= 15000

        # Is it currently active in Suite territoriale ?
        st_active = False

        final_data.append(
            {
                "siret": commune.get("_st_siret") or None,
                "siren": commune.get("_st_siren") or None,
                "slug": commune["_st_slug"],
                "name": commune["_st_insee"]["LIBELLE"],
                "insee_geo": commune["_st_insee"]["COM"],
                "insee_dep": commune["_st_insee"]["DEP"],
                "insee_reg": commune["_st_insee"]["REG"],
                "rcpnt": list(commune["_st_rcpnt"]) if commune.get("_st_rcpnt") else None,
                "issues": commune.get("_st_conformite"),
                "issues_last_checked": str(commune.get("_st_conformite_checks_dt") or ""),
                "email_official": commune.get("_st_email") or None,
                "email_metadata": commune.get("_st_email_metadata") or None,
                "website_url": commune.get("_st_website") or None,
                "website_domain": website_domain,
                "email_domain": email_domain,
                "website_tld": website_tld,
                "website_metadata": commune.get("_st_website_metadata") or None,
                "email_tld": email_tld,
                "zipcode": commune.get("_st_zipcode") or None,
                "phone": phone,
                "population": pop,
                "epci_population": commune["_st_epci_pop"],
                "epci_name": commune.get("_st_epci", {}).get("raison_sociale") or None,
                "epci_siren": commune.get("_st_epci", {}).get("siren") or None,
                "service_public_url": url_sp,
                "service_public_id": id_sp,
                "st_eligible": st_eligible,
                "st_active": st_active,
                "structures": commune.get("_st_structures") or [],
                "memberships": commune.get("_st_memberships") or [],
            }
        )

    logger.info("Dumping %d communes", len(final_data))

    with open("dumps/communes.json", "w") as f:
        json.dump(final_data, f, ensure_ascii=False, indent=4)

    # Do a second dump for the EPCIs
    final_data_epci = {}  # Indexed by their SIREN
    siren_siret_index = {row["siren"]: row["siret"] for row in iter_sirene()}
    for commune in communes:
        if not commune.get("_st_siren") or not commune.get("_st_epci"):
            continue

        # A bit late, but lookup the SIRET EPCI
        if commune["_st_epci"]["siren"] not in siren_siret_index:
            logger.warning(f"Missing SIRET for EPCI {commune['_st_epci']['siren']}")
            continue

        final_data_epci[commune["_st_epci"]["siren"]] = {
            "siret": siren_siret_index[commune["_st_epci"]["siren"]],
            "siren": commune["_st_epci"]["siren"],
            "name": commune["_st_epci"]["raison_sociale"],
            "insee_dep": commune["_st_insee"]["DEP"],
            "insee_reg": commune["_st_insee"]["REG"],
            "population": commune["_st_epci_pop"],
            "st_eligible": commune["_st_epci_pop"] <= 15000,
        }

    logger.info("Dumping %d EPCIs", len(final_data_epci))

    with open("dumps/epcis.json", "w") as f:
        json.dump(list(final_data_epci.values()), f, ensure_ascii=False, indent=4)


def associate_epci_to_communes(communes: list):
    """Associate EPCIs to communes. Add SIREN as a benefit of this data source."""
    perimetre_epci_by_insee = {x["insee"]: x for x in iter_perimetre_epci()}

    for commune in communes:
        insee = commune["_st_insee"]["COM"]
        if insee in perimetre_epci_by_insee:
            commune["_st_epci"] = perimetre_epci_by_insee[insee]
            commune["_st_siren"] = commune["_st_epci"]["siren_membre"]
            commune["_st_pmun"] = commune["_st_epci"]["pmun_2025"]
        elif insee in HARDCODED_COMMUNES:
            commune["_st_siren"] = HARDCODED_COMMUNES[insee]["siren"]
            commune["_st_pmun"] = HARDCODED_COMMUNES[insee]["pmun_2025"]
            commune["_st_siret"] = HARDCODED_COMMUNES[insee]["siret"]
            commune["_st_zipcode"] = HARDCODED_COMMUNES[insee]["zipcode"]

        else:
            logger.warning(
                f"Missing insee in perimetre_epci: {commune['_st_insee']['LIBELLE']} {insee}"
            )


def associate_siret_to_communes(communes: list):
    """Associate SIRETs to communes. Add Address & zipcode as a benefit of this data source."""

    siren_index = {}
    for row in iter_sirene():
        if row["siren"] in siren_index:
            logger.warning(f"Duplicate siren in SIRENE: {row['siren']} {row['siret']}")
        else:
            siren_index[row["siren"]] = row

    for commune in communes:
        if not commune.get("_st_siren"):
            continue
        if commune["_st_siren"] not in siren_index:
            logger.warning(
                f"Missing siren in SIRENE: {commune['_st_insee']['LIBELLE']} {commune['_st_siren']}"
            )
        else:
            commune["_st_siret"] = siren_index[commune["_st_siren"]]["siret"]
            # commune["_st_address"] = siren_index[commune["_st_siren"]]["libelleVoieEtablissement"]
            commune["_st_zipcode"] = siren_index[commune["_st_siren"]]["codePostalEtablissement"]


def associate_dila_to_communes(communes: list):
    """Associate DILA data to communes: email & website"""

    # INSEE seems more reliable than SIRETs in DILA data. However there are duplicates.
    mairies_dila_by_insee = defaultdict(list)
    mairies_dila_by_siret = defaultdict(list)
    for mairie in iter_dila("mairie"):
        mairies_dila_by_insee[mairie["pivot"][0]["code_insee_commune"][0]].append(mairie)

    mairies_dila_by_siret = defaultdict(list)
    for mairie in iter_dila("mairie"):
        mairies_dila_by_siret[mairie["siret"]].append(mairie)

    dila_match = None

    for commune in communes:
        if not commune.get("_st_insee"):
            continue

        if len(mairies_dila_by_insee[commune["_st_insee"]["COM"]]) == 1:
            dila_match = mairies_dila_by_insee[commune["_st_insee"]["COM"]][0]
        elif len(mairies_dila_by_siret[commune["_st_siret"]]) == 1:
            dila_match = mairies_dila_by_siret[commune["_st_siret"]][0]
        else:
            if (
                len(mairies_dila_by_insee[commune["_st_insee"]["COM"]]) == 0
                and len(mairies_dila_by_siret[commune["_st_siret"]]) == 0
            ):
                logger.warning(
                    f"No match for INSEE+SIRET in DILA for {commune['_st_insee']['LIBELLE']} {commune['_st_insee']['COM']} {commune['_st_siret']}"
                )
                continue

            # We try to find the best match by name
            all_matches = {
                x["id"]: x
                for x in mairies_dila_by_insee[commune["_st_insee"]["COM"]]
                + mairies_dila_by_siret[commune["_st_siret"]]
            }
            matches = {
                normalize(x["nom"]): x
                for x in all_matches.values()
                if not re.match(r"^mairie.+(déléguée|annexe)", x["nom"], flags=re.IGNORECASE)
            }

            normalized_search = normalize("Mairie - " + commune["_st_insee"]["LIBELLE"])
            if len(matches) == 1:
                dila_match = list(matches.values())[0]
            elif normalized_search in matches:
                dila_match = matches[normalized_search]
            else:
                logger.warning(
                    f"Multiple matches (SIRET or INSEE) in DILA for {commune['_st_insee']['LIBELLE']} {commune['_st_insee']['COM']}: {[x['nom'] for x in all_matches.values()]}. Picking first!"
                )
                # No real way here to choose, we pick the first one alphabetically just to be stable.
                dila_match = sorted(all_matches.values(), key=lambda x: x["nom"].lower())[0]

        commune["_st_email"] = (
            dila_match["adresse_courriel"][0]
            if len(dila_match.get("adresse_courriel") or []) > 0
            else ""
        )
        commune["_st_website"] = (
            dila_match["site_internet"][0].get("valeur", "")
            if len(dila_match.get("site_internet") or []) > 0
            else ""
        )
        # Remove trailing anchor from website
        commune["_st_website"] = commune["_st_website"].strip().split("#")[0]

        commune["_st_dila"] = dila_match


def associate_repertoire_to_communes(communes: list):
    """Associate Grist Repertoire data to communes"""
    communes_by_insee = {
        x["Code_INSEE_geographique"]: x
        for x in iter_repertoire_collectivites()
        if x["Typologie"] == "Commune"
    }

    for commune in communes:
        if commune["_st_insee"]["COM"] in communes_by_insee:
            commune["_st_repertoire"] = communes_by_insee[commune["_st_insee"]["COM"]]
        else:
            logger.warning(
                f"Missing commune INSEE in Repertoire: {commune['_st_insee']['LIBELLE']} {commune['_st_insee']['COM']}"
            )


def associate_structures_to_communes(communes: list):
    """Associate mutualization structures from Repertoire to communes"""

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

    for commune in communes:
        commune["_st_structures"] = []
        if not commune.get("_st_repertoire"):
            continue

        # Add all structures scoped to this department, single commune and region
        commune["_st_structures"] = (
            structure_mappings[commune["_st_repertoire"]["Code_INSEE_departement"]]
            + structure_mappings[commune["_st_repertoire"]["Code_INSEE_commune"]]
            + structure_mappings[commune["_st_repertoire"]["Code_INSEE_region"]]
        )

        # Scope can also be an EPCI
        # /!\ Numero_SIREN_EPCI is actually a Grist ID, not a SIREN
        if commune["_st_repertoire"]["Numero_SIREN_EPCI"]:
            commune["_st_structures"].extend(
                structure_mappings[
                    colls_by_repertoire_id[commune["_st_repertoire"]["Numero_SIREN_EPCI"]]["id"]
                ]
            )

        # Remove duplicates
        commune["_st_structures"] = list(set(commune["_st_structures"]))


def associate_memberships_to_communes(communes: list):
    """Associate memberships to communes"""
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

    for commune in communes:
        commune["_st_memberships"] = []
        # If the commune siren is in the memberships, add the memberships structure_id to the commune memberships
        if commune.get("_st_siren") in memberships_by_siren:
            commune["_st_memberships"] = [
                x.get("structure_id") for x in memberships_by_siren[commune.get("_st_siren")]
            ]
        elif commune.get("_st_epci", {}).get("siren") in memberships_by_siren:
            commune["_st_memberships"] = [
                x.get("structure_id")
                for x in memberships_by_siren[commune.get("_st_epci", {}).get("siren")]
            ]

        # Remove duplicates
        commune["_st_memberships"] = list(set(commune["_st_memberships"]))


def compute_slug_for_communes(communes: list):
    """Create a unique slug for each commune"""

    for commune in communes:
        commune["_st_slug"] = (
            commune["_st_insee"]["NCC"].split("(")[0].lower().strip().replace(" ", "-")
        )
        if not re.match(r"^[a-z0-9-]+$", commune["_st_slug"]):
            raise Exception(f"Invalid slug: {commune['_st_slug']}")

    dupes = duplicates(commune["_st_slug"] for commune in communes)

    logger.warning(f"Duplicate slugs after first pass: {len(dupes)}")

    # Second pass: add department code
    for commune in communes:
        if commune["_st_slug"] in dupes:
            commune["_st_slug"] = f"{commune['_st_slug']}{commune['_st_insee']['DEP']}"

    dupes = duplicates(commune["_st_slug"] for commune in communes)

    # Third pass: add SIREN
    for commune in communes:
        if commune["_st_slug"] in dupes:
            commune["_st_slug"] = f"{commune['_st_slug']}{commune['_st_siren']}"

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


@app.task
def debug_sentry():
    raise Exception("This is a test exception for Sentry")


if __name__ == "__main__":
    run()
