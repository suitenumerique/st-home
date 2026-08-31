import csv
import json
import logging
import os
import re
from collections import defaultdict

from sentry_sdk.crons import monitor

from broker import register_task

from .conformance import Issues, get_rcpnt_conformance, validate_conformance
from .db import (
    get_all_data_checks,
    get_data_checks_by_siret,
    init_db,
    update_rcpnt_stats,
)
from .defs import (
    ARRONDISSEMENT_COMMUNES,
    ARRONDISSEMENT_SIRETS,
    EXCLUDED_DEPARTEMENTS,
    EXCLUDED_REGIONS,
    FORCE_INCLUDE_SIRENE,
    HARDCODED_COMMUNES,
    HARDCODED_DEPARTEMENT_SIRENS,
    HARDCODED_DILA_SIRETS,
)
from .dumps import (
    add_dila_issue,
    dump_adherents,
    dump_dila,
    dump_filtered_sirene,
    dump_groupements_memberships,
    dump_insee_communes,
    dump_insee_departements,
    dump_insee_population,
    dump_insee_regions,
    dump_operators,
    dump_service_usages,
    dump_services,
    reset_dila_issues,
    upload_file_to_data_gouv,
)
from .lib import (
    clear_dila_cache,
    duplicates,
    get_communes_population_by_insee,
    insee_by_commune_siren,
    is_safe_url,
    iter_adherents,
    iter_dila,
    iter_epci_memberships,
    iter_insee_communes,
    iter_insee_departements,
    iter_insee_regions,
    iter_operators,
    iter_sirene,
    normalize,
)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


@register_task(name="sync.run")
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

    logger.info(
        "Starting data sync workflow for %s",
        "production" if os.getenv("PRODUCTION") == "1" else "dev",
    )

    # Create the "dumps/" directory if it doesn't exist
    os.makedirs("dumps", exist_ok=True)
    init_db()
    reset_dila_issues()

    dump_insee_communes()
    dump_insee_departements()
    dump_insee_regions()
    dump_insee_population()
    dump_dila()
    dump_groupements_memberships()
    dump_services()
    dump_service_usages()
    dump_operators()
    dump_adherents()

    communes = list_communes()

    logger.info("Count of communes from INSEE: %d", len(communes))

    departements = list_departements()

    regions = list_regions()

    # SIRENE has to be dumped before the communes are matched to their EPCI: BANATIC
    # identifies both by SIREN, and it is SIRENE that tells us which INSEE commune
    # each SIREN sits in. Every SIREN we may need is already known at this point,
    # without the organisations being fully built.
    sirene_row_count = dump_filtered_sirene(
        {row["Siren membre"] for row in iter_epci_memberships()}
        | {row["N° SIREN"] for row in iter_epci_memberships()}
        | {org["siren"] for org in departements + regions}
        | {commune["siren"] for commune in HARDCODED_COMMUNES.values()}
        | FORCE_INCLUDE_SIRENE
    )

    logger.info("Dumped filtered sirene: %s rows", sirene_row_count)

    population_by_insee = get_communes_population_by_insee()
    insee_by_siren = insee_by_commune_siren()

    epcis = list_epcis(population_by_insee, insee_by_siren)

    associate_epci_to_communes(communes, epcis, insee_by_siren)

    communes = filter_invalid_communes(communes)

    orgs = regions + departements + epcis + communes

    associate_siret_to_organizations(orgs)

    # Remove orgs with no SIRET (warning emitted in the method above)
    len_orgs = len(orgs)
    orgs = [x for x in orgs if x.get("siret")]
    if len_orgs - len(orgs) > 0:
        logger.warning("Removed %d orgs with no SIRET", len_orgs - len(orgs))

    # Same exposure as the SIREN filter in filter_invalid_communes, for every org type.
    # Currently 1: département 75, whose DILA "cg" fiche no longer carries a SIRET.
    assert len_orgs - len(orgs) < 10

    associate_dila_to_organizations(orgs)

    associate_operators_to_orgs(orgs)

    compute_slug_for_communes(orgs)

    associate_conformance_to_orgs(orgs)

    # The parsed DILA export is no longer needed and weighs ~1 GB: release it before
    # the stats and dump phases, which build large structures of their own.
    clear_dila_cache()

    # Update data issues statistics
    update_rcpnt_stats(orgs)

    create_new_dumps(orgs)


def list_communes():
    """List all communes from INSEE"""

    population_by_insee = get_communes_population_by_insee()

    return [
        {
            "type": "commune",
            "name": x["LIBELLE"],
            "insee_com": x["COM"],
            "insee_dep": x["DEP"],
            "insee_reg": x["REG"],
            "insee_ncc": x["NCC"],
            "population": population_by_insee.get(x["COM"]) or 0,
        }
        for x in iter_insee_communes()
        if x["TYPECOM"] == "COM"
        # The Ville de Paris is exposed at the département tier (see
        # HARDCODED_DEPARTEMENT_SIRENS); its 17 mairies d'arrondissement carry the
        # commune tier instead. Lyon and Marseille stay communes, and their
        # arrondissements are added on top of them.
        and x["COM"] != "75056"
    ] + list_arrondissement_communes()


