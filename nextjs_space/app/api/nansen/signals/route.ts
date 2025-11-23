
/**
 * Nansen AI Signals API
 * GET: Fetch Nansen-powered trading signals
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

    const signals = await whaleMonitor.getNansenSignals(tokenAddress, chain);

    return NextResponse.json({ 
      success: true, 
      signals,
      count: signals.length 
    });
  } catch (error: any) {
    console.error('[Nansen Signals API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
