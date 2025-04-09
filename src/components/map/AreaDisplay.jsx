import { useState } from "react";

// Icon components
const Undo2 = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </svg>
);

const SquareArrowOutUpRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <path d="M8 8h8v8" />
    <path d="m8 16 8-8" />
  </svg>
);

// const Info = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="16"
//     height="16"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <circle cx="12" cy="12" r="10"/>
//     <path d="M12 16v-4"/>
//     <path d="M12 8h.01"/>
//   </svg>
// );

export default function AreaDisplay({
  mapState,
  setMapState,
  getBackLevel,
  getColor,
  // period,
  // periods,
  // setPeriod,
}) {

  // Styles
  const styles = {
    container: {
      borderRadius: "0.75rem",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      padding: "1.5rem",
      pointerEvents: "auto",
      backgroundColor: "white",
    },
    containerNoShadow: {
      backgroundColor: "white",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      pointerEvents: "auto",
      marginTop: "0.5rem",
      color: "#64748b",
    },
    containerWithShadow: {
      backgroundColor: "white",
      borderRadius: "0.75rem",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      padding: "1.5rem",
      pointerEvents: "auto",
      marginTop: "0.5rem",
      color: "#64748b",
    },
    backLink: {
      cursor: "pointer",
      fontSize: "1rem",
      color: "#64748b",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      fontWeight: "bold",
      fontSize: "1.6rem",
      color: "#1e293b",
      lineHeight: "1.2",
      marginBottom: "0.5rem",
    },
    title2: {
      fontWeight: "bold",
      fontSize: "1.5rem",
      color: "#1e293b",
      marginBottom: "0.5rem",
    },
    viewContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      columnGap: "1rem",
      paddingBottom: "1rem",
    },
    viewLabel: {
      fontSize: "1rem",
      color: "#64748b",
      marginBottom: "0",
    },
    viewOption: {
      cursor: "pointer",
      fontSize: "1rem",
      color: "#64748b",
      backgroundColor: "#f1f5f9",
      borderRadius: "0.375rem",
      padding: "0.25rem 0.5rem",
    },
    viewOptionActive: {
      backgroundColor: "#475569",
      color: "white",
    },
    communesText: {
      fontSize: "1.125rem",
      color: "#64748b",
      marginBottom: "1rem",
    },
    scoreContainer: {
      rowGap: "1rem",
      display: "flex",
      flexDirection: "column",
      position: "relative",
    },
    scoreHeader: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "0.875rem",
      color: "#475569",
      marginBottom: "0.25rem",
    },
    progressBarContainer: {
      height: "0.75rem",
      backgroundColor: "#e2e8f0",
      borderRadius: "9999px",
      width: "100%",
    },
    progressBar: (width, color) => ({
      height: "100%",
      borderRadius: "9999px",
      transition: "width 1000ms ease",
      width: width,
      backgroundColor: color,
    }),
    indicatorCircle: (color) => ({
      width: "1.25rem",
      height: "1.25rem",
      marginRight: "0.5rem",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: color,
    }),
    indicatorText: {
      color: "white",
      lineHeight: "0.75rem",
    },
    indicatorLabel: {
      color: "#1e293b",
    },
    indicatorContainer: {
      display: "flex",
      alignItems: "center",
      marginBottom: "0.25rem",
    },
    updateText: {
      color: "#1e293b",
      marginTop: "1.5rem",
      marginBottom: "0.5rem",
      fontWeight: "500",
    },
    updateLink: {
      display: "flex",
      backgroundColor: "#f1f5f9",
      borderRadius: "0.375rem",
      padding: "0.5rem",
    },
    updateLinkText: {
      color: "#64748b",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
    },
    dataHeader: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "1rem",
    },
    dataTitle: {
      fontWeight: "500",
      fontSize: "1rem",
      color: "#1e293b",
      marginRight: "0.5rem",
    },
    dataSelect: {
      backgroundColor: "#f1f5f9",
      borderRadius: "0.375rem",
      padding: "0.5rem",
      color: "#1e293b",
      paddingLeft: "0.5rem",
      paddingRight: "0.5rem",
    },
    infoButton: {
      cursor: "pointer",
    },
    infoText: {
      fontSize: "1rem",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
    },
    infoIcon: {
      marginRight: "1rem",
    },
    // Pulse animation styles
    pulse: {
      animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    },
    pulseSmall: {
      height: "1.25rem",
      backgroundColor: "#f1f5f9",
      borderRadius: "0.25rem",
      width: "50%",
      marginBottom: "1rem",
    },
    pulseMedium: {
      height: "3rem",
      backgroundColor: "#f1f5f9",
      borderRadius: "0.25rem",
      width: "75%",
      marginBottom: "1rem",
    },
    pulseLarge: {
      height: "4rem",
      backgroundColor: "#f1f5f9",
      borderRadius: "0.25rem",
      width: "75%",
      marginBottom: "1rem",
    },
    pulseBar: {
      height: "1rem",
      backgroundColor: "#f1f5f9",
      borderRadius: "9999px",
      width: "100%",
    },
    pulseBarSmall: {
      height: "1rem",
      backgroundColor: "#f1f5f9",
      borderRadius: "9999px",
      width: "20%",
      marginBottom: "0.25rem",
    },
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("fr-FR").format(value);
  };

  return (
    <>
      <div
        style={{
          borderRadius: "xl",
          boxShadow: "lg",
          padding: "6px",
          pointerEvents: "auto",
        }}
      >
        <div style={styles.container}>
          {mapState.selectedAreas[mapState.currentLevel] ? (
            <div>
              {Object.values(mapState.selectedAreas).length > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {mapState.currentLevel === "region" && (
                    <a
                      onClick={() => getBackLevel("country")}
                      style={styles.backLink}
                    >
                      <p style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span style={{ marginRight: "0.5rem" }}>
                          <Undo2 />
                        </span>
                        France
                      </p>
                    </a>
                  )}

                  {mapState.currentLevel === "department" && mapState.selectedAreas["region"] && (
                    <a
                      onClick={() => getBackLevel("region")}
                      style={styles.backLink}
                    >
                      <p
                        style={{
                          display: "flex",
                          alignItems: "center",
                          textOverflow: "ellipsis",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span style={{ marginRight: "0.5rem" }}>
                          <Undo2 />
                        </span>
                        {mapState.selectedAreas["region"].name}
                      </p>
                    </a>
                  )}

                  {mapState.currentLevel === "epci" && mapState.selectedAreas["department"] && (
                    <a
                      onClick={() => getBackLevel("department")}
                      style={styles.backLink}
                    >
                      <p
                        style={{
                          display: "flex",
                          alignItems: "center",
                          textOverflow: "ellipsis",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span style={{ marginRight: "0.5rem" }}>
                          <Undo2 />
                        </span>
                        {mapState.selectedAreas["department"].name}
                      </p>
                    </a>
                  )}
                </div>
              )}

              <p style={styles.title}>{mapState.selectedAreas[mapState.currentLevel].name}</p>

              {mapState.currentLevel === "department" && (
                <div style={styles.viewContainer}>
                  <p style={styles.viewLabel}>Afficher les</p>
                  {["city", "epci"].map((view) => (
                    <a
                      key={view}
                      onClick={() => setMapState({ ...mapState, departmentView: view })}
                      style={{
                        ...styles.viewOption,
                        ...(mapState.departmentView === view
                          ? styles.viewOptionActive
                          : {}),
                      }}
                    >
                      {view === "city" ? "Communes" : "EPCI"}
                    </a>
                  ))}
                </div>
              )}

              <p style={styles.communesText}>
                {formatNumber(mapState.selectedAreas[mapState.currentLevel].conformityStats.n_cities)} communes
              </p>

              <div style={styles.scoreContainer}>
                {["2", "1", "0"].map((scoreKey) => {
                  const percentage = Math.round(
                    (mapState.selectedAreas[mapState.currentLevel].conformityStats.details[scoreKey] / mapState.selectedAreas[mapState.currentLevel].conformityStats.n_cities) * 100
                  );

                  return (
                    <div key={scoreKey} style={{ position: "relative" }}>
                      <div style={styles.scoreHeader}>
                        <span>
                          {formatNumber(
                            mapState.selectedAreas[mapState.currentLevel].conformityStats.details[scoreKey]
                          )}
                          &nbsp;({percentage}%)
                        </span>
                      </div>
                      <div style={styles.progressBarContainer}>
                        <div
                          style={styles.progressBar(`${percentage}%`, getColor(parseInt(scoreKey)))}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div style={styles.pulse}>
              {mapState.currentLevel !== "country" && (
                <div style={styles.pulseSmall}></div>
              )}
              <div
                style={
                  mapState.currentLevel !== "country"
                    ? styles.pulseLarge
                    : styles.pulseMedium
                }
              ></div>
              <div style={styles.pulseSmall}></div>
              <div
                style={{
                  rowGap: "1rem",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div style={styles.pulseBarSmall}></div>
                    <div style={styles.pulseBar}></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          borderRadius: "xl",
          boxShadow: "lg",
          padding: "6px",
          pointerEvents: "auto",
        }}
      >
        {((mapState.currentLevel === "department" && mapState.departmentView === "city") || (mapState.currentLevel === "epci")) && (
          <div style={styles.containerNoShadow}>
            {mapState.selectedCity ? (
              <div>
                <p style={styles.title2}>{mapState.selectedCity.name}</p>
                <div>

                  <div style={styles.indicatorContainer}>
                    <span style={styles.indicatorCircle(
                      getColor(mapState.selectedCity.rcpnt.indexOf('1.a') > -1 ? 2 : 0)
                    )}>
                      <span style={styles.indicatorText}>
                        {mapState.selectedCity.rcpnt.indexOf('1.a') > -1 ? '✓' : '×'}
                      </span>
                    </span>
                    <span style={styles.indicatorLabel}>
                      Site internet conforme
                    </span>
                  </div>

                  <div style={styles.indicatorContainer}>
                    <span style={styles.indicatorCircle(
                      getColor(mapState.selectedCity.rcpnt.indexOf('2.a') > -1 ? 2 : 0)
                    )}>
                      <span style={styles.indicatorText}>
                        {mapState.selectedCity.rcpnt.indexOf('2.a') > -1 ? '✓' : '×'}
                      </span>
                    </span>
                    <span style={styles.indicatorLabel}>
                      Messagerie conforme
                    </span>
                  </div>

                </div>
              </div>
            ) : (
              <p style={{ color: "#64748b", margin: 0 }}>
                Cliquez sur une commune pour afficher les détails
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
