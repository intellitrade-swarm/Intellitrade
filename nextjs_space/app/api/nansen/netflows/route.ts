
/**
 * Nansen Smart Money Netflows API
 * GET: Fetch Smart Money netflows for a token
 */

import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

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

    if (!nansenAPI.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Nansen API not configured' },
        { status: 503 }
      );
    }

    const netflows = await nansenAPI.getSmartMoneyNetflows(tokenAddress, chain);

    return NextResponse.json({ 
      success: true, 
      netflows
    });
  } catch (error: any) {
    console.error('[Nansen Netflows API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
