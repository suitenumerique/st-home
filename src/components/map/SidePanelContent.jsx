import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import CommuneSearch from "../CommuneSearch";
import CommuneInfo from "../onboarding/CommuneInfo";
import Breadcrumb from "./Breadcrumb";
import MapButton from "./MapButton";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Button } from "@codegouvfr/react-dsfr/Button";

const SidePanelContent = ({ container, rcpntRefs, getColor, mapState, selectLevel, setMapState, goBack, handleQuickNav, isMobile, panelState, setPanelState, computeAreaStats }) => {

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
    if (mapState.selectedAreas.city) {
      return null;
    }
    const chartSeries = mapState.selectedRef ? [
      ["2", "Conforme"],
      ["0", "Non conforme"],
    ] : [
      ["2", "Conforme"],
      ["1", "Semi-conforme"],
      ["0", "Non conforme"],
    ];

    const conformityStats = computeAreaStats(mapState.currentLevel, mapState.selectedAreas[mapState.currentLevel].insee_geo);

    const statsDetails = chartSeries.map(([scoreKey, label]) => {
      if (!mapState.selectedAreas[mapState.currentLevel]) {
        return [];
      }
      try {
        const percentage = Math.round(
          (conformityStats.details[scoreKey] / conformityStats?.n_cities) * 100,
        );
        return [
          label,
          percentage,
          scoreKey,
          conformityStats.details[scoreKey],
        ];
      } catch (error) {
        console.error(error);
        return [];
      }
    });

    return {
      n_cities: conformityStats?.n_cities,
      details: statsDetails,
    }

  }, [mapState.selectedAreas, mapState.currentLevel, mapState.selectedRef, computeAreaStats]);

  const introduction = () => {
    return (
      <div
        className={fr.cx("fr-pb-2w fr-mb-3w")}
        style={{
          borderBottom: "2px solid var(--border-default-grey)",
          paddingTop: !isMobile ? "1rem" : "0",
        }}
      >
        <h2 style={{ color: "var(--text-title-blue-france)" }}>
          Bienvenue sur la Carte de la Présence Numérique des Territoires
        </h2>
        <p>
          Développée par l'ANCT, la{" "}
          <strong>Cartographie de la Présence Numérique des Territoires (CPNT)</strong> est
          fondée sur le{" "}
          <a href="/conformite/referentiel">Référentiel de la Présence Numérique des Territoires</a>{" "}
          (RPNT).
        </p>
        <p>
          Elle permet d'identifier les <strong>communes</strong> françaises{" "}
          <strong>conformes</strong> aux <strong>critères de sécurité</strong>{" "}
          dans leur <strong>communication en ligne</strong>.
        </p>
        <p style={{ marginBottom: "0" }}>
          Les critères sont reliés aux usages d’un <strong>nom de domaine</strong> et{" "}
          <strong>structurés</strong> en <strong>deux parties</strong> :
        </p>
        <ol style={{ paddingLeft: "2rem" }}>
          <li>le site internet</li>
          <li>l’adresse de messagerie de la collectivité.</li>
        </ol>
      </div>
    )
  }

  const breadcrumbs = () => {
    return (
      <div className="map-side-panel-breadcrumbs">
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
                `${formatNumber(levelStatsDisplay.n_cities)} communes`,
              ]
                .filter(Boolean)
                .join(" - ")}
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
          <MapButton
            onClick={() => setShowCriteriaSelector(true)}
            aria-label="Sélectionner un critère"
            tooltip="Sélectionner un critère"
          >
            <span className={fr.cx("fr-icon-list-unordered")} aria-hidden="true"></span>
          </MapButton>

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

  const selections = () => {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <span style={{ flexShrink: "0" }} className={fr.cx("fr-text--sm fr-mb-0")}>Sélection :</span>
        {
          mapState.currentLevel === 'department' && (['epci', 'city'].map((type, index) => (
            <p key={index} style={{
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
              flexShrink: "0",
              backgroundColor: mapState.departmentView === type ? "var(--background-action-low-blue-france-active)" : "var(--background-action-low-blue-france)",
              }}
              onClick={() => setMapState({ ...mapState, departmentView: type })}
            >
              {type === 'epci' ? 'EPCI' : 'Commune'}
            </p>
          )))
        }
        {
          mapState.selectedRef && (
            <p
              onClick={() => setShowCriteriaSelector(true)}
              style={{
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
              marginBottom: "0",
              flexShrink: "0",
              backgroundColor: "var(--background-contrast-grey)",
              cursor: "pointer",
              }}
            >
              Critère {mapState.selectedRef}
            </p>
          )
        }
      </div>
    )
  }

  const levelStats = () => {
    return (
      <div>
        {levelStatsDisplay && levelStatsDisplay.details.map(([label, percentage, scoreKey, n_cities], index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: getColor(scoreKey),
                borderRadius: "100%",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxSizing: "border-box",
                marginRight: "0.5rem",
              }}
            ></div>
            <span>{label}&nbsp;:</span>
            <span>
              <strong>&nbsp;{percentage}%</strong>
            </span>
            <span>&nbsp;({formatNumber(n_cities)})</span>
          </div>
        ))}
      </div>
    )
  }

  const communeInfo = () => {
    return (
      <div>
        <p className={fr.cx("fr-text--sm")}>
          Voici la situation de la commune par rapport au{" "}
          <a href="/conformite/referentiel">Référentiel de la Présence Numérique des Territoires</a> :
        </p>
        <CommuneInfo commune={mapState.selectedAreas.city} servicePublicUrlOnExpand={true} />
        <div style={{ marginTop: "-0.5rem"}}>
          <Button
            priority="primary"
            linkProps={{
              href: "/bienvenue/" + mapState.selectedAreas.city.siret,
            }}
            iconId="fr-icon-arrow-right-line"
            iconPosition="right"
          >
            Vérifier l'éligibilité</Button>
        </div>
        {/* {
          mapState.selectedAreas.city.structures?.length > 0 && (
            <div style={{
              borderRadius: "4px",
              padding: "1.2rem",
              backgroundColor: "var(--background-alt-blue-france)",
            }}>
              <h3>Bonne nouvelle !</h3>
              <p>
                La collectivité pourra bientôt être <strong>accompagnée par la structure de mutualisation de son choix</strong> pour utiliser la Suite Territoriale.
              </p>
              <Button
                priority="secondary"
                linkProps={{
                  href: "/bienvenue/" + mapState.selectedAreas.city.siret,
                }}
              >
                Voir les structures partenaires
              </Button>
            </div>
          )
        } */}
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
              <path d="M5.00048 4.05781L8.30048 0.757812L9.24315 1.70048L5.94315 5.00048L9.24315 8.30048L8.30048 9.24315L5.00048 5.94315L1.70048 9.24315L0.757812 8.30048L4.05781 5.00048L0.757812 1.70048L1.70048 0.757812L5.00048 4.05781Z" fill="#000091"/>
            </svg>
          </button>
        </div>
        <p>
          Retrouvez le détail des critères sur le {" "}
          <a href="/conformite/referentiel">Référentiel de la Présence Numérique des Territoires</a>{" "}
            (RPNT).
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
                <div style={{ paddingBottom: "0.75rem", paddingLeft: "0.75rem" }}>
                  {['mandatory', 'recommended'].map((level, index) => (
                    <span
                      key={index}
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
                  options={rcpntRefs[index].items.map((criterion) => ({
                    key: criterion.num,
                    label: <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <span
                        style={{ marginTop: "2px" }}
                        className={fr.cx(
                          "fr-badge",
                          "fr-badge--sm",
                          "fr-badge--no-icon",
                          criterion.level === "mandatory" ? "fr-badge--success" : "fr-badge--info",
                        )}
                      >
                        {criterion.num}
                      </span>
                      <span style={{ fontSize: "var(--text-sm)" }}>{criterion.shortTitle}</span>
                    </div>,
                    nativeInputProps: {
                      checked: mapState.selectedRef === criterion.num,
                      onChange: () => setMapState({ ...mapState, selectedRef: criterion.num })
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
      {mapState.currentLevel === "country" && !showCriteriaSelector && panelState === 'open' && (
        introduction()
      )}
      {mapState.currentLevel !== "country" && !isMobile && (
        breadcrumbs()
      )}
      {showCriteriaSelector ? (
        criteriaSelector()
      ) : (
        <>
          {mapState.selectedAreas["country"] && mapState.selectedAreas[mapState.currentLevel] && (panelState === 'open' || panelState === 'partial') && (
            levelHeader()
          )}
          {panelState === 'open' && (
            <div style={{ marginTop: "1rem" }}>
              {((mapState.currentLevel === "department" && !mapState.selectedAreas.city) || mapState.selectedRef) && (
                selections()
              )}
              {!mapState.selectedAreas.city && mapState.selectedAreas[mapState.currentLevel] && (
                levelStats()
              )}
              {mapState.selectedAreas.city && !showCriteriaSelector && (
                communeInfo()
              )}
            </div>
          )}
        </>
      )}
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
  computeAreaStats: PropTypes.func.isRequired,
};

export default SidePanelContent;
