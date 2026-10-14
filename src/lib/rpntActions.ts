import { EXCLUDED_OPERATOR_NAMES, OPERATOR_STATUSES, type Scope } from "@/lib/rpntScopes";
import { ReferentielConformite } from "@/pages/conformite/referentiel";
import { SQL, sql } from "drizzle-orm";

// Actions bringing the organizations to 100% of the essential RPNT criteria. Each one is a
// predicate on a row of st_organizations (aliased "o"), evaluated in SQL by the
// /api/rcpnt/actions route. An organization can match several actions.

export type RpntAction = {
  id: string;
  title: string;
  description: string;
  criteria: string[];
  helpUrl?: string;
  matches: SQL;
};

export const ESSENTIAL_REFS = ReferentielConformite.flatMap((section) => section.items)
  .filter((item) => item.level === "mandatory")
  .map((item) => item.num);

const SCOPE_WHERE: Record<Scope, SQL> = {
  all: sql`o.type IN ('commune', 'epci')`,
  communes: sql`o.type = 'commune'`,
  "communes-3500": sql`o.type = 'commune' AND o.population < 3500`,
  epcis: sql`o.type = 'epci'`,
  "epcis-15000": sql`o.type = 'epci' AND o.population < 15000`,
  adherents: sql`o.type IN ('commune', 'epci')`,
};

// Link between an organization and an OPSN: périmètre, or adhesion for the "adherents" scope
// (oo is st_organizations_to_operators)
export const operatorLink = (scope: Scope) =>
  scope === "adherents" ? sql`oo.is_adherent` : sql`oo.is_perimetre`;

// OPSN listed on the page (op is st_operators)
export const listedOperator = sql`op.status IN (${sql.join(
  OPERATOR_STATUSES.map((status) => sql`${status}`),
  sql`, `,
)}) AND op.name NOT IN (${sql.join(
  EXCLUDED_OPERATOR_NAMES.map((name) => sql`${name}`),
  sql`, `,
)})`;

// Organizations of the chosen type, département and/or linked to the chosen OPSN
// (any listed OPSN for the "adherents" scope without OPSN)
export const organizationsInPerimeter = (dep: string, operator: string, scope: Scope) => sql`
  (${SCOPE_WHERE[scope]})
  AND o.insee_dep IS NOT NULL
  ${dep ? sql`AND o.insee_dep = ${dep}` : sql``}
  ${
    operator
      ? sql`AND EXISTS (
          SELECT 1 FROM st_organizations_to_operators oo
          WHERE oo.organization_siret = o.siret
            AND oo.operator_id = ${operator}
            AND ${operatorLink(scope)}
        )`
      : scope === "adherents"
        ? sql`AND EXISTS (
            SELECT 1 FROM st_organizations_to_operators oo
            JOIN st_operators op ON op.id = oo.operator_id
            WHERE oo.organization_siret = o.siret
              AND ${operatorLink(scope)}
              AND ${listedOperator}
          )`
        : sql``
  }`;

const has = (...issues: string[]) =>
  sql`COALESCE(o.issues, '{}') && ARRAY[${sql.join(
    issues.map((issue) => sql`${issue}`),
    sql`, `,
  )}]::text[]`;

// No site of its own: none declared, or one hosted on a shared platform or on another
// collectivité's domain.
const siteAbsent = has("WEBSITE_MISSING", "WEBSITE_DOMAIN_GENERIC", "WEBSITE_DOMAIN_OTHER_ORG");

const emailDomainBad = has(
  "EMAIL_DOMAIN_GENERIC",
  "EMAIL_DOMAIN_OTHER_ORG",
  "EMAIL_DOMAIN_EXTENSION",
  "EMAIL_DOMAIN_IDNA",
);

const emailDomainOwn = sql`(o.email_domain IS NOT NULL AND NOT ${emailDomainBad})`;

const PARKING_HELP_URL =
  "https://aide.suite.anct.gouv.fr/socle/domaines/afficher-une-page-sur-son-domaine-sans-avoir-de-site-internet";

