"use client";

import { useState, useEffect } from "react";
import {
  PowerForecast,
  AtmosphericResearchData,
  AtmosphericStatistics,
  TrendAnalysis,
  AnomalyDetection,
} from "@/types";
import { generateAtmosphericResearchData } from "@/lib/utils/atmosphericResearch";

interface AtmosphericResearchDashboardProps {
  forecast?: PowerForecast | null;
}

export default function AtmosphericResearchDashboard({
  forecast,
}: AtmosphericResearchDashboardProps) {
  const [researchData, setResearchData] = useState<AtmosphericResearchData | null>(null);
  const [selectedVariable, setSelectedVariable] = useState<string>("temperature");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (forecast && forecast.meteorologicalData.length > 0) {
      setLoading(true);
      try {
        const data = generateAtmosphericResearchData(
          forecast.location,
          forecast.meteorologicalData
        );
        setResearchData(data);
      } catch (error) {
        console.error("Error generating research data:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [forecast]);

  if (!forecast) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl shadow-xl border border-blue-200 text-center">
        <div className="text-6xl mb-4">🔬</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Atmospheric Science Research Dashboard
        </h3>
        <p className="text-gray-600 mb-4">
          Generate a forecast to access comprehensive atmospheric research tools
        </p>
        <div className="bg-white p-4 rounded-xl text-left max-w-2xl mx-auto">
          <h4 className="font-semibold text-gray-900 mb-2">Research Capabilities:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Statistical analysis (mean, median, std dev, percentiles)</li>
            <li>✓ Correlation matrices with significance testing</li>
            <li>✓ Trend analysis with linear regression</li>
            <li>✓ Anomaly detection using z-score methods</li>
            <li>✓ Data quality assessment and validation</li>
            <li>✓ 40+ atmospheric variables tracked</li>
          </ul>
        </div>
      </div>
    );
  }

  if (loading || !researchData) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center">
        <div className="animate-spin text-6xl mb-4">⚛️</div>
        <p className="text-gray-600">Analyzing atmospheric data...</p>
      </div>
    );
  }

  const stats = researchData.statistics[selectedVariable];
  const trend = researchData.trends?.find((t) => t.variable === selectedVariable);
  const anomalies = researchData.anomalies?.filter((a) => a.variable === selectedVariable) || [];

  return (
    <div className="space-y-6">
      {/* Data Quality Overview */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl shadow-xl border border-green-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📊</span> Data Quality Assessment
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Quality Score</p>
            <p className="text-3xl font-bold text-green-700">
              {researchData.dataQuality.qualityScore.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Complete Records</p>
            <p className="text-3xl font-bold text-blue-700">
              {researchData.dataQuality.completeRecords}/{researchData.dataQuality.totalRecords}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Missing Data</p>
            <p className="text-3xl font-bold text-orange-700">
              {researchData.dataQuality.missingDataPercentage.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Outliers Detected</p>
            <p className="text-3xl font-bold text-red-700">
              {researchData.dataQuality.outlierCount}
            </p>
          </div>
        </div>
      </div>

      {/* Variable Selector */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Variable for Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.keys(researchData.statistics).map((varName) => (
            <button
              key={varName}
              onClick={() => setSelectedVariable(varName)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedVariable === varName
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {varName.replace(/([A-Z])/g, " $1").trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Statistical Summary */}
      {stats && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-2xl shadow-xl border border-purple-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📈</span> Statistical Summary: {selectedVariable}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Mean</p>
              <p className="text-2xl font-bold text-purple-700">{stats.mean.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Median</p>
              <p className="text-2xl font-bold text-purple-700">{stats.median.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Std Dev</p>
              <p className="text-2xl font-bold text-purple-700">{stats.stdDev.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Range</p>
              <p className="text-2xl font-bold text-purple-700">
                {stats.min.toFixed(1)} - {stats.max.toFixed(1)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">25th Percentile</p>
              <p className="text-2xl font-bold text-indigo-700">{stats.percentile25.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">75th Percentile</p>
              <p className="text-2xl font-bold text-indigo-700">{stats.percentile75.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">95th Percentile</p>
              <p className="text-2xl font-bold text-indigo-700">{stats.percentile95.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Data Points</p>
              <p className="text-2xl font-bold text-indigo-700">
                {stats.count} / {stats.count + stats.missingCount}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trend Analysis */}
      {trend && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-2xl shadow-xl border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📉</span> Trend Analysis: {selectedVariable}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Trend Direction</p>
              <p className="text-2xl font-bold text-blue-700 capitalize">
                {trend.trend === "increasing" ? "↗️ " : trend.trend === "decreasing" ? "↘️ " : "→ "}
                {trend.trend}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Slope</p>
              <p className="text-2xl font-bold text-blue-700">{trend.slope.toExponential(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">R² (Fit Quality)</p>
              <p className="text-2xl font-bold text-blue-700">{trend.rSquared.toFixed(3)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">P-Value</p>
              <p className="text-2xl font-bold text-blue-700">
                {trend.pValue < 0.001 ? "<0.001" : trend.pValue.toFixed(3)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {trend.pValue < 0.05 ? "Statistically significant" : "Not significant"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Anomaly Detection */}
      {anomalies.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-orange-100 p-6 rounded-2xl shadow-xl border border-red-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>⚠️</span> Anomalies Detected: {selectedVariable} ({anomalies.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {anomalies.slice(0, 10).map((anomaly, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  anomaly.severity === "extreme"
                    ? "bg-red-100 border border-red-300"
                    : anomaly.severity === "high"
                    ? "bg-orange-100 border border-orange-300"
                    : "bg-yellow-100 border border-yellow-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">
                    {new Date(anomaly.timestamp).toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-red-700 uppercase">
                    {anomaly.severity}
                  </span>
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  Value: <strong>{anomaly.value.toFixed(2)}</strong> (Expected:{" "}
                  {anomaly.expectedValue.toFixed(2)}, Deviation: {anomaly.deviation.toFixed(1)}σ)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correlation Matrix */}
      {researchData.correlations && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 p-6 rounded-2xl shadow-xl border border-indigo-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🔗</span> Correlation Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left font-semibold">Variable</th>
                  {researchData.correlations.variables.map((v) => (
                    <th key={v} className="p-2 text-center font-semibold">
                      {v.substring(0, 8)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {researchData.correlations.variables.map((rowVar, i) => (
                  <tr key={rowVar} className="border-t border-gray-200">
                    <td className="p-2 font-medium">{rowVar}</td>
                    {researchData.correlations!.matrix[i].map((corr, j) => (
                      <td
                        key={j}
                        className="p-2 text-center font-mono"
                        style={{
                          backgroundColor:
                            corr > 0.7
                              ? "rgba(34, 197, 94, 0.3)"
                              : corr < -0.7
                              ? "rgba(239, 68, 68, 0.3)"
                              : "white",
                        }}
                      >
                        {corr.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Green: Strong positive correlation (r &gt; 0.7) | Red: Strong negative correlation (r
            &lt; -0.7)
          </p>
        </div>
      )}
    </div>
  );
}

