"use client";

import { useState } from "react";
import { AssetType, Asset, Location, SolarAsset, WindAsset } from "@/types";

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
      className="space-y-6 bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold text-gray-900">Configure Your Asset</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Location Input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Location</h3>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="useCoordinates"
            checked={useCoordinates}
            onChange={(e) => setUseCoordinates(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="useCoordinates" className="text-sm text-gray-700">
            Use GPS coordinates instead of address
          </label>
        </div>

        {!useCoordinates ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 1600 Amphitheatre Parkway, Mountain View, CA"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleGeocodeAddress}
                disabled={geocoding}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {geocoding ? "Finding..." : "Find"}
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="e.g., 37.4224764"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g., -122.0842499"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Asset Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Asset Type</h3>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setAssetType("solar")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              assetType === "solar"
                ? "bg-yellow-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ☀️ Solar
          </button>
          <button
            type="button"
            onClick={() => setAssetType("wind")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              assetType === "wind"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            💨 Wind
          </button>
        </div>
      </div>

      {/* Asset Configuration */}
      {assetType === "solar" ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Solar System Configuration
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              DC Capacity (kW)
            </label>
            <input
              type="number"
              step="0.1"
              value={dcCapacity}
              onChange={(e) => setDcCapacity(e.target.value)}
              placeholder="e.g., 7"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Typical residential: 5-10 kW, Commercial: 50-500 kW
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              System Losses (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={systemLosses}
              onChange={(e) => setSystemLosses(e.target.value)}
              placeholder="e.g., 14"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Default 14% (includes inverter, wiring, soiling losses)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Wind Turbine Configuration
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rated Capacity (MW)
              </label>
              <input
                type="number"
                step="0.1"
                value={ratedCapacity}
                onChange={(e) => setRatedCapacity(e.target.value)}
                placeholder="e.g., 1.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hub Height (m)
              </label>
              <input
                type="number"
                step="1"
                value={hubHeight}
                onChange={(e) => setHubHeight(e.target.value)}
                placeholder="e.g., 100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cut-in Speed (m/s)
              </label>
              <input
                type="number"
                step="0.1"
                value={cutInSpeed}
                onChange={(e) => setCutInSpeed(e.target.value)}
                placeholder="e.g., 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rated Speed (m/s)
              </label>
              <input
                type="number"
                step="0.1"
                value={ratedSpeed}
                onChange={(e) => setRatedSpeed(e.target.value)}
                placeholder="e.g., 12"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cut-out Speed (m/s)
              </label>
              <input
                type="number"
                step="0.1"
                value={cutOutSpeed}
                onChange={(e) => setCutOutSpeed(e.target.value)}
                placeholder="e.g., 25"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
      >
        {loading ? "Generating Forecast..." : "Generate Forecast"}
      </button>
    </form>
  );
}
