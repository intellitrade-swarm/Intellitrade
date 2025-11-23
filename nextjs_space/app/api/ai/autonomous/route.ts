
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { executeAutonomousTrade, runAutonomousTradingCycle } from '../../../../lib/autonomous-trading';
import { circuitBreaker } from '../../../../lib/circuit-breaker';
import { sendTelegramAlert } from '../../../../lib/alerts';

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Execute autonomous trade
 * POST /api/ai/autonomous
 * 
 * Body: { agentId?: string, runAll?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { agentId, runAll } = body;

    if (runAll) {
      console.log('🤖 Running autonomous trading cycle for all agents...');
      const results = await runAutonomousTradingCycle();
      
      return NextResponse.json({
        success: true,
        message: `Autonomous trading cycle completed`,
        results,
        summary: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          held: results.filter(r => r.action === 'HOLD').length,
          failed: results.filter(r => !r.success && r.action !== 'HOLD').length,
        },
      });
    }

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID required' },
        { status: 400 }
      );
    }

    console.log(`🤖 Executing autonomous trade for agent: ${agentId}`);
    const result = await executeAutonomousTrade(agentId);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in autonomous trading:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get autonomous trading status
 * GET /api/ai/autonomous
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prisma } = await import('../../../../lib/db');

    // Get active agents
    const agents = await prisma.aIAgent.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        strategyType: true,
        aiProvider: true,
        walletAddress: true,
        primaryChain: true,
        realBalance: true,
        totalTrades: true,
        winRate: true,
        totalProfitLoss: true,
        maxDrawdown: true,
      },
      orderBy: {
        realBalance: 'desc',
      },
    });

    // Get circuit breaker status
    const cbStatus = circuitBreaker.getStatus();

    // Get recent autonomous trades (last 24 hours)
    const recentTrades = await prisma.trade.findMany({
      where: {
        isRealTrade: true,
        entryTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      include: {
        agent: {
          select: {
            name: true,
            aiProvider: true,
          },
        },
      },
      orderBy: {
        entryTime: 'desc',
      },
      take: 50,
    });

    // Calculate statistics
    const stats = {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.realBalance > 0).length,
      totalBalance: agents.reduce((sum, a) => sum + a.realBalance, 0),
      totalTrades24h: recentTrades.length,
      successfulTrades24h: recentTrades.filter(t => t.status === 'CLOSED' && (t.profitLoss || 0) > 0).length,
    };

    return NextResponse.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      stats,
      agents,
      circuitBreaker: cbStatus,
      recentTrades: recentTrades.map(t => ({
        id: t.id,
        agentName: t.agent?.name,
        symbol: t.symbol,
        side: t.side,
        type: t.type,
        quantity: t.quantity,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        profitLoss: t.profitLoss,
        status: t.status,
        txHash: t.txHash,
        chain: t.chain,
        entryTime: t.entryTime,
        exitTime: t.exitTime,
      })),
    });

  } catch (error) {
    console.error('Error getting autonomous trading status:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Emergency stop - halt all trading
 * DELETE /api/ai/autonomous
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Trigger emergency stop
    circuitBreaker.emergencyStopAll();
    
    await sendTelegramAlert(
      '🚨 *EMERGENCY STOP ACTIVATED*\n' +
      'All autonomous trading has been halted.\n' +
      'Manual intervention required.'
    );

    return NextResponse.json({
      success: true,
      message: 'Emergency stop activated - all trading halted',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error activating emergency stop:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

