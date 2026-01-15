import { Commune as SearchCommuneType } from "@/components/CommuneSearch";
import { createContext, ReactNode, useContext } from "react";
import { useMapNavigation } from "../hooks/useMapNavigation";
import { CollectiviteLevel, MapState } from "../types";

interface MapContextType {
  mapState: MapState;
  setMapState: (state: MapState) => void;
  selectLevel: (
    level: CollectiviteLevel,
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
}

export const MapProvider = ({ children, initialFilters }: MapProviderProps) => {
  const mapNavigation = useMapNavigation(initialFilters);

  return (
    <MapContext.Provider value={mapNavigation}>
      {children}
    </MapContext.Provider>
  );
};
