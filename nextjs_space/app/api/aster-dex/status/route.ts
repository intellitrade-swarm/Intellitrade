
import { NextResponse } from 'next/server';
import { tradingScheduler } from '@/lib/trading-scheduler';
import { getAccountInfo } from '@/lib/aster-dex';
import { prisma } from '@/lib/db';

/**
 * GET /api/aster-dex/status
 * Get comprehensive AsterDEX trading status
 */
export async function GET() {
  try {
    // Get scheduler status
    const schedulerStatus = tradingScheduler.getStatus();

    // Get AsterDEX account info
    let accountInfo;
    try {
      accountInfo = await getAccountInfo();
    } catch (error) {
      console.error('Error fetching AsterDEX account:', error);
      accountInfo = null;
    }

    // Get recent AsterDEX trades from database
    const recentTrades = await prisma.trade.findMany({
      where: {
        chain: 'astar-zkevm',
        isRealTrade: true,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            aiProvider: true,
          },
        },
      },
      orderBy: {
        entryTime: 'desc',
      },
      take: 20,
    });

    // Calculate statistics
    const totalTrades = recentTrades.length;
    const openTrades = recentTrades.filter(t => t.status === 'OPEN').length;
    const closedTrades = recentTrades.filter(t => t.status === 'CLOSED').length;
    
    // Calculate PnL for closed trades
    const closedTradesWithPnL = recentTrades.filter(
      t => t.status === 'CLOSED' && t.exitPrice && t.entryPrice
    );
    
    const totalPnL = closedTradesWithPnL.reduce((sum, trade) => {
      const pnl = (trade.exitPrice! - trade.entryPrice) * trade.quantity;
      return sum + (trade.side === 'BUY' ? pnl : -pnl);
    }, 0);

    return NextResponse.json({
      scheduler: {
        isRunning: schedulerStatus.isRunning,
        useAsterDex: schedulerStatus.useAsterDex,
        lastCycleTime: schedulerStatus.lastCycleTime,
        nextCycleTime: schedulerStatus.nextCycleTime,
        cyclesCompleted: schedulerStatus.cyclesCompleted,
        successfulTrades: schedulerStatus.successfulTrades,
        failedTrades: schedulerStatus.failedTrades,
      },
      account: accountInfo ? {
        totalBalance: parseFloat(accountInfo.totalWalletBalance),
        availableBalance: parseFloat(accountInfo.availableBalance),
        unrealizedPnL: parseFloat(accountInfo.totalUnrealizedProfit),
        positions: accountInfo.positions?.length || 0,
      } : null,
      trades: {
        total: totalTrades,
        open: openTrades,
        closed: closedTrades,
        totalPnL,
        recentTrades: recentTrades.map(trade => ({
          id: trade.id,
          agent: trade.agent.name,
          symbol: trade.symbol,
          side: trade.side,
          quantity: trade.quantity,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          status: trade.status,
          entryTime: trade.entryTime,
          exitTime: trade.exitTime,
          pnl: trade.exitPrice && trade.entryPrice
            ? ((trade.exitPrice - trade.entryPrice) * trade.quantity * (trade.side === 'BUY' ? 1 : -1))
            : null,
        })),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting AsterDEX status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
