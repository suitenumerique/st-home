"use client";

import { useCallback, useEffect, useState } from "react";
import MapWrapper from "../MapWrapper";
import SidePanelContent from "./SidePanelContent";

import parentAreas from "../../../../public/parent_areas.json";
import { AreaStats } from "../types";
import { StatRecord } from "./types";

const CartographieDeploiementBis = () => {
  const [stats, setStats] = useState<StatRecord[]>([]);
  // const [coordMap, setCoordMap] = useState<Record<string, { longitude: number; latitude: number }>>(
  //   {},
  // );
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
  const [allCitiesGeoJSON, setAllCitiesGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);

  const loadSirenCoordinatesMapping = useCallback(async (): Promise<void> => {
    // const response = await fetch("/siren_coordinates.json");
    // const data = await response.json();
    // setCoordMap(data);
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

  const loadAllCities = useCallback(async (): Promise<void> => {
    try {
      // List of all department codes
      const departmentCodes = [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
        "27",
        "28",
        "29",
        "2A",
        "2B",
        "30",
        "31",
        "32",
        "33",
        "34",
        "35",
        "36",
        "37",
        "38",
        "39",
        "40",
        "41",
        "42",
        "43",
        "44",
        "45",
        "46",
        "47",
        "48",
        "49",
        "50",
        "51",
        "52",
        "53",
        "54",
        "55",
        "56",
        "57",
        "58",
        "59",
        "60",
        "61",
        "62",
        "63",
        "64",
        "65",
        "66",
        "67",
        "68",
        "69",
        "70",
        "71",
        "72",
        "73",
        "74",
        "75",
        "76",
        "77",
        "78",
        "79",
        "80",
        "81",
        "82",
        "83",
        "84",
        "85",
        "86",
        "87",
        "88",
        "89",
        "90",
        "91",
        "92",
        "93",
        "94",
        "95",
        "971",
        "972",
        "973",
        "974",
        "976",
      ];

      const allFeatures: GeoJSON.Feature[] = [];

      // Load cities from each department
      for (const deptCode of departmentCodes) {
        try {
          const response = await fetch(`/geojson/communes_par_departement/${deptCode}.json`);
          if (response.ok) {
            const geojson = await response.json();
            if (geojson.type === "FeatureCollection" && Array.isArray(geojson.features)) {
              allFeatures.push(...geojson.features);
            }
          }
        } catch (error) {
          console.warn(`Failed to load department ${deptCode}:`, error);
        }
      }

      // Process features to add color based on stats
      const processedFeatures = allFeatures.map((feature) => {
        const siret = feature.properties?.SIRET;
        if (!siret) return feature;

        // Compute stats for this city
        const areaStats = computeAreaStats("city", "", siret);

        // Set color based on whether the city has stats (is deployed)
        const fillColor = areaStats && areaStats.score === 1 ? "#2A3C84" : "transparent";

        return {
          ...feature,
          properties: {
            ...feature.properties,
            fillColor: fillColor,
            hasStats: areaStats && areaStats.score === 1,
          },
        };
      });

      const combinedGeoJSON: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: processedFeatures,
      };

      setAllCitiesGeoJSON(combinedGeoJSON);
    } catch (error) {
      console.error("Error loading all cities:", error);
    }
  }, [computeAreaStats]);

  // Create custom layer with all cities
  useEffect(() => {
    if (!allCitiesGeoJSON) {
      setCustomLayers([]);
      return;
    }

    setCustomLayers([
      {
        id: "all-cities-layer",
        source: {
          id: "all-cities-source",
          type: "geojson",
          data: allCitiesGeoJSON,
        },
        layers: [
          {
            id: "all-cities-fill",
            type: "fill",
            source: "all-cities-source",
            paint: {
              "fill-color": ["get", "fillColor"],
            },
          },
          {
            id: "all-cities-stroke",
            type: "line",
            source: "all-cities-source",
            paint: {
              "line-color": "#2A3C84",
              "line-width": 0,
            },
          },
        ],
      },
    ]);
  }, [allCitiesGeoJSON]);

  useEffect(() => {
    const loadData = async () => {
      await loadSirenCoordinatesMapping();
      await loadStats();
    };
    loadData();
  }, [loadSirenCoordinatesMapping, loadStats]);

  // Load all cities after stats are loaded
  useEffect(() => {
    if (stats.length > 0) {
      loadAllCities();
    }
  }, [stats, loadAllCities]);

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

export default CartographieDeploiementBis;
