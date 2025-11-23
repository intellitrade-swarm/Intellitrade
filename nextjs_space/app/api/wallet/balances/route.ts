
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { ethers } from 'ethers';
import { getProvider } from '../../../../lib/blockchain';
import { getSolBalance } from '../../../../lib/solana';

/**
 * Get real-time wallet balances for all agents
 * Returns Base ETH, USDC balances, Solana SOL balances, and BSC BNB balances
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all agents with wallet addresses (EVM, Solana, and BSC)
    const agents = await prisma.aIAgent.findMany({
      select: {
        id: true,
        name: true,
        walletAddress: true,
        solanaWalletAddress: true,
        bscWalletAddress: true,
        realBalance: true
      }
    });

    if (agents.length === 0) {
      return NextResponse.json({ balances: [] });
    }

    // Base network provider
    const provider = getProvider('base');
    
    // BSC network provider
    const bscProvider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    
    // USDC contract on Base
    const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    const USDC_ABI = [
      'function balanceOf(address account) view returns (uint256)',
      'function decimals() view returns (uint8)'
    ];

    // Fetch balances for all agents
    const balances = await Promise.all(
      agents.map(async (agent) => {
        try {
          // Initialize balance object
          const balanceData: any = {
            agentId: agent.id,
            agentName: agent.name,
            walletAddress: agent.walletAddress || null,
            solanaWalletAddress: agent.solanaWalletAddress || null,
            bscWalletAddress: agent.bscWalletAddress || null,
            ethBalance: '0',
            usdcBalance: '0',
            solBalance: '0',
            bnbBalance: '0',
            databaseBalance: agent.realBalance || 0,
            error: null
          };

          // Fetch EVM balances if wallet exists
          if (agent.walletAddress) {
            try {
              // Get ETH balance
              const ethBalanceBigInt = await provider.getBalance(agent.walletAddress);
              const ethBalance = ethers.formatEther(ethBalanceBigInt);

              // Get USDC balance
              const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
              const usdcBalanceBigInt = await usdcContract.balanceOf(agent.walletAddress);
              const usdcBalance = ethers.formatUnits(usdcBalanceBigInt, 6); // USDC has 6 decimals

              balanceData.ethBalance = parseFloat(ethBalance).toFixed(4);
              balanceData.usdcBalance = parseFloat(usdcBalance).toFixed(2);
            } catch (error) {
              console.error(`Error fetching EVM balance for ${agent.name}:`, error);
            }
          }

          // Fetch Solana balance if wallet exists
          if (agent.solanaWalletAddress) {
            try {
              const solBalance = await getSolBalance(agent.solanaWalletAddress);
              balanceData.solBalance = solBalance.toFixed(4);
            } catch (error) {
              console.error(`Error fetching Solana balance for ${agent.name}:`, error);
            }
          }

          // Fetch BSC balance if wallet exists
          if (agent.bscWalletAddress) {
            try {
              const bnbBalanceBigInt = await bscProvider.getBalance(agent.bscWalletAddress);
              const bnbBalance = ethers.formatEther(bnbBalanceBigInt);
              balanceData.bnbBalance = parseFloat(bnbBalance).toFixed(4);
            } catch (error) {
              console.error(`Error fetching BSC balance for ${agent.name}:`, error);
            }
          }

          // Set error message if no wallets
          if (!agent.walletAddress && !agent.solanaWalletAddress && !agent.bscWalletAddress) {
            balanceData.error = 'No wallet addresses';
          }

          return balanceData;
        } catch (error) {
          console.error(`Error fetching balances for ${agent.name}:`, error);
          return {
            agentId: agent.id,
            agentName: agent.name,
            walletAddress: agent.walletAddress || null,
            solanaWalletAddress: agent.solanaWalletAddress || null,
            bscWalletAddress: agent.bscWalletAddress || null,
            ethBalance: '0',
            usdcBalance: '0',
            solBalance: '0',
            bnbBalance: '0',
            databaseBalance: agent.realBalance || 0,
            error: 'Failed to fetch balances'
          };
        }
      })
    );

    return NextResponse.json({ 
      balances,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet balances' },
      { status: 500 }
    );
  }
}
