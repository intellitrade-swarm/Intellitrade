
/**
 * API endpoint for managing staking rewards
 * GET: Get unclaimed rewards
 * POST: Claim rewards
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentGovernance } from '@/lib/agent-governance';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

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
        active: true
      },
      include: {
        agent: {
          select: {
            name: true
          }
        },
        rewards: {
          where: { claimed: false }
        }
      }
    });

    const unclaimedRewards = stakes.map(stake => ({
      stakingId: stake.id,
      agentId: stake.agentId,
      agentName: stake.agent.name,
      unclaimedAmount: stake.unclaimedRewards,
      totalEarned: stake.totalRewardsEarned,
      rewards: stake.rewards
    }));

    const totalUnclaimed = unclaimedRewards.reduce((sum, r) => sum + r.unclaimedAmount, 0);

    return NextResponse.json({ success: true, unclaimedRewards, totalUnclaimed });
  } catch (error: any) {
    console.error('[Rewards API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.stakingId) {
      return NextResponse.json(
        { success: false, error: 'Staking ID is required' },
        { status: 400 }
      );
    }

    // Claim rewards
    const result = await agentGovernance.claimStakingRewards(body.stakingId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Rewards API] Error claiming rewards:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
