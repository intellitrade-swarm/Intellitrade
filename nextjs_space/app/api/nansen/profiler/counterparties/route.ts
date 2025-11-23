
import { NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * GET /api/nansen/profiler/counterparties
 * Get address counterparties (frequent interaction partners)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
    }

    if (!nansenAPI.isConfigured()) {
      return NextResponse.json({ error: 'Nansen API not configured' }, { status: 503 });
    }

    const counterparties = await nansenAPI.getAddressCounterparties(address, chain, limit);

    return NextResponse.json({
      success: true,
      counterparties,
      count: counterparties.length,
    });
  } catch (error: any) {
    console.error('[Nansen Profiler API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch counterparties', details: error.message }, { status: 500 });
  }
}
