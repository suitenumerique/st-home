import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_cache } from "next/cache";

const getHistoryStatsInner = async (scope: string, scope_id: string | null, refs: string) => {
  // Build scope_id condition based on whether it's null or not
  const scopeIdCondition = scope_id === null ? sql`scope_id IS NULL` : sql`scope_id = ${scope_id}`;

  // Query historical data
  const { rows: history } = await db.execute<{
    history_month: string;
    ref: string;
    valid: number;
    total: number;
    scope_id: string | null;
  }>(sql`
    SELECT
      history_month,
      ref,
      valid,
      total,
      scope_id
    FROM data_rcpnt_stats_history
    WHERE scope = ${scope}
    AND ${scopeIdCondition}
    AND ref = ANY(string_to_array(${refs}, ','))
    ORDER BY history_month DESC, ref
  `);

  // Query current data
  const { rows: current } = await db.execute<{
    history_month: string;
    ref: string;
    valid: number;
    total: number;
    scope_id: string | null;
  }>(sql`
    SELECT
      'current' as history_month,
      ref,
      valid,
      total,
      scope_id
    FROM data_rcpnt_stats
    WHERE scope = ${scope}
    AND ${scopeIdCondition}
    AND ref = ANY(string_to_array(${refs}, ','))
  `);

  // Combine historical and current data
  const allData = [...history, ...current];

  // Group by month and transform to the required structure
  // Note: total is the same for all refs in a given scope/month, so we take it from the first row
  const groupedByMonth = allData.reduce(
    (acc, row) => {
      const month = row.history_month;
      if (!acc[month]) {
        acc[month] = {
          month,
          total: row.total,
          refs: [] as Array<{ ref: string; valid: number }>,
        };
      }
      acc[month].refs.push({
        ref: row.ref,
        valid: row.valid,
      });
      return acc;
    },
    {} as Record<
      string,
      {
        month: string;
        total: number;
        refs: Array<{ ref: string; valid: number }>;
      }
    >,
  );

  // Convert to array and sort by month descending (current first, then by date)
  const months = Object.values(groupedByMonth).sort((a, b) => {
    if (a.month === "current") return -1;
    if (b.month === "current") return 1;
    return b.month.localeCompare(a.month);
  });

  return {
    scope,
    scope_id,
    months,
  };
};

// Only use cache in production
const getHistoryStats =
  process.env.NODE_ENV === "production"
    ? unstable_cache(
        (scope: string, scope_id: string | null, refs: string) =>
          getHistoryStatsInner(scope, scope_id, refs),
        ["rcpnt-history-stats"],
        { revalidate: 3600 },
      )
    : getHistoryStatsInner;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { scope, scope_id, refs = "1.a,2.a" } = req.query;

    if (!scope) {
      return res.status(400).json({
        error: "scope parameter is required",
      });
    }

    // scope_id is optional for global scope, required for others
    if (scope !== "global" && !scope_id) {
      return res.status(400).json({
        error: "scope_id parameter is required for non-global scopes",
      });
    }

    // Only set cache headers in production
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Cache-Control", "public, s-maxage=3600");
    } else {
      res.setHeader("Cache-Control", "no-store");
    }

    const scopeIdValue = scope_id ? (scope_id as string) : null;
    const history = await getHistoryStats(scope as string, scopeIdValue, refs as string);

    return res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching history stats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
