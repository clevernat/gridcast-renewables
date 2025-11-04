import {
  HourlyWeatherData,
  AtmosphericStatistics,
  CorrelationMatrix,
  TrendAnalysis,
  AnomalyDetection,
  DataQualityReport,
  AtmosphericResearchData,
  Location,
} from "@/types";

/**
 * Atmospheric Research Utilities
 *
 * Comprehensive statistical analysis tools for atmospheric science research
 * Suitable for EB2-NIW green card applications demonstrating research capabilities
 */

/**
 * Calculate comprehensive statistics for a variable
 */
export function calculateStatistics(values: number[]): AtmosphericStatistics {
  const validValues = values.filter(
    (v) => v !== null && v !== undefined && !isNaN(v)
  );
  const sorted = [...validValues].sort((a, b) => a - b);

  if (validValues.length === 0) {
    return {
      mean: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      percentile25: 0,
      percentile75: 0,
      percentile95: 0,
      count: 0,
      missingCount: values.length,
    };
  }

  const mean = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
  const variance =
    validValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
    validValues.length;
  const stdDev = Math.sqrt(variance);

  const getPercentile = (p: number) => {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  };

  return {
    mean,
    median: sorted[Math.floor(sorted.length / 2)],
    stdDev,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    percentile25: getPercentile(25),
    percentile75: getPercentile(75),
    percentile95: getPercentile(95),
    count: validValues.length,
    missingCount: values.length - validValues.length,
  };
}

/**
 * Calculate correlation matrix between multiple variables
 */
export function calculateCorrelationMatrix(
  data: Record<string, number[]>
): CorrelationMatrix {
  const variables = Object.keys(data);
  const n = variables.length;
  const matrix: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));
  const pValues: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
        pValues[i][j] = 0;
      } else {
        const result = pearsonCorrelation(
          data[variables[i]],
          data[variables[j]]
        );
        matrix[i][j] = result.r;
        pValues[i][j] = result.pValue;
      }
    }
  }

  return { variables, matrix, pValues };
}

/**
 * Calculate Pearson correlation coefficient and p-value
 */
function pearsonCorrelation(
  x: number[],
  y: number[]
): { r: number; pValue: number } {
  const n = Math.min(x.length, y.length);

  // Filter out missing values
  const pairs = x
    .slice(0, n)
    .map((xi, i) => [xi, y[i]])
    .filter(
      ([xi, yi]) => !isNaN(xi) && !isNaN(yi) && xi !== null && yi !== null
    );

  if (pairs.length < 3) {
    return { r: 0, pValue: 1 };
  }

  const xValues = pairs.map((p) => p[0]);
  const yValues = pairs.map((p) => p[1]);

  const meanX = xValues.reduce((sum, v) => sum + v, 0) / xValues.length;
  const meanY = yValues.reduce((sum, v) => sum + v, 0) / yValues.length;

  let numerator = 0;
  let sumXSquared = 0;
  let sumYSquared = 0;

  for (let i = 0; i < xValues.length; i++) {
    const dx = xValues[i] - meanX;
    const dy = yValues[i] - meanY;
    numerator += dx * dy;
    sumXSquared += dx * dx;
    sumYSquared += dy * dy;
  }

  const r = numerator / Math.sqrt(sumXSquared * sumYSquared);

  // Calculate t-statistic for p-value
  const t = r * Math.sqrt((xValues.length - 2) / (1 - r * r));
  const pValue = 2 * (1 - studentTCDF(Math.abs(t), xValues.length - 2));

  return { r: isFinite(r) ? r : 0, pValue: isFinite(pValue) ? pValue : 1 };
}

/**
 * Simplified Student's t-distribution CDF (for p-value calculation)
 */
function studentTCDF(t: number, df: number): number {
  // Simplified approximation for large df
  if (df > 30) {
    return normalCDF(t);
  }

  // For small df, use approximation
  const x = df / (df + t * t);
  return 1 - 0.5 * Math.pow(x, df / 2);
}

/**
 * Normal distribution CDF (cumulative distribution function)
 */
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const prob =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - prob : prob;
}

/**
 * Perform linear trend analysis
 */
