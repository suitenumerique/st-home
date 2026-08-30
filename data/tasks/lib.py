import json
import logging
import socket
import unicodedata
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from functools import lru_cache
from threading import Lock
from typing import Iterable
from urllib.parse import urlparse

import maxminddb
from cachetools import TTLCache, cached

from .defs import ARRONDISSEMENT_SIRETS, EPCI_FP_NATURES

logger = logging.getLogger(__name__)


def is_safe_url(url: str) -> bool:
    if not url:
        return False
    try:
        parsed = urlparse(url.lower())
        return parsed.scheme in ("http", "https")
    except Exception:
        return False


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
        yield from json.load(f)


def iter_insee_regions():
    with open("dumps/insee_regions.json") as f:
        yield from json.load(f)


def get_communes_population_by_insee():
    with open("dumps/insee_population.json") as f:
        data = json.load(f)
    return data["communes"]


@lru_cache(maxsize=1)
def _load_dila():
    with open("dumps/dila.json") as f:
        return json.load(f)


def clear_dila_cache():
    """Release the parsed DILA export. Call once the sync no longer needs it."""
    _load_dila.cache_clear()


def iter_dila(type_service_local):
    # dumps/dila.json is ~250 MB on disk and ~950 MB once parsed, and iter_dila is
    # called once per type de service local — plus twice more for départements and
    # régions. Parsing it per call meant several copies alive at once (callers keep
    # references to the yielded records), which is what used to run the sync out of
    # memory. Parse once and share; clear_dila_cache() frees it at the end of the run
    # so the long-lived worker process does not hold it between tasks.
    for service in _load_dila()["service"]:
        if (
            len(service.get("pivot", [])) > 0
            and service["pivot"][0].get("type_service_local") == type_service_local
        ):
            yield service


def iter_operators():
    with open("dumps/operators.json") as f:
        yield from json.load(f)


def iter_adherents():
    with open("dumps/adherents.json") as f:
        yield from json.load(f)


def iter_groupements_memberships():
    with open("dumps/groupements_memberships.json") as f:
        yield from json.load(f)


def iter_epci_memberships():
    """Yield one BANATIC row per (EPCI à fiscalité propre, commune membre).

    This is the referential for the EPCI perimeter.
    """
    for row in iter_groupements_memberships():
        if (
            row["Nature juridique"] in EPCI_FP_NATURES
            and row["Catégorie des membres du groupement"] == "commune"
        ):
            yield row


def insee_by_commune_siren() -> dict:
    """Map each commune SIREN to its INSEE code, using the siège address in SIRENE.

    BANATIC identifies communes by SIREN only, while INSEE's COG identifies them by
    code commune, so we need this bridge. SIRENE's codeCommuneEtablissement agrees
    with the INSEE code for 99.99% of communes; the exceptions are Paris, Lyon and
    Marseille, whose siège sits in an arrondissement municipal (75104, 13202, 69381),
    remapped here to the parent commune.
    """
    arrondissement_parents = {
        row["COM"]: row["COMPARENT"] for row in iter_insee_communes() if row["TYPECOM"] == "ARM"
    }
    commune_sirens = {row["Siren membre"] for row in iter_epci_memberships()}

    mapping = {}
    for row in iter_sirene():
        if row["siren"] not in commune_sirens:
            continue
        # Mairies d'arrondissement share their parent commune's SIREN: only the siège
        # tells us where that commune sits.
        if row.get("siret") in ARRONDISSEMENT_SIRETS:
            continue
        insee = row.get("codeCommuneEtablissement")
        if insee:
            mapping[row["siren"]] = arrondissement_parents.get(insee, insee)
    return mapping


def iter_sirene():
    with open("dumps/sirene.json") as f:
        yield from json.load(f)


def geoip_country_by_ip(ip):
    with maxminddb.open_database("dumps/geoip-country.mmdb") as reader:
        return reader.get(ip).get("country_code")


geoip_cache = TTLCache(maxsize=1000, ttl=3600)
# cachetools' @cached is not thread-safe without a lock; dramatiq runs tasks on
# multiple threads, so guard the shared cache. The lock only protects cache
# reads/writes (cachetools releases it during the wrapped call), so concurrent
# DNS/GeoIP lookups still run in parallel.
_geoip_cache_lock = Lock()


@cached(geoip_cache, lock=_geoip_cache_lock)
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
