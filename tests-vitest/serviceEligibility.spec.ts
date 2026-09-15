import { eligibilityOf, type Operator } from "@/components/services/ServiceEligibility";
import { expect, test } from "vitest";

// The hero block of a service page must give the same answer as
// /bienvenue/[siret]: an OPSN in the périmètre wins over the ANCT fallback and
// over the self-hosting thresholds, whatever its partnership status.

const operator = (overrides: Partial<Operator> = {}): Operator => ({
  id: "op-1",
  name: "Syndicat",
  shortname: "SIEA",
  name_with_article: "le SIEA",
  status: "partenaire_avec_services",
  departments: ["01"],
  isPerimetre: true,
  ...overrides,
});

const commune = (population: number, operators: Operator[]) => ({
  siret: "21010001200017",
  type: "commune",
  population,
  operators,
});

test("an OPSN already offering the services is recommended", () => {
  expect(eligibilityOf(commune(859, [operator()]))).toEqual({
    kind: "operator",
    operator: operator(),
  });
});

test.each(["partenaire", "intention"])(
  "an OPSN with status %s is recommended, not the ANCT",
  (status) => {
    expect(eligibilityOf(commune(859, [operator({ status })]))).toEqual({
      kind: "operator-soon",
      operator: operator({ status }),
    });
  },
);

test("the ANCT is the fallback when no OPSN covers the collectivité", () => {
  // The ANCT itself is attached to every collectivité, outside their périmètre.
  const anct = operator({ id: "anct", name_with_article: "l’ANCT", isPerimetre: false });

  expect(eligibilityOf(commune(859, [anct]))).toEqual({ kind: "anct" });
});

test("an operator outside its own périmètre is ignored", () => {
  expect(eligibilityOf(commune(859, [operator({ isPerimetre: false })]))).toEqual({ kind: "anct" });
});

test("an operator with no partnership status is ignored", () => {
  expect(eligibilityOf(commune(859, [operator({ status: null })]))).toEqual({ kind: "anct" });
});

test("self-hosting is offered above the thresholds, but only without an OPSN", () => {
  expect(eligibilityOf(commune(3500, []))).toEqual({ kind: "self-hosted" });
  expect(eligibilityOf(commune(3499, []))).toEqual({ kind: "anct" });

  expect(eligibilityOf(commune(3500, [operator()]))).toEqual({
    kind: "operator",
    operator: operator(),
  });
  expect(eligibilityOf(commune(3500, [operator({ status: "intention" })]))).toEqual({
    kind: "operator-soon",
    operator: operator({ status: "intention" }),
  });
});

test("the epci threshold applies to epcis, and no threshold to the other types", () => {
  const epci = { siret: "200000172", type: "epci", population: 15000, operators: [] };

  expect(eligibilityOf(epci)).toEqual({ kind: "self-hosted" });
  expect(eligibilityOf({ ...epci, population: 14999 })).toEqual({ kind: "anct" });
  expect(eligibilityOf({ ...epci, type: "departement", population: 500000 })).toEqual({
    kind: "anct",
  });
});

test("the narrowest OPSN wins, then the one already offering the services", () => {
  const regional = operator({ id: "a-regional", departments: ["01", "38", "69"] });
  const local = operator({ id: "z-local", status: "intention", departments: ["01"] });

  expect(eligibilityOf(commune(859, [regional, local])).kind).toBe("operator-soon");
  expect(
    (eligibilityOf(commune(859, [regional, local])) as { operator: Operator }).operator.id,
  ).toBe("z-local");

  const sameScope = operator({ id: "a-soon", status: "intention" });
  const withServices = operator({ id: "z-services" });

  expect(
    (eligibilityOf(commune(859, [sameScope, withServices])) as { operator: Operator }).operator.id,
  ).toBe("z-services");
});
