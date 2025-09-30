export interface StatRecord {
  id: string;
  total: number;
  active: number;
  score: number;
  reg?: string; // Region code
  dep?: string; // Department code
  all_services?: string[]; // All services for this record
  active_services?: string[]; // Active services for this record
}

export interface AllStats {
  region: StatRecord[];
  department: StatRecord[];
  epci: StatRecord[];
  country: StatRecord[];
}
