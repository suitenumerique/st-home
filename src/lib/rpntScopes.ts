// OPSN statuses offered as filter and breakdown on the RPNT actions page
export const OPERATOR_STATUSES = ["partenaire", "partenaire_avec_services", "intention"];

// Its adherents are not tied to a territory
export const EXCLUDED_OPERATOR_NAMES = ["ANCT"];

// Types of organizations the RPNT actions page can be restricted to
export const SCOPE_LABELS = {
  all: "Toutes",
  communes: "Communes",
  "communes-3500": "Communes de moins de 3 500 habitants",
  epcis: "EPCI",
  "epcis-15000": "EPCI de moins de 15 000 habitants",
  // Communes and EPCI adherent to the chosen OPSN (or to any OPSN), instead of in its périmètre
  adherents: "Adhérentes de l'OPSN",
};

export type Scope = keyof typeof SCOPE_LABELS;

export const DEFAULT_SCOPE: Scope = "all";

export const isScope = (value: string): value is Scope => value in SCOPE_LABELS;
