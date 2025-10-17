import { getOrganizationTypeDisplay } from "@/lib/string";
import { fr } from "@codegouvfr/react-dsfr";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import Autocomplete from "@mui/material/Autocomplete";
import { useEffect, useRef, useState } from "react";

// Cache for storing search results
const searchCache = new Map<string, Commune[]>();

interface Commune {
  siret: string;
  name: string;
  insee_geo?: string;
  zipcode?: string;
  type: "commune" | "epci" | "department" | "region";
  population: number;
}

interface ParentArea {
  insee_geo: string;
  type: "department" | "region";
  name: string;
  insee_reg: string;
  insee_dep: string | null;
}

interface CommuneSearchProps {
  onSelect?: (commune: Commune) => void;
  placeholder?: string;
  type?: "commune" | "epci" | "all";
  smallButton?: boolean;
  style?: React.CSSProperties;
  container?: HTMLElement | null;
  includeRegionsAndDepartments?: boolean;
}

interface SearchInputProps {
  id: string;
  placeholder?: string;
  style?: React.CSSProperties;
  type: "commune" | "epci" | "all";
  container?: HTMLElement | null;
  includeRegionsAndDepartments?: boolean;
}

function CommuneSearchInput(
  props: SearchInputProps & {
    onOptionSelect: (commune: Commune) => void;
  },
) {
  const { id, placeholder, onOptionSelect, style, container, includeRegionsAndDepartments } = props;
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(false);
  const [parentAreas, setParentAreas] = useState<ParentArea[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load parent areas data when component mounts
  useEffect(() => {
    if (includeRegionsAndDepartments) {
      fetch("/parent_areas.json")
        .then((response) => response.json())
        .then((data) => {
          const areas = data.filter(
            (area: ParentArea) =>
              area.type === "department" ||
              (area.type === "region" &&
                !["r01", "r02", "r03", "r04", "r06", "r11"].includes(area.insee_geo)),
          );
          setParentAreas(areas);
        })
        .catch((error) => {
          console.error("Error loading parent areas:", error);
        });
    }
  }, [includeRegionsAndDepartments]);

  const handleInputChange = async (value: string) => {
    if (value.length === 0) {
      setCommunes([]);
      return;
    }

    // Check cache first
    const cacheKey = `${props.type}/${value}/${includeRegionsAndDepartments ? "with-areas" : "without-areas"}`;
    if (searchCache.has(cacheKey)) {
      setCommunes(searchCache.get(cacheKey) || []);
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const response = await fetch(`/api/communes/search`, {
        method: "POST",
        body: JSON.stringify({
          q: value,
          type: props.type,
        }),
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        next: { revalidate: 3600 },
      });

      const data = await response.json();

      let allResults = [...data];

      // wait 1 second
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      if (includeRegionsAndDepartments && parentAreas.length > 0) {
        const searchQuery = value.toLowerCase().trim();

        const matchingAreas = parentAreas.filter((area) =>
          area.name.toLowerCase().includes(searchQuery),
        );

        const areasAsCommunes: Commune[] = matchingAreas.map((area) => ({
          siret: area.insee_geo,
          name: area.name,
          insee_geo: area.insee_geo,
          zipcode: undefined,
          type: area.type,
          population: 0,
        }));

        allResults = [...data, ...areasAsCommunes];

        const typePriority: Record<string, number> = {
          commune: 4,
          epci: 3,
          department: 2,
          region: 1,
        };
        allResults.sort((a, b) => {
          const priorityA = typePriority[a.type] || 5;
          const priorityB = typePriority[b.type] || 5;
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          if (a.type === "commune" || a.type === "epci") {
            return (b.population || 0) - (a.population || 0);
          }
          return a.name.localeCompare(b.name);
        });
      }

      // Cache the results
      searchCache.set(cacheKey, allResults);
      setCommunes(allResults);
      setLoading(false);
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      // Clear results on other errors
      setCommunes([]);
      setLoading(false);
    }
  };

  return (
    //<div ref={containerRef} className="commune-search-input-container" style={{width: "100%"}}>
    <Autocomplete
      id={id}
      style={{ width: "100%" }}
      open={open && inputValue.length >= 1}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={communes}
      loading={loading}
      clearOnEscape
      loadingText="Recherche en cours..."
      noOptionsText={
        inputValue.length < 1 ? "Saisissez au moins 1 caractère" : "Aucune commune trouvée"
      }
      getOptionLabel={(option) => `${option.name} (${getOrganizationTypeDisplay(option)})`}
      filterOptions={(x) => x} // Disable client-side filtering
      onInputChange={(_, value) => {
        setInputValue(value);
        handleInputChange(value);
      }}
      onChange={(_, value) => (value ? onOptionSelect(value) : null)}
      autoHighlight={true}
      slotProps={{
        popper: {
          container: container,
        },
      }}
      renderOption={(props, option) => {
        // Remove "key" from props
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { key, ...rest } = props;
        return (
          <li key={option.siret} {...rest}>
            <div>
              <span>{option.name}</span>
              <span
                className={fr.cx("fr-text--sm", "fr-ml-1w")}
                style={{ color: "var(--text-mention-grey)" }}
              >
                {getOrganizationTypeDisplay(option)}
              </span>
            </div>
          </li>
        );
      }}
      renderInput={(params) => {
        return (
          <div ref={params.InputProps.ref} className={params.InputProps.className}>
            <Input
              label=""
              nativeInputProps={{
                placeholder: placeholder || "Rechercher une commune",
                style: style,
                // style: {
                //   backgroundColor: "white",
                // },
                ...params.inputProps,
              }}
            />
          </div>
        );

        // <div
        //   ref={params.InputProps.ref}
        //   className="commune-search-input-wrapper"
        // >
        //   <input
        //     {...params.inputProps}
        //     className={cx(params.inputProps.className, className)}
        //     placeholder={placeholder}
        //     type={type}
        //   />
        //   {loading && (
        //     <div className="search-loading-indicator">
        //       <CircularProgress size={20} />
        //     </div>
        //   )}
        // </div>
      }}
      // renderOption={(props, option) => (
      //   <li {...props} key={option.siret} className="commune-search-option">
      //     <div className="commune-option">
      //       <span className="commune-name">{option.name}</span>
      //       <span className="commune-zipcode">{option.zipcode}</span>
      //     </div>
      //   </li>
      // )}
      // PaperComponent={(props) => (
      //   <Paper {...props} elevation={3} className="commune-search-dropdown" />
      // )}
      // componentsProps={{
      //   popper: {
      //     style: {
      //       zIndex: 1000,
      //     },
      //     modifiers: [
      //       {
      //         name: "width",
      //         enabled: true,
      //         phase: "beforeWrite",
      //         requires: ["computeStyles"],
      //         fn: ({ state }) => {
      //           // Use the container width for the popper
      //           if (containerRef.current) {
      //             state.styles.popper.width = `${containerRef.current.clientWidth}px`;
      //           }
      //         },
      //         effect: ({ state }) => {
      //           // Update width on resize
      //           if (containerRef.current) {
      //             state.elements.popper.style.width = `${containerRef.current.clientWidth}px`;
      //           }
      //         },
      //       },
      //     ],
      //   },
      // }}
    />
    //</div>
  );
}

export default function CommuneSearch({
  onSelect,
  placeholder,
  type = "all",
  style = {},
  smallButton = false,
  container,
  includeRegionsAndDepartments = false,
}: CommuneSearchProps) {
  return (
    <>
      <SearchBar
        style={{ width: "100%" }}
        label="Rechercher une commune"
        big={!smallButton}
        renderInput={({ id }) => (
          <CommuneSearchInput
            id={id}
            placeholder={placeholder}
            type={type}
            style={style}
            onOptionSelect={onSelect || (() => {})}
            container={container}
            includeRegionsAndDepartments={includeRegionsAndDepartments}
          />
        )}
      />
    </>
  );
}
