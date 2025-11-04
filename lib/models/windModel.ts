import { WindAsset, HourlyWeatherData, PowerOutput } from '@/types';

/**
 * Wind Power Generation Model
 * 
 * This module implements the scientific formulas for converting wind speed
 * to electrical power output for wind turbines.
 * 
 * References:
 * - Manwell, J. F., McGowan, J. G., & Rogers, A. L. (2009). Wind Energy Explained
 * - IEC 61400-12-1: Wind turbines - Power performance measurements
 * - Wind Power Law: https://www.wind-power-program.com/wind_statistics.htm
 */

/**
 * Extrapolate wind speed to hub height using the power law
 * 
 * The wind power law (also known as the Hellmann exponential law):
 * v₂ = v₁ × (h₂ / h₁)^α
 * 
 * Where:
 * - v₁ = wind speed at reference height h₁
 * - v₂ = wind speed at target height h₂
 * - α = power law exponent (typically 0.14 for open terrain, 0.2-0.25 for urban areas)
 * 
 * Reference: Manwell et al. (2009), Wind Energy Explained, Chapter 2
 * 
 * @param windSpeedAtReference - Wind speed at reference height (m/s)
 * @param referenceHeight - Reference height (m), typically 10m for weather data
 * @param targetHeight - Target hub height (m)
 * @param alpha - Power law exponent (default 0.14 for open terrain)
 * @returns Wind speed at target height (m/s)
 */
export function extrapolateWindSpeed(
  windSpeedAtReference: number,
  referenceHeight: number,
  targetHeight: number,
  alpha: number = 0.14
): number {
  if (referenceHeight <= 0 || targetHeight <= 0) {
    throw new Error('Heights must be positive values');
  }
  
  return windSpeedAtReference * Math.pow(targetHeight / referenceHeight, alpha);
}

/**
 * Calculate wind power output using the simplified power curve model
 * 
 * The power curve is typically divided into four regions:
 * 1. Below cut-in speed: P = 0
 * 2. Between cut-in and rated speed: P increases (approximately cubic with wind speed)
 * 3. Between rated and cut-out speed: P = rated power
 * 4. Above cut-out speed: P = 0 (turbine shuts down for safety)
 * 
 * Simplified power formula (Region 2):
 * P = 0.5 × ρ × A × Cp × v³ × η
 * 
 * Where:
 * - ρ = air density (kg/m³), typically 1.225 at sea level
 * - A = swept area of rotor (m²)
 * - Cp = power coefficient (typically 0.35-0.45, max theoretical 0.593 - Betz limit)
 * - v = wind speed (m/s)
 * - η = mechanical and electrical efficiency (typically 0.9)
 * 
 * For this simplified model, we use a cubic relationship scaled to rated capacity.
 * 
 * @param windSpeed - Wind speed at hub height (m/s)
 * @param asset - Wind asset configuration
 * @returns Power output in MW
 */
export function calculateWindPower(
  windSpeed: number,
  asset: WindAsset
): number {
  const cutInSpeed = asset.cutInSpeed ?? 3;
  const ratedSpeed = asset.ratedSpeed ?? 12;
  const cutOutSpeed = asset.cutOutSpeed ?? 25;
  
  // Region 1: Below cut-in speed
  if (windSpeed < cutInSpeed) {
    return 0;
  }
  
  // Region 4: Above cut-out speed
  if (windSpeed > cutOutSpeed) {
    return 0;
  }
  
  // Region 3: Between rated and cut-out speed
  if (windSpeed >= ratedSpeed) {
    return asset.ratedCapacity;
  }
  
  // Region 2: Between cut-in and rated speed
  // Use cubic relationship: P = P_rated × ((v³ - v_cut_in³) / (v_rated³ - v_cut_in³))
  const vCubed = Math.pow(windSpeed, 3);
  const vCutInCubed = Math.pow(cutInSpeed, 3);
  const vRatedCubed = Math.pow(ratedSpeed, 3);
  
  const power = asset.ratedCapacity * ((vCubed - vCutInCubed) / (vRatedCubed - vCutInCubed));
  
  return Math.max(0, Math.min(asset.ratedCapacity, power));
}

