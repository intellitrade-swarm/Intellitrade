
import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * API Endpoint: Nansen Smart Money Holdings
 * GET /api/nansen/smart-money/holdings
 * 
 * Returns current smart money holders and their balances for a specific token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';
    const limit = parseInt(searchParams.get('limit') || '50');

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

    const holdings = await nansenAPI.getSmartMoneyHoldings(address, chain, limit);

    return NextResponse.json({
      success: true,
      data: holdings,
    });
  } catch (error) {
    console.error('[Nansen Smart Money Holdings API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch smart money holdings',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
