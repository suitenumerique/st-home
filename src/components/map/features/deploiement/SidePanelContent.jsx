import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import { useMemo, useState, useEffect, useRef } from "react";
import CommuneSearch from "../../../CommuneSearch";
import Breadcrumb from "../../ui/Breadcrumb";
import MapButton from "../../ui/MapButton";
import styles from "./SidePanelContent.module.css";

const SidePanelContent = ({ container, getColor, mapState, selectLevel, setMapState, goBack, handleQuickNav, isMobile, panelState, computeAreaStats }) => {

  const [linkCopied, setLinkCopied] = useState(false);
  const [services, setServices] = useState([]);
  const [scopedStats, setScopedStats] = useState([]);
  const [expandedServices, setExpandedServices] = useState(new Set());
  const [orgTypeFilter, setOrgTypeFilter] = useState('all');
  const [openDropdown, setOpenDropdown] = useState(null); // 'service' | 'structure' | null
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const toggleService = (serviceId) => {
    setExpandedServices(prev => {
      const next = new Set(prev);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });
  };

  const sortedServices = useMemo(() => {
    if (!scopedStats.length) return services;
    return [...services].sort((a, b) => {
      const aStats = scopedStats.find(s => s.id === parseInt(a.id));
      const bStats = scopedStats.find(s => s.id === parseInt(b.id));
      return (bStats?.total || 0) - (aStats?.total || 0);
    });
  }, [services, scopedStats]);

  const displayedServices = useMemo(() => {
    if (!mapState.filters.service_ids || mapState.filters.service_ids.length === 0) {
      return sortedServices;
    }
    return sortedServices.filter(s => mapState.filters.service_ids.includes(s.id));
  }, [sortedServices, mapState.filters.service_ids]);

  useEffect(() => {
    const fetchServices = async () => {
      const response = await fetch("/api/deployment/services");
      const data = await response.json();
      setServices(data);
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchScopedStats = async () => {
      if (mapState.selectedAreas.city) {
        setScopedStats([]);
        return;
      }

      let filter = '';
      if (mapState.currentLevel === 'region' && mapState.selectedAreas.region) {
        filter = `&reg=${mapState.selectedAreas.region.insee_geo.replace("r", "")}`;
      } else if (mapState.currentLevel === 'department' && mapState.selectedAreas.department) {
        filter = `&dep=${mapState.selectedAreas.department.insee_geo}`;
      }

      try {
        const response = await fetch(`/api/deployment/stats?scope=list-service${filter}`);
        const data = await response.json();
        setScopedStats(data.data || []);
      } catch (error) {
        console.error('Error fetching scoped stats:', error);
        setScopedStats([]);
      }
    };

    fetchScopedStats();
  }, [mapState.selectedAreas, mapState.currentLevel]);

  const usageStats = useMemo(() => {
    if (mapState.selectedAreas.city) return null;
    return computeAreaStats(
      mapState.currentLevel,
      mapState.selectedAreas[mapState.currentLevel]?.insee_geo || "",
      "",
    );
  }, [mapState.currentLevel, mapState.selectedAreas, mapState.filters, computeAreaStats]);

  const getServiceCount = (stats) => {
    if (!stats) return 0;
    if (orgTypeFilter === 'commune') return stats.communes || 0;
    if (orgTypeFilter === 'epci') return stats.epci || 0;
    return stats.total || 0;
  };

  const breadcrumbs = () => (
    <div>
      <Breadcrumb
        segments={breadcrumbSegments}
        currentPageLabel={
          mapState.currentLevel === "city"
            ? mapState.selectedAreas.city.name + " (" + mapState.selectedAreas.city.zipcode + ")"
            : currentPageLabel
        }
      />
    </div>
  );

  const selectedService = useMemo(() => {
    if (!mapState.filters.service_ids?.length) return null;
    return services.find(s => s.id === mapState.filters.service_ids[0]) || null;
  }, [mapState.filters.service_ids, services]);

  const orgTypeLabel = { all: 'Toutes structures', commune: 'Communes', epci: 'EPCI' }[orgTypeFilter];

  const filters = () => (
    <div className={styles.filtersContainer} ref={dropdownRef}>
      {/* Service dropdown */}
      <div className={styles.filterDropdown}>
        <button
          className={styles.filterDropdownButton}
          onClick={() => setOpenDropdown(openDropdown === 'service' ? null : 'service')}
          aria-expanded={openDropdown === 'service'}
        >
          {selectedService?.logo_url && (
            <img src={selectedService.logo_url} alt="" aria-hidden="true" className={styles.filterDropdownLogo} />
          )}
          {selectedService ? selectedService.name : 'Tous les services'}
          <span className={fr.cx("fr-icon-arrow-down-s-line fr-icon--sm")} aria-hidden="true"></span>
        </button>
        {openDropdown === 'service' && (
          <ul className={styles.filterDropdownMenu}>
            <li
              className={`${styles.filterDropdownOption} ${!mapState.filters.service_ids?.length ? styles.filterDropdownOptionActive : ''}`}
              onClick={() => {
                setMapState({ ...mapState, filters: { ...mapState.filters, service_ids: null } });
                setOpenDropdown(null);
              }}
            >
              Tous les services
            </li>
            {services.map(s => (
              <li
                key={s.id}
                className={`${styles.filterDropdownOption} ${mapState.filters.service_ids?.includes(s.id) ? styles.filterDropdownOptionActive : ''}`}
                onClick={() => {
                  setMapState({ ...mapState, filters: { ...mapState.filters, service_ids: [s.id] } });
                  setOpenDropdown(null);
                }}
              >
                {s.logo_url && <img src={s.logo_url} alt="" aria-hidden="true" className={styles.filterDropdownLogo} />}
                {s.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Structure type dropdown */}
      {/* {!mapState.selectedAreas.city && (
        <div className={styles.filterDropdown}>
          <button
            className={styles.filterDropdownButton}
            onClick={() => setOpenDropdown(openDropdown === 'structure' ? null : 'structure')}
            aria-expanded={openDropdown === 'structure'}
          >
            {orgTypeLabel}
            <span className={fr.cx("fr-icon-arrow-down-s-line fr-icon--sm")} aria-hidden="true"></span>
          </button>
          {openDropdown === 'structure' && (
            <ul className={styles.filterDropdownMenu}>
              {[['all', 'Toutes structures'], ['commune', 'Communes'], ['epci', 'EPCI']].map(([val, label]) => (
                <li
                  key={val}
                  className={`${styles.filterDropdownOption} ${orgTypeFilter === val ? styles.filterDropdownOptionActive : ''}`}
                  onClick={() => { setOrgTypeFilter(val); setOpenDropdown(null); }}
                >
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )} */}
    </div>
  );

  const serviceDetails = (service, stats, compact = false) => {
    const communes = stats?.communes || 0;
    const epci = stats?.epci || 0;
    const autoheberge = stats?.autoheberge || 0;
    const opsn = stats?.opsn_partenaire || 0;
    return (
      <div className={compact ? styles.serviceDetailsCompact : styles.serviceDetails}>
        <ul className={styles.serviceDetailsList}>
          {(orgTypeFilter === 'all' || orgTypeFilter === 'commune') && (
            <li>Communes : <strong>{formatNumber(communes)}</strong></li>
          )}
          {(orgTypeFilter === 'all' || orgTypeFilter === 'epci') && (
            <li>EPCI : <strong>{formatNumber(epci)}</strong></li>
          )}
        </ul>
        <ul className={styles.serviceDetailsList}>
          <li>Autohébergé : <strong>{formatNumber(autoheberge)}</strong></li>
          <li>OPSN partenaire : <strong>{formatNumber(opsn)}</strong></li>
        </ul>
      </div>
    );
  };

  const serviceList = () => {
    const singleService = displayedServices.length === 1;
    return (
      <div className={styles.serviceList}>
        {displayedServices.map((service) => {
          const stats = scopedStats.find(s => s.id === parseInt(service.id));
          const count = getServiceCount(stats);
          const isExpanded = expandedServices.has(service.id);

          if (singleService) {
            return (
              <div key={service.id}>
                {serviceDetails(service, stats, true)}
              </div>
            );
          }

          return (
            <div key={service.id} className={styles.serviceAccordion}>
              <button
                className={styles.serviceHeader}
                onClick={() => toggleService(service.id)}
                aria-expanded={isExpanded}
              >
                <div className={styles.serviceHeaderLeft}>
                  {service.logo_url && (
                    <img className={styles.serviceLogo} src={service.logo_url} alt="" aria-hidden="true" />
                  )}
                  <span className={styles.serviceName}>{service.name}</span>
                  {service.maturity !== 'stable' && (
                    <span className={fr.cx("fr-badge fr-badge--sm fr-badge--info fr-badge--no-icon")}>
                      {service.maturity.toUpperCase()}
                    </span>
                  )}
                  <span className={styles.serviceCount}>{formatNumber(count)} structure{count !== 1 ? 's' : ''}</span>
                </div>
                <span
                  className={fr.cx(isExpanded ? "fr-icon-arrow-up-s-line" : "fr-icon-arrow-down-s-line")}
                  aria-hidden="true"
                ></span>
              </button>
              {isExpanded && serviceDetails(service, stats)}
            </div>
          );
        })}
      </div>
    );
  };

  const communeInfo = () => (
    <div>
      <h3 className={styles.serviceListTitle}>Produits</h3>
      {mapState.selectedAreas?.city?.additionalCityStats?.all_services && (
        services.map((service) => {
          if (!mapState.selectedAreas.city.additionalCityStats.all_services.includes(service.id)) {
            return null;
          }
          return (
            <div key={service.id} className={styles.cityServiceItem}>
              <img src={service.logo_url} alt={service.name} style={{ width: "18px", height: "18px", marginRight: "0.4rem" }} />
              <span style={{ fontSize: "0.875rem" }}>{service.name}&nbsp;</span>
              {service.maturity !== 'stable' && (
                <span className={fr.cx("fr-badge fr-badge--sm fr-badge--info fr-badge--no-icon")}>
                  {service.maturity.toUpperCase()}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div>
      {!isMobile && (
        <div className={styles.searchContainer}>
          {mapState.currentLevel !== "country" && (
            <MapButton onClick={() => goBack()} aria-label="Retour" tooltip="Retour">
              <span aria-hidden="true" className={fr.cx("fr-icon-arrow-go-back-line")}></span>
            </MapButton>
          )}
          <CommuneSearch
            container={container}
            onSelect={handleQuickNav}
            placeholder="Rechercher une collectivité"
            smallButton={true}
            includeRegionsAndDepartments={true}
          />
        </div>
      )}

      {filters()}

      {mapState.currentLevel !== "country" && !isMobile && breadcrumbs()}

      {(panelState === 'open' || panelState === 'partial') && (
        <div className={styles.levelHeader}>
          <div>
            <h2 className={styles.areaTitle}>{currentPageLabel || "France"}</h2>
            {usageStats?.n_cities != null && (
              <p className={styles.areaSub}>
                {formatNumber(usageStats.n_cities)} structure{usageStats.n_cities !== 1 ? 's' : ''} utilisatrice{usageStats.n_cities !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className={styles.headerActions}>
            <MapButton
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
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
      )}

      {panelState === 'open' && (
        <div>
          {!mapState.selectedAreas.city && serviceList()}
          {mapState.selectedAreas.city && communeInfo()}
        </div>
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
  computeAreaStats: PropTypes.func.isRequired,
};

export default SidePanelContent;
