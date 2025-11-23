
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function GET() {
  try {
    // Public access - no authentication required

    // Fetch all real trades only
    const realTrades = await prisma.trade.findMany({
      where: {
        isRealTrade: true,
        status: {
          in: ['CLOSED', 'OPEN']
        }
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        entryTime: 'desc'
      }
    });

    // Calculate total profit/loss
    let totalProfit = 0;
    let totalLoss = 0;
    let totalPnL = 0;
    let winningTrades = 0;
    let losingTrades = 0;
    let openPnL = 0;
    let realizedPnL = 0;

    // Track per-agent stats
    const agentStats = new Map<string, {
      name: string;
      strategy: string;
      totalPnL: number;
      winRate: number;
      totalTrades: number;
      wins: number;
      losses: number;
    }>();

    realTrades.forEach(trade => {
      const pnl = trade.profitLoss || 0;
      totalPnL += pnl;

      if (trade.status === 'CLOSED') {
        realizedPnL += pnl;
        if (pnl > 0) {
          totalProfit += pnl;
          winningTrades++;
        } else if (pnl < 0) {
          totalLoss += Math.abs(pnl);
          losingTrades++;
        }
      } else if (trade.status === 'OPEN') {
        openPnL += pnl;
      }

      // Track per-agent stats
      if (trade.agent) {
        const agentId = trade.agent.id;
        if (!agentStats.has(agentId)) {
          agentStats.set(agentId, {
            name: trade.agent.name,
            strategy: trade.strategy || 'Unknown',
            totalPnL: 0,
            winRate: 0,
            totalTrades: 0,
            wins: 0,
            losses: 0
          });
        }
        const stats = agentStats.get(agentId)!;
        stats.totalPnL += pnl;
        stats.totalTrades++;
        if (trade.status === 'CLOSED') {
          if (pnl > 0) stats.wins++;
          else if (pnl < 0) stats.losses++;
        }
        stats.winRate = stats.totalTrades > 0 ? (stats.wins / (stats.wins + stats.losses)) * 100 : 0;
      }
    });

    const totalTrades = winningTrades + losingTrades;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const avgWin = winningTrades > 0 ? totalProfit / winningTrades : 0;
    const avgLoss = losingTrades > 0 ? totalLoss / losingTrades : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 0;

    // Convert agent stats to array
    const topAgents = Array.from(agentStats.values())
      .sort((a, b) => b.totalPnL - a.totalPnL)
      .slice(0, 5);

    // Get recent trades for activity feed
    const recentTrades = realTrades.slice(0, 10).map(trade => ({
      id: trade.id,
      agentName: trade.agent?.name || 'Unknown',
      pair: trade.symbol,
      type: trade.type,
      status: trade.status,
      pnl: trade.profitLoss || 0,
      entryTime: trade.entryTime,
      exitTime: trade.exitTime,
      platform: trade.chain || 'Base'
    }));

    return NextResponse.json({
      overview: {
        totalPnL,
        realizedPnL,
        openPnL,
        totalProfit,
        totalLoss,
        winningTrades,
        losingTrades,
        totalTrades,
        winRate,
        avgWin,
        avgLoss,
        profitFactor
      },
      topAgents,
      recentTrades,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching profit/PnL stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profit/PnL statistics' },
      { status: 500 }
    );
  }
}
