import { PowerForecast, LongTermAnalysis, Asset } from "@/types";

export interface ROICalculation {
  totalInvestment: number;
  annualRevenue: number;
  annualSavings: number;
  paybackPeriod: number; // years
  roi20Year: number; // percentage
  netPresentValue: number;
  internalRateOfReturn: number; // percentage
}

export interface CarbonOffsetCalculation {
  annualCO2Offset: number; // kg
  lifetimeCO2Offset: number; // kg (20 years)
  equivalentTrees: number;
  equivalentCarsMilesAvoided: number;
  equivalentHomesElectricity: number;
}

export interface PeakAnalysis {
  peakHour: string;
  peakPower: number;
  averagePower: number;
  peakToAverageRatio: number;
  productiveHours: number; // hours above 50% capacity
  lowProductionHours: number; // hours below 20% capacity
}

/**
 * Calculate ROI for renewable energy investment
 */
export function calculateROI(
  analysis: LongTermAnalysis,
  costPerKW: number = 1500, // Default: $1,500/kW for solar, $1,300/kW for wind
  electricityRate: number = 0.13, // Default: $0.13/kWh
  maintenanceCostPerYear: number = 0, // Annual maintenance
  discountRate: number = 0.05, // 5% discount rate
  projectLifetime: number = 20 // 20 years
): ROICalculation {
  const isSolar = analysis.asset.type === "solar";
  
  // Calculate total investment
  const systemSize = isSolar 
    ? analysis.asset.dcCapacity 
    : analysis.asset.ratedCapacity * 1000; // Convert MW to kW
  
  const totalInvestment = systemSize * costPerKW;
  
  // Annual production in kWh
  const annualProductionKWh = isSolar
    ? analysis.totalAnnualProduction // Already in kWh
    : analysis.totalAnnualProduction * 1000; // Convert MWh to kWh
  
  // Annual revenue/savings
  const annualRevenue = annualProductionKWh * electricityRate;
  const annualSavings = annualRevenue - maintenanceCostPerYear;
  
  // Simple payback period
  const paybackPeriod = totalInvestment / annualSavings;
  
  // 20-year ROI
  const totalRevenue20Year = annualRevenue * projectLifetime;
  const totalMaintenance20Year = maintenanceCostPerYear * projectLifetime;
  const netProfit20Year = totalRevenue20Year - totalMaintenance20Year - totalInvestment;
  const roi20Year = (netProfit20Year / totalInvestment) * 100;
  
  // Net Present Value (NPV)
  let npv = -totalInvestment;
  for (let year = 1; year <= projectLifetime; year++) {
    npv += annualSavings / Math.pow(1 + discountRate, year);
  }
  
  // Internal Rate of Return (IRR) - simplified approximation
  const irr = ((Math.pow(totalRevenue20Year / totalInvestment, 1 / projectLifetime) - 1) * 100);
  
  return {
    totalInvestment,
    annualRevenue,
    annualSavings,
    paybackPeriod,
    roi20Year,
    netPresentValue: npv,
    internalRateOfReturn: irr,
  };
}

/**
 * Calculate carbon offset
 */
export function calculateCarbonOffset(
  analysis: LongTermAnalysis,
  gridCarbonIntensity: number = 0.42 // kg CO2 per kWh (US average)
): CarbonOffsetCalculation {
  const isSolar = analysis.asset.type === "solar";
  
  // Annual production in kWh
  const annualProductionKWh = isSolar
    ? analysis.totalAnnualProduction
    : analysis.totalAnnualProduction * 1000;
  
  // Annual CO2 offset in kg
  const annualCO2Offset = annualProductionKWh * gridCarbonIntensity;
  
  // Lifetime offset (20 years)
  const lifetimeCO2Offset = annualCO2Offset * 20;
  
  // Equivalent trees (1 tree absorbs ~21 kg CO2/year)
  const equivalentTrees = Math.round(annualCO2Offset / 21);
  
  // Equivalent car miles avoided (1 mile = ~0.404 kg CO2)
  const equivalentCarsMilesAvoided = Math.round(annualCO2Offset / 0.404);
  
  // Equivalent homes' electricity (average US home uses ~10,632 kWh/year)
  const equivalentHomesElectricity = annualProductionKWh / 10632;
  
  return {
    annualCO2Offset,
    lifetimeCO2Offset,
    equivalentTrees,
    equivalentCarsMilesAvoided,
    equivalentHomesElectricity,
  };
}

/**
 * Analyze peak production hours
 */
export function analyzePeakProduction(forecast: PowerForecast): PeakAnalysis {
  const powers = forecast.outputs.map((o) => o.power);
  const maxPower = Math.max(...powers);
  const avgPower = powers.reduce((sum, p) => sum + p, 0) / powers.length;
  
  // Find peak hour
  const peakIndex = powers.indexOf(maxPower);
  const peakHour = new Date(forecast.outputs[peakIndex].timestamp).toLocaleString();
  
  // Calculate capacity
  const capacity = forecast.asset.type === "solar"
    ? forecast.asset.dcCapacity
    : forecast.asset.ratedCapacity * 1000; // Convert MW to kW
  
  // Count productive hours (>50% capacity)
  const productiveHours = powers.filter((p) => p > capacity * 0.5).length;
  
  // Count low production hours (<20% capacity)
  const lowProductionHours = powers.filter((p) => p < capacity * 0.2).length;
  
  return {
    peakHour,
    peakPower: maxPower,
    averagePower: avgPower,
    peakToAverageRatio: maxPower / avgPower,
    productiveHours,
    lowProductionHours,
  };
}

