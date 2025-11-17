import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_cache } from "next/cache";

const getHistoryStatsInner = async (scope: string, scope_id: string, refs: string) => {
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
    AND scope_id = ${scope_id}
    AND ref = ANY(string_to_array(${refs}, ','))
    ORDER BY history_month DESC, ref
  `);

  // Group by month and transform to the required structure
  const groupedByMonth = history.reduce(
    (acc, row) => {
      const month = row.history_month;
      if (!acc[month]) {
        acc[month] = {
          month,
          total: 0,
          refs: [] as Array<{ ref: string; valid: number }>,
        };
      }
      acc[month].total += row.total;
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

  // Convert to array and sort by month descending
  const months = Object.values(groupedByMonth).sort((a, b) => b.month.localeCompare(a.month));

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
        (scope: string, scope_id: string, refs: string) =>
          getHistoryStatsInner(scope, scope_id, refs),
        ["rcpnt-history-stats"],
        { revalidate: 3600 },
      )
    : getHistoryStatsInner;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { scope, scope_id, refs = "1.a,2.a" } = req.query;

    if (!scope || !scope_id) {
      return res.status(400).json({
        error: "Both scope and scope_id parameters are required",
      });
    }

    // Only set cache headers in production
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Cache-Control", "public, s-maxage=3600");
    } else {
      res.setHeader("Cache-Control", "no-store");
    }

    const history = await getHistoryStats(scope as string, scope_id as string, refs as string);

    return res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching history stats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
