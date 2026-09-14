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
    "215400656",  # Bertrichamps — siège NAF 85.20Z
}

# Mairies d'arrondissement (Paris, Lyon) and de secteur (Marseille), exposed as
# communes. They are not collectivités and have no SIREN of their own: they are
# établissements of their parent commune, so we key them by SIRET.
#
# The SIRETs come from SIRENE, not from DILA, which is wrong on at least two of them
# (it gives Lyon 1er the siège's SIRET, and Marseille 2e-3e the SIRET of a "service de
# la vie scolaire"). SIRENE has one active 84.11Z establishment per mairie.
#
# The key is the INSEE arrondissement code where the mairie sits, which is also the one
# DILA uses, so the existing match-by-INSEE finds each mairie's own website. "covers"
# lists the INSEE arrondissements the mairie administers and whose populations we sum;
# it defaults to the key alone. Paris counts 17 mairies for 20 arrondissements since the
# 1er-4e merged into Paris Centre in 2020, and Marseille 8 for 16 (secteurs, whose pairs
# are not consecutive: the 1er goes with the 7e, the 6e with the 8e).
ARRONDISSEMENT_COMMUNES = {
    "13201": {
        "siret": "21130055305924",
        "covers": ["13201", "13207"],
        "name": "Marseille 1er et 7e Arrondissements",
    },
    "13202": {
        "siret": "21130055306054",
        "covers": ["13202", "13203"],
        "name": "Marseille 2e et 3e Arrondissements",
    },
    "13205": {
        "siret": "21130055305940",
        "covers": ["13204", "13205"],
        "name": "Marseille 4e et 5e Arrondissements",
    },
    "13208": {
        "siret": "21130055305957",
        "covers": ["13206", "13208"],
        "name": "Marseille 6e et 8e Arrondissements",
    },
    "13209": {
        "siret": "21130055305965",
        "covers": ["13209", "13210"],
        "name": "Marseille 9e et 10e Arrondissements",
    },
    "13212": {
        "siret": "21130055305973",
        "covers": ["13211", "13212"],
        "name": "Marseille 11e et 12e Arrondissements",
    },
    "13214": {
        "siret": "21130055305981",
        "covers": ["13213", "13214"],
        "name": "Marseille 13e et 14e Arrondissements",
    },
    "13215": {
        "siret": "21130055305999",
        "covers": ["13215", "13216"],
        "name": "Marseille 15e et 16e Arrondissements",
    },
    "69381": {"siret": "21690123102835"},
    "69382": {"siret": "21690123102512"},
    "69383": {"siret": "21690123102520"},
    "69384": {"siret": "21690123102538"},
    "69385": {"siret": "21690123102546"},
    "69386": {"siret": "21690123102561"},
    "69387": {"siret": "21690123102579"},
    "69388": {"siret": "21690123102587"},
    "69389": {"siret": "21690123102595"},
    "75103": {
        "siret": "21750001630040",
        "covers": ["75101", "75102", "75103", "75104"],
        "name": "Paris Centre",
    },
    "75105": {"siret": "21750001606669"},
    "75106": {"siret": "21750001607071"},
    "75107": {"siret": "21750001608202"},
    "75108": {"siret": "21750001607436"},
    "75109": {"siret": "21750001607956"},
    "75110": {"siret": "21750001608277"},
    "75111": {"siret": "21750001608632"},
    "75112": {"siret": "21750001608343"},
    "75113": {"siret": "21750001609390"},
    "75114": {"siret": "21750001608780"},
    "75115": {"siret": "21750001609671"},
    "75116": {"siret": "21750001609036"},
    "75117": {"siret": "21750001609184"},
    "75118": {"siret": "21750001608947"},
    "75119": {"siret": "21750001608855"},
    "75120": {"siret": "21750001609572"},
}

ARRONDISSEMENT_SIRETS = {x["siret"] for x in ARRONDISSEMENT_COMMUNES.values()}

