import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

type PanelState = "closed" | "open" | "partial";

interface MapLayoutContextType {
  panelState: PanelState;
  setPanelState: Dispatch<SetStateAction<PanelState>>;
  isMobile: boolean;
}

const MapLayoutContext = createContext<MapLayoutContextType | null>(null);

export const useMapLayoutContext = () => {
  const context = useContext(MapLayoutContext);
  if (!context) {
    throw new Error("useMapLayoutContext must be used within a MapLayoutProvider");
  }
  return context;
};

export const MapLayoutProvider = ({ children }: { children: ReactNode }) => {
  const [panelState, setPanelState] = useState<PanelState>("open");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <MapLayoutContext.Provider value={{ panelState, setPanelState, isMobile }}>
      {children}
    </MapLayoutContext.Provider>
  );
};
