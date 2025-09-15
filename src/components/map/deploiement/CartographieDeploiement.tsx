"use client";

import { useCallback, useMemo } from "react";
import MapWrapper from "../MapWrapper";
import SidePanelContent from "./SidePanelContent";
// import { ReferentielConformite } from "@/pages/conformite/referentiel";

import {
  // AllStats,
  AreaStats,
} from "../types";

const CartographieDeploiement = () => {
  // const [stats, setStats] = useState<AllStats>({} as AllStats);

  const statsParams = useMemo(() => ({}), []);

  // const loadStats = useCallback(
  // async (level: "region" | "department" | "epci"): Promise<Record<string, StatRecord[]>> => {
  //   const scope = {
  //     region: "reg",
  //     department: "dep",
  //     epci: "epci",
  //   };
  //   const response = await fetch(
  //     `/api/rcpnt/stats?scope=${scope[level]}&refs=${allRcpntRefs.join(",")}`,
  //     {
  //       method: "GET",
  //       headers: { "Content-Type": "application/json" },
  //       next: { revalidate: 3600 },
  //     },
  //   );
  //   const data = await response.json();
  //   return data;
  // },
  // [allRcpntRefs],
  // );

  // const loadAllStats = useCallback(async () => {
  // const regionStats = await loadStats("region");
  // const departmentStats = await loadStats("department");
  // const epciStats = await loadStats("epci");
  // let countryStats;
  // try {
  //   countryStats = {
  //     "00": allRcpntRefs.map((ref) => {
  //       return {
  //         ref: ref,
  //         valid: Object.values(regionStats).reduce(
  //           (acc, stat) => acc + (stat.find((s) => s.ref === ref)?.valid || 0),
  //           0,
  //         ),
  //         total: Object.values(regionStats).reduce(
  //           (acc, stat) => acc + (stat.find((s) => s.ref === ref)?.total || 0),
  //           0,
  //         ),
  //       };
  //     }),
  //   };
  // } catch {
  //   countryStats = {
  //     "00": [],
  //   };
  // }

  // setStats({
  //   region: regionStats,
  //   department: departmentStats,
  //   epci: epciStats,
  //   country: countryStats,
  // });
  // }, [allRcpntRefs, loadStats]);

  const computeAreaStats = useCallback(
    (
      level: "country" | "region" | "department" | "epci" | "city",
      // insee_geo: string,
      // department: SelectedArea,
      // statsParams?: any,
    ): AreaStats | null => {
      try {
        if (level === "city") {
          return {
            score: Math.random() * 100,
          };
        } else {
          return {
            n_cities: Math.random() * 100,
            score: Math.random() * 100,
          };
        }
      } catch {
        return null;
      }
    },
    [],
  );

  // useEffect(() => {
  //   loadAllStats();
  // }, [loadAllStats]);

  return (
    <MapWrapper
      SidePanelContent={SidePanelContent}
      gradientColors={["#FFFFFF", "#2A3C84"]}
      computeAreaStats={computeAreaStats}
      statsParams={statsParams}
    />
  );
};

export default CartographieDeploiement;
