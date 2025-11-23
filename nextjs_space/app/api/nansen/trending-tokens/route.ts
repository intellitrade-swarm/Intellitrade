import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * GET /api/nansen/trending-tokens
 * Returns top trending tokens with real Nansen data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chain = searchParams.get('chain') || 'ethereum';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!nansenAPI.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Nansen API not configured' },
        { status: 503 }
      );
    }

    // Get top trending tokens from Nansen
    const tokens = await nansenAPI.getTopTrendingTokens(chain, limit);

    return NextResponse.json({
      success: true,
      data: tokens,
      count: tokens.length,
      source: 'Nansen API',
      chain,
    });
  } catch (error: any) {
    console.error('[Nansen Trending Tokens API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch trending tokens' },
      { status: 500 }
    );
  }
}
