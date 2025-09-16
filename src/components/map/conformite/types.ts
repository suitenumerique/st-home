export interface StatRecord {
  ref: string;
  valid: number;
  total: number;
}

export interface AllStats {
  region: Record<string, StatRecord[]>;
  department: Record<string, StatRecord[]>;
  epci: Record<string, StatRecord[]>;
  country: Record<string, StatRecord[]>;
}
