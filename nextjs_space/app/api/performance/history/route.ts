
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = "force-dynamic";

/**
 * Get historical performance metrics for agents
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const timeframe = searchParams.get('timeframe') || '7d';
    const metric = searchParams.get('metric') || 'profitLoss';

    // Calculate time range
    const now = new Date();
    let startTime = new Date();
    switch (timeframe) {
      case '24h':
        startTime.setHours(now.getHours() - 24);
        break;
      case '7d':
        startTime.setDate(now.getDate() - 7);
        break;
      case '30d':
        startTime.setDate(now.getDate() - 30);
        break;
      case 'all':
        startTime = new Date(0); // Beginning of time
        break;
    }

    // Build where clause
    const where: any = {
      timestamp: { gte: startTime }
    };
    if (agentId) {
      where.agentId = agentId;
    }

    // Fetch performance metrics
    const metrics = await prisma.performanceMetric.findMany({
      where,
      orderBy: { timestamp: 'asc' },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            strategyType: true
          }
        }
      }
    });

    // If no historical data exists, create synthetic data from current agent state
    if (metrics.length === 0) {
      const agents = await prisma.aIAgent.findMany({
        where: agentId ? { id: agentId } : { isActive: true },
        select: {
          id: true,
          name: true,
          strategyType: true,
          totalProfitLoss: true,
          winRate: true,
          sharpeRatio: true,
          totalTrades: true,
          realBalance: true,
          currentBalance: true
        }
      });

      // Generate placeholder data points
      const points = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const syntheticMetrics = [];
      
      for (const agent of agents) {
        for (let i = 0; i < points; i++) {
          const timestamp = new Date(startTime.getTime() + (i * (now.getTime() - startTime.getTime()) / points));
          const progress = i / points;
          
          syntheticMetrics.push({
            id: `synthetic-${agent.id}-${i}`,
            agentId: agent.id,
            timestamp,
            balance: (agent.realBalance || agent.currentBalance) * (0.8 + progress * 0.2),
            totalTrades: Math.floor(agent.totalTrades * progress),
            winRate: agent.winRate * (0.9 + Math.random() * 0.1),
            profitLoss: agent.totalProfitLoss * progress,
            sharpeRatio: agent.sharpeRatio * (0.9 + Math.random() * 0.1),
            maxDrawdown: 0,
            agent: {
              id: agent.id,
              name: agent.name,
              strategyType: agent.strategyType
            }
          });
        }
      }

      return NextResponse.json({
        metrics: syntheticMetrics,
        metric,
        timeframe,
        isSynthetic: true
      });
    }

    // Group metrics by agent
    const agentMetrics: Record<string, any[]> = {};
    metrics.forEach((m) => {
      if (!agentMetrics[m.agentId]) {
        agentMetrics[m.agentId] = [];
      }
      agentMetrics[m.agentId].push(m);
    });

    return NextResponse.json({
      metrics,
      agentMetrics,
      metric,
      timeframe,
      isSynthetic: false
    });
  } catch (error) {
    console.error('Error fetching performance history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance history' },
      { status: 500 }
    );
  }
}
