# Some islands have no EPCI, we hardcode them here so they at least have SIREN+pop
HARDCODED_COMMUNES = {
    # https://www.banatic.interieur.gouv.fr/commune/22016-ile-de-brehat
    "22016": {
        "siren": "212200166",
        "siret": "21220016600016",
        "pmun_2025": 427,
        "zipcode": "22870",
    },
    "29083": {
        "siren": "212900831",
        "siret": "21290083100018",
        "pmun_2025": 280,
        "zipcode": "29990",
    },
    "29155": {
        "siren": "212901557",
        "siret": "21290155700018",
        "pmun_2025": 854,
        "zipcode": "29242",
    },
    "85113": {
        "siren": "218501138",
        "siret": "21850113800018",
        "pmun_2025": 4887,
        "zipcode": "85350",
    },
    "63354": {
        "siren": "216303545",
        "siret": "21630354500018",
        "pmun_2025": 1226,
        "zipcode": "63390",
    },
}

# SIRENs whose siège establishment is dropped by dump_filtered_sirene's default
# filter (NAF 84.11Z pre-filter + état "A"), but that we still need in the dump.
# For these we keep the siège row regardless of its NAF code or état.
FORCE_INCLUDE_SIRENE = {
    # Active collectivités whose siège is mis-coded with a NAF ≠ 84.11Z:
    "234500023",  # Région Centre-Val de Loire — siège NAF 49.10Z
    "213105885",  # Villeneuve-Tolosane — siège NAF 68.20B
    "215103789",  # Œuilly — siège NAF 01.21Z
    "200043776",  # CC Pyrénées Audoises — siège NAF 86.21Z
}

# Communes absent from INSEE's "populations légales" archive, which we therefore
# cannot read from dumps/insee_population.json.
#
# Mayotte follows its own census cycle and is published apart from the ensemble.zip
# we consume (its communes are missing from donnees_communes.csv, and département 976
# is missing from donnees_departements.csv). Paris, Lyon and Marseille are *not*
# listed here: that archive carries their 45 arrondissements, so dump_insee_population
# rebuilds the three parent communes by summing them.
#
# Values below are the populations municipales that the DGCL "périmètre des EPCI"
# file carried before we stopped using it. Refresh them when INSEE publishes a new
# Mayotte census.
HARDCODED_POPULATIONS = {
    "97601": 5192,  # Acoua
    "97602": 13989,  # Bandraboua
    "97603": 10282,  # Bandrele
    "97604": 6189,  # Bouéni
    "97605": 8295,  # Chiconi
    "97606": 8920,  # Chirongui
    "97607": 15848,  # Dembeni
    "97608": 17831,  # Dzaoudzi
    "97609": 5507,  # Kani-Kéli
    "97610": 32156,  # Koungou
    "97611": 71437,  # Mamoudzou
    "97612": 7705,  # Mtsamboro
    "97613": 6432,  # M'Tsangamouji
    "97614": 10203,  # Ouangani
    "97615": 11442,  # Pamandzi
    "97616": 11156,  # Sada
    "97617": 13934,  # Tsingoni
}

# BANATIC "nature juridique" codes that designate an EPCI à fiscalité propre, i.e.
# the groupements we expose as organisations. Everything else in the BANATIC export
# (syndicats, pôles métropolitains, EPT…) is ignored.
EPCI_FP_NATURES = {"CC", "CA", "CU", "METRO", "MET69"}

# Territories where a single merged collectivity exercises the powers of several
# INSEE tiers. Each collectivity is represented ONCE — at the tier for which DILA
# carries a SIREN — so the redundant tiers below are intentionally NOT created as
# orgs. They have no distinct active SIREN of their own; assigning them the
# collectivity's SIREN would share its SIRET and get them dropped as duplicates
# downstream (see create_new_dumps' SIRET de-duplication). The value documents the
# tier that already represents the collectivity.
EXCLUDED_DEPARTEMENTS = {
    "2A": "Collectivité de Corse — représentée par la région 94",
    "2B": "Collectivité de Corse — représentée par la région 94",
    "68": "Collectivité européenne d'Alsace — représentée par le département 67",
    "972": "Collectivité territoriale de Martinique — représentée par la région 02",
    "973": "Collectivité territoriale de Guyane — représentée par la région 03",
}
EXCLUDED_REGIONS = {
    "06": "Mayotte, Département-Région — représentée par le département 976",
}

