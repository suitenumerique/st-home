import json
import time
from pathlib import Path

from pygrister.api import GristApi

# TODO: retries could be implemented with:
# https://pygrister.readthedocs.io/en/latest/misc.html#using-requests-sessions-in-pygrister
# https://stackoverflow.com/a/35504626


MAX_RETRIES = 3


def grist_list_records(table_id):
    for _ in range(MAX_RETRIES):
        try:
            records = GristApi().list_records(table_id)
            if records[0] != 200:
                raise Exception("Failed to fetch records")
            return records[1]
        except Exception:
            time.sleep(30)
    raise Exception(f"Failed to fetch grist records after {MAX_RETRIES} retries")


def dump_repertoire_structures():
    """
    Dump the repertoire of structures from Grist
    """
    if Path("dumps/structures.json").exists():
        return

    records = grist_list_records("ORGANISATIONS")

    with open("dumps/structures.json", "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=4)


def dump_repertoire_collectivites():
    """
    Dump the repertoire of collectivites from Grist
    """
    if Path("dumps/collectivites.json").exists():
        return

    records = grist_list_records("COLLECTIVITES")

    with open("dumps/collectivites.json", "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=4)
