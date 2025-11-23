
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = "force-dynamic";

/**
 * Get live performance metrics including unrealized P&L
 */
export async function GET() {
  try {
    // Get all active agents
    const agents = await prisma.aIAgent.findMany({
      where: { isActive: true },
      include: {
        trades: {
          where: { status: 'OPEN' },
          select: {
            id: true,
            symbol: true,
            side: true,
            type: true,
            quantity: true,
            entryPrice: true,
            entryTime: true
          }
        }
      }
    });

    // Get current market prices (you can enhance this with real API calls)
    const currentPrices: Record<string, number> = {
      'ETHUSDT': 4100, // These should be fetched from real market data
      'BTCUSDT': 95000,
      'BTC': 95000,
      'ETH': 4100,
      'ADA': 0.65
    };

    // Calculate unrealized P&L for each agent
    const agentsWithUnrealizedPnL = agents.map(agent => {
      let unrealizedPnL = 0;
      
      agent.trades.forEach(trade => {
        const currentPrice = currentPrices[trade.symbol] || currentPrices[trade.symbol.replace('USDT', '')] || 0;
        if (currentPrice > 0 && trade.entryPrice > 0 && trade.quantity > 0) {
          const priceDiff = currentPrice - trade.entryPrice;
          const multiplier = trade.side === 'BUY' ? 1 : -1;
          const tradePnL = priceDiff * trade.quantity * multiplier;
          unrealizedPnL += tradePnL;
        }
      });

      return {
        id: agent.id,
        name: agent.name,
        totalProfitLoss: agent.totalProfitLoss,
        unrealizedPnL,
        totalPnL: agent.totalProfitLoss + unrealizedPnL,
        totalTrades: agent.totalTrades,
        openTrades: agent.trades.length,
        winRate: agent.winRate,
        sharpeRatio: agent.sharpeRatio,
        realBalance: agent.realBalance
      };
    });

    return NextResponse.json({
      agents: agentsWithUnrealizedPnL,
      currentPrices
    });
  } catch (error) {
    console.error('Error fetching live performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live performance' },
      { status: 500 }
    );
  }
}
