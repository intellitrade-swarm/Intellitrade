import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../lib/db';
import { getTradingBalances } from '../lib/oneinch';
import { getSolBalance, getSolPrice } from '../lib/solana';

async function main() {
  console.log('Checking all agent balances...\n');
  
  try {
    const agents = await prisma.aIAgent.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        primaryChain: true,
        walletAddress: true,
        solanaWalletAddress: true,
        realBalance: true
      }
    });
    
    for (const agent of agents) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Agent: ${agent.name}`);
      console.log(`Primary Chain: ${agent.primaryChain}`);
      console.log(`DB Balance: $${agent.realBalance}`);
      console.log('---');
      
      // Check EVM balance
      if (agent.walletAddress) {
        try {
          const evmBalances = await getTradingBalances('base', agent.walletAddress);
          console.log(`EVM (Base) Balance:`);
          console.log(`  Native: ${evmBalances.native.toFixed(6)} ${evmBalances.nativeSymbol}`);
          console.log(`  USDC: $${evmBalances.usdc.toFixed(2)}`);
          console.log(`  Total: $${evmBalances.totalUsd.toFixed(2)}`);
        } catch (error: any) {
          console.log(`EVM Balance Error: ${error.message}`);
        }
      }
      
      // Check Solana balance
      if (agent.solanaWalletAddress) {
        try {
          const solBalance = await getSolBalance(agent.solanaWalletAddress);
          const solPrice = await getSolPrice();
          const solTotalUsd = solBalance * solPrice;
          
          console.log(`Solana Balance:`);
          console.log(`  SOL: ${solBalance.toFixed(6)}`);
          console.log(`  SOL Price: $${solPrice.toFixed(2)}`);
          console.log(`  Total: $${solTotalUsd.toFixed(2)}`);
        } catch (error: any) {
          console.log(`Solana Balance Error: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
