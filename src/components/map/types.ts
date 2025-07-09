import { Commune } from "@/lib/onboarding";
import L from "leaflet";

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

export interface SearchCommune {
  siret: string;
  name: string;
  insee_geo?: string;
  zipcode?: string;
  type: "commune" | "epci";
  population: number;
}

export interface ParentArea {
  insee_geo: string;
  name: string;
  type: string;
  insee_reg?: string;
  insee_dep?: string;
  epci_siren?: string;
}

export interface ConformityStats {
  score: number;
  n_cities?: number;
  details?: {
    "0": number;
    "1"?: number;
    "2"?: number;
  };
}

export interface SelectedArea {
  insee_geo: string;
  name: string;
  type?: string;
  insee_reg?: string;
  insee_dep?: string;
  conformityStats?: ConformityStats;
  cities?: Commune[];
  geoJSON?: GeoJSON.FeatureCollection;
  geoJSONEPCI?: GeoJSON.Feature[];
}

export interface MapState {
  currentLevel: string;
  selectedAreas: {
    [key: string]: SelectedArea | Commune | null;
  };
  departmentView: "city" | "epci";
  selectedRef: string | null;
}

export interface FeatureProperties {
  NAME: string;
  TYPE: string;
  INSEE_GEO: string;
  INSEE_REG?: string;
  INSEE_DEP?: string;
  EPCI_SIREN?: string;
  SCORE: number | null;
}

export interface MapViewHandlerProps {
  bounds: L.LatLngBounds | null;
}
