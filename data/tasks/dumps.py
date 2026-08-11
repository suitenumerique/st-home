import csv
import gzip
import io
import json
import logging
import os
import signal
import subprocess
import tempfile
import zipfile
from pathlib import Path

import openpyxl
import requests

from .defs import EPCI_FP_NATURES, FORCE_INCLUDE_SIRENE, HARDCODED_POPULATIONS

logger = logging.getLogger(__name__)


def dump_dila():
    if Path("dumps/dila.json").exists():
        return

    # The data.gouv archive (all_latest.tar.bz2) now ships only the geographic-scope
    # index (commune -> organism UUIDs); the organism records themselves live in this
    # Opendatasoft export of the api-lannuaire-administration dataset.
    url = "https://api-lannuaire.service-public.gouv.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/exports/json"

    response = requests.get(url, timeout=600)
    response.raise_for_status()
    records = response.json()

    # The export stores nested fields (pivot, site_internet, telephone) as JSON-encoded
    # strings, adresse_courriel as a single ;-joined string, and uses None where the old
    # tar.bz2 format used "" / []. Normalize back to the structured shape that iter_dila /
    # associate_dila_to_organizations expect (siret sliced as string, list-of-dicts for
    # contact fields, individual emails per list entry).
    services = []
    for r in records:
        pivot = json.loads(r["pivot"]) if r.get("pivot") else []
        if not pivot:
            continue
        r["pivot"] = pivot
        r["siret"] = r.get("siret") or ""
        r["site_internet"] = json.loads(r["site_internet"]) if r.get("site_internet") else []
        r["telephone"] = json.loads(r["telephone"]) if r.get("telephone") else []
        ac = r.get("adresse_courriel")
        r["adresse_courriel"] = [e.strip() for e in ac.split(";") if e.strip()] if ac else []
        services.append(r)

    assert len(services) > 50000, f"Only {len(services)} DILA services"
    with open("dumps/dila.json", "w") as f:
        json.dump({"service": services}, f, ensure_ascii=False)


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
    r = requests.get(url, timeout=120)
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
    r = requests.get(url, timeout=120)
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
    r = requests.get(url, timeout=120)
    r.raise_for_status()
    r.encoding = "utf-8"

    rows = list(csv.DictReader(r.text.splitlines(), delimiter=",", quotechar='"'))
    assert len(rows) > 10
    with open("dumps/insee_regions.json", "w") as f:
        json.dump(rows, f, ensure_ascii=False, indent=4)


