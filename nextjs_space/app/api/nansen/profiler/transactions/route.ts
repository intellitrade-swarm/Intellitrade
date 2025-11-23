
import { NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * GET /api/nansen/profiler/transactions
 * Get transactions for an address
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';
    const limit = parseInt(searchParams.get('limit') || '50');
    const token = searchParams.get('token');

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
    }

    if (!nansenAPI.isConfigured()) {
      return NextResponse.json({ error: 'Nansen API not configured' }, { status: 503 });
    }

    const transactions = await nansenAPI.getAddressTransactions(address, chain, limit, token || undefined);

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
    });
  } catch (error: any) {
    console.error('[Nansen Profiler API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions', details: error.message }, { status: 500 });
  }
}
