
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { executeAutonomousTrade, runAutonomousTradingCycle } from '../../../../lib/autonomous-trading';

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds timeout for automated trading

/**
 * Execute automated trade for a specific agent
 * POST /api/ai/auto-trade { agentId: "..." }
 * 
 * Or run for all agents:
 * POST /api/ai/auto-trade { runAll: true }
 * 
 * NOTE: This endpoint now uses the full autonomous trading system with:
 * - Multi-layer AI analysis
 * - Circuit breaker protection
 * - Risk assessment
 * - Real-time alerts
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
        }
      });
    }

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    console.log(`🤖 Executing autonomous trade for agent: ${agentId}`);
    const result = await executeAutonomousTrade(agentId);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in automated trading:', error);
    return NextResponse.json(
      {
        error: 'Failed to execute automated trade',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get status of automated trading
 * GET /api/ai/auto-trade
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prisma } = await import('../../../../lib/db');
    
    // Get agents with real balance
    const activeAgents = await prisma.aIAgent.findMany({
      where: {
        realBalance: { gt: 0 }
      },
      select: {
        id: true,
        name: true,
        realBalance: true,
        totalTrades: true,
        winRate: true,
        strategyType: true
      },
      orderBy: {
        realBalance: 'desc'
      }
    });

    // Get recent automated trades
    const recentTrades = await prisma.trade.findMany({
      where: {
        isRealTrade: true,
        entryTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      include: {
        agent: {
          select: {
            name: true,
            strategyType: true
          }
        }
      },
      orderBy: {
        entryTime: 'desc'
      },
      take: 20
    });

    return NextResponse.json({
      activeAgents: activeAgents.length,
      agents: activeAgents,
      recentTrades: recentTrades.length,
      trades: recentTrades.map(t => ({
        id: t.id,
        agentName: t.agent?.name,
        symbol: t.symbol,
        side: t.side,
        quantity: t.quantity,
        price: t.entryPrice,
        time: t.entryTime,
        txHash: t.txHash
      }))
    });

  } catch (error) {
    console.error('Error getting automated trading status:', error);
    return NextResponse.json(
      {
        error: 'Failed to get status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