def dump_insee_population():
    if Path("dumps/insee_population.json").exists():
        return

    # https://www.insee.fr/fr/statistiques/8680726?sommaire=8681011
    url = "https://www.insee.fr/fr/statistiques/fichier/8680726/ensemble.zip"
    r = requests.get(url, timeout=120)
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

    # The archive lists the 45 arrondissements municipaux of Paris, Lyon and Marseille
    # but not the three communes themselves, which would otherwise end up with a
    # population of 0 and be dropped by filter_invalid_communes. Rebuild each parent
    # from its arrondissements, whose COMPARENT we take from the COG.
    with open("dumps/insee_communes.json") as f:
        arrondissement_parents = {
            row["COM"]: row["COMPARENT"] for row in json.load(f) if row["TYPECOM"] == "ARM"
        }
    parents_population: dict[str, int] = {}
    for insee, parent in arrondissement_parents.items():
        if insee in data["communes"]:
            parents_population[parent] = (
                parents_population.get(parent, 0) + (data["communes"][insee])
            )
    assert len(parents_population) == 3, (
        f"Expected Paris, Lyon and Marseille, rebuilt {sorted(parents_population)}"
    )
    data["communes"].update(parents_population)

    # Mayotte is published apart from this archive (see HARDCODED_POPULATIONS).
    for insee, population in HARDCODED_POPULATIONS.items():
        data["communes"].setdefault(insee, population)

    with open("dumps/insee_population.json", "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


def dump_filtered_sirene(sirens):
    """Dump the siège establishment of every SIREN in `sirens`.

    Takes the SIRENs rather than the organisations themselves: communes get their
    SIREN from BANATIC, and it is this dump that then tells us which INSEE commune
    each one sits in (see insee_by_commune_siren), so it has to run first.
    """
    # https://www.data.gouv.fr/fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/
    if Path("dumps/sirene.json").exists():
        return

    orgs_sirens = {siren for siren in sirens if siren}

    url = "https://www.data.gouv.fr/fr/datasets/r/0651fb76-bcf3-4f6a-a38d-bc04fa708576"

    # The sed pre-filter keeps only lines with NAF 84.11Z to shrink the stream.
    # Force-included SIRENs (siège mis-coded or cessée) must survive it too, so we
    # add a print rule per SIREN. Digits only, safe inside the single-quoted script.
    force_rules = "".join(f";/{siren}/p" for siren in FORCE_INCLUDE_SIRENE)

    # SIRENE is sorted by SIREN ascending, so once the stream reaches our highest
    # target we have seen every relevant row and can stop.
    #
    # Collectivités used to live entirely in the low 20x–24x range, which put that
    # cutoff early in the file. INSEE has since exhausted that block and allocates 99x
    # SIRENs to new ones (Lévézou Communauté 994579670, Thionville Fensch
    # Agglomération 992367730…), so the cutoff now sits near the end of the file and we
    # read almost all of it. The retry loop below is what protects us: the stream is
    # only considered complete once we have actually reached max_target.
    max_target = max(int(s) for s in orgs_sirens if s and s.isdigit())

    # The data.gouv stream truncates intermittently at the far end ("gzip: invalid
    # compressed data--length error"). We stream (curl | zcat | sed) to avoid storing
    # the multi-GB file on disk, and stop as soon as we pass max_target. That used to
    # skip ~95% of the file; now that max_target is a 99x SIREN we read nearly all of
    # it, so we are much closer to the truncated tail — hence the retries below, which
    # fire whenever the stream dies *before* reaching max_target (an incomplete read).
    def stream_rows():
        # No `curl --retry` here: retrying inside a running pipe would re-send bytes
        # into zcat and corrupt the stream. We retry the whole pipeline instead.
        process = subprocess.Popen(
            f"set -o pipefail; curl -sfL --connect-timeout 30 '{url}' "
            f"| zcat | sed -n '1p;/84.11Z/p{force_rules}'",
            shell=True,
            executable="/bin/bash",
            stdout=subprocess.PIPE,
            text=True,
            start_new_session=True,
        )
        seen = set()
        collected = []
        passed_range = False
        prev_siren = 0
        disordered = False
        try:
            reader = csv.DictReader(process.stdout, delimiter=",")
            for row in reader:
                siren = row["siren"]
                if not siren.isdigit():
                    continue
                siren_int = int(siren)
                # The early-exit below is only sound if SIRENs arrive in ascending
                # order. That isn't a guarantee we found documented, so we verify it
                # as we go and abort loudly rather than risk silently dropping a row.
                if siren_int < prev_siren:
                    disordered = True
                    break
                prev_siren = siren_int
                if (
                    siren in orgs_sirens
                    and siren not in seen
                    and row.get("etablissementSiege") == "true"
                    # Force-included SIRENs keep their siège row regardless of NAF/état.
                    and (
                        siren in FORCE_INCLUDE_SIRENE
                        or row.get("etatAdministratifEtablissement") == "A"
                    )
                ):
                    collected.append(row)
                    seen.add(siren)
                # Stop once the stream has gone *past* the last target: a SIREN spans
                # several rows and the siège is not necessarily the first of them, so
                # breaking on the target itself could drop it.
                if siren_int > max_target:
                    passed_range = True
                    break
        finally:
            # Tear down the whole pipeline (curl would keep downloading otherwise).
            try:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            except (ProcessLookupError, PermissionError):
                pass
            process.stdout.close()
            returncode = process.wait()

        if disordered:
            raise RuntimeError(
                "SIRENE stream is not sorted by SIREN ascending; the early-exit would "
                "risk dropping rows. Aborting instead of writing an incomplete dump."
            )

        # Complete if we passed the target range, or the stream reached a clean EOF.
        return (passed_range or returncode == 0), collected

    rows = None
    for attempt in range(6):
        complete, collected = stream_rows()
        if complete and len(collected) > 30000:
            rows = collected
            break
        logger.warning(
            "SIRENE stream attempt %d incomplete (%d rows), retrying",
            attempt + 1,
            len(collected),
        )
    else:
        raise RuntimeError("Could not stream a complete SIRENE dump after retries")

    with open("dumps/sirene.json", "w") as f:
        json.dump(rows, f, ensure_ascii=False, indent=4)

    return len(rows)


def dump_groupements_memberships():
    if Path("dumps/groupements_memberships.json").exists():
        return

    # https://www.data.gouv.fr/fr/datasets/5e1f20058b4c414d3f94460d/
    # url = "https://www.data.gouv.fr/fr/datasets/r/348cc004-22b4-4b12-9281-b00d4ccb1d88"
    # url changed at Banatic without warning
    url = "https://www.banatic.interieur.gouv.fr/consultation/api/export/pregenere/telecharger/France"

    columns = [
        "Nom du groupement",
        "N° SIREN",
        "Nature juridique",
        "Département",
        "Nom membre",
        "Siren membre",
        "Catégorie des membres du groupement",
    ]

    # This export is ~75 MB of XLSX for 140k rows and 120 columns. pandas.read_excel
    # materialises the whole workbook and needs several GB; openpyxl's read-only mode
    # streams it row by row instead, so we only ever hold the columns above. Stream the
    # download to disk as well rather than keeping the archive in memory.
    with tempfile.NamedTemporaryFile(suffix=".xlsx") as tmp:
        with requests.get(url, timeout=300, stream=True) as r:
            r.raise_for_status()
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                tmp.write(chunk)
        tmp.flush()

        workbook = openpyxl.load_workbook(tmp.name, read_only=True, data_only=True)
        try:
            sheet = workbook.worksheets[0]
            stream = sheet.iter_rows(values_only=True)
            header = [str(cell) if cell is not None else "" for cell in next(stream)]
            indexes = [header.index(name) for name in columns]
            rows = [
                {
                    name: ("" if row[index] is None else str(row[index]))
                    for name, index in zip(columns, indexes, strict=False)
                }
                for row in stream
            ]
        finally:
            workbook.close()

    # This export is the referential for the EPCI perimeter.
    # Fail loudly rather than rebuild the whole country from a
    # truncated download.
    epci_members = sum(
        1
        for row in rows
        if row["Nature juridique"] in EPCI_FP_NATURES
        and row["Catégorie des membres du groupement"] == "commune"
    )
    assert epci_members > 34000, f"Only {epci_members} EPCI memberships in the BANATIC export"

    with open("dumps/groupements_memberships.json", "w") as f:
        json.dump(rows, f, ensure_ascii=False, indent=4)


def dump_services():
    if Path("dumps/services.json").exists():
        return

    # https://www.data.gouv.fr/fr/datasets/68b0a2a1117b75b1b09edc6b/
    url = "https://www.data.gouv.fr/fr/datasets/r/610560cf-5893-4a53-b4d3-03e17d877e1c"
    r = requests.get(url, timeout=120)
    r.raise_for_status()

    # Convert CSV to JSON, keeping original French key names
    rows = [
        {
            "id": int(row["id"]),
            "nom": row["nom"],
            "description": row.get("description") or None,
            "url": row["url"],
            "type": row.get("type") or None,
            "nom_instance": row.get("nom_instance") or None,
            "maturite": row["maturite"],
            "date_lancement": row["date_lancement"] or None,
            "logo_url": row["logo_url"] or None,
        }
        for row in csv.DictReader(r.content.decode("utf-8").splitlines(), delimiter=";")
    ]
    assert len(rows) > 1
    with open("dumps/services.json", "w") as f:
        json.dump(rows, f, ensure_ascii=False, indent=4)


def dump_service_usages():
    if Path("dumps/service_usages.json").exists():
        return

    # https://www.data.gouv.fr/fr/datasets/68b0a2a1117b75b1b09edc6b/
    url = "https://www.data.gouv.fr/fr/datasets/r/8f100b83-73c5-49ce-90ce-03d5c6a1783d"
    r = requests.get(url, timeout=120)
    r.raise_for_status()

    # Decompress .csv.gz and parse CSV to JSON, keeping original French key names
    with gzip.open(io.BytesIO(r.content), mode="rt", encoding="utf-8") as gzfile:
        rows = [
            {
                "siret": row["siret"],
                "service": int(row["service"]),
                "active": row["active"] == "1",
            }
            for row in csv.DictReader(gzfile, delimiter=";")
        ]
    assert len(rows) > 20000
    with open("dumps/service_usages.json", "w") as f:
        json.dump(rows, f, ensure_ascii=False, indent=4)


def dump_operators():
    if Path("dumps/operators.json").exists():
        return

    # https://www.data.gouv.fr/fr/datasets/68b0a2a1117b75b1b09edc6b/
    url = "https://www.data.gouv.fr/fr/datasets/r/902bb360-0b60-46d2-8169-4207a01caed1"
    r = requests.get(url, timeout=120)
    r.raise_for_status()

    # Convert CSV to JSON, normalizing field names and types
    rows = [
        {
            "id": row["id"],
            "nom": row["nom"],
            "nom_avec_article": row.get("nom_avec_article") or None,
            "statut": row.get("statut") or None,
            "url": row["url"],
            "siret": row.get("siret") or None,
            "services": [int(x) for x in row["services"].split(",") if x],
            "departements": [x for x in row["departements"].split(",") if x],
        }
        for row in csv.DictReader(r.content.decode("utf-8").splitlines(), delimiter=";")
    ]
    assert len(rows) > 10
    with open("dumps/operators.json", "w") as f:
        json.dump(rows, f, ensure_ascii=False, indent=4)


def dump_adherents():
    if Path("dumps/adherents.json").exists():
        return

    # https://www.data.gouv.fr/fr/datasets/68b0a2a1117b75b1b09edc6b/
    url = "https://www.data.gouv.fr/fr/datasets/r/ffc74be0-fb88-40cf-9048-f53e955eac28"
    r = requests.get(url, timeout=120)
    r.raise_for_status()

    # Decompress .csv.gz and parse CSV to JSON
    with gzip.open(io.BytesIO(r.content), mode="rt", encoding="utf-8") as gzfile:
        rows = list(csv.DictReader(gzfile, delimiter=";"))
    assert len(rows) > 10
    with open("dumps/adherents.json", "w") as f:
        json.dump(rows, f, ensure_ascii=False, indent=4)


def dump_operators_subscriptions():
    if Path("dumps/operators_subscriptions.json").exists():
        return

    # https://www.data.gouv.fr/fr/datasets/68b0a2a1117b75b1b09edc6b/
    url = "https://www.data.gouv.fr/fr/datasets/r/873dab81-45a1-463f-a297-54f5d466c325"
    r = requests.get(url, timeout=120)
    r.raise_for_status()

    # Decompress .csv.gz and parse CSV to JSON
    with gzip.open(io.BytesIO(r.content), mode="rt", encoding="utf-8") as gzfile:
        rows = list(csv.DictReader(gzfile, delimiter=";"))
    assert len(rows) > 10
    with open("dumps/operators_subscriptions.json", "w") as f:
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