def list_arrondissement_communes():
    """List the mairies d'arrondissement (Paris, Lyon) and de secteur (Marseille).

    They have no SIREN of their own, only a SIRET: see ARRONDISSEMENT_COMMUNES. The
    population is summed over the INSEE arrondissements each mairie administers, so
    the 17 Paris units add back up to the 2 103 778 of the commune they replace.
    """
    population_by_insee = get_communes_population_by_insee()
    arm_by_insee = {x["COM"]: x for x in iter_insee_communes() if x["TYPECOM"] == "ARM"}

    communes = []
    for insee, entry in ARRONDISSEMENT_COMMUNES.items():
        arm = arm_by_insee[insee]
        covers = entry.get("covers", [insee])
        name = entry.get("name") or arm["LIBELLE"]
        communes.append(
            {
                "type": "commune",
                "name": name,
                "insee_com": insee,
                "insee_dep": arm["DEP"],
                "insee_reg": arm["REG"],
                # Drives the slug; the INSEE NCC only names the mairie's own
                # arrondissement, which is wrong for the units covering several.
                "insee_ncc": arm["NCC"] if "name" not in entry else name.upper(),
                "population": sum(population_by_insee.get(x) or 0 for x in covers),
                # These are établissements: the SIREN is their parent commune's.
                "siren": entry["siret"][0:9],
                "siret": entry["siret"],
                "_st_arrondissement_parent": arm["COMPARENT"],
            }
        )
    return communes


def list_departements():
    """List all departements from INSEE"""

    communes_to_departments = {x["COM"]: x["DEP"] for x in iter_insee_communes()}
    population_by_insee = get_communes_population_by_insee()

    # Some COM/TOM will be filtered here : https://www.insee.fr/fr/information/7929495
    dila_sirens = {
        communes_to_departments[x["pivot"][0]["code_insee_commune"][0]]: x["siret"][0:9]
        for x in iter_dila("cg")
        if x["pivot"][0]["code_insee_commune"][0] in communes_to_departments
    }

    # Départements whose SIREN we pin rather than trust DILA for (Paris in particular,
    # whose fiche has lost and regained its SIRET).
    dila_sirens.update(HARDCODED_DEPARTEMENT_SIRENS)

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
        # Skip departements whose powers are exercised by a merged collectivity
        # already represented at another tier (see EXCLUDED_DEPARTEMENTS).
        if x["DEP"] not in EXCLUDED_DEPARTEMENTS
    ]


def list_epcis(population_by_insee: dict, insee_by_siren: dict):
    """List all EPCIs à fiscalité propre from BANATIC.

    BANATIC gives no population for the groupement itself that matches INSEE's
    populations municipales, so we sum the members' — the same figure the rest of the
    pipeline uses for communes.
    """
    insee_region_map = {x["DEP"]: x["REG"] for x in iter_insee_departements()}

    epcis = {}
    for row in iter_epci_memberships():
        siren = row["N° SIREN"]
        # "12 - Aveyron" -> "12"
        insee_dep = row["Département"].split(" - ")[0].strip()
        epci = epcis.setdefault(
            siren,
            {
                "type": "epci",
                "siren": siren,
                "name": row["Nom du groupement"],
                "insee_dep": insee_dep,
                "insee_reg": insee_region_map[insee_dep],
                "population": 0,
            },
        )
        insee = insee_by_siren.get(row["Siren membre"])
        if insee:
            epci["population"] += population_by_insee.get(insee) or 0

    return list(epcis.values())


def list_regions():
    """List all regions from INSEE"""
    communes_to_regions = {x["COM"]: x["REG"] for x in iter_insee_communes()}
    population_by_insee = get_communes_population_by_insee()

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
        # Skip regions whose powers are exercised by a merged collectivity already
        # represented at another tier (see EXCLUDED_REGIONS).
        if x["REG"] not in EXCLUDED_REGIONS
    ]


def filter_invalid_communes(communes: list):
    """Remove communes with zero population or no SIREN"""
    len_communes = len(communes)
    communes = [x for x in communes if x["population"] > 0]
    logger.info(
        "Removed %d communes with zero population (from WW2)", len_communes - len(communes)
    )
    assert len_communes - len(communes) < 10

    for commune in communes:
        if not commune.get("siren"):
            logger.warning(f"Commune {commune['name']} {commune['insee_com']} has no SIREN")

    len_communes = len(communes)
    communes = [x for x in communes if x.get("siren")]
    if len_communes - len(communes) > 0:
        logger.warning("Removed %d communes with no SIREN", len_communes - len(communes))

    # Communes get their SIREN from BANATIC via SIRENE (see insee_by_commune_siren), so
    # a SIRENE hiccup would silently drop communes from the site. Expected count is 0.
    assert len_communes - len(communes) < 10

    return communes


