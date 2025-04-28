# Some islands have no EPCI, we hardcode them here so they at least have SIREN+pop
HARDCODED_COMMUNES = {
    # https://www.banatic.interieur.gouv.fr/commune/22016-ile-de-brehat
    "22016": {
        "siren": "212200166",
        "siret": "21220016600016",
        "pmun_2025": "427",
        "zipcode": "22870",
    },
    "29083": {
        "siren": "212900831",
        "siret": "21290083100018",
        "pmun_2025": "280",
        "zipcode": "29990",
    },
    "29155": {
        "siren": "212901557",
        "siret": "21290155700018",
        "pmun_2025": "854",
        "zipcode": "29242",
    },
    "85113": {
        "siren": "218501138",
        "siret": "21850113800018",
        "pmun_2025": "4887",
        "zipcode": "85350",
    },
    "63354": {
        "siren": "216303545",
        "siret": "21630354500018",
        "pmun_2025": "1226",
        "zipcode": "63390",
    },
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
