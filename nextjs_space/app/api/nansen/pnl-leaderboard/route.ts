
/**
 * Nansen PnL Leaderboard API
 * GET: Fetch top traders by profitability for a token
 */

import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenAddress = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';
    const timeframe = searchParams.get('timeframe') || '30d';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!tokenAddress) {
      return NextResponse.json(
        { success: false, error: 'Token address is required' },
        { status: 400 }
      );
    }

    if (!nansenAPI.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Nansen API not configured' },
        { status: 503 }
      );
    }

    const leaderboard = await nansenAPI.getPnLLeaderboard(tokenAddress, chain, timeframe, limit);

    // Calculate summary statistics
    const summary = {
      totalTraders: leaderboard.length,
      avgPnL: leaderboard.reduce((sum, entry) => sum + entry.totalPnL, 0) / (leaderboard.length || 1),
      avgROI: leaderboard.reduce((sum, entry) => sum + entry.totalROI, 0) / (leaderboard.length || 1),
      totalRealizedPnL: leaderboard.reduce((sum, entry) => sum + entry.realizedPnL, 0),
      totalUnrealizedPnL: leaderboard.reduce((sum, entry) => sum + entry.unrealizedPnL, 0),
      profitableTraders: leaderboard.filter(entry => entry.totalPnL > 0).length,
    };

    return NextResponse.json({ 
      success: true, 
      leaderboard,
      summary,
      timeframe
    });
  } catch (error: any) {
    console.error('[Nansen PnL Leaderboard API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
