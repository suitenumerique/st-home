// @vitest-environment node
import { type PGlite } from "@electric-sql/pglite";
import { pushSchema } from "drizzle-kit/api";
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

import { db } from "@/lib/db";
import { homonymKeys } from "@/lib/domaines/homonyms";
import {
  domainOwnerQuery,
  findDomainOwner,
  findHomonym,
  homonymQuery,
} from "@/lib/organizationDomains";
import * as schema from "@/lib/schema";
import { organizations } from "@/lib/schema";
import { unaccent } from "@/lib/string";
import { type SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";

const client = (db as unknown as { $client: PGlite }).$client;

let count = 0;
async function insert(values: Partial<typeof organizations.$inferInsert>) {
  count++;
  await db.insert(organizations).values({
    siret: `siret-${count}`,
    siren: `siren-${count}`,
    slug: `slug-${count}`,
    type: "commune",
    name: `Commune ${count}`,
    name_unaccent: unaccent(values.name ?? `Commune ${count}`),
    population: 100,
    ...values,
  });
}

async function plan(query: SQL) {
  const { sql, params } = new PgDialect().sqlToQuery(query);
  await client.exec("SET enable_seqscan = off");
  const { rows } = await client.query<Record<string, string>>(`EXPLAIN ${sql}`, params);
  await client.exec("SET enable_seqscan = on");

  return rows.map((row) => row["QUERY PLAN"]).join("\n");
}

beforeAll(async () => {
  const { apply } = await pushSchema(schema, db as never);
  await apply();

  await insert({ siret: "owner-email", email_domain: "mairie-x.fr" });
  await insert({ siret: "owner-website", website_domain: "www.y.fr" });
  await insert({ siret: "owner-website-bare", website_domain: "z.fr" });
  await insert({
    siret: "epci",
    type: "epci",
    population: 50000,
    email_domain: "shared.fr",
  });
  await insert({ siret: "commune-shared", population: 10, website_domain: "www.shared.fr" });

  await insert({ name: "Saint-Denis" });
  await insert({ name: "Saint-Denis" });
  await insert({ name: "Œuilly" });
  await insert({ name: "Œuilly" });
  await insert({ name: "L'Haÿ-les-Roses" });
  await insert({ name: "Saint-Denis", type: "epci" });
  await insert({ name: "L'Isle-Adam" });
  await insert({ name: "L'Isle-Adam" });
  await insert({ name: "Ville-sur-Tourbe" });
  await insert({ name: "Ville-sur-Tourbe" });
  await insert({ name: "Ville-la-Grand" });
  await insert({ name: "La-Grand" });
  await insert({ name: "Bourg-en-Bresse" });
  await insert({ name: "Bourg-en-Bresse" });
  await insert({ name: "Villedoux" });
  await insert({ name: "Doux" });
  await insert({ name: "Doux" });
  await insert({ name: "Boisleux" });
  await insert({ name: "Boisleux" });
  await insert({ name: "Marquette-lez-Lille" });
  await insert({ name: "Marquette-lez-Lille" });
  await insert({ name: "Druillat" });
  await insert({ name: "Ruillat" });
  await insert({ name: "Ruillat" });
});

test("a domain is found by the email or the website, with or without www", async () => {
  expect(await findDomainOwner("mairie-x.fr")).toBe("owner-email");
  expect(await findDomainOwner("y.fr")).toBe("owner-website");
  expect(await findDomainOwner("z.fr")).toBe("owner-website-bare");
  expect(await findDomainOwner("unknown.fr")).toBeNull();
});

test("the commune wins over the EPCI sharing the domain, however small", async () => {
  expect(await findDomainOwner("shared.fr")).toBe("commune-shared");
});

const homonymOf = (domain: string) => findHomonym(homonymKeys(domain));

test("a name spelled the same by two communes is a homonym, however the domain spells it", async () => {
  expect(await homonymOf("saint-denis.fr")).toBe("Saint-Denis");
  expect(await homonymOf("mairie-saint-denis.fr")).toBe("Saint-Denis");
  expect(await homonymOf("st-denis.fr")).toBe("Saint-Denis");
  expect(await homonymOf("oeuilly.fr")).toBe("Œuilly");
  expect(await homonymOf("lisle-adam.fr")).toBe("L'Isle-Adam");
  expect(await homonymOf("l-isle-adam.fr")).toBe("L'Isle-Adam");
  expect(await homonymOf("lhay-les-roses.fr")).toBeNull();
  expect(await homonymOf("unknown.fr")).toBeNull();
});

test("a name written as one word, or with a prefix, is found too", async () => {
  expect(await homonymOf("bourgenbresse.fr")).toBe("Bourg-en-Bresse");
  expect(await homonymOf("mairiebourgenbresse.fr")).toBe("Bourg-en-Bresse");
  expect(await homonymOf("mairiedebourgenbresse.fr")).toBe("Bourg-en-Bresse");
  expect(await homonymOf("mairie-de-saint-denis.fr")).toBe("Saint-Denis");
  expect(await homonymOf("boisleux.fr")).toBe("Boisleux");
  expect(await homonymOf("marquette-lez-lille.fr")).toBe("Marquette-lez-Lille");
  expect(await homonymOf("marquette-les-lille.fr")).toBe("Marquette-lez-Lille");
  expect(await homonymOf("saint-denis-mairie.fr")).toBe("Saint-Denis");
});

test("a prefix that is part of the name is not stripped off the homonyms", async () => {
  expect(await homonymOf("ville-sur-tourbe.fr")).toBe("Ville-sur-Tourbe");
  expect(await homonymOf("ville-la-grand.fr")).toBeNull();
});

test("the first spelling a commune has settles it, so a name starting like a prefix is not a homonym", async () => {
  // Villedoux is one commune: "Doux", which two communes share, is not what the domain spells.
  expect(await homonymOf("villedoux.fr")).toBeNull();
  // "mairiedruillat" is Druillat (one commune), not "Ruillat" (two) behind a "mairied".
  expect(await homonymOf("mairiedruillat.fr")).toBeNull();
});

test("the domain query reads the indexes", async () => {
  const text = await plan(domainOwnerQuery("y.fr"));

  expect(text).toContain("st_organizations_email_domain");
  expect(text).toContain("st_organizations_website_domain");
  expect(text).not.toContain("Seq Scan");
});

test("the homonym query reads its index", async () => {
  expect(await plan(homonymQuery(["saintdenis", "other"]))).toContain(
    "st_organizations_name_compact",
  );
});
