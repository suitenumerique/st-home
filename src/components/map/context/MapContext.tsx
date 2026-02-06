import { Commune as SearchCommuneType } from "@/components/CommuneSearch";
import { createContext, ReactNode, useContext } from "react";
import { useMapNavigation } from "../hooks/useMapNavigation";
import { MapState } from "../types";

interface MapContextType {
  mapState: MapState;
  setMapState: (state: MapState) => void;
  selectLevel: (
    level: string | "country" | "region" | "department" | "epci" | "city",
    code: string,
    source?: string,
    departmentView?: "city" | "epci" | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatedFilters?: any,
  ) => Promise<void>;
  goBack: () => void;
  handleQuickNav: (commune: SearchCommuneType) => Promise<void>;
  previousLevel: string | null;
  nextLevel: string | null;
}

const MapContext = createContext<MapContextType | null>(null);

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapContext must be used within a MapProvider");
  }
  return context;
};

interface MapProviderProps {
  children: ReactNode;
  initialFilters?: Record<string, unknown>;
  initialDepartmentView?: "city" | "epci";
}

export const MapProvider = ({
  children,
  initialFilters,
  initialDepartmentView,
}: MapProviderProps) => {
  const mapNavigation = useMapNavigation(initialFilters, initialDepartmentView);

  // @ts-expect-error to be checked
  return <MapContext.Provider value={mapNavigation}>{children}</MapContext.Provider>;
};
