
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Public access - no authentication required

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      isRealTrade: true, // Only show real trades
    };

    if (agentId && agentId !== 'all') {
      where.agentId = agentId;
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
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
        orderBy: { entryTime: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.trade.count({ where })
    ]);

    const formattedTrades = trades.map(trade => ({
      id: trade.id,
      agentId: trade.agentId,
      agentName: trade.agent.name,
      strategyType: trade.agent.strategyType,
      aiProvider: trade.agent.aiProvider,
      symbol: trade.symbol,
      type: trade.type,
      side: trade.side,
      quantity: parseFloat(trade.quantity?.toString() || '0'),
      entryPrice: parseFloat(trade.entryPrice?.toString() || '0'),
      exitPrice: trade.exitPrice ? parseFloat(trade.exitPrice.toString()) : null,
      entryTime: trade.entryTime,
      exitTime: trade.exitTime,
      profitLoss: trade.profitLoss ? parseFloat(trade.profitLoss.toString()) : null,
      profitLossPercent: trade.exitPrice && trade.entryPrice 
        ? ((parseFloat(trade.exitPrice.toString()) - parseFloat(trade.entryPrice.toString())) / parseFloat(trade.entryPrice.toString()) * 100 * (trade.side === 'BUY' ? 1 : -1))
        : null,
      status: trade.status,
      strategy: trade.strategy,
      confidence: trade.confidence,
      stopLoss: trade.stopLoss ? parseFloat(trade.stopLoss.toString()) : null,
      takeProfit: trade.takeProfit ? parseFloat(trade.takeProfit.toString()) : null,
      txHash: trade.txHash,
      chain: trade.chain,
    }));

    return NextResponse.json({
      success: true,
      trades: formattedTrades,
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching trade history:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch trade history',
      trades: [],
      total: 0 
    }, { status: 500 });
  }
}
