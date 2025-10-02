"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import HexbinLayer from "../HexbinLayer";
import MapWrapper from "../MapWrapper";
import SidePanelContent from "./SidePanelContent";

import parentAreas from "../../../../public/parent_areas.json";
import { AreaStats } from "../types";
import { StatRecord } from "./types";

const CartographieDeploiement = () => {
  const [stats, setStats] = useState<StatRecord[]>([]);
  const [coordMap, setCoordMap] = useState<Record<string, { longitude: number; latitude: number }>>(
    {},
  );
  const [services, setServices] = useState([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapState, setMapState] = useState<any>({
    currentLevel: "country",
    selectedAreas: {},
    departmentView: "city",
    filters: {
      service_ids: null,
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customLayers, setCustomLayers] = useState<any[]>([]);

  const HEXBIN_SIZE_COUNTRY = 0.1; // ~15km hexagon size in degrees
  const HEXBIN_SIZE_REGION = 0.1; // ~10km hexagon size in degrees

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
    ): AreaStats | null => {
      try {
        let filteredStats = stats;
        if (level === "region") {
          filteredStats = filteredStats.filter(
            (stat: StatRecord) => stat.reg === insee_geo.replace("r", ""),
          );
        } else if (level === "department") {
          filteredStats = filteredStats.filter((stat: StatRecord) => stat.dep === insee_geo);
        }
        if (mapState.filters.service_ids && mapState.filters.service_ids.length > 0) {
          filteredStats = filteredStats.filter((stat: StatRecord) =>
            mapState.filters.service_ids.some(
              (serviceId: number) =>
                stat.all_services && stat.all_services.includes(serviceId.toString()),
            ),
          );
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
          // const city = citiesByDepartment[
          //   `${department.insee_geo}${mapState.filters.service_id ? `_${mapState.filters.service_id}` : ""}`
          // ].find((city: { id: string }) => city.id === siret);
          // return {
          //   n_cities: 0,
          //   score: city ? 1 : 0,
          // };
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
            n_cities: filteredStats.filter.length,
            n_total_cities: nTotalCities,
            score: null,
          };
          // const levelStats = stats[level as keyof AllStats];
          // const nActiveCities =
          //   levelStats?.find((stat: StatRecord) => stat.id === insee_geo.replace("r", ""))?.total || 0;
          // const nTotalCities =
          //   parentAreas.find((area) => area.insee_geo === insee_geo)?.n_cities || 0;
          // return {
          //   n_cities: nActiveCities,
          //   score: nTotalCities > 0 ? nActiveCities / nTotalCities : 0,
          // };
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

  const createHexagon = (centerLat: number, centerLon: number, size: number): number[][] => {
    const coordinates = [];
    const radius = size * 0.35; // Make hexagon radius smaller to avoid overlap

    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 * Math.PI) / 180;
      // Account for latitude when calculating longitude offset
      const latOffset = radius * Math.cos(angle);
      const lonOffset = (radius * Math.sin(angle)) / Math.cos((centerLat * Math.PI) / 180);

      const lat = centerLat + latOffset;
      const lon = centerLon + lonOffset;
      coordinates.push([lon, lat]);
    }
    coordinates.push(coordinates[0]); // Close the polygon
    return coordinates;
  };

  const processDataToHexbin = useCallback(
    (
      apiData: StatRecord[],
      coordinatesMap: Record<string, { longitude: number; latitude: number }>,
    ): GeoJSON.FeatureCollection => {
      const hexCells = new Map();

      const filteredServices = mapState.filters.service_ids?.length
        ? mapState.filters.service_ids
        : services.map((service: { id: number }) => service.id);

      apiData.forEach((entry) => {
        const coords = coordinatesMap[entry.id.slice(0, 9)];

        if (!coords || !coords.longitude || !coords.latitude) {
          return;
        }

        const gridSize = hexbinSize;
        const hexHeight = gridSize * 0.6; // Closer vertical spacing

        // Calculate which row and column this point belongs to
        const row = Math.round(coords.latitude / hexHeight);
        const col = Math.round(coords.longitude / gridSize);

        // Offset every other row by half a grid size for interlocking
        const offsetLon = row % 2 === 0 ? 0 : gridSize / 2;
        const gridLon = col * gridSize + offsetLon;
        const gridLat = row * hexHeight;

        const hexKey = `${gridLon},${gridLat}`;

        // Aggregate in hex cell
        if (!hexCells.has(hexKey)) {
          hexCells.set(hexKey, {
            lon: gridLon,
            lat: gridLat,
            services_used: 0,
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
          cell.services_used += entry.all_services.filter((service: string) =>
            filteredServices.includes(Number(service)),
          ).length;
        }
      });

      // Convert to GeoJSON with hexagon polygons
      const features: GeoJSON.Feature<GeoJSON.Polygon>[] = [];
      hexCells.forEach((cell) => {
        if (cell.total_cities === 0 || cell.services_used === 0) {
          return;
        }

        const hexagonCoords = createHexagon(cell.lat, cell.lon, hexbinSize);
        const score = cell.services_used / (cell.total_cities * filteredServices.length);

        features.push({
          type: "Feature",
          properties: {
            score: score,
            centerLon: cell.lon,
            centerLat: cell.lat,
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
        (stat: StatRecord) => stat.reg === mapState.selectedAreas.region.insee_geo.replace("r", ""),
      );
    } else if (mapState.currentLevel === "department") {
      filteredStats = filteredStats.filter(
        (stat: StatRecord) => stat.dep === mapState.selectedAreas.department.insee_geo,
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
      !mapState.selectedAreas.city.additionalCityStats
    ) {
      const cityStats = stats.find(
        (stat: StatRecord) => stat.id === mapState.selectedAreas.city.siret,
      );
      if (cityStats) {
        // @ts-expect-error not typed
        setMapState((prevState) => ({
          ...prevState,
          selectedAreas: {
            ...prevState.selectedAreas,
            city: {
              ...prevState.selectedAreas.city,
              additionalCityStats: cityStats,
            },
          },
        }));
      }
    }
  }, [stats, mapState.selectedAreas.city, setMapState]);

  useEffect(() => {
    const fetchServices = async () => {
      const response = await fetch("/api/deployment/services");
      const data = await response.json();
      setServices(data);
    };
    fetchServices();
  }, []);

  return stats ? (
    <MapWrapper
      SidePanelContent={SidePanelContent}
      gradientColors={["#EEEEEE", "#2A3C84"]}
      gradientDomain={[0, 1]}
      showGradientLegend={false}
      computeAreaStats={computeAreaStats}
      mapState={mapState}
      setMapState={setMapState}
      displayCircleValue={false}
      customLayers={customLayers}
    />
  ) : (
    <div>Chargement...</div>
  );
};

export default CartographieDeploiement;
