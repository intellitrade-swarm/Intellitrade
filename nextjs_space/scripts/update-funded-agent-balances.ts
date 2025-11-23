
import dotenv from 'dotenv';
dotenv.config();

import { ethers } from 'ethers';
import { prisma } from '../lib/db';

async function updateFundedAgentBalances() {
  console.log('🔄 Updating funded agent balances...\n');

  try {
    // Get all agents
    const agents = await prisma.aIAgent.findMany({
      orderBy: { name: 'asc' }
    });

    console.log(`📊 Found ${agents.length} agents to check and update\n`);

    // Create providers for each chain
    const providers: { [chain: string]: ethers.JsonRpcProvider } = {
      'base': new ethers.JsonRpcProvider('https://mainnet.base.org'),
      'bsc': new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org'),
      'polygon': new ethers.JsonRpcProvider('https://polygon-rpc.com'),
      'arbitrum': new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc'),
      'optimism': new ethers.JsonRpcProvider('https://mainnet.optimism.io'),
    };

    let totalUpdated = 0;
    let totalBalance = 0;

    for (const agent of agents) {
      const walletAddress = agent.walletAddress;
      const chain = agent.primaryChain || 'base';

      if (!walletAddress) {
        console.log(`⚠️  ${agent.name}: No wallet address`);
        continue;
      }

      try {
        const provider = providers[chain];
        if (!provider) {
          console.log(`⚠️  ${agent.name}: Unknown chain ${chain}`);
          continue;
        }

        // Get actual on-chain balance
        const balance = await provider.getBalance(walletAddress);
        const balanceInEth = parseFloat(ethers.formatEther(balance));
        
        // Calculate USD value (assuming $2,500 per ETH)
        const ethPrice = 2500;
        const balanceInUsd = balanceInEth * ethPrice;
        
        // Update agent balance in database
        await prisma.aIAgent.update({
          where: { id: agent.id },
          data: { 
            currentBalance: balanceInUsd, // Store USD value for compatibility
            realBalance: balanceInUsd,     // Store USD value of real balance
            updatedAt: new Date()
          }
        });

        totalBalance += balanceInEth;
        totalUpdated++;

        console.log(`✅ ${agent.name} (${chain.toUpperCase()}): ${balanceInEth.toFixed(6)} ETH ($${balanceInUsd.toFixed(2)})`);
        console.log(`   Address: ${walletAddress}\n`);

      } catch (error) {
        console.error(`❌ Error updating ${agent.name}:`, error);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Updated ${totalUpdated} agent balances`);
    console.log(`💰 Total Balance Across All Agents: ${totalBalance.toFixed(6)} ETH`);
    console.log(`💵 Estimated USD Value (@ $2,500/ETH): $${(totalBalance * 2500).toFixed(2)}`);
    console.log('='.repeat(60));

    // Log recent balance changes
    console.log('\n📈 Top 10 Funded Agents:');
    const recentUpdates = await prisma.aIAgent.findMany({
      where: {
        realBalance: {
          gt: 1 // Only show agents with meaningful balances (> $1)
        }
      },
      orderBy: { realBalance: 'desc' },
      take: 10
    });

    recentUpdates.forEach((agent, index) => {
      const ethBalance = agent.realBalance / 2500; // Convert USD back to ETH for display
      console.log(`${index + 1}. ${agent.name}: ${ethBalance.toFixed(6)} ETH ($${agent.realBalance.toFixed(2)})`);
    });

  } catch (error) {
    console.error('❌ Error updating agent balances:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateFundedAgentBalances()
  .then(() => {
    console.log('\n✅ Agent balance update complete!');
    console.log('🚀 Agents are now ready to trade with their new funds!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to update agent balances:', error);
    process.exit(1);
  });
