import bz2
import csv
import gzip
import io
import json
import logging
import os
import subprocess
import tarfile
import zipfile
from pathlib import Path

import requests


def dump_dila():
    if Path("dumps/dila.json").exists():
        return

    # https://www.data.gouv.fr/fr/datasets/service-public-fr-annuaire-de-l-administration-base-de-donnees-locales/
    url = "https://www.data.gouv.fr/fr/datasets/r/73302880-e4df-4d4c-8676-1a61bb997f3d"

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
    with tarfile.open(fileobj=tar_stream, mode="r:") as tar:
        for member in tar:
            if member.name.endswith(".json"):
                with open("dumps/dila.json", "wb") as f:
                    for chunk in tar.extractfile(member):
                        f.write(chunk)
                return

    raise Exception("No JSON file found in the archive")


def reset_dila_issues():
    """Create a csv file on disk with headers "id", "type", "data", "details" """
    with open("dumps/dila_issues.csv", "w") as f:
        writer = csv.DictWriter(f, ["id", "type", "data", "details"])
        writer.writeheader()


def add_dila_issue(id, type, data, details=""):
    """Add an issue to the dila issues csv file"""
    with open("dumps/dila_issues.csv", "a") as f:
        writer = csv.DictWriter(f, ["id", "type", "data", "details"])
        writer.writerow({"id": id, "type": type, "data": data, "details": details})


def dump_insee_communes():
    # https://www.insee.fr/fr/information/8377162
    if Path("dumps/insee_communes.json").exists():
        return

    url = "https://www.insee.fr/fr/statistiques/fichier/8377162/v_commune_2025.csv"
    r = requests.get(url)
    r.raise_for_status()
    r.encoding = "utf-8"

    # Convert CSV to JSON
    rows = list(csv.DictReader(r.text.splitlines(), delimiter=",", quotechar='"'))
    assert len(rows) > 35000
    with open("dumps/insee_communes.json", "w") as f:
        for row in rows:
            assert len(row) == 12
            if row["COM"] == "71223":
                assert row["LIBELLE"] == "La Grande-Verrière"
        json.dump(rows, f, ensure_ascii=False, indent=4)


def dump_insee_departements():
    # https://www.insee.fr/fr/information/8377162
    if Path("dumps/insee_departements.json").exists():
        return

    url = "https://www.insee.fr/fr/statistiques/fichier/8377162/v_departement_2025.csv"
    r = requests.get(url)
    r.raise_for_status()
    r.encoding = "utf-8"

    rows = list(csv.DictReader(r.text.splitlines(), delimiter=",", quotechar='"'))
    assert len(rows) > 90
    with open("dumps/insee_departements.json", "w") as f:
        json.dump(rows, f, ensure_ascii=False, indent=4)


def dump_insee_regions():
    # https://www.insee.fr/fr/information/8377162
    if Path("dumps/insee_regions.json").exists():
        return

    url = "https://www.insee.fr/fr/statistiques/fichier/8377162/v_region_2025.csv"
    r = requests.get(url)
    r.raise_for_status()
    r.encoding = "utf-8"

    rows = list(csv.DictReader(r.text.splitlines(), delimiter=",", quotechar='"'))
    assert len(rows) > 10
    with open("dumps/insee_regions.json", "w") as f:
        json.dump(rows, f, ensure_ascii=False, indent=4)


def dump_perimetre_epci():
    if Path("dumps/perimetre_epci.json").exists():
        return

    # https://www.data.gouv.fr/fr/datasets/base-nationale-sur-les-intercommunalites/
    url = "https://www.data.gouv.fr/fr/datasets/r/6e05c448-62cc-4470-aa0f-4f31adea0bc4"
    r = requests.get(url)
    r.raise_for_status()

    # Convert CSV to JSON
    rows = list(csv.DictReader(r.text.splitlines(), delimiter=";"))
    assert len(rows) > 20000
    with open("dumps/perimetre_epci.json", "w") as f:
        for row in rows:
            assert len(row) == 14
        json.dump(rows, f, ensure_ascii=False, indent=4)


