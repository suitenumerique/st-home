import { db } from "@/lib/db";
import { organizationsToServices } from "@/lib/schema";
import { sql } from "drizzle-orm";

/**
 * Number of collectivités that have adopted a service, from the same table the
 * deployment map reads. Counts every organisation linked to the service, active
 * or not — "l'ont déjà adopté", not "l'utilisent aujourd'hui".
 *
 * Server-side only: import it from `getStaticProps`, never from a component.
 * Returns null rather than throwing, so a database that is unreachable at build
 * time costs the count, not the build.
 */
export async function countAdoptingOrganizations(serviceId: number): Promise<number | null> {
  try {
    const { rows } = await db.execute(sql`
      SELECT COUNT(DISTINCT ${organizationsToServices.organizationSiret})::int AS count
      FROM ${organizationsToServices}
      WHERE ${organizationsToServices.serviceId} = ${serviceId}
    `);

    const count = rows[0]?.count;

    return typeof count === "number" ? count : null;
  } catch (error) {
    console.error(`Could not count the collectivités using service ${serviceId}:`, error);
    return null;
  }
}
