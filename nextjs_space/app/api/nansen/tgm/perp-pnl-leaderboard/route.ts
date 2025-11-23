
import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * GET /api/nansen/tgm/perp-pnl-leaderboard
 * 
 * Get top perp traders by profitability
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'GMX';
    const timeframe = searchParams.get('timeframe') || '30d';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!nansenAPI.isConfigured()) {
      return NextResponse.json(
        { error: 'Nansen API not configured' },
        { status: 503 }
      );
    }

    const leaderboard = await nansenAPI.getTGMPerpPnLLeaderboard(platform, timeframe, limit);

    return NextResponse.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error('[Nansen TGM Perp PnL Leaderboard API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch perp PnL leaderboard' },
      { status: 500 }
    );
  }
}
