
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { getWalletBalances } from '../../../../lib/wallet';
import { ChainName } from '../../../../lib/blockchain-config';
import { fetchBlockchainPrices } from '../../../../lib/blockchain';

export const dynamic = "force-dynamic";

/**
 * Refresh all agent wallet balances
 * GET /api/wallet/refresh-all
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all agents
    const agents = await prisma.aIAgent.findMany({
      where: { isActive: true },
    });

    // Fetch current prices
    const prices = await fetchBlockchainPrices();
    
    const results = [];

    for (const agent of agents) {
      const agentBalances: any = {
        agentId: agent.id,
        name: agent.name,
      };

      // Update ETH/Base wallet balance
      if (agent.walletAddress) {
        try {
          const chain = (agent.primaryChain || 'base') as ChainName;
          const balances = await getWalletBalances(agent.walletAddress, chain);
          
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
          
          const totalUsdValue = nativeUsdValue + usdcBalance;

          // Update agent's real balance
          await prisma.aIAgent.update({
            where: { id: agent.id },
            data: { realBalance: totalUsdValue },
          });

          agentBalances.ethBalance = totalUsdValue;
        } catch (error) {
          console.error(`Error fetching ETH balance for ${agent.name}:`, error);
          agentBalances.ethBalance = 'error';
        }
      }

      // Note: SOL and BSC wallet balances are currently tracked separately
      // Only ETH/Base wallet balances are stored in realBalance field

      results.push(agentBalances);
    }

    return NextResponse.json({
      success: true,
      message: 'All wallet balances refreshed',
      balances: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error refreshing all wallet balances:', error);
    return NextResponse.json({ 
      error: 'Failed to refresh wallet balances',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
