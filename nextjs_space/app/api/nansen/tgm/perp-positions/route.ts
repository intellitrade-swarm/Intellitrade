
import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * GET /api/nansen/tgm/perp-positions
 * 
 * Get aggregate perp positioning data for a token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    if (!nansenAPI.isConfigured()) {
      return NextResponse.json(
        { error: 'Nansen API not configured' },
        { status: 503 }
      );
    }

    const positions = await nansenAPI.getTGMPerpPositions(address, chain);

    return NextResponse.json({
      success: true,
      data: positions,
    });
  } catch (error) {
    console.error('[Nansen TGM Perp Positions API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TGM perp positions' },
      { status: 500 }
    );
  }
}
