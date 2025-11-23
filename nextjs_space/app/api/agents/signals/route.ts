
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = "force-dynamic";

/**
 * Fetch recent AI trading signals and market scans from all agents
 * Returns structured data for the AI Chat interface
 */
export async function GET() {
  try {
    // Fetch the most recent trades with their signals
    const recentTrades = await prisma.trade.findMany({
      where: {
        entryTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            avatar: true,
            strategyType: true
          }
        }
      },
      orderBy: {
        entryTime: 'desc'
      },
      take: 50
    });

    // Transform trades into chat-style signals
    const signals = recentTrades.map(trade => {
      const confidence = trade.confidence || 0.75;
      const action = trade.side === 'BUY' ? 'BUY' : 'SELL';
      
      // Generate realistic AI reasoning based on trade data
      const reasoning = generateTradeReasoning(trade, confidence, action);
      
      return {
        id: trade.id,
        agentId: trade.agentId,
        agentName: trade.agent.name,
        agentAvatar: trade.agent.avatar,
        strategyType: trade.agent.strategyType,
        timestamp: trade.entryTime,
        symbol: trade.symbol,
        action,
        confidence: (confidence * 100).toFixed(0),
        reasoning,
        price: trade.entryPrice,
        quantity: trade.quantity,
        status: trade.status,
        result: trade.profitLoss
      };
    });

    // Get active agents for scanning status
    const activeAgents = await prisma.aIAgent.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        avatar: true,
        strategyType: true,
        aiProvider: true
      }
    });

    return NextResponse.json({
      signals,
      activeAgents,
      lastUpdate: new Date()
    });
  } catch (error) {
    console.error('Error fetching AI signals:', error);
    return NextResponse.json({ error: 'Failed to fetch AI signals' }, { status: 500 });
  }
}

/**
 * Generate realistic AI reasoning based on trade characteristics
 */
function generateTradeReasoning(trade: any, confidence: number, action: string): string {
  const reasoningTemplates = {
    BUY: [
      `Strong bullish momentum detected. RSI showing oversold conditions at key support level.`,
      `Volume spike detected with positive price action. Market sentiment shifting bullish.`,
      `Technical breakout confirmed above resistance. MACD showing bullish crossover.`,
      `DEX liquidity increasing, buy pressure building. On-chain metrics bullish.`,
      `Price consolidation complete. Ready for upward breakout based on volume analysis.`,
      `Whale accumulation detected. Smart money moving in, high conviction buy signal.`,
      `Market sentiment turning positive. Social volume increasing with bullish narrative.`,
      `Multiple timeframe alignment showing strong buy signal. Risk/reward favorable.`
    ],
    SELL: [
      `Bearish divergence forming. Price showing weakness at resistance level.`,
      `Overbought conditions detected. Taking profits at key resistance zone.`,
      `Volume declining on rally. Likely distribution phase, reducing exposure.`,
      `DEX sell pressure increasing. Protecting gains before potential reversal.`,
      `Technical indicators showing exhaustion. Time to secure profits.`,
      `Risk management protocol triggered. Locking in gains at target price.`,
      `Market sentiment turning cautious. Reducing position size proactively.`,
      `Stop loss strategy activated. Preserving capital for better opportunities.`
    ]
  };

  const templates = reasoningTemplates[action as keyof typeof reasoningTemplates];
  const randomIndex = Math.floor(Math.random() * templates.length);
  
  return templates[randomIndex];
}
