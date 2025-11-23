

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { analyzeAgentPerformance, getAggregatedProfits } from '../../../../lib/agent-improvement-engine';
import { prisma } from '../../../../lib/db';

export const dynamic = "force-dynamic";

/**
 * Get improvement insights for all agents
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active agents with sufficient trades
    const agents = await prisma.aIAgent.findMany({
      where: { 
        isActive: true,
        totalTrades: { gt: 5 }
      }
    });

    // Analyze each agent
    const insights = await Promise.all(
      agents.map(agent => analyzeAgentPerformance(agent.id))
    );

    // Get aggregated profits
    const profitSummary = await getAggregatedProfits();

    return NextResponse.json({
      success: true,
      insights,
      profitSummary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching improvement insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch improvement insights' },
      { status: 500 }
    );
  }
}

/**
 * Apply improvements to a specific agent
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = await request.json();

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    const insights = await analyzeAgentPerformance(agentId);

    return NextResponse.json({
      success: true,
      insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error applying improvements:', error);
    return NextResponse.json(
      { error: 'Failed to apply improvements' },
      { status: 500 }
    );
  }
}

