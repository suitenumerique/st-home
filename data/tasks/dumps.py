import bz2
import csv
import io
import json
import subprocess
import tarfile
from pathlib import Path

import requests


def dump_dila():
    if Path("dumps/dila.json").exists():
        return

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


def dump_filtered_sirene(communes):
    # https://www.data.gouv.fr/fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/
    if Path("dumps/sirene.json").exists():
        return

    mairies_sirens = set()
    for commune in communes:
        if commune.get("_st_epci", {}).get("siren_membre"):
            mairies_sirens.add(commune["_st_epci"]["siren_membre"])

    url = "https://www.data.gouv.fr/fr/datasets/r/0651fb76-bcf3-4f6a-a38d-bc04fa708576"

    # Start the process to stream data
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
            row["siren"] in mairies_sirens
            and row.get("etatAdministratifEtablissement") == "A"
            and row.get("etablissementSiege") == "true"
        ):
            rows.append(row)
            mairies_sirens.remove(row["siren"])

    with open("dumps/sirene.json", "w") as f:
        json.dump(rows, f, ensure_ascii=False, indent=4)

    return len(rows)
