import { findOrganizationsWithStructures } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { siret } = req.query;

    if (!siret || typeof siret !== "string") {
      return res.status(400).json({ error: "SIRET parameter is required" });
    }

    const organization = await findOrganizationsWithStructures(siret);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    return res.status(200).json(organization);
  } catch (error) {
    console.error("Error fetching organization:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
