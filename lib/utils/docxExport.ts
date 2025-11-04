import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  PageBreak,
  convertInchesToTwip,
} from "docx";
import {
  PowerForecast,
  LongTermAnalysis,
  AtmosphericResearchData,
} from "@/types";

/**
 * DOCX Export Utilities for Atmospheric Science Research
 *
 * Professional Word document reports for editing and customization
 * Matches the comprehensive structure of the PDF report (without embedded images)
 * Suitable for EB2-NIW green card applications and research documentation
 *
 * Note: Charts and visualizations are not embedded to allow for easy editing.
 * Use PDF export for reports with embedded charts.
 */

/**
 * Create a styled table cell
 */
function createTableCell(text: string, bold: boolean = false): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold })],
      }),
    ],
    margins: {
      top: convertInchesToTwip(0.05),
      bottom: convertInchesToTwip(0.05),
      left: convertInchesToTwip(0.1),
      right: convertInchesToTwip(0.1),
    },
  });
}

/**
 * Create a header table cell with blue background
 */
function createHeaderCell(text: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, color: "FFFFFF" })],
      }),
    ],
    shading: {
      fill: "3B82F6",
    },
    margins: {
      top: convertInchesToTwip(0.05),
      bottom: convertInchesToTwip(0.05),
      left: convertInchesToTwip(0.1),
      right: convertInchesToTwip(0.1),
    },
  });
}

/**
 * Generate comprehensive atmospheric research DOCX report
 * Matches the PDF report structure with all sections and proper formatting
 */
