import { NextRequest, NextResponse } from "next/server";
import { fetchOpenMeteoForecast } from "@/lib/api/weatherClient";
import { NationalEnergyMap, GridPoint, NationalMapAPIResponse } from "@/types";

/**
 * GET /api/national-map?type=solar|wind
 *
 * Generate a national energy potential map for the United States
 * Returns data for ALL 24 hours at once for better performance
 *
 * Query parameters:
 * - type: 'solar' | 'wind' (required)
 *
 * Response:
 * {
 *   success: boolean,
 *   data?: { hourlyData: NationalEnergyMap[], bounds: any },
 *   error?: { error: string, message: string }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") as "solar" | "wind";

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

    // Fetch weather data for each grid point (24 hours at once)
    // Process in batches to avoid hitting API rate limits
    const batchSize = 10; // Process 10 requests at a time (faster)
    const delayBetweenBatches = 500; // 500ms delay between batches

    // Store data for all 24 hours
    const hourlyGridPoints: GridPoint[][] = Array.from(
      { length: 24 },
      () => []
    );

    for (let i = 0; i < samplePoints.length; i += batchSize) {
      const batch = samplePoints.slice(i, i + batchSize);

      const batchPromises = batch.map(async (point) => {
        try {
          const weatherData = await fetchOpenMeteoForecast(
            { latitude: point.lat, longitude: point.lon },
            24
          );

          if (weatherData && weatherData.length >= 24) {
            // Extract values for all 24 hours
            return weatherData.map((hourData, hour) => {
              let value = 0;

              if (type === "solar") {
                value = hourData.solarIrradiance || 0;
              } else if (type === "wind") {
                value = hourData.windSpeed || 0;
              }

              return {
                latitude: point.lat,
                longitude: point.lon,
                value,
                hour,
              };
            });
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

      // Organize data by hour
      batchResults.forEach((pointData) => {
        if (pointData) {
          pointData.forEach((data: any) => {
            hourlyGridPoints[data.hour].push({
              latitude: data.latitude,
              longitude: data.longitude,
              value: data.value,
            });
          });
        }
      });

      // Add delay between batches (except for the last batch)
      if (i + batchSize < samplePoints.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenBatches)
        );
      }
    }

    // Check if we have data
    if (hourlyGridPoints[0].length === 0) {
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

    // Create NationalEnergyMap objects for each hour
    const hourlyData: NationalEnergyMap[] = hourlyGridPoints.map(
      (gridPoints, hour) => {
        const now = new Date();
        now.setHours(now.getHours() + hour);

        return {
          type,
          timestamp: now.toISOString(),
          gridPoints,
          bounds,
        };
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        hourlyData,
        bounds,
      },
    } as any);
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
