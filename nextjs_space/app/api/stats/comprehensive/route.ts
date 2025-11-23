
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

/**
 * Comprehensive Stats API
 * Returns complete statistics for UI display
 */
export async function GET() {
  try {
    // Fetch all real trades
    const allTrades = await prisma.trade.findMany({
      where: { isRealTrade: true },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            strategyType: true,
          }
        }
      },
      orderBy: { entryTime: 'desc' }
    });

    // Calculate trade statistics
    const openTrades = allTrades.filter(t => t.status === 'OPEN');
    const closedTrades = allTrades.filter(t => t.status === 'CLOSED');
    
    let totalPnL = 0;
    let realizedPnL = 0;
    let unrealizedPnL = 0;
    let totalProfit = 0;
    let totalLoss = 0;
    let winningTrades = 0;
    let losingTrades = 0;

    allTrades.forEach(trade => {
      const pnl = parseFloat(trade.profitLoss?.toString() || '0');
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
        unrealizedPnL += pnl;
      }
    });

    const totalCompletedTrades = winningTrades + losingTrades;
    const winRate = totalCompletedTrades > 0 ? (winningTrades / totalCompletedTrades) * 100 : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : (totalProfit > 0 ? 999 : 0);

    // Fetch treasury data
    const treasury = await prisma.treasury.findFirst({
      include: {
        transactions: {
          take: 20,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const treasuryBalance = treasury ? {
      base: treasury.baseBalance,
      bsc: treasury.bscBalance,
      ethereum: treasury.ethereumBalance,
      solana: treasury.solanaBalance,
      total: treasury.baseBalance + treasury.bscBalance + treasury.ethereumBalance + treasury.solanaBalance
    } : {
      base: 0,
      bsc: 0,
      ethereum: 0,
      solana: 0,
      total: 0
    };

    // Get agent statistics
    const agents = await prisma.aIAgent.findMany({
      where: { isActive: true },
      include: {
        trades: {
          where: { isRealTrade: true },
          orderBy: { entryTime: 'desc' },
          take: 5
        },
        performances: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    const agentStats = agents.map(agent => {
      const agentTrades = allTrades.filter(t => t.agentId === agent.id);
      const agentClosed = agentTrades.filter(t => t.status === 'CLOSED');
      const agentWins = agentClosed.filter(t => parseFloat(t.profitLoss?.toString() || '0') > 0).length;
      const agentLosses = agentClosed.filter(t => parseFloat(t.profitLoss?.toString() || '0') < 0).length;
      const agentPnL = agentTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss?.toString() || '0'), 0);

      return {
        id: agent.id,
        name: agent.name,
        strategyType: agent.strategyType,
        totalTrades: agentTrades.length,
        openTrades: agentTrades.filter(t => t.status === 'OPEN').length,
        closedTrades: agentClosed.length,
        wins: agentWins,
        losses: agentLosses,
        winRate: (agentWins + agentLosses) > 0 ? (agentWins / (agentWins + agentLosses)) * 100 : 0,
        totalPnL: agentPnL,
        latestTrades: agent.trades.map(t => ({
          id: t.id,
          symbol: t.symbol,
          type: t.type,
          side: t.side,
          status: t.status,
          pnl: parseFloat(t.profitLoss?.toString() || '0'),
          entryTime: t.entryTime,
          exitTime: t.exitTime
        }))
      };
    });

    // Format recent trades for display
    const recentTrades = allTrades.slice(0, 50).map(trade => ({
      id: trade.id,
      agentId: trade.agentId,
      agentName: trade.agent?.name || 'Unknown',
      strategyType: trade.agent?.strategyType || 'Unknown',
      symbol: trade.symbol,
      type: trade.type,
      side: trade.side,
      chain: trade.chain,
      quantity: parseFloat(trade.quantity?.toString() || '0'),
      entryPrice: parseFloat(trade.entryPrice?.toString() || '0'),
      exitPrice: trade.exitPrice ? parseFloat(trade.exitPrice.toString()) : null,
      leverage: trade.leverage || 1,
      profitLoss: parseFloat(trade.profitLoss?.toString() || '0'),
      status: trade.status,
      entryTime: trade.entryTime,
      exitTime: trade.exitTime,
      strategy: trade.strategy
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overview: {
        totalTrades: allTrades.length,
        openTrades: openTrades.length,
        closedTrades: closedTrades.length,
        winningTrades,
        losingTrades,
        winRate: Math.round(winRate * 10) / 10,
        totalPnL: Math.round(totalPnL * 100) / 100,
        realizedPnL: Math.round(realizedPnL * 100) / 100,
        unrealizedPnL: Math.round(unrealizedPnL * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        totalLoss: Math.round(totalLoss * 100) / 100,
        profitFactor: Math.round(profitFactor * 100) / 100
      },
      treasury: {
        balance: treasuryBalance,
        totalReceived: treasury?.totalReceived || 0,
        totalTransactions: treasury?.totalTransactions || 0,
        profitSharePercentage: treasury?.profitSharePercentage || 5,
        recentTransactions: treasury?.transactions || []
      },
      agents: agentStats,
      recentTrades,
      openPositions: openTrades.map(trade => ({
        id: trade.id,
        agentName: trade.agent?.name || 'Unknown',
        symbol: trade.symbol,
        type: trade.type,
        side: trade.side,
        entryPrice: parseFloat(trade.entryPrice?.toString() || '0'),
        quantity: parseFloat(trade.quantity?.toString() || '0'),
        leverage: trade.leverage || 1,
        unrealizedPnL: parseFloat(trade.profitLoss?.toString() || '0'),
        entryTime: trade.entryTime
      }))
    });
  } catch (error) {
    console.error('Error fetching comprehensive stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch comprehensive statistics'
    }, { status: 500 });
  }
}
