"use client";

import { ReferentielConformite } from "@/pages/conformite/referentiel";
import * as d3 from "d3";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapProvider, useMapContext } from "../../context/MapContext";
import { MapLayoutProvider, useMapLayoutContext } from "../../context/MapLayoutContext";
import { useDisplayedGeoJSON } from "../../hooks/useDisplayedGeoJSON";
import { InteractiveMap } from "../../core/InteractiveMap";
import { MapLayout } from "../../core/MapLayout";
import { FeatureProperties, SelectedArea } from "../../types";
import SidePanelContent from "./SidePanelContent";
import { AllStats, StatRecord } from "./types";

const ConformiteMap = () => {
  const { mapState, setMapState, selectLevel, goBack, handleQuickNav } = useMapContext();
  const { panelState, setPanelState, isMobile } = useMapLayoutContext();
  
  const [statsCache, setStatsCache] = useState<Record<string, Record<string, StatRecord[]>>>({});
  const [loadingScopes, setLoadingScopes] = useState<Set<string>>(new Set());
  
  const currentSelectedRef = mapState.filters.rcpnt_ref as string | null;
  const currentPeriod = (mapState.filters.period as string) || "current";

  const gradientColors = ["#FF6868", "#FFC579", "#009081"];
  const gradientDomain = [0, 1, 2];
  
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

  const allRcpntRefs = useMemo(() => {
    return [
      "a",
      "1.a",
      "2.a",
      ...ReferentielConformite.flatMap((section) => section.items).map((item) => item.num),
    ];
  }, []);

  const loadStats = useCallback(
    async (level: "region" | "department" | "epci", period: string) => {
      const cacheKey = `${level}:${period}`;
      
      if (statsCache[cacheKey] || loadingScopes.has(cacheKey)) {
        return;
      }
      
      setLoadingScopes((prev) => new Set(prev).add(cacheKey));
      try {
        const scope = {
          region: "reg",
          department: "dep",
          epci: "epci",
        };
        
        const queryParams = new URLSearchParams({
          scope: scope[level],
          refs: allRcpntRefs.join(","),
        });
        
        if (period !== "current") {
          queryParams.set("period", period);
        }

        const response = await fetch(
          `/api/rcpnt/stats?${queryParams.toString()}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );
        const data = await response.json();
        
        setStatsCache((prev) => ({
          ...prev,
          [cacheKey]: data,
        }));
      } finally {
        setLoadingScopes((prev) => {
          const next = new Set(prev);
          next.delete(cacheKey);
          return next;
        });
      }
    },
    [allRcpntRefs, statsCache, loadingScopes],
  );

  const stats = useMemo<AllStats>(() => {
    return {
      region: statsCache[`region:${currentPeriod}`] || {},
      department: statsCache[`department:${currentPeriod}`] || {},
      epci: statsCache[`epci:${currentPeriod}`] || {},
      country: statsCache[`country:${currentPeriod}`] || {},
    };
  }, [statsCache, currentPeriod]);

  useEffect(() => {
    const requiredScopes: ("region" | "department" | "epci")[] = ["region"];
    
    if (["region", "department", "city"].includes(mapState.currentLevel)) {
      requiredScopes.push("department");
    }
    
    if (mapState.currentLevel === "department" && mapState.departmentView === "epci") {
      requiredScopes.push("epci");
    }
    
    requiredScopes.forEach((scope) => {
      loadStats(scope, currentPeriod);
    });
  }, [mapState.currentLevel, mapState.departmentView, currentPeriod, loadStats]);

  useEffect(() => {
    const regionCacheKey = `region:${currentPeriod}`;
    const countryCacheKey = `country:${currentPeriod}`;
    
    // Only compute if we have region data and don't have country data yet
    if (statsCache[regionCacheKey] && !statsCache[countryCacheKey]) {
      try {
        const regionData = statsCache[regionCacheKey];
        const countryStats = {
          "00": allRcpntRefs.map((ref) => {
            return {
              ref: ref,
              valid: Object.values(regionData).reduce(
                (acc, stat) => acc + (stat.find((s) => s.ref === ref)?.valid || 0),
                0,
              ),
              total: Object.values(regionData).reduce(
                (acc, stat) => acc + (stat.find((s) => s.ref === ref)?.total || 0),
                0,
              ),
            };
          }),
        };
        
        setStatsCache((prev) => ({
          ...prev,
          [countryCacheKey]: countryStats,
        }));
      } catch {
        setStatsCache((prev) => ({
          ...prev,
          [countryCacheKey]: { "00": [] },
        }));
      }
    }
  }, [statsCache, currentPeriod, allRcpntRefs]);

  const computeAreaStats = useCallback(
    (
      level: "country" | "region" | "department" | "epci" | "city",
      insee_geo: string,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      siret: string,
      department: SelectedArea,
    ) => {
      try {
        if (level === "city") {
          const cityRecord = department?.cities?.find((c) => c.insee_geo === insee_geo);
          if (!cityRecord?.rcpnt) {
            return null;
          }
          if (currentSelectedRef) {
            return {
              score: cityRecord.rcpnt.indexOf(currentSelectedRef) > -1 ? 2 : 0,
            };
          } else {
            return {
              score: ["1.a", "2.a"].reduce((acc, ref) => {
                return acc + (cityRecord.rcpnt!.indexOf(ref) > -1 ? 1 : 0);
              }, 0),
            };
          }
        } else {
          if (currentSelectedRef) {
            const stat = stats[level][insee_geo.replace("r", "")].find(
              (s) => s.ref === currentSelectedRef,
            ) || { valid: 0, total: 0 };
            return {
              n_cities: stat.total,
              score: (stat.valid / stat.total) * 2,
              details: {
                "0": stat.total - stat.valid,
                "2": stat.valid,
              },
            };
          }

          const stat = stats[level][insee_geo.replace("r", "")];
          const stat_a = stat.find((s) => s.ref === "a") || { valid: 0, total: 0 };
          const stat_1a = stat.find((s) => s.ref === "1.a") || { valid: 0, total: 0 };
          const stat_2a = stat.find((s) => s.ref === "2.a") || { valid: 0, total: 0 };
          const n_cities = stat["2"].total;
          const n_score_2 = stat_a.valid;
          const n_score_1 = stat_1a.valid - stat_a.valid + stat_2a.valid - stat_a.valid;
          const score = (n_score_2 * 2 + n_score_1 * 1) / stat_a.total;
          return {
            n_cities: n_cities,
            score: score,
            details: {
              "0": n_cities - n_score_2 - n_score_1,
              "1": n_score_1,
              "2": n_score_2,
            },
          };
        }
      } catch {
        return null;
      }
    },
    [stats, currentSelectedRef],
  );

  const geoJSON = useDisplayedGeoJSON(mapState);
  
  const mapData = useMemo(() => {
    if (!geoJSON || !stats.country) return {}; // Wait for stats to load
    
    const data: Record<string, { value?: number; score?: number; color: string; details?: unknown }> = {};
    const features = geoJSON.features;
    
    // Determine score level as in MapWrapper
    let scoreLevel: "country" | "region" | "department" | "epci" | "city";
    if (mapState.currentLevel === "region" && mapState.regionView === "city") {
        scoreLevel = "city";
    } else {
        scoreLevel = {
            country: "region",
            region: "department",
            department: mapState.departmentView === "city" ? "city" : "epci",
            epci: "city",
            city: "city",
        }[mapState.currentLevel] as "country" | "region" | "department" | "epci" | "city";
    }

    features.forEach((feature) => {
        const props = feature.properties as FeatureProperties;
        const code = props.INSEE_GEO || props.EPCI_SIREN || (props as unknown as { SIRET: string }).SIRET; // Handle SIRET for cities
        
        if (!code) return;

        const result = computeAreaStats(
            scoreLevel,
            props.INSEE_GEO || "",
            (props as unknown as { SIRET: string }).SIRET || "",

            (mapState.currentLevel === "region" && mapState.regionView === "city") 
                ? mapState.selectedAreas.region as SelectedArea
                : mapState.selectedAreas.department as SelectedArea
        );
        
        if (result) {
            data[code] = {
                value: result.n_cities ?? undefined,
                score: result.score ?? undefined,
                color: getColor(result.score),
                details: result.details
            };
        }
    });
    
    return data;
  }, [geoJSON, stats, mapState.currentLevel, mapState.departmentView, mapState.regionView, mapState.selectedAreas.department, mapState.selectedAreas.region, computeAreaStats, getColor]);

  return (
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
          panelState={panelState}
          isMobile={isMobile}
          container={null}
        />
      }
      map={
        <InteractiveMap
          data={mapData}
          gradientColors={gradientColors}
          showGradientLegend={true}
          displayCircleValue={false}
        />
      }
    />
  );
};

const CartographieConformite = () => {
  return (
    <MapProvider initialFilters={{ rcpnt_ref: null }}>
      <MapLayoutProvider>
        <ConformiteMap />
      </MapLayoutProvider>
    </MapProvider>
  );
};

export default CartographieConformite;
