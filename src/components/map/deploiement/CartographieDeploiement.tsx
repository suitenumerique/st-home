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
    filters: {
      service_id: null,
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [citiesByDepartment, setCitiesByDepartment] = useState<any>({});

  const statsParams = useMemo(() => ({}), []);

  const loadStats = useCallback(
    async (
      level: "region" | "department" | "epci",
      service_id: string | null,
    ): Promise<StatRecord[]> => {
      const scope = {
        region: "reg",
        department: "dep",
        epci: "epci",
      };
      const response = await fetch(
        `/api/deployment/stats?scope=list-${scope[level]}${service_id ? `&service_id=${service_id}` : ""}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          next: { revalidate: 3600 },
        },
      );
      const data = await response.json();
      return data.data;
    },
    [],
  );

  const loadDepartmentCities = useCallback(
    async (departmentCode: string, service_id: string | null) => {
      const response = await fetch(
        `/api/deployment/stats?scope=list-commune&dep=${departmentCode}${service_id ? `&service_id=${service_id}` : ""}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          next: { revalidate: 3600 },
        },
      );
      const data = await response.json();
      return data.data;
    },
    [],
  );

  const loadAllStats = useCallback(
    async (service_id: string | null) => {
      const regionStats = await loadStats("region", service_id);
      const departmentStats = await loadStats("department", service_id);
      const epciStats = await loadStats("epci", service_id);
      regionStats.forEach((region) => {
        const parentArea = parentAreas.find((area) => area.insee_geo === `r${region.id}`);
        if (parentArea) {
          region.score = (region.total || 0) / parentArea.n_cities || 0;
        }
      });
      departmentStats.forEach((department) => {
        const parentArea = parentAreas.find((area) => area.insee_geo === department.id);
        if (parentArea) {
          department.score = (department.total || 0) / parentArea.n_cities || 0;
        }
      });
      const countryStats = [
        {
          id: "00",
          total: 0,
          active: 0,
          score: 0,
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
    },
    [loadStats],
  );

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
          const city = citiesByDepartment[
            `${department.insee_geo}${mapState.filters.service_id ? `_${mapState.filters.service_id}` : ""}`
          ].find((city: { id: string }) => city.id === siret);
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
    [stats, citiesByDepartment, mapState.filters.service_id],
  );

  const maxDomain = useMemo(() => {
    const level = {
      country: "region",
      region: "department",
      department: "city",
    }[mapState.currentLevel as "country" | "region" | "department"] as
      | "region"
      | "department"
      | "city";
    if (level === "city") {
      return 1;
    }
    if (stats[level]) {
      return Math.max(...stats[level].map((stat) => stat.score));
    }
    return 0;
  }, [stats, mapState.currentLevel]);

  useEffect(() => {
    const fetchCitiesByDepartment = async () => {
      const data = await loadDepartmentCities(
        mapState.selectedAreas.department.insee_geo,
        mapState.filters.service_id,
      );
      setCitiesByDepartment((prev: { [key: string]: { id: string }[] }) => ({
        ...prev,
        [`${mapState.selectedAreas.department.insee_geo}${mapState.filters.service_id ? `_${mapState.filters.service_id}` : ""}`]:
          data,
      }));
    };
    if (
      mapState.currentLevel === "department" &&
      !citiesByDepartment[
        `${mapState.selectedAreas.department.insee_geo}${mapState.filters.service_id ? `_${mapState.filters.service_id}` : ""}`
      ]
    ) {
      fetchCitiesByDepartment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapState.currentLevel, mapState.filters.service_id]);

  useEffect(() => {
    loadAllStats(mapState.filters.service_id);
  }, [loadAllStats, mapState.filters.service_id]);

  return (
    <MapWrapper
      SidePanelContent={SidePanelContent}
      gradientColors={["#FFFFFF", "#2A3C84"]}
      gradientDomain={[0, maxDomain]}
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
