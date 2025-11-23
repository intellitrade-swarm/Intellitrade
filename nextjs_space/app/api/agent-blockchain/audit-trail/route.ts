
/**
 * API endpoint for agent audit trails
 * GET: Fetch audit trail for an agent
 * POST: Verify audit trail integrity
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentGovernance } from '@/lib/agent-governance';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const auditTrail = await agentGovernance.getAgentAuditTrail(agentId, limit);

    return NextResponse.json({ success: true, auditTrail });
  } catch (error: any) {
    console.error('[Audit Trail API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.agentId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Verify audit trail integrity
    const verification = await agentGovernance.verifyAuditTrailIntegrity(body.agentId);

    return NextResponse.json({ success: true, ...verification });
  } catch (error: any) {
    console.error('[Audit Trail API] Error verifying:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
