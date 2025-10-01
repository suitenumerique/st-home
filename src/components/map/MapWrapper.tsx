"use client";

import { type Commune } from "@/lib/onboarding";
import * as turf from "@turf/turf";
import * as d3 from "d3";
import { MapLayerMouseEvent } from "maplibre-gl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import parentAreas from "../../../public/parent_areas.json";
import MapContainer from "./MapContainer";
import SidePanel from "./SidePanel";

import { AreaStats, FeatureProperties, MapState, ParentArea, SelectedArea } from "./types";

const useMapURLState = () => {
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getURLState = useCallback((filters: { [key: string]: any }) => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      currentLevel: urlParams.get("level"),
      currentAreaCode: urlParams.get("code"),
      departmentView: urlParams.get("view"),
      ...Object.entries(filters).reduce(
        (acc, [key]) => {
          if (key === "service_ids" && urlParams.get(key)) {
            acc[key] = urlParams.get(key)?.split(",").map(Number) || null;
          } else {
            acc[key] = urlParams.get(key) as string;
          }
          return acc;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as { [key: string]: any },
      ),
    };
  }, []);

  const updateURLState = useCallback(
    (
      currentLevel: string,
      currentAreaCode: string,
      departmentView: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filters: { [key: string]: any },
    ) => {
      const params = new URLSearchParams();
      if (currentLevel !== "country") {
        params.set("level", currentLevel);
      }
      if (currentAreaCode !== "00") {
        params.set("code", currentAreaCode);
      }
      if (departmentView && currentLevel === "department") {
        params.set("view", departmentView);
      }
      Object.entries(filters).forEach(([key, param]) => {
        if (param) {
          if (key === "service_ids" && Array.isArray(param)) {
            // Handle service_ids as array
            params.set(key, param.join(","));
          } else {
            params.set(key, param as string);
          }
        }
      });
      const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
      router.replace(newURL, { scroll: false });
    },
    [router],
  );

  return { getURLState, updateURLState };
};

