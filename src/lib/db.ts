import { and, asc, desc, eq, inArray, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { Commune } from "./schema";
import * as schema from "./schema";
import {
  operators,
  organizations,
  organizationsToOperators,
  organizationsToServices,
  services,
  servicesToOperators,
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

export async function findOrganizationBySiren(siren: string) {
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.siren, siren))
    .limit(1);

  return organization;
}

export async function findOrganizationsWithOperators(siret: string): Promise<Commune | null> {
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.siret, siret))
    .limit(1);

  if (!organization) return null;

  const orgOperators = await db
    .select({
      id: operators.id,
      name: operators.name,
      shortname: operators.shortname,
      name_with_article: operators.name_with_article,
      type: operators.type,
      website: operators.website,
      status: operators.status,
      isPerimetre: organizationsToOperators.isPerimetre,
      isAdherent: organizationsToOperators.isAdherent,
    })
    .from(organizationsToOperators)
    .innerJoin(operators, eq(organizationsToOperators.operatorId, operators.id))
    .where(eq(organizationsToOperators.organizationSiret, siret));

  return {
    ...organization,
    operators: orgOperators,
  };
}

export async function findOrganizationServicesBySiret(siret: string) {
  const services = await db
    .select({
      id: organizationsToServices.serviceId,
    })
    .from(organizationsToServices)
    .where(eq(organizationsToServices.organizationSiret, siret));

  return services;
}

export async function searchOrganizations(query: string, type: string, limit = 10) {
  const searchQuery = query.trim();

  const baseQuery = db
    .select({
      siret: organizations.siret,
      name: organizations.name,
      type: organizations.type,
      zipcode: organizations.zipcode,
      insee_geo: organizations.insee_geo,
      insee_dep: organizations.insee_dep,
      insee_reg: organizations.insee_reg,
      population: organizations.population,
    })
    .from(organizations)
    .orderBy(desc(organizations.population))
    .limit(limit);

  const addWhere = [];
  if (type !== "all") {
    addWhere.push(eq(organizations.type, type));
  }

  const whereSearches = [
    like(organizations.zipcode, `${searchQuery}%`),
    like(organizations.name_unaccent, `${unaccent(searchQuery)}%`),
    like(organizations.name_unaccent, `%${unaccent(searchQuery)}%`),
    sql`to_tsvector('french', ${organizations.name_unaccent}) @@ plainto_tsquery('french', ${unaccent(searchQuery)})`,
  ];

  // Do all searches sequentially, then concatenate the results and filter by unique siret
  const allResults = [];
  for (const whereSearch of whereSearches) {
    const results = await baseQuery.where(and(...addWhere, whereSearch));
    allResults.push(...results);
  }

  const uniqueResults = allResults.filter(
    (result, index, self) => index === self.findIndex((t) => t.siret === result.siret),
  );
  return uniqueResults;
}

// Service types where only the first (lowest ID) should be kept
const DEDUPLICATED_SERVICE_TYPES = ["proconnect", "messages", "drive", "meet", "esd"];

export async function findAllServices() {
  const allServices = await db
    .select()
    .from(services)
    .orderBy(desc(services.name), asc(services.id));

  // For deduplicated types, keep only the first occurrence (lowest ID)
  const seenTypes = new Set<string>();
  const filtered = allServices.filter((s) => {
    if (s.type && DEDUPLICATED_SERVICE_TYPES.includes(s.type)) {
      if (seenTypes.has(s.type)) return false;
      seenTypes.add(s.type);
    }
    return true;
  });

  // ProConnect always first
  filtered.sort((a, b) => {
    if (a.type === "proconnect" && b.type !== "proconnect") return -1;
    if (a.type !== "proconnect" && b.type === "proconnect") return 1;
    return 0;
  });

  return filtered;
}

export const searchCommunes = searchOrganizations;

// Function to find a single operator by its ID
export async function findOperatorById(id: string) {
  const [operator] = await db.select().from(operators).where(eq(operators.id, id)).limit(1);

  return operator;
}

export async function findServicesByOperatorIds(operatorIds: string[]) {
  if (operatorIds.length === 0) return [];

  const results = await db
    .select({
      service: services,
      operatorId: servicesToOperators.operatorId,
    })
    .from(servicesToOperators)
    .innerJoin(services, eq(servicesToOperators.serviceId, services.id))
    .where(inArray(servicesToOperators.operatorId, operatorIds))
    .orderBy(servicesToOperators.operatorId, servicesToOperators.position);

  return results;
}
