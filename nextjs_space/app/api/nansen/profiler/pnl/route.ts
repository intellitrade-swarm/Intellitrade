
import { NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * GET /api/nansen/profiler/pnl
 * Get PnL and trade performance for an address
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';
    const token = searchParams.get('token');
    const timeframe = searchParams.get('timeframe') || '30d';

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
    }

    if (!nansenAPI.isConfigured()) {
      return NextResponse.json({ error: 'Nansen API not configured' }, { status: 503 });
    }

    const pnl = await nansenAPI.getAddressPnL(address, chain, token || undefined, timeframe);

    return NextResponse.json({
      success: true,
      pnl,
    });
  } catch (error: any) {
    console.error('[Nansen Profiler API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch address PnL', details: error.message }, { status: 500 });
  }
}
