import { fr } from "@codegouvfr/react-dsfr";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import PropTypes from "prop-types";
import { useMemo, useState, useEffect, useRef } from "react";
import parentAreas from "../../../../../public/parent_areas.json";
import CommuneSearch from "../../../CommuneSearch";
import Breadcrumb from "../../ui/Breadcrumb";
import MapButton from "../../ui/MapButton";
import styles from "./SidePanelContent.module.css";
import servicesConfig from "./servicesConfig";

const DEPT_NAMES = Object.fromEntries(
  parentAreas.filter(a => a.type === 'department').map(a => [a.insee_geo, a.name])
);

const SidePanelContent = ({ container, getColor, mapState, selectLevel, setMapState, goBack, handleQuickNav, isMobile, panelState, computeAreaStats, activeTab, setActiveTab, operators = [], allServices = [], selectedServiceFilter, setSelectedServiceFilter, selectedAreaOwnServices = new Set() }) => {

  const [linkCopied, setLinkCopied] = useState(false);
  const [services, setServices] = useState([]);
  const [scopedStats, setScopedStats] = useState([]);
  const [expandedServices, setExpandedServices] = useState(new Set());
  const [hoveredServiceId, setHoveredServiceId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null); // 'structure' | 'service-filter' | null
  const [expandedOperatorId, setExpandedOperatorId] = useState(null);
  const [showTerritoireServices, setShowTerritoireServices] = useState(false);

  useEffect(() => {
    if (operators.length === 1) {
      setExpandedOperatorId(operators[0].id);
    } else {
      setExpandedOperatorId(null);
    }
  }, [operators]);

  useEffect(() => {
    setShowTerritoireServices(false);
  }, [mapState.currentLevel, mapState.selectedAreas]);
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
      const aOrder = servicesConfig[a.name]?.order ?? 0;
      const bOrder = servicesConfig[b.name]?.order ?? 0;
      if (aOrder !== bOrder) return aOrder - bOrder;
      const aTotal = a._mergedIds
        ? a._mergedIds.reduce((sum, id) => sum + (scopedStats.find(s => s.id === parseInt(id))?.total || 0), 0)
        : (scopedStats.find(s => s.id === parseInt(a.id))?.total || 0);
      const bTotal = b._mergedIds
        ? b._mergedIds.reduce((sum, id) => sum + (scopedStats.find(s => s.id === parseInt(id))?.total || 0), 0)
        : (scopedStats.find(s => s.id === parseInt(b.id))?.total || 0);
      return bTotal - aTotal;
    });
  }, [services, scopedStats]);

  useEffect(() => {
    const fetchServices = async () => {
      const response = await fetch("/api/deployment/services");
      const data = await response.json();
      console.log(data);
      const normalizedServices = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      const filtered = normalizedServices.filter((s) => servicesConfig[s.name]?.visible !== false);

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

  const displayedServices = sortedServices.filter((s) => {
    const config = servicesConfig[s.name];
    if (!config?.available_for?.length) return true;
    if (orgType === 'all') return true;
    return config.available_for.includes(orgType);
  });

  const getServiceCount = (stats, service) => {
    if (!stats) return 0;
    const threshold = servicesConfig[service?.name]?.anct_threshold_active;
    if (orgType === 'commune') return threshold ? (stats.communes_anct || 0) : (stats.communes || 0);
    if (orgType === 'epci') return threshold ? (stats.epci_anct || 0) : (stats.epci || 0);
    if (orgType === 'department') return stats.departement || 0;
    if (orgType === 'region') return stats.region || 0;
    if (threshold) return (stats.communes_anct || 0) + (stats.epci_anct || 0);
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

  const orgTypeLabel = { all: 'Toutes structures', commune: 'Communes', epci: 'Intercommunalités', department: 'Départements', region: 'Région' }[orgType];

  const filters = () => {
    if (activeTab === 'partenaires') {
      const selectedService = allServices.find((s) => s.id === selectedServiceFilter);
      const label = selectedService ? selectedService.name : 'Tous les services';
      const isSelected = !!selectedServiceFilter;
      return (
        <div className={styles.filtersContainer} ref={dropdownRef}>
          <div className={styles.filterDropdown}>
            <button
              className={`${styles.filterDropdownButton} ${!isSelected ? styles.filterDropdownButtonUnselected : styles.filterDropdownButtonSelected}`}
              onClick={() => setOpenDropdown(openDropdown === 'service-filter' ? null : 'service-filter')}
              aria-expanded={openDropdown === 'service-filter'}
            >
              {label}
              <span className={fr.cx("fr-icon-arrow-down-s-line fr-icon--sm")} aria-hidden="true"></span>
            </button>
            {openDropdown === 'service-filter' && (
              <ul className={styles.filterDropdownMenu}>
                <li
                  className={`${styles.filterDropdownOption} ${styles.filterDropdownOptionFirst}`}
                  onClick={() => { setSelectedServiceFilter(null); setOpenDropdown(null); }}
                >
                  <span>Tous les services</span>
                  <span className={fr.cx("fr-icon-check-line fr-icon--sm")} aria-hidden="true" style={{ visibility: !isSelected ? 'visible' : 'hidden' }} />
                </li>
                {allServices.map((s) => (
                  <li
                    key={s.id}
                    className={styles.filterDropdownOption}
                    onClick={() => { setSelectedServiceFilter(s.id); setOpenDropdown(null); }}
                  >
                    <span>{s.name}</span>
                    <span className={fr.cx("fr-icon-check-line fr-icon--sm")} aria-hidden="true" style={{ visibility: selectedServiceFilter === s.id ? 'visible' : 'hidden' }} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.filtersContainer} ref={dropdownRef}>
        <div className={styles.filterDropdown}>
          <button
            className={`${styles.filterDropdownButton} ${orgType === 'all' ? styles.filterDropdownButtonUnselected : styles.filterDropdownButtonSelected}`}
            onClick={() => setOpenDropdown(openDropdown === 'structure' ? null : 'structure')}
            aria-expanded={openDropdown === 'structure'}
          >
            {orgTypeLabel}
            <span className={fr.cx("fr-icon-arrow-down-s-line fr-icon--sm")} aria-hidden="true"></span>
          </button>
          {openDropdown === 'structure' && (
            <ul className={styles.filterDropdownMenu}>
              {[['all', 'Toutes structures'], ['commune', 'Communes'], ['epci', 'Intercommunalités'], ['department', 'Départements'], ['region', 'Région']].map(([val, label], index) => (
                <li
                  key={val}
                  className={`${styles.filterDropdownOption} ${index === 0 ? styles.filterDropdownOptionFirst : ''}`}
                  onClick={() => {
                    const newOrgType = val === 'all' ? null : val;
                    const selectedIds = mapState.filters.service_ids;
                    const selectedService = selectedIds?.length
                      ? services.find(s => (s._mergedIds || [s.id]).some(id => selectedIds.includes(id)))
                      : null;
                    const serviceAvailable = !selectedService || !newOrgType
                      || (servicesConfig[selectedService.name]?.available_for ?? []).includes(newOrgType);
                    setMapState({
                      ...mapState,
                      filters: {
                        ...mapState.filters,
                        org_type: newOrgType,
                        ...(serviceAvailable ? {} : { service_ids: null, anct_threshold_active: false }),
                      },
                    });
                    setOpenDropdown(null);
                  }}
                >
                  <span>{label}</span>
                  <span className={fr.cx("fr-icon-check-line fr-icon--sm")} aria-hidden="true" style={{ visibility: orgType === val ? 'visible' : 'hidden' }} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

const serviceDetails = (service, stats, compact = false) => {
    const level = mapState.currentLevel;
    const threshold = servicesConfig[service?.name]?.anct_threshold_active;
    const communes = threshold ? (stats?.communes_anct || 0) : (stats?.communes || 0);
    const epci = threshold ? (stats?.epci_anct || 0) : (stats?.epci || 0);
    const departements = stats?.departement || 0;
    const regions = stats?.region || 0;
    const showEpci = level !== 'epci';
    const showDepartement = level !== 'epci' && level !== 'department';
    const showRegion = level !== 'epci' && level !== 'department' && level !== 'region';
    return (
      <div className={styles.serviceDetails}>
        {servicesConfig[service.name]?.definition && (
          <p className={styles.serviceDetailsTitle}>{servicesConfig[service.name].definition}</p>
        )}
        <div className={styles.serviceDetailsGrid}>
          <span>Communes : <strong>{formatNumber(communes)}</strong></span>
          {showEpci && <span>EPCI : <strong>{formatNumber(epci)}</strong></span>}
          {showDepartement && <span>Départements : <strong>{formatNumber(departements)}</strong></span>}
          {showRegion && <span>Régions : <strong>{formatNumber(regions)}</strong></span>}
        </div>
      </div>
    );
  };

  const renderServiceItem = (service, singleService) => {
          const stats = service._mergedIds
            ? getMergedStats(service._mergedIds)
            : scopedStats.find(s => s.id === parseInt(service.id));
          const count = getServiceCount(stats, service);
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
            <div key={service.id} className={`${styles.serviceAccordion} ${isDimmed ? styles.dimmed : ''} ${isSelected ? styles.serviceAccordionSelected : ''}`}>
              <button
                className={styles.serviceHeader}
                onClick={() => toggleService(service.id)}
                aria-expanded={isExpanded}
              >
                <div className={styles.serviceHeaderLeft}>
                  {service.logo_url && (
                    <img className={styles.servicelogo} src={service.logo_url} alt={service.name} />
                  )}
                  <span className={styles.serviceName}>{servicesConfig[service.name]?.shortname ?? service.name}</span>
                  {service.maturity !== 'stable' && (
                    <span className={fr.cx("fr-badge fr-badge--sm fr-badge--info fr-badge--no-icon")}>
                      {service.maturity.toUpperCase()}
                    </span>
                  )}
                  <span className={styles.serviceCount}>{formatNumber(count)} structure{count !== 1 ? 's' : ''}</span>
                </div>
                <div className={styles.serviceHeaderRight}>
                  <div
                    className={`${styles.serviceCheckbox} ${isSelected ? styles.serviceCheckboxSelected : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const idsToToggle = service._mergedIds || [service.id];
                      if (isSelected) {
                        setMapState({ ...mapState, filters: { ...mapState.filters, service_ids: null, anct_threshold_active: false } });
                        setExpandedServices(prev => { const next = new Set(prev); next.delete(service.id); return next; });
                      } else {
                        const thresholdActive = !!servicesConfig[service.name]?.anct_threshold_active;
                        setMapState({ ...mapState, filters: { ...mapState.filters, service_ids: idsToToggle, anct_threshold_active: thresholdActive } });
                        setExpandedServices(new Set([service.id]));
                      }
                    }}
                  >
                    {isSelected && <span className={fr.cx("fr-icon-check-line")} aria-hidden="true" />}
                  </div>
                  <span
                    className={fr.cx(isExpanded ? "fr-icon-arrow-up-s-line" : "fr-icon-arrow-down-s-line")}
                    aria-hidden="true"
                  ></span>
                </div>
              </button>
              {isExpanded && serviceDetails(service, stats)}
            </div>
          );
  };

  const serviceList = () => {
    const singleService = displayedServices.length === 1;
    const suiteServices = displayedServices.filter(s => servicesConfig[s.name]?.category !== 'other');
    const autresServices = displayedServices.filter(s => servicesConfig[s.name]?.category === 'other');
    return (
      <div className={styles.serviceList}>
        <h4 className={styles.serviceGroupTitle}>La Suite territoriale</h4>
        {suiteServices.map((service) => renderServiceItem(service, singleService))}
        {autresServices.length > 0 && (
          <>
            <h4 className={`${styles.serviceGroupTitle} ${styles.serviceGroupTitleSecond}`}>Les autres services</h4>
            {autresServices.map((service) => renderServiceItem(service, singleService))}
          </>
        )}
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

  const areaOrgServices = () => (
    <div>
      <h3 className={styles.serviceListTitle}>Services</h3>
      {services.filter(service =>
        service._mergedIds
          ? service._mergedIds.some(id => selectedAreaOwnServices.has(id))
          : selectedAreaOwnServices.has(service.id)
      ).length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-mention-grey)' }}>Aucun service utilisé par cette structure.</p>
      ) : (
        services.map((service) => {
          const isUsed = service._mergedIds
            ? service._mergedIds.some(id => selectedAreaOwnServices.has(id))
            : selectedAreaOwnServices.has(service.id);
          if (!isUsed) return null;
          return (
            <div key={service.id} className={styles.cityServiceItem}>
              {service.logo_url && <img src={service.logo_url} alt={service.name} style={{ width: "18px", height: "18px", marginRight: "0.4rem" }} />}
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

  const header = () => (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <h4 className={styles.headerTitle}>Cartographie</h4>
        <SegmentedControl
          hideLegend
          small
          segments={[
            {
              label: 'Utilisateurs',
              nativeInputProps: {
                checked: activeTab === 'utilisateurs',
                onChange: () => setActiveTab('utilisateurs'),
              },
            },
            {
              label: 'Partenaires',
              nativeInputProps: {
                checked: activeTab === 'partenaires',
                onChange: () => setActiveTab('partenaires'),
              },
            },
          ]}
        />
      </div>
      <p className={styles.headerDescription}>
        {activeTab === 'utilisateurs'
          ? "Cette carte permet d'identifier les structures qui utilisent les services de la suite territoriale."
          : "Voici les structures qui déploient les services de la suite territoriale. Vous souhaitez les distribuer ?"}
      </p>
      {activeTab === 'partenaires' && (
        <a href="mailto:contact@suite.anct.gouv.fr" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-action-high-blue-france)', fontWeight: '400', fontSize: '16px', textDecoration: 'none' }}>
          Devenez partenaire
          <span className={fr.cx("fr-icon-arrow-right-up-line", "fr-icon--sm")} aria-hidden="true" />
        </a>
      )}
    </div>
  );

  const operatorList = () => {
    const statusLabel = { partenaire: 'Partenaire', partenaire_avec_services: 'Partenaire', intention: 'À venir' };
    const statusModifier = { partenaire: 'fr-badge--no-icon', partenaire_avec_services: 'fr-badge--no-icon', intention: 'fr-badge--no-icon' };
    const statusStyle = {
      partenaire:            { background: '#DFFEED', color: '#0A6C62' },
      partenaire_avec_services: { background: '#DFFEED', color: '#0A6C62' },
      intention:             { background: 'var(--yellow-tournesol-950-100)', color: 'var(--yellow-tournesol-sun-407-moon-922)' },
    };

    const byName = (a, b) => a.name.localeCompare(b.name, 'fr');
    const sortedOperators = [
      ...operators.filter(op => op.status === 'partenaire' || op.status === 'partenaire_avec_services').sort(byName),
      ...operators.filter(op => op.status === 'intention').sort(byName),
      ...operators.filter(op => op.status && op.status !== 'partenaire' && op.status !== 'partenaire_avec_services' && op.status !== 'intention').sort(byName),
    ];

    return (
      <div className={styles.serviceList}>
        {sortedOperators.map((op) => {
          const isExpanded = expandedOperatorId === op.id;
          const depts = op.departments || [];
          const singleDept = depts.length === 1 ? depts[0] : null;
          return (
            <div key={op.id} className={`${styles.serviceAccordion} ${isExpanded ? styles.serviceAccordionSelected : ''}`}>
              <button
                className={styles.serviceHeader}
                onClick={() => setExpandedOperatorId(isExpanded ? null : op.id)}
                aria-expanded={isExpanded}
              >
                <div className={styles.serviceHeaderLeft}>
                  <span className={styles.operatorName}>{op.name}</span>
                  {op.status && (
                    <span className={fr.cx("fr-badge", "fr-badge--sm", "fr-badge--no-icon", statusModifier[op.status] || "fr-badge--success")} style={{ textTransform: 'none', ...(statusStyle[op.status] || {}) }}>
                      {statusLabel[op.status] || op.status}
                    </span>
                  )}
                  {(op.services || []).some(s => s.type === 'proconnect') && (
                    <span className={fr.cx("fr-badge", "fr-badge--sm", "fr-badge--no-icon")} style={{ textTransform: 'none', background: '#e8edff', color: '#3558a2' }}>
                      ProConnect
                    </span>
                  )}
                </div>
                <span className={fr.cx(isExpanded ? "fr-icon-arrow-up-s-line" : "fr-icon-arrow-down-s-line")} aria-hidden="true"></span>
              </button>
              {isExpanded && (
                <div className={styles.operatorDetails}>
                  {depts.length > 0 && (
                    <p className={styles.operatorDepts}>
                      {depts.map((d) => `${DEPT_NAMES[d] || 'Département'} (${d})`).join(' · ')}
                    </p>
                  )}
                  {op.status === 'partenaire_avec_services' && (op.services || []).length > 0 && (
                    <div className={styles.operatorServices}>
                      {(op.services || []).map((s) => (
                        <span key={s.id} className={styles.operatorServiceItem}>
                          {s.logo_url && <img src={s.logo_url} alt={s.name} className={styles.operatorServiceIcon} />}
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={styles.operatorActions}>
                    {/* <button className={fr.cx("fr-btn fr-btn--sm")}>Contacter</button> */}
                    {op.website && (
                      <a href={op.website} className={fr.cx("fr-btn fr-btn--sm fr-btn--primary")} target="_blank" rel="noopener noreferrer">
                        Voir l'offre de service
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

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

      {header()}

      {activeTab !== 'partenaires' && filters()}

      {mapState.currentLevel !== "country" && !isMobile && breadcrumbs()}

      {(panelState === 'open' || panelState === 'partial') && (
        <div className={styles.levelHeader}>
          <div className={styles.levelHeaderTop}>
            <h3 className={styles.areaTitle}>{currentPageLabel || "France"}</h3>
            <div className={styles.headerActions}>
              <MapButton
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                }}
                aria-label="Copier l'URL de cette vue"
                tooltip={linkCopied ? "URL copiée" : "Copier l'URL de cette vue"}
                customStyle={{ width: '32px', height: '32px', padding: '6px' }}
              >
                {linkCopied ? (
                  <span aria-hidden="true" className={fr.cx("fr-icon-check-line", "fr-icon--sm")}></span>
                ) : (
                  <span className={fr.cx("fr-icon-links-line", "fr-icon--sm")} aria-hidden="true"></span>
                )}
              </MapButton>
            </div>
          </div>
          {activeTab === 'partenaires' && (
            <p className={styles.operatorCount}>
              {operators.length} opérateur{operators.length > 1 ? 's' : ''} partenaire{operators.length > 1 ? 's' : ''}
            </p>
          )}
          {activeTab !== 'partenaires' && ['region', 'department', 'epci'].includes(mapState.currentLevel) && (
            <div style={{ marginTop: '0.5rem', fontSize: '14px' }}>
              <ToggleSwitch
                label="Voir les services utilisés par ce territoire"
                checked={showTerritoireServices}
                onChange={setShowTerritoireServices}
                inputTitle="Voir les services utilisés par ce territoire"
                showCheckedHint={false}
                labelPosition="left"
              />
            </div>
          )}
        </div>
      )}

      {panelState === 'open' && (
        <div>
          {activeTab === 'partenaires' && operatorList()}
          {activeTab !== 'partenaires' && mapState.currentLevel !== 'city' && !showTerritoireServices && serviceList()}
          {activeTab !== 'partenaires' && mapState.currentLevel !== 'city' && showTerritoireServices && areaOrgServices()}
          {activeTab !== 'partenaires' && mapState.currentLevel === 'city' && communeInfo()}
        </div>
      )}

    </div>
  );
};

SidePanelContent.propTypes = {
  container: PropTypes.object,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
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
