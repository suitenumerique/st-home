import { ReactNode } from "react";

export interface StatItem {
  value: string;
  title: string;
  content: ReactNode;
}

export interface Commune {
  siret: string;
  name: string;
  insee_geo?: string;
  zipcode?: string;
  population: number;
}
