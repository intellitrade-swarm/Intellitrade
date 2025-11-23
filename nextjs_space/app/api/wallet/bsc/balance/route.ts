
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { ethers } from 'ethers';
import { BLOCKCHAIN_CONFIG } from '@/lib/blockchain-config';

// Simple BNB price fetcher
async function getBNBPrice(): Promise<number> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
    const data = await response.json();
    return data.binancecoin?.usd || 0;
  } catch (error) {
    console.error('Error fetching BNB price:', error);
    return 0;
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    // Get agent with BSC wallet
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
    });

    if (!agent || !agent.bscWalletAddress) {
      return NextResponse.json({ 
        error: 'Agent or BSC wallet not found' 
      }, { status: 404 });
    }

    // Connect to BSC
    const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.bsc.rpcUrl);
    
    // Get BNB balance
    const balanceWei = await provider.getBalance(agent.bscWalletAddress);
    const bnbBalance = parseFloat(ethers.formatEther(balanceWei));

    // Get BNB price
    const bnbPrice = await getBNBPrice();
    const usdValue = bnbBalance * bnbPrice;

    return NextResponse.json({
      success: true,
      walletAddress: agent.bscWalletAddress,
      bnbBalance,
      bnbPrice,
      usdValue,
      chain: 'bsc',
      chainId: BLOCKCHAIN_CONFIG.bsc.chainId,
    });

  } catch (error) {
    console.error('Error fetching BSC balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch BSC balance' },
      { status: 500 }
    );
  }
}
