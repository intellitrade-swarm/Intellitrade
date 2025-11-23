
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  try {
    // Public access - no authentication required

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get top agents by PNL
    const agents = await prisma.aIAgent.findMany({
      where: {
        isActive: true,
        totalTrades: { gt: 0 }
      },
      orderBy: {
        totalProfitLoss: 'desc'
      },
      take: limit,
      include: {
        trades: {
          where: { isRealTrade: true },
          orderBy: { entryTime: 'desc' },
          take: 5
        },
        performances: {
          orderBy: { timestamp: 'desc' },
          take: 1
        },
        copyTraders: {
          where: { isActive: true }
        }
      }
    });

    // Calculate additional metrics
    const agentsWithMetrics = agents.map(agent => {
      const recentTrades = agent.trades.filter(t => t.isRealTrade);
      const winningTrades = recentTrades.filter(t => 
        t.status === 'CLOSED' && t.profitLoss && t.profitLoss > 0
      );

      return {
        ...agent,
        recentWinRate: recentTrades.length > 0 
          ? (winningTrades.length / recentTrades.length) * 100 
          : 0,
        activeCopiers: agent.copyTraders.length,
        last24hPnL: recentTrades
          .filter(t => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return t.entryTime >= yesterday;
          })
          .reduce((sum, t) => sum + (t.profitLoss || 0), 0)
      };
    });

    return NextResponse.json(agentsWithMetrics);

  } catch (error) {
    console.error('Error fetching top agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top agents' },
      { status: 500 }
    );
  }
}
