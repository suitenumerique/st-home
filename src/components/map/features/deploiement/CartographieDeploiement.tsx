"use client";

import { MapProvider, useMapContext } from "@/components/map/context/MapContext";
import { MapLayoutProvider } from "@/components/map/context/MapLayoutContext";
import { useDisplayedGeoJSON } from "@/components/map/hooks/useDisplayedGeoJSON";
import { InteractiveMap } from "@/components/map/core/InteractiveMap";
import { MapLayout } from "@/components/map/core/MapLayout";
import * as d3 from "d3";
import { useCallback, useEffect, useMemo, useState } from "react";
import parentAreas from "../../../../../public/parent_areas.json";
import HexbinLayer from "../../layers/HexbinLayer";
import { FeatureProperties, SelectedArea } from "../../types";
import SidePanelContent from "./SidePanelContent";
import { StatRecord } from "./types";

const DeploiementMap = () => {
  const { mapState, setMapState, selectLevel, goBack, handleQuickNav } = useMapContext();
  
  const [stats, setStats] = useState<StatRecord[]>([]);
  const [coordMap, setCoordMap] = useState<Record<string, { longitude: number; latitude: number }>>(
    {},
  );
  const [services, setServices] = useState([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customLayers, setCustomLayers] = useState<any[]>([]);

  const gradientColors = ["#EEEEEE", "#2A3C84"];
  const gradientDomain = [0, 1];

  const colorsConfig = useMemo(() => {
    return {
      domain: gradientDomain,
      range: gradientColors,
      defaultColor: "#e2e8f0",
    };
  }, []);

  const getColor = useCallback(
    (score: number | null | undefined): string => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const colorScale = d3.scaleLinear(colorsConfig.domain as any, colorsConfig.range as any);
      // @ts-expect-error d3 types
      return score === null || score === undefined ? colorsConfig.defaultColor : colorScale(score);
    },
    [colorsConfig],
  );

  // Hex size in meters (Web Mercator). Use same size at all latitudes to avoid distortion
  const HEXBIN_SIZE_COUNTRY = 15000; // ~15 km across-flats
  const HEXBIN_SIZE_REGION = 12000; // ~12 km across-flats

  const hexbinSize = useMemo(() => {
    return mapState.currentLevel === "country" ? HEXBIN_SIZE_COUNTRY : HEXBIN_SIZE_REGION;
  }, [mapState.currentLevel]);

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
            score: null,
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

  // Web Mercator helpers (meters)
  const EARTH_RADIUS = 6378137;
  const toMercator = (lat: number, lon: number): { x: number; y: number } => {
    const lambda = (lon * Math.PI) / 180;
    const phi = (lat * Math.PI) / 180;
    const x = EARTH_RADIUS * lambda;
    const y = EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + phi / 2));
    return { x, y };
  };
  const fromMercator = (x: number, y: number): { lat: number; lon: number } => {
    const lon = (x / EARTH_RADIUS) * (180 / Math.PI);
    const lat = (2 * Math.atan(Math.exp(y / EARTH_RADIUS)) - Math.PI / 2) * (180 / Math.PI);
    return { lat, lon };
  };

  // Build a hex polygon around a Mercator center using a radius in meters, return lon/lat ring
  const createHexagon = (centerX: number, centerY: number, acrossFlats: number): number[][] => {
    const coordinates: number[][] = [];
    // Convert across-flats to circumradius (center to vertex) for a regular hexagon
    const radius = acrossFlats / Math.sqrt(3);
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i + 30); // flat-topped hex
      const vx = centerX + radius * Math.cos(angle);
      const vy = centerY + radius * Math.sin(angle);
      const { lat, lon } = fromMercator(vx, vy);
      coordinates.push([lon, lat]);
    }
    coordinates.push(coordinates[0]);
    return coordinates;
  };

  const processDataToHexbin = useCallback(
    (
      apiData: StatRecord[],
      coordinatesMap: Record<string, { longitude: number; latitude: number }>,
    ): GeoJSON.FeatureCollection => {
      const hexCells = new Map();

      const filteredServices = (mapState.filters.service_ids as number[])?.length
        ? (mapState.filters.service_ids as number[])
        : services.map((service: { id: number }) => service.id);

      apiData.forEach((entry) => {
        const coords = coordinatesMap[entry.id.slice(0, 9)];

        if (!coords || !coords.longitude || !coords.latitude) {
          return;
        }

        // Project to Web Mercator meters
        const { x, y } = toMercator(coords.latitude, coords.longitude);

        // Hex grid dimensions (flat-topped)
        const hexWidth = hexbinSize; // across flats (meters)
        const hexHeight = Math.sqrt(3) * (hexWidth / 2); // vertical spacing between rows

        // Compute row/col indices for an offset grid (odd-r horizontal layout)
        const row = Math.round(y / hexHeight);
        const col = Math.round((x - (row % 2 ? hexWidth / 2 : 0)) / hexWidth);

        const gridX = col * hexWidth + (row % 2 ? hexWidth / 2 : 0);
        const gridY = row * hexHeight;

        const hexKey = `${gridX},${gridY}`;

        // Aggregate in hex cell
        if (!hexCells.has(hexKey)) {
          hexCells.set(hexKey, {
            x: gridX,
            y: gridY,
            used_products: 0,
            total_cities: 0,
          });
        }

        const cell = hexCells.get(hexKey);
        cell.total_cities++;

        if (
          // @ts-expect-error not typed
          entry.all_services.some((service: string) => filteredServices.includes(Number(service)))
        ) {
          // @ts-expect-error not typed
          cell.used_products += entry.all_services.filter((service: string) =>
            filteredServices.includes(Number(service)),
          ).length;
        }
      });

      // Convert to GeoJSON with hexagon polygons
      const features: GeoJSON.Feature<GeoJSON.Polygon>[] = [];
      hexCells.forEach((cell) => {
        if (cell.total_cities === 0 || cell.used_products === 0) {
          return;
        }

        const hexagonCoords = createHexagon(cell.x, cell.y, hexbinSize);
        const score = cell.used_products / (filteredServices.length * cell.total_cities);

        features.push({
          type: "Feature",
          properties: {
            score: score,
            // Keep center for potential debugging (lon/lat)
            centerLon: fromMercator(cell.x, cell.y).lon,
            centerLat: fromMercator(cell.x, cell.y).lat,
          },
          geometry: {
            type: "Polygon",
            coordinates: [hexagonCoords],
          },
        });
      });

      return {
        type: "FeatureCollection" as const,
        features: features,
      };
    },
    [hexbinSize, mapState.filters.service_ids, services],
  );

  useEffect(() => {
    if (!stats || !coordMap || stats.length === 0) return;

    if (["department", "epci", "city"].includes(mapState.currentLevel)) {
      setCustomLayers([]);
      return;
    }

    let filteredStats = stats;
    if (mapState.currentLevel === "region") {
      filteredStats = filteredStats.filter(
        (stat: StatRecord) => stat.reg === (mapState.selectedAreas.region as SelectedArea).insee_geo.replace("r", ""),
      );
    } else if (mapState.currentLevel === "department") {
      filteredStats = filteredStats.filter(
        (stat: StatRecord) => stat.dep === (mapState.selectedAreas.department as SelectedArea).insee_geo,
      );
    }

    const hexbinData = processDataToHexbin(filteredStats, coordMap);

    setCustomLayers([
      {
        id: "hexbin-layer",
        component: HexbinLayer,
        props: {
          data: hexbinData,
          id: "deployment-hexbin",
          showLabels: false,
        },
      },
    ]);
  }, [
    stats,
    coordMap,
    processDataToHexbin,
    mapState.currentLevel,
    mapState.selectedAreas,
    mapState.filters,
  ]);

  useEffect(() => {
    const loadData = async () => {
      await loadSirenCoordinatesMapping();
      await loadStats();
    };
    loadData();
  }, [loadSirenCoordinatesMapping, loadStats]);

  useEffect(() => {
    if (
      stats.length > 0 &&
      mapState.selectedAreas.city &&
      !(mapState.selectedAreas.city as any).additionalCityStats
    ) {
      const cityStats = stats.find(
        (stat: StatRecord) => stat.id === (mapState.selectedAreas.city as any).siret,
      );
      if (cityStats) {
        setMapState({
          ...mapState,
          selectedAreas: {
            ...mapState.selectedAreas,
            city: {
              ...(mapState.selectedAreas.city as any),
              additionalCityStats: cityStats,
            },
          },
        });
      }
    }
  }, [stats, mapState.selectedAreas.city, setMapState, mapState]);

  useEffect(() => {
    const fetchServices = async () => {
      const response = await fetch("/api/deployment/services");
      const data = await response.json();
      setServices(data);
    };
    fetchServices();
  }, []);

  const geoJSON = useDisplayedGeoJSON(mapState);
  
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
        const code = props.INSEE_GEO || props.EPCI_SIREN || (props as unknown as { SIRET: string }).SIRET;
        
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
                color: getColor(result.score),
            };
        }
    });
    
    return data;
  }, [geoJSON, stats, mapState.currentLevel, mapState.departmentView, computeAreaStats, getColor]);

  return stats ? (
    <MapLayout
      sidebar={
        <SidePanelContent
           getColor={getColor}
           mapState={mapState}
           selectLevel={selectLevel}
           setMapState={setMapState}
           computeAreaStats={computeAreaStats}
           goBack={goBack}
           handleQuickNav={handleQuickNav}
        />
      }
      map={
        <InteractiveMap
          data={mapData}
          gradientColors={gradientColors}
          showGradientLegend={false}
          displayCircleValue={false}
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
    <MapProvider initialFilters={{ service_ids: null }}>
      <MapLayoutProvider>
        <DeploiementMap />
      </MapLayoutProvider>
    </MapProvider>
  );
};

export default CartographieDeploiement;
