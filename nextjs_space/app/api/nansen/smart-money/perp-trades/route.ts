
import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * GET /api/nansen/smart-money/perp-trades
 * 
 * Get recent perp trades from smart money wallets
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain') || 'ethereum';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!nansenAPI.isConfigured()) {
      return NextResponse.json(
        { error: 'Nansen API not configured' },
        { status: 503 }
      );
    }

    const trades = await nansenAPI.getSmartMoneyPerpTrades(chain, limit);

    return NextResponse.json({
      success: true,
      data: trades,
      count: trades.length,
    });
  } catch (error) {
    console.error('[Nansen Smart Money Perp Trades API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch smart money perp trades' },
      { status: 500 }
    );
  }
}
