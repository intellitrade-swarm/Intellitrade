
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all agents without BSC wallets
    const agents = await prisma.aIAgent.findMany({
      where: {
        bscWalletAddress: null,
      },
    });

    if (agents.length === 0) {
      return NextResponse.json({ 
        message: 'All agents already have BSC wallets',
        success: true 
      });
    }

    const created: string[] = [];

    // Create BSC wallets for all agents
    for (const agent of agents) {
      try {
        const wallet = ethers.Wallet.createRandom();
        const bscWalletAddress = wallet.address;
        const encryptedPrivateKey = wallet.privateKey; // In production, encrypt this!

        await prisma.aIAgent.update({
          where: { id: agent.id },
          data: {
            bscWalletAddress,
            bscPrivateKey: encryptedPrivateKey,
          },
        });

        created.push(`${agent.name}: ${bscWalletAddress}`);
        console.log(`✅ Created BSC wallet for ${agent.name}: ${bscWalletAddress}`);
      } catch (error) {
        console.error(`Error creating BSC wallet for ${agent.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created.length} BSC wallet(s)`,
      wallets: created,
    });

  } catch (error) {
    console.error('Error in bulk BSC wallet creation:', error);
    return NextResponse.json(
      { error: 'Failed to create BSC wallets' },
      { status: 500 }
    );
  }
}
