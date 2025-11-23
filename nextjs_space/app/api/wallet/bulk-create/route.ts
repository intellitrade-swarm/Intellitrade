

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { createWallet, encryptPrivateKey } from '../../../../lib/wallet';

export const dynamic = "force-dynamic";

/**
 * Create wallets for all agents that don't have one
 * POST /api/wallet/bulk-create
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all agents without wallets
    const agentsWithoutWallets = await prisma.aIAgent.findMany({
      where: {
        walletAddress: null,
        isActive: true,
      },
    });

    if (agentsWithoutWallets.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All active agents already have wallets',
        created: 0,
      });
    }

    const createdWallets = [];

    // Create wallets for each agent
    for (const agent of agentsWithoutWallets) {
      try {
        const wallet = createWallet();
        const encryptedKey = encryptPrivateKey(wallet.privateKey);

        await prisma.aIAgent.update({
          where: { id: agent.id },
          data: {
            walletAddress: wallet.address,
            encryptedPrivateKey: encryptedKey,
            primaryChain: 'base', // Default to Base
          },
        });

        createdWallets.push({
          agentName: agent.name,
          walletAddress: wallet.address,
        });
      } catch (error) {
        console.error(`Error creating wallet for agent ${agent.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdWallets.length} wallets`,
      wallets: createdWallets,
    });
  } catch (error) {
    console.error('Error in bulk wallet creation:', error);
    return NextResponse.json({ 
      error: 'Failed to create wallets',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
