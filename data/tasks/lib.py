import json
import unicodedata
from collections import Counter
from typing import Iterable


def normalize(s):
    z = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode("ascii")
    return "".join([c for c in z.casefold() if c in "abcdefghijklmnopqrstuvwxyz"])


def duplicates(elems: Iterable) -> dict:
    counts = Counter(elems)
    return {k: counts[k] for k in counts if counts[k] > 1}


def chunkify(lst, chunk_size):
    return [lst[i : i + chunk_size] for i in range(0, len(lst), chunk_size)]


def iter_insee_communes():
    with open("dumps/insee_communes.json") as f:
        data = json.load(f)
    for row in data:
        if row["TYPECOM"] == "COM":
            yield row


def iter_dila(type_service_local):
    with open("dumps/dila.json") as f:
        data = json.load(f)
    for service in data["service"]:
        if (
            len(service.get("pivot", [])) > 0
            and service["pivot"][0].get("type_service_local") == type_service_local
        ):
            yield service


def iter_repertoire_structures():
    with open("dumps/structures.json") as f:
        data = json.load(f)
    for structure in data:
        yield structure


def iter_repertoire_collectivites():
    with open("dumps/collectivites.json") as f:
        data = json.load(f)
    for collectivite in data:
        yield collectivite


def iter_perimetre_epci():
    with open("dumps/perimetre_epci.json") as f:
        data = json.load(f)
    for collectivite in data:
        yield collectivite


def iter_sirene():
    with open("dumps/sirene.json") as f:
        data = json.load(f)
    for row in data:
        yield row
