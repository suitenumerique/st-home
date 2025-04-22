import * as d3 from "d3";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [mapState, setMapState] = useState({
    currentLevel: "country",
    selectedAreas: {},
    departmentView: "city",
    selectedCity: null,
  });
  const [layerBounds, setLayerBounds] = useState(null);
  const selectedLayerRef = useRef(null);

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
    defaultColor: "#e2e8f0",
  };

  const colorScale = d3
    .scaleLinear()
    .domain(colorsConfig.domain)
    .range(colorsConfig.range);

  const nextLevel = useMemo(() => {
    if (mapState.currentLevel === "department") {
      return mapState.departmentView === "epci" ? "epci" : 'city'
    }
    const levelTransitions = {
      country: "region",
      region: "department",
      epci: "city",
    };
    return levelTransitions[mapState.currentLevel] || null;
  }, [mapState.currentLevel, mapState.departmentView]);

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
  const computeSelectedArea = async (level, code, withGeoJSON = false) => {
    console.log('computeSelectedArea', level, code)
    let selectedArea;
    if (level === "country") {
      selectedArea = { insee_geo: "00", name: "France" };
    } else {
      selectedArea = parentAreas.find((area) => area.insee_geo === code);
    }
    if (withGeoJSON) {
      selectedArea.conformityStats = computeAreaStats(level, { insee_geo: code })
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
    }
    return selectedArea;
  };

  const computeAreaStats = (level, record) => {
    if (level === 'city') {
      return {
        score: ['1.a', '2.a'].reduce((acc, ref) => {
          return acc + (record.rcpnt.indexOf(ref) > -1 ? 1 : 0)
        }, 0)
      }
    } else {
      const stat = stats[level][record.insee_geo.replace('r', '')]
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
  }

  const processGeoJSON = (level, geoJSON, childrenAreas) => {
    const features = geoJSON.features.map((feature) => {
      const record = childrenAreas.find(
        (r) => r.insee_geo === feature.properties.CODE,
      );
      if (!record) return feature;
      const scoreLevel = {
        'country': 'region',
        'region': 'department',
        'department': 'city',
      }[level]
      const score = computeAreaStats(scoreLevel, record).score
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

      merged.properties = {
        NAME: record ? record.name : 'EPCI inconnue',
        TYPE: 'epci',
        INSEE_GEO: record ? record.insee_geo : 'EPCI inconnue',
        INSEE_REG: record ? record.insee_reg : 'EPCI inconnue',
        INSEE_DEP: record ? record.insee_dep : 'EPCI inconnue',
        SCORE: record ? computeAreaStats('epci', record).score : null,
      }
      return merged
    });
    return processedGeoJSONFeatures
  }

  // INTERACTIONS
  const selectLevel = async (level, code, source = 'areaClick') => {
    console.log('selectLevel', level, code, source)

    const allLevels = ['epci', 'department', 'region', 'country']
    const parentLevels = allLevels.slice(allLevels.indexOf(level) + 1)

    let newSelectedAreas;
    if (source === 'quickNav') {
      newSelectedAreas = { country: mapState.selectedAreas.country }
    } else if (source == 'backClick') {
      newSelectedAreas = parentLevels.reduce((acc, lev) => {
        acc[lev] = mapState.selectedAreas[lev]
        return acc
      }, {})
    } else {
      newSelectedAreas = { ...mapState.selectedAreas }
    }

    if (source === 'quickNav') {
      for (const parentLevel of parentLevels) {
        if (parentLevel === 'epci' || parentLevel === 'country') {
          continue
        }
        let parentCode;
        if (!newSelectedAreas[parentLevel]) {
          if (parentLevel === 'department') {
            if (level === 'epci') {
              parentCode = parentAreas.find(p => p.insee_geo === code).insee_dep
            } else if (level === 'city') {
              if (code.slice(0, 2) === '97') {
                parentCode = code.slice(0, 3)
              } else {
                parentCode = code.slice(0, 2)
              }
            }
          } else {
            parentCode = newSelectedAreas['department'].insee_reg
          }
          const withGeoJSON = parentLevel === 'department'
          newSelectedAreas[parentLevel] = await computeSelectedArea(parentLevel, parentCode, withGeoJSON)
        }
      }
    }

    if (level !== "city") {
      newSelectedAreas[level] = await computeSelectedArea(level, code, true);
    }

    const newMapState = {
      selectedAreas: newSelectedAreas
    }

    if (level === "city") {
      const selectedCity = newSelectedAreas["department"].childrenAreas.find(c => c.insee_geo === code)
      newMapState.selectedCity = selectedCity
    }

    newMapState.departmentView = newSelectedAreas["epci"] ? "epci" : "city"
    if (level === "city") {
      newMapState.currentLevel = newSelectedAreas["epci"] ? "epci" : "department"
    } else {
      newMapState.currentLevel = level
    }

    newMapState.updateBounds = source !== 'areaClick' || level !== 'city'

    setMapState(newMapState)
  };

  const handleAreaClick = async (properties) => {
    await selectLevel(nextLevel, properties.INSEE_GEO, 'areaClick');
  };

  const getBackLevel = async (level) => {
    await selectLevel(level, mapState.selectedAreas[level].insee_geo, 'backClick');
  };

  const handleQuickNav = async (community) => {
    const level = community.type === 'commune' ? 'city' : community.type;
    let code;
    if (community.type === 'epci') {
      code = community['siret'].slice(0, 9)
    } else {
      code = community['insee_geo']
    }
    await selectLevel(level, code, 'quickNav')
  };

  // RENDERING
  const getColor = (score) => {
    return score === null || score === undefined ? colorsConfig.defaultColor : colorScale(score);
  };

  const geoJSONStyle = (feature) => {
    const isSelected = mapState.selectedCity?.insee_geo === feature.properties.INSEE_GEO;
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
      <div style="backgroundColor: white; padding: 0.5rem">
        <p style="font-weight: bold; font-size: 1rem; color: #1E293B; margin-bottom: 0">${feature.properties.NAME}</p>
        ${
          mapState.currentLevel === "department" && mapState.departmentView === "city"
            ? "<p style='font-size: 0.8rem; color: #64748B; margin-bottom: 0'>Cliquez pour afficher les détails</p>"
            : ""
        }
      </div>
    `;

    layer.bindTooltip(tooltipContent, { permanent: false });

    if (mapState.selectedCity?.insee_geo === feature.properties.INSEE_GEO) {
      selectedLayerRef.current = layer;
    }

    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        const currentColor = e.target.options.fillColor;
        layer.setStyle({
          weight: 3,
          color: currentColor,
          opacity: 0.9,
        });
        layer.bringToFront()
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(geoJSONStyle(feature));
        if (mapState.selectedCity?.insee_geo !== feature.properties.INSEE_GEO) {
          layer.bringToBack()
        }
      },
      click: () => {
        handleAreaClick(feature.properties);
      },
    });
  };

  const currentGeoJSON = useMemo(() => {
    if (!mapState.selectedAreas[mapState.currentLevel]) return null;
    let displayedGeoJSON;
    if (mapState.currentLevel === "department" && mapState.departmentView === "epci") {
      displayedGeoJSON = mapState.selectedAreas[mapState.currentLevel].geoJSONEPCI;
    } else if (mapState.currentLevel === "epci" && mapState.selectedAreas["department"]?.geoJSON) {
      displayedGeoJSON = { ...mapState.selectedAreas["department"].geoJSON };
      displayedGeoJSON.features = displayedGeoJSON.features.filter(
        (feature) =>
          feature.properties.EPCI_SIREN ===
          mapState.selectedAreas[mapState.currentLevel].insee_geo,
      );
    } else {
      displayedGeoJSON = mapState.selectedAreas[mapState.currentLevel].geoJSON;
    }
    return displayedGeoJSON;
  }, [mapState]);

  const onGeoJSONAdd = (e) => {
    try {
      if (!mapState.updateBounds) {
        return
      }
      if (mapState.currentLevel === "country") {
        const bounds = L.latLngBounds([
          [41.3, -5.2],
          [51.1, 9.5],
        ]);
        setLayerBounds(bounds);
      } else {
        const bounds = e.target.getBounds();
        setLayerBounds(bounds);
      }
      setTimeout(() => {
        if (selectedLayerRef.current && mapState.selectedCity) {
          selectedLayerRef.current.bringToFront();
        }
      }, 0);
    } catch (err) {
      console.error("Error getting bounds:", err);
    }
  };

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
              mapState={mapState}
              setMapState={setMapState}
              getBackLevel={getBackLevel}
              getColor={getColor}
              // periods={[
              //   { value: "current", label: "Actuel" },
              //   { value: "previous", label: "Précédent" },
              // ]}
              // period={period}
              // setPeriod={setPeriod}
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
            width: "330px",
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
                placeholder="Rechercher une commune ou EPCI"
                smallButton={true}
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
          key={`geojson-${Object.keys(mapState.selectedAreas).map(key => `${key}-${mapState.selectedAreas[key]?.insee_geo || ''}`).join('-')}-${mapState.departmentView}-${mapState.selectedCity?.insee_geo || 'none'}`}
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
