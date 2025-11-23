
/**
 * API endpoint for agent staking statistics
 * GET: Get staking stats for an agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentGovernance } from '@/lib/agent-governance';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const stats = await agentGovernance.getAgentStakingStats(agentId);

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error('[Staking Stats API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
