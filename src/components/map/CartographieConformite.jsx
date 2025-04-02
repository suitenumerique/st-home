import * as d3 from "d3";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";

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
  const [currentLevel, setCurrentLevel] = useState("country");
  const [selectedAreas, setSelectedAreas] = useState({});
  const [departmentView, setDepartmentView] = useState("city");
  const [layerBounds, setLayerBounds] = useState(null);

  // const [dataIsLoaded, setDataIsLoaded] = useState(false);
  // const [periods, setPeriods] = useState([]);
  // const [period, setPeriod] = useState('last');
  // const [showInfo, setShowInfo] = useState(false);
  // const [selectedCommunity, setSelectedCommunity] = useState([]);

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
    domain: [0, 1, 2, 3],
    range: ["#ef4444", "#f97316", "#eab308", "#22c55e"],
    defaultColor: "#64748b",
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
  const loadDepartmentCities = async (departmentCode) => {
    try {
      const baseUrl =
        "https://suite-territoriale-home-staging.osc-secnum-fr1.scalingo.io/api/rcpnt/stats";
      const response = await fetch(
        `${baseUrl}?scope=commune&dep=${departmentCode}`,
      );
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Failed to load children:", err);
      throw err;
    }
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
  const setSelectedArea = async (level, code) => {
    let selectedArea;
    if (level === "country") {
      selectedArea = { name: "France" };
    } else {
      selectedArea = parentAreas.find((area) => area.insee_geo === code);
    }
    if (!selectedArea.geoJSON) {
      let childrenAreas;
      if (level === "department") {
        childrenAreas = await loadDepartmentCities(code);
        selectedArea.childrenAreas = childrenAreas;
      } else {
        childrenAreas = {
          country: parentAreas.filter((area) => area.typology === "Région"),
          region: parentAreas.filter(
            (area) =>
              area.typology === "Département" && area.insee_region === code,
          ),
        }[level];
      }
      const geoJSON = await fetchGeoJSON(level, code);
      const processedGeoJSON = processGeoJSON(geoJSON, childrenAreas);
      selectedArea.geoJSON = processedGeoJSON;
      // if (level === 'department') {
      //   selectedArea.geoJSONEPCI = processGeoJSONEPCI(processedGeoJSON)
      // }
    }
    if (typeof selectedArea.Communes_par_score === "string") {
      selectedArea.Communes_par_score = JSON.parse(
        selectedArea.Communes_par_score,
      );
    }
    setSelectedAreas({
      ...selectedAreas,
      [level]: selectedArea,
    });
  };

  const processGeoJSON = (geoJSON, childrenAreas) => {
    const features = geoJSON.features.map((feature) => {
      const record = childrenAreas.find(
        (r) => r.insee_geo === feature.properties.CODE,
      );
      if (!record) return feature;

      const score = Math.random() * 3;

      // const score = record.Typologie === 'Commune'
      //   ? JSON.parse(record.Score)
      //   : JSON.parse(record.Score_moyen);

      return {
        ...feature,
        properties: {
          INSEE_GEO: feature.properties.CODE,
          INSEE_REGION: record.Code_INSEE_region,
          INSEE_DEPARTMENT: record.Code_INSEE_departement,
          INSEE_EPCI: record.Code_INSEE_EPCI,
          NAME: feature.properties.NOM,
          SCORE: score,
          TYPOLOGY: record.typology,
          // COMPOSANTS_SCORE: JSON.parse(record.Composants_score || '{}'),
          // LIEN_ANNUAIRE_SERVICE_PUBLIC: record.Lien_Annuaire_Service_Public
        },
      };
    });

    return {
      ...geoJSON,
      features,
    };
  };

  // const processGeoJSONEPCI = (geoJSON) => {
  //   const features = geoJSON.features.map(f => JSON.parse(JSON.stringify(f)));
  //   const groupedFeatures = d3.group(features, d => d.properties.CODE_INSEE_EPCI);
  //   const processedGeoJSONFeatures = Array.from(groupedFeatures, ([epciCode, features]) => {
  //     let merged;
  //     if (features.length === 1) {
  //       merged = features[0];
  //     } else {
  //       merged = turf.union(turf.featureCollection(features), {}, {
  //         id: epciCode
  //       })
  //     }
  //     const record = parentAreas.find(r => r.Code_INSEE_geographique === epciCode)
  //     merged.properties = {
  //       LIBELLE: record ? record. : 'EPCI inconnue',
  //       CODE_INSEE_GEOGRAPHIQUE: record ? record.Code_INSEE_geographique : 'EPCI inconnue',
  //       CODE_INSEE_REGION: record ? record.Code_INSEE_region : 'EPCI inconnue',
  //       CODE_INSEE_DEPARTEMENT: record ? record.Code_INSEE_departement : 'EPCI inconnue',
  //       SCORE: record ? JSON.parse(record.Score_moyen) : {},
  //       TYPOLOGIE: record ? record.Typologie : 'EPCI inconnue',
  //     }
  //     return merged
  //   });
  //   return processedGeoJSONFeatures
  // }

  // INTERACTIONS
  const handleAreaClick = async (properties) => {
    if (
      (currentLevel === "department" && departmentView === "city") ||
      currentLevel === "epci"
    ) {
      selectCity(properties);
      return;
    }
    await selectLevel(nextLevel, properties.INSEE_GEO);
  };

  const selectLevel = async (level, code) => {
    console.log("selectLevel", level, code);
    setCurrentLevel(level);
    const selectedArea = parentAreas.find((area) => area.insee_geo === code);

    if (
      (level === "department" && !selectedAreas["region"]) ||
      (level === "epci" && !selectedAreas["department"])
    ) {
      const parentLevel = level === "department" ? "region" : "department";
      const parentCode =
        level === "department"
          ? selectedArea.insee_region
          : selectedArea.insee_departement;
      await setSelectedArea(parentLevel, parentCode);
    }

    if (!selectedAreas[level]) {
      await setSelectedArea(level, code);
    }
  };

  const getBackLevel = async (level) => {
    setCurrentLevel(level);
    if (level === "country") {
      setSelectedAreas({
        country: selectedAreas.country,
      });
    } else if (level === "region") {
      setSelectedAreas({
        ...selectedAreas,
        department: null,
        city: null,
      });
    } else if (level === "department") {
      setSelectedAreas({
        ...selectedAreas,
        epci: null,
      });
    }
  };

  const selectCity = (properties) => {
    setSelectedAreas({
      ...selectedAreas,
      city: {
        insee_geo: properties.INSEE_GEO,
        // Composants_score: properties.COMPOSANTS_SCORE || '{}',
        score: properties.SCORE,
        name: properties.NAME,
        // Lien_Annuaire_Service_Public: properties.LIEN_ANNUAIRE_SERVICE_PUBLIC
      },
    });
  };

  const handleQuickNav = async (community) => {
    setTimeout(() => {
      if (community.typology === "EPCI à fiscalité propre") {
        setDepartmentView("epci");
      } else {
        setDepartmentView("city");
      }
    }, 300);
    const level = {
      Région: "region",
      Département: "department",
      Commune: "department",
      "EPCI à fiscalité propre": "epci",
    }[community.typology];
    const codeKey = {
      Région: "Code_INSEE_geographique",
      Département: "Code_INSEE_geographique",
      "EPCI à fiscalité propre": "Code_INSEE_geographique",
      Commune: "Code_INSEE_departement",
    }[community.typology];
    setSelectedAreas({
      country: selectedAreas.country,
    });
    await selectLevel(level, community[codeKey]);

    if (community.typology === "Commune") {
      const cityProperties = selectedAreas["department"].geoJSON.features.find(
        (feature) => feature.properties.INSEE_GEO === community.insee_geo,
      ).properties;
      selectCity(cityProperties);
    }
  };

  // RENDERING
  const getColor = (score) => {
    return score === null ? colorsConfig.defaultColor : colorScale(score);
  };

  const geoJSONStyle = () => {
    // const geoJSONStyle = (_feature) => {
    const isSelected = false;
    // const isSelected = selectedAreas?.city?.Code_INSEE_geographique === feature.properties.CODE_INSEE_GEOGRAPHIQUE;
    // const score = getValueForPeriod(properties.SCORE, period.value)
    const score = Math.random() * 3;

    return {
      fillColor: getColor(score),
      weight: isSelected ? 3 : 2,
      opacity: 1,
      color: isSelected ? "#1E293B" : "#FFFFFF",
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature, layer) => {
    const tooltipContent = `
      <div class="bg-white p-2">
        <p class="font-bold text-base text-slate-800">${feature.properties.NAME}</p>
        ${
          currentLevel === "department" && departmentView === "city"
            ? "<p>Cliquez pour afficher les détails</p>"
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
    } else if (currentLevel === "epci") {
      displayedGeoJSON = { ...selectedAreas["department"].geoJSON };
      displayedGeoJSON.features = displayedGeoJSON.features.filter(
        (feature) =>
          feature.properties.INSEE_EPCI ===
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

  // PERIODS
  const getValueForPeriod = () => {
    // const getValueForPeriod = (_data, _period) => {
    return Math.random() * 3;
    // let periodKey;
    // if (period === 'last' && Object.keys(data).indexOf('last') > -1) {
    //   periodKey = 'last'
    // } else if (period === 'last') {
    //   periodKey = Object.keys(data).pop()
    // } else {
    //   const closestPeriod = Object.keys(data).find(key => new Date(key) <= new Date(period));
    //   periodKey = closestPeriod;
    // }
    // return data[periodKey];
  };

  useEffect(() => {
    selectLevel("country", "00");
  }, []);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          pointerEvents: "none",
          bottom: 20,
          left: 20,
          transformOrigin: "bottom left",
        }}
      >
        <div
          style={{
            height: "calc(100vh-2rem)",
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
              currentLevel={currentLevel}
              // period={period}
              periods={[
                { value: "current", label: "Actuel" },
                { value: "previous", label: "Précédent" },
              ]}
              // setPeriod={setPeriod}
              getBackLevel={getBackLevel}
              getValueForPeriod={getValueForPeriod}
              getColor={getColor}
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
            width: "350px",
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
            key={`geojson-${currentLevel}-${JSON.stringify(Object.keys(selectedAreas))}`}
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
