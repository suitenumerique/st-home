import { searchCommunes } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

function applyCors(req: NextApiRequest, res: NextApiResponse) {
  const origin = (req.headers.origin as string | undefined) || "";
  const isLocalhost = /^https?:\/\/localhost(?::\d+)?$/i.test(origin);
  const isGouv = /^https?:\/\/([^.]+\.)*gouv\.fr$/i.test(origin);

  if (isLocalhost || isGouv) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { q, type } = req.body;

    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    // Search communes using the helper function
    const communes = await searchCommunes(q, type || "all");

    return res.status(200).json(communes);
  } catch (error) {
    console.error("Error searching communes:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
