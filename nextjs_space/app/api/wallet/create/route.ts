

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { createWallet, encryptPrivateKey } from '../../../../lib/wallet';

export const dynamic = "force-dynamic";

/**
 * Create a new wallet for an agent
 * POST /api/wallet/create
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { agentId, chain = 'base' } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    // Check if agent exists
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check if agent already has a wallet
    if (agent.walletAddress) {
      return NextResponse.json({ 
        error: 'Agent already has a wallet',
        walletAddress: agent.walletAddress 
      }, { status: 400 });
    }

    // Create new wallet
    const wallet = createWallet();
    const encryptedKey = encryptPrivateKey(wallet.privateKey);

    // Update agent with wallet info
    const updatedAgent = await prisma.aIAgent.update({
      where: { id: agentId },
      data: {
        walletAddress: wallet.address,
        encryptedPrivateKey: encryptedKey,
        primaryChain: chain,
      },
    });

    return NextResponse.json({
      success: true,
      walletAddress: wallet.address,
      chain,
      message: 'Wallet created successfully. You can now fund this wallet to enable real trading.',
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    return NextResponse.json({ 
      error: 'Failed to create wallet',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
