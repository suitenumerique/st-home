import PropTypes from "prop-types";
import { useState } from "react";

const SidePanel = ({ children }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const togglePanel = () => {
    if (isPanelOpen) {
      setIsPanelOpen(false);
    } else {
      setIsPanelOpen(true);
    }
  }

  return (
    <div className={`map-side-panel ${!isPanelOpen ? 'map-side-panel--closed' : ''}`}>
      {isPanelOpen && (
        <div className="map-side-panel__content">
          {children}
        </div>
      )}
      <button
        onClick={togglePanel}
        className={`map-side-panel__toggle ${!isPanelOpen ? 'map-side-panel__toggle--closed' : ''}`}
        aria-label={isPanelOpen ? "Fermer le panneau" : "Ouvrir le panneau"}
      >
        {isPanelOpen
          ? <span className="fr-icon-arrow-left-s-line" style={{ color: "var(--text-action-high-blue-france)" }} aria-hidden="true"></span>
          : <span className="fr-icon-arrow-right-s-line" style={{ color: "var(--text-action-high-blue-france)" }} aria-hidden="true"></span>
        }
      </button>
    </div>
  );
};

SidePanel.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SidePanel;
