
/**
 * Nansen Token Flows API
 * GET: Fetch historical token flows by holder category
 */

import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenAddress = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';
    const holderCategory = (searchParams.get('category') || 'smart_money') as any;
    const timeframe = searchParams.get('timeframe') || '7d';

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

    const flows = await nansenAPI.getTokenFlows(tokenAddress, chain, holderCategory, timeframe);

    return NextResponse.json({ 
      success: true, 
      flows,
      count: flows.length,
      category: holderCategory,
      timeframe
    });
  } catch (error: any) {
    console.error('[Nansen Flows API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
