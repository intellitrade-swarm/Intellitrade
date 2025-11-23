
import { NextResponse } from 'next/server';
import { getAccountInfo } from '@/lib/aster-dex';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/aster-dex/positions
 * Get current open positions from AsterDEX API
 */
export async function GET() {
  try {
    // Fetch live account info from AsterDEX
    const accountInfo = await getAccountInfo();
    
    if (!accountInfo || !accountInfo.positions) {
      return NextResponse.json({
        success: true,
        positions: [],
        totalUnrealizedPnL: 0,
        message: 'No positions found'
      });
    }

    // Parse positions from AsterDEX response
    const livePositions = accountInfo.positions
      .filter((pos: any) => parseFloat(pos.positionAmt) !== 0)
      .map((pos: any) => {
        const positionAmt = parseFloat(pos.positionAmt);
        const entryPrice = parseFloat(pos.entryPrice);
        const markPrice = parseFloat(pos.markPrice);
        const unrealizedProfit = parseFloat(pos.unRealizedProfit);
        const leverage = parseInt(pos.leverage);

        return {
          symbol: pos.symbol,
          side: positionAmt > 0 ? 'BUY' : 'SELL',
          quantity: Math.abs(positionAmt),
          entryPrice,
          markPrice,
          leverage,
          unrealizedPnL: unrealizedProfit,
          liquidationPrice: parseFloat(pos.liquidationPrice),
          marginType: pos.marginType,
          positionSide: pos.positionSide,
          updateTime: new Date(pos.updateTime),
        };
      });

    // Get agent info to match positions with agents if possible
    const agents = await prisma.aIAgent.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        primaryChain: true,
      },
    });

    // Match positions with recent database trades to identify which agent opened them
    const positionsWithAgents = await Promise.all(
      livePositions.map(async (pos) => {
        // Try to find a matching OPEN trade in database
        const matchingTrade = await prisma.trade.findFirst({
          where: {
            symbol: pos.symbol,
            side: pos.side as any,
            status: 'OPEN',
            chain: 'astar-zkevm',
            entryPrice: {
              gte: pos.entryPrice * 0.999, // Allow 0.1% variance
              lte: pos.entryPrice * 1.001,
            },
          },
          include: {
            agent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (matchingTrade && matchingTrade.agent) {
          return {
            ...pos,
            agentId: matchingTrade.agent.id,
            agentName: matchingTrade.agent.name,
            tradeId: matchingTrade.id,
            hasDbRecord: true,
          };
        }

        // If no matching trade, try to infer from recent closed trades
        const recentAgentTrade = await prisma.trade.findFirst({
          where: {
            symbol: pos.symbol,
            chain: 'astar-zkevm',
          },
          orderBy: {
            entryTime: 'desc',
          },
          include: {
            agent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return {
          ...pos,
          agentId: recentAgentTrade?.agent.id || null,
          agentName: recentAgentTrade?.agent.name || 'Unknown',
          tradeId: null,
          hasDbRecord: false,
        };
      })
    );

    // Calculate total unrealized PnL
    const totalUnrealizedPnL = livePositions.reduce(
      (sum, pos) => sum + pos.unrealizedPnL,
      0
    );

    return NextResponse.json({
      success: true,
      positions: positionsWithAgents,
      totalPositions: livePositions.length,
      totalUnrealizedPnL,
      accountBalance: parseFloat(accountInfo.totalWalletBalance),
      availableBalance: parseFloat(accountInfo.availableBalance),
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching AsterDEX positions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch positions',
        positions: [],
      },
      { status: 500 }
    );
  }
}
