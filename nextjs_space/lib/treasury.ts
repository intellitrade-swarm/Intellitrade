
import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import * as web3 from '@solana/web3.js';
import bs58 from 'bs58';

const prisma = new PrismaClient();

// Treasury configuration
const PROFIT_SHARE_PERCENTAGE = 5; // 5% of profits go to treasury
const MIN_PROFIT_FOR_SHARE = 1; // Minimum $1 profit to trigger sharing

interface TreasuryBalance {
  base: number;
  bsc: number;
  ethereum: number;
  solana: number;
  total: number;
}

interface TreasuryStats {
  balance: TreasuryBalance;
  totalReceived: number;
  totalTransactions: number;
  profitSharePercentage: number;
  recentTransactions: any[];
}

/**
 * Initialize the Treasury Fund
 * Creates treasury wallet addresses for all supported chains
 */
export async function initializeTreasury(): Promise<void> {
  console.log('🏦 Initializing Treasury Fund...');

  // Check if treasury already exists
  const existingTreasury = await prisma.treasury.findFirst();
  
  if (existingTreasury) {
    console.log('✅ Treasury already initialized');
    console.log(`   EVM Address: ${existingTreasury.evmWalletAddress}`);
    console.log(`   Solana Address: ${existingTreasury.solanaWalletAddress}`);
    return;
  }

  // Generate EVM wallet for Base, BSC, Ethereum
  const evmWallet = ethers.Wallet.createRandom();
  const evmAddress = evmWallet.address;
  const evmPrivateKey = evmWallet.privateKey;

  // Generate Solana wallet
  const solanaKeypair = web3.Keypair.generate();
  const solanaAddress = solanaKeypair.publicKey.toString();
  const solanaPrivateKey = bs58.encode(solanaKeypair.secretKey);

  // Create treasury in database
  await prisma.treasury.create({
    data: {
      name: 'Treasury Fund',
      evmWalletAddress: evmAddress,
      evmPrivateKey: evmPrivateKey, // In production, encrypt this!
      solanaWalletAddress: solanaAddress,
      solanaPrivateKey: solanaPrivateKey, // In production, encrypt this!
      baseBalance: 0,
      bscBalance: 0,
      ethereumBalance: 0,
      solanaBalance: 0,
      totalReceived: 0,
      totalTransactions: 0,
      profitSharePercentage: PROFIT_SHARE_PERCENTAGE,
    },
  });

  console.log('✅ Treasury initialized successfully!');
  console.log('\n📋 Treasury Wallet Addresses:');
  console.log(`   EVM (Base/BSC/Ethereum): ${evmAddress}`);
  console.log(`   Solana: ${solanaAddress}`);
  console.log('\n⚠️  IMPORTANT: Save these addresses securely!');
}

/**
 * Get treasury wallet addresses
 */
export async function getTreasuryAddresses(): Promise<{
  evm: string | null;
  solana: string | null;
}> {
  const treasury = await prisma.treasury.findFirst();
  
  if (!treasury) {
    return { evm: null, solana: null };
  }

  return {
    evm: treasury.evmWalletAddress,
    solana: treasury.solanaWalletAddress,
  };
}

/**
 * Get treasury statistics and balances
 */