export async function generateAtmosphericResearchDOCX(
  forecast: PowerForecast,
  longTerm: LongTermAnalysis | null,
  researchData: AtmosphericResearchData | null
): Promise<void> {
  try {
    const sections: (Paragraph | Table)[] = [];

    // ========== TITLE PAGE ==========
    sections.push(
      new Paragraph({
        text: "Atmospheric Science Research Report",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 1000, after: 400 },
      }),
      new Paragraph({
        text: "GridCast Renewables - Atmospheric Analysis Platform",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `Generated: ${new Date().toLocaleString()}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
      }),
      new Paragraph({
        children: [new PageBreak()],
      })
    );

    // ========== LOCATION INFORMATION ==========
    sections.push(
      new Paragraph({
        text: "Location Information",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Address: ", bold: true }),
          new TextRun({ text: forecast.location.address || "N/A" }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Coordinates: ", bold: true }),
          new TextRun({
            text: `${forecast.location.latitude.toFixed(
              4
            )}°N, ${forecast.location.longitude.toFixed(4)}°W`,
          }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Asset Type: ", bold: true }),
          new TextRun({ text: forecast.asset.type.toUpperCase() }),
        ],
        spacing: { after: 300 },
      })
    );

    // ========== DATA QUALITY ASSESSMENT ==========
    if (researchData && researchData.dataQuality) {
      sections.push(
        new Paragraph({
          text: "Data Quality Assessment",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      const qualityRows: TableRow[] = [
        new TableRow({
          children: [createHeaderCell("Metric"), createHeaderCell("Value")],
        }),
      ];

      if (researchData.dataQuality.qualityScore !== undefined) {
        qualityRows.push(
          new TableRow({
            children: [
              createTableCell("Quality Score"),
              createTableCell(
                `${researchData.dataQuality.qualityScore.toFixed(1)}%`
              ),
            ],
          })
        );
      }

      if (researchData.dataQuality.totalRecords !== undefined) {
        qualityRows.push(
          new TableRow({
            children: [
              createTableCell("Total Records"),
              createTableCell(researchData.dataQuality.totalRecords.toString()),
            ],
          })
        );
      }

      if (researchData.dataQuality.completeRecords !== undefined) {
        qualityRows.push(
          new TableRow({
            children: [
              createTableCell("Complete Records"),
              createTableCell(
                researchData.dataQuality.completeRecords.toString()
              ),
            ],
          })
        );
      }

      if (researchData.dataQuality.missingDataPercentage !== undefined) {
        qualityRows.push(
          new TableRow({
            children: [
              createTableCell("Missing Data"),
              createTableCell(
                `${researchData.dataQuality.missingDataPercentage.toFixed(1)}%`
              ),
            ],
          })
        );
      }

      if (researchData.dataQuality.outlierCount !== undefined) {
        qualityRows.push(
          new TableRow({
            children: [
              createTableCell("Outliers Detected"),
              createTableCell(researchData.dataQuality.outlierCount.toString()),
            ],
          })
        );
      }

      sections.push(
        new Table({
          rows: qualityRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        }),
        new Paragraph({
          text: "",
          spacing: { after: 300 },
        })
      );
    }

    // ========== STATISTICAL SUMMARY ==========
    if (researchData && Object.keys(researchData.statistics).length > 0) {
      sections.push(
        new Paragraph({
          text: "Statistical Summary - Key Variables",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      const statsRows: TableRow[] = [
        new TableRow({
          children: [
            createHeaderCell("Variable"),
            createHeaderCell("Mean"),
            createHeaderCell("Std Dev"),
            createHeaderCell("Min"),
            createHeaderCell("Max"),
            createHeaderCell("Data Points"),
          ],
        }),
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
        if (
          stats &&
          stats.mean !== undefined &&
          stats.stdDev !== undefined &&
          stats.min !== undefined &&
          stats.max !== undefined &&
          stats.count !== undefined
        ) {
          statsRows.push(
            new TableRow({
              children: [
                createTableCell(varName),
                createTableCell(stats.mean.toFixed(2)),
                createTableCell(stats.stdDev.toFixed(2)),
                createTableCell(stats.min.toFixed(2)),
                createTableCell(stats.max.toFixed(2)),
                createTableCell(stats.count.toString()),
              ],
            })
          );
        }
      });

      sections.push(
        new Table({
          rows: statsRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        }),
        new Paragraph({
          text: "",
          spacing: { after: 300 },
        })
      );
    }

    // ========== CORRELATION MATRIX ==========
    if (researchData?.correlations) {
      sections.push(
        new Paragraph({
          children: [new PageBreak()],
        }),
        new Paragraph({
          text: "Correlation Matrix",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        })
      );

      const corrRows: TableRow[] = [
        new TableRow({
          children: [
            createHeaderCell("Variable"),
            ...researchData.correlations.variables.map((v) =>
              createHeaderCell(v)
            ),
          ],
        }),
      ];

      researchData.correlations.variables.forEach((rowVar, i) => {
        corrRows.push(
          new TableRow({
            children: [
              createTableCell(rowVar, true),
              ...researchData.correlations!.matrix[i].map((corr) =>
                createTableCell(corr.toFixed(2))
              ),
            ],
          })
        );
      });

      sections.push(
        new Table({
          rows: corrRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Note: Values range from -1 (perfect negative correlation) to +1 (perfect positive correlation)",
              italics: true,
            }),
          ],
          spacing: { before: 200, after: 300 },
        })
      );
    }

    // ========== TREND ANALYSIS ==========
    if (researchData?.trends && researchData.trends.length > 0) {
      sections.push(
        new Paragraph({
          children: [new PageBreak()],
        }),
        new Paragraph({
          text: "Trend Analysis",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        })
      );

      const trendRows: TableRow[] = [
        new TableRow({
          children: [
            createHeaderCell("Variable"),
            createHeaderCell("Trend"),
            createHeaderCell("Slope"),
            createHeaderCell("R²"),
            createHeaderCell("P-Value"),
            createHeaderCell("Significant"),
          ],
        }),
      ];

      researchData.trends.forEach((trend) => {
        trendRows.push(
          new TableRow({
            children: [
              createTableCell(trend.variable),
              createTableCell(trend.trend),
              createTableCell(trend.slope.toExponential(2)),
              createTableCell(trend.rSquared.toFixed(3)),
              createTableCell(
                trend.pValue < 0.001 ? "<0.001" : trend.pValue.toFixed(3)
              ),
              createTableCell(trend.pValue < 0.05 ? "Yes" : "No"),
            ],
          })
        );
      });

      sections.push(
        new Table({
          rows: trendRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        }),
        new Paragraph({
          text: "",
          spacing: { after: 300 },
        })
      );
    }

    // ========== ANOMALY DETECTION ==========
    if (researchData?.anomalies && researchData.anomalies.length > 0) {
      sections.push(
        new Paragraph({
          text: `Anomalies Detected (${researchData.anomalies.length} total)`,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      const anomalyRows: TableRow[] = [
        new TableRow({
          children: [
            createHeaderCell("Timestamp"),
            createHeaderCell("Variable"),
            createHeaderCell("Value"),
            createHeaderCell("Expected"),
            createHeaderCell("Deviation (σ)"),
            createHeaderCell("Severity"),
          ],
        }),
      ];

      researchData.anomalies.slice(0, 20).forEach((anomaly) => {
        anomalyRows.push(
          new TableRow({
            children: [
              createTableCell(new Date(anomaly.timestamp).toLocaleString()),
              createTableCell(anomaly.variable),
              createTableCell(anomaly.value.toFixed(2)),
              createTableCell(anomaly.expectedValue.toFixed(2)),
              createTableCell(anomaly.deviation.toFixed(1)),
              createTableCell(anomaly.severity),
            ],
          })
        );
      });

      sections.push(
        new Table({
          rows: anomalyRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        }),
        new Paragraph({
          text: "",
          spacing: { after: 300 },
        })
      );
    }

    // ========== POWER FORECAST SUMMARY ==========
    sections.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      new Paragraph({
        text: "Power Forecast Summary (48-Hour)",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
      })
    );

    const hasOutputs = forecast.outputs && forecast.outputs.length > 0;
    const totalEnergy = hasOutputs
      ? forecast.outputs.reduce((sum, o) => sum + (o.power || 0), 0)
      : 0;
    const avgPower = hasOutputs ? totalEnergy / forecast.outputs.length : 0;
    const peakPower = hasOutputs
      ? Math.max(...forecast.outputs.map((o) => o.power || 0), 0)
      : 0;

    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Total Energy Production: ", bold: true }),
          new TextRun({
            text: `${totalEnergy.toFixed(2)} ${
              forecast.asset.type === "solar" ? "kWh" : "MWh"
            }`,
          }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Average Power: ", bold: true }),
          new TextRun({
            text: `${avgPower.toFixed(2)} ${
              forecast.asset.type === "solar" ? "kW" : "MW"
            }`,
          }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Peak Power: ", bold: true }),
          new TextRun({
            text: `${peakPower.toFixed(2)} ${
              forecast.asset.type === "solar" ? "kW" : "MW"
            }`,
          }),
        ],
        spacing: { after: 300 },
      })
    );

    // Hourly forecast table (first 24 hours)
    const forecastRows: TableRow[] = [
      new TableRow({
        children: [
          createHeaderCell("Time"),
          createHeaderCell("Power"),
          createHeaderCell("Capacity %"),
          createHeaderCell("Temperature"),
          createHeaderCell("Wind Speed"),
          createHeaderCell("Solar Irr."),
        ],
      }),
    ];

    forecast.outputs.slice(0, 24).forEach((output, i) => {
      const meteo = forecast.meteorologicalData[i];
      forecastRows.push(
        new TableRow({
          children: [
            createTableCell(new Date(output.time).toLocaleTimeString()),
            createTableCell(output.power.toFixed(2)),
            createTableCell((output.capacity || 0).toFixed(1)),
            createTableCell(meteo?.temperature?.toFixed(1) || "N/A"),
            createTableCell(meteo?.windSpeed?.toFixed(1) || "N/A"),
            createTableCell(meteo?.solarIrradiance?.toFixed(0) || "N/A"),
          ],
        })
      );
    });

    sections.push(
      new Table({
        rows: forecastRows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      }),
      new Paragraph({
        text: "",
        spacing: { after: 300 },
      })
    );

    // ========== LONG-TERM VIABILITY ANALYSIS ==========
    if (longTerm) {
      sections.push(
        new Paragraph({
          children: [new PageBreak()],
        }),
        new Paragraph({
          text: "Long-Term Viability Analysis",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Annual Production: ", bold: true }),
            new TextRun({
              text: `${(longTerm.annualProduction || 0).toFixed(2)} ${
                longTerm.asset.type === "solar" ? "kWh/year" : "MWh/year"
              }`,
            }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Average Capacity Factor: ", bold: true }),
            new TextRun({
              text: `${(longTerm.averageCapacityFactor || 0).toFixed(1)}%`,
            }),
          ],
          spacing: { after: 300 },
        })
      );

      // Monthly averages table
      const monthlyRows: TableRow[] = [
        new TableRow({
          children: [
            createHeaderCell("Month"),
            createHeaderCell("Avg Production"),
            createHeaderCell("Capacity Factor %"),
          ],
        }),
      ];

      longTerm.monthlyAverages.forEach((month) => {
        monthlyRows.push(
          new TableRow({
            children: [
              createTableCell(month.monthName),
              createTableCell(month.averageProduction.toFixed(2)),
              createTableCell(month.averageCapacityFactor.toFixed(1)),
            ],
          })
        );
      });

      sections.push(
        new Table({
          rows: monthlyRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        }),
        new Paragraph({
          text: "",
          spacing: { after: 300 },
        })
      );
    }

    // ========== CREATE AND SAVE DOCUMENT ==========
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `atmospheric_research_${forecast.location.latitude.toFixed(
      2
    )}_${forecast.location.longitude.toFixed(2)}_${Date.now()}.docx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating DOCX:", error);
    throw error;
  }
}
