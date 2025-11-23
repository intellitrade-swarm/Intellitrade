
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = "force-dynamic";

/**
 * Get real-time agent analysis and trading signals
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    // Build where clause
    const where: any = { isActive: true };
    if (agentId) {
      where.id = agentId;
    }

    // Fetch agents with their recent trades and analysis
    const agents = await prisma.aIAgent.findMany({
      where,
      include: {
        trades: {
          orderBy: { entryTime: 'desc' },
          take: 10
        }
      }
    });

    // Format the data for real-time display
    const agentAnalysis = agents.map((agent) => {
      const openTrades = agent.trades.filter((t: any) => t.status === 'OPEN');
      const closedTrades = agent.trades.filter((t: any) => t.status === 'CLOSED');
      
      // Extract AI signals from recent trades
      const recentSignals = agent.trades
        .filter((t: any) => t.strategy || t.confidence)
        .map((t: any) => {
          try {
            return {
              tradeId: t.id,
              symbol: t.symbol,
              side: t.side,
              entryTime: t.entryTime,
              signalStrength: t.confidence || 0,
              riskScore: 0,
              analysis: {
                strategy: t.strategy,
                confidence: t.confidence,
                stopLoss: t.stopLoss,
                takeProfit: t.takeProfit,
                reasoning: `${t.side} signal for ${t.symbol} with ${((t.confidence || 0) * 100).toFixed(1)}% confidence`,
                sentiment: t.side === 'BUY' ? 'BULLISH' : 'BEARISH'
              },
              status: t.status,
              profitLoss: t.profitLoss
            };
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);

      return {
        id: agent.id,
        name: agent.name,
        strategyType: agent.strategyType,
        aiProvider: agent.aiProvider,
        isTrading: agent.isActive,
        
        // Current state
        currentBalance: agent.realBalance || agent.currentBalance,
        totalProfitLoss: agent.totalProfitLoss,
        winRate: agent.winRate,
        sharpeRatio: agent.sharpeRatio,
        totalTrades: agent.totalTrades,
        
        // Active trading
        openTrades: openTrades.length,
        openPositions: openTrades.map((t: any) => ({
          id: t.id,
          symbol: t.symbol,
          side: t.side,
          entryPrice: t.entryPrice,
          quantity: t.quantity,
          entryTime: t.entryTime,
          stopLoss: t.stopLoss,
          takeProfit: t.takeProfit,
          unrealizedPnL: 0 // Will be calculated on client side with current prices
        })),
        
        // Recent activity
        recentTrades: closedTrades.map((t: any) => ({
          id: t.id,
          symbol: t.symbol,
          side: t.side,
          entryPrice: t.entryPrice,
          exitPrice: t.exitPrice,
          profitLoss: t.profitLoss,
          entryTime: t.entryTime,
          exitTime: t.exitTime
        })),
        
        // AI Signals and Analysis
        recentSignals,
        lastAnalysisTime: agent.updatedAt || new Date(),
        
        // Decision-making insights
        tradingDecision: {
          isActive: agent.isActive,
          lastUpdate: new Date(),
          mode: agent.isActive ? 'ACTIVE_TRADING' : 'MONITORING'
        }
      };
    });

    return NextResponse.json({
      agents: agentAnalysis,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching agent analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent analysis' },
      { status: 500 }
    );
  }
}
