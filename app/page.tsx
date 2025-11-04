"use client";

import { useState } from "react";
import AssetConfigForm from "@/components/AssetConfigForm";
import PowerForecastChart from "@/components/PowerForecastChart";
import LongTermAnalysis from "@/components/LongTermAnalysis";
import NationalEnergyMap from "@/components/NationalEnergyMap";
import {
  Asset,
  Location,
  PowerForecast,
  LongTermAnalysis as LongTermAnalysisType,
} from "@/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"forecast" | "longterm" | "map">(
    "forecast"
  );
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<PowerForecast | null>(null);
  const [longTermData, setLongTermData] = useState<LongTermAnalysisType | null>(
    null
  );
  const [error, setError] = useState("");
  const [mapType, setMapType] = useState<"solar" | "wind">("solar");

  const handleGenerateForecast = async (location: Location, asset: Asset) => {
    setLoading(true);
    setError("");
    setForecast(null);
    setLongTermData(null);

    try {
      // Generate 48-hour forecast
      const forecastResponse = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, asset }),
      });

      const forecastData = await forecastResponse.json();

      if (forecastData.success && forecastData.data) {
        setForecast(forecastData.data);
        setActiveTab("forecast");
      } else {
        setError(forecastData.error?.message || "Failed to generate forecast");
      }

      // Generate long-term analysis
      const longTermResponse = await fetch("/api/long-term", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, asset, years: 5 }),
      });

      const longTermResponseData = await longTermResponse.json();

      if (longTermResponseData.success && longTermResponseData.data) {
        setLongTermData(longTermResponseData.data);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ⚡ GridCast Renewables
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Predictive Analytics for U.S. Energy Independence
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                🌍 Supporting Clean Energy
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Configuration Form */}
          <div className="lg:col-span-1">
            <AssetConfigForm
              onSubmit={handleGenerateForecast}
              loading={loading}
            />

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm p-2 flex space-x-2">
              <button
                onClick={() => setActiveTab("forecast")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === "forecast"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                📊 48-Hour Forecast
              </button>
              <button
                onClick={() => setActiveTab("longterm")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === "longterm"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                📈 Long-Term Analysis
              </button>
              <button
                onClick={() => setActiveTab("map")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === "map"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🗺️ National Map
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "forecast" && (
              <div>
                {forecast ? (
                  <PowerForecastChart forecast={forecast} />
                ) : (
                  <div className="bg-white p-12 rounded-lg shadow-md text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No Forecast Data
                    </h3>
                    <p className="text-gray-500">
                      Configure your asset and location to generate a 48-hour
                      power forecast
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "longterm" && (
              <div>
                {longTermData ? (
                  <LongTermAnalysis analysis={longTermData} />
                ) : (
                  <div className="bg-white p-12 rounded-lg shadow-md text-center">
                    <div className="text-6xl mb-4">📈</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No Long-Term Data
                    </h3>
                    <p className="text-gray-500">
                      Configure your asset and location to generate a long-term
                      viability analysis
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "map" && (
              <NationalEnergyMap type={mapType} onTypeChange={setMapType} />
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            About GridCast Renewables
          </h3>
          <p className="text-gray-700 mb-4">
            GridCast Renewables is a sophisticated analytical tool that
            forecasts solar and wind energy generation potential for any
            location in the United States. This project directly addresses the
            national importance of transitioning to a clean energy economy,
            enhancing grid stability, and promoting U.S. energy independence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="font-semibold text-blue-900 mb-1">
                🔬 Scientific Models
              </div>
              <div className="text-blue-700">
                Implements validated formulas from NREL, NASA POWER, and
                peer-reviewed research
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="font-semibold text-green-900 mb-1">
                🌐 Authoritative Data
              </div>
              <div className="text-green-700">
                Uses Open-Meteo and NASA POWER APIs for high-quality weather and
                solar data
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="font-semibold text-purple-900 mb-1">
                🎯 Precision Forecasting
              </div>
              <div className="text-purple-700">
                Provides hourly forecasts and long-term viability analysis for
                investment decisions
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              GridCast Renewables - Supporting U.S. Energy Independence and
              Clean Energy Transition
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Built with Next.js, TypeScript, ECharts, and Mapbox GL JS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
