import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import { useMemo } from "react";
import CommuneSearch from "../CommuneSearch";
import CommuneInfo from "../onboarding/CommuneInfo";
import Breadcrumb from "./Breadcrumb";

const SidePanelContent = ({ getColor, mapState, selectLevel }) => {
  const formatNumber = (value) => {
    return new Intl.NumberFormat("fr-FR").format(value);
  };

  const handleQuickNav = async (community) => {
    const level = community.type === "commune" ? "city" : community.type;
    let code;
    if (community.type === "epci") {
      code = community["siret"].slice(0, 9);
    } else {
      code = community.insee_geo || "";
    }
    await selectLevel(level, code, "quickNav");
  };

  const breadcrumbSegments = useMemo(() => {
    const areaLevels = ["country", "region", "department", "epci", "city"];
    const segments = areaLevels.map((level) => {
      if (
        mapState.selectedAreas[level] &&
        (level !== mapState.currentLevel || mapState.selectedCity)
      ) {
        return {
          level: level,
          label: mapState.selectedAreas[level].name,
          onClick: () => selectLevel(level, mapState.selectedAreas[level].insee_geo, "backClick"),
        };
      }
      return null;
    });
    return segments.filter(Boolean);
  }, [mapState.selectedAreas, mapState.currentLevel, mapState.selectedCity, selectLevel]);

  const currentPageLabel = useMemo(() => {
    if (mapState.selectedCity) {
      return mapState.selectedCity.name;
    }
    if (mapState.selectedAreas[mapState.currentLevel]) {
      return mapState.selectedAreas[mapState.currentLevel].name;
    }
    return null;
  }, [mapState.selectedAreas, mapState.currentLevel, mapState.selectedCity]);

  const currentLevelLabel = useMemo(() => {
    if (mapState.currentLevel === "country") {
      return null;
    }
    return {
      region: "Région",
      department: "Département",
      epci: "EPCI",
    }[mapState.currentLevel];
  }, [mapState.currentLevel]);

  const levelStatsDisplay = useMemo(() => {
    if (mapState.selectedCity) {
      return null;
    }
    const chartSeries = [
      ["2", "Conforme"],
      ["1", "Semi-conforme"],
      ["0", "Non conforme"],
    ];

    return chartSeries.map(([scoreKey, label]) => {
      if (!mapState.selectedAreas[mapState.currentLevel]) {
        return [];
      }
      try {
        const percentage = Math.round(
          (mapState.selectedAreas[mapState.currentLevel].conformityStats.details[scoreKey] /
            mapState.selectedAreas[mapState.currentLevel].conformityStats?.n_cities) *
            100,
        );
        return [
          label,
          percentage,
          scoreKey,
          mapState.selectedAreas[mapState.currentLevel].conformityStats.details[scoreKey],
        ];
      } catch (error) {
        console.error(error);
        return [];
      }
    });
  }, [mapState.selectedAreas, mapState.currentLevel, mapState.selectedCity]);

  return (
    <div className={fr.cx("fr-pb-3w")}>
      <CommuneSearch
        onSelect={handleQuickNav}
        placeholder="Rechercher une commune ou EPCI"
        smallButton={true}
      />
      {mapState.currentLevel === "country" && (
        <div
          className={fr.cx("fr-pt-3w fr-pb-2w fr-mb-3w")}
          style={{ borderBottom: "2px solid var(--border-default-grey)" }}
        >
          <h2 style={{ color: "var(--text-title-blue-france)" }}>
            Bienvenue sur la Carte de Conformité
          </h2>
          <p>
            Développée par l'ANCT, la{" "}
            <strong>Carte de Conformité de Présence Numérique des Territoires (CCNPT)</strong> est
            basée sur le{" "}
            <a href="/conformite/referentiel" target="_blank">Référentiel de Conformité de la Présence Numérique des Territoires</a>{" "}
            (RCPNT).
          </p>
          <p>
            Elle permet d'identifier les <strong>communes</strong> françaises{" "}
            <strong>conformes</strong> dans la <strong>sécurisation</strong> de leur{" "}
            <strong>communication en ligne</strong>.
          </p>
          <p>
            Les critères sont reliés aux usages d’un <strong>nom de domaine</strong> et{" "}
            <strong>structurés</strong> en <strong>deux parties</strong> :
          </p>
          <ol>
            <li>le site internet</li>
            <li>l’adresse de messagerie de la collectivité.</li>
          </ol>
        </div>
      )}
      {mapState.currentLevel !== "country" && (
        <div className={fr.cx("fr-pt-2w")}>
          <Breadcrumb segments={breadcrumbSegments} currentPageLabel={currentPageLabel} />
        </div>
      )}
      {mapState.selectedAreas["country"] && (
        <div>
          <h3 className={fr.cx("fr-mb-0")} style={{ color: "var(--text-title-blue-france)" }}>
            {currentPageLabel}
          </h3>
          {!mapState.selectedCity ? (
            <p className={fr.cx("fr-text--lg")} style={{ color: "var(--text-title-blue-france)" }}>
              {[
                currentLevelLabel,
                `${formatNumber(mapState.selectedAreas[mapState.currentLevel].conformityStats.n_cities)} communes`,
              ]
                .filter(Boolean)
                .join(" - ")}
            </p>
          ) : (
            <p className={fr.cx("fr-text--lg")} style={{ color: "var(--text-title-blue-france)" }}>
              56000
            </p>
          )}
        </div>
      )}
      {!mapState.selectedCity && mapState.selectedAreas[mapState.currentLevel] && (
        <div>
          {levelStatsDisplay.map(([label, percentage, scoreKey, n_cities], index) => (
            <div
              key={index}
              style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: getColor(scoreKey),
                  borderRadius: "100%",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxSizing: "border-box",
                }}
              ></div>
              <span>{label}:</span>
              <span>
                <strong>{percentage}%</strong>
              </span>
              <span>({formatNumber(n_cities)})</span>
            </div>
          ))}
        </div>
      )}
      {mapState.selectedCity && (
        <div>
          <p>
            Voici la situation de la présence numérique de la commune, selon notre{" "}
            <a href="/conformite/referentiel" target="_blank">Référentiel de Conformité</a> :
          </p>
          <CommuneInfo commune={mapState.selectedCity} />
        </div>
      )}
    </div>
  );
};

SidePanelContent.propTypes = {
  mapState: PropTypes.object.isRequired,
  selectLevel: PropTypes.func.isRequired,
  getColor: PropTypes.func.isRequired,
};

export default SidePanelContent;
