
/**
 * API endpoint for fetching blockchain ID information
 * GET: Get blockchain ID for an agent
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

    const blockchainID = await agentGovernance.getAgentBlockchainID(agentId);

    if (!blockchainID) {
      return NextResponse.json(
        { success: false, error: 'Agent does not have a blockchain ID' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, blockchainID });
  } catch (error: any) {
    console.error('[Blockchain ID Info API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