export function analyzeTrend(
  timestamps: string[],
  values: number[],
  variableName: string
): TrendAnalysis {
  // Convert timestamps to numeric (hours since first timestamp)
  const firstTime = new Date(timestamps[0]).getTime();
  const x = timestamps.map(
    (t) => (new Date(t).getTime() - firstTime) / (1000 * 3600)
  );

  // Filter out missing values
  const pairs = x
    .map((xi, i) => [xi, values[i]])
    .filter(([xi, yi]) => !isNaN(yi) && yi !== null);

  if (pairs.length < 3) {
    return {
      variable: variableName,
      slope: 0,
      intercept: 0,
      rSquared: 0,
      pValue: 1,
      trend: "stable",
      confidence: 0,
    };
  }

  const xValues = pairs.map((p) => p[0]);
  const yValues = pairs.map((p) => p[1]);

  // Calculate linear regression
  const n = xValues.length;
  const sumX = xValues.reduce((sum, v) => sum + v, 0);
  const sumY = yValues.reduce((sum, v) => sum + v, 0);
  const sumXY = xValues.reduce((sum, v, i) => sum + v * yValues[i], 0);
  const sumXX = xValues.reduce((sum, v) => sum + v * v, 0);
  const sumYY = yValues.reduce((sum, v) => sum + v * v, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const meanY = sumY / n;
  const ssTotal = yValues.reduce((sum, v) => sum + Math.pow(v - meanY, 2), 0);
  const ssResidual = yValues.reduce((sum, v, i) => {
    const predicted = slope * xValues[i] + intercept;
    return sum + Math.pow(v - predicted, 2);
  }, 0);
  const rSquared = 1 - ssResidual / ssTotal;

  // Calculate p-value for slope
  const seSlope =
    Math.sqrt(ssResidual / (n - 2)) / Math.sqrt(sumXX - (sumX * sumX) / n);
  const tStat = slope / seSlope;
  const pValue = 2 * (1 - studentTCDF(Math.abs(tStat), n - 2));

  // Determine trend direction
  let trend: "increasing" | "decreasing" | "stable" = "stable";
  if (pValue < 0.05) {
    trend = slope > 0 ? "increasing" : "decreasing";
  }

  return {
    variable: variableName,
    slope: isFinite(slope) ? slope : 0,
    intercept: isFinite(intercept) ? intercept : 0,
    rSquared: isFinite(rSquared) ? rSquared : 0,
    pValue: isFinite(pValue) ? pValue : 1,
    trend,
    confidence: isFinite(rSquared) ? rSquared : 0,
  };
}

/**
 * Detect anomalies using statistical methods (z-score)
 */
export function detectAnomalies(
  timestamps: string[],
  values: number[],
  variableName: string,
  threshold: number = 3 // standard deviations
): AnomalyDetection[] {
  const stats = calculateStatistics(values);
  const anomalies: AnomalyDetection[] = [];

  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null || value === undefined || isNaN(value)) continue;

    const deviation = Math.abs(value - stats.mean) / stats.stdDev;

    if (deviation > threshold) {
      let severity: "low" | "medium" | "high" | "extreme" = "low";
      if (deviation > 5) severity = "extreme";
      else if (deviation > 4) severity = "high";
      else if (deviation > 3.5) severity = "medium";

      anomalies.push({
        timestamp: timestamps[i],
        variable: variableName,
        value,
        expectedValue: stats.mean,
        deviation,
        severity,
      });
    }
  }

  return anomalies;
}

/**
 * Generate comprehensive data quality report
 */
