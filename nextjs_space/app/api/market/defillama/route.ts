
import { NextRequest, NextResponse } from 'next/server';
import defiLlama from '@/lib/defillama';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/market/defillama
 * Get DeFiLlama market data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'overview';
    const chain = searchParams.get('chain');
    const protocol = searchParams.get('protocol');

    switch (action) {
      case 'overview':
        // Get comprehensive market overview
        const momentum = await defiLlama.getMarketMomentum();
        return NextResponse.json({ success: true, data: momentum });

      case 'opportunities':
        // Get trading opportunities
        const opportunities = await defiLlama.getTradingOpportunities(chain || undefined);
        return NextResponse.json({ success: true, data: opportunities });

      case 'chain-health':
        // Get chain health score
        if (!chain) {
          return NextResponse.json(
            { success: false, error: 'Chain parameter required' },
            { status: 400 }
          );
        }
        const chainHealth = await defiLlama.getChainHealthScore(chain);
        return NextResponse.json({ success: true, data: chainHealth });

      case 'analyze-protocol':
        // Analyze specific protocol
        if (!protocol) {
          return NextResponse.json(
            { success: false, error: 'Protocol parameter required' },
            { status: 400 }
          );
        }
        const analysis = await defiLlama.analyzeProtocol(protocol);
        return NextResponse.json({ success: true, data: analysis });

      case 'top-protocols':
        // Get top protocols by TVL
        const limit = parseInt(searchParams.get('limit') || '50');
        const topProtocols = await defiLlama.getTopProtocols(limit);
        return NextResponse.json({ success: true, data: topProtocols });

      case 'trending':
        // Get trending protocols
        const trendingLimit = parseInt(searchParams.get('limit') || '20');
        const trending = await defiLlama.getTrendingProtocols(trendingLimit);
        return NextResponse.json({ success: true, data: trending });

      case 'chains':
        // Get all chains with TVL
        const chains = await defiLlama.getAllChainsTVL();
        return NextResponse.json({ success: true, data: chains });

      case 'dex-volumes':
        // Get DEX volumes
        if (chain) {
          const dexVolumes = await defiLlama.getDEXVolumesByChain(chain);
          return NextResponse.json({ success: true, data: dexVolumes });
        } else {
          const allDexVolumes = await defiLlama.getAllDEXVolumes();
          return NextResponse.json({ success: true, data: allDexVolumes });
        }

      case 'yields':
        // Get yield opportunities
        const minTVL = parseInt(searchParams.get('minTVL') || '100000');
        const yieldsLimit = parseInt(searchParams.get('limit') || '50');
        const yields = await defiLlama.getTopYieldPools(minTVL, yieldsLimit);
        return NextResponse.json({ success: true, data: yields });

      case 'stablecoins':
        // Get stablecoin data
        const stablecoins = await defiLlama.getAllStablecoins(true);
        const totalMcap = await defiLlama.getTotalStablecoinMarketCap();
        return NextResponse.json({ 
          success: true, 
          data: { stablecoins, totalMcap } 
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[DeFiLlama API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
