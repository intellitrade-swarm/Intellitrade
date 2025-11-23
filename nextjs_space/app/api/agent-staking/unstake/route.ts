
/**
 * API endpoint for unstaking tokens from an agent
 * POST: Unstake tokens and claim rewards
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentGovernance } from '@/lib/agent-governance';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.userId || !body.agentId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Agent ID are required' },
        { status: 400 }
      );
    }

    // Unstake
    const result = await agentGovernance.unstakeFromAgent(body.userId, body.agentId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Unstaking API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
