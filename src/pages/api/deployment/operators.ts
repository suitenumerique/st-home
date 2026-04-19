import { db } from "@/lib/db";
import {
  operators,
  organizations,
  organizationsToOperators,
  services,
  servicesToOperators,
} from "@/lib/schema";
import { sql } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { rows } = await db.execute(sql`
      SELECT
        o.id,
        o.name,
        o.shortname,
        o.name_with_article,
        o.type,
        o.status,
        o.website,
        o.siret,
        COALESCE(
          JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', s.id, 'name', s.name, 'logo_url', s.logo_url, 'type', s.type))
          FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS services,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT org.insee_dep), NULL) AS departments
      FROM ${operators} o
      INNER JOIN ${organizationsToOperators} oto ON o.id = oto.operator_id AND oto.is_perimetre = true
      INNER JOIN ${organizations} org ON oto.organization_siret = org.siret
      LEFT JOIN ${servicesToOperators} sto ON o.id = sto.operator_id
      LEFT JOIN ${services} s ON sto.service_id = s.id
      GROUP BY o.id, o.name, o.shortname, o.name_with_article, o.type, o.status, o.website, o.siret
      ORDER BY o.name ASC
    `);

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

    return res.status(200).json({
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching operators:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
