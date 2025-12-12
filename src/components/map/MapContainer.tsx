"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { bbox } from "@turf/bbox";
import * as turf from "@turf/turf";
import { MapLayerMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Image from "next/image";
import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, LayerProps, MapRef, Popup, ScaleControl, Source } from "react-map-gl/maplibre";
import CommuneSearch, { Commune as SearchCommuneType } from "../CommuneSearch";
// import mapStyle from "./map_style.json";
import MapButton from "./MapButton";
import { FeatureProperties, MapState } from "./types";

import { mapStyles } from "carte-facile";
import "carte-facile/carte-facile.css";
import "maplibre-gl/dist/maplibre-gl.css";

const MapContainer = ({
  currentGeoJSON,
  mapState,
  gradientColors,
  isMobile,
  showGradientLegend,
  panelState,
  handleAreaClick,
  handleFullscreen,
  selectLevel,
  goBack,
  handleQuickNav,
  displayCircleValue,
  customLayers,
}: {
  currentGeoJSON: GeoJSON.FeatureCollection & { id: string };
  mapState: MapState;
  gradientColors: string[];
  isMobile: boolean;
  showGradientLegend: boolean;
  panelState: "closed" | "open" | "partial";
  handleAreaClick: (event: MapLayerMouseEvent) => void;
  handleFullscreen: () => void;
  selectLevel: (
    level: "country" | "region" | "department" | "epci" | "city",
    code: string,
    source?: string,
  ) => void;
  goBack: () => void;
  handleQuickNav: (commune: SearchCommuneType) => void;
  displayCircleValue: boolean;
  customLayers?: Array<{
    id: string;
    source?: {
      id: string;
      type: "geojson";
      data: GeoJSON.FeatureCollection;
    };
    layers?: LayerProps[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component?: React.ComponentType<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props?: any;
  }>;
}) => {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number;
    latitude: number;
    properties: FeatureProperties;
  } | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<{ id: string; score: number } | null>(null);
  const [isMapUpdating, setIsMapUpdating] = useState(false);
  const [searchOpen, setSearchOpen] = useState(true);

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

  const circleLayerStyle = {
    id: "feature-circles",
    type: "circle",
    paint: {
      "circle-radius": 20,
      "circle-color": "#ffffff",
      "circle-stroke-color": "#000000",
      "circle-stroke-width": 2,
      "circle-opacity": 0.9,
    },
  };

  const textLayerStyle = {
    id: "feature-labels",
    type: "symbol",
    layout: {
      "text-field": ["get", "circleValue"],
      "text-font": ["Arial Unicode MS Regular"],
      "text-size": 14,
      "text-anchor": "center",
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "#000000",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1,
    },
  };

  const pointFeatures = useMemo(() => {
    if (!currentGeoJSON || ["department", "epci", "city"].includes(mapState.currentLevel))
      return null;
    const features = (currentGeoJSON as GeoJSON.FeatureCollection).features.map((feature) => {
      const centroid = turf.centroid(feature);
      return {
        type: "Feature" as const,
        geometry: centroid.geometry,
        properties: {
          ...feature.properties,
          circleValue: feature.properties?.VALUE,
        },
      };
    });
    return {
      type: "FeatureCollection" as const,
      features,
      id: `point-features-${Math.random().toString(36).substring(2, 15)}`,
    };
  }, [currentGeoJSON, mapState.currentLevel]);

  const onMouseLeave = useCallback(() => {
    if (hoveredFeature !== null && mapRef.current) {
      setHoveredFeature(null);
      setPopupInfo(null);
    }
  }, [hoveredFeature]);

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

  const fitToFrance = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.fitBounds(
      [
        [-5.2, 41.3],
        [9.5, 51.1],
      ],
      { padding: 40, duration: 1000 },
    );
  }, []);

  const fitToGeoJSONBounds = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = bbox(currentGeoJSON as GeoJSON.FeatureCollection);
    mapRef.current.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      { padding: isMobile ? 40 : 100, duration: 1000 },
    );
  }, [currentGeoJSON, isMobile]);

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

  const mapGradient = () => {
    return (
      <div className="map-gradient">
        {isMobile && <p className="map-gradient-label">+</p>}
        <div
          className={`map-gradient-bar ${isMobile ? "map-gradient-bar-vertical" : ""}`}
          style={{
            background: isMobile
              ? `
                linear-gradient(180deg, ${gradientColors[2]} 0%, ${gradientColors[1]} 50%, ${gradientColors[0]} 100%)
              `
              : `
                linear-gradient(90deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 50%, ${gradientColors[2]} 100%)
              `,
          }}
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
            <p className="map-gradient-label">A risque</p>
            <p className="map-gradient-label">Conforme</p>
          </div>
        )}
      </div>
    );
  };

  const mapDromSelector = () => {
    return (
      <div className="map-drom-selector">
        <MapButton
          onClick={() => selectLevel("country", "00", "quickNav")}
          expandable={true}
          tooltip="France hexagonale"
          expandedButtons={[
            {
              label: "Guadeloupe",
              onClick: () => selectLevel("department", "971", "quickNav"),
              tooltip: "Guadeloupe",
              content: (
                <Image src="/icons/guadeloupe.svg" alt="Guadeloupe" width={24} height={24} />
              ),
            },
            {
              label: "Martinique",
              onClick: () => selectLevel("department", "972", "quickNav"),
              tooltip: "Martinique",
              content: (
                <Image src="/icons/martinique.svg" alt="Martinique" width={24} height={24} />
              ),
            },
            {
              label: "Guyane",
              onClick: () => selectLevel("department", "973", "quickNav"),
              tooltip: "Guyane",
              content: <Image src="/icons/guyane.svg" alt="Guyane" width={24} height={24} />,
            },
            {
              label: "La Réunion",
              onClick: () => selectLevel("department", "974", "quickNav"),
              tooltip: "La Réunion",
              content: <Image src="/icons/reunion.svg" alt="La Réunion" width={24} height={24} />,
            },
            {
              label: "Mayotte",
              onClick: () => selectLevel("department", "976", "quickNav"),
              tooltip: "Mayotte",
              content: <Image src="/icons/mayotte.svg" alt="Mayotte" width={24} height={24} />,
            },
          ]}
        >
          <Image src="/icons/france.svg" alt="France" width={24} height={24} />
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

  const mapMobileButtons = () => {
    return (
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
            placeholder="Rechercher une collectivité"
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
    );
  };

  useEffect(() => {
    if (!currentGeoJSON) return;
    if (!mapRef.current) return;

    setIsMapUpdating(true);

    if (mapState.currentLevel === "country") {
      fitToFrance();
    } else {
      setSearchOpen(false);
      try {
        fitToGeoJSONBounds();
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
  }, [mapState.currentLevel, currentGeoJSON, fitToFrance, fitToGeoJSONBounds]);

  return (
    <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
      <Map
        ref={mapRef}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mapStyle={mapStyles.desaturated as any}
        projection="mercator"
        interactiveLayerIds={["polygon-fill"]}
        onClick={handleMapClick}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        cursor="pointer"
        onResize={() => {
          if (!mapRef.current || !currentGeoJSON) return;

          try {
            if (mapState.currentLevel === "country") {
              fitToFrance();
            } else {
              fitToGeoJSONBounds();
            }
          } catch (e) {
            console.error("Error fitting bounds on resize:", e);
          }
        }}
      >
        {popupInfo && mapTooltip(popupInfo)}
        <ScaleControl position="bottom-left" />

        {customLayers?.map((customLayer) => {
          if ("component" in customLayer && customLayer.component) {
            const Component = customLayer.component;
            return <Component key={customLayer.id} {...customLayer.props} />;
          }
          if (
            "source" in customLayer &&
            customLayer.source &&
            "layers" in customLayer &&
            customLayer.layers
          ) {
            return (
              <Source
                key={customLayer.id}
                id={customLayer.source.id}
                type={customLayer.source.type}
                data={customLayer.source.data}
                generateId={true}
              >
                {customLayer.layers.map((layer, index) => (
                  <Layer key={`${customLayer.id}-${index}`} {...layer} />
                ))}
              </Source>
            );
          }
          return null;
        })}

        <Source
          id="interactive-polygons"
          type="geojson"
          data={currentGeoJSON as GeoJSON.FeatureCollection & { id: string }}
          generateId={true}
        >
          <Layer
            {...(fillLayerStyle as LayerProps)}
            beforeId="toponyme localite importance 6et7 - Special DOM"
          />
          <Layer
            {...(strokeLayerStyle as LayerProps)}
            beforeId="toponyme localite importance 6et7 - Special DOM"
          />
          {hoveredFeature && (
            <Layer
              {...(hoveredFillLayerStyle as LayerProps)}
              beforeId="toponyme localite importance 6et7 - Special DOM"
            />
          )}
          {hoveredFeature && (
            <Layer
              {...(hoveredStrokeLayerStyle as LayerProps)}
              beforeId="toponyme localite importance 6et7 - Special DOM"
            />
          )}
          {mapState.selectedAreas.city && <Layer {...(selectedCityLayerStyle as LayerProps)} />}
        </Source>

        {pointFeatures && displayCircleValue && (
          <Source
            id="feature-points"
            type="geojson"
            data={pointFeatures as GeoJSON.FeatureCollection & { id: string }}
            generateId={true}
          >
            <Layer {...(circleLayerStyle as LayerProps)} />
            <Layer {...(textLayerStyle as LayerProps)} />
          </Source>
        )}
      </Map>

      {isMobile && mapMobileButtons()}
      {(panelState === "closed" || !isMobile) && (
        <>
          {showGradientLegend && mapGradient()}
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
  gradientColors: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  showGradientLegend: PropTypes.bool.isRequired,
  panelState: PropTypes.string.isRequired,
  goBack: PropTypes.func.isRequired,
  handleQuickNav: PropTypes.func.isRequired,
  customLayers: PropTypes.array,
};

export default MapContainer;
