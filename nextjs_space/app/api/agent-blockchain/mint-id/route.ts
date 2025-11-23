
/**
 * API endpoint for minting blockchain IDs for agents
 * POST: Mint a new blockchain ID with spending rules
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentGovernance } from '@/lib/agent-governance';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.agentId || !body.chain || !body.spendingCap || !body.dailySpendingCap) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Mint blockchain ID
    const blockchainID = await agentGovernance.mintAgentBlockchainID({
      agentId: body.agentId,
      chain: body.chain,
      spendingCap: body.spendingCap,
      dailySpendingCap: body.dailySpendingCap,
      allowedStrategies: body.allowedStrategies || [],
      requiresApproval: body.requiresApproval,
      socialRecovery: body.socialRecovery,
      recoveryAddresses: body.recoveryAddresses
    });

    return NextResponse.json({ success: true, blockchainID });
  } catch (error: any) {
    console.error('[Blockchain ID API] Error minting ID:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