export async function getTreasuryStats(): Promise<TreasuryStats> {
  const treasury = await prisma.treasury.findFirst({
    include: {
      transactions: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        include: {
          treasury: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!treasury) {
    throw new Error('Treasury not initialized');
  }

  const balance: TreasuryBalance = {
    base: treasury.baseBalance,
    bsc: treasury.bscBalance,
    ethereum: treasury.ethereumBalance,
    solana: treasury.solanaBalance,
    total: treasury.baseBalance + treasury.bscBalance + treasury.ethereumBalance + treasury.solanaBalance,
  };

  return {
    balance,
    totalReceived: treasury.totalReceived,
    totalTransactions: treasury.totalTransactions,
    profitSharePercentage: treasury.profitSharePercentage,
    recentTransactions: treasury.transactions,
  };
}

/**
 * Record profit share from agent trade
 * This is called automatically when an agent closes a profitable trade
 */
export async function recordProfitShare(
  agentId: string,
  tradeId: string,
  profitAmount: number,
  chain: string = 'base'
): Promise<{ success: boolean; amount: number; txHash?: string }> {
  console.log(`💰 Recording profit share for agent ${agentId}`);

  // Calculate profit share amount
  const shareAmount = profitAmount * (PROFIT_SHARE_PERCENTAGE / 100);

  // Check if profit is above minimum threshold
  if (shareAmount < MIN_PROFIT_FOR_SHARE) {
    console.log(`   ⏭️  Profit share $${shareAmount.toFixed(2)} below minimum threshold`);
    return { success: false, amount: 0 };
  }

  // Get or create treasury
  let treasury = await prisma.treasury.findFirst();
  
  if (!treasury) {
    console.log('   🏦 Treasury not initialized, creating...');
    await initializeTreasury();
    treasury = await prisma.treasury.findFirst();
    
    if (!treasury) {
      throw new Error('Failed to initialize treasury');
    }
  }

  const treasuryId = treasury.id;

  // Update treasury balance based on chain
  // Map astar-zkevm to base since AsterDEX is on Base network
  const normalizedChain = chain === 'astar-zkevm' ? 'base' : chain;
  
  const balanceField = normalizedChain === 'base' ? 'baseBalance' :
                       normalizedChain === 'bsc' ? 'bscBalance' :
                       normalizedChain === 'ethereum' ? 'ethereumBalance' :
                       normalizedChain === 'solana' ? 'solanaBalance' :
                       'baseBalance'; // Default to base for unknown chains

  // Record transaction in database
  await prisma.$transaction(async (tx) => {
    // Update treasury balance
    await tx.treasury.update({
      where: { id: treasuryId },
      data: {
        [balanceField]: {
          increment: shareAmount,
        },
        totalReceived: {
          increment: shareAmount,
        },
        totalTransactions: {
          increment: 1,
        },
      },
    });

    // Create transaction record
    await tx.treasuryTransaction.create({
      data: {
        treasuryId: treasuryId,
        agentId,
        tradeId,
        amount: shareAmount,
        currency: 'USDC',
        chain,
        description: `${PROFIT_SHARE_PERCENTAGE}% profit share from trade ${tradeId}`,
      },
    });
  });

  console.log(`   ✅ Recorded $${shareAmount.toFixed(2)} profit share to treasury (${chain})`);

  return {
    success: true,
    amount: shareAmount,
  };
}

/**
 * Get treasury balance for a specific chain
 */
export async function getTreasuryBalance(chain?: string): Promise<number> {
  const treasury = await prisma.treasury.findFirst();
  
  if (!treasury) {
    return 0;
  }

  if (!chain) {
    // Return total balance across all chains
    return treasury.baseBalance + treasury.bscBalance + treasury.ethereumBalance + treasury.solanaBalance;
  }

  switch (chain.toLowerCase()) {
    case 'base':
      return treasury.baseBalance;
    case 'bsc':
      return treasury.bscBalance;
    case 'ethereum':
      return treasury.ethereumBalance;
    case 'solana':
      return treasury.solanaBalance;
    default:
      return 0;
  }
}

/**
 * Get recent treasury transactions
 */
export async function getRecentTransactions(limit: number = 10) {
  const transactions = await prisma.treasuryTransaction.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    include: {
      treasury: {
        select: {
          name: true,
        },
      },
    },
  });

  return transactions;
}

/**
 * Update treasury profit share percentage
 */
export async function updateProfitSharePercentage(percentage: number): Promise<void> {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Profit share percentage must be between 0 and 100');
  }

  const treasury = await prisma.treasury.findFirst();
  
  if (!treasury) {
    throw new Error('Treasury not initialized');
  }

  await prisma.treasury.update({
    where: { id: treasury.id },
    data: {
      profitSharePercentage: percentage,
    },
  });

  console.log(`✅ Treasury profit share updated to ${percentage}%`);
}

export default {
  initializeTreasury,
  getTreasuryAddresses,
  getTreasuryStats,
  recordProfitShare,
  getTreasuryBalance,
  getRecentTransactions,
  updateProfitSharePercentage,
};
