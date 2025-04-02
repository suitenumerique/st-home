import { searchCommunes } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
