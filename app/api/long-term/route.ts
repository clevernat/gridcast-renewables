import { NextRequest, NextResponse } from 'next/server';
import { fetchOpenMeteoHistorical, calculateMonthlyAverages } from '@/lib/api/weatherClient';
import { calculateSolarCapacityFactor } from '@/lib/models/solarModel';
import { calculateWindCapacityFactor } from '@/lib/models/windModel';
import { Asset, Location, LongTermAnalysis, MonthlyAverage, LongTermAPIResponse } from '@/types';
import { getMonthName } from '@/lib/utils/formatters';

/**
 * POST /api/long-term
 * 
 * Generate a long-term viability analysis based on historical weather data
 * 
 * Request body:
 * {
 *   location: { latitude: number, longitude: number, address?: string },
 *   asset: SolarAsset | WindAsset,
 *   years?: number (default 5, max 10)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data?: LongTermAnalysis,
 *   error?: { error: string, message: string }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, asset, years = 5 } = body as { 
      location: Location; 
      asset: Asset;
      years?: number;
    };

    // Validate input
    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      return NextResponse.json({
        success: false,
        error: {
          error: 'INVALID_INPUT',
          message: 'Valid location coordinates are required'
        }
      } as LongTermAPIResponse, { status: 400 });
    }

    if (!asset || !asset.type) {
      return NextResponse.json({
        success: false,
        error: {
          error: 'INVALID_INPUT',
          message: 'Valid asset configuration is required'
        }
      } as LongTermAPIResponse, { status: 400 });
    }

    // Limit years to reasonable range
    const analysisYears = Math.min(Math.max(years, 1), 10);

    // Calculate date range for historical data
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    const startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - analysisYears);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch historical weather data
    const historicalData = await fetchOpenMeteoHistorical(
      location,
      startDateStr,
      endDateStr
    );

    if (!historicalData || historicalData.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          error: 'NO_DATA',
          message: 'No historical weather data available for this location'
        }
      } as LongTermAPIResponse, { status: 404 });
    }

    // Calculate monthly averages
    const monthlyData = calculateMonthlyAverages(historicalData);

    // Generate monthly production estimates
    const monthlyAverages: MonthlyAverage[] = [];
    let totalAnnualProduction = 0;

    for (let month = 1; month <= 12; month++) {
      const data = monthlyData[month];
      let monthlyProduction = 0;
      let capacityFactor = 0;

      if (asset.type === 'solar') {
        // Calculate average daily solar production
        // Convert W/m² to kWh/m²/day (average over 24 hours)
        const avgDailyIrradiance = (data.solarIrradiance * 24) / 1000;
        
        // Simplified calculation: use average irradiance
        const avgPower = (data.solarIrradiance / 1000) * asset.dcCapacity * 0.86; // 14% losses
        const hoursInMonth = 730; // Average
        monthlyProduction = avgPower * hoursInMonth;
        
        capacityFactor = calculateSolarCapacityFactor(
          monthlyProduction,
          asset.dcCapacity,
          hoursInMonth
        );
      } else if (asset.type === 'wind') {
        // Calculate average wind power
        const avgWindSpeed = data.windSpeed;
        
        // Simplified power calculation
        const cutInSpeed = asset.cutInSpeed ?? 3;
        const ratedSpeed = asset.ratedSpeed ?? 12;
        
        let avgPower = 0;
        if (avgWindSpeed >= cutInSpeed && avgWindSpeed < ratedSpeed) {
          const vCubed = Math.pow(avgWindSpeed, 3);
          const vCutInCubed = Math.pow(cutInSpeed, 3);
          const vRatedCubed = Math.pow(ratedSpeed, 3);
          avgPower = asset.ratedCapacity * ((vCubed - vCutInCubed) / (vRatedCubed - vCutInCubed));
        } else if (avgWindSpeed >= ratedSpeed) {
          avgPower = asset.ratedCapacity;
        }
        
        const hoursInMonth = 730;
        monthlyProduction = avgPower * hoursInMonth;
        
        capacityFactor = calculateWindCapacityFactor(
          monthlyProduction,
          asset.ratedCapacity,
          hoursInMonth
        );
      }

      monthlyAverages.push({
        month,
        monthName: getMonthName(month),
        averageProduction: monthlyProduction,
        averageCapacityFactor: capacityFactor
      });

      totalAnnualProduction += monthlyProduction;
    }

    // Calculate overall capacity factor
    const hoursInYear = 8760;
    const ratedCapacity = asset.type === 'solar' ? asset.dcCapacity : asset.ratedCapacity;
    const averageCapacityFactor = (totalAnnualProduction / (ratedCapacity * hoursInYear)) * 100;

    // Construct response
    const analysis: LongTermAnalysis = {
      asset,
      location,
      monthlyAverages,
      annualProduction: totalAnnualProduction,
      averageCapacityFactor
    };

    return NextResponse.json({
      success: true,
      data: analysis
    } as LongTermAPIResponse);

  } catch (error: any) {
    console.error('Error generating long-term analysis:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        error: 'INTERNAL_ERROR',
        message: error.message || 'An error occurred while generating the long-term analysis',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    } as LongTermAPIResponse, { status: 500 });
  }
}

