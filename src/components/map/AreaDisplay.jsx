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
  selectedAreas,
  currentLevel,
  period,
  // periods,
  getBackLevel,
  getValueForPeriod,
  getColor,
  dataIsLoaded,
  // showInfo,
  // setShowInfo,
  // setPeriod,
}) {
  const [departmentView, setDepartmentView] = useState("city");

  // Styles
  const styles = {
    container: {
      backgroundColor: "white",
      borderRadius: "0.75rem",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      padding: "1.5rem",
      pointerEvents: "auto",
    },
    containerNoShadow: {
      backgroundColor: "white",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      pointerEvents: "auto",
      marginTop: "1rem",
      color: "#64748b",
    },
    containerWithShadow: {
      backgroundColor: "white",
      borderRadius: "0.75rem",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      padding: "1.5rem",
      pointerEvents: "auto",
      marginTop: "1rem",
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
      fontSize: "1.875rem",
      color: "#1e293b",
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
      marginBottom: "1rem",
      borderBottom: "1px solid #e2e8f0",
      paddingBottom: "1rem",
    },
    viewLabel: {
      fontSize: "1rem",
      color: "#64748b",
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
          backgroundColor: "white",
          borderRadius: "xl",
          boxShadow: "lg",
          padding: "6px",
          pointerEvents: "auto",
        }}
      >
        <div style={styles.container}>
          {selectedAreas[currentLevel] ? (
            <div>
              {Object.values(selectedAreas).length > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  {currentLevel === "region" && (
                    <a
                      onClick={() => getBackLevel("country")}
                      style={styles.backLink}
                    >
                      <p style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: "0.5rem" }}>
                          <Undo2 />
                        </span>
                        France
                      </p>
                    </a>
                  )}

                  {currentLevel === "department" && selectedAreas["region"] && (
                    <a
                      onClick={() => getBackLevel("region")}
                      style={styles.backLink}
                    >
                      <p
                        style={{
                          display: "flex",
                          alignItems: "center",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <span style={{ marginRight: "0.5rem" }}>
                          <Undo2 />
                        </span>
                        {selectedAreas["region"].name}
                      </p>
                    </a>
                  )}

                  {currentLevel === "epci" && selectedAreas["department"] && (
                    <a
                      onClick={() => getBackLevel("department")}
                      style={styles.backLink}
                    >
                      <p
                        style={{
                          display: "flex",
                          alignItems: "center",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <span style={{ marginRight: "0.5rem" }}>
                          <Undo2 />
                        </span>
                        {selectedAreas["department"].name}
                      </p>
                    </a>
                  )}
                </div>
              )}

              <p style={styles.title}>{selectedAreas[currentLevel].name}</p>

              {currentLevel === "department" && (
                <div style={styles.viewContainer}>
                  <p style={styles.viewLabel}>Afficher les</p>
                  {["city", "epci"].map((view) => (
                    <a
                      key={view}
                      onClick={() => setDepartmentView(view)}
                      style={{
                        ...styles.viewOption,
                        ...(departmentView === view
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
                {formatNumber(selectedAreas[currentLevel].Nombre_de_communes)}{" "}
                communes
              </p>

              <div style={styles.scoreContainer}>
                {["3", "2", "1", "0"].map((score) => {
                  const percentage = Math.round(
                    (getValueForPeriod(
                      selectedAreas[currentLevel].Communes_par_score,
                      period,
                    )[score] /
                      selectedAreas[currentLevel].Nombre_de_communes) *
                      100,
                  );

                  return (
                    <div key={score} style={{ position: "relative" }}>
                      <div style={styles.scoreHeader}>
                        <span>
                          {formatNumber(
                            getValueForPeriod(
                              selectedAreas[currentLevel].Communes_par_score,
                              period,
                            )[score],
                          )}
                          ({percentage}%)
                        </span>
                      </div>
                      <div style={styles.progressBarContainer}>
                        <div
                          style={styles.progressBar(
                            dataIsLoaded ? `${percentage}%` : "0%",
                            getColor(parseInt(score)),
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={styles.pulse}>
              {currentLevel !== "country" && (
                <div style={styles.pulseSmall}></div>
              )}
              <div
                style={
                  currentLevel !== "country"
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
          backgroundColor: "white",
          borderRadius: "xl",
          boxShadow: "lg",
          padding: "6px",
          pointerEvents: "auto",
        }}
      >
        {(currentLevel === "department" || currentLevel === "epci") && (
          <div style={styles.containerNoShadow}>
            {selectedAreas["city"] ? (
              <div>
                <p style={styles.title2}>{selectedAreas["city"].Libelle}</p>
                <div>
                  {/* TLD OK Indicator */}
                  <div style={styles.indicatorContainer}>
                    {/* <span style={styles.indicatorCircle(
                      getColor(getValueForPeriod(selectedAreas['city'].Composants_score, period).indexOf('TLD OK') < 0 ? 0 : 3)
                    )}>
                      <span style={styles.indicatorText}>
                        {getValueForPeriod(selectedAreas['city'].Composants_score, period).indexOf('TLD OK') < 0 ? '×' : '✓'}
                      </span>
                    </span> */}
                    <span style={styles.indicatorLabel}>
                      Domaine et extension conformes
                    </span>
                  </div>

                  {/* PROP Indicator */}
                  <div style={styles.indicatorContainer}>
                    {/* <span style={styles.indicatorCircle(
                      getColor(getValueForPeriod(selectedAreas['city'].Composants_score, period).indexOf('PROP') < 0 ? 0 : 3)
                    )}>
                      <span style={styles.indicatorText}>
                        {getValueForPeriod(selectedAreas['city'].Composants_score, period).indexOf('PROP') < 0 ? '×' : '✓'}
                      </span>
                    </span> */}
                    <span style={styles.indicatorLabel}>
                      Propriété du domaine
                    </span>
                  </div>

                  {/* HTTPS Indicator */}
                  <div style={styles.indicatorContainer}>
                    {/* <span style={styles.indicatorCircle(
                      getColor(getValueForPeriod(selectedAreas['city'].Composants_score, period).indexOf('HTTPS') < 0 ? 0 : 3)
                    )}>
                      <span style={styles.indicatorText}>
                        {getValueForPeriod(selectedAreas['city'].Composants_score, period).indexOf('HTTPS') < 0 ? '×' : '✓'}
                      </span>
                    </span> */}
                    <span style={styles.indicatorLabel}>
                      Site web conforme (HTTPS)
                    </span>
                  </div>

                  {/* MAIL OK Indicator */}
                  <div style={styles.indicatorContainer}>
                    {/* <span style={styles.indicatorCircle(
                      getColor(getValueForPeriod(selectedAreas['city'].Composants_score, period).indexOf('MAIL OK') < 0 ? 0 : 3)
                    )}>
                      <span style={styles.indicatorText}>
                        {getValueForPeriod(selectedAreas['city'].Composants_score, period).indexOf('MAIL OK') < 0 ? '×' : '✓'}
                      </span>
                    </span> */}
                    <span style={styles.indicatorLabel}>
                      Messagerie conforme
                    </span>
                  </div>

                  {/* Update Data Link */}
                  <p style={styles.updateText}>Mettre à jour les données</p>
                  <a
                    href={`${selectedAreas["city"].Lien_Annuaire_Service_Public}/demande-de-mise-a-jour`}
                    style={styles.updateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SquareArrowOutUpRight
                      style={{
                        marginRight: "0.5rem",
                        width: "1.25rem",
                        color: "#64748b",
                      }}
                    />
                    <span style={styles.updateLinkText}>
                      Annuaire Service Public - {selectedAreas["city"].Libelle}
                    </span>
                  </a>
                </div>
              </div>
            ) : (
              <p style={{ color: "#64748b" }}>
                Cliquez sur une commune pour afficher les détails
              </p>
            )}
          </div>
        )}
      </div>
      {/* <div style={{ backgroundColor: 'white', borderRadius: 'xl', boxShadow: 'lg', padding: '6px', pointerEvents: 'auto' }}>
        <div style={styles.containerWithShadow}>
          <div style={styles.dataHeader}>
            <p style={styles.dataTitle}>Données</p>
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              style={styles.dataSelect}
            >
              {periods.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div style={styles.infoButton} onClick={() => setShowInfo(true)}>
            <p style={styles.infoText}>
              <Info style={styles.infoIcon} />
              En savoir plus sur cette carte
            </p>
          </div>
        </div>
      </div> */}
    </>
  );
}
