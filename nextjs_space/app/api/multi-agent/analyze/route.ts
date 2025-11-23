
import { NextRequest, NextResponse } from 'next/server';
import { multiAgentTrading, type AnalysisTask } from '@/lib/multi-agent-trading';
import { nansenAPI } from '@/lib/nansen-api';

export const dynamic = 'force-dynamic';

/**
 * Multi-Agent Trading Analysis Endpoint
 * 
 * Uses a collaborative multi-agent system (Analyst, Trader, Risk Manager)
 * to make trading decisions based on market data and Nansen intelligence
 * 
 * POST /api/multi-agent/analyze
 * Body: {
 *   symbol: string,
 *   chain: string,
 *   balance: number,
 *   openPositions: number,
 *   dailyPnL: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, chain = 'ethereum', balance, openPositions = 0, dailyPnL = 0 } = body;

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol is required' },
        { status: 400 }
      );
    }

    if (!balance) {
      return NextResponse.json(
        { success: false, error: 'Balance is required' },
        { status: 400 }
      );
    }

    console.log(`\n🤖 Multi-Agent Analysis Request: ${symbol} on ${chain}`);

    // Fetch market data (simulated - can integrate CoinGecko here)
    const marketData = {
      symbol,
      price: 2500, // Would fetch real price
      priceChange24h: 5.2,
      volume24h: 15000000000,
      marketCap: 300000000000,
    };

    // Fetch Nansen data if available
    let nansenData = null;
    try {
      if (nansenAPI.isConfigured()) {
        // Map common symbols to contract addresses
        const tokenMap: Record<string, string> = {
          'ETH': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          'USDT': '0xdac17f958d2ee523a2206206994597c13d831ec7',
          'USDC': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        };

        const tokenAddress = tokenMap[symbol.toUpperCase()];
        if (tokenAddress) {
          const [smartMoney, flowIntel] = await Promise.all([
            nansenAPI.getSmartMoneyActivity(tokenAddress, chain),
            nansenAPI.getFlowIntelligence(tokenAddress, chain),
          ]);

          nansenData = {
            smartMoney,
            flowIntel,
          };
        }
      }
    } catch (error) {
      console.warn('Failed to fetch Nansen data:', error);
    }

    // Create analysis task
    const task: AnalysisTask = {
      symbol,
      chain,
      marketData,
      nansenData,
    };

    // Execute multi-agent analysis
    const decision = await multiAgentTrading.analyzeTrade(task, {
      balance,
      openPositions,
      dailyPnL,
    });

    return NextResponse.json({
      success: true,
      decision,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Multi-agent analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      },
      { status: 500 }
    );
  }
}
