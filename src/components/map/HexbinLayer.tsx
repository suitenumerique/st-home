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
    "#FFFFFF",
    0.1,
    "#E5E5F4",
    0.2,
    "#CCCCE9",
    0.3,
    "#B2B2DE",
    0.4,
    "#9999D3",
    0.5,
    "#8080C8",
    0.6,
    "#6666BD",
    0.7,
    "#4D4DB2",
    0.8,
    "#3333A7",
    0.9,
    "#1A1A9C",
    1,
    "#000091",
  ],
  fillOpacity = 1,
  strokeColor = "rgba(255,255,255,0.3)",
  strokeWidth = 0,
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
      // "fill-outline-color": [
      //   "interpolate",
      //   ["linear"],
      //   ["get", "score"],
      //   0,
      //   "rgba(0, 0, 145, 1)",
      //   1,
      //   "rgba(0, 0, 145, 1)",
      //   5,
      //   "rgba(0, 0, 145, 1)",
      //   10,
      //   "rgba(0, 0, 145, 1)",
      //   20,
      //   "rgba(0, 0, 145, 1)",
      //   50,
      //   "rgba(0, 0, 145, 1)",
      //   100,
      //   "rgba(0, 0, 145, 1)",
      // ] as any,
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
      "line-color": "rgba(255,255,255,0.5)" as any,
      "line-width": ["interpolate", ["linear"], ["zoom"], 0, 0, 4, 0, 6, 0.5, 8, 2] as any,
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