def associate_epci_to_communes(communes: list, epcis: list, insee_by_siren: dict):
    """Associate EPCIs to communes. Add SIREN as a benefit of this data source.

    Populations are not touched here: they come from INSEE via list_communes().
    """
    epci_by_siren = {epci["siren"]: epci for epci in epcis}
    membership_by_insee = {}
    for row in iter_epci_memberships():
        insee = insee_by_siren.get(row["Siren membre"])
        if insee:
            membership_by_insee[insee] = (row["Siren membre"], epci_by_siren[row["N° SIREN"]])

    for commune in communes:
        if commune["type"] != "commune":
            continue
        insee = commune["insee_com"]
        # Mairies d'arrondissement are unknown to BANATIC, which records the membership
        # under their parent commune's SIREN. Inherit it, otherwise the métropoles would
        # lose the population of their ville-centre.
        parent = commune.get("_st_arrondissement_parent")
        if parent:
            if parent in membership_by_insee:
                commune["_st_epci"] = membership_by_insee[parent][1]
            else:
                logger.warning(f"No EPCI for the parent commune {parent} of {commune['name']}")
            continue
        if insee in membership_by_insee:
            siren, epci = membership_by_insee[insee]
            commune["siren"] = siren
            commune["_st_epci"] = epci
        elif insee in HARDCODED_COMMUNES:
            commune["siren"] = HARDCODED_COMMUNES[insee]["siren"]
            commune["siret"] = HARDCODED_COMMUNES[insee]["siret"]
            commune["zipcode"] = HARDCODED_COMMUNES[insee]["zipcode"]
        else:
            logger.warning(f"Commune not a member of any EPCI: {commune['name']} {insee}")


def associate_siret_to_organizations(orgs: list):
    """Associate SIRETs to orgs, using SIREN as pivot. Add Address & zipcode as a benefit of this data source."""

    siren_index = {}
    siret_index = {}
    for row in iter_sirene():
        siret_index[row["siret"]] = row
        # The dump holds one siège per SIREN, plus the mairies d'arrondissement, which
        # are établissements of a SIREN whose siège is in the dump as well. Index those
        # by SIRET only, so they don't shadow their parent commune.
        if row["siret"] in ARRONDISSEMENT_SIRETS:
            continue
        if row["siren"] in siren_index:
            logger.warning(f"Duplicate siren in SIRENE: {row['siren']} {row['siret']}")
        else:
            siren_index[row["siren"]] = row

    for org in orgs:
        # Orgs carrying a SIRET already (mairies d'arrondissement, HARDCODED_COMMUNES)
        # resolve it themselves: their SIREN points at another establishment.
        if org.get("siret"):
            row = siret_index.get(org["siret"])
            if row is None:
                logger.warning(f"Missing siret in SIRENE: {org['name']} {org['siret']}")
            else:
                org["zipcode"] = row["codePostalEtablissement"]
        elif org["siren"] not in siren_index:
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
                # Keep only "principal" mairies (drop mairies déléguées / annexes).
                principals = {
                    normalize(x["nom"]): x
                    for x in all_matches.values()
                    if not re.match(r"^mairie.+(déléguée|annexe)", x["nom"], flags=re.IGNORECASE)
                }

                if normalized_search in principals:
                    dila_match = principals[normalized_search]
                elif len(principals) == 1:
                    # A single principal mairie remains (e.g. a commune nouvelle whose
                    # only non-déléguée mairie is named after its chef-lieu, like
                    # "Mairie - Les Portes du Coglais - Montours"): it is unambiguous.
                    dila_match = next(iter(principals.values()))
                else:
                    # Several principals (commune nouvelle keeping the former communes'
                    # mairies). DILA names them "Mairie - <commune> - <chef-lieu>" or
                    # after a constituent, so accept a match only when exactly one
                    # principal's name is a prefix of, or extends, the searched name.
                    prefixed = [
                        x
                        for k, x in principals.items()
                        if k.startswith(normalized_search) or normalized_search.startswith(k)
                    ]
                    if len(prefixed) == 1:
                        dila_match = prefixed[0]

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
            raw_website = (
                dila_match["site_internet"][0].get("valeur", "")
                if len(dila_match.get("site_internet") or []) > 0
                else ""
            )
            org["_st_website"] = (
                raw_website.strip().split("#")[0] if is_safe_url(raw_website) else ""
            )

            org["_st_dila"] = dila_match


