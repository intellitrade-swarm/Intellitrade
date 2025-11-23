
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = "force-dynamic";

/**
 * Summary Statistics API
 * Returns aggregate statistics for all agents and trades
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all agents with their trades
    const agents = await prisma.aIAgent.findMany({
      include: {
        trades: {
          where: {
            isRealTrade: true,
          },
        },
        performances: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    // Calculate aggregate metrics
    let totalTrades = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let totalProfitLoss = 0;
    let totalSharpeRatio = 0;
    let agentsWithPerformance = 0;
    let openTradesCount = 0;
    let realTradesCount = 0;

    const agentMetrics = agents.map((agent: any) => {
      const allTrades = agent.trades || [];
      const closedTrades = allTrades.filter((t: any) => t.status === 'CLOSED');
      const openTrades = allTrades.filter((t: any) => t.status === 'OPEN');
      
      openTradesCount += openTrades.length;
      realTradesCount += allTrades.filter((t: any) => t.isRealTrade).length;

      // Count wins and losses
      const wins = closedTrades.filter((t: any) => parseFloat(t.profitLoss?.toString() || '0') > 0).length;
      const losses = closedTrades.filter((t: any) => parseFloat(t.profitLoss?.toString() || '0') < 0).length;

      // Calculate P&L
      const agentPnL = closedTrades.reduce((sum: number, trade: any) => {
        return sum + parseFloat(trade.profitLoss?.toString() || '0');
      }, 0);

      totalTrades += allTrades.length;
      totalWins += wins;
      totalLosses += losses;
      totalProfitLoss += agentPnL;

      // Get Sharpe ratio from latest performance
      const latestPerformance = agent.performances?.[0];
      if (latestPerformance?.sharpeRatio) {
        totalSharpeRatio += latestPerformance.sharpeRatio;
        agentsWithPerformance++;
      }

      return {
        id: agent.id,
        name: agent.name,
        strategyType: agent.strategyType,
        totalTrades: allTrades.length,
        wins,
        losses,
        profitLoss: agentPnL,
        sharpeRatio: latestPerformance?.sharpeRatio || 0,
      };
    });

    // Calculate averages
    const avgWinRate = (totalWins + totalLosses) > 0 
      ? (totalWins / (totalWins + totalLosses)) * 100 
      : 0;
    
    const avgSharpeRatio = agentsWithPerformance > 0 
      ? totalSharpeRatio / agentsWithPerformance 
      : 0;

    // Find top performer
    const topPerformer = agentMetrics.reduce((best, current) => {
      return current.profitLoss > best.profitLoss ? current : best;
    }, agentMetrics[0] || { name: 'N/A', strategyType: '', profitLoss: 0, totalTrades: 0 });

    const response = {
      summary: {
        totalAgents: agents.length,
        activeAgents: agents.filter((a: any) => a.isActive).length,
        totalTrades,
        totalWins,
        totalLosses,
        openTrades: openTradesCount,
        realTrades: realTradesCount,
        totalProfitLoss: Math.round(totalProfitLoss * 100) / 100,
        avgWinRate: Math.round(avgWinRate * 10) / 10,
        avgSharpeRatio: Math.round(avgSharpeRatio * 100) / 100,
      },
      topPerformer: {
        name: topPerformer.name,
        strategyType: topPerformer.strategyType,
        profitLoss: Math.round(topPerformer.profitLoss * 100) / 100,
        totalTrades: topPerformer.totalTrades,
      },
      agents: agentMetrics.map((a: any) => ({
        ...a,
        profitLoss: Math.round(a.profitLoss * 100) / 100,
        sharpeRatio: Math.round(a.sharpeRatio * 100) / 100,
      })),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching summary stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch summary statistics',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
