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
    <div
      style={{
        width: isPanelOpen ? 460 : 20,
        minWidth: isPanelOpen ? 460 : 20,
        maxWidth: isPanelOpen ? 460 : 20,
        background: "#fff",
        borderRight: "1px solid #e5e7eb",
        boxShadow: isPanelOpen ? "2px 0 8px rgba(0,0,0,0.04)" : "none",
        zIndex: 100,
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {isPanelOpen && (
        <div style={{ 
          padding: "1.5rem", 
          flex: 1, 
          height: "100%", 
          overflowY: "auto",
          overflowX: "hidden"
        }}>
          {children}
        </div>
      )}
      <button
        onClick={togglePanel}
        style={{
          position: 'absolute',
          left: isPanelOpen ? 459 : 19,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 50,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderLeft: 'none',
          borderRadius: '0 4px 4px 0',
          boxShadow: '2px 0 8px rgba(0px,0px,0px,0.04)',
          padding: '8px 2px',
          cursor: 'pointer',
          fontSize: 18
        }}
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
