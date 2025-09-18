"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import parentAreas from "../../../../public/parent_areas.json";
import MapWrapper from "../MapWrapper";
import SidePanelContent from "./SidePanelContent";

import { AreaStats, SelectedArea } from "../types";
import { AllStats, StatRecord } from "./types";

const CartographieDeploiement = () => {
  const [stats, setStats] = useState<AllStats>({} as AllStats);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapState, setMapState] = useState<any>({
    currentLevel: "country",
    selectedAreas: {},
    departmentView: "city",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [citiesByDepartment, setCitiesByDepartment] = useState<any>({});

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
          const city = citiesByDepartment[department.insee_geo].find(
            (city: { id: string }) => city.id === siret,
          );
          return {
            score: city ? 1 : 0,
          };
        } else {
          const nActiveCities =
            stats[level].find((stat) => stat.id === insee_geo.replace("r", ""))?.total || 0;
          const nTotalCities =
            parentAreas.find((area) => area.insee_geo === insee_geo)?.n_cities || 0;
          return {
            n_cities: nActiveCities,
            score: nTotalCities > 0 ? nActiveCities / nTotalCities : 0,
          };
        }
      } catch {
        return null;
      }
    },
    [stats, citiesByDepartment],
  );

  useEffect(() => {
    const fetchCitiesByDepartment = async () => {
      const data = await loadDepartmentCities(mapState.selectedAreas.department.insee_geo);
      setCitiesByDepartment((prev: { [key: string]: { id: string }[] }) => ({
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
      displayCircleValue={true}
    />
  );
};

export default CartographieDeploiement;
