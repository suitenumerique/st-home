import React, { useState, useEffect } from 'react';
import MapLibreMap, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const FranceDotMap = () => {
  const [viewState, setViewState] = useState({
    longitude: 2.3522,
    latitude: 46.8182,
    zoom: 5.5
  });
  
  const [gridData, setGridData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Grid configuration
  const GRID_SIZE = 0.14; // ~30km

  // Snap coordinate to grid
  const snapToGrid = (lon, lat, gridSize) => {
    return [
      Math.round(lon / gridSize) * gridSize,
      Math.round(lat / gridSize) * gridSize
    ];
  };

  // Process data and create grid
  const processDataToGrid = (apiData, coordinatesMap, gridSize) => {
    const gridCells = new Map();
    
    apiData.forEach(entry => {
      const coords = coordinatesMap[entry.id.slice(0, 9)];
      
      if (!coords || !coords.longitude || !coords.latitude) {
        return;
      }
      
      // Snap to grid
      const [gridLon, gridLat] = snapToGrid(coords.longitude, coords.latitude, gridSize);
      const cellKey = `${gridLon},${gridLat}`;

      console.log(cellKey);
      
      // Aggregate in cell
      if (!gridCells.has(cellKey)) {
        gridCells.set(cellKey, {
          lon: gridLon,
          lat: gridLat,
          count: 0
        });
      }
      
      const cell = gridCells.get(cellKey);
      cell.count++;
    });
    
    // Convert to GeoJSON
    const features = [];
    gridCells.forEach(cell => {
      features.push({
        type: 'Feature',
        properties: {
          count: cell.count,
          density: Math.min(cell.count, 100)
        },
        geometry: {
          type: 'Point',
          coordinates: [cell.lon, cell.lat]
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
      setIsLoading(true);

      let sirenCoordinates;
      
      try {
        // Load SIREN coordinates via API
        const coordsResponse = await fetch('/siren_coordinates.json');
        
        if (coordsResponse.ok) {
          sirenCoordinates = await coordsResponse.json();
        } else {
          console.warn('SIREN coordinates API not available, using empty dataset');
        }
        
        // Convert to map for fast lookup
        const coordMap = {};
        if (Array.isArray(sirenCoordinates)) {
          sirenCoordinates.forEach(item => {
            const key = item.siren;
            coordMap[key] = {
              longitude: item.longitude,
              latitude: item.latitude
            };
          });
        } else {
          Object.assign(coordMap, sirenCoordinates);
        }
        
        console.log(`Loaded ${Object.keys(coordMap).length} SIREN coordinates`);
        
        // Fetch all data in one call
        const response = await fetch('http://localhost:8950/api/deployment/stats?scope=list-commune&service_id=1');
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.data || !Array.isArray(result.data)) {
          throw new Error('Invalid API response format');
        }
        
        console.log(`Total entries: ${result.data.length}`);
        
        // Process into grid
        const gridGeoJSON = processDataToGrid(result.data, coordMap, GRID_SIZE);
        console.log(`Grid cells: ${gridGeoJSON.features.length}`);
        
        setGridData(gridGeoJSON);
        
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Dot size based on density and zoom
  const getCircleRadius = () => {
    return [
      'interpolate',
      ['linear'],
      ['zoom'],
      4, [
        'interpolate',
        ['linear'],
        ['get', 'density'],
        1, 1,
        10, 2,
        30, 3,
        100, 4
      ],
      6, [
        'interpolate',
        ['linear'],
        ['get', 'density'],
        1, 3,
        10, 5,
        30, 7,
        100, 10
      ],
      8, [
        'interpolate',
        ['linear'],
        ['get', 'density'],
        1, 5,
        10, 8,
        30, 11,
        100, 15
      ],
      10, [
        'interpolate',
        ['linear'],
        ['get', 'density'],
        1, 7,
        10, 11,
        30, 15,
        100, 20
      ]
    ];
  };

  const dotsLayer = {
    id: 'grid-dots',
    type: 'circle',
    source: 'grid-data',
    paint: {
      'circle-radius': getCircleRadius(),
      'circle-color': '#2A3C84',
      'circle-opacity': 0.85,
      'circle-stroke-width': 0,
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
        {gridData && (
          <Source id="grid-data" type="geojson" data={gridData}>
            <Layer {...dotsLayer} />
          </Source>
        )}
      </MapLibreMap>
      
      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', backgroundOpacity: 0.75 }}>
          <div style={{ fontSize: '1.5rem' }}>Loading data...</div>
        </div>
      )}
    </div>
  );
};

export default FranceDotMap;