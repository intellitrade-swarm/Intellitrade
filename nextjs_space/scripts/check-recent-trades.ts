import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../lib/db';

async function main() {
  console.log('Checking recent trades...\n');
  
  try {
    const trades = await prisma.trade.findMany({
      orderBy: {
        entryTime: 'desc'
      },
      take: 20,
      include: {
        agent: {
          select: {
            name: true,
            primaryChain: true,
            walletAddress: true
          }
        }
      }
    });
    
    console.log(`Found ${trades.length} recent trades:\n`);
    
    for (const trade of trades) {
      console.log(`${trade.agent.name}: ${trade.symbol} ${trade.side}`);
      console.log(`  Status: ${trade.status}`);
      console.log(`  Chain: ${trade.chain || 'N/A'}`);
      console.log(`  Real Trade: ${trade.isRealTrade}`);
      console.log(`  Time: ${trade.entryTime.toISOString()}`);
      console.log(`  Agent Chain: ${trade.agent.primaryChain}`);
      console.log(`  Agent Wallet: ${trade.agent.walletAddress}`);
      if (trade.profitLoss !== null) {
        console.log(`  P/L: $${trade.profitLoss}`);
      }
      console.log('---');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
