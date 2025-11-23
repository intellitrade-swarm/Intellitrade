
/**
 * API endpoint to get wallet balance (now uses 1inch DEX Aggregator)
 * Legacy endpoint - redirects to new balance API
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'This endpoint is deprecated. Trading now uses 1inch DEX Aggregator for autonomous on-chain trading. Please use /api/wallet/balances instead.',
    deprecatedSince: '2025-10-27',
    newEndpoint: '/api/wallet/balances'
  }, { status: 410 }); // 410 Gone - indicates resource is no longer available
}
