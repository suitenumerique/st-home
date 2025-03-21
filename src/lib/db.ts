import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import {
  mutualizationStructures,
  organizations,
  organizationsToStructures,
} from "./schema";
import { unaccent } from "./string";

function getConnectionString() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  try {
    // Parse the connection URL to handle special characters in password
    const url = new URL(dbUrl);

    // Ensure password is properly encoded
    if (url.password) {
      url.password = encodeURIComponent(url.password);
    }

    return url.toString();
  } catch (error) {
    console.error("Error parsing DATABASE_URL:", error);
    throw error;
  }
}

// Create a new pool with SSL configuration for Scalingo
const pool = new Pool({
  connectionString: getConnectionString(),
  /*ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false, // Required for Scalingo's self-signed certificates
        }
      : false,
  */
});

// Create Drizzle ORM instance
export const db = drizzle(pool, { schema });

// Export pool for direct usage if needed
export { pool };

// Helper functions for common database operations
export async function findOrganizationBySlug(slug: string) {
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);

  return organization;
}

export async function findOrganizationBySiret(siret: string) {
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.siret, siret))
    .limit(1);

  return organization;
}

export async function findOrganizationsWithStructures(siret: string) {
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.siret, siret))
    .limit(1);

  if (!organization) return null;

  const structures = await db
    .select({
      id: mutualizationStructures.id,
      name: mutualizationStructures.name,
      shortname: mutualizationStructures.shortname,
      type: mutualizationStructures.type,
      website: mutualizationStructures.website,
    })
    .from(organizationsToStructures)
    .innerJoin(
      mutualizationStructures,
      eq(organizationsToStructures.structureId, mutualizationStructures.id),
    )
    .where(eq(organizationsToStructures.organizationSiret, siret));

  return {
    ...organization,
    structures,
  };
}

export async function searchOrganizations(query: string, limit = 10) {
  const searchQuery = query.trim();

  return db
    .select({
      siret: organizations.siret,
      name: organizations.name,
      zipcode: organizations.zipcode,
      population: organizations.population,
    })
    .from(organizations)
    .where(
      or(
        sql`to_tsvector('french', ${organizations.name_unaccent}) @@ plainto_tsquery('french', ${unaccent(searchQuery)})`,
        ilike(organizations.name_unaccent, `%${unaccent(searchQuery)}%`),
        ilike(organizations.zipcode, `${searchQuery}%`),
      ),
    )
    .orderBy(desc(organizations.population))
    .limit(limit);
}

export const searchCommunes = searchOrganizations;
