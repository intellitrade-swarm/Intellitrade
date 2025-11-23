
/**
 * Alchemy Gas Estimation API
 */

import { NextResponse } from 'next/server';
import { getOptimalGasSettings } from '@/lib/alchemy-trading-enhancer';
import { isAlchemyConfigured } from '@/lib/alchemy-config';

export async function GET(request: Request) {
  try {
    if (!isAlchemyConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Alchemy not configured',
      });
    }

    const { searchParams } = new URL(request.url);
    const chain = (searchParams.get('chain') || 'base') as any;

    const gasSettings = await getOptimalGasSettings(chain);

    return NextResponse.json({
      success: true,
      chain,
      gasSettings,
      alchemyOptimized: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Alchemy Gas Estimate API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
