"use client";

import { useState } from "react";
import { PowerForecast, LongTermAnalysis } from "@/types";
import {
  exportForecastToCSV,
  exportForecastToJSON,
  exportLongTermToCSV,
  exportLongTermToJSON,
  copyToClipboard,
  generateSummaryText,
  generateLongTermSummaryText,
  downloadMapScreenshot,
} from "@/lib/utils/exportUtils";

interface ExportMenuProps {
  forecast?: PowerForecast | null;
  longTerm?: LongTermAnalysis | null;
  activeTab: "forecast" | "longterm" | "map";
}

export default function ExportMenu({
  forecast,
  longTerm,
  activeTab,
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopyToClipboard = async () => {
    let text = "";
    
    if (activeTab === "forecast" && forecast) {
      text = generateSummaryText(forecast);
    } else if (activeTab === "longterm" && longTerm) {
      text = generateLongTermSummaryText(longTerm);
    }
    
    if (text) {
      const success = await copyToClipboard(text);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleDownloadScreenshot = async () => {
    setDownloading(true);
    try {
      const elementId = activeTab === "map" ? "national-energy-map" : "chart-container";
      const filename = `gridcast_${activeTab}_${Date.now()}.png`;
      await downloadMapScreenshot(elementId, filename);
    } catch (err) {
      console.error("Failed to download screenshot:", err);
      alert("Failed to capture screenshot. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const hasData = (activeTab === "forecast" && forecast) || 
                  (activeTab === "longterm" && longTerm);

  if (!hasData && activeTab !== "map") {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
      >
        <span>📥</span>
        <span className="hidden sm:inline">Export</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-emerald-600">
              <h3 className="text-white font-bold text-sm">Export Options</h3>
            </div>

            <div className="p-2 space-y-1">
              {/* CSV Export */}
              {activeTab === "forecast" && forecast && (
                <button
                  onClick={() => {
                    exportForecastToCSV(forecast);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-3 text-sm"
                >
                  <span className="text-lg">📊</span>
                  <div>
                    <div className="font-semibold text-gray-900">Export to CSV</div>
                    <div className="text-xs text-gray-500">Forecast data table</div>
                  </div>
                </button>
              )}

              {activeTab === "longterm" && longTerm && (
                <button
                  onClick={() => {
                    exportLongTermToCSV(longTerm);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-3 text-sm"
                >
                  <span className="text-lg">📊</span>
                  <div>
                    <div className="font-semibold text-gray-900">Export to CSV</div>
                    <div className="text-xs text-gray-500">Monthly averages</div>
                  </div>
                </button>
              )}

              {/* JSON Export */}
              {activeTab === "forecast" && forecast && (
                <button
                  onClick={() => {
                    exportForecastToJSON(forecast);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-3 text-sm"
                >
                  <span className="text-lg">📄</span>
                  <div>
                    <div className="font-semibold text-gray-900">Export to JSON</div>
                    <div className="text-xs text-gray-500">Raw data format</div>
                  </div>
                </button>
              )}

              {activeTab === "longterm" && longTerm && (
                <button
                  onClick={() => {
                    exportLongTermToJSON(longTerm);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-3 text-sm"
                >
                  <span className="text-lg">📄</span>
                  <div>
                    <div className="font-semibold text-gray-900">Export to JSON</div>
                    <div className="text-xs text-gray-500">Raw data format</div>
                  </div>
                </button>
              )}

              {/* Copy to Clipboard */}
              <button
                onClick={handleCopyToClipboard}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-3 text-sm"
              >
                <span className="text-lg">{copied ? "✅" : "📋"}</span>
                <div>
                  <div className="font-semibold text-gray-900">
                    {copied ? "Copied!" : "Copy Summary"}
                  </div>
                  <div className="text-xs text-gray-500">Text summary</div>
                </div>
              </button>

              {/* Screenshot */}
              <button
                onClick={handleDownloadScreenshot}
                disabled={downloading}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-3 text-sm disabled:opacity-50"
              >
                <span className="text-lg">📸</span>
                <div>
                  <div className="font-semibold text-gray-900">
                    {downloading ? "Capturing..." : "Save Screenshot"}
                  </div>
                  <div className="text-xs text-gray-500">PNG image</div>
                </div>
              </button>

              {/* Divider */}
              <div className="border-t border-gray-200 my-2" />

              {/* Print */}
              <button
                onClick={() => {
                  window.print();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-3 text-sm"
              >
                <span className="text-lg">🖨️</span>
                <div>
                  <div className="font-semibold text-gray-900">Print</div>
                  <div className="text-xs text-gray-500">Print current view</div>
                </div>
              </button>
            </div>

            <div className="p-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Export your analysis results
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

