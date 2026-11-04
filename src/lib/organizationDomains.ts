import { db } from "@/lib/db";
import { compactNameColumn, organizations } from "@/lib/schema";
import { sql } from "drizzle-orm";

/**
 * Organizations declaring the domain for their email or their website, which
 * may carry a "www.". The data pipeline stores both lowercase, so the domain is
 * compared as is, on the columns' indexes.
 */
export const declaresDomain = (domain: string) => sql`(
  ${organizations.email_domain} = ${domain}
  OR ${organizations.website_domain} IN (${domain}, ${`www.${domain}`})
)`;

/** The commune first, then the most populated: a commune and its EPCI may share a domain. */
export const domainOwnerQuery = (domain: string) => sql`
  SELECT ${organizations.siret} AS siret
  FROM ${organizations}
  WHERE ${declaresDomain(domain)}
  ORDER BY ${organizations.type} = 'commune' DESC, ${organizations.population} DESC
  LIMIT 1
`;

export const homonymQuery = (keys: string[]) => sql`
  SELECT ${compactNameColumn(organizations.name_unaccent)} AS key,
    min(${organizations.name}) AS name,
    count(*) AS count
  FROM ${organizations}
  WHERE ${organizations.type} = 'commune'
    AND ${compactNameColumn(organizations.name_unaccent)} IN (${sql.join(
      keys.map((key) => sql`${key}`),
      sql`, `,
    )})
  GROUP BY 1
`;

/** SIRET of the collectivité declaring the domain. */
export async function findDomainOwner(domain: string): Promise<string | null> {
  const { rows } = await db.execute(domainOwnerQuery(domain));

  return (rows[0] as { siret: string } | undefined)?.siret ?? null;
}

/**
 * Name of the communes the domain is named after, when several share it. `keys` are in
 * order of likelihood and the first one any commune has settles it: "villedoux" is
 * Villedoux, not a homonym of "Doux".
 */
export async function findHomonym(keys: string[]): Promise<string | null> {
  const { rows } = await db.execute(homonymQuery(keys));
  const found = new Map(
    (rows as { key: string; name: string; count: string | number }[]).map((row) => [row.key, row]),
  );

  for (const key of keys) {
    const commune = found.get(key);
    if (commune) return Number(commune.count) > 1 ? commune.name : null;
  }

  return null;
}
