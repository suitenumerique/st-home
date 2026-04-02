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
  const [hoveredServiceId, setHoveredServiceId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null); // 'structure' | null
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
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

  const HIDDEN_SERVICES = ["Mes Services Cyber", "Toutes et tous connecté·e·s", "Agents en intervention", "Docs", "Visio"];

  const getMergedStats = (mergedIds) => ({
    communes: mergedIds.reduce((sum, id) => sum + (scopedStats.find(s => s.id === parseInt(id))?.communes || 0), 0),
    epci: mergedIds.reduce((sum, id) => sum + (scopedStats.find(s => s.id === parseInt(id))?.epci || 0), 0),
    autoheberge: mergedIds.reduce((sum, id) => sum + (scopedStats.find(s => s.id === parseInt(id))?.autoheberge || 0), 0),
    opsn_partenaire: mergedIds.reduce((sum, id) => sum + (scopedStats.find(s => s.id === parseInt(id))?.opsn_partenaire || 0), 0),
    total: mergedIds.reduce((sum, id) => sum + (scopedStats.find(s => s.id === parseInt(id))?.total || 0), 0),
  });

  const sortedServices = useMemo(() => {
    const servicesList = Array.isArray(services) ? services : [];
    if (!scopedStats.length) return servicesList;
    return [...servicesList].sort((a, b) => {
      const aTotal = a._mergedIds
        ? a._mergedIds.reduce((sum, id) => sum + (scopedStats.find(s => s.id === parseInt(id))?.total || 0), 0)
        : (scopedStats.find(s => s.id === parseInt(a.id))?.total || 0);
      const bTotal = b._mergedIds
        ? b._mergedIds.reduce((sum, id) => sum + (scopedStats.find(s => s.id === parseInt(id))?.total || 0), 0)
        : (scopedStats.find(s => s.id === parseInt(b.id))?.total || 0);
      return bTotal - aTotal;
    });
  }, [services, scopedStats]);

  const displayedServices = sortedServices;

  useEffect(() => {
    const fetchServices = async () => {
      const response = await fetch("/api/deployment/services");
      const data = await response.json();
      console.log(data);
      const normalizedServices = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      const filtered = normalizedServices.filter((s) => !HIDDEN_SERVICES.includes(s.name));

      const proconnectServices = filtered.filter((s) => s.type === "proconnect");
      const otherServices = filtered.filter((s) => s.type !== "proconnect");

      if (proconnectServices.length > 1) {
        const merged = {
          ...proconnectServices[0],
          id: "proconnect-merged",
          name: "ProConnect",
          _mergedIds: proconnectServices.map((s) => s.id),
        };
        setServices([...otherServices, merged]);
      } else {
        setServices(filtered);
      }
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
      } else if (mapState.currentLevel === 'epci' && mapState.selectedAreas.epci) {
        filter = `&epci=${mapState.selectedAreas.epci.insee_geo}`;
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

  const orgType = mapState.filters.org_type ?? 'all';

  const getServiceCount = (stats) => {
    if (!stats) return 0;
    if (orgType === 'commune') return stats.communes || 0;
    if (orgType === 'epci') return stats.epci || 0;
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

  const orgTypeLabel = { all: 'Toutes structures', commune: 'Communes', epci: 'EPCI' }[orgType];

  const filters = () => (
    <div className={styles.filtersContainer} ref={dropdownRef}>
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
                className={`${styles.filterDropdownOption} ${orgType === val ? styles.filterDropdownOptionActive : ''}`}
                onClick={() => {
                  setMapState({ ...mapState, filters: { ...mapState.filters, org_type: val === 'all' ? null : val } });
                  setOpenDropdown(null);
                }}
              >
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
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
          {(orgType === 'all' || orgType === 'commune') && (
            <li>Communes : <strong>{formatNumber(communes)}</strong></li>
          )}
          {(orgType === 'all' || orgType === 'epci') && (
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
          const stats = service._mergedIds
            ? getMergedStats(service._mergedIds)
            : scopedStats.find(s => s.id === parseInt(service.id));
          const count = getServiceCount(stats);
          const isExpanded = expandedServices.has(service.id);
          const isSelected = service._mergedIds
            ? !!(mapState.filters.service_ids?.some(id => service._mergedIds.includes(id)))
            : !!(mapState.filters.service_ids?.includes(service.id));
          const isDimmed = !!(mapState.filters.service_ids?.length > 0 && !isSelected);

          if (singleService) {
            return (
              <div key={service.id}>
                {serviceDetails(service, stats, true)}
              </div>
            );
          }

          return (
            <div key={service.id} className={`${styles.serviceAccordion} ${isDimmed ? styles.dimmed : ''}`}>
              <button
                className={styles.serviceHeader}
                onClick={() => toggleService(service.id)}
                aria-expanded={isExpanded}
              >
                <div className={styles.serviceHeaderLeft}>
                  {service.logo_url && (
                    <div
                      className={`${styles.productCheckbox} ${isSelected ? styles.productCheckboxSelected : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const newIds = isSelected ? null : (service._mergedIds || [service.id]);
                        setMapState({ ...mapState, filters: { ...mapState.filters, service_ids: newIds } });
                      }}
                      onMouseEnter={() => setHoveredServiceId(service.id)}
                      onMouseLeave={() => setHoveredServiceId(null)}
                    >
                      {hoveredServiceId === service.id || isSelected ? (
                        <span className={fr.cx("fr-icon-check-line")} aria-hidden="true" />
                      ) : (
                        <img className={styles.productCheckboxImage} src={service.logo_url} alt={service.name} />
                      )}
                    </div>
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
      <h3 className={styles.serviceListTitle}>Services</h3>
      {mapState.selectedAreas?.city?.additionalCityStats?.all_services && (
        services.map((service) => {
          const cityServices = mapState.selectedAreas.city.additionalCityStats.all_services;
          const isUsed = service._mergedIds
            ? service._mergedIds.some(id => cityServices.includes(id))
            : cityServices.includes(service.id);
          if (!isUsed) {
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
