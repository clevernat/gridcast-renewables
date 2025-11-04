import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/api/weatherClient';

/**
 * GET /api/geocode?address=...
 * 
 * Convert an address to geographic coordinates
 * 
 * Query parameters:
 * - address: string (required)
 * 
 * Response:
 * {
 *   success: boolean,
 *   data?: { address: string, latitude: number, longitude: number },
 *   error?: { error: string, message: string }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({
        success: false,
        error: {
          error: 'INVALID_INPUT',
          message: 'Address parameter is required'
        }
      }, { status: 400 });
    }

    const location = await geocodeAddress(address);

    return NextResponse.json({
      success: true,
      data: location
    });

  } catch (error: any) {
    console.error('Error geocoding address:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        error: 'GEOCODING_FAILED',
        message: error.message || 'Failed to geocode the provided address'
      }
    }, { status: 500 });
  }
}

