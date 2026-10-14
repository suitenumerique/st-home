import { db } from "@/lib/db";
import { listedOperator, organizationsInPerimeter, RPNT_ACTIONS } from "@/lib/rpntActions";
import { first, parseFilters } from "@/lib/rpntFilters";
import { stringify as csvStringify } from "csv-stringify";
import { sql } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

// Same columns as the daily DPNT open data file
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const action = RPNT_ACTIONS.find((a) => a.id === first(req.query.action));
    const parsed = parseFilters(req.query);

    if (!action) {
      return res.status(400).json({ error: "Invalid action" });
    }
    if ("error" in parsed) {
      return res.status(400).json({ error: parsed.error });
    }
    const { dep, operator, scope } = parsed.filters;

    const { rows } = await db.execute<Record<string, string | number | string[] | null>>(sql`
      SELECT
        o.type,
        o.siret,
        o.siren,
        o.name AS libelle,
        o.population,
        o.insee_geo AS code_insee,
        o.zipcode AS code_postal,
        o.epci_name AS epci_libelle,
        o.epci_siren,
        o.epci_siret,
        o.epci_population,
        o.insee_dep AS departement_code_insee,
        o.dep_siret AS departement_siret,
        o.insee_reg AS region_code_insee,
        o.region_siret,
        o.email_official AS adresse_messagerie,
        o.website_url AS site_internet,
        o.phone AS telephone,
        o.rcpnt AS rpnt,
        o.service_public_url,
        (
          SELECT string_agg(op.name, ',' ORDER BY op.name)
          FROM st_organizations_to_operators oo
          JOIN st_operators op ON op.id = oo.operator_id
          WHERE oo.organization_siret = o.siret
            AND oo.is_adherent
            AND ${listedOperator}
        ) AS opsn
      FROM st_organizations o
      WHERE ${organizationsInPerimeter(dep, operator, scope)}
        AND ${action.matches}
      ORDER BY o.type, o.insee_dep, o.name
    `);

    const csvRows = rows.map((row) => ({
      ...row,
      rpnt: Array.isArray(row.rpnt) ? row.rpnt.join(",") : "",
    }));

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="rpnt-action-${action.id}.csv"`);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(csvStringify(csvRows, { header: true, delimiter: ";" }));
  } catch (error) {
    console.error("Error exporting RPNT action organizations:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
