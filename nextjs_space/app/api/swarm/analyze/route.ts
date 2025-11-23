
/**
 * API Endpoint: Multi-Agent Swarm Analysis
 * Triggers collaborative analysis by specialized AI agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { tradingSwarm } from '@/lib/trading-swarm';

export const dynamic = 'force-dynamic';

/**
 * POST: Trigger swarm analysis for a symbol
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, agentId, balance } = body;

    if (!symbol || !agentId || balance === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: symbol, agentId, balance',
        },
        { status: 400 }
      );
    }

    // Trigger swarm analysis
    const decision = await tradingSwarm.analyzeSymbol(symbol, agentId, balance);

    return NextResponse.json({
      success: true,
      decision,
    });

  } catch (error) {
    console.error('Error in swarm analysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Get swarm memory and past decisions
 */
export async function GET() {
  try {
    const memory = tradingSwarm.getMemory();

    return NextResponse.json({
      success: true,
      memory: {
        totalDecisions: memory.pastDecisions.length,
        recentDecisions: memory.pastDecisions.slice(-10), // Last 10
        successfulPatterns: memory.successfulPatterns,
        failedPatterns: memory.failedPatterns,
        learnings: memory.learnings,
      },
    });

  } catch (error) {
    console.error('Error fetching swarm memory:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
