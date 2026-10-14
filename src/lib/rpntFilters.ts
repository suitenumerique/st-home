import { DEFAULT_SCOPE, isScope, type Scope } from "@/lib/rpntScopes";
import type { NextApiRequest } from "next";

export const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export type RpntFilters = { dep: string; operator: string; scope: Scope };

const DEPARTMENT = /^[0-9A-Z]{2,3}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Query filters shared by the RPNT actions routes. The operator is checked against the id
// format to keep the number of distinct (cached) queries bounded.
export const parseFilters = (
  query: NextApiRequest["query"],
): { filters: RpntFilters } | { error: string } => {
  const dep = first(query.dep) ?? "";
  const operator = first(query.operator) ?? "";
  const scope = first(query.scope) ?? DEFAULT_SCOPE;

  if (dep && !DEPARTMENT.test(dep)) return { error: "Invalid dep" };
  if (operator && !UUID.test(operator)) return { error: "Invalid operator" };
  if (!isScope(scope)) return { error: "Invalid scope" };

  return { filters: { dep, operator, scope } };
};
