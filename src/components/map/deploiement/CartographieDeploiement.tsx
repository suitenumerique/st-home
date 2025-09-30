"use client";

import { useCallback, useEffect, useState } from "react";
import HexbinLayer from "../HexbinLayer";
import MapWrapper from "../MapWrapper";
import SidePanelContent from "./SidePanelContent";

import { AreaStats } from "../types";
import { StatRecord } from "./types";

const CartographieDeploiement = () => {
  const [stats, setStats] = useState<StatRecord[]>([]);
  const [coordMap, setCoordMap] = useState<Record<string, { longitude: number; latitude: number }>>(
    {},
  );
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
  const [hexbinGeoJSON, setHexbinGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [citiesByDepartment, setCitiesByDepartment] = useState<any>({});
  const [customLayers, setCustomLayers] = useState<any[]>([]);

  const HEXBIN_SIZE = 0.15; // ~15km hexagon size in degrees

  // const filteredStats = useMemo(() => {
  //   let filteredStats = stats;
  //   if (mapState.currentLevel === 'region') {
  //     filteredStats = filteredStats.filter((stat: StatRecord) => stat.reg === mapState.selectedAreas.region.insee_geo.replace("r", ""));
  //   } else if (mapState.currentLevel === 'department') {
  //     filteredStats = filteredStats.filter((stat: StatRecord) => stat.dep === mapState.selectedAreas.department.insee_geo);
  //   }
  //   if (mapState.filters.service_ids && mapState.filters.service_ids.length > 0) {
  //     filteredStats = filteredStats.filter((stat: StatRecord) => mapState.filters.service_ids.every((serviceId: number) => stat.all_services && stat.all_services.includes(serviceId.toString())));
  //   }
  //   return filteredStats;
  // }, [stats, mapState.filters.service_ids])

  const loadSirenCoordinatesMapping = useCallback(async (): Promise<void> => {
    const response = await fetch("/siren_coordinates.json");
    const data = await response.json();
    setCoordMap(data);
  }, []);

  const loadStats = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("http://localhost:8950/api/deployment/stats?scope=list-commune");
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
        if (level === "city") {
          const city = stats.find((city: { id: string }) => city.id === siret);
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
              mapState.filters.service_ids.every(
                (serviceId: number) =>
                  stat.all_services && stat.all_services.includes(serviceId.toString()),
              ),
            );
          }

          return {
            n_cities: filteredStats.length,
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
      } catch (e) {
        console.log(e);
        return {
          n_cities: 0,
          score: null,
        };
      }
    },
    [stats, citiesByDepartment, mapState.filters],
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

      apiData.forEach((entry) => {
        const coords = coordinatesMap[entry.id.slice(0, 9)];

        if (!coords || !coords.longitude || !coords.latitude) {
          return;
        }

        // Create interlocking hexagonal grid
        const gridSize = HEXBIN_SIZE;
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
            count: 0,
            entries: [],
          });
        }

        const cell = hexCells.get(hexKey);
        cell.count++;
        cell.entries.push(entry);
      });

      // Convert to GeoJSON with hexagon polygons
      const features: GeoJSON.Feature<GeoJSON.Polygon>[] = [];
      hexCells.forEach((cell) => {
        const hexagonCoords = createHexagon(cell.lat, cell.lon, HEXBIN_SIZE);

        features.push({
          type: "Feature",
          properties: {
            count: cell.count,
            density: Math.min(cell.count, 100),
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
    [HEXBIN_SIZE],
  );

  useEffect(() => {
    if (!stats || !coordMap || stats.length === 0) return;

    if (["department", "epci", "city"].includes(mapState.currentLevel)) {
      setCustomLayers([]);
      setHexbinGeoJSON(null);
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
    if (mapState.filters.service_ids && mapState.filters.service_ids.length > 0) {
      filteredStats = filteredStats.filter((stat: StatRecord) =>
        mapState.filters.service_ids.every(
          (serviceId: number) =>
            stat.all_services && stat.all_services.includes(serviceId.toString()),
        ),
      );
    }

    const hexbinData = processDataToHexbin(filteredStats, coordMap);
    setHexbinGeoJSON(hexbinData);

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
    mapState.filters.service_ids,
  ]);

  useEffect(() => {
    const loadData = async () => {
      await loadSirenCoordinatesMapping();
      await loadStats();
    };
    loadData();
  }, [loadSirenCoordinatesMapping, loadStats]);

  return (
    <MapWrapper
      SidePanelContent={SidePanelContent}
      gradientColors={["#FFFFFF", "#2A3C84"]}
      gradientDomain={[0, 1]}
      showGradientLegend={false}
      computeAreaStats={computeAreaStats}
      mapState={mapState}
      setMapState={setMapState}
      displayCircleValue={false}
      customLayers={customLayers}
    />
  );
};

export default CartographieDeploiement;
