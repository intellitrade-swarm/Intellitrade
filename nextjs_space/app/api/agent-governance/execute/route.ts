
/**
 * API endpoint for executing passed governance proposals
 * POST: Execute a proposal that has passed voting
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentGovernance } from '@/lib/agent-governance';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.proposalId) {
      return NextResponse.json(
        { success: false, error: 'Proposal ID is required' },
        { status: 400 }
      );
    }

    // Execute proposal
    const result = await agentGovernance.executeProposal(body.proposalId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Governance Execute API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
