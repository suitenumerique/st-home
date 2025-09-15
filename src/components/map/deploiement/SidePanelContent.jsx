import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import CommuneSearch from "../../CommuneSearch";
import CommuneInfo from "../../onboarding/CommuneInfo";
import Breadcrumb from "../Breadcrumb";
import MapButton from "../MapButton";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import styles from "../../../styles/cartographie-deploiement.module.css";

const SidePanelContent = ({ container, rcpntRefs, getColor, mapState, selectLevel, setMapState, goBack, handleQuickNav, isMobile, panelState, setPanelState,  computeAreaStats, statsParams }) => {

  const [showCriteriaSelector, setShowCriteriaSelector] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const formatNumber = (value) => {
    return new Intl.NumberFormat("fr-FR").format(value);
  };

  const breadcrumbSegments = useMemo(() => {
    const areaLevels = ["country", "region", "department", "epci", "city"];
    const segments = areaLevels.map((level) => {
      if (mapState.selectedAreas[level] && level !== mapState.currentLevel) {
        return {
          level: level,
          label: mapState.selectedAreas[level].name,
          onClick: () => selectLevel(level, mapState.selectedAreas[level].insee_geo, "backClick"),
        };
      }
      return null;
    });
    return segments.filter(Boolean);
  }, [mapState.selectedAreas, mapState.currentLevel, selectLevel]);

  const currentPageLabel = useMemo(() => {
    if (mapState.selectedAreas[mapState.currentLevel]) {
      return mapState.selectedAreas[mapState.currentLevel].name;
    }
    return null;
  }, [mapState.selectedAreas, mapState.currentLevel]);

  const currentLevelLabel = useMemo(() => {
    if (mapState.currentLevel === "country") {
      return null;
    }
    if (mapState.currentLevel === "department" && ["971", "972", "973", "974", "976"].includes(mapState.selectedAreas.department.insee_geo)) {
      return "DROM";
    }
    return {
      region: "Région",
      department: "Département",
      epci: "EPCI",
    }[mapState.currentLevel];
  }, [mapState.currentLevel, mapState.selectedAreas]);

  const levelStatsDisplay = useMemo(() => {

    if (mapState.selectedAreas.city  || !mapState.selectedAreas[mapState.currentLevel]) {
      return null;
    }

    const percentages = [10, 12, 43, 4, 31]; // Fixed percentages that add up to 100%
    const products = [
      {
        key: 'demarches-simplifiees',
        label: 'Mon Suivi Social',
      },
      {
        key: 'esd',
        label: 'Espaces sur Demande',
      },
      {
        key: 'fichiers',
        label: 'Fichiers'
      },
      {
        key: 'messages',
        label: 'Messages'
      },
      {
        key: 'projets',
        label: 'Projets'
      }
    ].map((product, index) => {
      const usageStats = computeAreaStats(
        mapState.currentLevel,
        mapState.selectedAreas[mapState.currentLevel]?.insee_geo || "",
        mapState.selectedAreas.department,
        statsParams,
      );

      return {
        ...product,
        value: Math.floor((percentages[index] * usageStats.n_cities) / 100),
      }
    }).sort((a, b) => b.value - a.value);
    
    return {
      max: products[0].value,
      stats: products,
    }
  }, [mapState.selectedAreas, mapState.currentLevel, computeAreaStats]);

  const breadcrumbs = () => {
    return (
      <div>
        <Breadcrumb
          segments={breadcrumbSegments}
          currentPageLabel={
            mapState.currentLevel === "city"
            ? mapState.selectedAreas.city.name + " (" + mapState.selectedAreas.city.zipcode + ")"
            : currentPageLabel
          } />
      </div>
    )
  }

  const levelHeader = () => {
    return (
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h3 className={fr.cx("fr-mb-0")} style={{ color: "var(--text-title-blue-france)" }}>
            {currentPageLabel}
          </h3>
          {!mapState.selectedAreas.city && (
            <p className={fr.cx("fr-text--lg fr-mb-0")} style={{ color: "var(--text-title-blue-france)" }}>
              {[
                currentLevelLabel,
                `${formatNumber(Math.random() * 1000)} collectivités inscrites`,
              ]
                .filter(Boolean)
                .join(" - ")}
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
          <MapButton
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setLinkCopied(true);
              setTimeout(() => {
                setLinkCopied(false);
              }, 2000);
            }}
            aria-label="Copier l'URL de cette vue"
            tooltip={linkCopied ? "URL copiée" : "Copier l'URL de cette vue"}
          >
            {linkCopied ? (
              <span aria-hidden="true" className={fr.cx("fr-icon-check-line")}></span>
            ) : (
              <span className={fr.cx("fr-icon-links-line")} aria-hidden="true"></span>
            )}
          </MapButton>
        </div>
      </div>
    )
  }

  const levelStats = () => {
    return (
      <div>
        <div style={{ marginBottom: "1.5rem" }}>
          <ToggleSwitch
            // checked={mapState.selectedAreas[mapState.currentLevel].conformityStats.n_cities_active}
            // onChange={() => setMapState({ ...mapState, selectedAreas: { ...mapState.selectedAreas, [mapState.currentLevel]: { ...mapState.selectedAreas[mapState.currentLevel], conformityStats: { ...mapState.selectedAreas[mapState.currentLevel].conformityStats, n_cities_active: !mapState.selectedAreas[mapState.currentLevel].conformityStats.n_cities_active } } } })}
            showCheckedHint={false}
            containerWidth="100%"
            label="Actives sur les 12 derniers mois"
          />
        </div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.75rem" }}>
          Produits
        </h3>
        {levelStatsDisplay.stats.map(({ key, label, value }) => (
          <div
            key={key}
            className={styles.productItem}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <img src={`logos/logo-${key}.png`} alt={label} style={{ width: "18px", height: "18px", marginRight: "0.4rem" }} />
              <span style={{ fontSize: "0.875rem"}}>{label}&nbsp;</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", width: 'calc(100% - 50px)', position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "0",
                    top: "0",
                    zIndex: "1",
                    width: `${value / levelStatsDisplay.max * 100}%`,
                    height: "12px",
                    backgroundColor: "#2A3C84",
                    borderRadius: "4px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxSizing: "border-box",
                    marginRight: "0.5rem",
                  }}
                ></div>
                <div style={{ width: "100%", height: "12px", backgroundColor: "var(--background-alt-blue-france)", borderRadius: "4px" }}></div>
              </div>
              <span style={{ fontSize: "0.875rem", fontWeight: "bold", width: "50px", textAlign: "right", marginRight: "4px" }}>{formatNumber(value)}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {
        !isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {mapState.currentLevel !== "country" && (
              <MapButton
                onClick={() => goBack()}
                aria-label="Retour"
                tooltip="Retour"
              >
                <span aria-hidden="true" className={fr.cx("fr-icon-arrow-go-back-line")}></span>
              </MapButton>
            )}
            <CommuneSearch
              container={container}
              onSelect={handleQuickNav}
              placeholder="Rechercher une commune ou un EPCI"
              smallButton={true}
              includeRegionsAndDepartments={true}
            />
          </div>
        )
      }
      {mapState.currentLevel !== "country" && !isMobile ? (
        breadcrumbs()
       ) : <div style={{ marginTop: "1rem" }}></div>}
      <>
        {mapState.selectedAreas["country"] && mapState.selectedAreas[mapState.currentLevel] && (panelState === 'open' || panelState === 'partial') && (
          levelHeader()
        )}
        {panelState === 'open' && (
          <div style={{ marginTop: "1rem" }}>
            {!mapState.selectedAreas.city && mapState.selectedAreas[mapState.currentLevel] && (
              levelStats()
            )}
          </div>
        )}
      </>
    </div>
  );
};

SidePanelContent.propTypes = {
  container: PropTypes.object,
  rcpntRefs: PropTypes.array.isRequired,
  mapState: PropTypes.object.isRequired,
  selectLevel: PropTypes.func.isRequired,
  getColor: PropTypes.func.isRequired,
  setMapState: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  handleQuickNav: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  panelState: PropTypes.string.isRequired,
  setPanelState: PropTypes.func.isRequired,
};

export default SidePanelContent;
