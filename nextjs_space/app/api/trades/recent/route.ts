
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Public access - no authentication required

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {
      isRealTrade: true,
    };

    if (agentId && agentId !== 'all') {
      where.agentId = agentId;
    }

    const trades = await prisma.trade.findMany({
      where,
      include: {
        agent: {
          select: {
            name: true,
            strategyType: true,
          }
        }
      },
      orderBy: { entryTime: 'desc' },
      take: limit,
    });

    const formattedTrades = trades.map(trade => ({
      id: trade.id,
      agentName: trade.agent.name,
      strategyType: trade.agent.strategyType,
      symbol: trade.symbol,
      type: trade.type,
      side: trade.side,
      quantity: parseFloat(trade.quantity?.toString() || '0'),
      entryPrice: parseFloat(trade.entryPrice?.toString() || '0'),
      exitPrice: trade.exitPrice ? parseFloat(trade.exitPrice.toString()) : null,
      entryTime: trade.entryTime,
      exitTime: trade.exitTime,
      profitLoss: trade.profitLoss ? parseFloat(trade.profitLoss.toString()) : null,
      status: trade.status,
      strategy: trade.strategy,
    }));

    return NextResponse.json({
      success: true,
      trades: formattedTrades,
    });
  } catch (error) {
    console.error('Error fetching recent trades:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch recent trades',
      trades: []
    }, { status: 500 });
  }
}
