import { SolarAsset, HourlyWeatherData, PowerOutput } from '@/types';

/**
 * Solar Power Generation Model
 * 
 * This module implements the scientific formulas for converting solar irradiance
 * to electrical power output for photovoltaic systems.
 * 
 * References:
 * - NREL PVWatts Calculator: https://pvwatts.nrel.gov/
 * - Duffie, J. A., & Beckman, W. A. (2013). Solar Engineering of Thermal Processes
 * - King, D. L., et al. (2004). Sandia Photovoltaic Array Performance Model
 */

/**
 * Calculate solar power output using the simplified PVWatts model
 * 
 * Formula: P = (G / G_STC) × P_DC × η_system
 * Where:
 * - P = AC power output (kW)
 * - G = Solar irradiance (W/m²)
 * - G_STC = Standard Test Condition irradiance (1000 W/m²)
 * - P_DC = DC capacity of the system (kW)
 * - η_system = System efficiency (accounting for losses)
 * 
 * @param irradiance - Solar irradiance in W/m²
 * @param dcCapacity - DC capacity of the solar system in kW
 * @param systemLosses - System losses as a percentage (default 14%)
 * @returns Power output in kW
 */
export function calculateSolarPower(
  irradiance: number,
  dcCapacity: number,
  systemLosses: number = 14
): number {
  const G_STC = 1000; // Standard Test Condition irradiance (W/m²)
  const systemEfficiency = (100 - systemLosses) / 100;
  
  // Basic PVWatts formula
  const power = (irradiance / G_STC) * dcCapacity * systemEfficiency;
  
  // Power cannot be negative
  return Math.max(0, power);
}

/**
 * Calculate temperature-adjusted solar power output
 * 
 * PV modules lose efficiency as temperature increases.
 * Formula: P_adjusted = P × [1 + γ × (T_cell - T_STC)]
 * Where:
 * - γ = Temperature coefficient (typically -0.004 to -0.005 per °C)
 * - T_cell = Cell temperature (°C)
 * - T_STC = Standard Test Condition temperature (25°C)
 * 
 * Cell temperature estimation: T_cell ≈ T_ambient + (NOCT - 20) × (G / 800)
 * Where NOCT = Nominal Operating Cell Temperature (typically 45°C)
 * 
 * @param basePower - Base power output in kW
 * @param ambientTemp - Ambient temperature in °C
 * @param irradiance - Solar irradiance in W/m²
 * @param tempCoefficient - Temperature coefficient (default -0.004)
 * @returns Temperature-adjusted power output in kW
 */
export function applyTemperatureCorrection(
  basePower: number,
  ambientTemp: number,
  irradiance: number,
  tempCoefficient: number = -0.004
): number {
  const T_STC = 25; // Standard Test Condition temperature (°C)
  const NOCT = 45; // Nominal Operating Cell Temperature (°C)
  
  // Estimate cell temperature
  const cellTemp = ambientTemp + ((NOCT - 20) * (irradiance / 800));
  
  // Apply temperature correction
  const tempFactor = 1 + tempCoefficient * (cellTemp - T_STC);
  
  return basePower * tempFactor;
}

/**
 * Calculate solar power output with cloud cover adjustment
 * 
 * Cloud cover reduces the direct normal irradiance (DNI) component.
 * This is a simplified model that reduces irradiance based on cloud cover.
 * 
 * @param irradiance - Clear-sky irradiance in W/m²
 * @param cloudCover - Cloud cover percentage (0-100)
 * @returns Adjusted irradiance in W/m²
 */
export function adjustIrradianceForClouds(
  irradiance: number,
  cloudCover: number
): number {
  // Simplified cloud cover model
  // At 100% cloud cover, irradiance is reduced to about 20% of clear-sky value
  const cloudFactor = 1 - (0.8 * cloudCover / 100);
  return irradiance * cloudFactor;
}

/**
 * Generate solar power forecast from weather data
 * 
 * @param asset - Solar asset configuration
 * @param weatherData - Array of hourly weather data
 * @returns Array of power outputs
 */
export function generateSolarForecast(
  asset: SolarAsset,
  weatherData: HourlyWeatherData[]
): PowerOutput[] {
  return weatherData.map((hour) => {
    let power = 0;
    
    if (hour.solarIrradiance !== undefined && hour.solarIrradiance > 0) {
      // Adjust irradiance for cloud cover if available
      let adjustedIrradiance = hour.solarIrradiance;
      if (hour.cloudCover !== undefined) {
        adjustedIrradiance = adjustIrradianceForClouds(
          hour.solarIrradiance,
          hour.cloudCover
        );
      }
      
      // Calculate base power
      power = calculateSolarPower(
        adjustedIrradiance,
        asset.dcCapacity,
        asset.systemLosses
      );
      
      // Apply temperature correction if temperature data is available
      if (hour.temperature !== undefined) {
        power = applyTemperatureCorrection(
          power,
          hour.temperature,
          adjustedIrradiance
        );
      }
    }
    
    const capacity = asset.dcCapacity > 0 ? (power / asset.dcCapacity) * 100 : 0;
    
    return {
      time: hour.time,
      power: Math.max(0, power),
      capacity: Math.min(100, Math.max(0, capacity))
    };
  });
}

/**
 * Calculate average daily solar production for a given month
 * Used for long-term viability analysis
 * 
 * @param asset - Solar asset configuration
 * @param monthlyAverageIrradiance - Average daily irradiance for the month (kWh/m²/day)
 * @returns Average daily production in kWh
 */
export function calculateMonthlyAverageSolarProduction(
  asset: SolarAsset,
  monthlyAverageIrradiance: number
): number {
  // Convert kWh/m²/day to average W/m² (assuming 24-hour period)
  const averageIrradiance = (monthlyAverageIrradiance * 1000) / 24;
  
  // Calculate power and integrate over 24 hours
  const averagePower = calculateSolarPower(
    averageIrradiance,
    asset.dcCapacity,
    asset.systemLosses
  );
  
  // Daily production (kWh/day)
  return averagePower * 24;
}

/**
 * Calculate the solar capacity factor
 * Capacity factor = (Actual energy produced) / (Maximum possible energy)
 * 
 * @param actualProduction - Actual energy production in kWh
 * @param ratedCapacity - Rated capacity in kW
 * @param hours - Number of hours in the period
 * @returns Capacity factor as a percentage
 */
export function calculateSolarCapacityFactor(
  actualProduction: number,
  ratedCapacity: number,
  hours: number
): number {
  const maxPossibleProduction = ratedCapacity * hours;
  if (maxPossibleProduction === 0) return 0;
  
  return (actualProduction / maxPossibleProduction) * 100;
}

