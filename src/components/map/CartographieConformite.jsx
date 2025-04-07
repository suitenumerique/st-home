import * as d3 from "d3";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import * as turf from "@turf/turf";

import parentAreas from "../../../public/parent_areas.json";
import CommuneSearch from "../CommuneSearch";
import AreaDisplay from "./AreaDisplay";
function MapViewHandler({ bounds }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.isValid) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 13,
      });
    }
  }, [bounds, map]);

  return null;
}

export default function CartographieConformite() {
  const [stats, setStats] = useState({});
  const [currentLevel, setCurrentLevel] = useState("country");
  const [selectedAreas, setSelectedAreas] = useState({});
  const [departmentView, setDepartmentView] = useState("city");
  const [layerBounds, setLayerBounds] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [communityToSelect, setCommunityToSelect] = useState(null);
  const [cityToSelect, setCityToSelect] = useState(null);

  // const [dataIsLoaded, setDataIsLoaded] = useState(false);
  // const [periods, setPeriods] = useState([]);
  // const [period, setPeriod] = useState('last');

  const mapConfig = {
    defaultViewCoords: [46.603354, 1.888334],
    defaultZoom: 6,
    tileLayer: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap contributors",
    minZoom: 4,
    maxZoom: 18,
    zoomSnap: 0.25,
    zoomControl: true,
    markerZoomAnimation: false,
  };

  const colorsConfig = {
    domain: [0, 1, 2],
    range: ["#ef4444", "#eab308", "#22c55e"], // removed #f97316
    defaultColor: "#000000",
  };

  const colorScale = d3
    .scaleLinear()
    .domain(colorsConfig.domain)
    .range(colorsConfig.range);

  const nextLevel = useMemo(() => {
    if (currentLevel === "department" && departmentView === "epci") {
      return "epci";
    }
    const levelTransitions = {
      country: "region",
      region: "department",
      department: null,
    };
    return levelTransitions[currentLevel] || null;
  }, [currentLevel, departmentView]);

  // DATA LOADING
  const loadStats = async (level) => {
    const scope = {
      region: 'reg',
      department: 'dep',
      epci: 'epci',
    }
    const response = await fetch(`/api/rcpnt/stats?scope=${scope[level]}&refs=1.a,2.a,a`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    });
    const data = await response.json();
    return data;
  }

  const loadAllStats = async () => {
    const regionStats = await loadStats('region');
    const departmentStats = await loadStats('department');
    const epciStats = await loadStats('epci');
    const countryStats = { '00': ['1.a', '2.a', 'a'].map(ref => {
      return {
        ref,
        valid: Object.values(regionStats).reduce((acc, stat) => acc + stat.find(s => s.ref === ref).valid, 0),
        total: Object.values(regionStats).reduce((acc, stat) => acc + stat.find(s => s.ref === ref).total, 0),
      }
    })}
    setStats({ region: regionStats, department: departmentStats, epci: epciStats, country: countryStats });
  }

  const loadDepartmentCities = async (departmentCode) => {
    const response = await fetch(`/api/rcpnt/stats?scope=list-commune&dep=${departmentCode}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    });
    const data = await response.json();
    return data;
  };

  const fetchGeoJSON = async (level, code) => {
    let filePath = "";
    if (level === "country") {
      filePath = "france.json";
    } else if (level === "region") {
      filePath = `departements_par_region/${code.replace("r", "")}.json`;
    } else if (level === "department") {
      filePath = `communes_par_departement/${code}.json`;
    }
    const response = await fetch(`/geojson/${filePath}`);
    const geoJSON = await response.json();
    return geoJSON;
  };

  // PROCESSING
  const computeSelectedArea = async (level, code) => {
    console.log('computeSelectedArea', level, code)
    let selectedArea;
    if (level === "country") {
      selectedArea = { insee_geo: "00", name: "France" };
    } else {
      selectedArea = parentAreas.find((area) => area.insee_geo === code);
    }
    selectedArea.conformityStats = computeConformityStats(level, code)
    let childrenAreas;
    if (level === "department") {
      childrenAreas = await loadDepartmentCities(code);
      selectedArea.childrenAreas = childrenAreas;
    } else {
      childrenAreas = {
        country: parentAreas.filter((area) => area.type === "region"),
        region: parentAreas.filter(
          (area) =>
            area.type === "department" && area.insee_reg === code,
        ),
      }[level];
    }
    if (level !== 'epci') {
      const geoJSON = await fetchGeoJSON(level, code);
      const processedGeoJSON = processGeoJSON(level, geoJSON, childrenAreas);
      selectedArea.geoJSON = processedGeoJSON;
      if (level === 'department') {
        selectedArea.geoJSONEPCI = processGeoJSONEPCI(processedGeoJSON)
      }
    }
    return selectedArea;
  };

  const processGeoJSON = (level, geoJSON, childrenAreas) => {
    const features = geoJSON.features.map((feature) => {
      const record = childrenAreas.find(
        (r) => r.insee_geo === feature.properties.CODE,
      );
      if (!record) return feature;

      let score;
      try {
        if (level === 'department') {
          score = ['1.a', '2.a'].reduce((acc, ref) => {
            return acc + (record.rcpnt.indexOf(ref) > -1 ? 1 : 0)
          }, 0)
        } else {
          const downLevel = {
            country: 'region',
            region: 'department'
          }
          const stat = stats[downLevel[level]][feature.properties.CODE.replace(/^r/,"")]
          const stat_a = stat.find(s => s.ref === 'a')
          const stat_1a = stat.find(s => s.ref === '1.a')
          const stat_2a = stat.find(s => s.ref === '2.a')
          const n_score_2 = stat_a.valid
          const n_score_1 = stat_1a.valid - stat_a.valid + stat_2a.valid - stat_a.valid
          score = (n_score_2 * 2 + n_score_1 * 1) / stat_a.total
        }
      } catch (err) {
        console.log('no score', err)
      }

      return {
        ...feature,
        properties: {
          NAME: feature.properties.NOM,
          TYPE: record.type,
          INSEE_GEO: feature.properties.CODE,
          INSEE_REG: record.insee_reg,
          INSEE_DEP: record.insee_dep,
          EPCI_SIREN: record.epci_siren,
          SCORE: score,
        },
      };
    });

    return {
      ...geoJSON,
      features,
    };
  };

  const processGeoJSONEPCI = (geoJSON) => {
    const features = geoJSON.features.map(f => JSON.parse(JSON.stringify(f)));
    const groupedFeatures = d3.group(features, d => d.properties.EPCI_SIREN);
    const processedGeoJSONFeatures = Array.from(groupedFeatures, ([epciSiren, features]) => {
      let merged;
      if (features.length === 1) {
        merged = features[0];
      } else {
        merged = turf.union(turf.featureCollection(features), {}, {
          id: epciSiren
        })
      }
      const record = parentAreas.find(r => r.insee_geo === epciSiren)

      const computeScore = (record) => {
        try {
          const stat = stats['epci'][record.insee_geo]
          const stat_a = stat.find(s => s.ref === 'a')
          const stat_1a = stat.find(s => s.ref === '1.a')
          const stat_2a = stat.find(s => s.ref === '2.a')
          const n_score_2 = stat_a.valid
          const n_score_1 = stat_1a.valid - stat_a.valid + stat_2a.valid - stat_a.valid
          return (n_score_2 * 2 + n_score_1 * 1) / stat_a.total
        } catch (err) {
          return null
        }
      }

      merged.properties = {
        NAME: record ? record.name : 'EPCI inconnue',
        TYPE: 'epci',
        INSEE_GEO: record ? record.insee_geo : 'EPCI inconnue',
        INSEE_REG: record ? record.insee_reg : 'EPCI inconnue',
        INSEE_DEP: record ? record.insee_dep : 'EPCI inconnue',
        SCORE: record ? computeScore(record) : null,
      }
      return merged
    });
    return processedGeoJSONFeatures
  }

  const computeConformityStats = (level, code) => {
    const stat = stats[level][code.replace(/^r/,"")]
    const stat_a = stat.find(s => s.ref === 'a')
    const stat_1a = stat.find(s => s.ref === '1.a')
    const stat_2a = stat.find(s => s.ref === '2.a')
    const n_cities = stat['2'].total
    const n_score_2 = stat_a.valid
    const n_score_1 = stat_1a.valid - stat_a.valid + stat_2a.valid - stat_a.valid
    const score = (n_score_2 * 2 + n_score_1 * 1) / stat_a.total
    return {
      n_cities: n_cities,
      score: score,
      details: {
        '0': n_cities - n_score_2 - n_score_1,
        '1': n_score_1,
        '2': n_score_2,
      }
    }
  }

  // INTERACTIONS
  const selectLevel = async (level, code) => {
    console.log('selectLevel', level, code)
    setCurrentLevel(level);

    const levels = ['country', 'region', 'department', 'epci']
    const newSelectedAreas = levels.reduce((acc, lev) => {
      if (levels.indexOf(lev) < levels.indexOf(level)) {
        acc[lev] = selectedAreas[lev]
      }
      return acc
    }, {})

    if (
      (level === "department" && !newSelectedAreas["region"]) ||
      (level === "epci" && !newSelectedAreas["department"])
    ) {
      const selectedAreaData = parentAreas.find((area) => area.insee_geo === code);
      const parentLevel = level === "department" ? "region" : "department";
      const parentCode = level === "department" ? selectedAreaData.insee_reg : selectedAreaData.insee_dep;
      newSelectedAreas[parentLevel] = await computeSelectedArea(parentLevel, parentCode);
    }
    if (!newSelectedAreas[level]) {
      newSelectedAreas[level] = await computeSelectedArea(level, code);
    }
    setSelectedAreas(newSelectedAreas)
  };

  const handleAreaClick = async (properties) => {
    if (
      (currentLevel === "department" && departmentView === "city") ||
      currentLevel === "epci"
    ) {
      const cityProperties = selectedAreas['department'].childrenAreas.find(
        (feature) => feature.insee_geo === properties.INSEE_GEO,
      );
      setSelectedCity(cityProperties);
      return;
    }
    await selectLevel(nextLevel, properties.INSEE_GEO);
  };

  const getBackLevel = async (level) => {
    await selectLevel(level, selectedAreas[level].insee_geo);
  };

  const handleQuickNav = async (community) => {
    if (community.type === "epci") {
      setDepartmentView("epci");
    } else {
      setDepartmentView("city");
    }
    setSelectedAreas({
      country: selectedAreas.country,
    });
    const level = community.type === 'commune' ? 'department' : community.type;
    let code;
    if (community.type === 'epci') {
      code = community['siret'].slice(0, 9)
    } else if (community.type === 'commune') {
      code = community['insee_dep']
    } else {
      code = community['insee_geo']
    }
    const cityToSelect = community.type === 'commune' ? { insee_geo: community.insee_geo } : null
    setCommunityToSelect({ level, code, cityToSelect })
  };

  // RENDERING
  const getColor = (score) => {
    return score === null || score === undefined ? colorsConfig.defaultColor : colorScale(score);
  };

  const geoJSONStyle = (feature) => {
    const isSelected = selectedCity?.insee_geo === feature.properties.INSEE_GEO;
    return {
      fillColor: getColor(feature.properties.SCORE),
      weight: isSelected ? 3 : 2,
      opacity: 1,
      color: isSelected ? "#1E293B" : "#FFFFFF",
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature, layer) => {
    const tooltipContent = `
      <div style={{ backgroundColor: "white", padding: "0.5rem" }}>
        <p style={{ fontWeight: "bold", fontSize: "1.2rem", color: "#1E293B" }}>${feature.properties.NAME}</p>
        ${
          currentLevel === "department" && departmentView === "city"
            ? "<p style={{ fontSize: '0.8rem', color: '#64748B' }}>Cliquez pour afficher les détails</p>"
            : ""
        }
      </div>
    `;

    layer.bindTooltip(tooltipContent, { permanent: false });

    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        const currentColor = e.target.options.fillColor;
        layer.setStyle({
          weight: 3,
          color: currentColor,
          opacity: 0.9,
        });
        layer.bringToFront();
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(geoJSONStyle(feature));
      },
      click: () => {
        handleAreaClick(feature.properties);
      },
    });
  };

  const currentGeoJSON = useMemo(() => {
    if (!selectedAreas[currentLevel]) return null;
    let displayedGeoJSON;
    if (currentLevel === "department" && departmentView === "epci") {
      displayedGeoJSON = selectedAreas[currentLevel].geoJSONEPCI;
    } else if (currentLevel === "epci" && selectedAreas["department"]?.geoJSON) {
      displayedGeoJSON = { ...selectedAreas["department"].geoJSON };
      displayedGeoJSON.features = displayedGeoJSON.features.filter(
        (feature) =>
          feature.properties.EPCI_SIREN ===
          selectedAreas[currentLevel].insee_geo,
      );
    } else {
      displayedGeoJSON = selectedAreas[currentLevel].geoJSON;
    }
    return displayedGeoJSON;
  }, [selectedAreas, currentLevel, departmentView]);

  const onGeoJSONAdd = (e) => {
    try {
      if (currentLevel === "country") {
        const bounds = L.latLngBounds([
          [41.3, -5.2],
          [51.1, 9.5],
        ]);
        setLayerBounds(bounds);
      } else {
        const bounds = e.target.getBounds();
        setLayerBounds(bounds);
      }
    } catch (err) {
      console.error("Error getting bounds:", err);
    }
  };

  // USE EFFECTS
  useEffect(() => {
    if (cityToSelect) {
      const cityProperties = selectedAreas['department'].childrenAreas.find(
        (feature) => feature.insee_geo === cityToSelect.insee_geo,
      );
      setSelectedCity(cityProperties);
      setCityToSelect(null)
    }
  }, [cityToSelect])

  useEffect(() => {
    const selectCity = async () => {
      if (communityToSelect) {
        await selectLevel(communityToSelect.level, communityToSelect.code)
        setCityToSelect(communityToSelect.cityToSelect)
        setCommunityToSelect(null)
      }
    }
    selectCity();
  }, [communityToSelect, selectedAreas])

  useEffect(() => {
    setSelectedCity(null)
  }, [departmentView])

  useEffect(() => {
    if (Object.keys(stats).length > 0) {
      selectLevel("country", "00");
    }
  }, [stats]);

  useEffect(() => {
    loadAllStats();
  }, []);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          pointerEvents: "none",
          top: 20,
          bottom: 20,
          left: 20,
          transformOrigin: "bottom left",
        }}
      >
        <div
          style={{
            height: "100%",
            overflow: "auto",
            width: "350px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100%",
              justifyContent: "flex-end",
            }}
          >
            <AreaDisplay
              selectedAreas={selectedAreas}
              selectedCity={selectedCity}
              currentLevel={currentLevel}
              departmentView={departmentView}
              setDepartmentView={setDepartmentView}
              periods={[
                { value: "current", label: "Actuel" },
                { value: "previous", label: "Précédent" },
              ]}
              getBackLevel={getBackLevel}
              getColor={getColor}
              // period={period}
              // setPeriod={setPeriod}
              // dataIsLoaded={true}
              // showInfo={showInfo}
              // setShowInfo={setShowInfo}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          pointerEvents: "none",
          top: 20,
          right: 20,
          transformOrigin: "top right",
        }}
      >
        <div
          style={{
            height: "calc(100vh-2rem)",
            overflow: "auto",
            width: "300px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100%",
              justifyContent: "flex-start",
            }}
          >
            <div style={{ pointerEvents: "auto" }}>
              <CommuneSearch
                onSelect={handleQuickNav}
                placeholder="Région, département, EPCI ou commune"
              />
            </div>
          </div>
        </div>
      </div>

      <MapContainer
        center={mapConfig.defaultViewCoords}
        zoom={mapConfig.defaultZoom}
        style={{ height: "100%", width: "100%" }}
        zoomSnap={mapConfig.zoomSnap}
        minZoom={mapConfig.minZoom}
        maxZoom={mapConfig.maxZoom}
      >
        <TileLayer
          url={mapConfig.tileLayer}
          attribution={mapConfig.attribution}
        />

        {currentGeoJSON && (
          <GeoJSON
            key={`geojson-${Object.keys(selectedAreas).map(key => `${key}-${selectedAreas[key]?.insee_geo || ''}`).join('-')}-${departmentView}`}
            data={currentGeoJSON}
            style={geoJSONStyle}
            onEachFeature={onEachFeature}
            eventHandlers={{
              add: onGeoJSONAdd,
            }}
          />
        )}

        <MapViewHandler bounds={layerBounds} />
      </MapContainer>
    </div>
  );
}
