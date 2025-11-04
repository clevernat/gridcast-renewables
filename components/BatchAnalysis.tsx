"use client";

import { useState, useRef } from "react";
import {
  BatchLocation,
  BatchAnalysisResult,
  BatchAnalysisProgress,
  Location,
  Asset,
} from "@/types";

interface BatchAnalysisProps {
  onClose: (() => void) | null;
  isFullPage?: boolean;
}

export default function BatchAnalysis({
  onClose,
  isFullPage = false,
}: BatchAnalysisProps) {
  const [locations, setLocations] = useState<BatchLocation[]>([]);
  const [results, setResults] = useState<BatchAnalysisResult[]>([]);
  const [progress, setProgress] = useState<BatchAnalysisProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const parsedLocations: BatchLocation[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const row: any = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });

      // Parse location data
      const location: Location = {
        latitude: parseFloat(row.latitude || row.lat),
        longitude: parseFloat(row.longitude || row.lon || row.long),
        address: row.address || row.name || `Location ${i}`,
      };

      // Parse asset data
      const assetType = (row.type || row.asset_type || "solar").toLowerCase();
      let asset: Asset;

      if (assetType === "solar") {
        asset = {
          type: "solar",
          dcCapacity: parseFloat(row.dc_capacity || row.capacity || "7"),
          systemLosses: parseFloat(row.system_losses || row.losses || "14"),
        };
      } else {
        asset = {
          type: "wind",
          ratedCapacity: parseFloat(
            row.rated_capacity || row.capacity || "1.5"
          ),
          hubHeight: parseFloat(row.hub_height || row.height || "80"),
          cutInSpeed: parseFloat(row.cut_in_speed || "3"),
          ratedSpeed: parseFloat(row.rated_speed || "12"),
          cutOutSpeed: parseFloat(row.cut_out_speed || "25"),
        };
      }

      parsedLocations.push({
        id: `loc_${i}`,
        name: row.name || row.address || `Location ${i}`,
        location,
        asset,
      });
    }

    setLocations(parsedLocations);
  };

  const processBatch = async () => {
    if (locations.length === 0) return;

    setIsProcessing(true);
    setResults([]);
    setProgress({
      total: locations.length,
      completed: 0,
      failed: 0,
      percentage: 0,
    });

    const batchResults: BatchAnalysisResult[] = [];

    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];

      setProgress((prev) => ({
        ...prev!,
        currentLocation: loc.name,
      }));

      try {
        // Fetch forecast
        const forecastRes = await fetch("/api/forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: loc.location,
            asset: loc.asset,
          }),
        });

        const forecastData = await forecastRes.json();

        if (forecastData.success) {
          const totalEnergy = forecastData.data.outputs.reduce(
            (sum: number, o: any) => sum + o.power,
            0
          );
          const avgCapacity =
            forecastData.data.outputs.reduce(
              (sum: number, o: any) => sum + (o.capacity || 0),
              0
            ) / forecastData.data.outputs.length;

          batchResults.push({
            location: loc,
            forecast: forecastData.data,
            score: totalEnergy * avgCapacity, // Simple scoring
          });

          setProgress((prev) => ({
            ...prev!,
            completed: prev!.completed + 1,
            percentage: ((prev!.completed + 1) / prev!.total) * 100,
          }));
        } else {
          throw new Error(
            forecastData.error?.message || "Failed to fetch forecast"
          );
        }
      } catch (error: any) {
        console.error(`Error processing ${loc.name}:`, error);
        batchResults.push({
          location: loc,
          error: error.message,
        });

        setProgress((prev) => ({
          ...prev!,
          failed: prev!.failed + 1,
          completed: prev!.completed + 1,
          percentage: ((prev!.completed + 1) / prev!.total) * 100,
        }));
      }

      // Small delay to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Rank results by score
    batchResults.sort((a, b) => (b.score || 0) - (a.score || 0));
    batchResults.forEach((result, idx) => {
      result.rank = idx + 1;
    });

    setResults(batchResults);
    setIsProcessing(false);
  };

  const downloadResults = () => {
    const csv = [
      "Rank,Name,Latitude,Longitude,Total Energy,Avg Capacity %,Score,Status",
      ...results.map((r) => {
        const totalEnergy = r.forecast
          ? r.forecast.outputs.reduce((sum, o) => sum + o.power, 0).toFixed(2)
          : "N/A";
        const avgCapacity = r.forecast
          ? (
              r.forecast.outputs.reduce(
                (sum, o) => sum + (o.capacity || 0),
                0
              ) / r.forecast.outputs.length
            ).toFixed(1)
          : "N/A";

        return [
          r.rank || "N/A",
          r.location.name,
          r.location.location.latitude,
          r.location.location.longitude,
          totalEnergy,
          avgCapacity,
          r.score?.toFixed(2) || "N/A",
          r.error ? "Failed" : "Success",
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch_analysis_results_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const content = (
    <div className="bg-white rounded-2xl shadow-2xl w-full">
      {!isFullPage && (
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              📊 Multi-Location Batch Analysis
            </h2>
            <button
              onClick={onClose || undefined}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              ✕
            </button>
          </div>
          <p className="text-blue-100 mt-2">
            Upload a CSV file with multiple locations for comparative analysis
          </p>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* CSV Upload */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-xl border border-purple-200">
          <h3 className="font-bold text-gray-900 mb-3">📁 Upload CSV File</h3>
          <p className="text-sm text-gray-600 mb-4">
            CSV should include columns: name, latitude, longitude, type
            (solar/wind), capacity
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none p-2"
          />
          {locations.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Loaded {locations.length} locations
            </p>
          )}
        </div>

        {/* Sample CSV Template */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-2">
            📋 Sample CSV Format:
          </h4>
          <pre className="text-xs bg-white p-3 rounded border border-gray-300 overflow-x-auto">
            {`name,latitude,longitude,type,capacity
Phoenix Solar,33.4484,-112.0740,solar,10
Texas Wind,32.4707,-100.4065,wind,2.5
California Solar,37.7749,-122.4194,solar,7`}
          </pre>
        </div>

        {/* Process Button */}
        {locations.length > 0 && !isProcessing && results.length === 0 && (
          <button
            onClick={processBatch}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
          >
            🚀 Process {locations.length} Locations
          </button>
        )}

        {/* Progress Bar */}
        {progress && isProcessing && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-6 rounded-xl border border-yellow-200">
            <h3 className="font-bold text-gray-900 mb-3">⏳ Processing...</h3>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Progress:</span>{" "}
                <strong>
                  {progress.completed}/{progress.total}
                </strong>
              </div>
              <div>
                <span className="text-gray-600">Failed:</span>{" "}
                <strong className="text-red-600">{progress.failed}</strong>
              </div>
              <div>
                <span className="text-gray-600">Current:</span>{" "}
                <strong className="text-blue-600">
                  {progress.currentLocation}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg">
                📈 Analysis Results
              </h3>
              <button
                onClick={downloadResults}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
              >
                📥 Download CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <th className="p-3 text-left">Rank</th>
                    <th className="p-3 text-left">Location</th>
                    <th className="p-3 text-left">Coordinates</th>
                    <th className="p-3 text-right">Total Energy</th>
                    <th className="p-3 text-right">Avg Capacity</th>
                    <th className="p-3 text-right">Score</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr
                      key={idx}
                      className={`border-b ${
                        idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-blue-50 transition-colors`}
                    >
                      <td className="p-3 font-bold text-blue-600">
                        #{result.rank}
                      </td>
                      <td className="p-3">{result.location.name}</td>
                      <td className="p-3 text-xs text-gray-600">
                        {result.location.location.latitude.toFixed(2)}°,{" "}
                        {result.location.location.longitude.toFixed(2)}°
                      </td>
                      <td className="p-3 text-right">
                        {result.forecast
                          ? `${result.forecast.outputs
                              .reduce((sum, o) => sum + o.power, 0)
                              .toFixed(2)} ${
                              result.forecast.asset.type === "solar"
                                ? "kWh"
                                : "MWh"
                            }`
                          : "N/A"}
                      </td>
                      <td className="p-3 text-right">
                        {result.forecast
                          ? `${(
                              result.forecast.outputs.reduce(
                                (sum, o) => sum + (o.capacity || 0),
                                0
                              ) / result.forecast.outputs.length
                            ).toFixed(1)}%`
                          : "N/A"}
                      </td>
                      <td className="p-3 text-right font-semibold">
                        {result.score?.toFixed(2) || "N/A"}
                      </td>
                      <td className="p-3 text-center">
                        {result.error ? (
                          <span className="text-red-600 font-semibold">
                            ❌ Failed
                          </span>
                        ) : (
                          <span className="text-green-600 font-semibold">
                            ✓ Success
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isFullPage) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {content}
      </div>
    </div>
  );
}
