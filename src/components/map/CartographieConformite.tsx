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
import SidePanelContent from "./SidePanelContent";
import rcpntRefs from "./rcpntRefs.json";

import {
  AllStats,
  FeatureProperties,
  MapState,
  ParentArea,
  SelectedArea,
  StatRecord,
} from "./types";

const useMapURLState = () => {
  const router = useRouter();

  const getURLState = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      currentLevel: urlParams.get("level") || "country",
      currentAreaCode: urlParams.get("area") || "00",
      selectedRef: urlParams.get("ref"),
    };
  }, []);

  const updateURLState = useCallback(
    (currentLevel: string, currentAreaCode: string, selectedRef: string | null) => {
      const params = new URLSearchParams();
      if (currentLevel !== "country") {
        params.set("level", currentLevel);
      }
      if (currentAreaCode !== "00") {
        params.set("area", currentAreaCode);
      }
      if (selectedRef) {
        params.set("ref", selectedRef);
      }
      const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
      router.replace(newURL, { scroll: false });
    },
    [router],
  );

  return { getURLState, updateURLState };
};

const ConformityMap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<AllStats>({} as AllStats);

  const { getURLState, updateURLState } = useMapURLState();

  const [mapState, setMapState] = useState<MapState>({
    currentLevel: "country",
    selectedAreas: {},
    departmentView: "epci",
    selectedRef: null,
  });

  const [selectedGradient, setSelectedGradient] = useState<string[]>([
    "#FF6868",
    "#FFC579",
    "#009081",
  ]);

  const colorsConfig = useMemo(() => {
    return {
      domain: [0, 1, 2],
      range: selectedGradient,
      defaultColor: "#e2e8f0",
    };
  }, [selectedGradient]);

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
      `/api/rcpnt/stats?scope=${scope[level]}&refs=${rcpntRefs.map((ref) => ref.key).join(",")}`,
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
          ref: ref.key,
          valid: Object.values(regionStats).reduce(
            (acc, stat) => acc + (stat.find((s) => s.ref === ref.key)?.valid || 0),
            0,
          ),
          total: Object.values(regionStats).reduce(
            (acc, stat) => acc + (stat.find((s) => s.ref === ref.key)?.total || 0),
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

  const fetchSelectedCity = async (siret: string) => {
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
  };

  // PROCESSING
  const computeSelectedArea = async (
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
      selectedArea.conformityStats = computeAreaStats(level, code) || undefined;
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
  };

  const computeAreaStats = (
    level: "country" | "region" | "department" | "epci" | "city",
    insee_geo: string,
  ) => {
    if (level === "city") {
      const cityRecord = (mapState.selectedAreas.department as SelectedArea)?.cities?.find(
        (c) => c.insee_geo === insee_geo,
      );
      if (!cityRecord?.rcpnt) {
        return null;
      }
      if (mapState.selectedRef) {
        return {
          score: cityRecord.rcpnt.indexOf(mapState.selectedRef) > -1 ? 2 : 0,
        };
      } else {
        return {
          score: ["1.a", "2.a"].reduce((acc, ref) => {
            return acc + (cityRecord.rcpnt!.indexOf(ref) > -1 ? 1 : 0);
          }, 0),
        };
      }
    } else {
      if (mapState.selectedRef) {
        const stat = stats[level][insee_geo.replace("r", "")].find(
          (s) => s.ref === mapState.selectedRef,
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
  };

  // INTERACTIONS
  const handleAreaClick = async (event: MapLayerMouseEvent) => {
    if (event.features && event.features.length > 0) {
      const feature = event.features[0];
      if (nextLevel) {
        await selectLevel(
          nextLevel as "region" | "department" | "city",
          nextLevel === "city" ? feature.properties.SIRET : feature.properties.INSEE_GEO,
          "areaClick",
        );
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

  const selectLevel = async (
    level: "country" | "region" | "department" | "epci" | "city",
    code: string,
    source = "areaClick",
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

    if (level === "city" && source === "quickNav") {
      newMapState.departmentView = "city";
    }

    setMapState({ ...mapState, ...newMapState } as MapState);
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (container && container.requestFullscreen) {
      container.requestFullscreen();
    }
  };

  // RENDERING
  const getColor = (score: number | null | undefined): string => {
    const colorScale = d3.scaleLinear(colorsConfig.domain, colorsConfig.range);
    return score === null || score === undefined ? colorsConfig.defaultColor : colorScale(score);
  };

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
      (displayedGeoJSON as GeoJSON.FeatureCollection).features.forEach((feature) => {
        const scoreLevel = {
          country: "region",
          region: "department",
          department: mapState.departmentView === "city" ? "city" : "epci",
          epci: "city",
          city: "city",
        }[mapState.currentLevel];
        const score = computeAreaStats(
          scoreLevel as "region" | "department" | "city",
          feature.properties?.INSEE_GEO || "",
        )?.score;
        feature.properties!.SCORE = score;
        feature.properties!.color = getColor(score);
      });
      (displayedGeoJSON as GeoJSON.FeatureCollection & { id: string }).id =
        `geojson-${Math.random().toString(36).substring(2, 15)}`;
    }
    return displayedGeoJSON;
  }, [
    mapState.currentLevel,
    mapState.selectedAreas,
    mapState.departmentView,
    mapState.selectedRef,
  ]);

  useEffect(() => {
    if (mapState.selectedAreas[mapState.currentLevel]) {
      const areaCode =
        mapState.currentLevel === "city"
          ? (mapState.selectedAreas["city"] as Commune)?.siret
          : (mapState.selectedAreas[mapState.currentLevel] as SelectedArea)?.insee_geo || "";
      updateURLState(mapState.currentLevel, areaCode, mapState.selectedRef);
    }
  }, [mapState.currentLevel, mapState.selectedAreas, mapState.selectedRef, updateURLState]);

  useEffect(() => {
    loadAllStats();
  }, []);

  useEffect(() => {
    if (Object.keys(stats).length > 0) {
      const urlState = getURLState();
      if (urlState.currentLevel !== "country" || urlState.currentAreaCode !== "00") {
        selectLevel(
          urlState.currentLevel as "country" | "region" | "department" | "epci" | "city",
          urlState.currentAreaCode,
          "quickNav",
        );
      } else {
        selectLevel("country", "00");
      }
    }
  }, [stats]);

  return (
    <div ref={containerRef} style={{ display: "flex", width: "100%", height: "100%" }}>
      <SidePanel>
        <SidePanelContent
          rcpntRefs={rcpntRefs}
          getColor={getColor}
          mapState={mapState}
          selectLevel={selectLevel}
          setMapState={setMapState}
          goBack={goBack}
          container={containerRef.current}
        />
      </SidePanel>
      <MapContainer
        currentGeoJSON={currentGeoJSON as GeoJSON.FeatureCollection}
        handleAreaClick={handleAreaClick}
        handleFullscreen={handleFullscreen}
        mapState={mapState}
        selectLevel={selectLevel}
        selectedGradient={selectedGradient}
        setSelectedGradient={setSelectedGradient}
      />
    </div>
  );
};

export default ConformityMap;
