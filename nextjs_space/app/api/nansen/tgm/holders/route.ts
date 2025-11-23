
import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * API Endpoint: Nansen TGM Token Holders
 * GET /api/nansen/tgm/holders
 * 
 * Returns token holder distribution including smart money holders
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';

    if (!address) {
      return NextResponse.json(
        { error: 'Token address is required' },
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

    const holderDistribution = await nansenAPI.getTokenHolderDistribution(address, chain);

    return NextResponse.json({
      success: true,
      data: holderDistribution,
    });
  } catch (error) {
    console.error('[Nansen TGM Holders API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch token holder distribution',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
