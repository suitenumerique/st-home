"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import MapWrapper from "../MapWrapper";
import SidePanelContent from "./SidePanelContent";

import { AreaStats, SelectedArea } from "../types";
import { AllStats, StatRecord } from "./types";

const CartographieDeploiement = () => {
  const [stats, setStats] = useState<AllStats>({} as AllStats);
  const [maxValues, setMaxValues] = useState<{
    country?: number;
    region?: number;
    department?: number;
    epci?: number;
  }>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapState, setMapState] = useState<any>({
    currentLevel: "country",
    selectedAreas: {},
    departmentView: "city",
  });
  const [citiesByDepartment, setCitiesByDepartment] = useState({});

  const statsParams = useMemo(() => ({}), []);

  const loadStats = useCallback(
    async (level: "region" | "department" | "epci"): Promise<StatRecord[]> => {
      const scope = {
        region: "reg",
        department: "dep",
        epci: "epci",
      };
      const response = await fetch(`/api/deployment/stats?scope=list-${scope[level]}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 3600 },
      });
      const data = await response.json();
      return data.data;
    },
    [],
  );

  const loadDepartmentCities = useCallback(async (departmentCode: string) => {
    const response = await fetch(`/api/deployment/stats?scope=list-commune&dep=${departmentCode}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    });
    const data = await response.json();
    return data.data;
  }, []);

  const loadAllStats = useCallback(async () => {
    const regionStats = await loadStats("region");
    const departmentStats = await loadStats("department");
    const epciStats = await loadStats("epci");
    const countryStats = [
      {
        id: "00",
        total: 0,
        active: 0,
      } as StatRecord,
    ];

    regionStats.forEach((curr) => {
      countryStats[0].total += curr.total;
      countryStats[0].active += curr.active;
    });

    setStats({
      region: regionStats,
      department: departmentStats,
      epci: epciStats,
      country: countryStats,
    });

    setMaxValues({
      region: Math.max(...regionStats.map((stat) => stat.total)),
      department: Math.max(...departmentStats.map((stat) => stat.total)),
      epci: Math.max(...epciStats.map((stat) => stat.total)),
    });
  }, [loadStats]);

  const computeAreaStats = useCallback(
    (
      level: "country" | "region" | "department" | "epci" | "city",
      insee_geo: string,
      siret: string,
      department: SelectedArea,
      // statsParams?: any,
    ): AreaStats | null => {
      try {
        if (level === "city") {
          const city = citiesByDepartment[department.insee_geo].find((city) => city.id === siret);
          return {
            score: city ? 1 : 0,
          };
        } else {
          const nCities =
            stats[level].find((stat) => stat.id === insee_geo.replace("r", ""))?.total || 0;
          return {
            n_cities: nCities,
            score: nCities / maxValues[level] || 0,
          };
        }
      } catch {
        return null;
      }
    },
    [stats, maxValues, citiesByDepartment],
  );

  useEffect(() => {
    const fetchCitiesByDepartment = async () => {
      const data = await loadDepartmentCities(mapState.selectedAreas.department.insee_geo);
      setCitiesByDepartment((prev) => ({
        ...prev,
        [mapState.selectedAreas.department.insee_geo]: data,
      }));
    };
    if (
      mapState.currentLevel === "department" &&
      !citiesByDepartment[mapState.selectedAreas.department.insee_geo]
    ) {
      fetchCitiesByDepartment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapState.currentLevel]);

  useEffect(() => {
    loadAllStats();
  }, [loadAllStats]);

  return (
    <MapWrapper
      SidePanelContent={SidePanelContent}
      gradientColors={["#FFFFFF", "#2A3C84"]}
      gradientDomain={[0, 1]}
      showGradientLegend={false}
      computeAreaStats={computeAreaStats}
      statsParams={statsParams}
      mapState={mapState}
      setMapState={setMapState}
    />
  );
};

export default CartographieDeploiement;
