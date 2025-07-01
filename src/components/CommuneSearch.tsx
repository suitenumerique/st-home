import { fr } from "@codegouvfr/react-dsfr";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import Autocomplete from "@mui/material/Autocomplete";
import { useRef, useState } from "react";
// Cache for storing search results
const searchCache = new Map<string, Commune[]>();

interface Commune {
  siret: string;
  name: string;
  insee_geo?: string;
  zipcode?: string;
  type: "commune" | "epci";
  population: number;
}

interface CommuneSearchProps {
  onSelect?: (commune: Commune) => void;
  placeholder?: string;
  type?: "commune" | "epci" | "all";
  smallButton?: boolean;
  style?: React.CSSProperties;
}

interface SearchInputProps {
  id: string;
  placeholder?: string;
  style?: React.CSSProperties;
  type: "commune" | "epci" | "all";
}

function CommuneSearchInput(
  props: SearchInputProps & {
    onOptionSelect: (commune: Commune) => void;
  },
) {
  const { id, placeholder, onOptionSelect, style } = props;
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleInputChange = async (value: string) => {
    if (value.length === 0) {
      setCommunes([]);
      return;
    }

    // Check cache first
    if (searchCache.has(props.type + "/" + value)) {
      setCommunes(searchCache.get(props.type + "/" + value) || []);
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
        body: JSON.stringify({ q: value, type: props.type }),
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        next: { revalidate: 3600 },
      });

      const data = await response.json();

      // wait 1 second
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      // Cache the results
      searchCache.set(props.type + "/" + value, data);
      setCommunes(data);
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
      getOptionLabel={(option) =>
        `${option.name} (${option.type === "commune" ? option.zipcode : "EPCI"})`
      }
      filterOptions={(x) => x} // Disable client-side filtering
      onInputChange={(_, value) => {
        setInputValue(value);
        handleInputChange(value);
      }}
      onChange={(_, value) => (value ? onOptionSelect(value) : null)}
      autoHighlight={true}
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
                {option.type === "commune" ? option.zipcode : "EPCI"}
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
          />
        )}
      />
    </>
  );
}