# Départements whose SIREN we pin rather than read from DILA's "cg" fiches. The Ville de
# Paris exercises both commune and département powers under the single SIREN 217500016;
# we expose it at the département tier, its 17 mairies d'arrondissement carrying the
# commune tier. Pinned because the DILA fiche "Conseil de Paris" has lost and regained
# its SIRET, which used to flip Paris between the two tiers from one sync to the next.
HARDCODED_DEPARTEMENT_SIRENS = {
    "01": "220100010",  # hotfix, waiting for a DILA fix
    "75": "217500016",  # Ville de Paris
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

# Email domains that never belong to the collectivité using them: consumer webmail,
# ISPs, and the shared mailboxes distributed by a CDG, an agence technique
# départementale or a syndicat numérique. They break RPNT criterion 2.2.
#
# Only list a domain no collectivité owns. "selonnet.fr" and "copler.fr" were removed
# for that reason: they are the own domains of the commune of Selonnet and of the CC
# du Pays Entre Loire et Rhône (COPLER), which the list was penalising.
#
# Matching is exact, so a domain shared through subdomains belongs in
# GENERIC_WEBSITE_DOMAINS instead. Entries matching nothing today are kept as defences.
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
    "orange-business.fr",
    "telwan.fr",
    "icloud.com",
    "numericable.com",
    "vialis.net",
    "fr.oleane.com",
    "netcourrier.fr",
    "netcourrier.com",
    "net-c.fr",
    "online.fr",
    "9online.fr",
    "club.fr",
    "club-internet.fr",
    "mailo.com",
    "gmail.fr",
    "aol.com",
    "keyyomail.com",
    # Boîtes distribuées par un CDG, une agence technique départementale ou un
    # syndicat numérique. Aucune collectivité n'est propriétaire de ces domaines.
    "collectivite47.fr",  # CDG47
    "info46.fr",  # Lot
    "info82.com",  # Tarn-et-Garonne
    "mairie19.fr",  # Corrèze
    "correze.net",  # Corrèze
    "ccsudgatine.fr",  # ex-CC Sud Gâtine, dissoute
    "paysmellois.org",  # ex-Pays Mellois, dissous
    "ennemane.net",
    "sarthefibre.fr",
    "alsacefibre.fr",
    "ornethd.fr",
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

# The website counterpart of GENERIC_EMAIL_DOMAINS: domains shared by many
# collectivités, which therefore carry none of their names — social networks, site
# builders, blog platforms, municipal-info apps, commercial directories, the default
# personal-page hosting of ISPs, and the mutualised platforms of some CDG. A site
# declared on one of them is treated as no site at all (RPNT criterion 1.1), which
# also spares it the check_website probes.
#
# Matching covers the domain and all its subdomains, so list the narrowest domain
# that is always shared: "sites.google.com", not "google.com". Never list a domain
# a collectivité may own — collectivite.fr is a State service and belongs in
# WEBSITE_REDIRECT_DOMAINS_ALLOWED below, not here.
GENERIC_WEBSITE_DOMAINS = [
    # Réseaux sociaux
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "x.com",
    "linkedin.com",
    "youtube.com",
    "tiktok.com",
    # Applications d'information municipale et annuaires commerciaux
    "intramuros.org",
    "appli-intramuros.com",
    "appli-intramuros.fr",
    "lapagelocale.fr",
    "lapagelocale.com",
    "illiwap.com",
    "panneaupocket.com",
    "maelis.info",
    "la-mairie.com",
    "ma-mairie.com",
    "mairie.com",
    "commune-mairie.fr",
    "info-mairie.com",
    "annuaire-mairie.fr",
    # Constructeurs de sites et plateformes de blog
    "wixsite.com",
    "wix.com",
    "e-monsite.com",
    "jimdo.com",
    "jimdofree.com",
    "jimdoweb.com",
    "jimdosite.com",
    "wordpress.com",
    "sites.google.com",
    "blogspot.com",
    "blogspot.fr",
    "over-blog.com",
    "neopse-site.com",
    "neopse-site.fr",
    "canalblog.com",
    "sitew.fr",
    "sitew.com",
    "webnode.fr",
    "webnode.com",
    "sitego.fr",
    "weebly.com",
    "blog4ever.com",
    "webself.net",
    "webselfsite.net",
    "asso-web.com",
    "simplesite.com",
    "live-website.com",
    "reseaudescommunes.fr",
    "wifeo.com",
    # Plateformes mutualisées de centres de gestion, un sous-domaine par commune.
    # Aucune collectivité n'est propriétaire du domaine racine.
    "mairie54.fr",
    "mairie49.fr",
    # Pages perso et hébergements par défaut des FAI
    "free.fr",
    "pagesperso-orange.fr",
    "monsite-orange.fr",
    "online.fr",
    "ovh.net",
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
