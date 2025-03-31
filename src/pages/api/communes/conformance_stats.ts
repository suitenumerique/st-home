import { db } from "@/lib/db";
import { organizations } from "@/lib/schema";
import { inArray, sql } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_cache } from "next/cache";

const getConformanceStatsInner = async () => {
  // Get stats from raw SQL query since table isn't managed by drizzle
  const { rows: stats } = await db.execute<{
    issue: string;
    count: number;
    percentage: number;
    sample_with_issue: string[];
    sample_without_issue: string[];
    last_updated: Date;
  }>(sql`SELECT * FROM data_issues_stats`);

  if (!stats.length) return [];

  const allSirets = stats.flatMap((stat) => [
    ...(stat.sample_with_issue || []),
    ...(stat.sample_without_issue || []),
  ]);

  if (!allSirets.length) return stats;

  // Get organizations using Drizzle's query builder
  const orgs = await db.query.organizations.findMany({
    where: inArray(organizations.siret, allSirets),
    columns: { siret: true, name: true },
  });

  const siretToName = Object.fromEntries(
    orgs.map((org) => [org.siret, org.name]),
  );

  return stats.map((stat) => ({
    issue: stat.issue,
    count: stat.count,
    percentage: stat.percentage,
    last_updated: stat.last_updated,
    sample_with_issue: (stat.sample_with_issue || []).map((siret) => ({
      siret,
      name: siretToName[siret] || "",
    })),
    sample_without_issue: (stat.sample_without_issue || []).map((siret) => ({
      siret,
      name: siretToName[siret] || "",
    })),
  }));
};

// Only use cache in production
const getConformanceStats =
  process.env.NODE_ENV === "production"
    ? unstable_cache(getConformanceStatsInner, ["conformance-stats"], {
        revalidate: 3600,
      })
    : getConformanceStatsInner;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Only set cache headers in production
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Cache-Control", "public, s-maxage=3600");
    } else {
      res.setHeader("Cache-Control", "no-store");
    }

    const hydratedStats = await getConformanceStats();
    return res.status(200).json(hydratedStats);
  } catch (error) {
    console.error("Error fetching conformance stats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
