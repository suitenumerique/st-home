import { db } from "@/lib/db";
import { organizationsInPerimeter, RPNT_ACTIONS } from "@/lib/rpntActions";
import { first, parseFilters } from "@/lib/rpntFilters";
import { sql } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

const PAGE_SIZE = 20;
const MAX_PAGE = 10000;

export type ActionsListRow = {
  siret: string;
  name: string;
  population: number | null;
  department: string | null;
};

export type ActionsListResponse = {
  total: number;
  pageSize: number;
  rows: ActionsListRow[];
};

// One page of the organizations matching an action, same filters as actions-export
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const action = RPNT_ACTIONS.find((a) => a.id === first(req.query.action));
    const parsed = parseFilters(req.query);
    const page = Number(first(req.query.page) ?? "1");
    const sort = first(req.query.sort) ?? "population";
    const order = first(req.query.order) ?? "desc";

    if (!action) {
      return res.status(400).json({ error: "Invalid action" });
    }
    if ("error" in parsed) {
      return res.status(400).json({ error: parsed.error });
    }
    if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) {
      return res.status(400).json({ error: "Invalid page" });
    }
    if (sort !== "population" && sort !== "name") {
      return res.status(400).json({ error: "Invalid sort" });
    }
    if (order !== "asc" && order !== "desc") {
      return res.status(400).json({ error: "Invalid order" });
    }
    const { dep, operator, scope } = parsed.filters;

    // sort and order are validated above, safe to inline
    const direction = sql.raw(order);
    const orderBy =
      sort === "name"
        ? sql`o.name ${direction}, o.siret`
        : sql`o.population ${direction} NULLS LAST, o.name, o.siret`;

    const { rows } = await db.execute<ActionsListRow & { total: number }>(sql`
      SELECT
        o.siret,
        o.name,
        o.population,
        o.insee_dep AS department,
        COUNT(*) OVER()::int AS total
      FROM st_organizations o
      WHERE ${organizationsInPerimeter(dep, operator, scope)}
        AND ${action.matches}
      ORDER BY ${orderBy}
      LIMIT ${PAGE_SIZE}
      OFFSET ${(page - 1) * PAGE_SIZE}
    `);

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      total: rows[0]?.total ?? 0,
      pageSize: PAGE_SIZE,
      rows: rows.map(({ total: _total, ...row }) => row),
    } satisfies ActionsListResponse);
  } catch (error) {
    console.error("Error listing RPNT action organizations:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
