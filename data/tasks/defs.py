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

HARDCODED_DILA_SIRETS = {
    # EPCIs
    "20003382700011": "a114e5df-17fa-4e20-acc2-7554cac94d8d",
    "20003420500019": "bb923067-a595-4667-8806-92071602554b",
    "20006704900011": "b720ee0f-73aa-49ac-b317-c8a4a5f75fdc",
    "20003469200018": "a235555b-17f3-4de5-811b-344dbc127401",
    "20004017800010": "989e39cf-0843-447b-88d7-17cace2b9d3d",
    "24450020300090": "37f4e54c-54a9-4b47-a056-5f7edb3712b4",
    "20000593200013": "33558b18-417f-41af-978a-81911a2c8a11",
    "20006827800015": "50a3d8c1-3477-48b3-9af2-9c55b5902194",
    "20007010000017": "268be038-b2bf-4d16-ba64-fe0fb41bba11",
    "20007701400013": "878d7684-c95d-430e-a726-7b1634ecf6c1",
    "20007015900013": "2f603f8d-0d05-4352-be94-7c2dc3863cd0",
    "20007016700016": "9d0b7414-fca0-4419-a998-22df8e738bd0",
    "24270027600015": "dcb48c18-0bdf-431f-8273-cf3d555e4abe",
    "24270060700151": "9ec0042c-4567-44c9-a1b2-3445c99f82d5",
    "20006601700019": "31b3d4b7-02c7-4344-a092-921bbcbbca4c",
    "20006641300242": "103df6a6-cc46-466a-92e8-d957b10b39ce",
    "24192724300014": "45c397ce-fbc9-45b9-b373-b9a27f9a9a02",
    "20000668200013": "2541a6a7-3b3e-461e-bb52-9edfc742f593",
    "20004149900225": "c79e4812-43e2-4dc5-b38e-5f98fac78595",
    "20004152300016": "c0834af6-918e-4d9e-a753-d012409a58a4",
    "20004249700012": "32c18409-c830-4ba1-988f-53798fd4b9a2",
    "20006919300015": "1c3d258e-06a9-446b-a607-c962b4232c0f",
    "24720034800115": "899bbffa-f4df-4db9-be02-6b45878c40b3",
    "24600092100022": "ff90b36d-f513-49b0-8733-ce2bdb3b9785",
    # Communes
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
