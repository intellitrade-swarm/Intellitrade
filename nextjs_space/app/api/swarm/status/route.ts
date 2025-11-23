
/**
 * API Endpoint: Swarm Status and Statistics
 */

import { NextResponse } from 'next/server';
import { tradingSwarm } from '@/lib/trading-swarm';

export const dynamic = 'force-dynamic';

/**
 * GET: Get swarm status and statistics
 */
export async function GET() {
  try {
    const memory = tradingSwarm.getMemory();

    // Calculate statistics
    const totalDecisions = memory.pastDecisions.length;
    const buyDecisions = memory.pastDecisions.filter(
      (d) => d.finalRecommendation === 'BUY' || d.finalRecommendation === 'STRONG_BUY'
    ).length;
    const sellDecisions = memory.pastDecisions.filter(
      (d) => d.finalRecommendation === 'SELL' || d.finalRecommendation === 'STRONG_SELL'
    ).length;
    const holdDecisions = memory.pastDecisions.filter(
      (d) => d.finalRecommendation === 'HOLD'
    ).length;

    const avgConfidence =
      totalDecisions > 0
        ? memory.pastDecisions.reduce((sum, d) => sum + d.consensusConfidence, 0) / totalDecisions
        : 0;

    return NextResponse.json({
      success: true,
      status: {
        isActive: true,
        agentCount: 5, // Data Analyst, Technical Analyst, Risk Manager, Strategy Coordinator, Performance Evaluator
        totalDecisions,
        statistics: {
          buyDecisions,
          sellDecisions,
          holdDecisions,
          averageConfidence: avgConfidence.toFixed(1),
        },
        recentActivity: memory.pastDecisions.slice(-5).map((d) => ({
          symbol: d.symbol,
          recommendation: d.finalRecommendation,
          confidence: d.consensusConfidence,
          timestamp: d.timestamp,
        })),
        learnings: memory.learnings.slice(-10),
      },
    });

  } catch (error) {
    console.error('Error fetching swarm status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
