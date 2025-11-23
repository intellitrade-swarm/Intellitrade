
import { NextRequest, NextResponse } from 'next/server';
import {
  getTokenData,
  getTopPools,
  getLiquidityMetrics,
  getOnChainSignals,
  getDEXMetrics,
  findTradingOpportunities,
  getMarketDepth,
} from '@/lib/the-graph';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API endpoint for The Graph on-chain data
 * GET /api/market/graph?action=<action>&params=<params>
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const chain = (searchParams.get('chain') || 'base') as 'base' | 'ethereum';

    switch (action) {
      case 'token': {
        const tokenAddress = searchParams.get('address');
        if (!tokenAddress) {
          return NextResponse.json(
            { error: 'Token address is required' },
            { status: 400 }
          );
        }

        const data = await getTokenData(tokenAddress, chain);
        return NextResponse.json({ success: true, data });
      }

      case 'pools': {
        const limit = parseInt(searchParams.get('limit') || '10');
        const data = await getTopPools(limit, chain);
        return NextResponse.json({ success: true, data });
      }

      case 'liquidity': {
        const tokenAddress = searchParams.get('address');
        if (!tokenAddress) {
          return NextResponse.json(
            { error: 'Token address is required' },
            { status: 400 }
          );
        }

        const data = await getLiquidityMetrics(tokenAddress, chain);
        return NextResponse.json({ success: true, data });
      }

      case 'signals': {
        const tokenAddress = searchParams.get('address');
        if (!tokenAddress) {
          return NextResponse.json(
            { error: 'Token address is required' },
            { status: 400 }
          );
        }

        const data = await getOnChainSignals(tokenAddress, chain);
        return NextResponse.json({ success: true, data });
      }

      case 'dex-metrics': {
        const data = await getDEXMetrics(chain);
        return NextResponse.json({ success: true, data });
      }

      case 'opportunities': {
        const data = await findTradingOpportunities(chain);
        return NextResponse.json({ success: true, data });
      }

      case 'market-depth': {
        const poolAddress = searchParams.get('pool');
        if (!poolAddress) {
          return NextResponse.json(
            { error: 'Pool address is required' },
            { status: 400 }
          );
        }

        const data = await getMarketDepth(poolAddress, chain);
        return NextResponse.json({ success: true, data });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Graph API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch data from The Graph',
      },
      { status: 500 }
    );
  }
}
