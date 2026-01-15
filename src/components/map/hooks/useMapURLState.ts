import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const useMapURLState = () => {
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getURLState = useCallback((filters: { [key: string]: any }): { [key: string]: any } => {
    if (typeof window === "undefined")
      return {
        currentLevel: null,
        currentAreaCode: null,
        departmentView: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as { [key: string]: any };

    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get("level");
    const view = urlParams.get("view");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state: { [key: string]: any } = {
      currentLevel: level,
      currentAreaCode: urlParams.get("code"),
      departmentView: level === "department" ? view : null,
      regionView: level === "region" ? view : null,
      ...Object.entries(filters).reduce(
        (acc, [key]) => {
          const urlParamName = key === "rcpnt_ref" ? "ref" : key;
          if (key === "service_ids" && urlParams.get(urlParamName)) {
            acc[key] = urlParams.get(urlParamName)?.split(",").map(Number) || null;
          } else {
            acc[key] = urlParams.get(urlParamName) as string;
          }
          return acc;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as { [key: string]: any },
      ),
    };
    return state;
  }, []);

  const updateURLState = useCallback(
    (
      currentLevel: string,
      currentAreaCode: string,
      departmentView: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filters: { [key: string]: any },
      regionView?: string,
    ) => {
      const params = new URLSearchParams();
      if (currentLevel !== "country") {
        params.set("level", currentLevel);
      }
      if (currentAreaCode !== "00") {
        params.set("code", currentAreaCode);
      }
      if (departmentView && currentLevel === "department") {
        params.set("view", departmentView);
      }
      if (regionView && currentLevel === "region") {
        params.set("view", regionView);
      }
      Object.entries(filters).forEach(([key, param]) => {
        if (param) {
          const urlParamName = key === "rcpnt_ref" ? "ref" : key;
          if (key === "service_ids" && Array.isArray(param)) {
            params.set(urlParamName, param.join(","));
          } else {
            params.set(urlParamName, param as string);
          }
        }
      });
      const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
      router.replace(newURL, { scroll: false });
    },
    [router],
  );

  return { getURLState, updateURLState };
};
