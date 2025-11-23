import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../lib/db';

async function main() {
  console.log('Checking agent configurations...\n');
  
  try {
    const agents = await prisma.aIAgent.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        walletAddress: true,
        solanaWalletAddress: true,
        primaryChain: true,
        realBalance: true,
        isActive: true,
        aiProvider: true
      }
    });
    
    console.log(`Found ${agents.length} active agents:\n`);
    
    for (const agent of agents) {
      console.log(`Agent: ${agent.name}`);
      console.log(`  ID: ${agent.id}`);
      console.log(`  AI Provider: ${agent.aiProvider}`);
      console.log(`  Primary Chain: ${agent.primaryChain}`);
      console.log(`  EVM Wallet: ${agent.walletAddress || 'NOT SET'}`);
      console.log(`  Solana Wallet: ${agent.solanaWalletAddress || 'NOT SET'}`);
      console.log(`  DB Balance: $${agent.realBalance}`);
      console.log(`  Active: ${agent.isActive}`);
      console.log('---');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
