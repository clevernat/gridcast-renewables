import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  PowerForecast,
  LongTermAnalysis,
  AtmosphericResearchData,
  Location,
} from "@/types";

/**
 * PDF Export Utilities for Atmospheric Science Research
 *
 * Professional-grade PDF reports for EB2-NIW green card applications
 * Demonstrates research capabilities and scientific rigor
 */

/**
 * Generate comprehensive atmospheric research PDF report
 */
export async function generateAtmosphericResearchPDF(
  forecast: PowerForecast,
  longTerm: LongTermAnalysis | null,
  researchData: AtmosphericResearchData | null
): Promise<void> {
  const doc = new jsPDF();
  let yPos = 20;

  // Title Page
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Atmospheric Science Research Report", 105, yPos, {
    align: "center",
  });

  yPos += 15;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("GridCast Renewables - Atmospheric Analysis Platform", 105, yPos, {
    align: "center",
  });

  yPos += 10;
  doc.setFontSize(10);
  const timestamp = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
  doc.text(`Generated: ${timestamp}`, 105, yPos, { align: "center" });

  yPos += 20;

  // Location Information
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Location Information", 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Address: ${forecast.location.address || "N/A"}`, 20, yPos);
  yPos += 6;
  doc.text(
    `Coordinates: ${forecast.location.latitude.toFixed(
      4
    )}°N, ${forecast.location.longitude.toFixed(4)}°W`,
    20,
    yPos
  );
  yPos += 6;
  doc.text(`Asset Type: ${forecast.asset.type.toUpperCase()}`, 20, yPos);
  yPos += 12;

  // Data Quality Assessment
  if (researchData) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Data Quality Assessment", 20, yPos);
    yPos += 8;

    const qualityData = [
      ["Metric", "Value"],
      ["Quality Score", `${researchData.dataQuality.qualityScore.toFixed(1)}%`],
      ["Total Records", researchData.dataQuality.totalRecords.toString()],
      ["Complete Records", researchData.dataQuality.completeRecords.toString()],
      [
        "Missing Data",
        `${researchData.dataQuality.missingDataPercentage.toFixed(1)}%`,
      ],
      ["Outliers Detected", researchData.dataQuality.outlierCount.toString()],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [qualityData[0]],
      body: qualityData.slice(1),
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 12;
  }

  // Statistical Summary
  if (researchData && yPos < 250) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Statistical Summary - Key Variables", 20, yPos);
    yPos += 8;

    const statsData: any[] = [
      ["Variable", "Mean", "Std Dev", "Min", "Max", "Data Points"],
    ];

    const keyVars = [
      "temperature",
      "surfacePressure",
      "relativeHumidity",
      "windSpeed",
      "solarIrradiance",
    ];
    keyVars.forEach((varName) => {
      const stats = researchData.statistics[varName];
      if (stats) {
        statsData.push([
          varName,
          stats.mean.toFixed(2),
          stats.stdDev.toFixed(2),
          stats.min.toFixed(2),
          stats.max.toFixed(2),
          stats.count.toString(),
        ]);
      }
    });

    autoTable(doc, {
      startY: yPos,
      head: [statsData[0]],
      body: statsData.slice(1),
      theme: "striped",
      headStyles: { fillColor: [139, 92, 246] },
      styles: { fontSize: 8 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 12;
  }

  // New Page for Correlation Matrix
  if (researchData?.correlations) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Correlation Matrix", 20, yPos);
    yPos += 8;

    const corrData: any[] = [
      ["Variable", ...researchData.correlations.variables],
    ];

    researchData.correlations.variables.forEach((rowVar, i) => {
      const row = [rowVar];
      researchData.correlations!.matrix[i].forEach((corr) => {
        row.push(corr.toFixed(2));
      });
      corrData.push(row);
    });

    autoTable(doc, {
      startY: yPos,
      head: [corrData[0]],
      body: corrData.slice(1),
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 7 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Note: Values range from -1 (perfect negative correlation) to +1 (perfect positive correlation)",
      20,
      yPos
    );
  }

  // Trend Analysis
  if (researchData?.trends && researchData.trends.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Trend Analysis", 20, yPos);
    yPos += 8;

    const trendData: any[] = [
      ["Variable", "Trend", "Slope", "R²", "P-Value", "Significance"],
    ];

    researchData.trends.forEach((trend) => {
      trendData.push([
        trend.variable,
        trend.trend,
        trend.slope.toExponential(2),
        trend.rSquared.toFixed(3),
        trend.pValue < 0.001 ? "<0.001" : trend.pValue.toFixed(3),
        trend.pValue < 0.05 ? "Yes" : "No",
      ]);
    });

    autoTable(doc, {
      startY: yPos,
      head: [trendData[0]],
      body: trendData.slice(1),
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 12;
  }

  // Anomaly Detection
  if (researchData?.anomalies && researchData.anomalies.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Anomalies Detected (${researchData.anomalies.length} total)`,
      20,
      yPos
    );
    yPos += 8;

    const anomalyData: any[] = [
      [
        "Timestamp",
        "Variable",
        "Value",
        "Expected",
        "Deviation (σ)",
        "Severity",
      ],
    ];

    researchData.anomalies.slice(0, 20).forEach((anomaly) => {
      anomalyData.push([
        new Date(anomaly.timestamp).toLocaleString(),
        anomaly.variable,
        anomaly.value.toFixed(2),
        anomaly.expectedValue.toFixed(2),
        anomaly.deviation.toFixed(1),
        anomaly.severity,
      ]);
    });

    autoTable(doc, {
      startY: yPos,
      head: [anomalyData[0]],
      body: anomalyData.slice(1),
      theme: "grid",
      headStyles: { fillColor: [239, 68, 68] },
      styles: { fontSize: 7 },
    });
  }

  // Power Forecast Summary
  if (forecast) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Power Forecast Summary (48-Hour)", 20, yPos);
    yPos += 8;

    const totalEnergy = forecast.outputs.reduce((sum, o) => sum + o.power, 0);
    const avgCapacity =
      forecast.outputs.reduce((sum, o) => sum + (o.capacity || 0), 0) /
      forecast.outputs.length;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Total Energy Production: ${totalEnergy.toFixed(2)} ${
        forecast.asset.type === "solar" ? "kWh" : "MWh"
      }`,
      20,
      yPos
    );
    yPos += 6;
    doc.text(`Average Capacity Factor: ${avgCapacity.toFixed(1)}%`, 20, yPos);
    yPos += 6;
    doc.text(
      `Peak Power: ${Math.max(...forecast.outputs.map((o) => o.power)).toFixed(
        2
      )} ${forecast.asset.type === "solar" ? "kW" : "MW"}`,
      20,
      yPos
    );
    yPos += 12;

    // Hourly forecast table (first 24 hours)
    const forecastData: any[] = [
      [
        "Time",
        "Power",
        "Capacity %",
        "Temperature",
        "Wind Speed",
        "Solar Irr.",
      ],
    ];

    forecast.outputs.slice(0, 24).forEach((output, i) => {
      const meteo = forecast.meteorologicalData[i];
      forecastData.push([
        new Date(output.time).toLocaleTimeString(),
        output.power.toFixed(2),
        (output.capacity || 0).toFixed(1),
        meteo.temperature?.toFixed(1) || "N/A",
        meteo.windSpeed?.toFixed(1) || "N/A",
        meteo.solarIrradiance?.toFixed(0) || "N/A",
      ]);
    });

    autoTable(doc, {
      startY: yPos,
      head: [forecastData[0]],
      body: forecastData.slice(1),
      theme: "striped",
      headStyles: { fillColor: [234, 179, 8] },
      styles: { fontSize: 7 },
    });
  }

  // Long-term Analysis
  if (longTerm) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Long-Term Viability Analysis", 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Annual Production: ${longTerm.annualProduction.toFixed(2)} ${
        longTerm.asset.type === "solar" ? "kWh/year" : "MWh/year"
      }`,
      20,
      yPos
    );
    yPos += 6;
    doc.text(
      `Average Capacity Factor: ${longTerm.averageCapacityFactor.toFixed(1)}%`,
      20,
      yPos
    );
    yPos += 12;

    const monthlyData: any[] = [
      ["Month", "Avg Production", "Capacity Factor %"],
    ];

    longTerm.monthlyAverages.forEach((month) => {
      monthlyData.push([
        month.monthName,
        month.averageProduction.toFixed(2),
        month.averageCapacityFactor.toFixed(1),
      ]);
    });

    autoTable(doc, {
      startY: yPos,
      head: [monthlyData[0]],
      body: monthlyData.slice(1),
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129] },
    });
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(
      `GridCast Renewables - Atmospheric Science Research Platform | Page ${i} of ${pageCount}`,
      105,
      285,
      { align: "center" }
    );
  }

  // Save the PDF
  const filename = `atmospheric_research_${forecast.location.latitude.toFixed(
    2
  )}_${forecast.location.longitude.toFixed(2)}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Generate quick summary PDF
 */
export async function generateQuickSummaryPDF(
  forecast: PowerForecast
): Promise<void> {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Power Forecast Summary", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Location: ${
      forecast.location.address ||
      `${forecast.location.latitude.toFixed(
        4
      )}°N, ${forecast.location.longitude.toFixed(4)}°W`
    }`,
    20,
    35
  );
  const simpleTimestamp = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
  doc.text(`Generated: ${simpleTimestamp}`, 20, 42);

  const totalEnergy = forecast.outputs.reduce((sum, o) => sum + o.power, 0);
  doc.text(
    `Total Energy (48h): ${totalEnergy.toFixed(2)} ${
      forecast.asset.type === "solar" ? "kWh" : "MWh"
    }`,
    20,
    55
  );

  const filename = `forecast_summary_${Date.now()}.pdf`;
  doc.save(filename);
}
