import { db, findOrganizationsWithOperators } from "@/lib/db";
import { isGenericEmailDomain } from "@/lib/domains";
import { declaresDomain, declaresEmail } from "@/lib/organizationDomains";
import { firstPerimetreOperator } from "@/lib/perimetreOperators";
import { EMAIL_FORMAT, type EmailCheck } from "@/lib/proconnect/checkEmail";
import { organizations } from "@/lib/schema";
import { sql, type SQL } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

const MAX_EMAIL_LENGTH = 254;
// A collectivité in the périmètre of no OPSN is served by the ANCT.
const DEFAULT_PROVIDER = "ANCT";

type Match = { siret: string; name: string; provider: string };

// The OPSN that /bienvenue/[siret] proposes first: the one covering the département,
// not one the collectivité is an adherent of. Named whether or not it runs a
// ProConnect provider of its own.
async function findProvider(siret: string): Promise<string> {
  const organization = await findOrganizationsWithOperators(siret);

  return firstPerimetreOperator(organization?.operators ?? [])?.name ?? DEFAULT_PROVIDER;
}

async function findOrganization(where: SQL): Promise<Match | null> {
  const {
    rows: [row],
  } = await db.execute<{ siret: string; name: string }>(sql`
    SELECT ${organizations.siret} AS siret, ${organizations.name} AS name
    FROM ${organizations}
    WHERE ${where}
    -- A commune and its EPCI may share a domain: the commune first.
    ORDER BY ${organizations.type} = 'commune' DESC, ${organizations.population} DESC
    LIMIT 1
  `);

  return row ? { siret: row.siret, name: row.name, provider: await findProvider(row.siret) } : null;
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

  if (address.length > MAX_EMAIL_LENGTH || !EMAIL_FORMAT.test(address)) {
    return res.status(200).json({ kind: "invalid" });
  }

  const domain = address.split("@")[1];
  const genericDomain = isGenericEmailDomain(domain);

  try {
    if (siret) {
      const organization = await findOrganization(sql`${organizations.siret} = ${siret}`);

      if (!organization) return res.status(404).json({ error: "Organization not found" });

      return res.status(200).json({
        kind: "generic",
        domain,
        genericDomain,
        siret: organization.siret,
        organizationName: organization.name,
        provider: organization.provider,
      });
    }

    if (genericDomain) {
      const official = await findOrganization(declaresEmail(address));

      return res.status(200).json(
        official
          ? {
              kind: "official",
              domain,
              siret: official.siret,
              organizationName: official.name,
              provider: official.provider,
            }
          : { kind: "unknown" },
      );
    }

    const organization = await findOrganization(declaresDomain(domain));

    if (!organization) return res.status(200).json({ kind: "unknown" });

    return res
      .status(200)
      .json({ kind: "compliant", provider: organization.provider, siret: organization.siret });
  } catch (error) {
    console.error("Error checking a ProConnect address:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
