import json
import socket
import unicodedata
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from typing import Iterable

import maxminddb
from cachetools import TTLCache, cached


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
        if row["TYPECOM"] in {"COM", "ARM"}:
            yield row


def iter_insee_departements():
    with open("dumps/insee_departements.json") as f:
        data = json.load(f)
    for row in data:
        yield row


def iter_insee_regions():
    with open("dumps/insee_regions.json") as f:
        data = json.load(f)
    for row in data:
        yield row


def get_communes_population_by_insee():
    with open("dumps/insee_population.json") as f:
        data = json.load(f)
    return data["communes"]


def iter_dila(type_service_local):
    with open("dumps/dila.json") as f:
        data = json.load(f)
    for service in data["service"]:
        if (
            len(service.get("pivot", [])) > 0
            and service["pivot"][0].get("type_service_local") == type_service_local
        ):
            yield service


def iter_operators():
    with open("dumps/operators.json") as f:
        data = json.load(f)
    for operator in data:
        operator["services"] = [int(x) for x in operator["services"].split(",") if len(x) > 0]
        operator["departements"] = [x for x in operator["departements"].split(",") if len(x) > 0]
        yield operator


def iter_groupements_memberships():
    with open("dumps/groupements_memberships.json") as f:
        data = json.load(f)
    for membership in data:
        yield membership


def iter_perimetre_epci():
    with open("dumps/perimetre_epci.json") as f:
        data = json.load(f)
    for collectivite in data:
        if collectivite.get("siren"):
            yield collectivite


def iter_sirene():
    with open("dumps/sirene.json") as f:
        data = json.load(f)
    for row in data:
        yield row


def geoip_country_by_ip(ip):
    with maxminddb.open_database("dumps/geoip-country.mmdb") as reader:
        return reader.get(ip).get("country_code")


geoip_cache = TTLCache(maxsize=1000, ttl=3600)


@cached(geoip_cache)
def geoip_countries_by_hostname(hostname) -> tuple[list[str], list[str]]:
    """Returns all the IPs and their countries for a hostname"""
    try:
        ips = resolve_with_timeout(hostname, timeout=10)
        return ips, [geoip_country_by_ip(ip) for ip in ips]
    except Exception:
        return None, None


def resolve_hostname(hostname) -> list[str]:
    """Returns all the IPs for a hostname"""
    return socket.gethostbyname_ex(hostname)[2]


def resolve_with_timeout(hostname, timeout=10) -> list[str]:
    """Returns all the IPs for a hostname with a timeout"""
    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(resolve_hostname, hostname)
        try:
            return future.result(timeout=timeout)
        except TimeoutError as e:
            raise TimeoutError(
                f"DNS resolution for {hostname} timed out after {timeout} seconds"
            ) from e
        except socket.gaierror as e:
            raise ConnectionError(f"Failed to resolve hostname {hostname}: {e}") from e
