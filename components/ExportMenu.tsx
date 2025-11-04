"use client";

import { useState } from "react";
import {
  PowerForecast,
  LongTermAnalysis,
  AtmosphericResearchData,
} from "@/types";
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
import {
  generateAtmosphericResearchPDF,
  generateQuickSummaryPDF,
} from "@/lib/utils/pdfExport";
import { generateAtmosphericResearchDOCX } from "@/lib/utils/docxExport";
import { generateAtmosphericResearchData } from "@/lib/utils/atmosphericResearch";
import {
  exportAllImagesAsZip,
  exportMapAnimationAsZip,
} from "@/lib/utils/imageExport";

interface ExportMenuProps {
  forecast?: PowerForecast | null;
  longTerm?: LongTermAnalysis | null;
  activeTab: "forecast" | "longterm" | "map" | "analytics" | "research";
}

export default function ExportMenu({
  forecast,
  longTerm,
  activeTab,
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");

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

  const handleDownloadBatchTemplate = () => {
    const templateCSV = `name,latitude,longitude,type,capacity
Phoenix Solar,33.4484,-112.0740,solar,10
Texas Wind,32.4707,-100.4065,wind,2.5
California Solar,37.7749,-122.4194,solar,7
Denver Solar,39.7392,-104.9903,solar,12
Seattle Solar,47.6062,-122.3321,solar,8
Miami Solar,25.7617,-80.1918,solar,20
Chicago Wind,41.8781,-87.6298,wind,3.0
Portland Solar,45.5152,-122.6784,solar,9
Boston Solar,42.3601,-71.0589,solar,11
Atlanta Solar,33.7490,-84.3880,solar,15`;

    const blob = new Blob([templateCSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch_analysis_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleDownloadScreenshot = async () => {
    setDownloading(true);
    try {
      const elementId =
        activeTab === "map" ? "national-energy-map" : "chart-container";
      const filename = `gridcast_${activeTab}_${Date.now()}.png`;
      await downloadMapScreenshot(elementId, filename);
    } catch (err) {
      console.error("Failed to download screenshot:", err);
      alert("Failed to capture screenshot. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleExportAllImages = async () => {
    setDownloading(true);
    setProgressMessage("Starting export...");
    try {
      await exportAllImagesAsZip(
        forecast,
        longTerm,
        activeTab,
        setProgressMessage
      );
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to export images:", err);
      alert(
        `Failed to export images as ZIP: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setDownloading(false);
      setProgressMessage("");
    }
  };

  const handleExportMapAnimation = async () => {
    setDownloading(true);
    setProgressMessage("Starting animation export...");
    try {
      await exportMapAnimationAsZip(setProgressMessage);
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to export map animation:", err);
      alert(
        `Failed to export map animation: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setDownloading(false);
      setProgressMessage("");
    }
  };

  const handleGeneratePDF = async () => {
    if (!forecast) return;

    setDownloading(true);
    try {
      if (longTerm) {
        // Generate comprehensive research PDF
        const researchData =
          forecast.meteorologicalData.length > 0
            ? generateAtmosphericResearchData(
                forecast.location,
                forecast.meteorologicalData
              )
            : null;

        await generateAtmosphericResearchPDF(
          forecast,
          longTerm ?? null,
          researchData
        );
      } else {
        // Generate quick summary PDF
        await generateQuickSummaryPDF(forecast);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
      setIsOpen(false);
    }
  };

  const handleGenerateDOCX = async () => {
    if (!forecast) return;

    setDownloading(true);
    try {
      const researchData =
        forecast.meteorologicalData.length > 0
          ? generateAtmosphericResearchData(
              forecast.location,
              forecast.meteorologicalData
            )
          : null;

      await generateAtmosphericResearchDOCX(
        forecast,
        longTerm ?? null,
        researchData
      );
      // Success - close the menu
      setIsOpen(false);
    } catch (error) {
      console.error("Error generating DOCX:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(
        `Failed to generate Word document.\n\n${errorMessage}\n\nPlease try again.`
      );
    } finally {
      setDownloading(false);
    }
  };

  const hasData =
    (activeTab === "forecast" && forecast) ||
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
              {/* PDF Export */}
              {forecast && (
                <button
                  onClick={handleGeneratePDF}
                  disabled={downloading}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-3 text-sm disabled:opacity-50"
                >
                  <span className="text-lg">📄</span>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {downloading ? "Generating..." : "Generate PDF Report"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Comprehensive research report
                    </div>
                  </div>
                </button>
              )}

              {/* DOCX Export */}
              {forecast && (
                <button
                  onClick={handleGenerateDOCX}
                  disabled={downloading}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-3 text-sm disabled:opacity-50"
                >
                  <span className="text-lg">📝</span>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {downloading ? "Generating..." : "Generate Word Document"}
                    </div>
                    <div className="text-xs text-gray-500">
                      DOCX with charts & figures
                    </div>
                  </div>
                </button>
              )}

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
                    <div className="font-semibold text-gray-900">
                      Export to CSV
                    </div>
                    <div className="text-xs text-gray-500">
                      Forecast data table
                    </div>
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
                    <div className="font-semibold text-gray-900">
                      Export to CSV
                    </div>
                    <div className="text-xs text-gray-500">
                      Monthly averages
                    </div>
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
                    <div className="font-semibold text-gray-900">
                      Export to JSON
                    </div>
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
                    <div className="font-semibold text-gray-900">
                      Export to JSON
                    </div>
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

              {/* Export All Images as ZIP */}
              <button
                onClick={handleExportAllImages}
                disabled={downloading}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-3 text-sm disabled:opacity-50"
              >
                <span className="text-lg">🗜️</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {downloading ? "Exporting..." : "Export All Images (ZIP)"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {downloading && progressMessage
                      ? progressMessage
                      : "Solar + Wind maps, charts, animations & GIFs"}
                  </div>
                </div>
              </button>

              {/* Export Map Animation */}
              {activeTab === "map" && (
                <button
                  onClick={handleExportMapAnimation}
                  disabled={downloading}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-3 text-sm disabled:opacity-50"
                >
                  <span className="text-lg">🎬</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {downloading
                        ? "Capturing..."
                        : "Export Map Animation (ZIP)"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {downloading && progressMessage
                        ? progressMessage
                        : "24 frames + animated GIF"}
                    </div>
                  </div>
                </button>
              )}

              {/* Divider */}
              <div className="border-t border-gray-200 my-2" />

              {/* Batch Analysis Template */}
              <button
                onClick={handleDownloadBatchTemplate}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-3 text-sm"
              >
                <span className="text-lg">📊</span>
                <div>
                  <div className="font-semibold text-gray-900">
                    Batch Analysis Template
                  </div>
                  <div className="text-xs text-gray-500">
                    CSV template for multi-location
                  </div>
                </div>
              </button>

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
                  <div className="text-xs text-gray-500">
                    Print current view
                  </div>
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
