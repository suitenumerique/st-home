import { db } from "@/lib/db";
import { nameKey, organizations } from "@/lib/schema";
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
  SELECT ${organizations.name} AS name, count(*) OVER (PARTITION BY ${nameKey(organizations.name)}) AS count
  FROM ${organizations}
  WHERE ${organizations.type} = 'commune'
    AND ${nameKey(organizations.name)} IN (${sql.join(
      keys.map((key) => sql`${key}`),
      sql`, `,
    )})
`;

/** SIRET of the collectivité declaring the domain. */
export async function findDomainOwner(domain: string): Promise<string | null> {
  const { rows } = await db.execute(domainOwnerQuery(domain));

  return (rows[0] as { siret: string } | undefined)?.siret ?? null;
}

/** Name of a commune sharing its spelling (one of `keys`, see `nameKey`) with another, else null. */
export async function findHomonym(keys: string[]): Promise<string | null> {
  const { rows } = await db.execute(homonymQuery(keys));
  const homonym = (rows as { name: string; count: string | number }[]).find(
    (row) => Number(row.count) > 1,
  );

  return homonym?.name ?? null;
}
