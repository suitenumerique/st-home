import json
from pygrister.api import GristApi
import requests
import bz2
import tarfile
import io
import re
from pathlib import Path
from slugify import slugify
from collections import Counter

grist = GristApi()

def download_and_extract_dila():
    url = "https://lecomarquage.service-public.fr/donnees_locales_v4/all_latest.tar.bz2"

    # Stream download
    response = requests.get(url, stream=True)
    response.raise_for_status()

    # Decompress bz2 and extract tar in memory
    decompressor = bz2.BZ2Decompressor()
    tar_stream = io.BytesIO()

    for chunk in response.iter_content(chunk_size=8192):
        if chunk:
            tar_stream.write(decompressor.decompress(chunk))

    tar_stream.seek(0)

    # Extract the json file from tar
    with tarfile.open(fileobj=tar_stream, mode='r:') as tar:
        for member in tar:
            if member.name.endswith('.json'):
                return json.load(tar.extractfile(member))

    raise Exception("No JSON file found in the archive")

def normalize_name(name: str) -> str:
    name = re.sub("'","-", name)
    return slugify(name,to_lower=True)

def duplicates(elems: list) -> dict:
    counts = Counter(elems)
    return {k:counts[k] for k in counts if counts[k] > 1}

def main():
    communes = []

    # Read info from DILA
    dila = download_and_extract_dila()["service"]

    # Process DILA data
    communes_dila = dict()
    for service in dila:
        if "pivot" in service and len(service["pivot"]):
            pivot = service["pivot"][0]
            if "type_service_local" in pivot and pivot["type_service_local"] == "mairie":
                insee_geo = pivot["code_insee_commune"][0]
                communes_dila[insee_geo] = service

    orgs = dict()
    orgs_full = []
    records = grist.list_records(table_id="ORGANISATIONS",filter={"Typologie":["OPSN","Centre de gestion"]})
    if (records[0] == 200):
        for record in records[1]:
            structure_id = record["id"]
            if "Couverture" in record:
                libelle = record["Couverture"]
                if libelle in orgs:
                    orgs[libelle].append(structure_id)
                else:
                    orgs[libelle] = [structure_id]
            orgs_full.append(record)
    with open('structures.json', 'w', encoding='utf-8') as f:
        json.dump(orgs_full, f, ensure_ascii=False, indent=4)

    records = grist.list_records(table_id="COLLECTIVITES")
    if (records[0] == 200):
        slugs = []
        for record in records[1]:
            slugs.append(normalize_name(record["libelle"]))

        dupes = duplicates(slugs)

        # Index all by id before enumerating Communes
        collter = dict()
        for record in records[1]:
            record_id = record["id"]
            collter[record_id] = record

        for record in records[1]:
            # Only handle Communes, the Repertoire data also has EPCI
            # so we can look up their population
            if record["typ"] != "Commune":
                continue

            commune = dict()
            commune["nom"] = record["libelle"]

            # Deal with duplicates
            # TODO: warn if duplicates in same departement…
            slug = normalize_name(record["libelle"])
            if slug in dupes:
                slug = slug + record["dep"]
            commune["slug"] = slug

            insee_geo = record["insee_geo"]

            # Straight copies
            copy_fields = [
                "insee_geo",
                "SIREN",
                "pmun_2024",
                "cp",
                "Site_web",
                "Courriel",
                "domaine_web",
                "domaine_messagerie",
                "protocole_declare",
                "protocole",
                "tld",
                "tld_conforme",
                "messagerie_ko",
                "owner_qualite",
                # Interco
                "insee_epci_libelle",
            ]
            for field in copy_fields:
                commune[field] = record[field]

            # Copy over population from EPCI
            # siren_epci is actually a reference column, so contains an id
            epci_id = record["siren_epci"]
            if epci_id in collter:
                epci = collter[epci_id]
                commune["epci_siren"] = epci["SIREN"]
                commune["epci_pop"] = epci["epci_pop"]

            # Info that we don't have in Répertoire
            # Téléphone
            # Adresse postale
            if insee_geo in communes_dila:
                commune["adresse"] = communes_dila[insee_geo]["adresse"]
                commune["telephone"] = communes_dila[insee_geo]["telephone"]
                commune["url_service_public"] = communes_dila[insee_geo]["url_service_public"]
                commune["siret"] = communes_dila[insee_geo]["siret"]

            # Organizations (OPSN, etc.)
            dep_libelle = record["dep_libelle"]
            if dep_libelle in orgs:
                commune["structures"] = orgs[dep_libelle]

            communes.append(commune)

    with open('communes.json', 'w', encoding='utf-8') as f:
        json.dump(communes, f, ensure_ascii=False, indent=4)

if __name__ == '__main__':
    main()
