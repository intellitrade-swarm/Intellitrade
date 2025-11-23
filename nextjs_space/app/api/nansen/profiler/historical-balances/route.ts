
import { NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * GET /api/nansen/profiler/historical-balances
 * Get historical balance data for an address
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const token = searchParams.get('token');
    const chain = searchParams.get('chain') || 'ethereum';
    const timeframe = searchParams.get('timeframe') || '30d';

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ error: 'Token parameter is required' }, { status: 400 });
    }

    if (!nansenAPI.isConfigured()) {
      return NextResponse.json({ error: 'Nansen API not configured' }, { status: 503 });
    }

    const historicalBalances = await nansenAPI.getAddressHistoricalBalances(address, token, chain, timeframe);

    return NextResponse.json({
      success: true,
      historicalBalances,
    });
  } catch (error: any) {
    console.error('[Nansen Profiler API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch historical balances', details: error.message }, { status: 500 });
  }
}
