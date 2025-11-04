import { PowerForecast, LongTermAnalysis, PowerOutput } from "@/types";

/**
 * Export forecast data to CSV format
 */
export function exportForecastToCSV(forecast: PowerForecast): void {
  const headers = [
    "Timestamp",
    "Power Output (kW/MW)",
    "Temperature (°C)",
    "Solar Irradiance (W/m²)",
    "Wind Speed (m/s)",
    "Cloud Cover (%)",
    "Precipitation (mm)",
  ];

  const rows = forecast.outputs.map((output, index) => {
    const meteo = forecast.meteorologicalData[index];
    return [
      new Date(output.timestamp).toLocaleString(),
      output.power.toFixed(2),
      meteo?.temperature?.toFixed(1) || "N/A",
      meteo?.solarIrradiance?.toFixed(1) || "N/A",
      meteo?.windSpeed?.toFixed(1) || "N/A",
      meteo?.cloudCover?.toFixed(0) || "N/A",
      meteo?.precipitation?.toFixed(2) || "N/A",
    ];
  });

  const csvContent = [
    `# ${forecast.asset.type.toUpperCase()} Power Forecast`,
    `# Location: ${forecast.location.address || `${forecast.location.latitude}, ${forecast.location.longitude}`}`,
    `# Generated: ${new Date().toLocaleString()}`,
    "",
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  downloadFile(csvContent, `forecast_${forecast.asset.type}_${Date.now()}.csv`, "text/csv");
}

/**
 * Export long-term analysis to CSV format
 */
export function exportLongTermToCSV(analysis: LongTermAnalysis): void {
  const headers = [
    "Month",
    "Average Production (kWh/MWh)",
    "Capacity Factor (%)",
    "Days Analyzed",
  ];

  const rows = analysis.monthlyAverages.map((month) => [
    month.month,
    month.averageProduction.toFixed(2),
    month.capacityFactor.toFixed(2),
    month.daysAnalyzed,
  ]);

  const csvContent = [
    `# Long-Term Analysis (${analysis.yearsAnalyzed} years)`,
    `# Location: ${analysis.location.address || `${analysis.location.latitude}, ${analysis.location.longitude}`}`,
    `# Asset Type: ${analysis.asset.type.toUpperCase()}`,
    `# Generated: ${new Date().toLocaleString()}`,
    "",
    `# Summary Statistics`,
    `# Total Annual Production: ${analysis.totalAnnualProduction.toFixed(2)} ${analysis.asset.type === "solar" ? "kWh" : "MWh"}`,
    `# Average Capacity Factor: ${analysis.averageCapacityFactor.toFixed(2)}%`,
    "",
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  downloadFile(
    csvContent,
    `long_term_${analysis.asset.type}_${Date.now()}.csv`,
    "text/csv"
  );
}

/**
 * Helper function to trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export forecast data to JSON format
 */
export function exportForecastToJSON(forecast: PowerForecast): void {
  const jsonContent = JSON.stringify(forecast, null, 2);
  downloadFile(
    jsonContent,
    `forecast_${forecast.asset.type}_${Date.now()}.json`,
    "application/json"
  );
}

/**
 * Export long-term analysis to JSON format
 */
export function exportLongTermToJSON(analysis: LongTermAnalysis): void {
  const jsonContent = JSON.stringify(analysis, null, 2);
  downloadFile(
    jsonContent,
    `long_term_${analysis.asset.type}_${Date.now()}.json`,
    "application/json"
  );
}

/**
 * Copy data to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    return false;
  }
}

/**
 * Generate summary text for sharing
 */
export function generateSummaryText(forecast: PowerForecast): string {
  const totalProduction = forecast.outputs.reduce((sum, output) => sum + output.power, 0);
  const avgProduction = totalProduction / forecast.outputs.length;
  const maxProduction = Math.max(...forecast.outputs.map((o) => o.power));
  const minProduction = Math.min(...forecast.outputs.map((o) => o.power));

  return `
GridCast Renewables - ${forecast.asset.type.toUpperCase()} Forecast Summary

Location: ${forecast.location.address || `${forecast.location.latitude}, ${forecast.location.longitude}`}
Generated: ${new Date().toLocaleString()}

48-Hour Forecast Results:
- Average Production: ${avgProduction.toFixed(2)} ${forecast.asset.type === "solar" ? "kW" : "MW"}
- Peak Production: ${maxProduction.toFixed(2)} ${forecast.asset.type === "solar" ? "kW" : "MW"}
- Minimum Production: ${minProduction.toFixed(2)} ${forecast.asset.type === "solar" ? "kW" : "MW"}
- Total Energy: ${totalProduction.toFixed(2)} ${forecast.asset.type === "solar" ? "kWh" : "MWh"}

Asset Configuration:
${forecast.asset.type === "solar" 
  ? `- DC Capacity: ${forecast.asset.dcCapacity} kW
- System Losses: ${forecast.asset.systemLosses}%`
  : `- Rated Capacity: ${forecast.asset.ratedCapacity} MW
- Hub Height: ${forecast.asset.hubHeight} m
- Cut-in Speed: ${forecast.asset.cutInSpeed} m/s
- Rated Speed: ${forecast.asset.ratedSpeed} m/s
- Cut-out Speed: ${forecast.asset.cutOutSpeed} m/s`}

Generated by GridCast Renewables
https://gridcast-renewables.vercel.app
  `.trim();
}

/**
 * Generate long-term summary text
 */
export function generateLongTermSummaryText(analysis: LongTermAnalysis): string {
  const bestMonth = analysis.monthlyAverages.reduce((best, month) =>
    month.averageProduction > best.averageProduction ? month : best
  );
  const worstMonth = analysis.monthlyAverages.reduce((worst, month) =>
    month.averageProduction < worst.averageProduction ? month : worst
  );

  return `
GridCast Renewables - Long-Term Analysis Summary

Location: ${analysis.location.address || `${analysis.location.latitude}, ${analysis.location.longitude}`}
Analysis Period: ${analysis.yearsAnalyzed} years
Generated: ${new Date().toLocaleString()}

Annual Performance:
- Total Annual Production: ${analysis.totalAnnualProduction.toFixed(2)} ${analysis.asset.type === "solar" ? "kWh" : "MWh"}
- Average Capacity Factor: ${analysis.averageCapacityFactor.toFixed(2)}%

Seasonal Insights:
- Best Month: ${bestMonth.month} (${bestMonth.averageProduction.toFixed(2)} ${analysis.asset.type === "solar" ? "kWh" : "MWh"})
- Worst Month: ${worstMonth.month} (${worstMonth.averageProduction.toFixed(2)} ${analysis.asset.type === "solar" ? "kWh" : "MWh"})

Asset Configuration:
${analysis.asset.type === "solar"
  ? `- DC Capacity: ${analysis.asset.dcCapacity} kW
- System Losses: ${analysis.asset.systemLosses}%`
  : `- Rated Capacity: ${analysis.asset.ratedCapacity} MW
- Hub Height: ${analysis.asset.hubHeight} m`}

Generated by GridCast Renewables
https://gridcast-renewables.vercel.app
  `.trim();
}

/**
 * Download map screenshot (requires html2canvas library)
 */
export async function downloadMapScreenshot(elementId: string, filename: string): Promise<void> {
  try {
    // Dynamic import to avoid SSR issues
    const html2canvas = (await import("html2canvas")).default;
    const element = document.getElementById(elementId);
    
    if (!element) {
      throw new Error("Element not found");
    }

    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2, // Higher quality
      logging: false,
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    });
  } catch (err) {
    console.error("Failed to capture screenshot:", err);
    throw err;
  }
}