def dump_insee_population():
    if Path("dumps/insee_population.json").exists():
        return

    # https://www.insee.fr/fr/statistiques/8680726?sommaire=8681011
    url = "https://www.insee.fr/fr/statistiques/fichier/8680726/ensemble.zip"
    r = requests.get(url)
    data = {"communes": {}}
    # Read from zip file
    with zipfile.ZipFile(io.BytesIO(r.content)) as thezip:
        with thezip.open("donnees_communes.csv", "r") as f:
            for row in csv.DictReader(
                f.read().decode("utf-8").splitlines(), delimiter=";", quotechar='"'
            ):
                data["communes"][row["COM"]] = int(row["PMUN"])
        # Saint-Pierre-et-Miquelon, Saint-Martin, Saint-Barthélemy
        with thezip.open("donnees_collectivites.csv", "r") as f:
            for row in csv.DictReader(
                f.read().decode("utf-8").splitlines(), delimiter=";", quotechar='"'
            ):
                data["communes"][row["COM"]] = int(row["PMUN"])

    with open("dumps/insee_population.json", "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


def dump_filtered_sirene(orgs):
    # https://www.data.gouv.fr/fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/
    if Path("dumps/sirene.json").exists():
        return

    orgs_sirens = {org["siren"] for org in orgs}

    url = "https://www.data.gouv.fr/fr/datasets/r/0651fb76-bcf3-4f6a-a38d-bc04fa708576"

    # Start the process to stream data. We do this to avoid loading the whole file in memory.
    process = subprocess.Popen(
        f"curl -sL '{url}' | zcat | sed -n '1p;/84.11Z/p'",
        shell=True,
        stdout=subprocess.PIPE,
        text=True,
    )

    # Create a CSV reader with proper encoding
    reader = csv.DictReader(process.stdout, delimiter=",")

    rows = []
    # Process each row
    for row in reader:
        if (
            row["siren"] in orgs_sirens
            and row.get("etatAdministratifEtablissement") == "A"
            and row.get("etablissementSiege") == "true"
        ):
            rows.append(row)
            orgs_sirens.remove(row["siren"])

    with open("dumps/sirene.json", "w") as f:
        json.dump(rows, f, ensure_ascii=False, indent=4)

    return len(rows)


def dump_groupements_memberships():
    if Path("dumps/groupements_memberships.json").exists():
        return

    # https://www.data.gouv.fr/fr/datasets/5e1f20058b4c414d3f94460d/
    url = "https://www.data.gouv.fr/fr/datasets/r/348cc004-22b4-4b12-9281-b00d4ccb1d88"
    r = requests.get(url)
    r.raise_for_status()

    # Convert XLSX to JSON
    from io import BytesIO

    import pandas as pd

    # Read the XLSX file directly from the response content using a file-like object
    df = pd.read_excel(BytesIO(r.content))
    df_selected = df[
        [
            "Nom du groupement",
            "N° SIREN",
            "Nom membre",
            "Siren membre",
            "Catégorie des membres du groupement",
        ]
    ]
    with open("dumps/groupements_memberships.json", "w") as f:
        json.dump(df_selected.to_dict(orient="records"), f, ensure_ascii=False, indent=4)


def dump_services():
    if Path("dumps/services.json").exists():
        return

    # https://www.data.gouv.fr/fr/datasets/68b0a2a1117b75b1b09edc6b/
    url = "https://www.data.gouv.fr/fr/datasets/r/610560cf-5893-4a53-b4d3-03e17d877e1c"
    r = requests.get(url)
    r.raise_for_status()

    # Convert CSV to JSON
    rows = list(csv.DictReader(r.content.decode("utf-8").splitlines(), delimiter=";"))
    assert len(rows) > 1
    with open("dumps/services.json", "w") as f:
        json.dump(rows, f, ensure_ascii=False, indent=4)


def dump_service_usages():
    if Path("dumps/service_usages.json").exists():
        return

    # https://www.data.gouv.fr/fr/datasets/68b0a2a1117b75b1b09edc6b/
    url = "https://www.data.gouv.fr/fr/datasets/r/8f100b83-73c5-49ce-90ce-03d5c6a1783d"
    r = requests.get(url)
    r.raise_for_status()

    # Decompress .csv.gz and parse CSV to JSON
    with gzip.open(io.BytesIO(r.content), mode="rt", encoding="utf-8") as gzfile:
        rows = list(csv.DictReader(gzfile, delimiter=";"))
    assert len(rows) > 20000
    with open("dumps/service_usages.json", "w") as f:
        json.dump(rows, f, ensure_ascii=False, indent=4)


def upload_file_to_data_gouv(resource_id, file_path):
    """Upload public files to data.gouv.fr"""

    if not os.environ.get("DATA_GOUV_API_KEY"):
        logging.warning("DATA_GOUV_API_KEY is not set, skipping upload to data.gouv.fr")
        return

    # https://guides.data.gouv.fr/guide-data.gouv.fr/readme-1/gerer-un-jeu-de-donnees-par-lapi
    # https://www.data.gouv.fr/datasets/donnees-de-la-presence-numerique-des-territoires/
    API = "https://www.data.gouv.fr/api/1"
    API_KEY = os.environ.get("DATA_GOUV_API_KEY")
    DATASET = "689383a2211ca2c3053d83d1"
    HEADERS = {
        "X-API-KEY": API_KEY,
    }

    response = requests.post(
        API + "/datasets/{}/resources/{}/upload/".format(DATASET, resource_id),
        files={
            "file": open(file_path, "rb"),
        },
        headers=HEADERS,
    )

    data = response.json()

    if not data["success"]:
        raise Exception(f"Failed to upload file to data.gouv.fr: {data}")

    return data
