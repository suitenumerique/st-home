import { db } from "@/lib/db";
import {
  ESSENTIAL_REFS,
  listedOperator,
  operatorLink,
  organizationsInPerimeter,
  RPNT_ACTIONS,
} from "@/lib/rpntActions";
import { parseFilters, type RpntFilters } from "@/lib/rpntFilters";
import { sql } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_cache } from "next/cache";

export type ActionsGroup = {
  id: string;
  name: string | null;
  total: number;
  conformant: number;
  uncovered: number;
  counts: Record<string, number>;
};

export type ActionsResponse = {
  actions: {
    id: string;
    title: string;
    description: string;
    criteria: string[];
    helpUrl?: string;
  }[];
  // One group per département
  groups: ActionsGroup[];
  // Partner OPSN breakdown; empty when filtering on one OPSN
  operators: ActionsGroup[];
};

const getActionsInner = async ({ dep, operator, scope }: RpntFilters): Promise<ActionsResponse> => {
  const essential = sql`COALESCE(o.rcpnt @> ARRAY[${sql.join(
    ESSENTIAL_REFS.map((ref) => sql`${ref}`),
    sql`, `,
  )}]::text[], false)`;

  const anyAction = sql.join(
    RPNT_ACTIONS.map((action) => action.matches),
    sql` OR `,
  );

  const actionColumns = sql.join(
    RPNT_ACTIONS.map(
      (action, i) =>
        sql`COUNT(*) FILTER (WHERE ${action.matches})::int AS ${sql.identifier(`a${i}`)}`,
    ),
    sql`, `,
  );

  const statColumns = sql`
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE ${essential})::int AS conformant,
      COUNT(*) FILTER (WHERE NOT ${essential} AND NOT (${anyAction}))::int AS uncovered,
      ${actionColumns}`;

  const { rows } = await db.execute<Record<string, string | number | null>>(sql`
    SELECT
      o.insee_dep AS id,
      NULL AS name,
      ${statColumns}
    FROM st_organizations o
    WHERE ${organizationsInPerimeter(dep, operator, scope)}
    GROUP BY 1
    ORDER BY 1
  `);

  const { rows: operatorRows } = operator
    ? { rows: [] }
    : await db.execute<Record<string, string | number | null>>(sql`
        SELECT
          op.id AS id,
          op.name AS name,
          ${statColumns}
        FROM st_organizations o
        JOIN st_organizations_to_operators oo
          ON oo.organization_siret = o.siret AND ${operatorLink(scope)}
        JOIN st_operators op ON op.id = oo.operator_id
        WHERE ${organizationsInPerimeter(dep, "", scope)}
          AND ${listedOperator}
        GROUP BY op.id, op.name
        ORDER BY op.name
      `);

  const toGroup = (row: Record<string, string | number | null>): ActionsGroup => ({
    id: String(row.id),
    name: row.name === null ? null : String(row.name),
    total: Number(row.total),
    conformant: Number(row.conformant),
    uncovered: Number(row.uncovered),
    counts: Object.fromEntries(RPNT_ACTIONS.map((action, i) => [action.id, Number(row[`a${i}`])])),
  });

  return {
    actions: RPNT_ACTIONS.map(({ id, title, description, criteria, helpUrl }) => ({
      id,
      title,
      description,
      criteria,
      helpUrl,
    })),
    groups: rows.map(toGroup),
    operators: operatorRows.map(toGroup),
  };
};

// Only use cache in production
const getActions =
  process.env.NODE_ENV === "production"
    ? unstable_cache(getActionsInner, ["rcpnt-actions"], { revalidate: 3600 })
    : getActionsInner;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const parsed = parseFilters(req.query);
    if ("error" in parsed) {
      return res.status(400).json({ error: parsed.error });
    }

    if (process.env.NODE_ENV === "production") {
      res.setHeader("Cache-Control", "public, s-maxage=3600");
    } else {
      res.setHeader("Cache-Control", "no-store");
    }

    return res.status(200).json(await getActions(parsed.filters));
  } catch (error) {
    console.error("Error fetching RPNT actions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
