
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { circuitBreaker } from '../../../../lib/circuit-breaker';
import { sendTelegramAlert } from '../../../../lib/alerts';

export const dynamic = "force-dynamic";

/**
 * Get circuit breaker status
 * GET /api/ai/circuit-breaker
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = circuitBreaker.getStatus();

    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting circuit breaker status:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Update circuit breaker configuration
 * PATCH /api/ai/circuit-breaker
 * 
 * Body: {
 *   maxTradeUsd?: number,
 *   maxDailyLossPercent?: number,
 *   maxDrawdownPercent?: number,
 *   maxOpenPositions?: number,
 *   minBalanceUsd?: number
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    circuitBreaker.updateConfig(body);
    
    await sendTelegramAlert(
      '⚙️ *Circuit Breaker Config Updated*\n' +
      `Settings: ${JSON.stringify(body, null, 2)}`
    );

    return NextResponse.json({
      success: true,
      message: 'Circuit breaker configuration updated',
      config: circuitBreaker.getStatus().config,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error updating circuit breaker config:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Reset circuit breaker for an agent
 * POST /api/ai/circuit-breaker/reset
 * 
 * Body: { agentId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { agentId } = body;

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID required' },
        { status: 400 }
      );
    }

    const { prisma } = await import('../../../../lib/db');
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
      select: { name: true },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    circuitBreaker.resetAgent(agentId);
    
    await sendTelegramAlert(
      `🟢 *Circuit Breaker Reset*\n` +
      `Agent: ${agent.name}\n` +
      `Status: Ready to trade`
    );

    return NextResponse.json({
      success: true,
      message: `Circuit breaker reset for ${agent.name}`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error resetting circuit breaker:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

