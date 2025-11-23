
import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * API Endpoint: Nansen Smart Money Historical Holdings
 * GET /api/nansen/smart-money/historical-holdings
 * 
 * Returns time-series data of smart money accumulation/distribution for a token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';
    const timeframe = searchParams.get('timeframe') || '30d';

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

    const historicalHoldings = await nansenAPI.getSmartMoneyHistoricalHoldings(address, chain, timeframe);

    return NextResponse.json({
      success: true,
      data: historicalHoldings,
    });
  } catch (error) {
    console.error('[Nansen Historical Holdings API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch historical holdings',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
