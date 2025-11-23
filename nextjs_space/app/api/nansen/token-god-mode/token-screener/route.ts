
import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

export const dynamic = 'force-dynamic';

/**
 * Token Screener API Endpoint
 * Fetches comprehensive token screening data with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain') || 'ethereum';
    const limit = parseInt(searchParams.get('limit') || '20');
    const minMarketCap = searchParams.get('minMarketCap');
    const minVolume = searchParams.get('minVolume');

    if (!nansenAPI.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Nansen API not configured' },
        { status: 503 }
      );
    }

    // Get top trending tokens (screener functionality)
    const tokens = await nansenAPI.getTopTrendingTokens(chain, limit);

    // Apply optional filters
    let filteredTokens = tokens;
    if (minMarketCap) {
      const minMC = parseFloat(minMarketCap);
      filteredTokens = filteredTokens.filter(t => (t.marketCap || 0) >= minMC);
    }
    if (minVolume) {
      const minVol = parseFloat(minVolume);
      filteredTokens = filteredTokens.filter(t => (t.volume24h || 0) >= minVol);
    }

    return NextResponse.json({
      success: true,
      data: filteredTokens,
      count: filteredTokens.length,
      chain,
      filters: {
        minMarketCap: minMarketCap || 'none',
        minVolume: minVolume || 'none',
      },
    });
  } catch (error: any) {
    console.error('[Token Screener API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch token screener data' },
      { status: 500 }
    );
  }
}
