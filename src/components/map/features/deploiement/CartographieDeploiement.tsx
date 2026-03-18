"use client";

import { MapProvider, useMapContext } from "@/components/map/context/MapContext";
import { MapLayoutProvider, useMapLayoutContext } from "@/components/map/context/MapLayoutContext";
import { customMapStyle, InteractiveMap } from "@/components/map/core/InteractiveMap";
import { MapLayout } from "@/components/map/core/MapLayout";
import { useDisplayedGeoJSON } from "@/components/map/hooks/useDisplayedGeoJSON";
import * as d3 from "d3";
import { useCallback, useEffect, useMemo, useState } from "react";
import parentAreas from "../../../../../public/parent_areas.json";
import { FeatureProperties, SelectedArea } from "../../types";
import SidePanelContent from "./SidePanelContent";
import { StatRecord } from "./types";

const DeploiementMap = () => {
  const { mapState, setMapState, selectLevel, goBack, handleQuickNav } = useMapContext();
  const { panelState, isMobile } = useMapLayoutContext();

  const [stats, setStats] = useState<StatRecord[]>([]);
  const [epciStats, setEpciStats] = useState<StatRecord[]>([]);
  const [coordMap, setCoordMap] = useState<Record<string, { longitude: number; latitude: number }>>(
    {},
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customLayers, setCustomLayers] = useState<any[]>([]);

  const gradientColors = useMemo(() => ["#EEEEEE", "#2A3C84"], []);
  const gradientDomain = useMemo(() => [0, 1], []);

  const colorsConfig = useMemo(() => {
    return {
      domain: gradientDomain,
      range: gradientColors,
      defaultColor: "#e2e8f0",
    };
  }, [gradientColors, gradientDomain]);

  const getColor = useCallback(
    (score: number | null | undefined): string => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const colorScale = d3.scaleLinear(colorsConfig.domain as any, colorsConfig.range as any);
      // @ts-expect-error d3 types
      return score === null || score === undefined ? colorsConfig.defaultColor : colorScale(score);
    },
    [colorsConfig],
  );

  const loadSirenCoordinatesMapping = useCallback(async (): Promise<void> => {
    const response = await fetch("/siren_coordinates.json");
    const data = await response.json();
    setCoordMap(data);
  }, []);

  const loadStats = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/deployment/stats?scope=list-commune");
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      const result = await response.json();
      if (!result.data || !Array.isArray(result.data)) {
        throw new Error("Invalid API response format");
      }
      setStats(result.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }, []);

  const loadEpciStats = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/deployment/stats?scope=list-commune&org_type=epci");
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      const result = await response.json();
      if (!result.data || !Array.isArray(result.data))
        throw new Error("Invalid API response format");
      setEpciStats(result.data);
    } catch (error) {
      console.error("Error loading EPCI stats:", error);
    }
  }, []);

  const computeAreaStats = useCallback(
    (
      level: "country" | "region" | "department" | "epci" | "city",
      insee_geo: string,
      siret: string,
    ) => {
      try {
        let filteredStats = stats;
        if (level === "region") {
          filteredStats = filteredStats.filter(
            (stat: StatRecord) => stat.reg === insee_geo.replace("r", ""),
          );
        } else if (level === "department") {
          filteredStats = filteredStats.filter((stat: StatRecord) => stat.dep === insee_geo);
        }
        if (mapState.filters.service_ids && (mapState.filters.service_ids as number[]).length > 0) {
          filteredStats = filteredStats.filter((stat: StatRecord) => {
            return stat.all_services?.some((service: string) =>
              (mapState.filters.service_ids as number[]).includes(Number(service)),
            );
          });
        } else {
          // @ts-expect-error not typed
          filteredStats = filteredStats.filter((stat: StatRecord) => stat.all_services.length > 0);
        }
        if (level === "city") {
          const city = filteredStats.find((city: { id: string }) => city.id === siret);
          return {
            n_cities: 1,
            score: city ? 1 : 0,
          };
        } else {
          let nTotalCities;
          if (level === "country") {
            nTotalCities = parentAreas
              .filter((area) => area.type === "region")
              .map((area) => area.n_cities)
              .reduce((a, b) => a + b, 0);
          } else {
            nTotalCities = parentAreas.find((area) => area.insee_geo === insee_geo)?.n_cities || 0;
          }
          return {
            n_cities: filteredStats.length,
            n_total_cities: nTotalCities,
            score: nTotalCities > 0 ? filteredStats.length / nTotalCities : null,
          };
        }
      } catch {
        return {
          n_cities: 0,
          score: null,
        };
      }
    },
    [stats, mapState.filters],
  );

  useEffect(() => {
    if (!stats || !coordMap || stats.length === 0) return;

    const filterByServiceIds = (list: StatRecord[]) => {
      if (mapState.filters.service_ids && (mapState.filters.service_ids as number[]).length > 0) {
        return list.filter((stat: StatRecord) =>
          stat.all_services?.some((service: string) =>
            (mapState.filters.service_ids as number[]).includes(Number(service)),
          ),
        );
      }
      // @ts-expect-error not typed
      return list.filter((stat: StatRecord) => stat.all_services.length > 0);
    };

    const toPointFeatures = (list: StatRecord[]): GeoJSON.Feature[] =>
      list
        .map((stat: StatRecord) => {
          const coords = coordMap[stat.id.slice(0, 9)];
          if (!coords?.longitude || !coords?.latitude) return null;
          return {
            type: "Feature" as const,
            geometry: { type: "Point" as const, coordinates: [coords.longitude, coords.latitude] },
            properties: { id: stat.id, reg: stat.reg ?? null, dep: stat.dep ?? null },
          };
        })
        .filter(Boolean) as GeoJSON.Feature[];

    const cityPointsGeoJSON: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: toPointFeatures(filterByServiceIds(stats)),
    };

    // Compute EPCI centroids by averaging member commune coordinates
    const epciCentroidAccum: Record<string, { lon: number; lat: number; count: number }> = {};
    for (const stat of stats) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const epciSiren = (stat as any).epci_siren as string | null;
      if (!epciSiren) continue;
      const coords = coordMap[stat.id.slice(0, 9)];
      if (!coords?.longitude || !coords?.latitude) continue;
      if (!epciCentroidAccum[epciSiren]) {
        epciCentroidAccum[epciSiren] = { lon: 0, lat: 0, count: 0 };
      }
      epciCentroidAccum[epciSiren].lon += coords.longitude;
      epciCentroidAccum[epciSiren].lat += coords.latitude;
      epciCentroidAccum[epciSiren].count++;
    }
    const epciCentroidMap: Record<string, { longitude: number; latitude: number }> = {};
    for (const [siren, accum] of Object.entries(epciCentroidAccum)) {
      epciCentroidMap[siren] = {
        longitude: accum.lon / accum.count,
        latitude: accum.lat / accum.count,
      };
    }

    const filteredEpciStats = filterByServiceIds(epciStats);

    const toEpciPointFeatures = (list: StatRecord[]): GeoJSON.Feature[] =>
      list
        .map((stat: StatRecord) => {
          const coords = epciCentroidMap[stat.id.slice(0, 9)];
          if (!coords) return null;
          return {
            type: "Feature" as const,
            geometry: { type: "Point" as const, coordinates: [coords.longitude, coords.latitude] },
            properties: { id: stat.id, reg: stat.reg ?? null, dep: stat.dep ?? null },
          };
        })
        .filter(Boolean) as GeoJSON.Feature[];

    const epciPointsGeoJSON: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: toEpciPointFeatures(filteredEpciStats),
    };

    const selectedRegion =
      (mapState.selectedAreas.region as SelectedArea)?.insee_geo?.replace("r", "") ?? null;
    const selectedDep = (mapState.selectedAreas.department as SelectedArea)?.insee_geo ?? null;

    const communeColor = (() => {
      if (mapState.currentLevel === "region" && selectedRegion) {
        return ["case", ["==", ["get", "reg"], selectedRegion], "#2A3C84", "#CCCCCC"];
      }
      if (["department", "epci", "city"].includes(mapState.currentLevel) && selectedDep) {
        return ["case", ["==", ["get", "dep"], selectedDep], "#2A3C84", "#CCCCCC"];
      }
      return "#2A3C84";
    })();

    const epciDotColor = (() => {
      if (mapState.currentLevel === "region" && selectedRegion) {
        return ["case", ["==", ["get", "reg"], selectedRegion], "#00867A", "#CCCCCC"];
      }
      if (["department", "epci", "city"].includes(mapState.currentLevel) && selectedDep) {
        return ["case", ["==", ["get", "dep"], selectedDep], "#00867A", "#CCCCCC"];
      }
      return "#00867A";
    })();

    const epciGeoJSON = (mapState.selectedAreas.department as SelectedArea)?.geoJSONEPCI;
    const epciOutlineLayer = epciGeoJSON
      ? [
          {
            id: "epci-layer",
            source: {
              id: "epci-outlines",
              type: "geojson" as const,
              data: {
                type: "FeatureCollection" as const,
                features: epciGeoJSON as GeoJSON.Feature[],
              },
            },
            layers: [
              {
                id: "epci-stroke",
                type: "line",
                paint: {
                  "line-color": "#2A3C84",
                  "line-width": 2,
                  "line-opacity": 0.6,
                },
              } as import("react-map-gl/maplibre").LayerProps,
            ],
          },
        ]
      : [];

    setCustomLayers([
      {
        id: "city-points-layer",
        source: { id: "city-points", type: "geojson", data: cityPointsGeoJSON },
        layers: [
          {
            id: "city-dots",
            type: "circle",
            beforeId: "polygon-stroke",
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 1.5, 8, 3, 12, 5, 16, 8],
              "circle-color": communeColor,
              "circle-opacity": 0.8,
            },
          } as import("react-map-gl/maplibre").LayerProps,
        ],
      },
      {
        id: "epci-points-layer",
        source: { id: "epci-points", type: "geojson", data: epciPointsGeoJSON },
        layers: [
          {
            id: "epci-dots",
            type: "circle",
            beforeId: "polygon-stroke",
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 2.5, 8, 5, 12, 8, 16, 12],
              "circle-color": epciDotColor,
              "circle-opacity": 0.9,
              "circle-stroke-width": 1.5,
              "circle-stroke-color": "#ffffff",
            },
          } as import("react-map-gl/maplibre").LayerProps,
        ],
      },
      ...epciOutlineLayer,
    ]);
  }, [
    stats,
    epciStats,
    coordMap,
    mapState.filters.service_ids,
    mapState.currentLevel,
    mapState.selectedAreas,
  ]);

  useEffect(() => {
    const loadData = async () => {
      await loadSirenCoordinatesMapping();
      await loadStats();
      await loadEpciStats();
    };
    loadData();
  }, [loadSirenCoordinatesMapping, loadStats, loadEpciStats]);

  useEffect(() => {
    if (
      stats.length > 0 &&
      mapState.selectedAreas.city &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      !(mapState.selectedAreas.city as any).additionalCityStats
    ) {
      const cityStats = stats.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (stat: StatRecord) => stat.id === (mapState.selectedAreas.city as any).siret,
      );
      if (cityStats) {
        setMapState({
          ...mapState,
          selectedAreas: {
            ...mapState.selectedAreas,
            city: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(mapState.selectedAreas.city as any),
              additionalCityStats: cityStats,
            },
          },
        });
      }
    }
  }, [stats, mapState.selectedAreas.city, setMapState, mapState]);

  const geoJSON = useDisplayedGeoJSON(mapState);

  const isCityView =
    (mapState.currentLevel === "department" && mapState.departmentView === "city") ||
    mapState.currentLevel === "epci" ||
    mapState.currentLevel === "city";

  const mapData = useMemo(() => {
    if (!geoJSON || stats.length === 0) return {};

    const data: Record<string, { value?: number; score?: number; color: string }> = {};
    const features = geoJSON.features;

    const scoreLevel = {
      country: "region",
      region: "department",
      department: mapState.departmentView === "city" ? "city" : "epci",
      epci: "city",
      city: "city",
    }[mapState.currentLevel] as "country" | "region" | "department" | "epci" | "city";

    features.forEach((feature) => {
      const props = feature.properties as FeatureProperties;
      const code =
        props.INSEE_GEO || props.EPCI_SIREN || (props as unknown as { SIRET: string }).SIRET;

      if (!code) return;

      const result = computeAreaStats(
        scoreLevel,
        props.INSEE_GEO || "",
        (props as unknown as { SIRET: string }).SIRET || "",
      );

      if (result) {
        data[code] = {
          value: result.n_cities ?? undefined,
          score: result.score ?? undefined,
          color: isCityView
            ? result.score === 1
              ? "#2A3C84"
              : "transparent"
            : getColor(result.score),
        };
      }
    });

    return data;
  }, [
    geoJSON,
    stats,
    mapState.currentLevel,
    mapState.departmentView,
    computeAreaStats,
    getColor,
    isCityView,
  ]);

  return stats ? (
    <MapLayout
      sidebar={
        // @ts-expect-error to be checked not typed
        <SidePanelContent
          getColor={getColor}
          mapState={mapState}
          selectLevel={selectLevel}
          setMapState={setMapState}
          computeAreaStats={computeAreaStats}
          goBack={goBack}
          handleQuickNav={handleQuickNav}
          panelState={panelState}
          isMobile={isMobile}
        />
      }
      map={
        <InteractiveMap
          data={mapData}
          gradientColors={gradientColors}
          showGradientLegend={false}
          displayCircleValue={!isCityView}
          fillOpacity={isCityView ? 1 : 0}
          hoverFill={!isCityView}
          mapStyle={customMapStyle}
          strokeColor="#2A3C84"
          hoverStrokeColor="#000091"
          customLayers={customLayers}
        />
      }
    />
  ) : (
    <div>Chargement...</div>
  );
};

const CartographieDeploiement = () => {
  return (
    <MapProvider initialFilters={{ service_ids: null }} initialDepartmentView="city">
      <MapLayoutProvider>
        <DeploiementMap />
      </MapLayoutProvider>
    </MapProvider>
  );
};

export default CartographieDeploiement;
