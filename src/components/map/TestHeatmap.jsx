import React, { useState, useEffect } from 'react';
import MapLibreMap, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const FranceHeatmapMap = () => {
  const [viewState, setViewState] = useState({
    longitude: 2.3522,
    latitude: 46.8182,
    zoom: 5.5
  });
  
  const [heatmapData, setHeatmapData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Heatmap configuration

  // Process data and create heatmap points
  const processDataToHeatmap = (apiData, coordinatesMap) => {
    const features = [];
    
    apiData.forEach(entry => {
      const coords = coordinatesMap[entry.id.slice(0, 9)];
      
      if (!coords || !coords.longitude || !coords.latitude) {
        return;
      }
      
      // Create a point for each service usage
      features.push({
        type: 'Feature',
        properties: {
          intensity: 1 // Each point has intensity of 1
        },
        geometry: {
          type: 'Point',
          coordinates: [coords.longitude, coords.latitude]
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
        
        // Process into heatmap points
        const heatmapGeoJSON = processDataToHeatmap(result.data, coordMap);
        console.log(`Heatmap points: ${heatmapGeoJSON.features.length}`);
        
        setHeatmapData(heatmapGeoJSON);
        
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Heatmap layer configuration
  const heatmapLayer = {
    id: 'heatmap',
    type: 'heatmap',
    source: 'heatmap-data',
    maxzoom: 15,
    paint: {
      // Increase the heatmap weight based on frequency and property magnitude
      'heatmap-weight': [
        'interpolate',
        ['linear'],
        ['get', 'intensity'],
        0, 0,
        1, 1
      ],
      // Increase the heatmap color weight weight by zoom level
      // heatmap-intensity is a multiplier on top of heatmap-weight
      'heatmap-intensity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 1,
        15, 3
      ],
      // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
      // Begin color ramp at 0-stop with a 0-transparancy color
      // to create a blur-like effect.
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(33,102,172,0)',
        0.2, 'rgb(103,169,207)',
        0.4, 'rgb(209,229,240)',
        0.6, 'rgb(184, 195, 237)',
        0.8, 'rgb(71, 92, 178)',
        1, 'rgb(42, 60, 132)'
      ],
      // Adjust the heatmap radius by zoom level
      'heatmap-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 2,
        5, 3,
        10, 10,
        15, 20
      ],
      // Transition from heatmap to circle layer by zoom level
      'heatmap-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7, 1,
        15, 0
      ]
    }
  };

  // Circle layer for higher zoom levels
  const circleLayer = {
    id: 'heatmap-points',
    type: 'circle',
    source: 'heatmap-data',
    minzoom: 7,
    paint: {
      // Size circle radius by earthquake magnitude and zoom level
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7, [
          'interpolate',
          ['linear'],
          ['get', 'intensity'],
          1, 1,
          2, 3,
          5, 5
        ],
        15, [
          'interpolate',
          ['linear'],
          ['get', 'intensity'],
          1, 5,
          2, 10,
          5, 15
        ]
      ],
      // Color circle by earthquake magnitude
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'intensity'],
        1, 'rgba(33,102,172,0.8)',
        2, 'rgba(103,169,207,0.8)',
        3, 'rgba(209,229,240,0.8)',
        4, 'rgba(253,219,199,0.8)',
        5, 'rgba(239,138,98,0.8)'
      ],
      'circle-stroke-color': 'white',
      'circle-stroke-width': 1,
      // Transition from heatmap to circle layer by zoom level
      'circle-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7, 0,
        15, 1
      ]
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
        {heatmapData && (
          <Source id="heatmap-data" type="geojson" data={heatmapData}>
            <Layer {...heatmapLayer} />
            <Layer {...circleLayer} />
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

export default FranceHeatmapMap;