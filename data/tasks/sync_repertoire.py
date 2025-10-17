import json
import logging
from datetime import datetime
from pathlib import Path

import pytz
from pygrister.api import GristApi

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def update_repertoire_epcis():
    """
    Update the Repertoire EPCIs
    """
    if not Path("dumps/epcis.json").exists():
        return
    uptodate_epcis = json.load(open("dumps/epcis.json", encoding="utf-8"))
    grist = GristApi()
    records = grist.list_records(
        table_id="COLLECTIVITES", filter={"Typologie": ["EPCI à fiscalité propre"]}
    )
    if records[0] != 200:
        raise Exception("Failed to fetch EPCIs")
    epcis_repertoire = records[1]

    to_update = []
    to_create = []

    for uptodate_epci in uptodate_epcis:
        existing_epci = next(
            (
                epci_repertoire
                for epci_repertoire in epcis_repertoire
                if epci_repertoire["Numero_SIREN"] == uptodate_epci["siren"]
            ),
            None,
        )

        if existing_epci is None:
            to_create.append(
                {
                    "Code_INSEE_geographique": uptodate_epci["siren"],
                    "Typologie": "EPCI à fiscalité propre",
                    "Libelle": uptodate_epci["name"],
                    "Code_INSEE_region": f"r{uptodate_epci['insee_reg']}",
                    "Code_INSEE_departement": uptodate_epci["insee_dep"],
                    "Numero_SIREN": uptodate_epci["siren"],
                    "Derniere_mise_a_jour_script_": datetime.now(
                        pytz.timezone("Europe/Paris")
                    ).strftime("%Y-%m-%d %H:%M:%S"),
                }
            )
        else:
            to_update.append(
                {
                    "id": existing_epci["id"],
                    "Code_INSEE_geographique": uptodate_epci["siren"],
                    "Libelle": uptodate_epci["name"],
                    "Code_INSEE_region": f"r{uptodate_epci['insee_reg']}",
                    "Code_INSEE_departement": uptodate_epci["insee_dep"],
                    "PMUN_2025": uptodate_epci["population"],
                    "Derniere_mise_a_jour_script_": datetime.now(
                        pytz.timezone("Europe/Paris")
                    ).strftime("%Y-%m-%d %H:%M:%S"),
                }
            )

    if len(to_create) > 0:
        grist.add_records(table_id="COLLECTIVITES", records=to_create)
        logger.info(f"{len(to_create)} EPCIs created")

    if len(to_update) > 0:
        grist.update_records(table_id="COLLECTIVITES", records=to_update)
        logger.info(f"{len(to_update)} EPCIs updated")


def update_repertoire_communes():
    """
    Update the Repertoire cities
    """
    if not Path("dumps/communes.json").exists():
        return
    uptodate_communes = json.load(open("dumps/communes.json", encoding="utf-8"))
    grist = GristApi()
    records = grist.list_records(table_id="COLLECTIVITES", filter={"Typologie": ["Commune"]})
    if records[0] != 200:
        raise Exception("Failed to fetch cities")
    communes_repertoire = records[1]

    to_update = []
    to_create = []

    for uptodate_commune in uptodate_communes:
        existing_commune = next(
            (
                commune_repertoire
                for commune_repertoire in communes_repertoire
                if commune_repertoire["Code_INSEE_geographique"] == uptodate_commune["insee_com"]
            ),
            None,
        )

        if existing_commune is None:
            to_create.append(
                {
                    "Code_INSEE_geographique": uptodate_commune["insee_com"],
                    "Typologie": "Commune",
                    "Libelle": uptodate_commune["name"],
                    "Code_INSEE_region": f"r{uptodate_commune['insee_reg']}",
                    "Code_INSEE_departement": uptodate_commune["insee_dep"],
                    "Code_INSEE_commune": uptodate_commune["insee_com"],
                    "Numero_SIREN": uptodate_commune["siren"],
                    "Numero_SIREN_EPCI": uptodate_commune["epci_siren"],
                    "Code_postal": uptodate_commune["zipcode"],
                    "Courriel": uptodate_commune["email_official"],
                    "Site_web": uptodate_commune["website_url"],
                    "PMUN_2025": uptodate_commune["population"],
                    "Derniere_mise_a_jour_script_": datetime.now(
                        pytz.timezone("Europe/Paris")
                    ).strftime("%Y-%m-%d %H:%M:%S"),
                }
            )
        else:
            to_update.append(
                {
                    "id": existing_commune["id"],
                    "Code_INSEE_geographique": uptodate_commune["insee_com"],
                    "Typologie": "Commune",
                    "Libelle": uptodate_commune["name"],
                    "Code_INSEE_region": f"r{uptodate_commune['insee_reg']}",
                    "Code_INSEE_departement": uptodate_commune["insee_dep"],
                    "Code_INSEE_commune": uptodate_commune["insee_com"],
                    "Numero_SIREN": uptodate_commune["siren"],
                    "Numero_SIREN_EPCI": uptodate_commune["epci_siren"],
                    "Code_postal": uptodate_commune["zipcode"],
                    "Courriel": uptodate_commune["email_official"],
                    "Site_web": uptodate_commune["website_url"],
                    "PMUN_2025": uptodate_commune["population"],
                    "Derniere_mise_a_jour_script_": datetime.now(
                        pytz.timezone("Europe/Paris")
                    ).strftime("%Y-%m-%d %H:%M:%S"),
                }
            )

    if len(to_create) > 0:
        grist.add_records(table_id="COLLECTIVITES", records=to_create)
        logger.info(f"{len(to_create)} communes created")

    if len(to_update) > 0:
        logger.info(f"{len(to_update)} communes to update")
        updated_count = 0
        for i in range(0, len(to_update), 500):
            to_update_batch = to_update[i : i + 500]
            grist.update_records(table_id="COLLECTIVITES", records=to_update_batch)
            updated_count += len(to_update_batch)
            logger.info(f"{updated_count} communes updated")


