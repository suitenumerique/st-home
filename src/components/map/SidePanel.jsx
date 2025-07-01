import PropTypes from "prop-types";
// import { useState } from "react";

const SidePanel = ({ children }) => {
  // const [isPanelOpen, setIsPanelOpen] = useState(true);
  const isPanelOpen = true;

  return (
    <div
      style={{
        width: isPanelOpen ? 460 : 0,
        minWidth: isPanelOpen ? 460 : 0,
        maxWidth: isPanelOpen ? 460 : 0,
        transition: "width 0.3s, min-width 0.3s, max-width 0.3s",
        overflow: "hidden",
        background: "#fff",
        borderRight: "1px solid #e5e7eb",
        boxShadow: isPanelOpen ? "2px 0 8px rgba(0,0,0,0.04)" : "none",
        zIndex: 2,
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* <button
        onClick={() => setIsPanelOpen(false)}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'none',
          border: 'none',
          fontSize: 20,
          cursor: 'pointer',
          zIndex: 3,
        }}
        aria-label="Fermer le panneau"
      >
        ×
      </button> */}
      <div style={{ padding: "1.5rem", flex: 1, height: "100%", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
};

SidePanel.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SidePanel;

// {!isPanelOpen && (
//   <button
//     onClick={() => setIsPanelOpen(true)}
//     style={{
//       position: 'absolute',
//       left: 0,
//       top: 20,
//       zIndex: 3,
//       background: '#fff',
//       border: '1px solid #e5e7eb',
//       borderRadius: '0 4px 4px 0',
//       boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
//       padding: '8px 12px',
//       cursor: 'pointer',
//       fontSize: 18,
//     }}
//     aria-label="Ouvrir le panneau"
//   >
//     ≡
//   </button>
// )}
