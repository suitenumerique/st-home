import PropTypes from "prop-types";
import { useCallback } from "react";

const SidePanel = ({ children, panelState, setPanelState, isMobile }) => {

  const nextState = useCallback(() => {
    if (panelState === "closed") {
      return "open";
    } else if (panelState === "open") {
      return isMobile ? "partial" : "closed";
    } else if (panelState === "partial") {
      return "closed";
    }
  }, [panelState, isMobile]);

  return (
    <div className={`map-side-panel ${panelState === "closed" ? 'map-side-panel--closed' : ''}`}>
      {(panelState === "open" || panelState === "partial") && (
        <div className="map-side-panel__content">
          {children}
        </div>
      )}
      <button
        onClick={() => setPanelState(nextState())}
        className={`map-side-panel__toggle ${panelState === "closed" ? 'map-side-panel__toggle--closed' : ''}`}
        aria-label={panelState === "closed" ? "Fermer le panneau" : "Ouvrir le panneau"}
      >
        {panelState === "open" || panelState === "partial"
          ? <span className="fr-icon-arrow-left-s-line" style={{ color: "var(--text-action-high-blue-france)" }} aria-hidden="true"></span>
          : <span className="fr-icon-arrow-right-s-line" style={{ color: "var(--text-action-high-blue-france)" }} aria-hidden="true"></span>
        }
      </button>
    </div>
  );
};

SidePanel.propTypes = {
  children: PropTypes.node.isRequired,
  panelState: PropTypes.string.isRequired,
  setPanelState: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default SidePanel;