def associate_operators_to_orgs(orgs: list):
    """Associate operators to orgs based on perimetre (department coverage) and adherent status"""

    operators = {str(x["id"]): x for x in iter_operators()}

    # Build perimetre index: which operators cover which departments
    operators_by_departement = defaultdict(list)
    for operator_id, operator in operators.items():
        for dep in operator.get("departements", []):
            operators_by_departement[dep].append(operator_id)

    # Build adherent index: (siret, operator_id) pairs from the adherents dataset
    adherent_pairs = set()
    for row in iter_adherents():
        siret = row.get("organisation_siret")
        operator_id = str(row.get("operateur_id", ""))
        if siret and operator_id:
            adherent_pairs.add((siret, operator_id))

    logger.info("Loaded %d adherent pairs", len(adherent_pairs))

    for org in orgs:
        org["_st_operators"] = []

        if org["type"] not in {"commune", "epci"}:
            continue

        siret = org.get("siret")
        if not siret:
            continue

        # Collect all operator links with their flags
        operator_links = {}

        # Perimetre: operators covering this department
        for operator_id in operators_by_departement.get(org["insee_dep"], []):
            operator_links[operator_id] = {"is_perimetre": True, "is_adherent": False}

        # Adherent: operators this org is an adherent of
        for operator_id in operators:
            if (siret, operator_id) in adherent_pairs:
                if operator_id in operator_links:
                    operator_links[operator_id]["is_adherent"] = True
                else:
                    operator_links[operator_id] = {"is_perimetre": False, "is_adherent": True}

        org["_st_operators"] = [{"id": op_id, **flags} for op_id, flags in operator_links.items()]


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

    # Build siren→siret lookup for resolving epci_siret
    siren_to_siret = {}
    # Build dep_code→siret and reg_code→siret lookups
    dep_to_siret = {}
    reg_to_siret = {}
    for org in orgs:
        if org.get("siret") and org.get("siren"):
            siren_to_siret[org["siren"]] = org["siret"]
        if org.get("type") == "departement" and org.get("siret") and org.get("insee_dep"):
            dep_to_siret[org["insee_dep"]] = org["siret"]
        if org.get("type") == "region" and org.get("siret") and org.get("insee_reg"):
            reg_to_siret[org["insee_reg"]] = org["siret"]

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
            org["epci_population"] = org.get("_st_epci", {}).get("population") or 0
            st_eligible = org["population"] <= 3500
            slug = org["_st_slug"]
        elif org["type"] == "epci":
            st_eligible = org["population"] <= 15000
            slug = "epci-" + org["siren"]
        elif org["type"] == "departement":
            slug = "departement-" + org["insee_dep"]
        elif org["type"] == "region":
            slug = "region-" + org["insee_reg"]

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
                "epci_name": org.get("_st_epci", {}).get("name") or None,
                "epci_siren": org.get("_st_epci", {}).get("siren") or None,
                "epci_siret": siren_to_siret.get(org.get("_st_epci", {}).get("siren", "")) or None,
                "dep_siret": dep_to_siret.get(org.get("insee_dep", "")) or None,
                "region_siret": reg_to_siret.get(org.get("insee_reg", "")) or None,
                "service_public_url": url_sp,
                "service_public_id": id_sp,
                "st_eligible": st_eligible,
                "st_active": st_active,
                "operators": org.get("_st_operators")
                or [],  # list of {id, is_perimetre, is_adherent}
            }
        )

    logger.info("Dumping %d orgs", len(final_data))

    if os.getenv("PRODUCTION") == "1" and len(final_data) < 30000:
        raise Exception("Not enough orgs to dump for production: %d" % len(final_data))

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
                "epci_siret": row["epci_siret"],
                "epci_population": row["epci_population"],
                "departement_code_insee": row["insee_dep"],
                "departement_siret": row["dep_siret"],
                "region_code_insee": row["insee_reg"],
                "region_siret": row["region_siret"],
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

    # Make sure file is at least 2MB
    if (
        os.getenv("PRODUCTION") == "1"
        and os.path.getsize("dumps/dpnt-quotidien.json.gz") < 2 * 1024 * 1024
    ):
        raise Exception("File is too small")

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

    # Make sure file is at least 2MB
    if (
        os.getenv("PRODUCTION") == "1"
        and os.path.getsize("dumps/dpnt-quotidien.csv.gz") < 2 * 1024 * 1024
    ):
        raise Exception("File is too small")

    upload_file_to_data_gouv("551a41a5-4ac7-40df-99cb-930aedb3c3ac", "dumps/dpnt-quotidien.csv.gz")


@register_task(name="sync.debug_sentry")
def debug_sentry():
    raise Exception("This is a test exception for Sentry")


if __name__ == "__main__":
    run()
