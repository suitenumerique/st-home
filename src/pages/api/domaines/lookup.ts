import { db } from "@/lib/db";
import { type DomainLookup, homonymKey, parseDomain } from "@/lib/domaines/checkDomain";
import { organizations } from "@/lib/schema";
import { sql } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

const ACCENTED = "àáâäãåçèéêëìíîïñòóôöõùúûüýÿ";
const UNACCENTED = "aaaaaaceeeeiiiinooooouuuuyy";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DomainLookup | { error: string }>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { domain: input } = req.body ?? {};
  if (typeof input !== "string") return res.status(400).json({ error: "domain is required" });

  const domain = parseDomain(input);
  if (!domain) return res.status(200).json({ homonym: null, siret: null });
  const key = homonymKey(domain);

  try {
    const [owner, homonyms] = await Promise.all([
      db.execute(sql`
        SELECT ${organizations.siret} AS siret
        FROM ${organizations}
        WHERE lower(${organizations.email_domain}) = ${domain}
          OR regexp_replace(lower(${organizations.website_domain}), '^www\\.', '') = ${domain}
        -- A commune and its EPCI may share a domain: the commune first.
        ORDER BY ${organizations.type} = 'commune' DESC, ${organizations.population} DESC
        LIMIT 1
      `),
      key
        ? db.execute(sql`
            SELECT ${organizations.name} AS name, count(*) OVER () AS count
            FROM ${organizations}
            WHERE ${organizations.type} = 'commune'
              AND regexp_replace(
                translate(
                  replace(replace(lower(${organizations.name}), 'œ', 'oe'), 'æ', 'ae'),
                  ${ACCENTED},
                  ${UNACCENTED}
                ),
                '[^a-z0-9]', '', 'g'
              ) = ${key}
            LIMIT 1
          `)
        : null,
    ]);

    const siret = (owner.rows[0] as { siret: string } | undefined)?.siret ?? null;
    const homonym = homonyms?.rows[0] as { name: string; count: string | number } | undefined;

    return res.status(200).json({
      homonym: homonym && Number(homonym.count) > 1 ? homonym.name : null,
      siret,
    });
  } catch (error) {
    console.error("Error looking up a domain:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
