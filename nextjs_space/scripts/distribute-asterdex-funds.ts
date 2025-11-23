
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

interface Agent {
  id: string;
  name: string;
  walletAddress: string | null;
  realBalance: number;
  strategyType: string;
}

async function distributeAsterDEXFunds() {
  console.log('💰 ASTERDEX FUND DISTRIBUTION STRATEGY\n');
  console.log('═══════════════════════════════════════════════════════\n');

  // Get all agents with their current balances
  const agents = await prisma.aIAgent.findMany({
    where: {
      isActive: true,
      primaryChain: 'base',
      walletAddress: { not: null }
    },
    select: {
      id: true,
      name: true,
      walletAddress: true,
      realBalance: true,
      strategyType: true,
    },
    orderBy: { realBalance: 'asc' }
  });

  console.log('📊 Current Agent Balances:\n');

  let totalCurrentBalance = 0;
  agents.forEach((agent) => {
    console.log(`${agent.name}:`);
    console.log(`  Current: $${agent.realBalance.toFixed(2)}`);
    console.log(`  Wallet: ${agent.walletAddress}`);
    console.log('');
    totalCurrentBalance += agent.realBalance;
  });

  console.log(`\n💵 Total Current Balance: $${totalCurrentBalance.toFixed(2)}`);
  console.log(`💰 Available to Distribute: $201 (0.08 ETH at $2,500/ETH)\n`);

  // Distribution strategy: Focus on agents with lowest balances
  const TOTAL_TO_DISTRIBUTE = 201; // $201 in ETH
  const ETH_PRICE = 2500;
  const ETH_TO_DISTRIBUTE = TOTAL_TO_DISTRIBUTE / ETH_PRICE; // 0.0804 ETH

  console.log('🎯 DISTRIBUTION STRATEGY:\n');
  console.log('Priority: Fund agents with lowest balances to maximize trading opportunities\n');

  // Calculate distribution based on current balance deficit
  const TARGET_BALANCE = 50; // Target $50 per agent
  const distributionPlan: Array<{ agent: Agent; ethAmount: number; usdAmount: number }> = [];

  let remainingToDistribute = TOTAL_TO_DISTRIBUTE;

  for (const agent of agents) {
    if (remainingToDistribute <= 0) break;

    const deficit = Math.max(0, TARGET_BALANCE - agent.realBalance);
    const allocation = Math.min(deficit, remainingToDistribute);

    if (allocation > 0) {
      const ethAmount = allocation / ETH_PRICE;
      distributionPlan.push({
        agent,
        ethAmount,
        usdAmount: allocation,
      });
      remainingToDistribute -= allocation;
    }
  }

  // If we still have funds remaining, distribute equally to all agents
  if (remainingToDistribute > 0) {
    const equalShare = remainingToDistribute / agents.length;
    agents.forEach((agent) => {
      const existing = distributionPlan.find((p) => p.agent.id === agent.id);
      if (existing) {
        existing.ethAmount += equalShare / ETH_PRICE;
        existing.usdAmount += equalShare;
      } else {
        distributionPlan.push({
          agent,
          ethAmount: equalShare / ETH_PRICE,
          usdAmount: equalShare,
        });
      }
    });
  }

  console.log('📋 DISTRIBUTION PLAN:\n');
  distributionPlan.forEach((plan, index) => {
    console.log(`${index + 1}. ${plan.agent.name}`);
    console.log(`   Wallet: ${plan.agent.walletAddress}`);
    console.log(`   Current Balance: $${plan.agent.realBalance.toFixed(2)}`);
    console.log(`   Allocation: ${plan.ethAmount.toFixed(6)} ETH ($${plan.usdAmount.toFixed(2)})`);
    console.log(`   New Balance: $${(plan.agent.realBalance + plan.usdAmount).toFixed(2)}`);
    console.log('');
  });

  const totalAllocated = distributionPlan.reduce((sum, p) => sum + p.usdAmount, 0);
  console.log(`\n💰 Total to Distribute: $${totalAllocated.toFixed(2)}`);
  console.log(`🚀 Expected Impact: ${distributionPlan.length} agents funded\n`);

  console.log('═══════════════════════════════════════════════════════\n');
  console.log('📝 NEXT STEPS:\n');
  console.log('1. Transfer ETH from your AsterDEX account to your personal wallet');
  console.log('2. Use the following command to distribute funds:\n');
  
  distributionPlan.forEach((plan, index) => {
    console.log(`   ${index + 1}. Send ${plan.ethAmount.toFixed(6)} ETH to ${plan.agent.walletAddress}`);
  });

  console.log('\n3. Or use MetaMask/Coinbase to send manually');
  console.log('4. After funding, run: yarn tsx scripts/update-agent-balances.ts');
  console.log('\n═══════════════════════════════════════════════════════\n');

  // Expected results
  console.log('🎯 EXPECTED RESULTS AFTER FUNDING:\n');
  const currentVolume = 500; // Current daily volume in USD
  const newVolume = currentVolume * 3; // 3x increase expected
  console.log(`📈 Current Daily Volume: ~$${currentVolume}`);
  console.log(`📈 Expected Daily Volume: ~$${newVolume} (3x increase)`);
  console.log(`💵 Current Daily Profit: ~$${(currentVolume * 0.02).toFixed(2)}`);
  console.log(`💵 Expected Daily Profit: ~$${(newVolume * 0.02).toFixed(2)} (3x increase)`);
  console.log(`🏦 Treasury Growth: $${(newVolume * 0.02 * 0.05 * 30).toFixed(2)}/month\n`);

  await prisma.$disconnect();
}

distributeAsterDEXFunds();
