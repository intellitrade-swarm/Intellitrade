
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

/**
 * Real Stats API - Returns ONLY real trading data
 * No simulated trades, only actual on-chain executed trades
 */
export async function GET() {
  try {
    // Fetch ALL real trades
    const allRealTrades = await prisma.trade.findMany({
      where: { isRealTrade: true },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            strategyType: true,
            aiProvider: true,
          }
        }
      },
      orderBy: { entryTime: 'desc' }
    });

    // Calculate overall statistics
    const totalTrades = allRealTrades.length;
    const openTrades = allRealTrades.filter(t => t.status === 'OPEN');
    const closedTrades = allRealTrades.filter(t => t.status === 'CLOSED');
    
    // Calculate P&L statistics
    let totalPnL = 0;
    let realizedPnL = 0;
    let unrealizedPnL = 0;
    let totalProfit = 0;
    let totalLoss = 0;
    let winningTrades = 0;
    let losingTrades = 0;

    allRealTrades.forEach(trade => {
      const pnl = parseFloat(trade.profitLoss?.toString() || '0');
      
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
      
      totalPnL += pnl;
    });

    const totalCompletedTrades = winningTrades + losingTrades;
    const winRate = totalCompletedTrades > 0 ? (winningTrades / totalCompletedTrades) * 100 : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : (totalProfit > 0 ? 999 : 0);

    // Get agent-specific statistics
    const agents = await prisma.aIAgent.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        strategyType: true,
        aiProvider: true,
        avatar: true,
        currentBalance: true,
        realBalance: true,
        totalTrades: true,
        winRate: true,
        totalProfitLoss: true,
        walletAddress: true,
        solanaWalletAddress: true,
        bscWalletAddress: true,
      }
    });

    const agentStats = agents.map(agent => {
      const agentTrades = allRealTrades.filter(t => t.agentId === agent.id);
      const agentClosed = agentTrades.filter(t => t.status === 'CLOSED');
      const agentWins = agentClosed.filter(t => parseFloat(t.profitLoss?.toString() || '0') > 0).length;
      const agentLosses = agentClosed.filter(t => parseFloat(t.profitLoss?.toString() || '0') < 0).length;
      const agentPnL = agentTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss?.toString() || '0'), 0);

      return {
        id: agent.id,
        name: agent.name,
        strategyType: agent.strategyType,
        aiProvider: agent.aiProvider,
        avatar: agent.avatar,
        realBalance: agent.realBalance,
        totalTrades: agentTrades.length,
        openTrades: agentTrades.filter(t => t.status === 'OPEN').length,
        closedTrades: agentClosed.length,
        wins: agentWins,
        losses: agentLosses,
        winRate: (agentWins + agentLosses) > 0 ? (agentWins / (agentWins + agentLosses)) * 100 : 0,
        totalPnL: agentPnL,
        walletAddress: agent.walletAddress,
        solanaWalletAddress: agent.solanaWalletAddress,
        bscWalletAddress: agent.bscWalletAddress,
      };
    });

    // Get 24-hour statistics
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const trades24h = allRealTrades.filter(t => t.entryTime >= last24Hours);
    const pnL24h = trades24h.reduce((sum, t) => sum + parseFloat(t.profitLoss?.toString() || '0'), 0);
    const wins24h = trades24h.filter(t => parseFloat(t.profitLoss?.toString() || '0') > 0).length;
    const losses24h = trades24h.filter(t => parseFloat(t.profitLoss?.toString() || '0') < 0).length;

    // Format recent trades for display
    const recentTrades = allRealTrades.slice(0, 50).map(trade => ({
      id: trade.id,
      agentId: trade.agentId,
      agentName: trade.agent?.name || 'Unknown',
      strategyType: trade.agent?.strategyType || 'Unknown',
      aiProvider: trade.agent?.aiProvider || 'OPENAI',
      symbol: trade.symbol,
      type: trade.type,
      side: trade.side,
      chain: trade.chain || 'unknown',
      quantity: parseFloat(trade.quantity?.toString() || '0'),
      entryPrice: parseFloat(trade.entryPrice?.toString() || '0'),
      exitPrice: trade.exitPrice ? parseFloat(trade.exitPrice.toString()) : null,
      leverage: parseFloat(trade.leverage?.toString() || '1'),
      profitLoss: parseFloat(trade.profitLoss?.toString() || '0'),
      status: trade.status,
      entryTime: trade.entryTime.toISOString(),
      exitTime: trade.exitTime?.toISOString() || null,
      strategy: trade.strategy || 'autonomous',
      txHash: trade.txHash || null,
      orderID: trade.orderID || null,
    }));

    // Get treasury data
    const treasury = await prisma.treasury.findFirst();
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

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overview: {
        totalTrades,
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
        profitFactor: Math.round(profitFactor * 100) / 100,
      },
      performance24h: {
        trades: trades24h.length,
        pnL: Math.round(pnL24h * 100) / 100,
        wins: wins24h,
        losses: losses24h,
        winRate: trades24h.length > 0 ? Math.round((wins24h / (wins24h + losses24h)) * 1000) / 10 : 0,
      },
      agents: agentStats,
      recentTrades,
      treasury: treasuryBalance,
      activeAgents: agents.filter(a => agentStats.find(s => s.id === a.id && s.totalTrades > 0)).length,
    });
  } catch (error) {
    console.error('Error fetching real stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch real trading statistics'
    }, { status: 500 });
  }
}
