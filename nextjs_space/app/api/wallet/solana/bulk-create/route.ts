
/**
 * API endpoint to create Solana wallets for all agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateSolanaWallet } from '@/lib/solana';

export async function POST(request: NextRequest) {
  try {
    // Get all agents without Solana wallets
    const agents = await prisma.aIAgent.findMany({
      where: {
        solanaWalletAddress: null,
      },
    });

    if (agents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All agents already have Solana wallets',
        created: 0,
      });
    }

    const results = [];

    // Create Solana wallet for each agent
    for (const agent of agents) {
      try {
        const wallet = generateSolanaWallet();

        await prisma.aIAgent.update({
          where: { id: agent.id },
          data: {
            solanaWalletAddress: wallet.publicKey,
            solanaPrivateKey: wallet.privateKey,
          },
        });

        results.push({
          agentId: agent.id,
          agentName: agent.name,
          walletAddress: wallet.publicKey,
          success: true,
        });
      } catch (error: any) {
        results.push({
          agentId: agent.id,
          agentName: agent.name,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Created ${successCount} Solana wallets`,
      created: successCount,
      results,
    });
  } catch (error: any) {
    console.error('Error creating Solana wallets:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create Solana wallets' },
      { status: 500 }
    );
  }
}
