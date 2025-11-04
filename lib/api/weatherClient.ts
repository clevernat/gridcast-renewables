import axios from "axios";
import { HourlyWeatherData, Location } from "@/types";

/**
 * Weather API Client
 *
 * This module provides functions to fetch weather data from:
 * 1. Open-Meteo API (primary) - Free, no API key required
 * 2. NASA POWER API (backup) - Free, authoritative scientific data
 */

/**
 * Fetch forecast data from Open-Meteo API
 *
 * Open-Meteo provides high-quality weather forecasts with:
 * - Hourly data up to 16 days
 * - Solar radiation data
 * - Wind speed at multiple heights
 * - No API key required
 *
 * API Documentation: https://open-meteo.com/en/docs
 *
 * @param location - Location coordinates
 * @param hours - Number of hours to forecast (default 48)
 * @returns Array of hourly weather data
 */
export async function fetchOpenMeteoForecast(
  location: Location,
  hours: number = 48
): Promise<HourlyWeatherData[]> {
  try {
    const params = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      hourly: [
        // Temperature & Thermodynamics
        "temperature_2m",
        "apparent_temperature",
        "dew_point_2m",

        // Solar Radiation
        "shortwave_radiation",
        "direct_radiation",
        "diffuse_radiation",
        "direct_normal_irradiance",
        "terrestrial_radiation",

        // Atmospheric Pressure
        "surface_pressure",
        "pressure_msl",

        // Humidity & Moisture
        "relative_humidity_2m",
        "vapour_pressure_deficit",

        // Precipitation
        "precipitation",
        "rain",
        "snowfall",
        "precipitation_probability",

        // Cloud Cover
        "cloud_cover",
        "cloud_cover_low",
        "cloud_cover_mid",
        "cloud_cover_high",

        // Wind (Multi-level)
        "wind_speed_10m",
        "wind_speed_80m",
        "wind_speed_100m",
        "wind_speed_120m",
        "wind_direction_10m",
        "wind_gusts_10m",

        // Atmospheric Stability
        "cape",
        "lifted_index",

        // Air Quality & Visibility
        "uv_index",
        "visibility",

        // Soil & Surface
        "soil_temperature_0cm",
        "soil_moisture_0_to_1cm",
        "snow_depth",
      ].join(","),
      temperature_unit: "celsius",
      wind_speed_unit: "ms",
      precipitation_unit: "mm",
      timezone: "auto",
      forecast_days: Math.ceil(hours / 24).toString(),
    });

    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
      { timeout: 15000 }
    );

    const data = response.data;
    const hourlyData: HourlyWeatherData[] = [];

    // Parse the response and limit to requested hours
    for (let i = 0; i < Math.min(hours, data.hourly.time.length); i++) {
      const missingFlags: string[] = [];

      // Check for missing critical data
      if (!data.hourly.temperature_2m?.[i]) missingFlags.push("temperature");
      if (!data.hourly.surface_pressure?.[i]) missingFlags.push("pressure");
      if (!data.hourly.relative_humidity_2m?.[i]) missingFlags.push("humidity");

      // Determine data quality based on completeness
      let quality: "excellent" | "good" | "fair" | "poor" = "excellent";
      if (missingFlags.length > 0) quality = "good";
      if (missingFlags.length > 2) quality = "fair";
      if (missingFlags.length > 5) quality = "poor";

      hourlyData.push({
        time: data.hourly.time[i],

        // Temperature & Thermodynamics
        temperature: data.hourly.temperature_2m?.[i],
        apparentTemperature: data.hourly.apparent_temperature?.[i],
        dewPoint: data.hourly.dew_point_2m?.[i],

        // Solar Radiation
        solarIrradiance: data.hourly.shortwave_radiation?.[i],
        directRadiation: data.hourly.direct_radiation?.[i],
        diffuseRadiation: data.hourly.diffuse_radiation?.[i],
        directNormalIrradiance: data.hourly.direct_normal_irradiance?.[i],
        terrestrialRadiation: data.hourly.terrestrial_radiation?.[i],

        // Atmospheric Pressure
        surfacePressure: data.hourly.surface_pressure?.[i],
        seaLevelPressure: data.hourly.pressure_msl?.[i],

        // Humidity & Moisture
        relativeHumidity: data.hourly.relative_humidity_2m?.[i],
        vaporPressureDeficit: data.hourly.vapour_pressure_deficit?.[i],

        // Precipitation
        precipitation: data.hourly.precipitation?.[i],
        rain: data.hourly.rain?.[i],
        snowfall: data.hourly.snowfall?.[i],
        precipitationProbability: data.hourly.precipitation_probability?.[i],

        // Cloud Cover
        cloudCover: data.hourly.cloud_cover?.[i],
        cloudCoverLow: data.hourly.cloud_cover_low?.[i],
        cloudCoverMid: data.hourly.cloud_cover_mid?.[i],
        cloudCoverHigh: data.hourly.cloud_cover_high?.[i],

        // Wind (Multi-level)
        windSpeed: data.hourly.wind_speed_10m?.[i],
        windSpeed10m: data.hourly.wind_speed_10m?.[i],
        windSpeed80m: data.hourly.wind_speed_80m?.[i],
        windSpeed100m: data.hourly.wind_speed_100m?.[i],
        windSpeed120m: data.hourly.wind_speed_120m?.[i],
        windDirection: data.hourly.wind_direction_10m?.[i],
        windGusts: data.hourly.wind_gusts_10m?.[i],

        // Atmospheric Stability
        cape: data.hourly.cape?.[i],
        surfaceLiftedIndex: data.hourly.lifted_index?.[i],

        // Air Quality & Visibility
        uvIndex: data.hourly.uv_index?.[i],
        visibility: data.hourly.visibility?.[i],

        // Soil & Surface
        soilTemperature: data.hourly.soil_temperature_0cm?.[i],
        soilMoisture: data.hourly.soil_moisture_0_to_1cm?.[i],
        snowDepth: data.hourly.snow_depth?.[i],

        // Data Quality
        dataQuality: quality,
        missingDataFlags: missingFlags.length > 0 ? missingFlags : undefined,
      });
    }

    return hourlyData;
  } catch (error) {
    console.error("Error fetching Open-Meteo forecast:", error);
    throw new Error("Failed to fetch weather forecast from Open-Meteo");
  }
}

