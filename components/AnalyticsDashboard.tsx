"use client";

import { useState } from "react";
import { PowerForecast, LongTermAnalysis } from "@/types";
import {
  calculateROI,
  calculateCarbonOffset,
  analyzePeakProduction,
  analyzeSeasonalTrends,
  generateProductionAlerts,
} from "@/lib/utils/analyticsUtils";

interface AnalyticsDashboardProps {
  forecast?: PowerForecast | null;
  longTerm?: LongTermAnalysis | null;
}

export default function AnalyticsDashboard({
  forecast,
  longTerm,
}: AnalyticsDashboardProps) {
  const [costPerKW, setCostPerKW] = useState(1500);
  const [electricityRate, setElectricityRate] = useState(0.13);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!longTerm && !forecast) {
    return null;
  }

  const roi = longTerm
    ? calculateROI(longTerm, costPerKW, electricityRate)
    : null;
  const carbon = longTerm ? calculateCarbonOffset(longTerm) : null;
  const peakAnalysis = forecast ? analyzePeakProduction(forecast) : null;
  const seasonalTrends = longTerm ? analyzeSeasonalTrends(longTerm) : null;
  const alerts = forecast
    ? generateProductionAlerts(forecast, longTerm || undefined)
    : [];

  return (
    <div id="analytics-dashboard" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <h2 className="text-2xl font-bold text-gray-900">
              Analytics Dashboard
            </h2>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors"
          >
            {showAdvanced ? "Hide" : "Show"} Settings
          </button>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Installation Cost ($/kW)
              </label>
              <input
                type="number"
                value={costPerKW}
                onChange={(e) =>
                  setCostPerKW(parseFloat(e.target.value) || 1500)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Typical: $1,500/kW (solar), $1,300/kW (wind)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Electricity Rate ($/kWh)
              </label>
              <input
                type="number"
                step="0.01"
                value={electricityRate}
                onChange={(e) =>
                  setElectricityRate(parseFloat(e.target.value) || 0.13)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                US average: $0.13/kWh
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🔔</span> Production Alerts
          </h3>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-l-4 ${
                  alert.type === "warning"
                    ? "bg-yellow-50 border-yellow-500"
                    : alert.type === "success"
                    ? "bg-green-50 border-green-500"
                    : "bg-blue-50 border-blue-500"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {alert.type === "warning"
                      ? "⚠️"
                      : alert.type === "success"
                      ? "✅"
                      : "ℹ️"}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {alert.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROI Analysis */}
      {roi && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>💰</span> Financial Analysis (ROI)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Total Investment</p>
              <p className="text-2xl font-bold text-blue-700">
                ${roi.totalInvestment.toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Annual Revenue</p>
              <p className="text-2xl font-bold text-green-700">
                ${roi.annualRevenue.toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Payback Period</p>
              <p className="text-2xl font-bold text-purple-700">
                {roi.paybackPeriod === Infinity || roi.paybackPeriod > 100
                  ? "N/A"
                  : `${roi.paybackPeriod.toFixed(1)} years`}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">20-Year ROI</p>
              <p className="text-2xl font-bold text-yellow-700">
                {roi.roi20Year.toFixed(1)}%
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Net Present Value</p>
              <p className="text-2xl font-bold text-emerald-700">
                ${Math.round(roi.netPresentValue).toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">
                Internal Rate of Return
              </p>
              <p className="text-2xl font-bold text-pink-700">
                {roi.internalRateOfReturn.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Carbon Offset */}
      {carbon && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🌱</span> Environmental Impact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Annual CO₂ Offset</p>
              <p className="text-2xl font-bold text-green-700">
                {carbon.annualCO2Offset > 0
                  ? `${(carbon.annualCO2Offset / 1000).toFixed(1)} tons`
                  : "0 tons"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Lifetime:{" "}
                {carbon.lifetimeCO2Offset > 0
                  ? `${(carbon.lifetimeCO2Offset / 1000).toFixed(0)} tons`
                  : "0 tons"}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">
                Equivalent Trees Planted
              </p>
              <p className="text-2xl font-bold text-green-700">
                {carbon.equivalentTrees > 0
                  ? `${carbon.equivalentTrees.toLocaleString()} 🌳`
                  : "0 🌳"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Per year (absorbing CO₂)
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Car Miles Avoided</p>
              <p className="text-2xl font-bold text-blue-700">
                {carbon.equivalentCarsMilesAvoided > 0
                  ? `${carbon.equivalentCarsMilesAvoided.toLocaleString()} mi`
                  : "0 mi"}
              </p>
              <p className="text-xs text-gray-500 mt-2">Annual equivalent</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Homes Powered</p>
              <p className="text-2xl font-bold text-purple-700">
                {carbon.equivalentHomesElectricity > 0
                  ? `${carbon.equivalentHomesElectricity.toFixed(1)} 🏠`
                  : "0 🏠"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Average US homes per year
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Peak Production Analysis */}
      {peakAnalysis && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>⚡</span> Peak Production Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Peak Power</p>
              <p className="text-2xl font-bold text-orange-700">
                {peakAnalysis.peakPower.toFixed(2)}{" "}
                {forecast?.asset.type === "solar" ? "kW" : "MW"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(peakAnalysis.peakHour).toLocaleTimeString()}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Average Power</p>
              <p className="text-2xl font-bold text-blue-700">
                {peakAnalysis.averagePower.toFixed(2)}{" "}
                {forecast?.asset.type === "solar" ? "kW" : "MW"}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Productive Hours</p>
              <p className="text-2xl font-bold text-green-700">
                {peakAnalysis.productiveHours}h
              </p>
              <p className="text-xs text-gray-500 mt-2">&gt;50% capacity</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Low Production</p>
              <p className="text-2xl font-bold text-red-700">
                {peakAnalysis.lowProductionHours}h
              </p>
              <p className="text-xs text-gray-500 mt-2">&lt;20% capacity</p>
            </div>
          </div>
        </div>
      )}

      {/* Seasonal Trends */}
      {seasonalTrends && seasonalTrends.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📅</span> Seasonal Trends
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {seasonalTrends.map((trend) => (
              <div
                key={trend.season}
                className={`p-4 rounded-xl ${
                  trend.season === "Summer"
                    ? "bg-gradient-to-br from-yellow-50 to-orange-100"
                    : trend.season === "Winter"
                    ? "bg-gradient-to-br from-blue-50 to-cyan-100"
                    : trend.season === "Spring"
                    ? "bg-gradient-to-br from-green-50 to-emerald-100"
                    : "bg-gradient-to-br from-orange-50 to-red-100"
                }`}
              >
                <p className="text-sm text-gray-600 mb-1">{trend.season}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trend.averageProduction.toFixed(0)}{" "}
                  {longTerm?.asset.type === "solar" ? "kWh" : "MWh"}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  CF: {trend.capacityFactor.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
