"use client";

import { MapProvider, useMapContext } from "@/components/map/context/MapContext";
import { MapLayoutProvider, useMapLayoutContext } from "@/components/map/context/MapLayoutContext";
import { customMapStyle, InteractiveMap } from "@/components/map/core/InteractiveMap";
import { MapLayout } from "@/components/map/core/MapLayout";
import { useDisplayedGeoJSON } from "@/components/map/hooks/useDisplayedGeoJSON";
import * as d3 from "d3";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import parentAreas from "../../../../../public/parent_areas.json";
import { FeatureProperties, SelectedArea } from "../../types";
import SidePanelContent from "./SidePanelContent";
import { StatRecord } from "./types";

const REGION_CODES = [
  "01",
  "02",
  "03",
  "04",
  "06",
  "11",
  "24",
  "27",
  "28",
  "32",
  "44",
  "52",
  "53",
  "75",
  "76",
  "84",
  "93",
  "94",
];

const DeploiementMap = () => {
  const { mapState, setMapState, selectLevel, goBack, handleQuickNav } = useMapContext();
  const { panelState, isMobile } = useMapLayoutContext();

  const activeTab =
    (mapState.filters.active_tab as "utilisateurs" | "partenaires") ?? "utilisateurs";
  const setActiveTab = (tab: "utilisateurs" | "partenaires") =>
    setMapState({ ...mapState, filters: { ...mapState.filters, active_tab: tab } });

  const [allDeptsGeoJSON, setAllDeptsGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [operators, setOperators] = useState<any[]>([]);
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<number | null>(null);

  const [stats, setStats] = useState<StatRecord[]>([]);
  const [coordMap, setCoordMap] = useState<Record<string, { longitude: number; latitude: number }>>(
    {},
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customLayers, setCustomLayers] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab !== "partenaires" || allDeptsGeoJSON) return;
    Promise.all(
      REGION_CODES.map((code) =>
        fetch(`/geojson/departements_par_region/${code}.json`).then((r) => r.json()),
      ),
    ).then((results) => {
      const features = results.flatMap((fc: GeoJSON.FeatureCollection) => fc.features);
      setAllDeptsGeoJSON({ type: "FeatureCollection", features });
    });
  }, [activeTab, allDeptsGeoJSON]);

  useEffect(() => {
    if (operators.length > 0) return;
    fetch("/api/deployment/operators")
      .then((r) => r.json())
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setOperators((data.data || []).filter((op: any) => op.status && op.name !== "ANCT"));
      });
    // operators.length is intentionally omitted to fetch only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const response = await fetch("/api/deployment/stats?scope=list-commune&org_type=all");
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      const result = await response.json();
      if (!result.data || !Array.isArray(result.data))
        throw new Error("Invalid API response format");
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
        const orgType = mapState.filters.org_type as string | null;
        const serviceIds = mapState.filters.service_ids as number[] | null;
        const anctThreshold = !!(mapState.filters.anct_threshold_active as boolean);

        const applyPopulationThreshold = (stat: StatRecord) => {
          if (!anctThreshold) return true;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pop = (stat as any).population as number | null;
          if (pop == null) return true;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const type = (stat as any).type as string;
          if (type === "commune") return pop < 3500;
          if (type === "epci") return pop < 15000;
          return true;
        };

        const filterList = (list: StatRecord[]) => {
          let filtered = list.filter(applyPopulationThreshold);
          if (level === "region") {
            filtered = filtered.filter((stat) => stat.reg === insee_geo.replace("r", ""));
          } else if (level === "department") {
            filtered = filtered.filter((stat) => stat.dep === insee_geo);
          }
          if (serviceIds?.length) {
            return filtered.filter((stat) =>
              stat.all_services?.some((s: string) => serviceIds.includes(Number(s))),
            );
          }
          // @ts-expect-error not typed
          return filtered.filter((stat) => stat.all_services.length > 0);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const byType = (type: string) => stats.filter((s: any) => s.type === type);
        const activeTypes =
          !orgType || orgType === "all"
            ? ["commune", "epci", "departement", "region"]
            : [orgType === "department" ? "departement" : orgType];

        const filteredByType = activeTypes.flatMap((t) => filterList(byType(t)));


        if (level === "epci") {
          if (orgType === "department" || orgType === "region") {
            return { n_cities: 0, score: null };
          }
          const epciSiren = insee_geo;
          const communesInEpci = (activeTypes.includes("commune") ? byType("commune") : [])
            .filter(applyPopulationThreshold)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((stat: StatRecord) => (stat as any).epci_siren === epciSiren)
            .filter((stat: StatRecord) =>
              serviceIds?.length
                ? stat.all_services?.some((s: string) => serviceIds.includes(Number(s)))
                : (stat.all_services?.length ?? 0) > 0,
            );
          const epciInEpci = (activeTypes.includes("epci") ? byType("epci") : [])
            .filter(applyPopulationThreshold)
            .filter(
              (stat: StatRecord) => stat.id === epciSiren || stat.id.slice(0, 9) === epciSiren,
            )
            .filter((stat: StatRecord) =>
              serviceIds?.length
                ? stat.all_services?.some((s: string) => serviceIds.includes(Number(s)))
                : (stat.all_services?.length ?? 0) > 0,
            );
          const total = communesInEpci.length + epciInEpci.length;
          return { n_cities: total, score: total > 0 ? 1 : 0 };
        }

        if (level === "city") {
          const city = stats.find((s: StatRecord) => s.id === siret);
          if (!city) return { n_cities: 1, score: 0 };
          const hasService = serviceIds?.length
            ? city.all_services?.some((s: string) => serviceIds.includes(Number(s)))
            : (city.all_services?.length ?? 0) > 0;
          return { n_cities: 1, score: hasService ? 1 : 0 };
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
          const filterByArea = (list: StatRecord[]) => {
            if (level === "region") return list.filter((s) => s.reg === insee_geo.replace("r", ""));
            if (level === "department") return list.filter((s) => s.dep === insee_geo);
            return list;
          };

          const communeCount = filterList(byType("commune")).length;

          let score: number | null;
          if (orgType === "epci") {
            score = null;
          } else if (orgType === "department" || orgType === "region") {
            const dbType = orgType === "department" ? "departement" : "region";
            const totalInArea = filterByArea(byType(dbType)).length;
            score = totalInArea > 0 ? filteredByType.length / totalInArea : 0;
          } else {
            score = nTotalCities > 0 ? communeCount / nTotalCities : null;
          }

          return {
            n_cities: filteredByType.length,
            n_total_cities: nTotalCities,
            score,
          };
        }
      } catch {
        return { n_cities: 0, score: null };
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

    const orgTypeFilter = mapState.filters.org_type as string | null;

    const cityPointsGeoJSON: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features:
        !orgTypeFilter || orgTypeFilter === "commune"
          ? toPointFeatures(filterByServiceIds(stats))
          : [],
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

    const anctThreshold = !!(mapState.filters.anct_threshold_active as boolean);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyThreshold = (stat: StatRecord) => {
      if (!anctThreshold) return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pop = (stat as any).population as number | null;
      if (pop == null) return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const type = (stat as any).type as string;
      if (type === "commune") return pop < 3500;
      if (type === "epci") return pop < 15000;
      return true;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredEpciStats = filterByServiceIds(stats.filter((s: any) => s.type === "epci").filter(applyThreshold));


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
      features:
        !orgTypeFilter || orgTypeFilter === "epci" ? toEpciPointFeatures(filteredEpciStats) : [],
    };

    const selectedRegion =
      (mapState.selectedAreas.region as SelectedArea)?.insee_geo?.replace("r", "") ?? null;
    const selectedDep = (mapState.selectedAreas.department as SelectedArea)?.insee_geo ?? null;

    const communeColor = (() => {
      if (mapState.currentLevel === "region" && selectedRegion) {
        return ["case", ["==", ["get", "reg"], selectedRegion], "#009081", "#CCCCCC"];
      }
      if (["department", "epci", "city"].includes(mapState.currentLevel) && selectedDep) {
        return ["case", ["==", ["get", "dep"], selectedDep], "#009081", "#CCCCCC"];
      }
      return "#009081";
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
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 1.5, 8, 3, 12, 5, 16, 8],
              "circle-color": communeColor,
              "circle-opacity": 0.8,
            },
          } as import("react-map-gl/maplibre").LayerProps,
        ],
      },
      ...epciOutlineLayer,
    ]);
  }, [
    stats,
    coordMap,
    mapState.filters.org_type,
    mapState.filters.service_ids,
    mapState.filters.anct_threshold_active,
    mapState.currentLevel,
    mapState.selectedAreas,
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
    (mapState.currentLevel === "department" &&
      mapState.departmentView === "epci" &&
      mapState.filters.org_type === "epci") ||
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

  const operatorsForMap = useMemo(() => {
    if (!selectedServiceFilter) return operators;
    return operators.filter((op) =>
      op.services?.some((s: { id: number }) => s.id === selectedServiceFilter),
    );
  }, [operators, selectedServiceFilter]);

  const filteredOperators = useMemo(() => {
    let result = operatorsForMap;

    const { currentLevel, selectedAreas } = mapState;
    const selectedRegionCode = (selectedAreas.region as SelectedArea)?.insee_geo?.replace("r", "");
    const selectedDepCode = (selectedAreas.department as SelectedArea)?.insee_geo;

    if (currentLevel === "region" && selectedRegionCode && allDeptsGeoJSON) {
      const deptsInRegion = new Set(
        allDeptsGeoJSON.features
          .filter((f) => (f.properties as { INSEE_REG: string }).INSEE_REG === selectedRegionCode)
          .map((f) => (f.properties as { INSEE_GEO: string }).INSEE_GEO),
      );
      result = result.filter((op) =>
        (op.departments || []).some((dept: string) => deptsInRegion.has(dept)),
      );
    } else if (["department", "epci", "city"].includes(currentLevel) && selectedDepCode) {
      result = result.filter((op) => (op.departments || []).includes(selectedDepCode));
    }

    return result;
  }, [operatorsForMap, mapState, allDeptsGeoJSON]);

  const selectedAreaOwnServices = useMemo(() => {
    const { currentLevel, selectedAreas } = mapState;
    const selectedRegion = (selectedAreas.region as SelectedArea)?.insee_geo?.replace("r", "");
    const selectedDep = (selectedAreas.department as SelectedArea)?.insee_geo;
    const selectedEpci = (selectedAreas.epci as SelectedArea)?.insee_geo;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orgs: any[] = [];
    if (currentLevel === "region" && selectedRegion) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orgs = stats.filter((s: any) => s.type === "region" && s.reg === selectedRegion);
    } else if (currentLevel === "department" && selectedDep) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orgs = stats.filter((s: any) => s.type === "departement" && s.dep === selectedDep);
    } else if (currentLevel === "epci" && selectedEpci) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orgs = stats.filter((s: any) => s.type === "epci" && s.id?.slice(0, 9) === selectedEpci);
    }

    const allServiceIds = new Set<number>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orgs.flatMap((o: any) => (o.all_services || []).map(Number)),
    );
    return allServiceIds;
  }, [stats, mapState]);

  const partenairesLayer = useMemo(() => {
    if (activeTab !== "partenaires" || !allDeptsGeoJSON) return [];

    // Build dept -> status map: "partenaire" takes priority over "intention"
    const deptStatus: Record<string, string> = {};
    for (const op of operatorsForMap) {
      if (!op.status) continue;
      for (const dept of op.departments || []) {
        const current = deptStatus[dept];
        const isGreen = current === "partenaire" || current === "partenaire_avec_services";
        if (!isGreen) {
          deptStatus[dept] = op.status;
        }
      }
    }

    const { currentLevel, selectedAreas } = mapState;
    const selectedRegionCode = (selectedAreas.region as SelectedArea)?.insee_geo?.replace("r", "");
    const selectedDepCode = (selectedAreas.department as SelectedArea)?.insee_geo;

    const coloredGeoJSON = {
      ...allDeptsGeoJSON,
      features: allDeptsGeoJSON.features.map((f: GeoJSON.Feature) => {
        const props = f.properties as { INSEE_GEO: string; INSEE_REG: string };
        const code = props.INSEE_GEO;
        let highlighted = false;
        if (currentLevel === "region" && selectedRegionCode) {
          highlighted = props.INSEE_REG === selectedRegionCode;
        } else if (["department", "epci", "city"].includes(currentLevel) && selectedDepCode) {
          highlighted = code === selectedDepCode;
        }
        return {
          ...f,
          properties: {
            ...f.properties,
            operator_status: deptStatus[code] || null,
            highlighted,
          },
        };
      }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layers: any[] = [
      {
        id: "operators-depts-layer",
        source: { id: "operators-depts", type: "geojson" as const, data: coloredGeoJSON },
        layers: [
          {
            id: "operators-depts-fill",
            type: "fill",
            paint: {
              "fill-color": [
                "case",
                ["==", ["get", "operator_status"], "partenaire"],
                "#009081",
                ["==", ["get", "operator_status"], "partenaire_avec_services"],
                "#009081",
                ["==", ["get", "operator_status"], "intention"],
                "#E7AC2E",
                "#EEEEEE",
              ],
              "fill-opacity": 0.8,
            },
          } as import("react-map-gl/maplibre").LayerProps,
          {
            id: "operators-depts-stroke",
            type: "line",
            paint: {
              "line-color": "#ffffff",
              "line-width": 1.5,
              "line-opacity": 1,
            },
          } as import("react-map-gl/maplibre").LayerProps,
          {
            id: "operators-depts-hover-stroke",
            type: "line",
            paint: {
              "line-color": [
                "case",
                ["==", ["get", "operator_status"], "partenaire"],
                "#003D36",
                ["==", ["get", "operator_status"], "partenaire_avec_services"],
                "#003D36",
                ["==", ["get", "operator_status"], "intention"],
                "#716043",
                "#999999",
              ],
              "line-width": 2,
              "line-opacity": [
                "case",
                [
                  "all",
                  ["boolean", ["feature-state", "hover"], false],
                  ["!", ["boolean", ["get", "highlighted"], false]],
                ],
                1,
                0,
              ],
            },
          } as import("react-map-gl/maplibre").LayerProps,
          {
            id: "operators-depts-highlighted-fill",
            type: "fill",
            paint: {
              "fill-color": [
                "case",
                ["==", ["get", "operator_status"], "partenaire"],
                "#009081",
                ["==", ["get", "operator_status"], "partenaire_avec_services"],
                "#009081",
                ["==", ["get", "operator_status"], "intention"],
                "#E7AC2E",
                "#EEEEEE",
              ],
              "fill-opacity": ["case", ["boolean", ["get", "highlighted"], false], 0.8, 0],
            },
          } as import("react-map-gl/maplibre").LayerProps,
          {
            id: "operators-depts-highlighted-stroke",
            type: "line",
            paint: {
              "line-color": "#000091",
              "line-width": 2,
              "line-opacity": ["case", ["boolean", ["get", "highlighted"], false], 1, 0],
            },
          } as import("react-map-gl/maplibre").LayerProps,
        ],
      },
    ];

    // EPCI borders overlay when an EPCI or city is selected
    // geoJSONEPCI is typed as Feature[] but processGeoJSONEPCI returns a FeatureCollection
    const epciGeoJSON = (selectedAreas.department as SelectedArea)?.geoJSONEPCI as unknown as
      | GeoJSON.FeatureCollection
      | undefined;
    const selectedEpciCode = (selectedAreas.epci as SelectedArea)?.insee_geo;
    if (currentLevel === "epci" && epciGeoJSON && selectedEpciCode) {
      const selectedEpciFeature = epciGeoJSON.features.find(
        (f) => (f.properties as { INSEE_GEO: string })?.INSEE_GEO === selectedEpciCode,
      );
      if (selectedEpciFeature) {
        layers.push({
          id: "partenaires-epci-layer",
          source: {
            id: "partenaires-epci-outlines",
            type: "geojson" as const,
            data: { type: "FeatureCollection" as const, features: [selectedEpciFeature] },
          },
          layers: [
            {
              id: "partenaires-epci-stroke",
              type: "line",
              paint: {
                "line-color": "#000091",
                "line-width": 1.5,
                "line-opacity": 1,
              },
            } as import("react-map-gl/maplibre").LayerProps,
          ],
        });
      }
    }

    // City dot overlay when a city is selected
    if (currentLevel === "city") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cityArea = selectedAreas.city as any;
      const siret = cityArea?.siret as string | undefined;
      const coords = siret ? coordMap[siret.slice(0, 9)] : null;
      if (coords?.longitude && coords?.latitude) {
        layers.push({
          id: "partenaires-city-dot-layer",
          source: {
            id: "partenaires-city-dot",
            type: "geojson" as const,
            data: {
              type: "FeatureCollection" as const,
              features: [
                {
                  type: "Feature" as const,
                  geometry: {
                    type: "Point" as const,
                    coordinates: [coords.longitude, coords.latitude],
                  },
                  properties: {},
                },
              ],
            },
          },
          layers: [
            {
              id: "partenaires-city-dot-circle",
              type: "circle",
              paint: {
                "circle-radius": 10,
                "circle-color": "#000091",
                "circle-opacity": 1,
              },
            } as import("react-map-gl/maplibre").LayerProps,
          ],
        });
      }
    }

    return layers;
  }, [activeTab, allDeptsGeoJSON, operatorsForMap, filteredOperators, mapState, coordMap]);

  return stats ? (
    <MapLayout
      sidebar={
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        React.createElement(SidePanelContent as React.ComponentType<any>, {
          getColor,
          mapState,
          selectLevel,
          setMapState,
          computeAreaStats,
          goBack,
          handleQuickNav,
          panelState,
          isMobile,
          activeTab,
          setActiveTab,
          operators: filteredOperators,
          allServices: operators
            .flatMap((op) => op.services || [])
            .filter(
              (s: { id: number }, i: number, arr: { id: number }[]) =>
                arr.findIndex((x) => x.id === s.id) === i,
            ),
          selectedServiceFilter,
          setSelectedServiceFilter,
          selectedAreaOwnServices,
        })
      }
      map={
        <InteractiveMap
          data={activeTab === "partenaires" ? {} : mapData}
          gradientColors={gradientColors}
          showGradientLegend={false}
          displayCircleValue={!isCityView && activeTab !== "partenaires"}
          fillOpacity={activeTab === "partenaires" ? 0 : isCityView ? 1 : 0}
          hoverFill={!isCityView && activeTab !== "partenaires"}
          mapStyle={customMapStyle}
          strokeColor="#2A3C84"
          hoverStrokeColor="#000091"
          hideBaseLayer={activeTab === "partenaires"}
          neighbourClickOnly={activeTab === "partenaires"}
          additionalInteractiveLayerIds={
            activeTab === "partenaires" ? ["operators-depts-fill"] : []
          }
          customLayers={[...partenairesLayer, ...(activeTab === "partenaires" ? [] : customLayers)]}
        />
      }
    />
  ) : (
    <div>Chargement...</div>
  );
};

const CartographieDeploiement = () => {
  return (
    <MapProvider
      initialFilters={{ service_ids: null, active_tab: null }}
      initialDepartmentView="epci"
    >
      <MapLayoutProvider>
        <DeploiementMap />
      </MapLayoutProvider>
    </MapProvider>
  );
};

export default CartographieDeploiement;
