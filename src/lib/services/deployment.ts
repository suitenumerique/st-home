import { getServiceConfig } from "@/components/map/features/deploiement/servicesConfig";
import { db } from "@/lib/db";
import { organizations, organizationsToServices } from "@/lib/schema";
import { sql } from "drizzle-orm";

// The ANCT thresholds, as the deployment map applies them in
// `passesPopulationCheckStat`: a collectivité above them is expected to run the
// service itself, so it is not counted as an adopter.
const ANCT_THRESHOLDS: Record<string, number> = { commune: 3500, epci: 15000 };

/**
 * Number of collectivités that have adopted a service, counted by the rules the
 * deployment map applies to the same table, so that this figure and the one the
 * map shows agree. Counts every organisation linked to the service, active or
 * not — "l'ont déjà adopté", not "l'utilisent aujourd'hui" — but leaves out the
 * ones above the ANCT thresholds when the service enforces them.
 *
 * Server-side only: import it from `getStaticProps`, never from a component.
 * Returns null rather than throwing, so a database that is unreachable at build
 * time costs the count, not the build.
 */
export async function countAdoptingOrganizations(serviceId: number): Promise<number | null> {
  // Only some services enforce the thresholds; for the others the map counts
  // every adopter, whatever its population.
  const enforcesThresholds = getServiceConfig({ id: serviceId })?.anct_threshold_active ?? false;

  // A missing population passes, as it does on the map, and so does a type the
  // thresholds say nothing about.
  const withinThresholds = sql`
    ${organizations.population} IS NULL
    OR ${organizations.type} NOT IN (${sql.join(
      Object.keys(ANCT_THRESHOLDS).map((type) => sql`${type}`),
      sql`, `,
    )})
    OR ${sql.join(
      Object.entries(ANCT_THRESHOLDS).map(
        ([type, threshold]) =>
          sql`(${organizations.type} = ${type} AND ${organizations.population} < ${threshold})`,
      ),
      sql` OR `,
    )}
  `;

  try {
    const { rows } = await db.execute(sql`
      SELECT COUNT(DISTINCT ${organizationsToServices.organizationSiret})::int AS count
      FROM ${organizationsToServices}
      INNER JOIN ${organizations}
        ON ${organizations.siret} = ${organizationsToServices.organizationSiret}
      WHERE ${organizationsToServices.serviceId} = ${serviceId}
      ${enforcesThresholds ? sql`AND (${withinThresholds})` : sql``}
    `);

    const count = rows[0]?.count;

    return typeof count === "number" ? count : null;
  } catch (error) {
    console.error(`Could not count the collectivités using service ${serviceId}:`, error);
    return null;
  }
}
