
import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * API Endpoint: Nansen Smart Money DEX Trades
 * GET /api/nansen/smart-money/dex-trades
 * 
 * Returns recent DEX trading activity from smart money wallets for a token
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

    const dexTrades = await nansenAPI.getSmartMoneyDEXTrades(address, chain, limit);

    return NextResponse.json({
      success: true,
      data: dexTrades,
    });
  } catch (error) {
    console.error('[Nansen DEX Trades API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch smart money DEX trades',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
