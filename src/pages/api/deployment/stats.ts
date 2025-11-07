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

    const { scope = "list-commune", service_id, dep, reg, epci, commune } = req.query;

    // Build query based on scope
    let query;

    if (scope === "list-reg") {
      query = sql`
        SELECT 
          ${organizations.insee_reg} as id,
          COUNT(DISTINCT ${organizationsToServices.organizationSiret})::int as total,
          COUNT(DISTINCT CASE WHEN ${organizationsToServices.active} = true THEN ${organizationsToServices.organizationSiret} END)::int as active
        FROM ${organizations}
        INNER JOIN ${organizationsToServices} ON ${organizations.siret} = ${organizationsToServices.organizationSiret}
        ${service_id ? sql`INNER JOIN ${services} ON ${organizationsToServices.serviceId} = ${services.id}` : sql``}
        WHERE ${organizations.type} = 'commune'
        ${service_id ? sql`AND ${services.id} = ${service_id as string}` : sql``}
        GROUP BY ${organizations.insee_reg}
      `;
    } else if (scope === "list-dep") {
      query = sql`
        SELECT 
          ${organizations.insee_dep} as id,
          COUNT(DISTINCT ${organizationsToServices.organizationSiret})::int as total,
          COUNT(DISTINCT CASE WHEN ${organizationsToServices.active} = true THEN ${organizationsToServices.organizationSiret} END)::int as active
        FROM ${organizations}
        INNER JOIN ${organizationsToServices} ON ${organizations.siret} = ${organizationsToServices.organizationSiret}
        ${service_id ? sql`INNER JOIN ${services} ON ${organizationsToServices.serviceId} = ${services.id}` : sql``}
        WHERE ${organizations.type} = 'commune'
        ${service_id ? sql`AND ${services.id} = ${service_id as string}` : sql``}
        GROUP BY ${organizations.insee_dep}
      `;
    } else if (scope === "list-epci") {
      // Group by EPCI
      query = sql`
        SELECT 
          ${organizations.epci_siren} as id,
          ${organizations.insee_dep} as dep,
          ${organizations.insee_reg} as reg,
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
    } else if (scope === "list-commune") {
      // Group by commune - include communes with and without services
      query = sql`
        SELECT 
          ${organizations.siret} as id,
          ${organizations.insee_dep} as dep,
          ${organizations.insee_reg} as reg,
          COALESCE(ARRAY_AGG(DISTINCT ${organizationsToServices.serviceId}) FILTER (WHERE ${organizationsToServices.serviceId} IS NOT NULL), ARRAY[]::text[]) as all_services,
          COALESCE(ARRAY_AGG(DISTINCT CASE WHEN ${organizationsToServices.active} = true THEN ${organizationsToServices.serviceId} END) FILTER (WHERE ${organizationsToServices.active} = true), ARRAY[]::text[]) as active_services
        FROM ${organizations}
        LEFT JOIN ${organizationsToServices} ON ${organizations.siret} = ${organizationsToServices.organizationSiret}
        ${service_id ? sql`LEFT JOIN ${services} ON ${organizationsToServices.serviceId} = ${services.id}` : sql``}
        WHERE ${organizations.type} = 'commune'
        ${service_id ? sql`AND (${services.id} = ${service_id as string} OR ${organizationsToServices.serviceId} IS NULL)` : sql``}
        ${dep ? sql`AND ${organizations.insee_dep} = ${dep as string}` : sql``}
        GROUP BY ${organizations.siret}, ${organizations.insee_dep}, ${organizations.insee_reg}
      `;
    } else if (scope === "list-service") {
      // Group by service - show number of communes using each service
      query = sql`
        SELECT 
          ${services.id}::int as id,
          COUNT(DISTINCT ${organizationsToServices.organizationSiret})::int as total,
          COUNT(DISTINCT CASE WHEN ${organizationsToServices.active} = true THEN ${organizationsToServices.organizationSiret} END)::int as active
        FROM ${services}
        INNER JOIN ${organizationsToServices} ON ${services.id} = ${organizationsToServices.serviceId}
        INNER JOIN ${organizations} ON ${organizationsToServices.organizationSiret} = ${organizations.siret}
        WHERE ${organizations.type} = 'commune'
        ${dep ? sql`AND ${organizations.insee_dep} = ${dep as string}` : sql``}
        ${reg ? sql`AND ${organizations.insee_reg} = ${reg as string}` : sql``}
        ${epci ? sql`AND ${organizations.epci_siren} = ${epci as string}` : sql``}
        ${commune ? sql`AND ${organizations.siret} = ${commune as string}` : sql``}
        GROUP BY ${services.id}
      `;
    } else {
      return res.status(400).json({
        error:
          "Invalid scope. Must be 'list-reg', 'list-dep', 'list-epci', 'list-commune', or 'list-service'",
      });
    }

    const { rows: stats } = await db.execute(query);

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