export function generateDataQualityReport(
  weatherData: HourlyWeatherData[]
): DataQualityReport {
  const totalRecords = weatherData.length;
  let completeRecords = 0;
  const variableCompleteness: Record<string, number> = {};
  const suspiciousValues: Array<{
    timestamp: string;
    variable: string;
    value: number;
    reason: string;
  }> = [];

  // Define expected ranges for variables
  const ranges: Record<string, { min: number; max: number }> = {
    temperature: { min: -60, max: 60 },
    surfacePressure: { min: 800, max: 1100 },
    relativeHumidity: { min: 0, max: 100 },
    windSpeed: { min: 0, max: 100 },
    solarIrradiance: { min: 0, max: 1500 },
    precipitation: { min: 0, max: 500 },
  };

  // Check each record
  weatherData.forEach((record) => {
    let isComplete = true;

    // Check critical variables
    const criticalVars = ["temperature", "surfacePressure", "relativeHumidity"];
    criticalVars.forEach((varName) => {
      const value = (record as any)[varName];
      if (value === null || value === undefined || isNaN(value)) {
        isComplete = false;
      }
    });

    if (isComplete) completeRecords++;

    // Check all variables for completeness and validity
    Object.keys(record).forEach((key) => {
      if (key === "time" || key === "dataQuality" || key === "missingDataFlags")
        return;

      const value = (record as any)[key];

      // Track completeness
      if (!variableCompleteness[key]) variableCompleteness[key] = 0;
      if (value !== null && value !== undefined && !isNaN(value)) {
        variableCompleteness[key]++;
      }

      // Check for suspicious values
      if (ranges[key] && value !== null && value !== undefined) {
        if (value < ranges[key].min || value > ranges[key].max) {
          suspiciousValues.push({
            timestamp: record.time,
            variable: key,
            value,
            reason: `Out of expected range [${ranges[key].min}, ${ranges[key].max}]`,
          });
        }
      }
    });
  });

  // Calculate percentages
  Object.keys(variableCompleteness).forEach((key) => {
    variableCompleteness[key] =
      (variableCompleteness[key] / totalRecords) * 100;
  });

  const missingDataPercentage =
    ((totalRecords - completeRecords) / totalRecords) * 100;
  const qualityScore = Math.max(
    0,
    100 - missingDataPercentage - (suspiciousValues.length / totalRecords) * 100
  );

  return {
    totalRecords,
    completeRecords,
    missingDataPercentage,
    qualityScore,
    variableCompleteness,
    outlierCount: suspiciousValues.length,
    suspiciousValues: suspiciousValues.slice(0, 50), // Limit to first 50
  };
}

/**
 * Generate comprehensive atmospheric research analysis
 */
export function generateAtmosphericResearchData(
  location: Location,
  weatherData: HourlyWeatherData[]
): AtmosphericResearchData {
  if (weatherData.length === 0) {
    throw new Error("No weather data available for analysis");
  }

  const timeRange = {
    start: weatherData[0].time,
    end: weatherData[weatherData.length - 1].time,
  };

  // Extract variable arrays
  const extractVariable = (key: keyof HourlyWeatherData): number[] => {
    return weatherData.map((d) => {
      const value = d[key];
      return typeof value === "number" ? value : NaN;
    });
  };

  // Calculate statistics for all variables
  const statistics: Record<string, AtmosphericStatistics> = {};
  const variableKeys: (keyof HourlyWeatherData)[] = [
    "temperature",
    "surfacePressure",
    "relativeHumidity",
    "windSpeed",
    "solarIrradiance",
    "precipitation",
    "cloudCover",
    "dewPoint",
    "apparentTemperature",
    "seaLevelPressure",
    "windDirection",
    "directRadiation",
    "diffuseRadiation",
    "uvIndex",
    "visibility",
  ];

  variableKeys.forEach((key) => {
    const values = extractVariable(key);
    if (values.some((v) => !isNaN(v))) {
      statistics[key] = calculateStatistics(values);
    }
  });

  // Calculate correlations between key variables
  const correlationData: Record<string, number[]> = {};
  const correlationVars = [
    "temperature",
    "surfacePressure",
    "relativeHumidity",
    "windSpeed",
    "solarIrradiance",
  ];
  correlationVars.forEach((key) => {
    const values = extractVariable(key as keyof HourlyWeatherData);
    if (values.some((v) => !isNaN(v))) {
      correlationData[key] = values;
    }
  });

  const correlations =
    Object.keys(correlationData).length > 1
      ? calculateCorrelationMatrix(correlationData)
      : undefined;

  // Perform trend analysis
  const timestamps = weatherData.map((d) => d.time);
  const trends: TrendAnalysis[] = [];

  ["temperature", "surfacePressure", "windSpeed", "solarIrradiance"].forEach(
    (varName) => {
      const values = extractVariable(varName as keyof HourlyWeatherData);
      if (values.some((v) => !isNaN(v))) {
        trends.push(analyzeTrend(timestamps, values, varName));
      }
    }
  );

  // Detect anomalies
  const anomalies: AnomalyDetection[] = [];
  ["temperature", "surfacePressure", "windSpeed"].forEach((varName) => {
    const values = extractVariable(varName as keyof HourlyWeatherData);
    if (values.some((v) => !isNaN(v))) {
      anomalies.push(...detectAnomalies(timestamps, values, varName));
    }
  });

  // Generate data quality report
  const dataQuality = generateDataQualityReport(weatherData);

  return {
    location,
    timeRange,
    weatherData,
    statistics,
    correlations,
    trends,
    anomalies,
    dataQuality,
  };
}
