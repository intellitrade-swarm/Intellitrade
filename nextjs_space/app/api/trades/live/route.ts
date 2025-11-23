
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAccountInfo } from '@/lib/aster-dex';

export const dynamic = 'force-dynamic';

/**
 * GET /api/trades/live
 * Get all live trades - both from database and AsterDEX API
 */
export async function GET() {
  try {
    // Fetch database trades
    const dbTrades = await prisma.trade.findMany({
      where: {
        status: 'OPEN',
        isRealTrade: true,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            strategyType: true,
            aiProvider: true,
          },
        },
      },
      orderBy: {
        entryTime: 'desc',
      },
    });

    // Fetch live AsterDEX positions
    let asterPositions: any[] = [];
    try {
      const accountInfo = await getAccountInfo();
      
      if (accountInfo && accountInfo.positions) {
        asterPositions = accountInfo.positions
          .filter((pos: any) => parseFloat(pos.positionAmt) !== 0)
          .map((pos: any) => {
            const positionAmt = parseFloat(pos.positionAmt);
            const entryPrice = parseFloat(pos.entryPrice);
            const markPrice = parseFloat(pos.markPrice);
            const unrealizedProfit = parseFloat(pos.unRealizedProfit);
            const leverage = parseInt(pos.leverage);

            return {
              platform: 'AsterDEX',
              symbol: pos.symbol,
              side: positionAmt > 0 ? 'BUY' : 'SELL',
              quantity: Math.abs(positionAmt),
              entryPrice,
              currentPrice: markPrice,
              leverage,
              unrealizedPnL: unrealizedProfit,
              liquidationPrice: parseFloat(pos.liquidationPrice),
              marginType: pos.marginType,
              updateTime: new Date(pos.updateTime),
              isLive: true, // Mark as live from exchange
            };
          });
      }
    } catch (error) {
      console.error('Error fetching AsterDEX positions:', error);
    }

    // Combine database trades with live positions
    const allTrades = [
      ...dbTrades.map(trade => ({
        id: trade.id,
        platform: trade.chain === 'astar-zkevm' ? 'AsterDEX' : trade.chain || 'Unknown',
        agentId: trade.agent.id,
        agentName: trade.agent.name,
        agentProvider: trade.agent.aiProvider,
        strategyType: trade.agent.strategyType,
        symbol: trade.symbol,
        side: trade.side,
        quantity: trade.quantity,
        entryPrice: trade.entryPrice,
        currentPrice: trade.entryPrice, // Could fetch live price
        leverage: trade.leverage || 1,
        status: trade.status,
        entryTime: trade.entryTime,
        stopLoss: trade.stopLoss,
        takeProfit: trade.takeProfit,
        isLive: false,
        hasDbRecord: true,
      })),
      ...asterPositions.map((pos, index) => {
        // Try to match with a database trade
        const matchingDbTrade = dbTrades.find(
          trade =>
            trade.symbol === pos.symbol &&
            trade.side === pos.side &&
            trade.chain === 'astar-zkevm' &&
            Math.abs(trade.entryPrice - pos.entryPrice) / trade.entryPrice < 0.001
        );

        if (matchingDbTrade) {
          // Skip - already included in dbTrades
          return null;
        }

        // Find most recent agent for this symbol
        return {
          id: `live-aster-${index}`,
          platform: 'AsterDEX',
          agentId: null,
          agentName: 'Unknown Agent',
          agentProvider: null,
          symbol: pos.symbol,
          side: pos.side,
          quantity: pos.quantity,
          entryPrice: pos.entryPrice,
          currentPrice: pos.currentPrice,
          leverage: pos.leverage,
          unrealizedPnL: pos.unrealizedPnL,
          liquidationPrice: pos.liquidationPrice,
          status: 'OPEN',
          entryTime: pos.updateTime,
          isLive: true,
          hasDbRecord: false,
        };
      }).filter(Boolean), // Remove nulls
    ];

    // Calculate statistics
    const stats = {
      totalTrades: allTrades.length,
      asterDexTrades: allTrades.filter(t => t && t.platform === 'AsterDEX').length,
      totalUnrealizedPnL: asterPositions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0),
      liveTradesWithoutDb: allTrades.filter(t => t && t.isLive && !t.hasDbRecord).length,
    };

    return NextResponse.json({
      success: true,
      trades: allTrades,
      stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching live trades:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trades',
        trades: [],
      },
      { status: 500 }
    );
  }
}