export const RPNT_ACTIONS: RpntAction[] = [
  {
    id: "parking",
    title: "Ajouter une page de parking sur le domaine existant",
    description:
      "La collectivité a un nom de domaine (celui de sa messagerie) mais pas de site internet.",
    criteria: ["1.1"],
    helpUrl: PARKING_HELP_URL,
    matches: sql`(${siteAbsent} AND ${emailDomainOwn})`,
  },
  {
    id: "acheter-domaine",
    title: "Acheter un nom de domaine pour la collectivité",
    description:
      "Ni site internet, ni nom de domaine propre : la messagerie est absente ou sur un domaine générique, étranger ou non souverain.",
    criteria: ["1.1", "2.2"],
    helpUrl: "https://www.afnic.fr/noms-de-domaine/tout-savoir/creer-un-nom-de-domaine/",
    matches: sql`(${siteAbsent} AND NOT ${emailDomainOwn})`,
  },
  {
    id: "corriger-url-site",
    title: "Corriger l'adresse du site déclarée sur Service-Public.gouv.fr",
    description: "L'adresse du site est déclarée dans un format invalide.",
    criteria: ["1.1"],
    matches: has("WEBSITE_MALFORMED"),
  },
  {
    id: "site-souverain",
    title: "Passer le site sur une extension de domaine souveraine",
    description:
      "Le site utilise une extension non conforme (.com, .org...) ou un domaine à accents.",
    criteria: ["1.2"],
    helpUrl: "https://www.afnic.fr/noms-de-domaine/tout-savoir/creer-un-nom-de-domaine/",
    matches: has("WEBSITE_DOMAIN_EXTENSION", "WEBSITE_DOMAIN_IDNA"),
  },
  {
    id: "site-hors-ligne",
    title: "Remettre en ligne le site internet",
    description:
      "Le site est injoignable (erreur, délai dépassé ou page blanche). S'il ne peut pas être remis en ligne, afficher à la place une page de parking sur le domaine.",
    criteria: ["1.3"],
    helpUrl: PARKING_HELP_URL,
    matches: has("WEBSITE_DOWN"),
  },
  {
    id: "https",
    title: "Rediriger le site de HTTP vers HTTPS",
    description: "Le site n'est pas servi en HTTPS.",
    criteria: ["1.4"],
    matches: has("WEBSITE_HTTP_REDIRECT"),
  },
  {
    id: "certificat-ssl",
    title: "Renouveler le certificat SSL du site",
    description: "Le certificat SSL est invalide, expiré ou ne correspond pas au domaine.",
    criteria: ["1.5"],
    matches: has("WEBSITE_SSL"),
  },
  {
    id: "aligner-redirection",
    title: "Aligner l'adresse déclarée et la destination du site",
    description: "Le site déclaré redirige vers un autre nom de domaine.",
    criteria: ["1.6"],
    matches: has("WEBSITE_DOMAIN_REDIRECT"),
  },
  {
    id: "declarer-messagerie",
    title: "Déclarer une adresse de messagerie sur Service-Public.gouv.fr",
    description: "Aucune adresse de messagerie valide n'est déclarée.",
    criteria: ["2.1"],
    matches: has("EMAIL_MISSING", "EMAIL_MALFORMED"),
  },
  {
    id: "messagerie-domaine-site",
    title: "Créer une messagerie sur le domaine du site",
    description:
      "La messagerie déclarée est sur un domaine générique (gmail, orange...), étranger ou non souverain, alors que la collectivité a un site.",
    criteria: ["2.2"],
    matches: sql`(${emailDomainBad} AND NOT ${siteAbsent})`,
  },
  {
    id: "aligner-domaines",
    title: "Aligner le domaine de la messagerie sur celui du site",
    description: "La messagerie et le site utilisent deux domaines différents.",
    criteria: ["2.3"],
    matches: sql`(${has("EMAIL_DOMAIN_MISMATCH")} AND NOT ${emailDomainBad})`,
  },
  {
    id: "mx",
    title: "Configurer l'enregistrement MX du domaine de messagerie",
    description: "Le domaine de messagerie ne répond pas ou n'a pas d'enregistrement MX.",
    criteria: ["2.4"],
    matches: has("DNS_DOWN", "DNS_MX_MISSING"),
  },
  {
    id: "messagerie-ue",
    title: "Héberger la messagerie dans l'Union européenne",
    description: "Le serveur de messagerie est situé hors de l'Union européenne.",
    criteria: ["2.8"],
    matches: has("DNS_MX_OUTSIDE_EU"),
  },
];
