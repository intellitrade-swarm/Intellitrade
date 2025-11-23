
/**
 * API endpoint to create Solana wallet for an agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateSolanaWallet } from '@/lib/solana';

export async function POST(request: NextRequest) {
  try {
    const { agentId } = await request.json();

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Check if agent exists
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if agent already has a Solana wallet
    if (agent.solanaWalletAddress) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Agent already has a Solana wallet',
          walletAddress: agent.solanaWalletAddress
        },
        { status: 400 }
      );
    }

    // Generate new Solana wallet
    const wallet = generateSolanaWallet();

    // Update agent with Solana wallet info
    const updatedAgent = await prisma.aIAgent.update({
      where: { id: agentId },
      data: {
        solanaWalletAddress: wallet.publicKey,
        solanaPrivateKey: wallet.privateKey,
      },
    });

    return NextResponse.json({
      success: true,
      walletAddress: wallet.publicKey,
      message: 'Solana wallet created successfully',
    });
  } catch (error: any) {
    console.error('Error creating Solana wallet:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create Solana wallet' },
      { status: 500 }
    );
  }
}
