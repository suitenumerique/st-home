import { useMemo } from "react";
import { FeatureProperties, MapState, SelectedArea } from "../types";

export const useDisplayedGeoJSON = (mapState: MapState) => {
  return useMemo(() => {
    const getEPCIGeoJSON = (geoJSON: GeoJSON.FeatureCollection | null) => {
      if (!geoJSON) return null;
      return {
        ...geoJSON,
        features: geoJSON.features.filter((feature) => {
          const props = feature.properties as FeatureProperties;
          return props.EPCI_SIREN === (mapState.selectedAreas["epci"] as SelectedArea)?.insee_geo;
        }),
      };
    };

    if (!mapState.selectedAreas[mapState.currentLevel]) return null;
    let displayedGeoJSON: GeoJSON.FeatureCollection | GeoJSON.Feature[] | null = null;

    if (mapState.currentLevel === "country") {
      displayedGeoJSON =
        (mapState.selectedAreas[mapState.currentLevel] as SelectedArea)?.geoJSON || null;
    } else if (mapState.currentLevel === "region") {
      if (mapState.regionView === "epci") {
        // Show EPCIs in the region
        displayedGeoJSON =
          (mapState.selectedAreas[mapState.currentLevel] as SelectedArea)?.geoJSONEPCI || null;
      } else if (mapState.regionView === "city") {
        // Show cities in the region
        displayedGeoJSON =
          (mapState.selectedAreas[mapState.currentLevel] as SelectedArea)?.geoJSON || null;
      } else {
        // Default: show departments
        displayedGeoJSON =
          (mapState.selectedAreas[mapState.currentLevel] as SelectedArea)?.geoJSON || null;
      }
    } else if (mapState.currentLevel === "department" && mapState.departmentView === "city") {
      displayedGeoJSON =
        (mapState.selectedAreas[mapState.currentLevel] as SelectedArea)?.geoJSON || null;
    } else if (mapState.currentLevel === "department" && mapState.departmentView === "epci") {
      displayedGeoJSON =
        (mapState.selectedAreas[mapState.currentLevel] as SelectedArea)?.geoJSONEPCI || null;
    } else if (mapState.currentLevel === "epci") {
      displayedGeoJSON = getEPCIGeoJSON(
        (mapState.selectedAreas["department"] as SelectedArea)?.geoJSON || null,
      );
    } else if (mapState.currentLevel === "city") {
      if (mapState.selectedAreas["epci"]) {
        displayedGeoJSON = getEPCIGeoJSON(
          (mapState.selectedAreas["department"] as SelectedArea)?.geoJSON || null,
        );
      } else {
        displayedGeoJSON = (mapState.selectedAreas["department"] as SelectedArea)?.geoJSON || null;
      }
    }

    return displayedGeoJSON as GeoJSON.FeatureCollection | null;
  }, [mapState.currentLevel, mapState.selectedAreas, mapState.departmentView, mapState.regionView]);
};
