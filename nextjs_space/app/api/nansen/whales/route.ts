
/**
 * Nansen Whale Transactions API
 * GET: Fetch recent whale transactions
 */

import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chain = searchParams.get('chain') || 'ethereum';
    const token = searchParams.get('token');
    const minAmountUSD = parseInt(searchParams.get('minAmount') || '100000');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!nansenAPI.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Nansen API not configured' },
        { status: 503 }
      );
    }

    const transactions = await nansenAPI.getWhaleTransactions({
      chain,
      token: token || undefined,
      minAmountUSD,
      limit,
      timeframe: '24h',
    });

    return NextResponse.json({ 
      success: true, 
      transactions,
      count: transactions.length,
      totalValue: transactions.reduce((sum, tx) => sum + tx.amountUSD, 0)
    });
  } catch (error: any) {
    console.error('[Nansen Whales API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
