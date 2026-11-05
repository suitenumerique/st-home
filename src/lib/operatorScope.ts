type OperatorScope = {
  departments?: string[] | null;
  /** The départements spanned by the EPCIs of the OPSN, as given by /api/deployment/operators. */
  epci_departments?: string[] | null;
};

/** Every département an OPSN is present in, through its départements or its EPCIs. */
export function operatorDepartments(operator: OperatorScope): string[] {
  return [...new Set([...(operator.departments ?? []), ...(operator.epci_departments ?? [])])];
}
