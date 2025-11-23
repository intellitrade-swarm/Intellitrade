
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

    const { agentId } = await req.json();

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    // Check if agent exists and belongs to user
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check if agent already has a BSC wallet
    if (agent.bscWalletAddress) {
      return NextResponse.json({ 
        error: 'Agent already has a BSC wallet',
        walletAddress: agent.bscWalletAddress 
      }, { status: 400 });
    }

    // Create new BSC wallet
    const wallet = ethers.Wallet.createRandom();
    const bscWalletAddress = wallet.address;
    const encryptedPrivateKey = wallet.privateKey; // In production, encrypt this!

    // Update agent with BSC wallet
    await prisma.aIAgent.update({
      where: { id: agentId },
      data: {
        bscWalletAddress,
        bscPrivateKey: encryptedPrivateKey,
      },
    });

    console.log(`✅ Created BSC wallet for agent ${agent.name}: ${bscWalletAddress}`);

    return NextResponse.json({
      success: true,
      walletAddress: bscWalletAddress,
      message: 'BSC wallet created successfully',
    });

  } catch (error) {
    console.error('Error creating BSC wallet:', error);
    return NextResponse.json(
      { error: 'Failed to create BSC wallet' },
      { status: 500 }
    );
  }
}
