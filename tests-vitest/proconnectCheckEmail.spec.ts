// @vitest-environment node
import { pushSchema } from "drizzle-kit/api";
import { type NextApiRequest, type NextApiResponse } from "next";
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
import * as schema from "@/lib/schema";
import { operators, organizations, organizationsToOperators } from "@/lib/schema";
import { unaccent } from "@/lib/string";
import handler from "@/pages/api/proconnect/check-email";

async function check(body: Record<string, string>) {
  let json: unknown;
  const res = {
    setHeader: () => res,
    status: () => res,
    json: (value: unknown) => {
      json = value;
      return res;
    },
  };
  await handler({ method: "POST", body } as NextApiRequest, res as unknown as NextApiResponse);

  return json;
}

const providerOf = async (siret: string) =>
  ((await check({ email: "agent@gmail.com", siret })) as { provider: string }).provider;

async function addOrganization(
  siret: string,
  perimetre: string[],
  adherent: string[] = [],
  overrides: Partial<typeof organizations.$inferInsert> = {},
) {
  await db.insert(organizations).values({
    siret,
    siren: siret,
    slug: siret,
    type: "commune",
    name: siret,
    name_unaccent: unaccent(siret),
    population: 100,
    email_domain: `${siret}.fr`,
    ...overrides,
  });
  const links = [
    ...perimetre.map((operatorId) => ({
      organizationSiret: siret,
      operatorId,
      isPerimetre: true,
    })),
    ...adherent.map((operatorId) => ({
      organizationSiret: siret,
      operatorId,
      isAdherent: true,
    })),
  ];
  if (links.length > 0) await db.insert(organizationsToOperators).values(links);
}

beforeAll(async () => {
  const { apply } = await pushSchema(schema, db as never);
  await apply();

  // None of them has a ProConnect service: the OPSN is named all the same.
  const operator = (id: string, name: string, status: string, departments: string[]) => ({
    id,
    name,
    name_unaccent: unaccent(name),
    type: "operator",
    status,
    departments,
  });
  await db
    .insert(operators)
    .values([
      operator("local", "Syndicat local", "partenaire", ["58"]),
      operator("wide", "Syndicat large", "partenaire", ["58", "21", "39", "70"]),
      operator("full", "Syndicat complet", "partenaire_avec_services", ["33", "34"]),
      operator("narrow", "Syndicat étroit", "intention", ["33"]),
      operator("elsewhere", "Syndicat ailleurs", "partenaire", ["01"]),
    ]);

  await addOrganization("in-58", ["local", "wide"]);
  await addOrganization("in-21", ["wide"]);
  await addOrganization("in-33", ["narrow", "full"]);
  await addOrganization("adherent-only", [], ["elsewhere"]);
  await addOrganization("adherent-elsewhere", ["wide"], ["elsewhere"]);
  await addOrganization("alone", []);
  await addOrganization("official-commune", ["wide"], [], {
    email_domain: "orange.fr",
    email_official: "Mairie.Brigny@Orange.fr",
  });
  await addOrganization("official-epci", ["local"], [], {
    type: "epci",
    population: 50000,
    email_domain: "orange.fr",
    email_official: "mairie.brigny@orange.fr",
  });
});

test("the provider is the OPSN covering the département, by its name", async () => {
  expect(await providerOf("in-21")).toBe("Syndicat large");
});

test("the OPSN covering the fewest départements comes first, as on /bienvenue", async () => {
  expect(await providerOf("in-58")).toBe("Syndicat local");
});

test("an OPSN with services comes before the ones without, as on /bienvenue", async () => {
  expect(await providerOf("in-33")).toBe("Syndicat complet");
});

test("an adherent is not served by the OPSN it adheres to", async () => {
  expect(await providerOf("adherent-only")).toBe("ANCT");
  expect(await providerOf("adherent-elsewhere")).toBe("Syndicat large");
});

test("a collectivité with no OPSN is served by the ANCT", async () => {
  expect(await providerOf("alone")).toBe("ANCT");
});

test("an address on the declared domain gets the OPSN of the département", async () => {
  expect(await check({ email: "agent@in-58.fr" })).toEqual({
    kind: "compliant",
    provider: "Syndicat local",
    siret: "in-58",
  });
});

test("the official address of a commune is recognized on a generic domain, whatever its case", async () => {
  const expected = {
    kind: "official",
    domain: "orange.fr",
    siret: "official-commune",
    organizationName: "official-commune",
    provider: "Syndicat large",
  };

  expect(await check({ email: "mairie.brigny@orange.fr" })).toEqual(expected);
  expect(await check({ email: " MAIRIE.BRIGNY@ORANGE.FR " })).toEqual(expected);
});

test("a collectivité picked by hand comes back with its siret", async () => {
  expect(await check({ email: "agent@gmail.com", siret: "in-21" })).toMatchObject({
    kind: "generic",
    siret: "in-21",
  });
});

test("another address on the generic domain stays unknown", async () => {
  expect(await check({ email: "someone.else@orange.fr" })).toEqual({ kind: "unknown" });
  expect(await check({ email: "mairie.brigny@wanadoo.fr" })).toEqual({ kind: "unknown" });
});
