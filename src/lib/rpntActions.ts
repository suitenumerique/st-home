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
    title: "Publier une page de présence minimale sur le domaine existant",
    description:
      "La collectivité dispose d'un nom de domaine (celui de sa messagerie) mais d'aucun site internet. Une page de présence minimale (aussi appelée « page parking »), affichée sur ce domaine, suffit à rendre sa présence en ligne officielle sans créer de site complet.",
    criteria: ["1.1"],
    helpUrl: PARKING_HELP_URL,
    matches: sql`(${siteAbsent} AND ${emailDomainOwn})`,
  },
  {
    id: "acheter-domaine",
    title: "Réserver un nom de domaine pour la collectivité",
    description:
      "La collectivité ne dispose pas de nom de domaine conforme, ni pour un site internet ni pour sa messagerie, actuellement absente ou hébergée sur un domaine générique (gmail, orange...).",
    criteria: ["1.1", "2.2"],
    helpUrl: "https://suiteterritoriale.anct.gouv.fr/services/domaines",
    matches: sql`(${siteAbsent} AND NOT ${emailDomainOwn})`,
  },
  {
    id: "corriger-url-site",
    title: "Corriger l'adresse du site internet déclarée sur Service-Public.gouv.fr",
    description:
      "L'adresse du site internet déclarée sur Service-Public.gouv.fr n'est pas une URL valide. Elle doit être corrigée pour renvoyer vers le site de la collectivité.",
    criteria: ["1.1"],
    matches: has("WEBSITE_MALFORMED"),
  },
  {
    id: "site-souverain",
    title: "Migrer le site internet sur une extension souveraine",
    description:
      "Le site internet utilise une extension générique ou étrangère (.com, .org, .net...). Le domaine doit être réservé sous une extension souveraine (.fr, .eu, extension régionale) et l'ancienne adresse redirigée vers la nouvelle.",
    criteria: ["1.2"],
    matches: has("WEBSITE_DOMAIN_EXTENSION", "WEBSITE_DOMAIN_IDNA"),
  },
  {
    id: "site-hors-ligne",
    title: "Rétablir l'accès au site internet",
    description:
      "Le site internet est injoignable (erreur, délai dépassé ou page blanche). Il doit être réparé ou remis en service. Si ce n'est pas possible, une page de présence minimale doit être affichée sur le domaine en attendant la résolution.",
    criteria: ["1.3"],
    matches: has("WEBSITE_DOWN"),
  },
  {
    id: "https",
    title: "Rediriger le site internet HTTP vers HTTPS",
    description:
      "Le site internet reste accessible en HTTP, sans redirection automatique vers la version sécurisée HTTPS : les échanges avec les visiteurs ne sont pas chiffrés.",
    criteria: ["1.4"],
    matches: has("WEBSITE_HTTP_REDIRECT"),
  },
  {
    id: "certificat-ssl",
    title: "Renouveler le certificat SSL du site internet",
    description:
      "Le certificat SSL du site internet est invalide, expiré ou ne correspond pas au domaine.",
    criteria: ["1.5"],
    matches: has("WEBSITE_SSL"),
  },
  {
    id: "aligner-redirection",
    title: "Déclarer l'adresse réelle du site internet",
    description:
      "L'adresse du site internet déclarée par la collectivité (sur Service-Public.gouv.fr) redirige vers un autre nom de domaine. L'adresse déclarée doit être celle sur laquelle le site internet est réellement publié.",
    criteria: ["1.6"],
    matches: has("WEBSITE_DOMAIN_REDIRECT"),
  },
  {
    id: "declarer-messagerie",
    title: "Déclarer une adresse de messagerie sur Service-Public.gouv.fr",
    description:
      "Aucune adresse de messagerie n'est déclarée dans l'Annuaire de l'administration, ou l'adresse renseignée est erronée.",
    criteria: ["2.1"],
    matches: has("EMAIL_MISSING", "EMAIL_MALFORMED"),
  },
  {
    id: "messagerie-domaine-site",
    title: "Créer une messagerie sur le domaine du site internet",
    description:
      "La messagerie déclarée est hébergée sur un domaine générique (gmail, orange...) ou non souverain alors que la collectivité dispose déjà d'un nom de domaine via son site.",
    criteria: ["2.2"],
    matches: sql`(${emailDomainBad} AND NOT ${siteAbsent})`,
  },
  {
    id: "aligner-domaines",
    title: "Aligner le domaine de la messagerie sur celui du site internet",
    description:
      "La collectivité dispose d'un nom de domaine propre pour sa messagerie et d'un autre pour son site internet. Les deux doivent coïncider afin que les usagers identifient une seule identité en ligne.",
    criteria: ["2.3"],
    matches: sql`(${has("EMAIL_DOMAIN_MISMATCH")} AND NOT ${emailDomainBad})`,
  },
  {
    id: "mx",
    title: "Rendre le domaine de messagerie fonctionnel",
    description:
      "Le domaine de la messagerie ne répond pas ou n'indique pas de serveur de messagerie (enregistrement MX) : la collectivité ne peut pas recevoir de messages.",
    criteria: ["2.4"],
    matches: has("DNS_DOWN", "DNS_MX_MISSING"),
  },
  {
    id: "messagerie-ue",
    title: "Héberger la messagerie dans l'Union européenne",
    description:
      "Le serveur de messagerie de la collectivité est situé hors de l'Union européenne. La messagerie doit être migrée vers un hébergeur européen pour garantir la protection des données.",
    criteria: ["2.8"],
    matches: has("DNS_MX_OUTSIDE_EU"),
  },
];