/**
 * Fetch historical climate data from Open-Meteo Archive API
 *
 * Used for long-term viability analysis.
 * Provides historical data back to 1940.
 *
 * @param location - Location coordinates
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Array of hourly weather data
 */
export async function fetchOpenMeteoHistorical(
  location: Location,
  startDate: string,
  endDate: string
): Promise<HourlyWeatherData[]> {
  try {
    const params = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      start_date: startDate,
      end_date: endDate,
      hourly: [
        "temperature_2m",
        "cloud_cover",
        "wind_speed_10m",
        "shortwave_radiation",
      ].join(","),
      temperature_unit: "celsius",
      wind_speed_unit: "ms",
      timezone: "UTC",
    });

    const response = await axios.get(
      `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`,
      { timeout: 30000 }
    );

    const data = response.data;
    const hourlyData: HourlyWeatherData[] = [];

    for (let i = 0; i < data.hourly.time.length; i++) {
      hourlyData.push({
        time: data.hourly.time[i],
        temperature: data.hourly.temperature_2m?.[i],
        solarIrradiance: data.hourly.shortwave_radiation?.[i],
        cloudCover: data.hourly.cloud_cover?.[i],
        windSpeed: data.hourly.wind_speed_10m?.[i],
      });
    }

    return hourlyData;
  } catch (error) {
    console.error("Error fetching Open-Meteo historical data:", error);
    throw new Error("Failed to fetch historical weather data from Open-Meteo");
  }
}

