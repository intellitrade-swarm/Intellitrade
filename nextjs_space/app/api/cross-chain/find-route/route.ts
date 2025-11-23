
import { NextRequest, NextResponse } from 'next/server';
import { crossChainRouter, Chain } from '@/lib/cross-chain-router';

/**
 * POST /api/cross-chain/find-route
 * 
 * Find optimal cross-chain execution routes
 * 
 * Body:
 * {
 *   fromChain: string,
 *   toChain: string,
 *   fromToken: string,
 *   toToken: string,
 *   amountIn: number,
 *   userId: string,
 *   agentId?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromChain, toChain, fromToken, toToken, amountIn, userId, agentId } = body;
    
    // Validate inputs
    if (!fromChain || !toChain || !fromToken || !toToken || !amountIn || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (amountIn <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }
    
    // Validate chains
    const validChains = Object.values(Chain);
    if (!validChains.includes(fromChain as Chain) || !validChains.includes(toChain as Chain)) {
      return NextResponse.json(
        { error: 'Invalid chain specified' },
        { status: 400 }
      );
    }
    
    console.log(`\n🔍 Finding routes for ${userId}:`);
    console.log(`   ${fromToken} on ${fromChain} → ${toToken} on ${toChain}`);
    console.log(`   Amount: $${amountIn}`);
    
    // Find optimal paths
    const paths = await crossChainRouter.findOptimalPath(
      fromChain as Chain,
      toChain as Chain,
      fromToken,
      toToken,
      amountIn,
      agentId || userId
    );
    
    if (paths.length === 0) {
      return NextResponse.json(
        { 
          error: 'No valid routes found',
          message: 'No routes match your risk budget or liquidity requirements'
        },
        { status: 404 }
      );
    }
    
    console.log(`✅ Found ${paths.length} valid routes`);
    
    return NextResponse.json({
      success: true,
      routes: paths,
      bestRoute: paths[0],
      totalRoutes: paths.length,
    });
  } catch (error) {
    console.error('Error finding routes:', error);
    return NextResponse.json(
      { error: 'Failed to find routes' },
      { status: 500 }
    );
  }
}
