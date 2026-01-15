import { Commune as SearchCommuneType } from "@/components/CommuneSearch";
import { Commune } from "@/lib/onboarding";
import * as turf from "@turf/turf";
import * as d3 from "d3";
import { useCallback, useEffect, useMemo, useState } from "react";
import parentAreas from "../../../../public/parent_areas.json";
import { FeatureProperties, MapState, ParentArea, SelectedArea } from "../types";
import { useMapURLState } from "./useMapURLState";

// Specific levels for the map
export type CollectiviteLevel = "country" | "region" | "department" | "epci" | "city";
export type ParentLevel = "country" | "region" | "department" | "epci";

export const useMapNavigation = (initialFilters: Record<string, unknown> = {}) => {
  const [mapState, setMapState] = useState<MapState>({
    currentLevel: "country",
    selectedAreas: {},
    departmentView: "epci", // Default view for departments
    regionView: "department", // Default view for regions (hidden feature)
    filters: {
      service_id: null,
      service_ids: null,
      rcpnt_ref: null,
      period: null,
      ...initialFilters,
    },
  });

  const { getURLState, updateURLState } = useMapURLState();

  const previousLevel = useMemo(() => {
    if (mapState.currentLevel === "city") {
      return mapState.selectedAreas.epci ? "epci" : "department";
    }
    return (
      {
        region: "country",
        department: "region",
        epci: "department",
        country: null,
        city: null,
      }[mapState.currentLevel] || null
    );
  }, [mapState.currentLevel, mapState.selectedAreas]);

  const nextLevel = useMemo(() => {
    if (mapState.currentLevel === "department") {
      return mapState.departmentView === "epci" ? "epci" : "city";
    }
    if (mapState.currentLevel === "region" && mapState.regionView === "city") {
      return "city";
    }
    const levelTransitions: { [key: string]: string } = {
      country: "region",
      region: "department",
      epci: "city",
      city: "city",
    };
    return levelTransitions[mapState.currentLevel] || null;
  }, [mapState.currentLevel, mapState.departmentView, mapState.regionView]);

  const loadDepartmentCities = useCallback(
    async (departmentCode: string, period?: string | null) => {
      const queryParams = new URLSearchParams({
        scope: "list-commune",
        dep: departmentCode,
      });

      if (period && period !== "current") {
        queryParams.set("period", period);
      }

      const response = await fetch(`/api/rcpnt/stats?${queryParams.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      return data;
    },
    [],
  );

  const loadRegionCities = useCallback(
    async (regionCode: string, period?: string | null) => {
      const departmentsInRegion = (parentAreas as ParentArea[]).filter(
        (area) => area.type === "department" && area.insee_reg === regionCode,
      );

      const allCities = await Promise.all(
        departmentsInRegion.map((dept) => loadDepartmentCities(dept.insee_geo, period)),
      );

      return allCities.flat();
    },
    [loadDepartmentCities],
  );

  const fetchGeoJSON = useCallback(
    async (level: "country" | "region" | "department", code: string) => {
      let filePath = "";
      if (level === "country") {
        filePath = "regions.json";
      } else if (level === "region") {
        filePath = `departements_par_region/${code.replace("r", "")}.json`;
      } else if (level === "department") {
        filePath = `communes_par_departement/${code}.json`;
      }
      const response = await fetch(`/geojson/${filePath}`);
      const geoJSON = await response.json();
      return geoJSON;
    },
    [],
  );

  const fetchSelectedCity = useCallback(async (siret: string) => {
    try {
      const response = await fetch(`/api/communes/${siret}`);
      if (response.ok) {
        const commune = await response.json();
        const communeData: Commune = JSON.parse(JSON.stringify(commune));
        return communeData;
      } else {
        console.warn(`Failed to fetch organization data for SIRET ${siret}`);
        return null;
      }
    } catch {
      return null;
    }
  }, []);

  // PROCESSING
  const processGeoJSONEPCI = useCallback((geoJSON: GeoJSON.FeatureCollection) => {
    const features = geoJSON.features.map((f) => JSON.parse(JSON.stringify(f)));
    const groupedFeatures = d3.group(
      features,
      (d) => (d.properties as FeatureProperties).EPCI_SIREN,
    );
    const processedGeoJSONFeatures = Array.from(groupedFeatures, ([epciSiren, features]) => {
      let merged;
      if (features.length === 1) {
        merged = features[0];
      } else {
        merged = turf.union(turf.featureCollection(features), { id: epciSiren } as GeoJSON.Feature);
      }
      const record = parentAreas.find((r) => r.insee_geo === epciSiren);
      merged.properties = {
        NAME: record ? record.name : "EPCI inconnue",
        INSEE_GEO: record ? record.insee_geo : "EPCI inconnue",
        INSEE_REG: record ? record.insee_reg : "EPCI inconnue",
        INSEE_DEP: record ? record.insee_dep : "EPCI inconnue",
      };
      return merged;
    });
    return {
      type: "FeatureCollection",
      features: processedGeoJSONFeatures as GeoJSON.Feature<
        GeoJSON.Geometry,
        GeoJSON.GeoJsonProperties
      >[],
    };
  }, []);

  const computeSelectedArea = useCallback(
    async (
      level: ParentLevel,
      code: string,
      regionView?: "department" | "city",
    ): Promise<SelectedArea | null> => {
      try {
        let selectedArea: SelectedArea;
        if (level === "country") {
          selectedArea = { insee_geo: "00", name: "France" };
        } else {
          selectedArea =
            (parentAreas as ParentArea[]).find((area) => area.insee_geo === code) ||
            ({ insee_geo: code, name: "Unknown", type: "unknown" } as ParentArea);
        }
        if (level !== "epci") {
          const geoJSON = await fetchGeoJSON(level, code);
          selectedArea.geoJSON = geoJSON;
          if (level === "department") {
            const period = mapState.filters.period as string | null;
            selectedArea.cities = await loadDepartmentCities(code, period);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            selectedArea.geoJSONEPCI = processGeoJSONEPCI(geoJSON) as any;
          } else if (level === "region" && regionView === "city") {
            // Hidden feature: load all cities in the region
            const period = mapState.filters.period as string | null;
            selectedArea.cities = await loadRegionCities(code, period);

            // Load and combine GeoJSON for all departments in the region
            const departmentsInRegion = (parentAreas as ParentArea[]).filter(
              (area) => area.type === "department" && area.insee_reg === code,
            );

            const allDeptGeoJSON = await Promise.all(
              departmentsInRegion.map(async (dept) => {
                try {
                  return await fetchGeoJSON("department", dept.insee_geo);
                } catch (error) {
                  console.error(`Failed to fetch GeoJSON for department ${dept.insee_geo}:`, error);
                  return { type: "FeatureCollection", features: [] };
                }
              }),
            );

            const combinedFeatures = allDeptGeoJSON.flatMap((geoJSON) => geoJSON?.features || []);

            if (combinedFeatures.length === 0) {
              console.warn(
                "No features found for region cities view, falling back to region GeoJSON",
              );
              selectedArea.geoJSON = geoJSON;
            } else {
              selectedArea.geoJSON = {
                type: "FeatureCollection",
                features: combinedFeatures,
              } as GeoJSON.FeatureCollection;
            }
          }
        }
        return selectedArea;
      } catch {
        return null;
      }
    },
    [
      fetchGeoJSON,
      loadDepartmentCities,
      loadRegionCities,
      processGeoJSONEPCI,
      mapState.filters.period,
    ],
  );

  const selectLevel = useCallback(
    async (
      level: CollectiviteLevel,
      code: string,
      source = "areaClick",
      departmentView: "city" | "epci" | null = null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updatedFilters?: any,
      regionView?: "department" | "city",
    ) => {
      const allLevels = ["city", "epci", "department", "region", "country"];
      const parentLevels = allLevels.slice(allLevels.indexOf(level) + 1);

      let newSelectedAreas: { [key: string]: SelectedArea | Commune | null } = {};

      if (source === "backClick") {
        newSelectedAreas = parentLevels.reduce(
          (acc, lev) => {
            acc[lev] = mapState.selectedAreas[lev] as SelectedArea;
            return acc;
          },
          {} as { [key: string]: SelectedArea },
        );
      } else if (source === "areaClick") {
        newSelectedAreas = { ...mapState.selectedAreas };
      }

      // Use passed regionView if provided, otherwise fall back to mapState
      const effectiveRegionView = regionView ?? mapState.regionView;

      if (level !== "city") {
        newSelectedAreas[level] = await computeSelectedArea(
          level as ParentLevel,
          code,
          level === "region" ? effectiveRegionView : undefined,
        );
      } else {
        newSelectedAreas[level] = await fetchSelectedCity(code);
      }

      if (!newSelectedAreas[level]) {
        selectLevel("country", "00");
        return;
      }

      if (source === "quickNav") {
        for (const parentLevel of parentLevels) {
          let parentCode;
          if (parentLevel === "epci") {
            parentCode = (newSelectedAreas["city"] as Commune)?.epci_siren;
          }
          if (parentLevel === "department") {
            parentCode = (newSelectedAreas["epci"] as SelectedArea)?.insee_dep || "";
          }
          if (parentLevel === "region") {
            parentCode = (newSelectedAreas["department"] as SelectedArea)?.insee_reg || "";
          }
          if (parentLevel === "country") {
            parentCode = "00";
          }
          newSelectedAreas[parentLevel] = await computeSelectedArea(
            parentLevel as ParentLevel,
            parentCode as string,
            parentLevel === "region" ? mapState.regionView : undefined,
          );
        }
      }

      // When clicking on a city from region level (with city view), populate the department
      if (
        source === "areaClick" &&
        level === "city" &&
        mapState.currentLevel === "region" &&
        mapState.regionView === "city"
      ) {
        const city = newSelectedAreas["city"] as Commune;
        if (city?.insee_dep) {
          newSelectedAreas["department"] = await computeSelectedArea("department", city.insee_dep);
        }
      }

      const newMapState: Partial<MapState> = {
        currentLevel: level,
        selectedAreas: newSelectedAreas,
      };

      if (departmentView) {
        newMapState.departmentView = departmentView;
      } else if (level === "city" && source === "quickNav") {
        newMapState.departmentView = "city";
      }

      if (regionView) {
        newMapState.regionView = regionView;
      }

      const finalMapState = { ...mapState, ...newMapState } as MapState;
      if (updatedFilters) {
        finalMapState.filters = updatedFilters;
      }
      setMapState(finalMapState);
    },
    [computeSelectedArea, mapState, fetchSelectedCity],
  );

  const goBack = useCallback(() => {
    if (previousLevel) {
      selectLevel(
        previousLevel as CollectiviteLevel,
        (mapState.selectedAreas[previousLevel] as SelectedArea)?.insee_geo || "",
        "backClick",
      );
    }
  }, [previousLevel, mapState.selectedAreas, selectLevel]);

  const handleQuickNav = useCallback(
    async (community: SearchCommuneType) => {
      let level: string = community.type;
      let code;
      if (community.type === "region") {
        code = "r" + community.insee_reg;
      } else if (community.type === "departement") {
        code = community.insee_dep!;
        level = "department";
      } else if (community.type === "epci") {
        code = community["siret"].slice(0, 9);
      } else if (community.type === "commune") {
        code = community["siret"] || "";
        level = "city";
      } else {
        throw new Error(`Invalid community type: ${community.type}`);
      }
      await selectLevel(level as CollectiviteLevel, code, "quickNav");
    },
    [selectLevel],
  );

  // Initial sync with URL
  useEffect(() => {
    const urlState = getURLState(mapState.filters);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedFilters = { ...mapState.filters } as any;
    Object.keys(mapState.filters).forEach((key) => {
      if (urlState[key]) updatedFilters[key] = urlState[key];
    });

    // Set regionView from URL if present
    const initialRegionView = urlState.regionView || "department";

    if (
      urlState.currentLevel &&
      urlState.currentAreaCode &&
      (urlState.currentLevel !== "country" || urlState.currentAreaCode !== "00")
    ) {
      // Update mapState with regionView before selectLevel
      setMapState((prev) => ({
        ...prev,
        regionView: initialRegionView as "department" | "city",
      }));

      selectLevel(
        urlState.currentLevel as CollectiviteLevel,
        urlState.currentAreaCode,
        "quickNav",
        urlState.departmentView as "city" | "epci" | null,
        updatedFilters,
      );
    } else {
      // Load initial country data if not navigating deep
      if (!mapState.selectedAreas.country) {
        selectLevel("country", "00", "quickNav", null, updatedFilters);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload city data when period changes at department, epci, city, or region level
  useEffect(() => {
    const reloadCities = async () => {
      // Reload if at department level with city view
      const shouldReloadAtDepartment =
        mapState.currentLevel === "department" &&
        mapState.departmentView === "city" &&
        mapState.selectedAreas.department?.insee_geo;

      const shouldReloadAtCity =
        mapState.currentLevel === "city" && mapState.selectedAreas.department?.insee_geo;

      const shouldReloadAtEPCI =
        mapState.currentLevel === "epci" && mapState.selectedAreas.department?.insee_geo;

      // Reload if at region level with city view (hidden feature)
      const shouldReloadAtRegion =
        mapState.currentLevel === "region" &&
        mapState.regionView === "city" &&
        mapState.selectedAreas.region?.insee_geo;

      if (shouldReloadAtDepartment || shouldReloadAtCity || shouldReloadAtEPCI) {
        const departmentCode = (mapState.selectedAreas.department as SelectedArea).insee_geo;
        const period = mapState.filters.period as string | null;
        const cities = await loadDepartmentCities(departmentCode, period);

        setMapState((prev) => ({
          ...prev,
          selectedAreas: {
            ...prev.selectedAreas,
            department: {
              ...prev.selectedAreas.department,
              cities,
            } as SelectedArea,
          },
        }));
      } else if (shouldReloadAtRegion) {
        const regionCode = (mapState.selectedAreas.region as SelectedArea).insee_geo;
        const period = mapState.filters.period as string | null;
        const cities = await loadRegionCities(regionCode, period);

        setMapState((prev) => ({
          ...prev,
          selectedAreas: {
            ...prev.selectedAreas,
            region: {
              ...prev.selectedAreas.region,
              cities,
            } as SelectedArea,
          },
        }));
      }
    };

    reloadCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mapState.filters.period,
    mapState.currentLevel,
    mapState.departmentView,
    mapState.regionView,
    mapState.selectedAreas.department?.insee_geo,
    mapState.selectedAreas.region?.insee_geo,
    loadDepartmentCities,
    loadRegionCities,
  ]);

  // Update URL when state changes
  useEffect(() => {
    if (mapState.selectedAreas[mapState.currentLevel]) {
      const areaCode =
        mapState.currentLevel === "city"
          ? (mapState.selectedAreas["city"] as Commune)?.siret
          : (mapState.selectedAreas[mapState.currentLevel] as SelectedArea)?.insee_geo || "";
      updateURLState(
        mapState.currentLevel,
        areaCode,
        mapState.departmentView,
        mapState.filters,
        mapState.regionView,
      );
    }
  }, [
    mapState.currentLevel,
    mapState.selectedAreas,
    mapState.departmentView,
    mapState.regionView,
    mapState.filters,
    updateURLState,
  ]);

  return {
    mapState,
    setMapState,
    selectLevel,
    goBack,
    handleQuickNav,
    previousLevel,
    nextLevel,
  };
};
