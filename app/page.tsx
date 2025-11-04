"use client";

import { useState, useEffect } from "react";
import AssetConfigForm from "@/components/AssetConfigForm";
import PowerForecastChart from "@/components/PowerForecastChart";
import LongTermAnalysis from "@/components/LongTermAnalysis";
import NationalEnergyMap from "@/components/NationalEnergyMap";
import ExportMenu from "@/components/ExportMenu";
import LocationHistory from "@/components/LocationHistory";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import AtmosphericResearchDashboard from "@/components/AtmosphericResearchDashboard";
import Link from "next/link";
import {
  Asset,
  Location,
  PowerForecast,
  LongTermAnalysis as LongTermAnalysisType,
} from "@/types";
import {
  saveLocationToHistory,
  getUserPreferences,
} from "@/lib/utils/storageUtils";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "forecast" | "longterm" | "map" | "analytics" | "research"
  >("forecast");
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<PowerForecast | null>(null);
  const [longTermData, setLongTermData] = useState<LongTermAnalysisType | null>(
    null
  );
  const [error, setError] = useState("");
  const [mapType, setMapType] = useState<"solar" | "wind">("solar");
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Load user preferences on mount
  useEffect(() => {
    const prefs = getUserPreferences();
    if (prefs.defaultAssetType) {
      setMapType(prefs.defaultAssetType);
    }
  }, []);

  const handleGenerateForecast = async (location: Location, asset: Asset) => {
    setLoading(true);
    setError("");
    setForecast(null);
    setLongTermData(null);
    setCurrentLocation(location); // Save the location for the map

    // Save to history
    const prefs = getUserPreferences();
    if (prefs.autoSaveHistory) {
      saveLocationToHistory(location, asset);
    }

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

  const handleSelectLocation = (location: Location, asset: Asset) => {
    handleGenerateForecast(location, asset);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  GridCast Renewables
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Predictive Analytics for U.S. Energy Independence
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5"
              >
                <span>📍</span>
                <span className="hidden sm:inline">History</span>
              </button>
              <ExportMenu
                forecast={forecast}
                longTerm={longTermData}
                activeTab={activeTab}
              />
              <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="hidden sm:inline">
                  Supporting Clean Energy
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Configuration Form */}
          <div className="lg:col-span-1 space-y-6">
            <AssetConfigForm
              onSubmit={handleGenerateForecast}
              loading={loading}
            />

            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-md">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-semibold">Error</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Location History */}
            {showHistory && (
              <LocationHistory onSelectLocation={handleSelectLocation} />
            )}

            {/* Batch Analysis Button */}
            <Link
              href="/batch-analysis"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <span>📊</span>
              <span>Multi-Location Batch Analysis</span>
            </Link>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Modern Tabs */}
            <div className="bg-white rounded-2xl shadow-xl p-1.5 border border-gray-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  onClick={() => setActiveTab("forecast")}
                  className={`py-3 px-2 sm:px-4 rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                    activeTab === "forecast"
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50 scale-105"
                      : "bg-transparent text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="hidden sm:inline">📊 </span>48-Hour
                </button>
                <button
                  onClick={() => setActiveTab("longterm")}
                  className={`py-3 px-2 sm:px-4 rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                    activeTab === "longterm"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/50 scale-105"
                      : "bg-transparent text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="hidden sm:inline">📈 </span>Long-Term
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`py-3 px-2 sm:px-4 rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                    activeTab === "analytics"
                      ? "bg-gradient-to-r from-orange-600 to-red-500 text-white shadow-lg shadow-orange-500/50 scale-105"
                      : "bg-transparent text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="hidden sm:inline">📊 </span>Analytics
                </button>
                <button
                  onClick={() => setActiveTab("research")}
                  className={`py-3 px-2 sm:px-4 rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                    activeTab === "research"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-500 text-white shadow-lg shadow-indigo-500/50 scale-105"
                      : "bg-transparent text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="hidden sm:inline">🔬 </span>Research
                </button>
                <button
                  onClick={() => setActiveTab("map")}
                  className={`py-3 px-2 sm:px-4 rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                    activeTab === "map"
                      ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/50 scale-105"
                      : "bg-transparent text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="hidden sm:inline">🗺️ </span>Map
                </button>
              </div>
            </div>

            {/* Tab Content with Animations */}
            <div className="min-h-[500px]">
              {activeTab === "forecast" && (
                <div className="animate-fadeIn">
                  {forecast ? (
                    <PowerForecastChart forecast={forecast} />
                  ) : (
                    <div className="bg-white p-12 sm:p-16 rounded-2xl shadow-xl border border-gray-200 text-center">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center">
                        <span className="text-5xl">📊</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                        No Forecast Data Yet
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
                        Configure your asset and location to generate a detailed
                        48-hour power forecast with hourly predictions
                      </p>
                      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        <span>Powered by Open-Meteo & NASA POWER APIs</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "longterm" && (
                <div className="animate-fadeIn">
                  {longTermData ? (
                    <LongTermAnalysis analysis={longTermData} />
                  ) : (
                    <div className="bg-white p-12 sm:p-16 rounded-2xl shadow-xl border border-gray-200 text-center">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-3xl flex items-center justify-center">
                        <span className="text-5xl">📈</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                        No Long-Term Data Yet
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
                        Configure your asset and location to generate a
                        comprehensive long-term viability analysis with
                        historical data
                      </p>
                      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span>5+ years of historical weather data</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="animate-fadeIn">
                  {forecast || longTermData ? (
                    <AnalyticsDashboard
                      forecast={forecast}
                      longTerm={longTermData}
                    />
                  ) : (
                    <div className="bg-white p-12 sm:p-16 rounded-2xl shadow-xl border border-gray-200 text-center">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-200 rounded-3xl flex items-center justify-center">
                        <span className="text-5xl">📊</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                        No Analytics Data Yet
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
                        Generate a forecast to see detailed analytics including
                        ROI calculations, carbon offset, and peak production
                        analysis
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "research" && (
                <div className="animate-fadeIn">
                  <AtmosphericResearchDashboard forecast={forecast} />
                </div>
              )}

              {activeTab === "map" && (
                <div className="animate-fadeIn">
                  <NationalEnergyMap
                    type={mapType}
                    onTypeChange={setMapType}
                    userLocation={currentLocation}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modern Info Cards */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            About GridCast Renewables
          </h3>
          <p className="text-gray-700 mb-6 text-sm sm:text-base leading-relaxed">
            GridCast Renewables is a sophisticated analytical tool that
            forecasts solar and wind energy generation potential for any
            location in the United States. This project directly addresses the
            national importance of transitioning to a clean energy economy,
            enhancing grid stability, and promoting U.S. energy independence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 p-5 sm:p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl sm:text-4xl mb-3">🔬</div>
              <div className="font-bold text-blue-900 mb-2 text-base sm:text-lg">
                Scientific Models
              </div>
              <div className="text-blue-700 text-xs sm:text-sm leading-relaxed">
                Implements validated formulas from NREL, NASA POWER, and
                peer-reviewed research
              </div>
            </div>
            <div className="group bg-gradient-to-br from-emerald-50 to-teal-100 p-5 sm:p-6 rounded-xl border border-emerald-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl sm:text-4xl mb-3">🌐</div>
              <div className="font-bold text-emerald-900 mb-2 text-base sm:text-lg">
                Authoritative Data
              </div>
              <div className="text-emerald-700 text-xs sm:text-sm leading-relaxed">
                Uses Open-Meteo and NASA POWER APIs for high-quality weather and
                solar data
              </div>
            </div>
            <div className="group bg-gradient-to-br from-purple-50 to-pink-100 p-5 sm:p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl sm:text-4xl mb-3">🎯</div>
              <div className="font-bold text-purple-900 mb-2 text-base sm:text-lg">
                Precision Forecasting
              </div>
              <div className="text-purple-700 text-xs sm:text-sm leading-relaxed">
                Provides hourly forecasts and long-term viability analysis for
                investment decisions
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="relative mt-16 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold">GridCast Renewables</h3>
            </div>
            <p className="text-sm text-gray-300 max-w-2xl mx-auto mb-6">
              Supporting U.S. Energy Independence and Clean Energy Transition
              through advanced predictive analytics and scientific modeling
            </p>
            <div className="pt-6 border-t border-white/10">
              <p className="text-xs text-gray-500">
                ©{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}{" "}
                GridCast Renewables. Built with ❤️ for a sustainable energy
                future.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
