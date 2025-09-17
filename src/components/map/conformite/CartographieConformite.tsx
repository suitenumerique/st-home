"use client";

import { ReferentielConformite } from "@/pages/conformite/referentiel";
import { useCallback, useEffect, useMemo, useState } from "react";
import MapWrapper from "../MapWrapper";
import SidePanelContent from "./SidePanelContent";

import { AreaStats, SelectedArea } from "../types";
import { AllStats, StatRecord } from "./types";

const CartographieConformite = () => {
  const [stats, setStats] = useState<AllStats>({} as AllStats);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapState, setMapState] = useState<any>({
    currentLevel: "country",
    selectedAreas: {},
    departmentView: "epci",
  });
  const [selectedRef, setSelectedRef] = useState<string | null>(null);

  const statsParams = useMemo(
    () => ({
      selectedRef: {
        value: selectedRef as string | null,
        urlParam: "ref",
        setValue: setSelectedRef,
      },
    }),
    [selectedRef, setSelectedRef],
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
    async (level: "region" | "department" | "epci"): Promise<Record<string, StatRecord[]>> => {
      const scope = {
        region: "reg",
        department: "dep",
        epci: "epci",
      };
      const response = await fetch(
        `/api/rcpnt/stats?scope=${scope[level]}&refs=${allRcpntRefs.join(",")}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          next: { revalidate: 3600 },
        },
      );
      const data = await response.json();
      return data;
    },
    [allRcpntRefs],
  );

  const loadAllStats = useCallback(async () => {
    const regionStats = await loadStats("region");
    const departmentStats = await loadStats("department");
    const epciStats = await loadStats("epci");
    let countryStats;
    try {
      countryStats = {
        "00": allRcpntRefs.map((ref) => {
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
    } catch {
      countryStats = {
        "00": [],
      };
    }

    setStats({
      region: regionStats,
      department: departmentStats,
      epci: epciStats,
      country: countryStats,
    });
  }, [allRcpntRefs, loadStats]);

  const computeAreaStats = useCallback(
    (
      level: "country" | "region" | "department" | "epci" | "city",
      insee_geo: string,
      siret: string,
      department: SelectedArea,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      statsParams?: any,
    ): AreaStats | null => {
      try {
        const currentSelectedRef = statsParams["selectedRef"].value;
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
    [stats],
  );

  useEffect(() => {
    loadAllStats();
  }, [loadAllStats]);

  return (
    <MapWrapper
      SidePanelContent={SidePanelContent}
      gradientColors={["#FF6868", "#FFC579", "#009081"]}
      gradientDomain={[0, 1, 2]}
      computeAreaStats={computeAreaStats}
      statsParams={statsParams}
      showGradientLegend={true}
      mapState={mapState}
      setMapState={setMapState}
      displayCircleValue={false}
    />
  );
};

export default CartographieConformite;
