import axios from 'axios';
import { HourlyWeatherData, Location } from '@/types';

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
        'temperature_2m',
        'cloud_cover',
        'wind_speed_10m',
        'wind_speed_80m',
        'wind_speed_100m',
        'wind_speed_120m',
        'wind_direction_10m',
        'shortwave_radiation',
        'direct_radiation',
        'diffuse_radiation'
      ].join(','),
      temperature_unit: 'celsius',
      wind_speed_unit: 'ms',
      timezone: 'auto',
      forecast_days: Math.ceil(hours / 24).toString()
    });

    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
      { timeout: 10000 }
    );

    const data = response.data;
    const hourlyData: HourlyWeatherData[] = [];

    // Parse the response and limit to requested hours
    for (let i = 0; i < Math.min(hours, data.hourly.time.length); i++) {
      hourlyData.push({
        time: data.hourly.time[i],
        temperature: data.hourly.temperature_2m?.[i],
        solarIrradiance: data.hourly.shortwave_radiation?.[i], // W/m²
        cloudCover: data.hourly.cloud_cover?.[i],
        windSpeed: data.hourly.wind_speed_10m?.[i], // m/s at 10m
        windDirection: data.hourly.wind_direction_10m?.[i]
      });
    }

    return hourlyData;
  } catch (error) {
    console.error('Error fetching Open-Meteo forecast:', error);
    throw new Error('Failed to fetch weather forecast from Open-Meteo');
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
        'temperature_2m',
        'cloud_cover',
        'wind_speed_10m',
        'shortwave_radiation'
      ].join(','),
      temperature_unit: 'celsius',
      wind_speed_unit: 'ms',
      timezone: 'UTC'
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
        windSpeed: data.hourly.wind_speed_10m?.[i]
      });
    }

    return hourlyData;
  } catch (error) {
    console.error('Error fetching Open-Meteo historical data:', error);
    throw new Error('Failed to fetch historical weather data from Open-Meteo');
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
      parameters: parameters.join(','),
      community: 'RE', // Renewable Energy community
      temporal_api: 'hourly',
      format: 'JSON'
    });

    const response = await axios.get(
      `https://power.larc.nasa.gov/api/temporal/hourly/point?${params.toString()}`,
      { timeout: 30000 }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching NASA POWER data:', error);
    throw new Error('Failed to fetch data from NASA POWER API');
  }
}

/**
 * Geocode an address to coordinates using Open-Meteo Geocoding API
 * 
 * @param address - Address string
 * @returns Location with coordinates
 */
export async function geocodeAddress(address: string): Promise<Location> {
  try {
    const params = new URLSearchParams({
      name: address,
      count: '1',
      language: 'en',
      format: 'json'
    });

    const response = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`,
      { timeout: 10000 }
    );

    const results = response.data.results;
    if (!results || results.length === 0) {
      throw new Error('Address not found');
    }

    const result = results[0];
    return {
      address: result.name,
      latitude: result.latitude,
      longitude: result.longitude
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw new Error('Failed to geocode address');
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
): Record<number, {
  solarIrradiance: number;
  windSpeed: number;
  temperature: number;
  dataPoints: number;
}> {
  const monthlyData: Record<number, {
    solarIrradiance: number[];
    windSpeed: number[];
    temperature: number[];
  }> = {};

  // Initialize for all 12 months
  for (let i = 1; i <= 12; i++) {
    monthlyData[i] = {
      solarIrradiance: [],
      windSpeed: [],
      temperature: []
    };
  }

  // Group data by month
  historicalData.forEach(hour => {
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
      solarIrradiance: data.solarIrradiance.length > 0
        ? data.solarIrradiance.reduce((a, b) => a + b, 0) / data.solarIrradiance.length
        : 0,
      windSpeed: data.windSpeed.length > 0
        ? data.windSpeed.reduce((a, b) => a + b, 0) / data.windSpeed.length
        : 0,
      temperature: data.temperature.length > 0
        ? data.temperature.reduce((a, b) => a + b, 0) / data.temperature.length
        : 0,
      dataPoints: data.solarIrradiance.length
    };
  }

  return averages;
}

