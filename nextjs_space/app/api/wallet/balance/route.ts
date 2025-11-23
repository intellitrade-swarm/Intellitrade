

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { getWalletBalances } from '../../../../lib/wallet';
import { ChainName } from '../../../../lib/blockchain-config';
import { fetchBlockchainPrices } from '../../../../lib/blockchain';

export const dynamic = "force-dynamic";

/**
 * Get wallet balance for an agent
 * GET /api/wallet/balance?agentId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    // Get agent with wallet info
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (!agent.walletAddress) {
      return NextResponse.json({ 
        error: 'Agent does not have a wallet',
        hasWallet: false 
      }, { status: 400 });
    }

    const chain = (agent.primaryChain || 'base') as ChainName;

    // Fetch balances
    const balances = await getWalletBalances(agent.walletAddress, chain);

    // Fetch current prices
    const prices = await fetchBlockchainPrices();
    
    // Calculate USD value (native + USDC)
    let nativeUsdValue = 0;
    const nativeBalance = parseFloat(balances.native);
    const usdcBalance = parseFloat(balances.usdc);
    
    if (chain === 'ethereum' || chain === 'base') {
      const ethPrice = prices.get('ETH');
      if (ethPrice) {
        nativeUsdValue = nativeBalance * ethPrice.price;
      }
    } else if (chain === 'bsc') {
      const bnbPrice = prices.get('BNB');
      if (bnbPrice) {
        nativeUsdValue = nativeBalance * bnbPrice.price;
      }
    }
    
    // Total USD value = native + USDC (USDC is already in USD)
    const totalUsdValue = nativeUsdValue + usdcBalance;

    // Update agent's real balance
    await prisma.aIAgent.update({
      where: { id: agentId },
      data: { realBalance: totalUsdValue },
    });

    return NextResponse.json({
      success: true,
      walletAddress: agent.walletAddress,
      chain,
      balances: {
        native: balances.native,
        symbol: balances.nativeSymbol,
        usdc: balances.usdc,
        nativeUsdValue: nativeUsdValue.toFixed(2),
        usdcValue: usdcBalance.toFixed(2),
        totalUsdValue: totalUsdValue.toFixed(2),
      },
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch wallet balance',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
