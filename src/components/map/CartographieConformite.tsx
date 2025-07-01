import * as turf from "@turf/turf";
import * as d3 from "d3";
import { MapLayerMouseEvent } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import parentAreas from "../../../public/parent_areas.json";
import MapContainer from "./MapContainer";
import SidePanel from "./SidePanel";
import SidePanelContent from "./SidePanelContent";

import {
  AllStats,
  CollectiviteRecord,
  MapState,
  ParentArea,
  SelectedArea,
  StatRecord,
} from "./types";

const ConformityMap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<AllStats>({} as AllStats);
  const [mapState, setMapState] = useState<MapState>({
    currentLevel: "country",
    selectedAreas: {},
    departmentView: "epci",
    selectedCity: null,
  });
  const [displayedRef, setDisplayedRef] = useState<string | null>(null);

  const rcpntRefs = [
    "1.1",
    "1.2",
    "1.3",
    "1.4",
    "1.5",
    "1.6",
    "1.7",
    "1.8",
    "2.1",
    "2.2",
    "2.3",
    "2.4",
    "2.5",
    "2.6",
    "2.7",
    "1.a",
    "1.aa",
    "2.a",
    "2.aa",
    "a",
    "aa",
  ];

  const [colorsConfig, setColorsConfig] = useState({
    domain: displayedRef ? [0, 1] : [0, 1, 2],
    range: displayedRef ? ["#D3ADFE", "#009081"] : ["#D3ADFE", "#669BBD", "#009081"],
    defaultColor: "#e2e8f0",
  });

  const colorScale = d3.scaleLinear(colorsConfig.domain, colorsConfig.range);

  const nextLevel = useMemo(() => {
    if (mapState.currentLevel === "department") {
      return mapState.departmentView === "epci" ? "epci" : "city";
    }
    const levelTransitions: { [key: string]: string } = {
      country: "region",
      region: "department",
      epci: "city",
    };
    return levelTransitions[mapState.currentLevel] || null;
  }, [mapState.currentLevel, mapState.departmentView]);

  // DATA LOADING
  const loadStats = async (
    level: "region" | "department" | "epci",
  ): Promise<Record<string, StatRecord[]>> => {
    const scope = {
      region: "reg",
      department: "dep",
      epci: "epci",
    };
    const response = await fetch(
      `/api/rcpnt/stats?scope=${scope[level]}&refs=${rcpntRefs.join(",")}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 3600 },
      },
    );
    const data = await response.json();
    return data;
  };

  const loadAllStats = async () => {
    const regionStats = await loadStats("region");
    const departmentStats = await loadStats("department");
    const epciStats = await loadStats("epci");
    const countryStats = {
      "00": rcpntRefs.map((ref) => {
        return {
          ref: ref,
          valid: Object.values(regionStats).reduce(
            (acc, stat) => acc + (stat.find((s) => s.ref === ref)?.valid || 0),
            0,
          ),
          total: Object.values(regionStats).reduce(
            (acc, stat) => acc + (stat.find((s) => s.ref === ref)?.total || 0),
            0,
          ),
        };
      }),
    };
    setStats({
      region: regionStats,
      department: departmentStats,
      epci: epciStats,
      country: countryStats,
    });
  };

  const loadDepartmentCities = async (departmentCode: string) => {
    const response = await fetch(`/api/rcpnt/stats?scope=list-commune&dep=${departmentCode}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    });
    const data = await response.json();
    return data;
  };

  const fetchGeoJSON = async (level: "country" | "region" | "department", code: string) => {
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
  };

  // PROCESSING
  const computeSelectedArea = async (
    level: "country" | "region" | "department" | "epci",
    code: string,
    withGeoJSON = false,
  ): Promise<SelectedArea> => {
    let selectedArea: SelectedArea;
    if (level === "country") {
      selectedArea = { insee_geo: "00", name: "France" };
    } else {
      selectedArea =
        (parentAreas as ParentArea[]).find((area) => area.insee_geo === code) ||
        ({ insee_geo: code, name: "Unknown", type: "unknown" } as ParentArea);
    }
    if (withGeoJSON) {
      selectedArea.conformityStats = computeAreaStats(level, {
        insee_geo: code,
      } as CollectiviteRecord);
      let childrenAreas;
      if (level === "department") {
        childrenAreas = await loadDepartmentCities(code);
        selectedArea.cities = childrenAreas;
      } else {
        childrenAreas = {
          country: parentAreas.filter((area) => area.type === "region"),
          region: parentAreas.filter(
            (area) => area.type === "department" && area.insee_reg === code,
          ),
        }[level as "country" | "region"];
      }
      if (level !== "epci") {
        const geoJSON = await fetchGeoJSON(level, code);
        const processedGeoJSON = processGeoJSON(level, geoJSON, childrenAreas);
        selectedArea.geoJSON = processedGeoJSON;
        if (level === "department") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          selectedArea.geoJSONEPCI = processGeoJSONEPCI(processedGeoJSON) as any;
        }
      }
    }
    return selectedArea;
  };

  const computeAreaStats = (
    level: "country" | "region" | "department" | "epci" | "city",
    record: ParentArea | CollectiviteRecord,
  ) => {
    if (level === "city") {
      const cityRecord = record as CollectiviteRecord;
      if (displayedRef) {
        return {
          score: cityRecord.rcpnt.indexOf(displayedRef) > -1 ? 1 : 0,
        };
      } else {
        return {
          score: ["1.a", "2.a"].reduce((acc, ref) => {
            return acc + (cityRecord.rcpnt.indexOf(ref) > -1 ? 1 : 0);
          }, 0),
        };
      }
    } else {
      if (displayedRef) {
        const stat = stats[level][record.insee_geo.replace("r", "")].find(
          (s) => s.ref === displayedRef,
        ) || { valid: 0, total: 0 };
        return {
          n_cities: stat.total,
          score: stat.valid / stat.total,
          details: {
            "0": stat.total - stat.valid,
            "1": stat.valid,
          },
        };
      }

      const stat = stats[level][record.insee_geo.replace("r", "")];
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
  };

  const processGeoJSON = (
    level: "country" | "region" | "department",
    geoJSON: GeoJSON.FeatureCollection,
    childrenAreas: (ParentArea | CollectiviteRecord)[],
  ) => {
    const features = geoJSON.features.map((feature) => {
      const properties = feature.properties as { CODE: string; NOM: string };
      const record = childrenAreas.find((r) => r.insee_geo === properties.CODE);
      if (!record) return feature;
      const scoreLevel = {
        country: "region",
        region: "department",
        department: "city",
      }[level];
      const score = computeAreaStats(scoreLevel as "region" | "department" | "city", record).score;
      return {
        ...feature,
        properties: {
          NAME: properties.NOM,
          TYPE: record.type,
          INSEE_GEO: properties.CODE,
          INSEE_REG: record.insee_reg,
          INSEE_DEP: record.insee_dep,
          EPCI_SIREN: record.epci_siren,
          SCORE: score,
          color: getColor(score),
        },
      };
    });

    return {
      ...geoJSON,
      features,
    };
  };

  const processGeoJSONEPCI = (geoJSON: GeoJSON.FeatureCollection) => {
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

      const score = record ? computeAreaStats("epci", record as ParentArea).score : null;

      merged.properties = {
        NAME: record ? record.name : "EPCI inconnue",
        TYPE: "epci",
        INSEE_GEO: record ? record.insee_geo : "EPCI inconnue",
        INSEE_REG: record ? record.insee_reg : "EPCI inconnue",
        INSEE_DEP: record ? record.insee_dep : "EPCI inconnue",
        SCORE: score,
        color: getColor(score),
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
  };

  // INTERACTIONS
  const handleAreaClick = async (event: MapLayerMouseEvent) => {
    if (event.features && event.features.length > 0) {
      const feature = event.features[0];
      if (nextLevel) {
        await selectLevel(
          nextLevel as "region" | "department" | "city",
          feature.properties.INSEE_GEO,
          "areaClick",
        );
      }
    }
  };

  const selectLevel = async (
    level: "country" | "region" | "department" | "epci" | "city",
    code: string,
    source = "areaClick",
  ) => {
    console.log("selectLevel", level, code, source);
    const allLevels = ["epci", "department", "region", "country"];
    const parentLevels = allLevels.slice(allLevels.indexOf(level) + 1);

    let newSelectedAreas: { [key: string]: SelectedArea };
    if (source === "quickNav") {
      newSelectedAreas = { country: mapState.selectedAreas.country };
    } else if (source == "backClick") {
      newSelectedAreas = parentLevels.reduce(
        (acc, lev) => {
          acc[lev] = mapState.selectedAreas[lev];
          return acc;
        },
        {} as { [key: string]: SelectedArea },
      );
    } else {
      newSelectedAreas = { ...mapState.selectedAreas };
    }

    if (source === "quickNav") {
      for (const parentLevel of parentLevels) {
        if (parentLevel === "epci" || parentLevel === "country") {
          continue;
        }
        let parentCode;
        if (!newSelectedAreas[parentLevel]) {
          if (parentLevel === "department") {
            if (level === "epci") {
              const foundParent = (parentAreas as ParentArea[]).find((p) => p.insee_geo === code);
              parentCode = foundParent?.insee_dep || "";
            } else if (level === "city") {
              if (code.slice(0, 2) === "97") {
                parentCode = code.slice(0, 3);
              } else {
                parentCode = code.slice(0, 2);
              }
            }
          } else {
            parentCode = newSelectedAreas["department"].insee_reg;
          }
          const withGeoJSON = parentLevel === "department";
          newSelectedAreas[parentLevel] = await computeSelectedArea(
            parentLevel as "country" | "region" | "department" | "epci",
            parentCode as string,
            withGeoJSON,
          );
        }
      }
    }

    if (level !== "city") {
      newSelectedAreas[level] = await computeSelectedArea(level, code, true);
    }
    const newMapState: Partial<MapState> = {
      selectedAreas: newSelectedAreas,
      selectedCity: null,
    };

    if (level === "city") {
      const selectedCity = newSelectedAreas["department"].cities?.find((c) => c.insee_geo === code);
      newMapState.selectedCity = selectedCity;

      if (source === "quickNav") {
        newMapState.departmentView = "city";
      }
    }

    if (level === "city") {
      newMapState.currentLevel = newSelectedAreas["epci"] ? "epci" : "department";
    } else {
      newMapState.currentLevel = level;
    }

    setMapState({ ...mapState, ...newMapState } as MapState);
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (container && container.requestFullscreen) {
      container.requestFullscreen();
    }
  };

  const handleApplyGradient = (colors: string[]) => {
    setColorsConfig({ ...colorsConfig, range: colors });
  };

  // RENDERING
  const getColor = (score: number | null | undefined): string => {
    return score === null || score === undefined ? colorsConfig.defaultColor : colorScale(score);
  };

  useEffect(() => {
    if (mapState.selectedAreas[mapState.currentLevel]) {
      selectLevel(
        mapState.currentLevel as "country" | "region" | "department" | "epci" | "city",
        mapState.selectedAreas[mapState.currentLevel].insee_geo,
        "quickNav",
      );
    }
  }, [colorsConfig]);

  useEffect(() => {
    if (Object.keys(stats).length > 0) {
      selectLevel("country", "00");
    }
  }, [stats]);

  useEffect(() => {
    setDisplayedRef(null);
    loadAllStats();
  }, []);

  return (
    <div ref={containerRef} style={{ display: "flex", width: "100%", height: "100%" }}>
      <SidePanel>
        <SidePanelContent getColor={getColor} mapState={mapState} selectLevel={selectLevel} />
      </SidePanel>
      <MapContainer
        handleAreaClick={handleAreaClick}
        handleFullscreen={handleFullscreen}
        mapState={mapState}
        selectLevel={selectLevel}
        colorsConfig={colorsConfig}
        handleApplyGradient={handleApplyGradient}
      />
    </div>
  );
};

export default ConformityMap;
