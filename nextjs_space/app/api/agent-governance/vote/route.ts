
/**
 * API endpoint for submitting votes on governance proposals
 * POST: Submit a vote (FOR, AGAINST, ABSTAIN)
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentGovernance } from '@/lib/agent-governance';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.proposalId || !body.vote || !body.voterAddress || !body.voterId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate vote value
    if (!['FOR', 'AGAINST', 'ABSTAIN'].includes(body.vote)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vote value. Must be FOR, AGAINST, or ABSTAIN' },
        { status: 400 }
      );
    }

    // Submit vote
    const vote = await agentGovernance.submitVote({
      proposalId: body.proposalId,
      voterAddress: body.voterAddress,
      voterId: body.voterId,
      vote: body.vote,
      reason: body.reason
    });

    return NextResponse.json({ success: true, vote });
  } catch (error: any) {
    console.error('[Governance Vote API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
