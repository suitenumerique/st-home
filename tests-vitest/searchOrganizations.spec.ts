// @vitest-environment node
import { type PGlite } from "@electric-sql/pglite";
import { beforeAll, expect, test, vi } from "vitest";

vi.hoisted(() => {
  process.env.DATABASE_URL = "postgres://unused/unused";
});

vi.mock("pg", () => ({ Pool: class {} }));

// The real queries, run by an in-process Postgres instead of the application's pool.
vi.mock("drizzle-orm/node-postgres", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const schema = await import("@/lib/schema");

  return { drizzle: () => drizzle(new PGlite(), { schema }) };
});

import { db, searchOrganizations } from "@/lib/db";

const client = (db as unknown as { $client: PGlite }).$client;

const SHARED_ZIPCODE = "71000";
const SHARED_COUNT = 15;

async function insert(name: string, type: string, zipcode: string, population: number) {
  await client.query(
    `INSERT INTO st_organizations (siret, type, name, name_unaccent, zipcode, population)
     VALUES ($1, $2, $3, $3, $4, $5)`,
    [`siret-${name}`, type, name, zipcode, population],
  );
}

beforeAll(async () => {
  await client.exec(`
    CREATE TABLE st_organizations (
      siret text PRIMARY KEY,
      type text NOT NULL,
      name text NOT NULL,
      name_unaccent text NOT NULL,
      zipcode text,
      insee_geo text,
      insee_dep text,
      insee_reg text,
      population integer NOT NULL
    )
  `);

  for (let i = 0; i < SHARED_COUNT; i++) {
    await insert(`hameau ${i}`, "commune", SHARED_ZIPCODE, 100 + i);
  }
  await insert("epci du meme code", "epci", SHARED_ZIPCODE, 50000);
  await insert("hameau voisin", "commune", "71001", 900);
});

test("every collectivité sharing an exact zip code is returned, not just the first ten", async () => {
  const results = await searchOrganizations(SHARED_ZIPCODE, "all");

  expect(results).toHaveLength(SHARED_COUNT + 1);
  expect(results.every((result) => result.zipcode === SHARED_ZIPCODE)).toBe(true);
});

test("the exact zip code results follow the type filter", async () => {
  const results = await searchOrganizations(SHARED_ZIPCODE, "commune");

  expect(results).toHaveLength(SHARED_COUNT);
  expect(results.every((result) => result.type === "commune")).toBe(true);
});

test("a partial zip code is still limited", async () => {
  const results = await searchOrganizations("710", "commune");

  expect(results).toHaveLength(10);
});
