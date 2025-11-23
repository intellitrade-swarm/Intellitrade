
import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * GET /api/nansen/profiler/perp-trades
 * 
 * Get perpetual trades for a specific address
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';
    const limit = parseInt(searchParams.get('limit') || '50');

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

    const trades = await nansenAPI.getAddressPerpTrades(address, chain, limit);

    return NextResponse.json({
      success: true,
      data: trades,
      count: trades.length,
    });
  } catch (error) {
    console.error('[Nansen Profiler Perp Trades API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address perp trades' },
      { status: 500 }
    );
  }
}