/**
 * Fetch data from NASA POWER API
 *
 * NASA POWER provides authoritative solar and meteorological data:
 * - Global coverage
 * - Historical data from 1981
 * - Validated against ground measurements
 *
 * API Documentation: https://power.larc.nasa.gov/docs/
 *
 * @param location - Location coordinates
 * @param startDate - Start date (YYYYMMDD)
 * @param endDate - End date (YYYYMMDD)
 * @param parameters - Array of parameter codes
 * @returns Raw NASA POWER data
 */
export async function fetchNASAPowerData(
  location: Location,
  startDate: string,
  endDate: string,
  parameters: string[]
): Promise<any> {
  try {
    const params = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      start: startDate,
      end: endDate,
      parameters: parameters.join(","),
      community: "RE", // Renewable Energy community
      temporal_api: "hourly",
      format: "JSON",
    });

    const response = await axios.get(
      `https://power.larc.nasa.gov/api/temporal/hourly/point?${params.toString()}`,
      { timeout: 30000 }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching NASA POWER data:", error);
    throw new Error("Failed to fetch data from NASA POWER API");
  }
}

/**
 * Geocode an address to coordinates using Nominatim (OpenStreetMap) API
 *
 * @param address - Address string
 * @returns Location with coordinates
 */
export async function geocodeAddress(address: string): Promise<Location> {
  try {
    const params = new URLSearchParams({
      q: address,
      format: "json",
      limit: "1",
      addressdetails: "1",
    });

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        timeout: 10000,
        headers: {
          "User-Agent": "GridCast-Renewables/1.0",
        },
      }
    );

    const results = response.data;
    if (!results || results.length === 0) {
      throw new Error("Address not found");
    }

    const result = results[0];
    return {
      address: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };
  } catch (error) {
    console.error("Error geocoding address:", error);
    throw new Error("Failed to geocode address");
  }
}

/**
 * Calculate monthly averages from historical data
 *
 * @param historicalData - Array of hourly historical weather data
 * @returns Object with monthly averages for each parameter
 */
export function calculateMonthlyAverages(
  historicalData: HourlyWeatherData[]
): Record<
  number,
  {
    solarIrradiance: number;
    windSpeed: number;
    temperature: number;
    dataPoints: number;
  }
> {
  const monthlyData: Record<
    number,
    {
      solarIrradiance: number[];
      windSpeed: number[];
      temperature: number[];
    }
  > = {};

  // Initialize for all 12 months
  for (let i = 1; i <= 12; i++) {
    monthlyData[i] = {
      solarIrradiance: [],
      windSpeed: [],
      temperature: [],
    };
  }

  // Group data by month
  historicalData.forEach((hour) => {
    const date = new Date(hour.time);
    const month = date.getMonth() + 1; // 1-12

    if (hour.solarIrradiance !== undefined) {
      monthlyData[month].solarIrradiance.push(hour.solarIrradiance);
    }
    if (hour.windSpeed !== undefined) {
      monthlyData[month].windSpeed.push(hour.windSpeed);
    }
    if (hour.temperature !== undefined) {
      monthlyData[month].temperature.push(hour.temperature);
    }
  });

  // Calculate averages
  const averages: Record<number, any> = {};
  for (let month = 1; month <= 12; month++) {
    const data = monthlyData[month];
    averages[month] = {
      solarIrradiance:
        data.solarIrradiance.length > 0
          ? data.solarIrradiance.reduce((a, b) => a + b, 0) /
            data.solarIrradiance.length
          : 0,
      windSpeed:
        data.windSpeed.length > 0
          ? data.windSpeed.reduce((a, b) => a + b, 0) / data.windSpeed.length
          : 0,
      temperature:
        data.temperature.length > 0
          ? data.temperature.reduce((a, b) => a + b, 0) /
            data.temperature.length
          : 0,
      dataPoints: data.solarIrradiance.length,
    };
  }

  return averages;
}
