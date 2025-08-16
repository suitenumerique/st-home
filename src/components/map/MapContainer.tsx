"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { bbox } from "@turf/bbox";
import * as turf from "@turf/turf";
import { MapLayerMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Map, { Layer, LayerProps, MapRef, Popup, ScaleControl, Source } from "react-map-gl/maplibre";
import CommuneSearch from "../CommuneSearch";
import mapStyle from "./map_style.json";
import MapButton from "./MapButton";
import { FeatureProperties, MapState } from "./types";

const MapContainer = ({
  currentGeoJSON,
  mapState,
  selectedGradient,
  isMobile,
  panelState,
  handleAreaClick,
  handleFullscreen,
  selectLevel,
  setSelectedGradient,
  goBack,
  handleQuickNav,
}: {
  currentGeoJSON: GeoJSON.FeatureCollection & { id: string };
  mapState: MapState;
  selectedGradient: string[];
  isMobile: boolean;
  panelState: "closed" | "open" | "partial";
  handleAreaClick: (event: MapLayerMouseEvent) => void;
  handleFullscreen: () => void;
  selectLevel: (
    level: "country" | "region" | "department" | "epci" | "city",
    code: string,
    source?: string,
  ) => void;
  setSelectedGradient: (gradient: string[]) => void;
  goBack: () => void;
  handleQuickNav: (commune: {
    siret: string;
    name: string;
    insee_geo?: string;
    zipcode?: string;
    type: "commune" | "epci";
    population: number;
  }) => void;
}) => {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number;
    latitude: number;
    properties: FeatureProperties;
  } | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<{ id: string; score: number } | null>(null);
  const [showGradientSelector, setShowGradientSelector] = useState(false);
  const [customGradient, setCustomGradient] = useState<string[]>(selectedGradient);
  const [isMapUpdating, setIsMapUpdating] = useState(false);
  const [searchOpen, setSearchOpen] = useState(true);

  const gradientPresets = [
    {
      colors: ["#D3ADFE", "#669BBD", "#009081"],
    },
    {
      colors: ["#FCC73B", "#E0812E", "#C03220"],
    },
    {
      colors: ["#FF6565", "#807A73", "#009081"],
    },
    {
      colors: ["#FCC73B", "#7EAB5E", "#009081"],
    },
    {
      colors: ["#FF6868", "#FFC579", "#009081"],
    },
  ];

  // Layer styles
  const fillLayerStyle = {
    id: "polygon-fill",
    type: "fill",
    paint: {
      "fill-color": ["get", "color"],
      "fill-opacity": 1,
    },
  };

  const strokeLayerStyle = {
    id: "polygon-stroke",
    type: "line",
    paint: {
      "line-color": "#ffffff",
      "line-width": 2,
    },
  };

  const hoveredFillLayerStyle = {
    id: "polygon-fill-hovered",
    type: "fill",
    filter: ["==", ["id"], hoveredFeature?.id],
    paint: {
      "fill-color": ["get", "color"],
      "fill-opacity": 1,
    },
  };

  const hoveredStrokeLayerStyle = {
    id: "polygon-stroke-hovered",
    type: "line",
    filter: ["==", ["id"], hoveredFeature?.id],
    paint: {
      "line-color": ["get", "color_dark"],
      "line-opacity": 1,
      "line-width": 2.5,
    },
  };

  const selectedCityLayerStyle = {
    id: "polygon-stroke-selected",
    type: "line",
    filter: ["==", ["get", "INSEE_GEO"], mapState.selectedAreas.city?.insee_geo],
    paint: {
      "line-color": ["get", "color_darker"],
      "line-opacity": 1,
      "line-width": 2.5,
    },
  };

  const onMouseLeave = useCallback(() => {
    if (hoveredFeature !== null && mapRef.current) {
      setHoveredFeature(null);
      setPopupInfo(null);
    }
  }, []);

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      if (isMapUpdating) {
        return;
      }
      handleAreaClick(event);
    },
    [isMapUpdating, handleAreaClick],
  );

  const onMouseMove = useCallback((event: MapLayerMouseEvent) => {
    if (event.features && event.features.length > 0) {
      if (mapRef.current) {
        setHoveredFeature({
          id: event.features[0].id as string,
          score: event.features[0].properties.SCORE as number,
        });
        const center = turf.center(event.features[0]);
        setPopupInfo({
          longitude: center.geometry.coordinates[0] as number,
          latitude: center.geometry.coordinates[1] as number,
          properties: event.features[0].properties as FeatureProperties,
        });
      }
    } else {
      setHoveredFeature(null);
      setPopupInfo(null);
    }
  }, []);

  const handleZoomIn = () => {
    const map = mapRef.current?.getMap();
    if (map) map.zoomIn();
  };

  const handleZoomOut = () => {
    const map = mapRef.current?.getMap();
    if (map) map.zoomOut();
  };

  const handleGradientClick = (event: React.MouseEvent) => {
    if (event.altKey) {
      event.preventDefault();
      setShowGradientSelector(true);
    }
  };

  const mapTooltip = (popupInfo: {
    longitude: number;
    latitude: number;
    properties: FeatureProperties;
  }) => {
    return (
      <Popup
        longitude={popupInfo.longitude}
        latitude={popupInfo.latitude}
        closeButton={false}
        closeOnClick={false}
        anchor="top"
        style={{ padding: 0, pointerEvents: "none" }}
      >
        <div className="map-tooltip-content">
          <p className="map-tooltip-title">{popupInfo.properties.NAME}</p>
          {((mapState.currentLevel === "department" && mapState.departmentView === "city") ||
            mapState.currentLevel === "epci") && (
            <p style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: "0" }}>
              Cliquez pour afficher les détails
            </p>
          )}
        </div>
      </Popup>
    );
  };

  const gradientSelector = () => {
    return (
      <div
        style={{
          position: "absolute",
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: "8px",
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          zIndex: 20,
          minWidth: "280px",
        }}
      >
        <h4 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>Sélecteur de gradient</h4>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "12px", display: "block", marginBottom: "6px" }}>
            Préréglages:
          </label>
          <div style={{ display: "flex", gap: "6px" }}>
            {gradientPresets.map((preset, index) => (
              <div
                key={index}
                style={{
                  width: "50px",
                  height: "20px",
                  background: `linear-gradient(90deg, ${preset.colors[0]} 0%, ${preset.colors[1]} 50%, ${preset.colors[2]} 100%)`,
                  borderRadius: "2px",
                  cursor: "pointer",
                  border: "2px solid #000091",
                }}
                title={`Préréglage ${index + 1}`}
                onClick={() => setSelectedGradient(preset.colors)}
              />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "12px", display: "block", marginBottom: "6px" }}>
            Sélecteur à trois couleurs:
          </label>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <input
              type="color"
              value={customGradient[0]}
              style={{
                width: "60px",
                height: "30px",
                border: "1px solid #ccc",
                borderRadius: "2px",
              }}
              onChange={(e) =>
                setCustomGradient([e.target.value, customGradient[1], customGradient[2]])
              }
            />
            <input
              type="color"
              value={customGradient[1]}
              style={{
                width: "60px",
                height: "30px",
                border: "1px solid #ccc",
                borderRadius: "2px",
              }}
              onChange={(e) =>
                setCustomGradient([customGradient[0], e.target.value, customGradient[2]])
              }
            />
            <input
              type="color"
              value={customGradient[2]}
              style={{
                width: "60px",
                height: "30px",
                border: "1px solid #ccc",
                borderRadius: "2px",
              }}
              onChange={(e) =>
                setCustomGradient([customGradient[0], customGradient[1], e.target.value])
              }
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setShowGradientSelector(false)}
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              border: "1px solid #ccc",
              borderRadius: "2px",
              background: "#f5f5f5",
              cursor: "pointer",
            }}
          >
            Fermer
          </button>
          <button
            onClick={() => setSelectedGradient(customGradient)}
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              border: "1px solid #000091",
              borderRadius: "2px",
              background: "#000091",
              color: "white",
              cursor: "pointer",
            }}
          >
            Appliquer
          </button>
        </div>
      </div>
    );
  };

  const mapGradient = () => {
    return (
      <div className="map-gradient">
        {isMobile && <p className="map-gradient-label">+</p>}
        <div
          className={`map-gradient-bar ${isMobile ? "map-gradient-bar-vertical" : ""}`}
          style={{
            background: isMobile
              ? `
                linear-gradient(180deg, ${selectedGradient[2]} 0%, ${selectedGradient[1]} 50%, ${selectedGradient[0]} 100%)
              `
              : `
                linear-gradient(90deg, ${selectedGradient[0]} 0%, ${selectedGradient[1]} 50%, ${selectedGradient[2]} 100%)
              `,
          }}
          onClick={handleGradientClick}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
            }}
          >
            {hoveredFeature && !isMobile && (
              <div
                className="map-gradient-dot"
                style={{
                  left: `${hoveredFeature?.score === null ? 50 : (hoveredFeature?.score || 0) * 50}%`,
                }}
              ></div>
            )}
          </div>
        </div>
        {isMobile && <p className="map-gradient-label">-</p>}
        {!isMobile && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "space-between",
            }}
          >
            <p className="map-gradient-label">Non conforme</p>
            <p className="map-gradient-label">Conforme</p>
          </div>
        )}
        {showGradientSelector && gradientSelector()}
      </div>
    );
  };

  const mapDromSelector = () => {
    return (
      <div className="map-drom-selector">
        <MapButton
          onClick={() => selectLevel("country", "00", "quickNav")}
          expandable={true}
          arrowPosition="left"
          tooltip="France hexagonale"
          expandedButtons={[
            {
              label: "Guadeloupe",
              onClick: () => selectLevel("region", "r01", "quickNav"),
              tooltip: "Guadeloupe",
              content: <img src="/icons/guadeloupe.svg" alt="Guadeloupe" />,
            },
            {
              label: "Martinique",
              onClick: () => selectLevel("region", "r02", "quickNav"),
              tooltip: "Martinique",
              content: <img src="/icons/martinique.svg" alt="Martinique" />,
            },
            {
              label: "Guyane",
              onClick: () => selectLevel("region", "r03", "quickNav"),
              tooltip: "Guyane",
              content: <img src="/icons/guyane.svg" alt="Guyane" />,
            },
            {
              label: "La Réunion",
              onClick: () => selectLevel("region", "r04", "quickNav"),
              tooltip: "La Réunion",
              content: <img src="/icons/reunion.svg" alt="La Réunion" />,
            },
            {
              label: "Mayotte",
              onClick: () => selectLevel("region", "r06", "quickNav"),
              tooltip: "Mayotte",
              content: <img src="/icons/mayotte.svg" alt="Mayotte" />,
            },
          ]}
        >
          <img src="/icons/france.svg" alt="France" />
        </MapButton>
      </div>
    );
  };

  const mapActionButtons = () => {
    return (
      <div className="map-action-buttons">
        {!isMobile && (
          <MapButton onClick={handleFullscreen} aria-label="Plein écran" tooltip="Plein écran">
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.4008 2.72951L15.8738 9.25654C15.6785 9.4518 15.362 9.4518 15.1667 9.25654L14.7432 8.83305C14.5479 8.63779 14.5479 8.32121 14.7432 8.12595L21.2702 1.59891H15.7057C15.4296 1.59891 15.2057 1.37505 15.2057 1.09891V0.5C15.2057 0.223857 15.4296 0 15.7057 0H23.4997C23.7759 0 23.9997 0.223858 23.9997 0.5V8.29401C23.9997 8.57015 23.7759 8.79401 23.4997 8.79401H22.9008C22.6247 8.79401 22.4008 8.57015 22.4008 8.29401V2.72951Z"
                fill="#000091"
              />
              <path
                d="M1.59793 21.2712L8.12497 14.7442C8.32023 14.5489 8.63682 14.5489 8.83208 14.7442L9.25556 15.1677C9.45082 15.3629 9.45082 15.6795 9.25556 15.8748L2.72852 22.4018H8.29303C8.56917 22.4018 8.79303 22.6256 8.79303 22.9018V23.5007C8.79303 23.7768 8.56917 24.0007 8.29303 24.0007H0.499024C0.222881 24.0007 -0.000976562 23.7768 -0.000976562 23.5007V15.7067C-0.000976562 15.4306 0.222881 15.2067 0.499023 15.2067H1.09793C1.37408 15.2067 1.59793 15.4306 1.59793 15.7067V21.2712Z"
                fill="#000091"
              />
            </svg>
          </MapButton>
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <MapButton
            onClick={handleZoomIn}
            customStyle={{
              borderRadius: "4px 4px 0 0",
              borderBottom: "none",
            }}
            tooltip="Zoomer"
            aria-label="Zoomer"
          >
            <span style={{ backgroundColor: "none" }} className={fr.cx("fr-icon-add-line")}></span>
          </MapButton>
          <MapButton
            onClick={handleZoomOut}
            customStyle={{
              borderRadius: "0 0 4px 4px",
            }}
            tooltip="Dézoomer"
            aria-label="Dézoomer"
          >
            <span className={fr.cx("fr-icon-subtract-line")}></span>
          </MapButton>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!currentGeoJSON) return;
    if (!mapRef.current) return;

    setIsMapUpdating(true);

    if (mapState.currentLevel === "country") {
      mapRef.current.fitBounds(
        [
          [-5.2, 41.3],
          [9.5, 51.1],
        ],
        { padding: 40, duration: 1000 },
      );
    } else {
      setSearchOpen(false);
      try {
        const bounds = bbox(currentGeoJSON as GeoJSON.FeatureCollection);
        mapRef.current.fitBounds(
          [
            [bounds[0], bounds[1]],
            [bounds[2], bounds[3]],
          ],
          { padding: 100, duration: 1000 },
        );
      } catch (e) {
        console.error(e);
      }
    }

    const timeout = setTimeout(() => {
      setIsMapUpdating(false);
    }, 600);

    return () => {
      clearTimeout(timeout);
    };
  }, [mapState.currentLevel, currentGeoJSON]);

  return (
    <div style={{ position: "relative", flex: 1 }}>
      <Map
        ref={mapRef}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mapStyle={mapStyle as any}
        initialViewState={{
          bounds: [
            [-5.2, 41.3],
            [9.5, 51.1],
          ],
          fitBoundsOptions: { padding: 40 },
        }}
        interactiveLayerIds={["polygon-fill"]}
        onClick={handleMapClick}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        cursor="pointer"
        attributionControl={false}
      >
        <ScaleControl position="bottom-left" />
        <Source
          id="interactive-polygons"
          type="geojson"
          data={currentGeoJSON as GeoJSON.FeatureCollection & { id: string }}
          generateId={true}
        >
          {hoveredFeature && (
            <Layer {...(hoveredFillLayerStyle as LayerProps)} beforeId="Water point/Sea or ocean" />
          )}
          {hoveredFeature && (
            <Layer
              {...(hoveredStrokeLayerStyle as LayerProps)}
              beforeId="Water point/Sea or ocean"
            />
          )}
          <Layer {...(fillLayerStyle as LayerProps)} beforeId="Water point/Sea or ocean" />
          <Layer {...(strokeLayerStyle as LayerProps)} beforeId="Water point/Sea or ocean" />
          {mapState.selectedAreas.city && (
            <Layer
              {...(selectedCityLayerStyle as LayerProps)}
              beforeId="Water point/Sea or ocean"
            />
          )}
        </Source>
        {popupInfo && mapTooltip(popupInfo)}
      </Map>

      {isMobile && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            padding: "10px",
            top: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: mapState.currentLevel === "country" ? "flex-end" : "space-between",
            gap: "1rem",
            zIndex: 10,
          }}
        >
          {mapState.currentLevel !== "country" && (
            <MapButton onClick={() => goBack()} aria-label="Retour" tooltip="Retour">
              <span aria-hidden="true" className={fr.cx("fr-icon-arrow-go-back-line")}></span>
            </MapButton>
          )}
          {searchOpen ? (
            <CommuneSearch
              onSelect={handleQuickNav}
              placeholder="Rechercher une commune ou EPCI"
              smallButton={true}
              style={{
                backgroundColor: "white",
                fontSize: "14px",
              }}
            />
          ) : (
            <MapButton
              onClick={() => setSearchOpen(true)}
              aria-label="Rechercher..."
              tooltip="Rechercher..."
              customStyle={{ backgroundColor: "var(--background-action-high-blue-france)" }}
            >
              <span
                aria-hidden="true"
                style={{ color: "#fff" }}
                className={fr.cx("fr-icon-search-line")}
              ></span>
            </MapButton>
          )}
        </div>
      )}
      {panelState === "closed" && (
        <>
          {mapGradient()}
          {mapDromSelector()}
          {mapActionButtons()}
        </>
      )}
    </div>
  );
};

MapContainer.propTypes = {
  currentGeoJSON: PropTypes.object,
  handleAreaClick: PropTypes.func.isRequired,
  handleFullscreen: PropTypes.func.isRequired,
  mapState: PropTypes.object.isRequired,
  selectLevel: PropTypes.func.isRequired,
  selectedGradient: PropTypes.array.isRequired,
  setSelectedGradient: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  panelState: PropTypes.string.isRequired,
  goBack: PropTypes.func.isRequired,
  handleQuickNav: PropTypes.func.isRequired,
};

export default MapContainer;
