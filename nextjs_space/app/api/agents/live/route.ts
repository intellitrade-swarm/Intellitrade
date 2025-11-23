
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = "force-dynamic";

/**
 * Live Agents API - Returns real-time agent data with all metrics calculated from actual trades
 */
export async function GET(request: NextRequest) {
  try {
    const agents = await prisma.aIAgent.findMany({
      where: { isActive: true },
      include: {
        performances: {
          orderBy: { timestamp: 'desc' },
          take: 1
        },
        trades: {
          where: {
            isRealTrade: true,
          },
          orderBy: { entryTime: 'desc' },
        }
      }
    });

    // Calculate comprehensive metrics for each agent
    const agentsWithMetrics = agents.map((agent: any) => {
      const allTrades = agent.trades || [];
      const closedTrades = allTrades.filter((t: any) => t.status === 'CLOSED');
      const openTrades = allTrades.filter((t: any) => t.status === 'OPEN');

      // Calculate wins and losses
      const wins = closedTrades.filter((t: any) => {
        const pnl = parseFloat(t.profitLoss?.toString() || '0');
        return pnl > 0;
      }).length;

      const losses = closedTrades.filter((t: any) => {
        const pnl = parseFloat(t.profitLoss?.toString() || '0');
        return pnl < 0;
      }).length;

      // Calculate total P&L from closed trades
      const totalProfitLoss = closedTrades.reduce((sum: number, trade: any) => {
        return sum + parseFloat(trade.profitLoss?.toString() || '0');
      }, 0);

      // Calculate win rate
      const totalClosedTrades = closedTrades.length;
      const winRate = totalClosedTrades > 0 ? (wins / totalClosedTrades) * 100 : 0;

      // Get latest performance metrics
      const latestPerformance = agent.performances?.[0];

      // Get recent trades (last 10)
      const recentTrades = allTrades.slice(0, 10).map((t: any) => ({
        id: t.id,
        symbol: t.symbol,
        side: t.side,
        quantity: parseFloat(t.quantity?.toString() || '0'),
        entryPrice: parseFloat(t.entryPrice?.toString() || '0'),
        exitPrice: t.exitPrice ? parseFloat(t.exitPrice.toString()) : null,
        profitLoss: t.profitLoss ? parseFloat(t.profitLoss.toString()) : null,
        status: t.status,
        entryTime: t.entryTime,
        exitTime: t.exitTime,
        isRealTrade: t.isRealTrade,
      }));

      return {
        id: agent.id,
        name: agent.name,
        strategyType: agent.strategyType,
        description: agent.description,
        isActive: agent.isActive,
        aiProvider: agent.aiProvider,
        avatar: agent.avatar,
        riskTolerance: agent.riskTolerance,
        
        // Wallet balances
        balance: agent.balance ? parseFloat(agent.balance.toString()) : parseFloat((agent.realBalance || agent.currentBalance || 0).toString()),
        realBalance: parseFloat((agent.realBalance || 0).toString()),
        currentBalance: parseFloat((agent.currentBalance || 0).toString()),
        solanaBalance: 0, // Solana balances tracked separately
        bscBalance: 0, // BSC balances tracked separately
        
        // Wallet addresses
        walletAddress: agent.walletAddress || '',
        solanaWalletAddress: agent.solanaWalletAddress,
        bscWalletAddress: agent.bscWalletAddress,
        
        // Trade statistics
        totalTrades: allTrades.length,
        openTrades: openTrades.length,
        closedTrades: totalClosedTrades,
        wins,
        losses,
        winRate: Math.round(winRate * 10) / 10, // Round to 1 decimal
        
        // Financial metrics
        totalProfitLoss: Math.round(totalProfitLoss * 100) / 100, // Round to 2 decimals
        profitLoss: Math.round(totalProfitLoss * 100) / 100,
        performance24h: 0, // Calculate if needed
        
        // Performance metrics
        sharpeRatio: latestPerformance?.sharpeRatio || 0,
        maxDrawdown: latestPerformance?.maxDrawdown || 0,
        
        // Recent activity
        recentTrades,
        lastTradeAt: allTrades[0]?.entryTime || null,
        
        // Timestamps
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
      };
    });

    // Sort by total P&L (best performers first)
    agentsWithMetrics.sort((a, b) => b.totalProfitLoss - a.totalProfitLoss);

    return NextResponse.json(agentsWithMetrics);
  } catch (error: any) {
    console.error('Error fetching live agents:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch live agents',
      message: error.message 
    }, { status: 500 });
  }
}