def update_repertoire_orga_members():
    """
    Update the Repertoire organisations members
    """
    if not Path("dumps/groupements_memberships.json").exists():
        return

    memberships_from_banatic = json.load(
        open("dumps/groupements_memberships.json", encoding="utf-8")
    )
    grist = GristApi()
    organisations_records = grist.list_records(table_id="ORGANISATIONS")
    if organisations_records[0] != 200:
        raise Exception("Failed to fetch organisations")

    collectivites_records = grist.list_records(table_id="COLLECTIVITES")
    if collectivites_records[0] != 200:
        raise Exception("Failed to fetch collectivites")

    memberships_records = grist.list_records(table_id="MEMBRES_ORGANISATIONS")
    if memberships_records[0] != 200:
        raise Exception("Failed to fetch memberships")

    repertoire_collectivites = collectivites_records[1]
    repertoire_memberships = memberships_records[1]
    repertoire_organisations = organisations_records[1]

    organisations_with_banatic_name = [
        orga for orga in repertoire_organisations if orga["Libelle_BANATIC"] != ""
    ]
    memberships_to_create = []

    for organisation in organisations_with_banatic_name:
        members = [
            member
            for member in memberships_from_banatic
            if str(member["N° SIREN"]) == organisation["SIREN"]
        ]

        for member in members:
            collectivite = next(
                (
                    collectivite
                    for collectivite in repertoire_collectivites
                    if collectivite["Numero_SIREN"] == str(member["Siren membre"])
                ),
                None,
            )
            if collectivite is None:
                continue
            existing_membership = next(
                (
                    membership
                    for membership in repertoire_memberships
                    if membership["Organisation"] == organisation["id"]
                    and membership["Membre_collectivite_"] == collectivite["id"]
                ),
                None,
            )
            if existing_membership is not None:
                continue
            memberships_to_create.append(
                {
                    "Organisation": organisation["id"],
                    "Membre_collectivite_": collectivite["id"],
                    "Derniere_mise_a_jour_script_": datetime.now(
                        pytz.timezone("Europe/Paris")
                    ).strftime("%Y-%m-%d %H:%M:%S"),
                }
            )

    if len(memberships_to_create) > 0:
        logger.info(f"{len(memberships_to_create)} memberships to create")
        created_count = 0
        for i in range(0, len(memberships_to_create), 500):
            memberships_to_create_batch = memberships_to_create[i : i + 500]
            grist.add_records(
                table_id="MEMBRES_ORGANISATIONS", records=memberships_to_create_batch
            )
            created_count += len(memberships_to_create_batch)
            logger.info(f"{created_count} memberships created")


if __name__ == "__main__":
    try:
        update_repertoire_epcis()
        update_repertoire_communes()
        update_repertoire_orga_members()
    except Exception as e:
        logger.error(f"Error: {e}")
        raise e
