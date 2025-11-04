import { NextRequest, NextResponse } from 'next/server';
import { fetchOpenMeteoForecast } from '@/lib/api/weatherClient';
import { generateSolarForecast } from '@/lib/models/solarModel';
import { generateWindForecast } from '@/lib/models/windModel';
import { Asset, Location, PowerForecast, ForecastAPIResponse } from '@/types';

/**
 * POST /api/forecast
 * 
 * Generate a 48-hour power forecast for a renewable energy asset
 * 
 * Request body:
 * {
 *   location: { latitude: number, longitude: number, address?: string },
 *   asset: SolarAsset | WindAsset
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data?: PowerForecast,
 *   error?: { error: string, message: string }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, asset } = body as { location: Location; asset: Asset };

    // Validate input
    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      return NextResponse.json({
        success: false,
        error: {
          error: 'INVALID_INPUT',
          message: 'Valid location coordinates are required'
        }
      } as ForecastAPIResponse, { status: 400 });
    }

    if (!asset || !asset.type) {
      return NextResponse.json({
        success: false,
        error: {
          error: 'INVALID_INPUT',
          message: 'Valid asset configuration is required'
        }
      } as ForecastAPIResponse, { status: 400 });
    }

    // Fetch weather forecast data
    const weatherData = await fetchOpenMeteoForecast(location, 48);

    if (!weatherData || weatherData.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          error: 'NO_DATA',
          message: 'No weather data available for this location'
        }
      } as ForecastAPIResponse, { status: 404 });
    }

    // Generate power forecast based on asset type
    let powerOutputs;
    if (asset.type === 'solar') {
      powerOutputs = generateSolarForecast(asset, weatherData);
    } else if (asset.type === 'wind') {
      powerOutputs = generateWindForecast(asset, weatherData);
    } else {
      return NextResponse.json({
        success: false,
        error: {
          error: 'INVALID_ASSET_TYPE',
          message: 'Asset type must be either "solar" or "wind"'
        }
      } as ForecastAPIResponse, { status: 400 });
    }

    // Construct response
    const forecast: PowerForecast = {
      asset,
      location,
      outputs: powerOutputs,
      meteorologicalData: weatherData
    };

    return NextResponse.json({
      success: true,
      data: forecast
    } as ForecastAPIResponse);

  } catch (error: any) {
    console.error('Error generating forecast:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        error: 'INTERNAL_ERROR',
        message: error.message || 'An error occurred while generating the forecast',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    } as ForecastAPIResponse, { status: 500 });
  }
}

