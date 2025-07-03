import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import CommuneSearch from "../CommuneSearch";
import CommuneInfo from "../onboarding/CommuneInfo";
import Breadcrumb from "./Breadcrumb";
import MapButton from "./mapButton";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";

const SidePanelContent = ({ rcpntRefs, getColor, mapState, selectLevel, setMapState }) => {

  const [showCriteriaSelector, setShowCriteriaSelector] = useState(false);

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
    const chartSeries = mapState.selectedRef ? [
      ["1", "Conforme"],
      ["0", "Non conforme"],
    ] : [
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

  const introduction = () => {
    return (
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
          <a href="/conformite/referentiel">Référentiel de Conformité de la Présence Numérique des Territoires</a>{" "}
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
    )
  }

  const breadcrumbs = () => {
    return (
      <div className={fr.cx("fr-pt-2w")}>
        <Breadcrumb segments={breadcrumbSegments} currentPageLabel={currentPageLabel} />
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
              {mapState.selectedCity.zipcode}
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MapButton
            onClick={() => setShowCriteriaSelector(true)}
            aria-label="Sélectionner un critère"
            tooltip="Sélectionner un critère"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.66667 1.33268H19.75V3.49935H5.66667V1.33268ZM1.875 4.04102C1.44402 4.04102 1.0307 3.86981 0.725952 3.56506C0.421205 3.26032 0.25 2.84699 0.25 2.41602C0.25 1.98504 0.421205 1.57171 0.725952 1.26697C1.0307 0.962221 1.44402 0.791016 1.875 0.791016C2.30598 0.791016 2.7193 0.962221 3.02405 1.26697C3.3288 1.57171 3.5 1.98504 3.5 2.41602C3.5 2.84699 3.3288 3.26032 3.02405 3.56506C2.7193 3.86981 2.30598 4.04102 1.875 4.04102ZM1.875 11.6243C1.44402 11.6243 1.0307 11.4531 0.725952 11.1484C0.421205 10.8437 0.25 10.4303 0.25 9.99935C0.25 9.56837 0.421205 9.15505 0.725952 8.8503C1.0307 8.54555 1.44402 8.37435 1.875 8.37435C2.30598 8.37435 2.7193 8.54555 3.02405 8.8503C3.3288 9.15505 3.5 9.56837 3.5 9.99935C3.5 10.4303 3.3288 10.8437 3.02405 11.1484C2.7193 11.4531 2.30598 11.6243 1.875 11.6243ZM1.875 19.0993C1.44402 19.0993 1.0307 18.9281 0.725952 18.6234C0.421205 18.3187 0.25 17.9053 0.25 17.4743C0.25 17.0434 0.421205 16.63 0.725952 16.3253C1.0307 16.0206 1.44402 15.8493 1.875 15.8493C2.30598 15.8493 2.7193 16.0206 3.02405 16.3253C3.3288 16.63 3.5 17.0434 3.5 17.4743C3.5 17.9053 3.3288 18.3187 3.02405 18.6234C2.7193 18.9281 2.30598 19.0993 1.875 19.0993ZM5.66667 8.91602H19.75V11.0827H5.66667V8.91602ZM5.66667 16.4993H19.75V18.666H5.66667V16.4993Z" fill="#000091"/>
            </svg>
          </MapButton>

          {/* <MapButton
            onClick={() => console.log('coucou')}
            aria-label="Copier l'URL de cette vue"
            tooltip="Copier l'URL de cette vue"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9638 6.59941L13.4967 8.13233C14.919 9.5545 15.7181 11.4835 15.7181 13.4948C15.7181 15.5062 14.919 17.4352 13.4967 18.8573L13.1132 19.2397C10.1516 22.2014 5.34984 22.2014 2.38821 19.2397C-0.573415 16.2781 -0.573415 11.4764 2.38821 8.51474L3.92113 10.0477C2.54275 11.414 2.00075 13.4134 2.50034 15.2889C2.99993 17.1643 4.46474 18.6291 6.34018 19.1287C8.21562 19.6283 10.215 19.0863 11.5814 17.7079L11.9649 17.3244C14.0794 15.2092 14.0794 11.7804 11.9649 9.66524L10.432 8.13233L11.9649 6.60049L11.9638 6.59941ZM17.7098 11.5795C19.0882 10.2131 19.6302 8.21373 19.1306 6.3383C18.631 4.46286 17.1662 2.99804 15.2907 2.49845C13.4153 1.99886 11.4159 2.54086 10.0495 3.91924L9.66605 4.30274C7.55148 6.41795 7.55148 9.8467 9.66605 11.9619L11.199 13.4948L9.66605 15.0267L8.13421 13.4948C6.71189 12.0727 5.91283 10.1437 5.91283 8.13233C5.91283 6.12097 6.71189 4.192 8.13421 2.76983L8.51771 2.38741C10.4335 0.471572 13.2259 -0.276648 15.843 0.424597C18.4601 1.12584 20.5043 3.17002 21.2055 5.7871C21.9068 8.40418 21.1585 11.1966 19.2427 13.1124L17.7098 11.5795Z" fill="#000091"/>
            </svg>
          </MapButton> */}
        </div>
      </div>
    )
  }

  const departmentViewSelector = () => {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem" }}>
        <span className={fr.cx("fr-text--sm fr-mb-0")}>Sélection :</span>
        {
          ['epci', 'city'].map((type) => (
            <p style={{
              display: "inline-flex",
              flexDirection: "row",
              alignItems: "center",
              width: "fit-content",
              fontSize: "0.875rem",
              lineHeight: "1.5rem",
              minHeight: "2rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "1rem",
              minWidth: "2.25rem",
              justifyContent: "center",
              color: "var(--text-title-blue-france)",
              marginBottom: "0",
              cursor: "pointer",
              backgroundColor: mapState.departmentView === type ? "var(--background-action-low-blue-france-active)" : "var(--background-action-low-blue-france)",
            }}
            onClick={() => setMapState({ ...mapState, departmentView: type })}
          >
              {type === 'epci' ? 'Intercommunalité' : 'Commune'}
            </p>
          ))
        }
      </div>
    )
  }

  const levelStats = () => {
    return (
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
    )
  }

  const communeInfo = () => {
    return (
      <div>
        <p>
          Voici la situation de la présence numérique de la commune, selon notre{" "}
          <a href="/conformite/referentiel">Référentiel de Conformité</a> :
        </p>
        <CommuneInfo commune={mapState.selectedCity} />
      </div>
    )
  }

  const criteriaSelector = () => {
    return (
      <div>
        <div className={fr.cx("fr-mb-2w")} style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between", marginTop: mapState.currentLevel === "country" ? "1.5rem" : "0" }}>
          <h3 className={fr.cx("fr-mb-0")} style={{ color: "var(--text-title-blue-france)" }}>
            Critères
          </h3>
          <button
            className={fr.cx("fr-text--sm fr-mb-0 fr-p-0 fr-p-1w")}
            onClick={() => setShowCriteriaSelector(false)}
          >
            Fermer
            <svg className={fr.cx("fr-ml-1w")} width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M5.00048 4.05781L8.30048 0.757812L9.24315 1.70048L5.94315 5.00048L9.24315 8.30048L8.30048 9.24315L5.00048 5.94315L1.70048 9.24315L0.757812 8.30048L4.05781 5.00048L0.757812 1.70048L1.70048 0.757812L5.00048 4.05781Z" fill="#000091"/>
            </svg>
          </button>
        </div>
        <p>
          Retrouvez le détail des critères sur le {" "}
          <a href="/conformite/referentiel">Référentiel de Conformité de la Présence Numérique des Territoires</a>{" "}
            (RCPNT).
        </p>
        <form>
          <RadioButtons
            name="all_criteria"
            options={[
              {
                label: 'Tous les critères',
                nativeInputProps: {
                  checked: mapState.selectedRef === null,
                  onChange: () => setMapState({ ...mapState, selectedRef: null })
                },
              }
            ]}
          />

          {['1. Site internet', '2. Messagerie'].map((section, index) => (
            <div key={index}>
              <div style={{
                fontSize: "var(--text-sm)",
                fontWeight: "bold",
                padding: "0.5rem 0.75rem",
                borderRadius: "4px",
                color: "var(--text-title-blue-france)",
                marginBottom: "1rem",
                cursor: "pointer",
                backgroundColor: 'var(--background-action-low-blue-france)',
                width: "fit-content",
              }}>{section}</div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
                <RadioButtons
                  className={fr.cx("fr-mb-0")}
                  name={`${String(index + 1)}.a`}
                  options={[
                    {
                      label: 'Tous les critères',
                      nativeInputProps: {
                        checked: mapState.selectedRef === `${String(index + 1)}.a`,
                        onChange: () => setMapState({ ...mapState, selectedRef: `${String(index + 1)}.a` })
                      },
                    }
                  ]}
                />
                <div style={{ paddingBottom: "0.75rem"}}>
                  {['mandatory', 'recommended'].map((level) => (
                    <span
                      className={fr.cx(
                        "fr-badge",
                        "fr-badge--sm",
                        "fr-badge--no-icon",
                        "fr-mr-1w",
                        level === "mandatory" ? "fr-badge--success" : "fr-badge--info",
                      )}
                    >
                      {level === "mandatory" ? "Essentiel" : "Recommandé"}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ paddingLeft: "1.5rem" }}>
                <RadioButtons
                  name={`${section.all_key}-criteria`}
                  options={rcpntRefs.filter(ref => ref.key[0] === String(index + 1) && ref.show_in_selector).map((criterion) => ({
                    label: <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <span
                        style={{ marginTop: "2px" }}
                        className={fr.cx(
                          "fr-badge",
                          "fr-badge--sm",
                          "fr-badge--no-icon",
                          criterion.mandatory ? "fr-badge--success" : "fr-badge--info",
                        )}
                      >
                        {criterion.key}
                      </span>
                      <span style={{ fontSize: "var(--text-sm)" }}>{criterion.value}</span>
                    </div>,
                    nativeInputProps: {
                      checked: mapState.selectedRef === criterion.key,
                      onChange: () => setMapState({ ...mapState, selectedRef: criterion.key })
                    },
                  }))}
                />
              </div>
            </div>
          ))}

        </form>

      </div>
    )
  }

  return (
    <div className={fr.cx("fr-pb-3w")}>
      <CommuneSearch
        onSelect={handleQuickNav}
        placeholder="Rechercher une commune ou EPCI"
        smallButton={true}
      />
      {mapState.currentLevel === "country" && !showCriteriaSelector && (
        introduction()
      )}
      {mapState.currentLevel !== "country" && (
        breadcrumbs()
      )}
      {showCriteriaSelector ? (
        criteriaSelector()
      ) : (
        <>
          {mapState.selectedAreas["country"] && (
            levelHeader()
          )}
          {mapState.currentLevel === "department" && !mapState.selectedCity && (
            departmentViewSelector()
          )}
          {!mapState.selectedCity && mapState.selectedAreas[mapState.currentLevel] && (
            levelStats()
          )}
          {mapState.selectedCity && !showCriteriaSelector && (
            communeInfo()
          )}
        </>
      )}
    </div>
  );
};

SidePanelContent.propTypes = {
  rcpntRefs: PropTypes.array.isRequired,
  mapState: PropTypes.object.isRequired,
  selectLevel: PropTypes.func.isRequired,
  getColor: PropTypes.func.isRequired,
  setMapState: PropTypes.func.isRequired,
};

export default SidePanelContent;
