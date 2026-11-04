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
import {
  domainOwnerQuery,
  findDomainOwner,
  findHomonym,
  homonymQuery,
} from "@/lib/organizationDomains";
import * as schema from "@/lib/schema";
import { organizations } from "@/lib/schema";
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
    name_unaccent: `commune ${count}`,
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
  await insert({ name: "Ville-sur-Tourbe" });
  await insert({ name: "Ville-sur-Tourbe" });
  await insert({ name: "Ville-la-Grand" });
  await insert({ name: "La-Grand" });
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

test("a name spelled the same by two communes is a homonym, accents and separators aside", async () => {
  expect(await findHomonym(["saintdenis"])).toBe("Saint-Denis");
  expect(await findHomonym(["oeuilly"])).toBe("Œuilly");
  expect(await findHomonym(["lhaylesroses"])).toBeNull();
  expect(await findHomonym(["unknown"])).toBeNull();
});

test("a prefix that is part of the name is not stripped off the homonyms", async () => {
  expect(await findHomonym(["villesurtourbe", "surtourbe"])).toBe("Ville-sur-Tourbe");
  expect(await findHomonym(["villelagrand", "lagrand"])).toBeNull();
});

test("the domain query reads the indexes", async () => {
  const text = await plan(domainOwnerQuery("y.fr"));

  expect(text).toContain("st_organizations_email_domain");
  expect(text).toContain("st_organizations_website_domain");
  expect(text).not.toContain("Seq Scan");
});

test("the homonym query reads its index", async () => {
  expect(await plan(homonymQuery(["saintdenis", "other"]))).toContain(
    "st_organizations_commune_name_key",
  );
});
