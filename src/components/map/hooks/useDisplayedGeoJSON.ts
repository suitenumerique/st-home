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
      // Hidden feature: show cities if regionView is "city"
      if (mapState.regionView === "city") {
        // The geoJSON at region level contains departments, not cities
        // We need to show cities, which are loaded separately in selectedAreas.region.cities
        // For now, return the region geoJSON (departments) as fallback
        // TODO: You might want to load actual city GeoJSON data here
        displayedGeoJSON =
          (mapState.selectedAreas[mapState.currentLevel] as SelectedArea)?.geoJSON || null;
      } else {
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