const MapWrapper = ({
  SidePanelContent,
  gradientColors,
  gradientDomain,
  showGradientLegend = true,
  computeAreaStats,
  mapState,
  setMapState,
  displayCircleValue = false,
  customLayers,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SidePanelContent: React.ComponentType<any>;
  gradientColors: string[];
  gradientDomain: number[];
  showGradientLegend: boolean;
  computeAreaStats: (
    level: "country" | "region" | "department" | "epci" | "city",
    insee_geo: string,
    siret: string,
    department: SelectedArea,
  ) => AreaStats | null;
  mapState: MapState;
  setMapState: (mapState: MapState) => void;
  displayCircleValue?: boolean;
  customLayers?: Array<{
    id: string;
    source?: {
      id: string;
      type: "geojson";
      data: GeoJSON.FeatureCollection;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    layers?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component?: React.ComponentType<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props?: any;
  }>;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [panelState, setPanelState] = useState<"closed" | "open" | "partial">("open");

  const { getURLState, updateURLState } = useMapURLState();

  const [isMobile, setIsMobile] = useState(false);

  const colorsConfig = useMemo(() => {
    return {
      domain: gradientDomain,
      range: gradientColors,
      defaultColor: "#e2e8f0",
    };
  }, [gradientColors, gradientDomain]);

  const previousLevel = useMemo(() => {
    if (mapState.currentLevel === "city") {
      return mapState.selectedAreas.epci ? "epci" : "department";
    }
    return {
      region: "country",
      department: "region",
      epci: "department",
    }[mapState.currentLevel];
  }, [mapState.currentLevel, mapState.selectedAreas]);

  const nextLevel = useMemo(() => {
    if (mapState.currentLevel === "department") {
      return mapState.departmentView === "epci" ? "epci" : "city";
    }
    const levelTransitions: { [key: string]: string } = {
      country: "region",
      region: "department",
      epci: "city",
      city: "city",
    };
    return levelTransitions[mapState.currentLevel] || null;
  }, [mapState.currentLevel, mapState.departmentView]);

  const loadDepartmentCities = useCallback(async (departmentCode: string) => {
    const response = await fetch(`/api/rcpnt/stats?scope=list-commune&dep=${departmentCode}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    });
    const data = await response.json();
    return data;
  }, []);

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
    const groupedFeatures = d3.group(features, (d) => d.properties.EPCI_SIREN);
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
      level: "country" | "region" | "department" | "epci",
      code: string,
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
            selectedArea.cities = await loadDepartmentCities(code);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            selectedArea.geoJSONEPCI = processGeoJSONEPCI(geoJSON) as any;
          }
        }
        return selectedArea;
      } catch {
        return null;
      }
    },
    [fetchGeoJSON, loadDepartmentCities, processGeoJSONEPCI],
  );

  // INTERACTIONS
  const handleAreaClick = async (event: MapLayerMouseEvent) => {
    if (event.features && event.features.length > 0) {
      const feature = event.features[0];
      if (nextLevel) {
        if (
          nextLevel === "region" &&
          ["r01", "r02", "r03", "r04", "r06"].includes(feature.properties.INSEE_GEO)
        ) {
          const departmentMatch = parentAreas.find((area) => {
            return area.insee_reg === feature.properties.INSEE_GEO && area.type === "department";
          });
          if (departmentMatch) {
            await selectLevel("department", departmentMatch.insee_geo, "areaClick");
            return;
          }
        } else {
          await selectLevel(
            nextLevel as "region" | "department" | "city",
            nextLevel === "city" ? feature.properties.SIRET : feature.properties.INSEE_GEO,
            "areaClick",
          );
        }
      }
    }
  };

  const goBack = () => {
    if (previousLevel) {
      selectLevel(
        previousLevel as "country" | "region" | "department" | "epci",
        mapState.selectedAreas[previousLevel]?.insee_geo || "",
        "backClick",
      );
    }
  };

  const handleQuickNav = async (community: { type: string; siret: string }) => {
    const level = community.type === "commune" ? "city" : community.type;
    let code;
    if (community.type === "epci") {
      code = community["siret"].slice(0, 9);
    } else {
      code = community["siret"] || "";
    }
    await selectLevel(level as "epci" | "city", code, "quickNav");
  };

  const selectLevel = useCallback(
    async (
      level: "country" | "region" | "department" | "epci" | "city",
      code: string,
      source = "areaClick",
      departmentView: "city" | "epci" | null = null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updatedFilters?: any,
    ) => {
      console.log("selectLevel", level, code, source);

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

      if (level !== "city") {
        newSelectedAreas[level] = await computeSelectedArea(level, code);
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
            parentLevel as "country" | "region" | "department" | "epci",
            parentCode as string,
          );
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

      const finalMapState = { ...mapState, ...newMapState } as MapState;
      if (updatedFilters) {
        finalMapState.filters = updatedFilters;
      }
      setMapState(finalMapState);
    },
    [computeSelectedArea, mapState, setMapState, fetchSelectedCity],
  );

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (container && container.requestFullscreen) {
      container.requestFullscreen();
    }
  };

  // RENDERING
  const getColor = useCallback(
    (score: number | null | undefined): string => {
      const colorScale = d3.scaleLinear(colorsConfig.domain, colorsConfig.range);
      return score === null || score === undefined ? colorsConfig.defaultColor : colorScale(score);
    },
    [colorsConfig],
  );

  const darkenColor = useCallback((color: string, amount: number) => {
    return d3.color(color)?.darker(amount).formatHex8();
  }, []);

  const currentGeoJSON = useMemo(() => {
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

    if (
      mapState.currentLevel === "country" ||
      mapState.currentLevel === "region" ||
      (mapState.currentLevel === "department" && mapState.departmentView === "city")
    ) {
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
    if (displayedGeoJSON) {
      const features = (displayedGeoJSON as GeoJSON.FeatureCollection).features;
      const scoreLevel = {
        country: "region",
        region: "department",
        department: mapState.departmentView === "city" ? "city" : "epci",
        epci: "city",
        city: "city",
      }[mapState.currentLevel];

      // Create a cache key based on current context
      const cacheKey = `${mapState.currentLevel}-${mapState.departmentView}-${mapState.selectedAreas.department?.insee_geo || "none"}-${JSON.stringify(mapState.filters)}`;

      features.forEach((feature) => {
        // Skip if already processed for this specific context
        if (feature.properties?._processedFor === cacheKey) {
          return;
        }

        const stats = computeAreaStats(
          scoreLevel as "region" | "department" | "city",
          feature.properties?.INSEE_GEO || "",
          feature.properties?.SIRET || "",
          mapState.selectedAreas.department as SelectedArea,
        );
        feature.properties!.VALUE = stats?.n_cities;
        feature.properties!.SCORE = stats?.score;
        feature.properties!.color = stats?.score === null ? "transparent" : getColor(stats?.score);
        feature.properties!.color_dark =
          stats?.score === null ? "#000091" : darkenColor(feature.properties!.color, 0.6);
        feature.properties!.color_darker =
          stats?.score === null ? "#000091" : darkenColor(feature.properties!.color, 3);

        // Mark as processed for this context
        feature.properties!._processedFor = cacheKey;
      });
      displayedGeoJSON = {
        ...(displayedGeoJSON as GeoJSON.FeatureCollection),
        features: features,
        id: `geojson-${Math.random().toString(36).substring(2, 15)}`,
      } as GeoJSON.FeatureCollection & { id: string };
    }
    return displayedGeoJSON;
  }, [
    mapState.currentLevel,
    mapState.selectedAreas,
    mapState.departmentView,
    mapState.filters,
    computeAreaStats,
    getColor,
    darkenColor,
  ]);

  useEffect(() => {
    if (mapState.selectedAreas[mapState.currentLevel]) {
      const areaCode =
        mapState.currentLevel === "city"
          ? (mapState.selectedAreas["city"] as Commune)?.siret
          : (mapState.selectedAreas[mapState.currentLevel] as SelectedArea)?.insee_geo || "";
      updateURLState(mapState.currentLevel, areaCode, mapState.departmentView, mapState.filters);
    }
  }, [
    mapState.currentLevel,
    mapState.selectedAreas,
    mapState.departmentView,
    mapState.filters,
    updateURLState,
  ]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const urlState = getURLState(mapState.filters);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedFilters = { ...mapState.filters } as any;
    Object.keys(mapState.filters).forEach((key) => {
      updatedFilters[key] = urlState[key as keyof typeof urlState] as string;
    });

    if (
      urlState.currentLevel &&
      urlState.currentAreaCode &&
      (urlState.currentLevel !== "country" || urlState.currentAreaCode !== "00")
    ) {
      selectLevel(
        urlState.currentLevel as "country" | "region" | "department" | "epci" | "city",
        urlState.currentAreaCode,
        "quickNav",
        urlState.departmentView as "city" | "epci" | null,
        updatedFilters,
      );
    } else {
      selectLevel("country", "00", "quickNav", null, updatedFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: isMobile ? "column-reverse" : "row",
        width: "100%",
        height: "100%",
      }}
    >
      <SidePanel panelState={panelState} setPanelState={setPanelState} isMobile={isMobile}>
        <SidePanelContent
          panelState={panelState}
          setPanelState={setPanelState}
          getColor={getColor}
          mapState={mapState}
          selectLevel={selectLevel}
          setMapState={setMapState}
          computeAreaStats={computeAreaStats}
          goBack={goBack}
          handleQuickNav={handleQuickNav}
          container={containerRef.current}
          isMobile={isMobile}
          computeAreaStats={computeAreaStats}
        />
      </SidePanel>
      <MapContainer
        currentGeoJSON={currentGeoJSON as GeoJSON.FeatureCollection & { id: string }}
        handleAreaClick={handleAreaClick}
        handleFullscreen={handleFullscreen}
        goBack={goBack}
        handleQuickNav={handleQuickNav}
        mapState={mapState}
        selectLevel={selectLevel}
        gradientColors={gradientColors}
        isMobile={isMobile}
        panelState={panelState}
        showGradientLegend={showGradientLegend}
        displayCircleValue={displayCircleValue}
        customLayers={customLayers}
      />
    </div>
  );
};

export default MapWrapper;