/**
 * Analyze seasonal trends
 */
export interface SeasonalTrend {
  season: string;
  averageProduction: number;
  capacityFactor: number;
  months: string[];
}

export function analyzeSeasonalTrends(analysis: LongTermAnalysis): SeasonalTrend[] {
  const seasons = {
    Winter: ["December", "January", "February"],
    Spring: ["March", "April", "May"],
    Summer: ["June", "July", "August"],
    Fall: ["September", "October", "November"],
  };
  
  const trends: SeasonalTrend[] = [];
  
  for (const [season, months] of Object.entries(seasons)) {
    const seasonData = analysis.monthlyAverages.filter((m) =>
      months.includes(m.month)
    );
    
    if (seasonData.length > 0) {
      const avgProduction =
        seasonData.reduce((sum, m) => sum + m.averageProduction, 0) /
        seasonData.length;
      
      const avgCapacityFactor =
        seasonData.reduce((sum, m) => sum + m.capacityFactor, 0) /
        seasonData.length;
      
      trends.push({
        season,
        averageProduction: avgProduction,
        capacityFactor: avgCapacityFactor,
        months,
      });
    }
  }
  
  return trends;
}

/**
 * Generate production alerts
 */
export interface ProductionAlert {
  type: "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: string;
}

export function generateProductionAlerts(
  forecast: PowerForecast,
  analysis?: LongTermAnalysis
): ProductionAlert[] {
  const alerts: ProductionAlert[] = [];
  const peakAnalysis = analyzePeakProduction(forecast);
  
  // Low production warning
  if (peakAnalysis.lowProductionHours > 24) {
    alerts.push({
      type: "warning",
      title: "Low Production Period Detected",
      message: `${peakAnalysis.lowProductionHours} hours of low production (<20% capacity) expected in the next 48 hours.`,
      timestamp: new Date().toISOString(),
    });
  }
  
  // High production alert
  if (peakAnalysis.productiveHours > 30) {
    alerts.push({
      type: "success",
      title: "Optimal Production Period",
      message: `${peakAnalysis.productiveHours} hours of high production (>50% capacity) expected in the next 48 hours.`,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Peak production info
  alerts.push({
    type: "info",
    title: "Peak Production Forecast",
    message: `Peak production of ${peakAnalysis.peakPower.toFixed(2)} ${forecast.asset.type === "solar" ? "kW" : "MW"} expected at ${peakAnalysis.peakHour}.`,
    timestamp: new Date().toISOString(),
  });
  
  // Capacity factor warning (if long-term data available)
  if (analysis && analysis.averageCapacityFactor < 20) {
    alerts.push({
      type: "warning",
      title: "Low Capacity Factor",
      message: `Average capacity factor of ${analysis.averageCapacityFactor.toFixed(1)}% indicates suboptimal site conditions. Consider alternative locations.`,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Weather-based alerts
  const hasHighWind = forecast.meteorologicalData.some((m) => m.windSpeed && m.windSpeed > 20);
  if (hasHighWind && forecast.asset.type === "wind") {
    alerts.push({
      type: "warning",
      title: "High Wind Speed Alert",
      message: "Wind speeds exceeding 20 m/s expected. Turbine may enter cut-out mode for safety.",
      timestamp: new Date().toISOString(),
    });
  }
  
  const hasLowIrradiance = forecast.meteorologicalData.some(
    (m) => m.solarIrradiance && m.solarIrradiance < 100
  );
  if (hasLowIrradiance && forecast.asset.type === "solar") {
    alerts.push({
      type: "info",
      title: "Cloudy Conditions Expected",
      message: "Low solar irradiance periods detected. Production may be reduced.",
      timestamp: new Date().toISOString(),
    });
  }
  
  return alerts;
}

/**
 * Compare multiple locations
 */
export interface LocationComparison {
  location: string;
  annualProduction: number;
  capacityFactor: number;
  roi20Year: number;
  paybackPeriod: number;
  co2Offset: number;
  rank: number;
}

export function compareLocations(
  analyses: Array<{ location: string; analysis: LongTermAnalysis }>,
  costPerKW: number = 1500,
  electricityRate: number = 0.13
): LocationComparison[] {
  const comparisons = analyses.map(({ location, analysis }) => {
    const roi = calculateROI(analysis, costPerKW, electricityRate);
    const carbon = calculateCarbonOffset(analysis);
    
    return {
      location,
      annualProduction: analysis.totalAnnualProduction,
      capacityFactor: analysis.averageCapacityFactor,
      roi20Year: roi.roi20Year,
      paybackPeriod: roi.paybackPeriod,
      co2Offset: carbon.annualCO2Offset,
      rank: 0, // Will be calculated
    };
  });
  
  // Rank by ROI (higher is better)
  comparisons.sort((a, b) => b.roi20Year - a.roi20Year);
  comparisons.forEach((c, i) => (c.rank = i + 1));
  
  return comparisons;
}

