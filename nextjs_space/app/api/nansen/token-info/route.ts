
/**
 * Nansen Token Information API
 * GET: Fetch comprehensive token data from Nansen
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

    const tokenInfo = await whaleMonitor.getTokenInfo(tokenAddress, chain);

    if (!tokenInfo) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch token info' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, tokenInfo });
  } catch (error: any) {
    console.error('[Nansen Token Info API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
