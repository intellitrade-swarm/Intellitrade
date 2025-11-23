
import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * API Endpoint: Nansen Profiler - Perpetual Positions
 * GET /api/nansen/profiler/perp-positions
 * 
 * Returns active perpetual positions for a given address across platforms
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Check if Nansen API is configured
    if (!nansenAPI.isConfigured()) {
      return NextResponse.json(
        { 
          error: 'Nansen API not configured',
          message: 'NANSEN_API_KEY is required in environment variables'
        },
        { status: 503 }
      );
    }

    const perpPositions = await nansenAPI.getAddressPerpPositions(address, chain);

    return NextResponse.json({
      success: true,
      data: perpPositions,
    });
  } catch (error) {
    console.error('[Nansen Perp Positions API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch perpetual positions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