/**
 * Apply air density correction to wind power
 * 
 * Air density varies with temperature, pressure, and altitude.
 * This affects the power output of wind turbines.
 * 
 * Simplified air density formula:
 * ρ = ρ₀ × (T₀ / T) × (P / P₀)
 * 
 * Where:
 * - ρ₀ = standard air density (1.225 kg/m³)
 * - T₀ = standard temperature (288.15 K or 15°C)
 * - T = actual temperature (K)
 * - P₀ = standard pressure (101325 Pa)
 * - P = actual pressure (Pa)
 * 
 * For altitude correction (when pressure is not available):
 * ρ = ρ₀ × exp(-h / H)
 * Where H ≈ 8500m (scale height)
 * 
 * @param basePower - Base power output in MW
 * @param temperature - Temperature in °C (optional)
 * @param altitude - Altitude in meters (optional)
 * @returns Density-corrected power output in MW
 */
export function applyAirDensityCorrection(
  basePower: number,
  temperature?: number,
  altitude?: number
): number {
  let densityRatio = 1.0;
  
  // Temperature correction
  if (temperature !== undefined) {
    const T0 = 288.15; // Standard temperature in Kelvin (15°C)
    const T = temperature + 273.15; // Convert to Kelvin
    densityRatio *= T0 / T;
  }
  
  // Altitude correction
  if (altitude !== undefined && altitude > 0) {
    const H = 8500; // Scale height in meters
    densityRatio *= Math.exp(-altitude / H);
  }
  
  return basePower * densityRatio;
}

/**
 * Generate wind power forecast from weather data
 * 
 * @param asset - Wind asset configuration
 * @param weatherData - Array of hourly weather data
 * @param referenceHeight - Height at which wind speed is measured (default 10m)
 * @returns Array of power outputs
 */
export function generateWindForecast(
  asset: WindAsset,
  weatherData: HourlyWeatherData[],
  referenceHeight: number = 10
): PowerOutput[] {
  return weatherData.map((hour) => {
    let power = 0;
    
    if (hour.windSpeed !== undefined && hour.windSpeed > 0) {
      // Extrapolate wind speed to hub height
      const windSpeedAtHub = extrapolateWindSpeed(
        hour.windSpeed,
        referenceHeight,
        asset.hubHeight
      );
      
      // Calculate base power
      power = calculateWindPower(windSpeedAtHub, asset);
      
      // Apply air density correction if temperature is available
      if (hour.temperature !== undefined) {
        power = applyAirDensityCorrection(power, hour.temperature);
      }
    }
    
    const capacity = asset.ratedCapacity > 0 ? (power / asset.ratedCapacity) * 100 : 0;
    
    return {
      time: hour.time,
      power: Math.max(0, power),
      capacity: Math.min(100, Math.max(0, capacity))
    };
  });
}

/**
 * Calculate average wind power production for a given average wind speed
 * Used for long-term viability analysis
 * 
 * @param asset - Wind asset configuration
 * @param averageWindSpeed - Average wind speed at hub height (m/s)
 * @returns Average power output in MW
 */
export function calculateAverageWindPower(
  asset: WindAsset,
  averageWindSpeed: number
): number {
  // For long-term averages, we use a simplified approach
  // In reality, you would integrate over a Weibull distribution
  // This is a simplified approximation
  return calculateWindPower(averageWindSpeed, asset);
}

/**
 * Calculate the wind capacity factor
 * Capacity factor = (Actual energy produced) / (Maximum possible energy)
 * 
 * @param actualProduction - Actual energy production in MWh
 * @param ratedCapacity - Rated capacity in MW
 * @param hours - Number of hours in the period
 * @returns Capacity factor as a percentage
 */
export function calculateWindCapacityFactor(
  actualProduction: number,
  ratedCapacity: number,
  hours: number
): number {
  const maxPossibleProduction = ratedCapacity * hours;
  if (maxPossibleProduction === 0) return 0;
  
  return (actualProduction / maxPossibleProduction) * 100;
}

/**
 * Estimate rotor diameter from rated capacity
 * This is a rough approximation based on typical turbine designs
 * 
 * @param ratedCapacity - Rated capacity in MW
 * @returns Estimated rotor diameter in meters
 */
export function estimateRotorDiameter(ratedCapacity: number): number {
  // Typical relationship: D ≈ 60 × P^0.4 (where P is in MW)
  return 60 * Math.pow(ratedCapacity, 0.4);
}

