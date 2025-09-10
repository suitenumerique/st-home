import { db } from "@/lib/db";
import { services } from "@/lib/schema";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only allow GET requests
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Fetch all services from the st_services table
    const allServices = await db.select().from(services);

    // Set cache headers for public data
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

    return res.status(200).json(allServices);
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
