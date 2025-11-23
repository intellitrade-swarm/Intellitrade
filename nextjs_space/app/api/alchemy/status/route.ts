
/**
 * Alchemy Integration Status API
 */

import { NextResponse } from 'next/server';
import { isAlchemyConfigured } from '@/lib/alchemy-config';
import { makeEnhancedRpcCall, getEnhancedBlockNumber } from '@/lib/alchemy-enhanced-provider';

export async function GET() {
  try {
    const configured = isAlchemyConfigured();
    
    if (!configured) {
      return NextResponse.json({
        success: false,
        error: 'Alchemy API not configured',
      });
    }

    // Test connection by getting block number
    const blockNumber = await getEnhancedBlockNumber('base');
    
    return NextResponse.json({
      success: true,
      configured: true,
      status: 'connected',
      chains: ['base', 'ethereum', 'polygon', 'arbitrum', 'optimism'],
      features: [
        'Enhanced RPC (99.99% uptime)',
        'Real-time Token Prices',
        'Asset Transfer Tracking',
        'Gas Optimization',
        'Transaction Simulation',
        'Webhook Support',
      ],
      currentBlockNumber: blockNumber,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Alchemy Status API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
