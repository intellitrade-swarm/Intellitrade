
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Public access - no authentication required

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const timeframe = searchParams.get('timeframe') || '24h'; // 24h, 7d, 30d, all

    // Calculate date filter based on timeframe
    const now = new Date();
    let dateFilter: Date | undefined;
    
    switch (timeframe) {
      case '24h':
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = undefined;
    }

    const where: any = {
      isRealTrade: true,
    };

    if (agentId && agentId !== 'all') {
      where.agentId = agentId;
    }

    if (dateFilter) {
      where.entryTime = { gte: dateFilter };
    }

    // Fetch all relevant trades
    const trades = await prisma.trade.findMany({
      where,
      include: {
        agent: {
          select: {
            name: true,
          }
        }
      },
    });

    // Calculate statistics
    const totalTrades = trades.length;
    const openTrades = trades.filter(t => t.status === 'OPEN').length;
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    const closedTradesCount = closedTrades.length;

    const profitableTrades = closedTrades.filter(t => {
      const pnl = parseFloat(t.profitLoss?.toString() || '0');
      return pnl > 0;
    }).length;

    const losingTrades = closedTrades.filter(t => {
      const pnl = parseFloat(t.profitLoss?.toString() || '0');
      return pnl < 0;
    }).length;

    const totalProfitLoss = closedTrades.reduce((sum, trade) => {
      return sum + parseFloat(trade.profitLoss?.toString() || '0');
    }, 0);

    const winRate = closedTradesCount > 0 
      ? (profitableTrades / closedTradesCount) * 100 
      : 0;

    const avgProfitPerTrade = closedTradesCount > 0
      ? totalProfitLoss / closedTradesCount
      : 0;

    const avgWin = profitableTrades > 0
      ? closedTrades
          .filter(t => parseFloat(t.profitLoss?.toString() || '0') > 0)
          .reduce((sum, t) => sum + parseFloat(t.profitLoss?.toString() || '0'), 0) / profitableTrades
      : 0;

    const avgLoss = losingTrades > 0
      ? closedTrades
          .filter(t => parseFloat(t.profitLoss?.toString() || '0') < 0)
          .reduce((sum, t) => sum + parseFloat(t.profitLoss?.toString() || '0'), 0) / losingTrades
      : 0;

    const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;

    // Calculate by symbol
    const symbolStats: any = {};
    trades.forEach(trade => {
      if (!symbolStats[trade.symbol]) {
        symbolStats[trade.symbol] = {
          symbol: trade.symbol,
          totalTrades: 0,
          openTrades: 0,
          closedTrades: 0,
          profitableTrades: 0,
          totalPnL: 0,
        };
      }
      
      symbolStats[trade.symbol].totalTrades++;
      if (trade.status === 'OPEN') symbolStats[trade.symbol].openTrades++;
      if (trade.status === 'CLOSED') {
        symbolStats[trade.symbol].closedTrades++;
        const pnl = parseFloat(trade.profitLoss?.toString() || '0');
        if (pnl > 0) symbolStats[trade.symbol].profitableTrades++;
        symbolStats[trade.symbol].totalPnL += pnl;
      }
    });

    // Calculate by agent (if showing all agents)
    const agentStats: any = {};
    if (!agentId || agentId === 'all') {
      trades.forEach(trade => {
        const agentKey = trade.agentId;
        if (!agentStats[agentKey]) {
          agentStats[agentKey] = {
            agentId: trade.agentId,
            agentName: trade.agent.name,
            totalTrades: 0,
            openTrades: 0,
            closedTrades: 0,
            profitableTrades: 0,
            totalPnL: 0,
          };
        }
        
        agentStats[agentKey].totalTrades++;
        if (trade.status === 'OPEN') agentStats[agentKey].openTrades++;
        if (trade.status === 'CLOSED') {
          agentStats[agentKey].closedTrades++;
          const pnl = parseFloat(trade.profitLoss?.toString() || '0');
          if (pnl > 0) agentStats[agentKey].profitableTrades++;
          agentStats[agentKey].totalPnL += pnl;
        }
      });
    }

    return NextResponse.json({
      success: true,
      statistics: {
        totalTrades,
        openTrades,
        closedTrades: closedTradesCount,
        profitableTrades,
        losingTrades,
        winRate: parseFloat(winRate.toFixed(2)),
        totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
        avgProfitPerTrade: parseFloat(avgProfitPerTrade.toFixed(2)),
        avgWin: parseFloat(avgWin.toFixed(2)),
        avgLoss: parseFloat(avgLoss.toFixed(2)),
        profitFactor: parseFloat(profitFactor.toFixed(2)),
      },
      symbolStats: Object.values(symbolStats),
      agentStats: Object.values(agentStats),
      timeframe,
    });
  } catch (error) {
    console.error('Error fetching trade statistics:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch trade statistics',
    }, { status: 500 });
  }
}
