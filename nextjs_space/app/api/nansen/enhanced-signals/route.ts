
/**
 * Nansen Enhanced Signals API
 * GET: Fetch enhanced AI signals with Flow Intelligence
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

    const signals = await nansenAPI.generateEnhancedSignals(tokenAddress, chain);

    // Categorize signals by urgency
    const categorized = {
      critical: signals.filter(s => s.urgency === 'CRITICAL'),
      high: signals.filter(s => s.urgency === 'HIGH'),
      medium: signals.filter(s => s.urgency === 'MEDIUM'),
      low: signals.filter(s => s.urgency === 'LOW'),
    };

    return NextResponse.json({ 
      success: true, 
      signals,
      count: signals.length,
      categorized,
      avgConfidence: signals.reduce((sum, s) => sum + s.confidence, 0) / (signals.length || 1),
    });
  } catch (error: any) {
    console.error('[Nansen Enhanced Signals API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
