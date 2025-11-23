
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Real-time Performance API
 * Returns comprehensive PNL and trading data for UI display
 * Uses REAL trade data from database - no hardcoded values
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all agents with their REAL trades and performance data
    const agents = await prisma.aIAgent.findMany({
      include: {
        trades: {
          where: {
            isRealTrade: true,
          },
          orderBy: {
            entryTime: 'desc',
          },
        },
        performances: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
        },
      },
    });

    // Calculate real-time metrics for each agent from ACTUAL trades
    const agentsWithMetrics = agents.map((agent: any) => {
      const allTrades = agent.trades || [];
      const closedTrades = allTrades.filter((t: any) => t.status === 'CLOSED');
      const openTrades = allTrades.filter((t: any) => t.status === 'OPEN');

      // Calculate realized P&L from CLOSED trades only
      const realizedPnL = closedTrades.reduce((sum: number, trade: any) => {
        const pnl = parseFloat(trade.profitLoss?.toString() || '0');
        return sum + pnl;
      }, 0);

      // Calculate unrealized P&L from open trades (if available)
      const unrealizedPnL = openTrades.reduce((sum: number, trade: any) => {
        // Note: In a real system, you'd fetch current market price
        // and calculate unrealized PNL = (currentPrice - entryPrice) * size
        const unrealized = parseFloat(trade.unrealizedPnl?.toString() || '0');
        return sum + unrealized;
      }, 0);

      const totalPnL = realizedPnL + unrealizedPnL;

      // Calculate wins and losses from CLOSED trades
      const wins = closedTrades.filter((t: any) => {
        const pnl = parseFloat(t.profitLoss?.toString() || '0');
        return pnl > 0;
      }).length;
      
      const losses = closedTrades.filter((t: any) => {
        const pnl = parseFloat(t.profitLoss?.toString() || '0');
        return pnl < 0;
      }).length;

      // Win rate based on closed trades only
      const winRate = closedTrades.length > 0 
        ? (wins / closedTrades.length) * 100
        : 0;

      // Get latest metrics from performance table
      const latestMetrics = agent.performances?.[0];

      return {
        id: agent.id,
        name: agent.name,
        strategyType: agent.strategyType,
        description: agent.description,
        
        // Trade counts
        totalTrades: allTrades.length,
        openTrades: openTrades.length,
        closedTrades: closedTrades.length,
        
        // Win/Loss stats
        totalWins: wins,
        totalLosses: losses,
        winRate: Math.round(winRate * 10) / 10, // Round to 1 decimal
        
        // P&L metrics
        realizedPnL: Math.round(realizedPnL * 100) / 100, // Round to 2 decimals
        unrealizedPnL: Math.round(unrealizedPnL * 100) / 100,
        totalPnL: Math.round(totalPnL * 100) / 100,
        totalProfitLoss: Math.round(totalPnL * 100) / 100, // Alias for compatibility
        
        // Account info
        balance: agent.balance ? parseFloat(agent.balance.toString()) : 0,
        walletAddress: agent.walletAddress || '',
        
        // Performance metrics
        sharpeRatio: latestMetrics?.sharpeRatio || 0,
        maxDrawdown: latestMetrics?.maxDrawdown || 0,
        
        // Activity status
        lastTradeAt: allTrades[0]?.entryTime || null,
        isActive: agent.isActive && openTrades.length > 0,
        
        // AI provider
        aiProvider: agent.aiProvider,
      };
    });

    // Calculate aggregate statistics from ACTUAL data
    const totalTrades = agentsWithMetrics.reduce((sum, a) => sum + a.totalTrades, 0);
    const totalOpenTrades = agentsWithMetrics.reduce((sum, a) => sum + a.openTrades, 0);
    const totalClosedTrades = agentsWithMetrics.reduce((sum, a) => sum + a.closedTrades, 0);
    const totalRealizedPnL = agentsWithMetrics.reduce((sum, a) => sum + a.realizedPnL, 0);
    const totalUnrealizedPnL = agentsWithMetrics.reduce((sum, a) => sum + a.unrealizedPnL, 0);
    const totalPnL = totalRealizedPnL + totalUnrealizedPnL;
    const totalWins = agentsWithMetrics.reduce((sum, a) => sum + a.totalWins, 0);
    const totalLosses = agentsWithMetrics.reduce((sum, a) => sum + a.totalLosses, 0);
    
    // Calculate average win rate across all agents
    const avgWinRate = totalClosedTrades > 0
      ? (totalWins / totalClosedTrades) * 100
      : 0;
    
    // Calculate average Sharpe ratio
    const agentsWithSharpe = agentsWithMetrics.filter((a: any) => a.sharpeRatio !== 0);
    const avgSharpeRatio = agentsWithSharpe.length > 0
      ? agentsWithSharpe.reduce((sum, a) => sum + a.sharpeRatio, 0) / agentsWithSharpe.length
      : 0;

    // Get recent trades for activity feed
    const recentTrades = await prisma.trade.findMany({
      where: {
        isRealTrade: true,
      },
      include: {
        agent: {
          select: {
            name: true,
            strategyType: true,
          },
        },
      },
      orderBy: {
        entryTime: 'desc',
      },
      take: 20,
    });

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalAgents: agents.length,
        activeAgents: agentsWithMetrics.filter((a: any) => a.isActive).length,
        totalTrades,
        totalOpenTrades,
        totalClosedTrades,
        totalRealizedPnL: Math.round(totalRealizedPnL * 100) / 100,
        totalUnrealizedPnL: Math.round(totalUnrealizedPnL * 100) / 100,
        totalPnL: Math.round(totalPnL * 100) / 100,
        totalWins,
        totalLosses,
        avgWinRate: Math.round(avgWinRate * 10) / 10,
        avgSharpeRatio: Math.round(avgSharpeRatio * 100) / 100,
      },
      agents: agentsWithMetrics,
      recentTrades: recentTrades.map((trade: any) => ({
        id: trade.id,
        agentName: trade.agent.name,
        agentStrategy: trade.agent.strategyType,
        pair: trade.symbol,
        side: trade.side,
        size: parseFloat(trade.quantity?.toString() || '0'),
        entryPrice: parseFloat(trade.entryPrice?.toString() || '0'),
        exitPrice: trade.exitPrice ? parseFloat(trade.exitPrice.toString()) : null,
        profitLoss: trade.profitLoss ? parseFloat(trade.profitLoss.toString()) : null,
        status: trade.status,
        timestamp: trade.entryTime,
        isRealTrade: trade.isRealTrade,
      })),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching real-time performance:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
