
/**
 * API endpoints for agent staking
 * GET: Get user's stakes
 * POST: Stake tokens on an agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentGovernance } from '@/lib/agent-governance';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const stakes = await prisma.agentStaking.findMany({
      where: {
        userId,
        ...(agentId && { agentId }),
        active: true
      },
      include: {
        agent: {
          select: {
            name: true,
            strategyType: true,
            totalProfitLoss: true,
            winRate: true
          }
        },
        rewards: {
          where: { claimed: false }
        }
      },
      orderBy: {
        stakedAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, stakes });
  } catch (error: any) {
    console.error('[Staking API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.userId || !body.userAddress || !body.agentId || !body.amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Create stake
    const stake = await agentGovernance.stakeOnAgent({
      userId: body.userId,
      userAddress: body.userAddress,
      agentId: body.agentId,
      amount: body.amount,
      lockPeriod: body.lockPeriod
    });

    return NextResponse.json({ success: true, stake });
  } catch (error: any) {
    console.error('[Staking API] Error staking:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
