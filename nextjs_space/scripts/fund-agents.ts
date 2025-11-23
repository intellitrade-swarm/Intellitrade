
/**
 * Script to fund all AI agent wallets with USDC on Base network
 * 
 * Usage:
 *   1. Set environment variable: FUNDING_WALLET_PRIVATE_KEY=your_private_key
 *   2. Ensure your funding wallet has sufficient USDC on Base
 *   3. Run: yarn tsx scripts/fund-agents.ts
 */

import { ethers } from 'ethers';
import { prisma } from '../lib/db';

const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const FUNDING_WALLET_PRIVATE_KEY = process.env.FUNDING_WALLET_PRIVATE_KEY;

// USDC contract on Base
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// USDC ABI (minimal)
const USDC_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

async function fundAgents() {
  if (!FUNDING_WALLET_PRIVATE_KEY) {
    console.error('❌ Error: FUNDING_WALLET_PRIVATE_KEY not set');
    console.log('\nSet your funding wallet private key:');
    console.log('export FUNDING_WALLET_PRIVATE_KEY=your_private_key_here\n');
    process.exit(1);
  }

  console.log('🚀 Starting agent wallet funding process...\n');

  // Connect to Base network
  const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
  const fundingWallet = new ethers.Wallet(FUNDING_WALLET_PRIVATE_KEY, provider);
  
  console.log(`📍 Funding Wallet: ${fundingWallet.address}`);

  // Connect to USDC contract
  const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, fundingWallet);
  
  // Check funding wallet balance
  const balance = await usdcContract.balanceOf(fundingWallet.address);
  const balanceFormatted = ethers.formatUnits(balance, 6); // USDC has 6 decimals
  
  console.log(`💰 Available USDC: $${balanceFormatted}\n`);

  if (parseFloat(balanceFormatted) < 10) {
    console.error('❌ Insufficient USDC in funding wallet. Need at least $10 USDC.');
    process.exit(1);
  }

  // Get all agents
  const agents = await prisma.aIAgent.findMany({
    where: {
      realBalance: { gt: 0 }
    },
    select: {
      id: true,
      name: true,
      walletAddress: true,
      realBalance: true
    }
  });

  console.log(`📊 Found ${agents.length} agents to fund\n`);

  const totalRequired = agents.reduce((sum, a) => sum + a.realBalance, 0);
  
  console.log(`💵 Total USDC needed: $${totalRequired.toFixed(2)}`);
  
  if (parseFloat(balanceFormatted) < totalRequired) {
    console.error(`❌ Insufficient funds. Have $${balanceFormatted}, need $${totalRequired.toFixed(2)}`);
    process.exit(1);
  }

  console.log('✅ Sufficient funds available\n');
  console.log('🔄 Starting transfers...\n');

  let successCount = 0;
  let failCount = 0;

  for (const agent of agents) {
    if (!agent.walletAddress) {
      console.log(`⚠️  ${agent.name}: No wallet address, skipping`);
      failCount++;
      continue;
    }

    try {
      // Check current balance
      const currentBalance = await usdcContract.balanceOf(agent.walletAddress);
      const currentBalanceFormatted = parseFloat(ethers.formatUnits(currentBalance, 6));

      if (currentBalanceFormatted >= agent.realBalance) {
        console.log(`✓ ${agent.name}: Already funded ($${currentBalanceFormatted.toFixed(2)} USDC)`);
        successCount++;
        continue;
      }

      // Calculate amount to send
      const amountToSend = agent.realBalance - currentBalanceFormatted;
      const amountInUSDC = ethers.parseUnits(amountToSend.toFixed(6), 6);

      console.log(`📤 ${agent.name}: Sending $${amountToSend.toFixed(2)} USDC to ${agent.walletAddress}...`);

      // Execute transfer
      const tx = await usdcContract.transfer(agent.walletAddress, amountInUSDC);
      console.log(`   ⏳ Transaction hash: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log(`   ✅ Confirmed! Block: ${receipt.blockNumber}\n`);
        successCount++;
      } else {
        console.log(`   ❌ Transaction failed\n`);
        failCount++;
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`   ❌ Error: ${error}\n`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 FUNDING SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successful: ${successCount}/${agents.length}`);
  console.log(`❌ Failed: ${failCount}/${agents.length}`);
  console.log('='.repeat(50) + '\n');

  if (successCount > 0) {
    console.log('✅ Funding completed! Run check-wallets.ts to verify:\n');
    console.log('   yarn tsx --require dotenv/config check-wallets.ts\n');
  }
}

fundAgents()
  .catch(console.error)
  .finally(() => process.exit());
