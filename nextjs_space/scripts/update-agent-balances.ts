
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function updateAgentBalances() {
  console.log('🔄 Updating agent wallet balances from on-chain data...\n');

  const agents = await prisma.aIAgent.findMany();

  // Setup Base provider
  const baseProvider = new ethers.JsonRpcProvider(
    process.env.BASE_RPC_URL || 'https://mainnet.base.org'
  );

  // USDC contract on Base
  const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  const USDC_ABI = ['function balanceOf(address) view returns (uint256)'];
  const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, baseProvider);

  const ETH_PRICE = 2500; // Approximate ETH price

  for (const agent of agents) {
    if (!agent.walletAddress) {
      console.log(`⚠️  ${agent.name}: No wallet address`);
      continue;
    }

    try {
      // Get ETH balance
      const ethBalance = await baseProvider.getBalance(agent.walletAddress);
      const ethAmount = parseFloat(ethers.formatEther(ethBalance));

      // Get USDC balance
      const usdcBalance = await usdcContract.balanceOf(agent.walletAddress);
      const usdcAmount = parseFloat(ethers.formatUnits(usdcBalance, 6));

      // Calculate total in USD
      const ethValue = ethAmount * ETH_PRICE;
      const totalBalance = ethValue + usdcAmount;

      // Update database
      await prisma.aIAgent.update({
        where: { id: agent.id },
        data: { realBalance: totalBalance },
      });

      console.log(`✅ ${agent.name}:`);
      console.log(`   ETH: ${ethAmount.toFixed(6)} ($${ethValue.toFixed(2)})`);
      console.log(`   USDC: $${usdcAmount.toFixed(2)}`);
      console.log(`   Total: $${totalBalance.toFixed(2)}\n`);
    } catch (error) {
      console.error(`❌ Error updating ${agent.name}:`, error);
    }
  }

  console.log('✅ All agent balances updated successfully!');
  await prisma.$disconnect();
}

updateAgentBalances();
