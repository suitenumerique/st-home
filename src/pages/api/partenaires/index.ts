import { departmentsRegion } from "@/lib/departmentsRegion";
import { db } from "@/lib/db";
import { operators, servicesToOperators } from "@/lib/schema";
import { sql } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const data = [];

    for (const region of departmentsRegion) {
      const regionDepartments = sql.join(
        region.numDpt.map((dpt: string) => sql`${dpt}`),
        sql`, `,
      );

      const { rows } = await db.execute(sql`
        SELECT
          o.name,
          o.status,
          o.website,
          s."hasProConnect"
        FROM ${operators} o
        JOIN (
          SELECT
            operator_id,
            BOOL_OR(service_id BETWEEN 58 AND 65) AS "hasProConnect"
          FROM ${servicesToOperators}
          GROUP BY operator_id
        ) s ON o.id = s.operator_id
        WHERE
          o.type = 'operator'
          AND o.status IS NOT NULL
          AND o.departments && ARRAY[${regionDepartments}]::text[]
        ORDER BY o.name ASC
      `);

      data.push({
        name: region.name,
        numDpt: region.numDpt,
        count: rows.length,
        data: rows,
      });
    }

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

    return res.status(200).json({
      count: data.reduce((acc, r) => acc + r.count, 0),
      regionsCount: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching partenaires:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