HARDCODED_DILA_SIRETS = {
    # EPCIs
    "20007016700016": "9d0b7414-fca0-4419-a998-22df8e738bd0",
    "20007015900013": "2f603f8d-0d05-4352-be94-7c2dc3863cd0",
    # Lévézou Communauté, created by the 2026-01-01 merger of the CC du Pays de Salars
    # and the CC de Lévézou-Pareloup, has no annuaire record yet. Both records of its
    # dissolved predecessors already declare https://www.levezou.fr, which BANATIC
    # confirms is the merged EPCI's site, so we point at the Pays de Salars record
    # rather than leave the successor with no website / no email at all.
    "99457967000013": "34cbca1a-a3f8-42ba-b262-493f990e4597",
    # No equivalent for Thionville Fensch Agglomération: its two predecessors declare
    # two different sites (agglo-valdefensch.fr, agglo-thionville.fr) and BANATIC
    # gives neither site nor email for the successor, so there is nothing to inherit
    # without guessing. It stays without contact data until DILA publishes its record.
    # # Communes
    "20007648700012": "52ffafc5-2fbe-4324-804f-2c507369137e",
    "20008671800018": "262d3e65-16d9-4d6d-8537-ba15743d294e",
    "21750001600019": "34506f20-cf20-4c08-a9de-e56e680aa5ec",
}

GENERIC_EMAIL_DOMAINS = [
    "wanadoo.fr",
    "orange.fr",
    "gmail.com",
    "laposte.net",
    "free.fr",
    "outlook.fr",
    "nordnet.fr",
    "yahoo.fr",
    "sfr.fr",
    "hotmail.fr",
    "ozone.net",
    "west-telecom.com",
    "mcom.fr",
    "cegetel.net",
    "akeonet.com",
    "neuf.fr",
    "outlook.com",
    "hotmail.com",
    "bbox.fr",
    "inforoutes-ardeche.fr",
    "copler.fr",
    "9business.fr",
    "numericable.fr",
    "wibox.fr",
    "inforoutes.fr",
    "yahoo.com",
    "evc.net",
    "live.fr",
    "gmx.fr",
    "tubeo.eu",
    "adeli.biz",
    "aricia.fr",
    "pole-secretariat.fr",
    "ovh.fr",
    "tv-com.net",
    "idyle-telecom.com",
    "rtvc.fr",
    "lgtel.fr",
    "alsatis.net",
    "sivucesny.fr",
    "selonnet.fr",
    "orange-business.fr",
    "telwan.fr",
    "icloud.com",
    "numericable.com",
    "vialis.net",
    "fr.oleane.com",
    "collectivite47.fr",  # Distribués par le CDG47
    "intramuros.org",
    "info46.fr",
]

DOMAIN_EXTENSIONS_ALLOWED = [
    # National
    "fr",
    # Régional
    "alsace",
    "bzh",
    "corsica",
    "paris",
    "eu",
    # Outre-mer
    "gp",  # Guadeloupe
    "gf",  # Guyane
    "mq",  # Martinique
    "re",  # Réunion
    "yt",  # Mayotte
    "pm",  # Saint-Pierre-et-Miquelon
    "wf",  # Wallis-et-Futuna
    "tf",  # Terres australes françaises
    "nc",  # Nouvelle-Calédonie
    "pf",  # Polynésie française
    # "bl",  # Saint-Barthélemy
    # "mf",  # Saint-Martin
]

# Domains a declared website is allowed to redirect to — as a final target or as
# an intermediary step — without breaking RPNT criterion 1.6 ("the site declared
# on Service-Public.gouv.fr must not redirect elsewhere"). Subdomains are included.
WEBSITE_REDIRECT_DOMAINS_ALLOWED = [
    "collectivite.fr",
    "gouv.fr",
]

# Maximum number of redirects tolerated in a trusted chain (criterion 1.6): a
# declared site may bounce through the allow-listed domains above, but only if the
# whole chain stays trusted and is no longer than this many hops.
WEBSITE_REDIRECT_MAX_HOPS = 5

EU_COUNTRIES = {
    "AT",
    "BE",
    "BG",
    "HR",
    "CY",
    "CZ",
    "DK",
    "EE",
    "FI",
    "FR",
    "DE",
    "GR",
    "HU",
    "IE",
    "IT",
    "LV",
    "LT",
    "LU",
    "MT",
    "NL",
    "PL",
    "PT",
    "RO",
    "SK",
    "SI",
    "ES",
    "SE",
}
