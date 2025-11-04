"use client";

import { useState } from "react";
import { AssetType, Asset, Location, SolarAsset, WindAsset } from "@/types";
import { useOpenStreetMapAutocomplete } from "@/hooks/useOpenStreetMapAutocomplete";

interface AssetConfigFormProps {
  onSubmit: (location: Location, asset: Asset) => void;
  loading?: boolean;
}

export default function AssetConfigForm({
  onSubmit,
  loading = false,
}: AssetConfigFormProps) {
  const [assetType, setAssetType] = useState<AssetType>("solar");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [useCoordinates, setUseCoordinates] = useState(false);

  // Free OpenStreetMap Autocomplete (no API key required)
  const {
    query,
    suggestions,
    isLoading: autocompleteLoading,
    showSuggestions,
    handleInputChange,
    handleSelectSuggestion,
    handleBlur,
    handleFocus,
  } = useOpenStreetMapAutocomplete((place) => {
    setAddress(place.address);
    setLatitude(place.latitude.toString());
    setLongitude(place.longitude.toString());
  });

  // Solar fields
  const [dcCapacity, setDcCapacity] = useState("");
  const [systemLosses, setSystemLosses] = useState("");

  // Wind fields
  const [ratedCapacity, setRatedCapacity] = useState("");
  const [hubHeight, setHubHeight] = useState("");
  const [cutInSpeed, setCutInSpeed] = useState("");
  const [ratedSpeed, setRatedSpeed] = useState("");
  const [cutOutSpeed, setCutOutSpeed] = useState("");

  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState("");

  const handleGeocodeAddress = async () => {
    if (!address.trim()) {
      setError("Please enter an address");
      return;
    }

    setGeocoding(true);
    setError("");

    try {
      const response = await fetch(
        `/api/geocode?address=${encodeURIComponent(address)}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setLatitude(data.data.latitude.toString());
        setLongitude(data.data.longitude.toString());
        setError("");
      } else {
        setError(data.error?.message || "Failed to geocode address");
      }
    } catch (err) {
      setError("Failed to geocode address");
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate location
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      setError("Please provide valid coordinates");
      return;
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError("Coordinates out of valid range");
      return;
    }

    const location: Location = {
      latitude: lat,
      longitude: lon,
      address: address || undefined,
    };

    // Build asset configuration
    let asset: Asset;

    if (assetType === "solar") {
      const dc = parseFloat(dcCapacity) || 7; // Default 7 kW
      const losses = parseFloat(systemLosses) || 14; // Default 14%

      if (dc <= 0) {
        setError("Please provide a valid DC capacity");
        return;
      }

      asset = {
        type: "solar",
        dcCapacity: dc,
        systemLosses: losses,
      } as SolarAsset;
    } else {
      const rated = parseFloat(ratedCapacity) || 1.5; // Default 1.5 MW
      const height = parseFloat(hubHeight) || 100; // Default 100m
      const cutIn = parseFloat(cutInSpeed) || 3; // Default 3 m/s
      const rated_speed = parseFloat(ratedSpeed) || 12; // Default 12 m/s
      const cutOut = parseFloat(cutOutSpeed) || 25; // Default 25 m/s

      if (rated <= 0) {
        setError("Please provide a valid rated capacity");
        return;
      }

      if (height <= 0) {
        setError("Please provide a valid hub height");
        return;
      }

      asset = {
        type: "wind",
        ratedCapacity: rated,
        hubHeight: height,
        cutInSpeed: cutIn,
        ratedSpeed: rated_speed,
        cutOutSpeed: cutOut,
      } as WindAsset;
    }

    onSubmit(location, asset);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 sticky top-24"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center">
          <span className="text-xl">⚙️</span>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
          Configure Asset
        </h2>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-md animate-fadeIn">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Location Input */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📍</span>
          <h3 className="text-lg font-bold text-gray-800">Location</h3>
        </div>

        <label className="flex items-center space-x-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              id="useCoordinates"
              checked={useCoordinates}
              onChange={(e) => setUseCoordinates(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-emerald-600 transition-all"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow-md"></div>
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
            Use GPS coordinates
          </span>
        </label>

        {!useCoordinates ? (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Address
              <span className="ml-2 text-xs text-green-600 font-normal">
                ✓ Free autocomplete (no API key needed)
              </span>
            </label>
            <div className="flex gap-2 relative">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query || address}
                  onChange={(e) => {
                    handleInputChange(e.target.value);
                    setAddress(e.target.value);
                  }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="Start typing an address..."
                  className="w-full px-4 py-3 !bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                  style={{ color: "#1f2937", backgroundColor: "#ffffff" }}
                  autoComplete="off"
                />

                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.place_id}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors text-sm border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">📍</span>
                          <span className="text-gray-700 flex-1">
                            {suggestion.display_name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Loading Indicator */}
                {autocompleteLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-500"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleGeocodeAddress}
                disabled={geocoding}
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 disabled:from-gray-400 disabled:to-gray-400 disabled:scale-100 transition-all duration-300 text-sm whitespace-nowrap"
              >
                {geocoding ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Finding
                  </span>
                ) : (
                  "Find"
                )}
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="e.g., 37.4224764"
              className="w-full px-4 py-3 !bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
              style={{ color: "#1f2937", backgroundColor: "#ffffff" }}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g., -122.0842499"
              className="w-full px-4 py-3 !bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
              style={{ color: "#1f2937", backgroundColor: "#ffffff" }}
              required
            />
          </div>
        </div>
      </div>

      {/* Asset Type Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <h3 className="text-lg font-bold text-gray-800">Asset Type</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAssetType("solar")}
            className={`group relative py-4 px-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
              assetType === "solar"
                ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/50 scale-105"
                : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:scale-105 hover:shadow-md"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">☀️</span>
              <span className="text-sm">Solar</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setAssetType("wind")}
            className={`group relative py-4 px-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
              assetType === "wind"
                ? "bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-lg shadow-blue-500/50 scale-105"
                : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:scale-105 hover:shadow-md"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">💨</span>
              <span className="text-sm">Wind</span>
            </div>
          </button>
        </div>
      </div>

      {/* Asset Configuration */}
      {assetType === "solar" ? (
        <div className="space-y-4 p-5 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
          <div className="flex items-center gap-2">
            <span className="text-lg">☀️</span>
            <h3 className="text-lg font-bold text-gray-800">
              Solar System Configuration
            </h3>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              DC Capacity (kW)
            </label>
            <input
              type="number"
              step="0.1"
              value={dcCapacity}
              onChange={(e) => setDcCapacity(e.target.value)}
              placeholder="e.g., 7"
              className="w-full px-4 py-3 !bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all text-sm"
              style={{ color: "#1f2937", backgroundColor: "#ffffff" }}
            />
            <p className="mt-2 text-xs text-gray-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
              Typical residential: 5-10 kW, Commercial: 50-500 kW
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              System Losses (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={systemLosses}
              onChange={(e) => setSystemLosses(e.target.value)}
              placeholder="e.g., 14"
              className="w-full px-4 py-3 !bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all text-sm"
              style={{ color: "#1f2937", backgroundColor: "#ffffff" }}
            />
            <p className="mt-2 text-xs text-gray-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
              Default 14% (includes inverter, wiring, soiling losses)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
          <div className="flex items-center gap-2">
            <span className="text-lg">💨</span>
            <h3 className="text-lg font-bold text-gray-800">
              Wind Turbine Configuration
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rated Capacity (MW)
              </label>
              <input
                type="number"
                step="0.1"
                value={ratedCapacity}
                onChange={(e) => setRatedCapacity(e.target.value)}
                placeholder="e.g., 1.5"
                className="w-full px-4 py-3 !bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                style={{ color: "#1f2937", backgroundColor: "#ffffff" }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hub Height (m)
              </label>
              <input
                type="number"
                step="1"
                value={hubHeight}
                onChange={(e) => setHubHeight(e.target.value)}
                placeholder="e.g., 100"
                className="w-full px-4 py-3 !bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                style={{ color: "#1f2937", backgroundColor: "#ffffff" }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Cut-in (m/s)
              </label>
              <input
                type="number"
                step="0.1"
                value={cutInSpeed}
                onChange={(e) => setCutInSpeed(e.target.value)}
                placeholder="3"
                className="w-full px-3 py-3 !bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                style={{ color: "#1f2937", backgroundColor: "#ffffff" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Rated (m/s)
              </label>
              <input
                type="number"
                step="0.1"
                value={ratedSpeed}
                onChange={(e) => setRatedSpeed(e.target.value)}
                placeholder="12"
                className="w-full px-3 py-3 !bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                style={{ color: "#1f2937", backgroundColor: "#ffffff" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Cut-out (m/s)
              </label>
              <input
                type="number"
                step="0.1"
                value={cutOutSpeed}
                onChange={(e) => setCutOutSpeed(e.target.value)}
                placeholder="25"
                className="w-full px-3 py-3 !bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                style={{ color: "#1f2937", backgroundColor: "#ffffff" }}
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 disabled:from-gray-400 disabled:to-gray-400 disabled:scale-100 transition-all duration-300 flex items-center justify-center gap-2 text-base"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Generating Forecast...
          </>
        ) : (
          <>
            <span>⚡</span>
            Generate Forecast
          </>
        )}
      </button>
    </form>
  );
}
