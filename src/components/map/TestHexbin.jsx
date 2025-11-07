import React, { useState, useEffect } from 'react';
import MapLibreMap, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const FranceHexbinMap = () => {
  const [viewState, setViewState] = useState({
    longitude: 2.3522,
    latitude: 46.8182,
    zoom: 5.5
  });
  
  const [hexbinData, setHexbinData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hexbin configuration
  const HEXBIN_SIZE = 0.15; // ~5km hexagon size in degrees

  // Create hexagon geometry with proper aspect ratio
  const createHexagon = (centerLat, centerLon, size) => {
    const coordinates = [];
    const radius = size * 0.35; // Make hexagon radius smaller to avoid overlap
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      // Account for latitude when calculating longitude offset
      const latOffset = radius * Math.cos(angle);
      const lonOffset = radius * Math.sin(angle) / Math.cos(centerLat * Math.PI / 180);
      
      const lat = centerLat + latOffset;
      const lon = centerLon + lonOffset;
      coordinates.push([lon, lat]);
    }
    coordinates.push(coordinates[0]); // Close the polygon
    return coordinates;
  };

  // Process data and create hexbin with interlocking pattern
  const processDataToHexbin = (apiData, coordinatesMap) => {
    const hexCells = new Map();
    
    apiData.forEach(entry => {
      const coords = coordinatesMap[entry.id.slice(0, 9)];
      
      if (!coords || !coords.longitude || !coords.latitude) {
        return;
      }
      
      // Create interlocking hexagonal grid
      const gridSize = HEXBIN_SIZE;
      const hexHeight = gridSize * 0.6; // Closer vertical spacing
      
      // Calculate which row and column this point belongs to
      const row = Math.round(coords.latitude / hexHeight);
      const col = Math.round(coords.longitude / gridSize);
      
      // Offset every other row by half a grid size for interlocking
      const offsetLon = (row % 2 === 0) ? 0 : gridSize / 2;
      const gridLon = col * gridSize + offsetLon;
      const gridLat = row * hexHeight;
      
      const hexKey = `${gridLon},${gridLat}`;
      
      // Aggregate in hex cell
      if (!hexCells.has(hexKey)) {
        hexCells.set(hexKey, {
          lon: gridLon,
          lat: gridLat,
          count: 0,
          entries: []
        });
      }
      
      const cell = hexCells.get(hexKey);
      cell.count++;
      cell.entries.push(entry);
    });
    
    // Convert to GeoJSON with hexagon polygons
    const features = [];
    hexCells.forEach(cell => {
      const hexagonCoords = createHexagon(cell.lat, cell.lon, HEXBIN_SIZE);
      
      features.push({
        type: 'Feature',
        properties: {
          count: cell.count,
          density: Math.min(cell.count, 100),
          centerLon: cell.lon,
          centerLat: cell.lat
        },
        geometry: {
          type: 'Polygon',
          coordinates: [hexagonCoords]
        }
      });
    });
    
    return {
      type: 'FeatureCollection',
      features: features
    };
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Process into hexbin
        const hexbinGeoJSON = processDataToHexbin(result.data, coordMap);
        setHexbinData(hexbinGeoJSON);
        
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Hexbin layer configuration
  const hexbinLayer = {
    id: 'hexbin',
    type: 'fill',
    source: 'hexbin-data',
    paint: {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'density'],
        0, 'rgba(55, 111, 36, 0)',
        1, 'rgba(42, 60, 132, 0.1)',
        5, 'rgba(42, 60, 132, 0.3)',
        10, 'rgba(42, 60, 132, 0.5)',
        20, 'rgba(42, 60, 132, 0.7)',
        50, 'rgba(42, 60, 132, 1)',
        100, 'rgba(42, 60, 132, 1)'
      ],
    }
  };

  // Hexbin stroke layer for better definition
  const hexbinStrokeLayer = {
    id: 'hexbin-stroke',
    type: 'line',
    source: 'hexbin-data',
    paint: {
      'line-color': 'rgba(255,255,255,0.3)',
      'line-width': 1
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MapLibreMap
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      >
        {hexbinData && (
          <Source id="hexbin-data" type="geojson" data={hexbinData}>
            <Layer {...hexbinLayer} />
            <Layer {...hexbinStrokeLayer} />
            <Layer {...hexbinLabelsLayer} />
          </Source>
        )}
      </MapLibreMap>
      
      {isLoading && (
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: 'white', 
          backgroundOpacity: 0.75 
        }}>
          <div style={{ fontSize: '1.5rem' }}>Loading hexbin data...</div>
        </div>
      )}
    </div>
  );
};

export default FranceHexbinMap;
