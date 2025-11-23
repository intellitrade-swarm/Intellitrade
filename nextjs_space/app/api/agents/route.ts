
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Public access - no authentication required

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

    // Calculate metrics for each agent from their actual trade data
    const agentsWithMetrics = agents.map((agent: any) => {
      const allTrades = agent.trades || [];
      const closedTrades = allTrades.filter((t: any) => t.status === 'CLOSED');
      const openTrades = allTrades.filter((t: any) => t.status === 'OPEN');

      // Calculate wins and losses from closed trades
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
        balance: parseFloat((agent.realBalance || agent.currentBalance || 0).toString()),
        realBalance: parseFloat((agent.realBalance || 0).toString()),
        currentBalance: parseFloat((agent.currentBalance || 0).toString()),
        solanaBalance: 0, // Solana balances tracked separately
        bscBalance: 0, // BSC balances tracked separately
        
        // Wallet addresses
        walletAddress: agent.walletAddress,
        solanaWalletAddress: agent.solanaWalletAddress,
        bscWalletAddress: agent.bscWalletAddress,
        
        // Trade statistics
        totalTrades: allTrades.length,
        openTrades: openTrades.length,
        closedTrades: totalClosedTrades,
        wins,
        losses,
        winRate,
        totalProfitLoss,
        sharpeRatio: latestPerformance?.sharpeRatio || 0,
        maxDrawdown: latestPerformance?.maxDrawdown || 0,
        
        // Performance metrics
        performance24h: 0, // Calculate if needed
        profitLoss: totalProfitLoss,
        
        trades: allTrades.slice(0, 5).map((t: any) => ({
          id: t.id,
          symbol: t.symbol,
          side: t.side,
          leverage: parseFloat(t.leverage?.toString() || '1'),
          quantity: parseFloat(t.quantity?.toString() || '0'),
          entryPrice: parseFloat(t.entryPrice?.toString() || '0'),
          exitPrice: t.exitPrice ? parseFloat(t.exitPrice.toString()) : null,
          profitLoss: t.profitLoss ? parseFloat(t.profitLoss.toString()) : null,
          status: t.status,
          entryTime: t.entryTime,
          exitTime: t.exitTime,
          isRealTrade: t.isRealTrade,
        }))
      };
    });

    return NextResponse.json(agentsWithMetrics);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}
