import React from "react";
import { Layer, Source } from "react-map-gl/maplibre";

// disable eslint on this file
/* eslint-disable */

interface HexbinLayerProps {
  data: GeoJSON.FeatureCollection;
  id?: string;
  sourceId?: string;
  visible?: boolean;
  fillColor?: string | any[];
  fillOpacity?: number | any[];
  strokeColor?: string | any[];
  strokeWidth?: number;
  showLabels?: boolean;
  labelField?: string;
  minZoom?: number;
  maxZoom?: number;
}

const HexbinLayer: React.FC<HexbinLayerProps> = ({
  data,
  id = "hexbin-layer",
  sourceId = "hexbin-data",
  visible = true,
  fillColor = [
    "interpolate",
    ["linear"],
    ["get", "score"],
    0,
    "rgba(0, 0, 145, 0.0)",
    0.1,
    "rgba(0, 0, 145, 0.1)",
    0.2,
    "rgba(0, 0, 145, 0.2)",
    0.3,
    "rgba(0, 0, 145, 0.3)",
    0.4,
    "rgba(0, 0, 145, 0.4)",
    0.5,
    "rgba(0, 0, 145, 0.5)",
    0.6,
    "rgba(0, 0, 145, 0.6)",
    0.7,
    "rgba(0, 0, 145, 0.7)",
    0.8,
    "rgba(0, 0, 145, 0.8)",
    0.9,
    "rgba(0, 0, 145, 0.9)",
    1,
    "rgba(0, 0, 145, 1)",
  ],
  fillOpacity = 1,
  strokeColor = "rgba(255,255,255,0.3)",
  strokeWidth = 1,
  showLabels = true,
  labelField = "score",
  minZoom = 0,
  maxZoom = 24,
}) => {
  const fillLayer = {
    id: `${id}-fill`,
    type: "fill" as const,
    paint: {
      "fill-color": fillColor as any,
      "fill-opacity": fillOpacity as any,
      "fill-outline-color": [
        "interpolate",
        ["linear"],
        ["get", "score"],
        0,
        "rgba(0, 0, 145, 1)",
        1,
        "rgba(0, 0, 145, 1)",
        5,
        "rgba(0, 0, 145, 1)",
        10,
        "rgba(0, 0, 145, 1)",
        20,
        "rgba(0, 0, 145, 1)",
        50,
        "rgba(0, 0, 145, 1)",
        100,
        "rgba(0, 0, 145, 1)",
      ] as any,
    },
    layout: {
      visibility: visible ? ("visible" as const) : ("none" as const),
    },
    minzoom: minZoom,
    maxzoom: maxZoom,
  };

  const strokeLayer = {
    id: `${id}-stroke`,
    type: "line" as const,
    paint: {
      "line-color": strokeColor as any,
      "line-width": strokeWidth,
    },
    layout: {
      visibility: visible ? ("visible" as const) : ("none" as const),
    },
    minzoom: minZoom,
    maxzoom: maxZoom,
  };

  const labelLayer = {
    id: `${id}-labels`,
    type: "symbol" as const,
    layout: {
      "text-field": ["get", labelField] as any,
      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 7, 10, 12, 14] as any,
      "text-anchor": "center" as const,
      "text-allow-overlap": true,
      visibility: visible && showLabels ? ("visible" as const) : ("none" as const),
    },
    paint: {
      "text-color": "white",
      "text-halo-color": "rgba(0,0,0,0.5)",
      "text-halo-width": 1,
    },
    minzoom: Math.max(minZoom, 7),
    maxzoom: maxZoom,
  };

  return (
    <Source id={sourceId} type="geojson" data={data}>
      <Layer {...fillLayer} beforeId="toponyme localite importance 6et7 - Special DOM" />
      <Layer {...strokeLayer} beforeId="toponyme localite importance 6et7 - Special DOM" />
      {showLabels && (
        <Layer {...labelLayer} beforeId="toponyme localite importance 6et7 - Special DOM" />
      )}
    </Source>
  );
};

export default HexbinLayer;
