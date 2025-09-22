export interface StatRecord {
  id: string;
  total: number;
  active: number;
  score: number;
}

export interface AllStats {
  region: StatRecord[];
  department: StatRecord[];
  epci: StatRecord[];
  country: StatRecord[];
}
