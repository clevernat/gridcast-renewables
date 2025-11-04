"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { NationalEnergyMap as NationalEnergyMapType, Location } from "@/types";

// Note: You'll need to add your Mapbox token
// Get a free token at https://www.mapbox.com/
const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  "pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example";

interface NationalEnergyMapProps {
  type: "solar" | "wind";
  onTypeChange: (type: "solar" | "wind") => void;
  userLocation?: Location | null; // Optional: user's searched location
}

export default function NationalEnergyMap({
  type,
  onTypeChange,
  userLocation,
}: NationalEnergyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapData, setMapData] = useState<NationalEnergyMapType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentHour, setCurrentHour] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<boolean>(false);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const userRadiusLayerId = "user-location-radius";
  const [userLocationValue, setUserLocationValue] = useState<number | null>(
    null
  );
  const [nationalAverage, setNationalAverage] = useState<number | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Validate Mapbox token
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes("example")) {
      setError(
        "Mapbox token is not configured. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file."
      );
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-98.5795, 39.8283], // Center of continental US
        zoom: 3.5,
        // Removed projection to enable compass rotation
        // projection: "albers" as any,
      });

      // Handle map load errors
      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
        setError(`Map error: ${e.error?.message || "Failed to load map"}`);
      });

      // Add navigation controls (zoom + compass/rotation)
      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: true,
          showZoom: true,
          visualizePitch: true,
        }),
        "top-right"
      );
    } catch (err: any) {
      console.error("Error initializing map:", err);
      setError(`Failed to initialize map: ${err.message}`);
    }

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
    setError("");

    try {
      const response = await fetch(
        `/api/national-map?type=${type}&hour=${hour}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setMapData(data.data);

        // Calculate national average
        const values = data.data.gridPoints.map((p: any) => p.value);
        const avg =
          values.reduce((a: number, b: number) => a + b, 0) / values.length;
        setNationalAverage(avg);

        // Fetch user location value if available
        if (userLocation) {
          fetchUserLocationValue(userLocation, hour);
        }
      } else {
        setError(data.error?.message || "Failed to load map data");
      }
    } catch (err) {
      setError("Failed to load map data");
      console.error(err);
    } finally {
      setLoading(false);

      // If animating, continue to next hour after data loads
      if (animationRef.current) {
        const nextHour = (hour + 1) % 24;
        setCurrentHour(nextHour);
        // Wait 500ms before fetching next hour to give user time to see the change
        setTimeout(() => {
          if (animationRef.current) {
            fetchMapData(nextHour);
          }
        }, 500);
      }
    }
  };

  // Fetch energy value at user's specific location
  const fetchUserLocationValue = async (
    location: Location,
    hour: number = 0
  ) => {
    try {
      const params = new URLSearchParams({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        hourly: type === "solar" ? "shortwave_radiation" : "wind_speed_10m",
        temperature_unit: "celsius",
        wind_speed_unit: "ms",
        timezone: "auto",
        forecast_days: "1",
      });

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params.toString()}`
      );
      const data = await response.json();

      if (data.hourly) {
        const values =
          type === "solar"
            ? data.hourly.shortwave_radiation
            : data.hourly.wind_speed_10m;

        if (values && values[hour] !== undefined) {
          setUserLocationValue(values[hour]);
        }
      }
    } catch (err) {
      console.error("Error fetching user location value:", err);
      setUserLocationValue(null);
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
      mapInstance.on("load", () => updateMapVisualization());
    } else {
      updateMapVisualization();
    }

    function updateMapVisualization() {
      if (!mapInstance || !mapData) return;

      // Remove existing layers and sources
      if (mapInstance.getLayer("energy-heatmap")) {
        mapInstance.removeLayer("energy-heatmap");
      }
      if (mapInstance.getSource("energy-data")) {
        mapInstance.removeSource("energy-data");
      }

      // Create GeoJSON from grid points
      const features = mapData.gridPoints.map((point) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [point.longitude, point.latitude],
        },
        properties: {
          value: point.value,
        },
      }));

      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features,
      };

      // Add source
      mapInstance.addSource("energy-data", {
        type: "geojson",
        data: geojson,
      });

      // Get max value for heatmap-weight normalization
      const maxValue = Math.max(...mapData.gridPoints.map((p) => p.value), 1);

      // Determine color scale based on type
      // Use heatmap-density (0-1) instead of actual values for interpolation
      const colorScale =
        type === "solar"
          ? [
              0,
              "rgba(255, 255, 0, 0)",
              0.2,
              "rgba(255, 255, 0, 0.3)",
              0.4,
              "rgba(255, 200, 0, 0.5)",
              0.6,
              "rgba(255, 150, 0, 0.7)",
              0.8,
              "rgba(255, 100, 0, 0.85)",
              1.0,
              "rgba(255, 0, 0, 1)",
            ]
          : [
              0,
              "rgba(0, 100, 255, 0)",
              0.2,
              "rgba(0, 150, 255, 0.3)",
              0.4,
              "rgba(0, 200, 255, 0.5)",
              0.6,
              "rgba(100, 200, 255, 0.7)",
              0.8,
              "rgba(150, 150, 255, 0.85)",
              1.0,
              "rgba(200, 100, 255, 1)",
            ];

      // Add heatmap layer
      mapInstance.addLayer({
        id: "energy-heatmap",
        type: "heatmap",
        source: "energy-data",
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "value"],
            0,
            0,
            maxValue,
            1,
          ],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            1,
            9,
            3,
          ],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            ...colorScale,
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 20, 9, 40],
          "heatmap-opacity": 0.8,
        },
      });
    }
  }, [mapData, type]);

  const handleHourChange = (hour: number) => {
    setCurrentHour(hour);
    fetchMapData(hour);
  };

  // Animation controls
  const startAnimation = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    animationRef.current = true;

    // Start fetching the next hour
    const nextHour = (currentHour + 1) % 24;
    setCurrentHour(nextHour);
    fetchMapData(nextHour);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    animationRef.current = false;
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      animationRef.current = false;
    };
  }, []);

  // Handle user location marker and radius
  useEffect(() => {
    if (!map.current) return;

    const mapInstance = map.current;

    // Remove existing marker if any
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    // Remove existing radius layer safely
    const removeRadiusLayer = () => {
      if (!mapInstance || !mapInstance.isStyleLoaded()) return;

      try {
        if (mapInstance.getLayer(userRadiusLayerId)) {
          mapInstance.removeLayer(userRadiusLayerId);
        }
        if (mapInstance.getSource(userRadiusLayerId)) {
          mapInstance.removeSource(userRadiusLayerId);
        }
      } catch (err) {
        console.error("Error removing radius layer:", err);
      }
    };

    removeRadiusLayer();

    // Add new marker and radius if user location exists
    if (userLocation) {
      // Add radius circle (50km radius)
      const radiusKm = 50;
      const radiusInDegrees = radiusKm / 111; // Approximate conversion

      const circleGeoJSON: GeoJSON.Feature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [userLocation.longitude, userLocation.latitude],
        },
        properties: {},
      };

      // Wait for map to be loaded before adding layers
      const addRadiusLayer = () => {
        if (!mapInstance || !mapInstance.isStyleLoaded()) {
          mapInstance.once("styledata", addRadiusLayer);
          return;
        }

        try {
          // Double-check layer doesn't exist before adding
          if (mapInstance.getLayer(userRadiusLayerId)) {
            mapInstance.removeLayer(userRadiusLayerId);
          }
          if (mapInstance.getSource(userRadiusLayerId)) {
            mapInstance.removeSource(userRadiusLayerId);
          }

          mapInstance.addSource(userRadiusLayerId, {
            type: "geojson",
            data: circleGeoJSON,
          });

          mapInstance.addLayer({
            id: userRadiusLayerId,
            type: "circle",
            source: userRadiusLayerId,
            paint: {
              "circle-radius": {
                stops: [
                  [0, 0],
                  [20, radiusInDegrees * 100000], // Adjust for zoom levels
                ],
                base: 2,
              },
              "circle-color": "#3b82f6",
              "circle-opacity": 0.1,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#3b82f6",
              "circle-stroke-opacity": 0.5,
            },
          });
        } catch (err) {
          console.error("Error adding radius layer:", err);
        }
      };

      addRadiusLayer();

      // Create a custom marker element
      const el = document.createElement("div");
      el.className = "user-location-marker";
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#3b82f6";
      el.style.border = "4px solid white";
      el.style.boxShadow =
        "0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.4)";
      el.style.cursor = "pointer";
      el.style.animation = "pulse 2s infinite";
      el.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        ">📍</div>
      `;

      // Build popup content with energy data
      const buildPopupContent = () => {
        const valueUnit = type === "solar" ? "W/m²" : "m/s";
        const valueLabel = type === "solar" ? "Solar Irradiance" : "Wind Speed";

        let energySection = "";
        if (userLocationValue !== null && nationalAverage !== null) {
          // Handle case where national average is 0 or very small
          let comparison = "";
          if (nationalAverage === 0 || Math.abs(nationalAverage) < 0.01) {
            // If national average is essentially zero
            if (userLocationValue === 0 || Math.abs(userLocationValue) < 0.01) {
              comparison = `<span style="color: #6b7280;">≈ Same as national average (both near zero)</span>`;
            } else {
              comparison = `<span style="color: #059669;">▲ Significantly above national average</span>`;
            }
          } else {
            // Normal calculation when national average is valid
            const percentDiff =
              ((userLocationValue - nationalAverage) / nationalAverage) * 100;

            // Check if percentDiff is valid
            if (isNaN(percentDiff) || !isFinite(percentDiff)) {
              comparison = `<span style="color: #6b7280;">Comparison unavailable</span>`;
            } else if (Math.abs(percentDiff) < 1) {
              comparison = `<span style="color: #6b7280;">≈ Same as national average</span>`;
            } else if (percentDiff > 0) {
              comparison = `<span style="color: #059669;">▲ ${percentDiff.toFixed(
                1
              )}% above</span>`;
            } else {
              comparison = `<span style="color: #dc2626;">▼ ${Math.abs(
                percentDiff
              ).toFixed(1)}% below</span>`;
            }
          }

          energySection = `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; word-wrap: break-word; overflow-wrap: break-word;">
              <div style="margin-bottom: 4px;">
                <strong>${valueLabel}:</strong> ${userLocationValue.toFixed(
            1
          )} ${valueUnit}
              </div>
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                National Avg: ${nationalAverage.toFixed(1)} ${valueUnit}
              </div>
              <div style="margin-top: 4px; font-weight: 600; font-size: 11px; line-height: 1.4;">
                ${comparison} national average
              </div>
            </div>
          `;
        }

        return `
          <div style="padding: 10px; min-width: 280px; max-width: 320px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; color: #1f2937; font-size: 14px;">
              📍 Your Location
            </h3>
            <div style="font-size: 12px; color: #4b5563; line-height: 1.6;">
              <div><strong>Latitude:</strong> ${userLocation.latitude.toFixed(
                4
              )}°</div>
              <div><strong>Longitude:</strong> ${userLocation.longitude.toFixed(
                4
              )}°</div>
              ${
                userLocation.address
                  ? `<div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e5e7eb; word-wrap: break-word; overflow-wrap: break-word;"><strong>Address:</strong><br/><span style="font-size: 11px;">${userLocation.address}</span></div>`
                  : ""
              }
              ${energySection}
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af;">
              📏 Radius: ${radiusKm}km
            </div>
          </div>
        `;
      };

      // Create popup with location details
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        buildPopupContent()
      );

      // Create and add marker
      userMarkerRef.current = new mapboxgl.Marker(el)
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .setPopup(popup)
        .addTo(mapInstance);

      // Show popup initially
      userMarkerRef.current.togglePopup();
    }

    // Cleanup on unmount
    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }

      if (!mapInstance || !mapInstance.isStyleLoaded()) return;

      try {
        if (mapInstance.getLayer(userRadiusLayerId)) {
          mapInstance.removeLayer(userRadiusLayerId);
        }
        if (mapInstance.getSource(userRadiusLayerId)) {
          mapInstance.removeSource(userRadiusLayerId);
        }
      } catch (err) {
        console.error("Error cleaning up radius layer:", err);
      }
    };
  }, [userLocation, userLocationValue, nationalAverage, type]);

  // Zoom to user location function
  const zoomToUserLocation = () => {
    if (map.current && userLocation) {
      map.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 8,
        duration: 2000,
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          National {type === "solar" ? "Solar" : "Wind"} Energy Potential
        </h2>

        <div className="flex space-x-2">
          <button
            onClick={() => onTypeChange("solar")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              type === "solar"
                ? "bg-yellow-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ☀️ Solar
          </button>
          <button
            onClick={() => onTypeChange("wind")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              type === "wind"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
        style={{ height: "600px" }}
      />

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">
            Time Slider: +{currentHour} hours
          </label>
          <div className="flex items-center space-x-3">
            {userLocation && (
              <button
                onClick={zoomToUserLocation}
                className="px-4 py-1.5 rounded-md font-medium text-sm transition-colors bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg"
                title="Zoom to your searched location"
              >
                📍 My Location
              </button>
            )}
            <button
              onClick={isAnimating ? stopAnimation : startAnimation}
              className={`px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${
                isAnimating
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {isAnimating ? "⏸ Stop" : "▶ Animate"}
            </button>
            <span className="text-sm text-gray-600">
              {mapData && new Date(mapData.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="23"
          value={currentHour}
          onChange={(e) => {
            if (isAnimating) stopAnimation();
            handleHourChange(parseInt(e.target.value));
          }}
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
          <div
            className={`h-4 flex-1 rounded ${
              type === "solar"
                ? "bg-gradient-to-r from-yellow-200 via-orange-400 to-red-600"
                : "bg-gradient-to-r from-blue-200 via-blue-400 to-purple-600"
            }`}
          />
          <span className="text-xs text-gray-600">
            {type === "solar"
              ? "Low → High Solar Irradiance"
              : "Low → High Wind Speed"}
          </span>
        </div>
      </div>
    </div>
  );
}
