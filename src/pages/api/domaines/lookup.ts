import { type DomainLookup, parseDomain } from "@/lib/domaines/checkDomain";
import { homonymKeys } from "@/lib/domaines/homonyms";
import { findDomainOwner, findHomonym } from "@/lib/organizationDomains";
import { NextApiRequest, NextApiResponse } from "next";

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
  const keys = homonymKeys(domain);

  try {
    const [siret, homonym] = await Promise.all([
      findDomainOwner(domain),
      keys.length > 0 ? findHomonym(keys) : null,
    ]);

    return res.status(200).json({ homonym, siret });
  } catch (error) {
    console.error("Error looking up a domain:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
