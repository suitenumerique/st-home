import { ReactNode, useRef } from "react";
import { useMapLayoutContext } from "../context/MapLayoutContext";
import SidePanel from "../ui/SidePanel";

interface MapLayoutProps {
  sidebar: ReactNode;
  map: ReactNode;
}

export const MapLayout = ({ sidebar, map }: MapLayoutProps) => {
  const { panelState, setPanelState, isMobile } = useMapLayoutContext();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: isMobile ? "column-reverse" : "row",
        width: "100%",
        height: "100%",
      }}
    >
      <SidePanel panelState={panelState} setPanelState={setPanelState} isMobile={isMobile}>
        {sidebar}
      </SidePanel>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>{map}</div>
    </div>
  );
};
