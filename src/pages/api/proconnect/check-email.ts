import { db } from "@/lib/db";
import { EMAIL_FORMAT, type EmailCheck } from "@/lib/proconnect/checkEmail";
import { organizations, organizationsToServices, services } from "@/lib/schema";
import { sql, type SQL } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

// Webmail domains: many communes still declare one, so a match on them says
// nothing about who the address belongs to.
const GENERIC_DOMAINS = [
  "aol.com",
  "bbox.fr",
  "free.fr",
  "gmail.com",
  "gmail.fr",
  "hotmail.com",
  "hotmail.fr",
  "icloud.com",
  "laposte.net",
  "live.fr",
  "msn.com",
  "neuf.fr",
  "numericable.fr",
  "orange.fr",
  "outlook.com",
  "outlook.fr",
  "sfr.fr",
  "wanadoo.fr",
  "yahoo.com",
  "yahoo.fr",
];

const PROCONNECT_TYPE = "proconnect";
const PROVIDER_PREFIX = /^FI\s+/i;
// A collectivité with no provider of its own is served by the ANCT one.
const DEFAULT_PROVIDER = "ANCT";

type Match = { name: string; provider: string };

async function findOrganization(where: SQL): Promise<Match | null> {
  const { rows } = await db.execute(sql`
    SELECT name, provider
    FROM (
      SELECT
        ${organizations.name} AS name,
        ${organizations.type} AS type,
        ${organizations.population} AS population,
        (
          SELECT ${services.instance_name}
          FROM ${organizationsToServices}
          INNER JOIN ${services} ON ${services.id} = ${organizationsToServices.serviceId}
          WHERE ${organizationsToServices.organizationSiret} = ${organizations.siret}
            AND ${services.type} = ${PROCONNECT_TYPE}
          ORDER BY ${services.id}
          LIMIT 1
        ) AS provider
      FROM ${organizations}
      WHERE ${where}
    ) matches
    -- A commune and its EPCI may share a domain: the one with a provider first,
    -- then the commune.
    ORDER BY provider IS NULL, type = 'commune' DESC, population DESC
    LIMIT 1
  `);

  const row = rows[0] as { name: string; provider: string | null } | undefined;

  return row
    ? { name: row.name, provider: row.provider?.replace(PROVIDER_PREFIX, "") ?? DEFAULT_PROVIDER }
    : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmailCheck | { error: string }>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { email, siret } = req.body ?? {};

  if (typeof email !== "string" || (siret !== undefined && typeof siret !== "string")) {
    return res.status(400).json({ error: "email is required, siret must be a string" });
  }

  const address = email.trim().toLowerCase();

  if (!EMAIL_FORMAT.test(address)) return res.status(200).json({ kind: "invalid" });

  const domain = address.split("@")[1];
  const genericDomain = GENERIC_DOMAINS.includes(domain);

  try {
    if (siret) {
      const organization = await findOrganization(sql`${organizations.siret} = ${siret}`);

      if (!organization) return res.status(404).json({ error: "Organization not found" });

      return res.status(200).json({
        kind: "generic",
        domain,
        genericDomain,
        organizationName: organization.name,
        provider: organization.provider,
      });
    }

    if (genericDomain) return res.status(200).json({ kind: "unknown" });

    const organization = await findOrganization(sql`
      lower(${organizations.email_domain}) = ${domain}
      OR regexp_replace(lower(${organizations.website_domain}), '^www\\.', '') = ${domain}
    `);

    if (!organization) return res.status(200).json({ kind: "unknown" });

    return res.status(200).json({ kind: "compliant", provider: organization.provider });
  } catch (error) {
    console.error("Error checking a ProConnect address:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
