import { Commune } from "@/lib/onboarding";
import L from "leaflet";

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

export interface AreaStats {
  score?: number | null;
  n_cities?: number | null;
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
  filters: {
    service_id: number | null;
    service_ids: number[] | null;
    rcpnt_ref: string | null;
  };
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
