
import { NextRequest, NextResponse } from 'next/server';
import { executeAsterTrade, closeAsterTrade, getPosition } from '@/lib/aster-dex-onchain';
import { prisma } from '@/lib/db';

/**
 * POST /api/aster-dex/trade
 * Execute a trade on AsterDEX
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, market, side, collateralUSD, leverage = 2 } = body;

    if (!agentId || !market || !side || !collateralUSD) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await executeAsterTrade(
      agentId,
      market,
      side,
      collateralUSD,
      leverage
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error executing AsterDEX trade:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/aster-dex/trade?agentId=xxx&market=BTC-USD
 * Get position info for an agent
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const market = searchParams.get('market');

    if (!agentId || !market) {
      return NextResponse.json(
        { error: 'Missing agentId or market' },
        { status: 400 }
      );
    }

    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const position = await getPosition(market, agent.walletAddress as `0x${string}`);

    return NextResponse.json({ position });

  } catch (error) {
    console.error('Error getting AsterDEX position:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/aster-dex/trade
 * Close a position on AsterDEX
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, market, tradeId } = body;

    if (!agentId || !market || !tradeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await closeAsterTrade(agentId, market, tradeId);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error closing AsterDEX position:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
