import { db } from "@/lib/db";
import { organizations, organizationsToServices, services } from "@/lib/schema";
import { sql } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only allow GET requests
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { scope = "list-commune", service_id, dep } = req.query;

    // Validate scope parameter
    if (scope !== "list-commune" && scope !== "list-epci") {
      return res.status(400).json({
        error: "Invalid scope. Must be 'list-commune' or 'list-epci'",
      });
    }

    // Build query based on scope
    let query;

    if (scope === "list-epci") {
      // Group by EPCI
      query = sql`
        SELECT 
          ${organizations.epci_siren} as id,
          ${organizations.insee_dep} as dep,
          ${organizations.insee_reg} as reg,
          SUM(${organizations.population}) as pop,
          COUNT(DISTINCT ${organizationsToServices.organizationSiret})::int as total,
          COUNT(DISTINCT CASE WHEN ${organizationsToServices.active} = true THEN ${organizationsToServices.organizationSiret} END)::int as active
        FROM ${organizations}
        INNER JOIN ${organizationsToServices} ON ${organizations.siret} = ${organizationsToServices.organizationSiret}
        ${service_id ? sql`INNER JOIN ${services} ON ${organizationsToServices.serviceId} = ${services.id}` : sql``}
        WHERE ${organizations.type} = 'commune'
        AND ${organizations.epci_siren} IS NOT NULL
        ${service_id ? sql`AND ${services.id} = ${service_id as string}` : sql``}
        ${dep ? sql`AND ${organizations.insee_dep} = ${dep as string}` : sql``}
        GROUP BY ${organizations.epci_siren}, ${organizations.epci_name}, ${organizations.insee_dep}, ${organizations.insee_reg}
      `;
    } else {
      // Group by commune
      query = sql`
        SELECT 
          ${organizations.siret} as id,
          ${organizations.insee_dep} as dep,
          ${organizations.insee_reg} as reg,
          ${organizations.population} as pop,
          COUNT(DISTINCT CASE WHEN ${organizationsToServices.active} = true THEN ${organizationsToServices.organizationSiret} END)::int as active
        FROM ${organizations}
        INNER JOIN ${organizationsToServices} ON ${organizations.siret} = ${organizationsToServices.organizationSiret}
        ${service_id ? sql`INNER JOIN ${services} ON ${organizationsToServices.serviceId} = ${services.id}` : sql``}
        WHERE ${organizations.type} = 'commune'
        ${service_id ? sql`AND ${services.id} = ${service_id as string}` : sql``}
        ${dep ? sql`AND ${organizations.insee_dep} = ${dep as string}` : sql``}
        GROUP BY ${organizations.siret}
      `;
    }

    const { rows: stats } = await db.execute<{
      group_id: string;
      group_name: string;
      group_type: string;
      insee_dep: string;
      insee_reg: string;
      population: number;
      total_services: number;
      active_services: number;
    }>(query);

    // Set cache headers for public data
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

    return res.status(200).json({
      scope,
      service_id: service_id || "all",
      count: stats.length,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching service usage stats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
