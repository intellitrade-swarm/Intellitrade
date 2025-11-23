
import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * GET /api/nansen/perp-screener
 * 
 * Get comprehensive perp market metrics and screener data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain') || 'ethereum';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!nansenAPI.isConfigured()) {
      return NextResponse.json(
        { error: 'Nansen API not configured' },
        { status: 503 }
      );
    }

    const markets = await nansenAPI.getPerpScreener(chain, limit);

    return NextResponse.json({
      success: true,
      data: markets,
      count: markets.length,
    });
  } catch (error) {
    console.error('[Nansen Perp Screener API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch perp screener data' },
      { status: 500 }
    );
  }
}
