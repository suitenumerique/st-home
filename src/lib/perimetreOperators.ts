/** Status of an OPSN already offering the services, the others being on their way to. */
export const WITH_SERVICES_STATUS = "partenaire_avec_services";

type PerimetreOperator = {
  id: string;
  status: string | null;
  departments: string[] | null;
  epcis?: string[] | null;
  isPerimetre: boolean | null;
};

/**
 * The OPSNs covering a collectivité, through its département or its EPCI, as
 * /bienvenue/[siret] proposes them: the ones with services first, then those
 * without. Within each group the ones scoped to EPCIs come first, then the
 * narrowest perimeter, then by id.
 *
 * The single source for every page naming the OPSN of a collectivité, so they
 * cannot disagree.
 */
export function splitPerimetreOperators<T extends PerimetreOperator>(operators: T[]) {
  const sorted = operators
    .filter((op) => op.isPerimetre)
    .sort((a, b) => {
      const epcis = Number(!a.epcis?.length) - Number(!b.epcis?.length);
      if (epcis !== 0) return epcis;

      const departments = (a.departments?.length ?? 0) - (b.departments?.length ?? 0);
      if (departments !== 0) return departments;

      return a.id.localeCompare(b.id);
    });

  return {
    withServices: sorted.filter((op) => op.status === WITH_SERVICES_STATUS),
    withoutServices: sorted.filter((op) => op.status === "intention" || op.status === "partenaire"),
  };
}

/** The first OPSN proposed to the collectivité, if any. */
export function firstPerimetreOperator<T extends PerimetreOperator>(operators: T[]): T | null {
  const { withServices, withoutServices } = splitPerimetreOperators(operators);

  return withServices[0] ?? withoutServices[0] ?? null;
}
