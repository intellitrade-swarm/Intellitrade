
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch all open trades with agent info
    const trades = await prisma.trade.findMany({
      where: {
        status: 'OPEN',
        isRealTrade: true
      },
      include: {
        agent: {
          select: {
            name: true,
            id: true
          }
        }
      },
      orderBy: {
        entryTime: 'desc'
      },
      take: 20 // Limit to most recent 20 trades
    });

    // Format for banner
    const formattedTrades = trades.map(trade => ({
      id: trade.id,
      agentName: trade.agent.name,
      symbol: trade.symbol,
      side: trade.side,
      entryPrice: trade.entryPrice,
      quantity: trade.quantity,
      entryTime: trade.entryTime,
      leverage: trade.type === 'PERPETUAL' ? 5 : 1, // Assuming 5x for perpetuals
      strategy: trade.strategy || ''
    }));

    return NextResponse.json({
      success: true,
      trades: formattedTrades,
      count: formattedTrades.length
    });
  } catch (error) {
    console.error('Error fetching active trades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch active trades', trades: [] },
      { status: 500 }
    );
  }
}
