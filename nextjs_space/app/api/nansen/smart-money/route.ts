
/**
 * Nansen Smart Money Activity API
 * GET: Fetch smart money activity for a token
 */

import { NextRequest, NextResponse } from 'next/server';
import { whaleMonitor } from '@/lib/whale-monitor';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenAddress = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';

    if (!tokenAddress) {
      return NextResponse.json(
        { success: false, error: 'Token address is required' },
        { status: 400 }
      );
    }

    const activity = await whaleMonitor.getSmartMoneyActivity(tokenAddress, chain);

    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch smart money activity' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, activity });
  } catch (error: any) {
    console.error('[Nansen Smart Money API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
