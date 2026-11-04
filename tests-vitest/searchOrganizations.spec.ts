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
import { unaccent } from "@/lib/string";

const client = (db as unknown as { $client: PGlite }).$client;

const SHARED_ZIPCODE = "71000";
const SHARED_COUNT = 15;

async function insert(name: string, type: string, zipcode: string, population: number) {
  await client.query(
    `INSERT INTO st_organizations (siret, type, name, name_unaccent, zipcode, population)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [`siret-${name}`, type, name, unaccent(name), zipcode, population],
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
  await insert("Vandœuvre-lès-Nancy", "commune", "54500", 30000);
  await insert("L'Isle-Adam", "commune", "95290", 12000);
  await insert("Bourg-en-Bresse", "commune", "01000", 40000);
  await insert("Sainte-Croix", "commune", "01120", 800);
  await insert("L'Île-d'Yeu", "commune", "85350", 5000);
  await insert("Boisleux-au-Mont", "commune", "62175", 600);
  await insert("Saint-André-lez-Lille", "commune", "59350", 11000);
  await insert("Mont-de-Marsan", "commune", "40000", 31000);
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

test.each(["vandoeuvre", "Vandœuvre", "vandoeuvre les nancy"])(
  "a ligature is found when typed as %s",
  async (query) => {
    const results = await searchOrganizations(query, "commune");

    expect(results.map((result) => result.name)).toEqual(["Vandœuvre-lès-Nancy"]);
  },
);

test.each([
  "l'isle adam",
  "lisle adam",
  "isle-adam",
  "l isle adam",
  "lisleadam",
  "L'ISLE-ADAM",
  "l'ile adam",
  "ile adam",
  "L'Île-Adam",
  "lileadam",
])("an apostrophe is found when typed as %s", async (query) => {
  const results = await searchOrganizations(query, "commune");

  expect(results.map((result) => result.name)).toEqual(["L'Isle-Adam"]);
});

test.each(["bourgenbresse", "bourg en bresse", "Bourg-en-Bresse", "BOURGENBRESSE", "bourgenbre"])(
  "a name typed as one word or with spaces is found when typed as %s",
  async (query) => {
    const results = await searchOrganizations(query, "commune");

    expect(results.map((result) => result.name)).toEqual(["Bourg-en-Bresse"]);
  },
);

test.each(["isle d'yeu", "ile d'yeu", "Île d'Yeu", "isle d yeu", "L'Île-d'Yeu", "l’isle"])(
  "Isle and Ile are the same word when typed as %s",
  async (query) => {
    const results = await searchOrganizations(query, "commune");

    expect(results.map((result) => result.name)).toContain("L'Île-d'Yeu");
  },
);

test.each(["boisl", "boisleux", "Boisleux-au-Mont"])(
  "a name containing isle is still found by its start when typed as %s",
  async (query) => {
    const results = await searchOrganizations(query, "commune");

    expect(results.map((result) => result.name)).toEqual(["Boisleux-au-Mont"]);
  },
);

test.each([
  "saint andre les lille",
  "saint andre lez lille",
  "St-André-lèz-Lille",
  "st andre lez lille",
  "andre les lille",
])("lez and lès are the same word when typed as %s", async (query) => {
  const results = await searchOrganizations(query, "commune");

  expect(results.map((result) => result.name)).toEqual(["Saint-André-lez-Lille"]);
});

test.each(["mt de marsan", "Mt-de-Marsan", "Mt. de Marsan", "mont de marsan"])(
  "Mont is found when typed as %s",
  async (query) => {
    const results = await searchOrganizations(query, "commune");

    expect(results.map((result) => result.name)).toEqual(["Mont-de-Marsan"]);
  },
);

test.each(["Ste Croix", "ste-croix", "Sainte-Croix", "St.Croix"])(
  "Sainte is found when typed as %s",
  async (query) => {
    const results = await searchOrganizations(query, "commune");

    expect(results.map((result) => result.name)).toContain("Sainte-Croix");
  },
);
