import { db } from "@/lib/db";
import { organizations } from "@/lib/schema";
import { sql } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_cache } from "next/cache";

const getConformanceStatsInner = async (scope: string, refs: string, dep?: string) => {
  // Special case for commune scope - return raw organization data
  if (scope === "commune") {
    if (!dep) {
      throw new Error("Department parameter (dep) is required when scope=commune");
    }

    const { rows: communes } = await db.execute<{
      siret: string;
      name: string;
      insee_geo: string;
      epci_siren: string;
      pop: number;
      rcpnt: string[];
    }>(sql`
      SELECT
        siret,
        name,
        insee_geo,
        epci_siren,
        population as pop,
        rcpnt
      FROM ${organizations}
      WHERE insee_dep = ${dep}
      AND type = 'commune'
      ORDER BY name
    `);

    return communes;
  }

  // Original code for other scopes using data_rcpnt_stats table
  const { rows: stats } = await db.execute<{
    scope_id: string | null;
    ref: string;
    valid: number;
    total: number;
    valid_pop: number;
    total_pop: number;
    last_updated: Date;
  }>(sql`
    SELECT
      scope_id,
      ref,
      valid,
      total,
      valid_pop,
      total_pop,
      last_updated
    FROM data_rcpnt_stats
    WHERE scope = ${scope}
    AND ref = ANY(string_to_array(${refs}, ','))
    ORDER BY scope_id NULLS FIRST, ref
  `);

  if (!stats.length) return [];

  // Group by scope_id
  const groupedStats = stats.reduce(
    (acc, stat) => {
      const scopeId = stat.scope_id || "global";
      if (!acc[scopeId]) {
        acc[scopeId] = [];
      }
      acc[scopeId].push({
        ref: stat.ref,
        valid: stat.valid,
        total: stat.total,
        valid_pop: stat.valid_pop,
        total_pop: stat.total_pop,
      });
      return acc;
    },
    {} as Record<string, object[]>,
  );

  return groupedStats;
};

// Only use cache in production
const getConformanceStats =
  process.env.NODE_ENV === "production"
    ? unstable_cache(
        (scope: string, refs: string, dep?: string) => getConformanceStatsInner(scope, refs, dep),
        ["conformance-stats"],
        { revalidate: 3600 },
      )
    : getConformanceStatsInner;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { scope = "global", refs = "1.a,2.a", dep } = req.query;

    if (scope === "commune" && !dep) {
      return res.status(400).json({
        error: "Department parameter (dep) is required when scope=commune",
      });
    }

    // Only set cache headers in production
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Cache-Control", "public, s-maxage=3600");
    } else {
      res.setHeader("Cache-Control", "no-store");
    }

    const stats = await getConformanceStats(scope as string, refs as string, dep as string);
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching conformance stats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
