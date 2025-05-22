import json
from pathlib import Path

from pygrister.api import GristApi


def dump_repertoire_structures():
    """
    Dump the repertoire of structures from Grist
    """
    if Path("dumps/structures.json").exists():
        return
    records = GristApi().list_records(
        table_id="ORGANISATIONS"
    )  # ,filter={"Typologie":["OPSN","Centre de gestion"]})
    if records[0] != 200:
        raise Exception("Failed to fetch organisations")
    with open("dumps/structures.json", "w", encoding="utf-8") as f:
        json.dump(records[1], f, ensure_ascii=False, indent=4)


def dump_repertoire_collectivites():
    """
    Dump the repertoire of collectivites from Grist
    """
    if Path("dumps/collectivites.json").exists():
        return
    records = GristApi().list_records(table_id="COLLECTIVITES")
    if records[0] != 200:
        raise Exception("Failed to fetch collectivites")
    with open("dumps/collectivites.json", "w", encoding="utf-8") as f:
        json.dump(records[1], f, ensure_ascii=False, indent=4)
