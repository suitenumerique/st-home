export interface StatRecord {
  ref: string;
  valid: number;
  total: number;
}

export interface AllStats {
  region: Record<string, StatRecord[]>;
  department: Record<string, StatRecord[]>;
  epci: Record<string, StatRecord[]>;
}

export interface HistoryMonth {
  month: string;
  total: number;
  refs: Array<{ ref: string; valid: number }>;
}

export interface HistoryData {
  scope: string;
  scope_id: string;
  months: HistoryMonth[];
}
