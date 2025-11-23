
import 'dotenv/config';
import { prisma } from '../lib/db';
import { ethers } from 'ethers';
import { getProvider } from '../lib/blockchain';

async function checkUsdcBalances() {
  console.log('🔍 Checking USDC balances for all agents...\n');

  // Get all agents with wallets
  const agents = await prisma.aIAgent.findMany({
    where: {
      walletAddress: { not: null }
    },
    select: {
      id: true,
      name: true,
      walletAddress: true,
      realBalance: true
    }
  });

  if (agents.length === 0) {
    console.log('❌ No agents with wallet addresses found.');
    return;
  }

  // Base network provider
  const provider = getProvider('base');
  
  // USDC contract on Base
  const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  const USDC_ABI = [
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)'
  ];

  console.log(`📊 Found ${agents.length} agents with wallets\n`);
  console.log('='.repeat(100));

  for (const agent of agents) {
    try {
      if (!agent.walletAddress) continue;

      // Get ETH balance
      const ethBalanceBigInt = await provider.getBalance(agent.walletAddress);
      const ethBalance = ethers.formatEther(ethBalanceBigInt);

      // Get USDC balance
      const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
      const usdcBalanceBigInt = await usdcContract.balanceOf(agent.walletAddress);
      const usdcBalance = ethers.formatUnits(usdcBalanceBigInt, 6); // USDC has 6 decimals

      console.log(`\n🤖 ${agent.name}`);
      console.log(`   Wallet: ${agent.walletAddress}`);
      console.log(`   Base ETH: ${parseFloat(ethBalance).toFixed(6)} ETH`);
      console.log(`   USDC: $${parseFloat(usdcBalance).toFixed(2)}`);
      console.log(`   DB Balance: $${agent.realBalance || 0}`);
      
      if (parseFloat(usdcBalance) > 0) {
        console.log(`   ✅ Has USDC balance!`);
      } else {
        console.log(`   ⚠️  No USDC balance detected`);
      }
      
    } catch (error) {
      console.log(`\n❌ Error checking ${agent.name}:`, error);
    }
  }

  console.log('\n' + '='.repeat(100));
  console.log('\n✅ Balance check complete!');
  
  await prisma.$disconnect();
}

checkUsdcBalances().catch(console.error);
