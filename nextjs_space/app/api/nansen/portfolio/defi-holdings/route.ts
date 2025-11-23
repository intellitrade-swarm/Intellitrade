
import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * GET /api/nansen/portfolio/defi-holdings
 * 
 * Get DeFi holdings for a portfolio including perp positions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';

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

    const holdings = await nansenAPI.getDeFiHoldings(address, chain);

    return NextResponse.json({
      success: true,
      data: holdings,
    });
  } catch (error) {
    console.error('[Nansen DeFi Holdings API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DeFi holdings' },
      { status: 500 }
    );
  }
}
