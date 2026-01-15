import { Select } from "@codegouvfr/react-dsfr/Select";
import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import CommuneSearch from "../../../CommuneSearch";
import CommuneInfo from "../../../onboarding/CommuneInfo";
import Breadcrumb from "../../ui/Breadcrumb";
import MapButton from "../../ui/MapButton";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";
import { ReferentielConformite } from "@/pages/conformite/referentiel";
import styles from "./SidePanelContent.module.css";

const SidePanelContent = ({ container, getColor, mapState, selectLevel, setMapState, goBack, handleQuickNav, isMobile, panelState, computeAreaStats }) => {

  const [showCriteriaSelector, setShowCriteriaSelector] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showRegionViewSelector, setShowRegionViewSelector] = useState(false);

  const formatNumber = (value) => {
    return new Intl.NumberFormat("fr-FR").format(value);
  };

  const periods = useMemo(() => {
    return [
      { label: "Q1 2025", value: "2025-03" },
      { label: "Q2 2025", value: "2025-06" },
      { label: "Septembre 2025", value: "2025-09" },
      { label: "Octobre 2025", value: "2025-10" },
      { label: "Novembre 2025", value: "2025-11" },
      { label: "Décembre 2025", value: "2025-12" },
      { label: "Test", value: "2026-01" },
      { label: "Dernière mise à jour", value: "current" },
    ];
  }, []);

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
    if (mapState.selectedAreas.city || !mapState.selectedAreas[mapState.currentLevel]) {
      return null;
    }
    const chartSeries = mapState.filters.rcpnt_ref ? [
      ["2", "Conforme"],
      ["0", "Non conforme"],
    ] : [
      ["2", "Conforme"],
      ["1", "À renforcer"],
      ["0", "À risque"],
    ];

    const conformityStats = computeAreaStats(
      mapState.currentLevel,
      mapState.selectedAreas[mapState.currentLevel]?.insee_geo || "",
      null,
      mapState.selectedAreas.department,
    );

    if (!conformityStats) {
      return null;
    }

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

  }, [mapState.selectedAreas, mapState.currentLevel, mapState.filters.rcpnt_ref, computeAreaStats]);

  const introduction = () => {
    return (
      <div
        className={`${styles.introduction} ${!isMobile ? styles.introductionDesktop : styles.introductionMobile}`}
      >
        <h2 className={styles.title}>
          Cartographie de la Présence Numérique des Territoires
        </h2>
        <p>
          Développée par l'ANCT dans le cadre de l'Observatoire de la Présence
          Numérique des Territoires, cette <strong> Cartographie</strong> est fondée sur le{" "}
          <Link href="/conformite/referentiel"><strong>Référentiel (RPNT)</strong></Link> et
          utilise le jeu de{" "}
          <Link href="https://www.data.gouv.fr/datasets/donnees-de-la-presence-numerique-des-territoires/" target="_blank"><strong>Données (DPNT)</strong></Link> publié
          sur data.gouv.fr.
        </p>
        <p>
          Elle permet d'identifier les <strong>communes</strong> françaises{" "}
          <strong>conformes</strong> aux <strong>critères de sécurité</strong>{" "}
          dans leur <strong>communication en ligne</strong>.
        </p>
        <p className={fr.cx("fr-mb-0")}>
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

  const periodSelector = () => {
    return (
      <div className={styles.periodSelector}>
        <Select
          label="Période"
          nativeSelectProps={{
            onChange: (e) => setMapState({ ...mapState, filters: { ...mapState.filters, period: e.target.value } }),
            value: mapState.filters.period || "current",
          }}
        >
          {periods && periods.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </Select>
      </div>
    );
  };

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

  const handleTitleClick = (e) => {
    if (e.altKey && mapState.currentLevel === "region") {
      e.preventDefault();
      setShowRegionViewSelector((prev) => !prev);
    }
  };

  const levelHeader = () => {
    return (
      <div className={styles.levelHeader}>
        <div>
          <h3
            className={styles.subTitle}
            onClick={handleTitleClick}
            style={{ cursor: 'default' }}
          >
            {currentPageLabel}
          </h3>
          {!mapState.selectedAreas.city && levelStatsDisplay && (
            <p className={styles.statsText}>
              {[
                currentLevelLabel,
                `${formatNumber(levelStatsDisplay.n_cities)} communes`,
              ]
                .filter(Boolean)
                .join(" - ")}
            </p>
          )}
        </div>
        <div className={styles.headerActions}>
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
      <div className={styles.selectionsContainer}>
        <span className={styles.selectionLabel}>Sélection :</span>
        {
          mapState.currentLevel === 'region' && showRegionViewSelector && (['department', 'city'].map((type, index) => (
            <p key={index}
              className={`${styles.selectionTag} ${mapState.regionView === type ? styles.selectionTagActive : ''}`}
              onClick={() => {
                // Re-select the current region with the new view
                selectLevel(
                  "region",
                  mapState.selectedAreas.region.insee_geo,
                  "areaClick",
                  null,
                  null,
                  type
                );
              }}
            >
              {type === 'department' ? 'Département' : 'Commune'}
            </p>
          )))
        }
        {
          mapState.currentLevel === 'department' && (['epci', 'city'].map((type, index) => (
            <p key={index}
              className={`${styles.selectionTag} ${mapState.departmentView === type ? styles.selectionTagActive : ''}`}
              onClick={() => setMapState({ ...mapState, departmentView: type })}
            >
              {type === 'epci' ? 'EPCI' : 'Commune'}
            </p>
          )))
        }
        {
          mapState.filters.rcpnt_ref && (
            <p
              onClick={() => setShowCriteriaSelector(true)}
              className={`${styles.selectionTag} ${styles.selectionTagCriteria}`}
            >
              Critère {mapState.filters.rcpnt_ref}
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
            className={styles.statRow}
          >
            <div
              className={styles.statDot}
              style={{
                backgroundColor: getColor(scoreKey),
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
        <div className={styles.communeInfoButton}>
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
      </div>
    )
  }

  const criteriaSelector = () => {
    return (
      <div>
        <div className={`${styles.criteriaHeader} ${mapState.currentLevel === "country" ? styles.criteriaHeaderMobile : styles.criteriaHeaderDesktop}`}>
          <h3 className={styles.subTitle}>
            Critères
          </h3>
          <button
            className={styles.closeButton}
            onClick={() => setShowCriteriaSelector(false)}
          >
            Fermer
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            className={fr.cx("fr-mb-2w")}
            options={[
              {
                label: 'Tous les critères',
                nativeInputProps: {
                  checked: mapState.filters.rcpnt_ref === null,
                  onChange: () => setMapState({ ...mapState, filters: { ...mapState.filters, rcpnt_ref: null } })
                },
              }
            ]}
          />

          {['1. Site internet', '2. Messagerie'].map((section, index) => (
            <div key={index}>
              <div className={styles.criteriaSectionTitle}>{section}</div>
              <div className={styles.criteriaSectionHeader}>
                <RadioButtons
                  className={fr.cx("fr-mb-0")}
                  name={`${String(index + 1)}.a`}
                  options={[
                    {
                      label: 'Tous les critères',
                      nativeInputProps: {
                        checked: mapState.filters.rcpnt_ref === `${String(index + 1)}.a`,
                        onChange: () => setMapState({ ...mapState, filters: { ...mapState.filters, rcpnt_ref: `${String(index + 1)}.a` } })
                      },
                    }
                  ]}
                />
                <div className={styles.criteriaBadgesContainer}>
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
              <div className={styles.criteriaList}>
                <RadioButtons
                  name={`${section.all_key}-criteria`}
                  options={ReferentielConformite[index].items.map((criterion) => ({
                    key: criterion.num,
                    label: <div className={styles.criteriaLabel}>
                      <span
                        className={`${fr.cx(
                          "fr-badge",
                          "fr-badge--sm",
                          "fr-badge--no-icon",
                          criterion.level === "mandatory" ? "fr-badge--success" : "fr-badge--info",
                        )} ${styles.criteriaNumber}`}
                      >
                        {criterion.num}
                      </span>
                      <span className={styles.criteriaTitle}>{criterion.shortTitle}</span>
                    </div>,
                    nativeInputProps: {
                      checked: mapState.filters.rcpnt_ref === criterion.num,
                      onChange: () => setMapState({ ...mapState, filters: { ...mapState.filters, rcpnt_ref: criterion.num } })
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
          <div className={styles.searchContainer}>
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
              placeholder="Rechercher une collectivité"
              type="all"
              smallButton={true}
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
            <div className={styles.contentWrapper}>
              {periodSelector()}
              {((mapState.currentLevel === "department" && !mapState.selectedAreas.city) || (mapState.currentLevel === "region" && showRegionViewSelector) || mapState.filters.rcpnt_ref) && (
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