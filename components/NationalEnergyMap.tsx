'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NationalEnergyMap as NationalEnergyMapType } from '@/types';

// Note: You'll need to add your Mapbox token
// Get a free token at https://www.mapbox.com/
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example';

interface NationalEnergyMapProps {
  type: 'solar' | 'wind';
  onTypeChange: (type: 'solar' | 'wind') => void;
}

export default function NationalEnergyMap({ type, onTypeChange }: NationalEnergyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapData, setMapData] = useState<NationalEnergyMapType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentHour, setCurrentHour] = useState(0);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-98.5795, 39.8283], // Center of continental US
      zoom: 3.5,
      projection: 'albers' as any
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Fetch map data
  const fetchMapData = async (hour: number = 0) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/national-map?type=${type}&hour=${hour}`);
      const data = await response.json();

      if (data.success && data.data) {
        setMapData(data.data);
      } else {
        setError(data.error?.message || 'Failed to load map data');
      }
    } catch (err) {
      setError('Failed to load map data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchMapData(currentHour);
  }, [type]);

  // Update map visualization
  useEffect(() => {
    if (!map.current || !mapData) return;

    const mapInstance = map.current;

    // Wait for map to load
    if (!mapInstance.isStyleLoaded()) {
      mapInstance.on('load', () => updateMapVisualization());
    } else {
      updateMapVisualization();
    }

    function updateMapVisualization() {
      if (!mapInstance || !mapData) return;

      // Remove existing layers and sources
      if (mapInstance.getLayer('energy-heatmap')) {
        mapInstance.removeLayer('energy-heatmap');
      }
      if (mapInstance.getSource('energy-data')) {
        mapInstance.removeSource('energy-data');
      }

      // Create GeoJSON from grid points
      const features = mapData.gridPoints.map(point => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [point.longitude, point.latitude]
        },
        properties: {
          value: point.value
        }
      }));

      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features
      };

      // Add source
      mapInstance.addSource('energy-data', {
        type: 'geojson',
        data: geojson
      });

      // Determine color scale based on type
      const maxValue = Math.max(...mapData.gridPoints.map(p => p.value));
      const colorScale = type === 'solar'
        ? [
            0, 'rgba(255, 255, 0, 0)',
            maxValue * 0.2, 'rgba(255, 255, 0, 0.3)',
            maxValue * 0.4, 'rgba(255, 200, 0, 0.5)',
            maxValue * 0.6, 'rgba(255, 150, 0, 0.7)',
            maxValue * 0.8, 'rgba(255, 100, 0, 0.85)',
            maxValue, 'rgba(255, 0, 0, 1)'
          ]
        : [
            0, 'rgba(0, 100, 255, 0)',
            maxValue * 0.2, 'rgba(0, 150, 255, 0.3)',
            maxValue * 0.4, 'rgba(0, 200, 255, 0.5)',
            maxValue * 0.6, 'rgba(100, 200, 255, 0.7)',
            maxValue * 0.8, 'rgba(150, 150, 255, 0.85)',
            maxValue, 'rgba(200, 100, 255, 1)'
          ];

      // Add heatmap layer
      mapInstance.addLayer({
        id: 'energy-heatmap',
        type: 'heatmap',
        source: 'energy-data',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'value'],
            0, 0,
            maxValue, 1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            9, 3
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            ...colorScale
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 20,
            9, 40
          ],
          'heatmap-opacity': 0.8
        }
      });
    }
  }, [mapData, type]);

  const handleHourChange = (hour: number) => {
    setCurrentHour(hour);
    fetchMapData(hour);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          National {type === 'solar' ? 'Solar' : 'Wind'} Energy Potential
        </h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onTypeChange('solar')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              type === 'solar'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ☀️ Solar
          </button>
          <button
            onClick={() => onTypeChange('wind')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              type === 'wind'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            💨 Wind
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading map data...</p>
        </div>
      )}

      <div 
        ref={mapContainer} 
        className="w-full rounded-lg overflow-hidden"
        style={{ height: '600px' }}
      />

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">
            Time Slider: +{currentHour} hours
          </label>
          <span className="text-sm text-gray-600">
            {mapData && new Date(mapData.timestamp).toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="23"
          value={currentHour}
          onChange={(e) => handleHourChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Now</span>
          <span>+6h</span>
          <span>+12h</span>
          <span>+18h</span>
          <span>+24h</span>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend</h3>
        <div className="flex items-center space-x-2">
          <div className={`h-4 flex-1 rounded ${
            type === 'solar'
              ? 'bg-gradient-to-r from-yellow-200 via-orange-400 to-red-600'
              : 'bg-gradient-to-r from-blue-200 via-blue-400 to-purple-600'
          }`} />
          <span className="text-xs text-gray-600">
            {type === 'solar' ? 'Low → High Solar Irradiance' : 'Low → High Wind Speed'}
          </span>
        </div>
      </div>
    </div>
  );
}

