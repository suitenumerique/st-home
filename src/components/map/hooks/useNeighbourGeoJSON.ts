import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import parentAreas from "../../../../public/parent_areas.json";
import { MapState, ParentArea, SelectedArea } from "../types";

/**
 * Returns GeoJSON for the "neighbour" layer:
 * - At region level: all other regions. Used to display
 *   surrounding context and allow switching region by clicking on a grey region.
 * - At department/epci/city level: all departments of France, to show department
 *   boundaries as context (fetched once and cached).
 */
export const useNeighbourGeoJSON = (mapState: MapState) => {
  const [allDepartmentsGeoJSON, setAllDepartmentsGeoJSON] =
    useState<GeoJSON.FeatureCollection | null>(null);
  const fetchedRef = useRef(false);

  const regionLevelGeoJSON = useMemo(() => {
    if (mapState.currentLevel !== "region") return null;
    const country = mapState.selectedAreas.country as SelectedArea | null | undefined;
    const region = mapState.selectedAreas.region as SelectedArea | null | undefined;
    if (!country?.geoJSON || !region?.insee_geo) return null;

    const features = country.geoJSON.features.filter(
      (f) => (f.properties as { INSEE_GEO?: string })?.INSEE_GEO !== region.insee_geo,
    );
    if (features.length === 0) return null;
    return { type: "FeatureCollection" as const, features };
  }, [mapState.currentLevel, mapState.selectedAreas.country, mapState.selectedAreas.region]);

  const fetchAllDepartments = useCallback(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    const regionCodes = [
      ...new Set(
        (parentAreas as ParentArea[])
          .filter((a) => a.type === "department")
          .map((a) => a.insee_reg),
      ),
    ].filter(Boolean) as string[];

    Promise.all(
      regionCodes.map((r) =>
        fetch(`/geojson/departements_par_region/${r.replace("r", "")}.json`).then((res) =>
          res.json(),
        ),
      ),
    )
      .then((arrays) => {
        const features = arrays.flatMap((geo: GeoJSON.FeatureCollection) => geo.features || []);
        setAllDepartmentsGeoJSON({ type: "FeatureCollection", features });
      })
      .catch(() => {
        fetchedRef.current = false;
      });
  }, []);

  useEffect(() => {
    if (["department", "epci", "city"].includes(mapState.currentLevel)) {
      fetchAllDepartments();
    }
  }, [mapState.currentLevel, fetchAllDepartments]);

  return useMemo(() => {
    if (mapState.currentLevel === "region") return regionLevelGeoJSON;
    if (["department", "epci", "city"].includes(mapState.currentLevel)) {
      return allDepartmentsGeoJSON;
    }
    return null;
  }, [mapState.currentLevel, regionLevelGeoJSON, allDepartmentsGeoJSON]);
};
