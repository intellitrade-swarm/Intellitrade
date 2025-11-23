
/**
 * API endpoints for governance proposals
 * GET: Fetch all proposals or filter by status
 * POST: Create a new governance proposal
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentGovernance } from '@/lib/agent-governance';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const agentId = searchParams.get('agentId');

    if (status === 'active') {
      const proposals = await agentGovernance.getActiveProposals();
      return NextResponse.json({ success: true, proposals });
    }

    // Get all proposals with optional agent filter
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const proposals = await prisma.governanceProposal.findMany({
      where: agentId ? { targetAgentId: agentId } : undefined,
      include: {
        targetAgent: {
          select: {
            name: true,
            strategyType: true,
            winRate: true,
            totalProfitLoss: true
          }
        },
        votes: {
          select: {
            vote: true,
            votingPower: true,
            voterAddress: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return NextResponse.json({ success: true, proposals });
  } catch (error: any) {
    console.error('[Governance Proposals API] Error:', error);
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
    if (!body.title || !body.description || !body.proposalType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create proposal
    const proposal = await agentGovernance.createGovernanceProposal({
      title: body.title,
      description: body.description,
      proposalType: body.proposalType,
      targetAgentId: body.targetAgentId,
      affectsAllAgents: body.affectsAllAgents || false,
      proposedChanges: body.proposedChanges,
      currentValues: body.currentValues,
      votingDuration: body.votingDuration || 48, // Default 48 hours
      proposer: body.proposer || 'demo-user'
    });

    return NextResponse.json({ success: true, proposal });
  } catch (error: any) {
    console.error('[Governance Proposals API] Error creating proposal:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
