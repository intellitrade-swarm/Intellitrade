
import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../lib/db';

async function main() {
  console.log('🎯 Activating Volatility Sniper for AsterDEX Trading...\n');
  
  try {
    // Find the Volatility Sniper agent
    const agent = await prisma.aIAgent.findFirst({
      where: {
        name: {
          contains: 'Volatility',
          mode: 'insensitive'
        }
      }
    });

    if (!agent) {
      console.log('❌ Volatility Sniper agent not found');
      return;
    }

    console.log('✅ Found agent:', agent.name);
    console.log('Wallet:', agent.walletAddress);
    console.log('Current balance:', agent.realBalance);

    // Update agent configuration for AsterDEX trading
    const updated = await prisma.aIAgent.update({
      where: { id: agent.id },
      data: {
        realBalance: 30, // $30 in Base ETH
        isActive: true,
        primaryChain: 'BASE',
        aiProvider: 'NVIDIA'
      }
    });

    console.log('\n🚀 Volatility Sniper activated!');
    console.log('Balance: $', updated.realBalance);
    console.log('Chain:', updated.primaryChain);
    console.log('AI Provider:', updated.aiProvider);
    console.log('Status:', updated.isActive ? 'ACTIVE ✅' : 'INACTIVE');
    
    console.log('\n✨ Ready to trade on AsterDEX with perpetuals!');
    console.log('\n📊 Next steps:');
    console.log('1. The trading scheduler will pick up this agent in the next cycle');
    console.log('2. NVIDIA AI will analyze markets and generate signals');
    console.log('3. AsterDEX API will execute perpetual trades');
    console.log('4. Monitor performance on the Arena page');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
