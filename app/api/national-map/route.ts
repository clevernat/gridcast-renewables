import { NextRequest, NextResponse } from "next/server";
import { fetchOpenMeteoForecast } from "@/lib/api/weatherClient";
import { NationalEnergyMap, GridPoint, NationalMapAPIResponse } from "@/types";

/**
 * GET /api/national-map?type=solar|wind&hour=0-23
 *
 * Generate a national energy potential map for the United States
 *
 * Query parameters:
 * - type: 'solar' | 'wind' (required)
 * - hour: 0-23 (optional, default 0 - current hour)
 *
 * Response:
 * {
 *   success: boolean,
 *   data?: NationalEnergyMap,
 *   error?: { error: string, message: string }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") as "solar" | "wind";
    const hour = parseInt(searchParams.get("hour") || "0");

    // Validate input
    if (!type || (type !== "solar" && type !== "wind")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "INVALID_INPUT",
            message: 'Type parameter must be either "solar" or "wind"',
          },
        } as NationalMapAPIResponse,
        { status: 400 }
      );
    }

    if (hour < 0 || hour > 23) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "INVALID_INPUT",
            message: "Hour parameter must be between 0 and 23",
          },
        } as NationalMapAPIResponse,
        { status: 400 }
      );
    }

    // Define grid points across the continental United States
    // Using a 5-degree grid for demonstration (can be made finer)
    const gridPoints: GridPoint[] = [];
    const bounds = {
      north: 49, // Northern border
      south: 25, // Southern border (excluding Alaska and Hawaii for simplicity)
      west: -125, // Western border
      east: -66, // Eastern border
    };

    const latStep = 4; // degrees
    const lonStep = 5; // degrees

    // Sample grid points
    const samplePoints: Array<{ lat: number; lon: number }> = [];

    for (let lat = bounds.south; lat <= bounds.north; lat += latStep) {
      for (let lon = bounds.west; lon <= bounds.east; lon += lonStep) {
        samplePoints.push({ lat, lon });
      }
    }

    // Fetch weather data for each grid point with rate limiting
    // Process in batches to avoid hitting API rate limits
    const batchSize = 5; // Process 5 requests at a time
    const delayBetweenBatches = 1000; // 1 second delay between batches
    const validPoints: GridPoint[] = [];

    for (let i = 0; i < samplePoints.length; i += batchSize) {
      const batch = samplePoints.slice(i, i + batchSize);

      const batchPromises = batch.map(async (point) => {
        try {
          const weatherData = await fetchOpenMeteoForecast(
            { latitude: point.lat, longitude: point.lon },
            24
          );

          if (weatherData && weatherData.length > hour) {
            const hourData = weatherData[hour];
            let value = 0;

            if (type === "solar") {
              // Use solar irradiance as the potential value
              value = hourData.solarIrradiance || 0;
            } else if (type === "wind") {
              // Use wind speed as the potential value
              value = hourData.windSpeed || 0;
            }

            return {
              latitude: point.lat,
              longitude: point.lon,
              value,
            };
          }

          return null;
        } catch (error) {
          console.error(
            `Error fetching data for point (${point.lat}, ${point.lon}):`,
            error
          );
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const validBatchPoints = batchResults.filter(
        (p): p is GridPoint => p !== null
      );
      validPoints.push(...validBatchPoints);

      // Add delay between batches (except for the last batch)
      if (i + batchSize < samplePoints.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenBatches)
        );
      }
    }

    if (validPoints.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "NO_DATA",
            message: "No data available for the national map",
          },
        } as NationalMapAPIResponse,
        { status: 404 }
      );
    }

    // Get timestamp for the requested hour
    const now = new Date();
    now.setHours(now.getHours() + hour);
    const timestamp = now.toISOString();

    const nationalMap: NationalEnergyMap = {
      type,
      timestamp,
      gridPoints: validPoints,
      bounds,
    };

    return NextResponse.json({
      success: true,
      data: nationalMap,
    } as NationalMapAPIResponse);
  } catch (error: any) {
    console.error("Error generating national map:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "INTERNAL_ERROR",
          message:
            error.message ||
            "An error occurred while generating the national map",
          details:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
      } as NationalMapAPIResponse,
      { status: 500 }
    );
  }
}
