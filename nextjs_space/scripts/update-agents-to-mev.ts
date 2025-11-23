
/**
 * Update Two Agents to Use MEV Bot Trading Strategy
 */

import { prisma } from '../lib/db';

async function main() {
  console.log('🤖 Updating agents to MEV Bot trading strategy...\n');
  
  try {
    // Get all agents
    const agents = await prisma.aIAgent.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    if (agents.length < 2) {
      console.error('❌ Need at least 2 agents to configure for MEV trading');
      return;
    }
    
    // Select two agents for MEV bot trading
    // Choose agents with good balance and different AI providers for diversity
    const mevAgents = [
      agents[0], // First agent - will use OpenAI
      agents[2]  // Third agent - will use Grok
    ];
    
    console.log('Selected agents for MEV Bot trading:');
    mevAgents.forEach(agent => {
      console.log(`  - ${agent.name} (${agent.aiProvider})`);
    });
    console.log('');
    
    // Update first MEV agent
    const agent1 = await prisma.aIAgent.update({
      where: { id: mevAgents[0].id },
      data: {
        name: 'MEV Hunter Alpha',
        strategyType: 'MEV_BOT',
        aiProvider: 'OPENAI',
        personality: 'Aggressive MEV hunter specializing in cross-DEX arbitrage. Focuses on high-frequency opportunities with quick execution. Uses advanced AI to score opportunities and optimize gas prices.',
        parameters: {
          tradingStyle: 'mev-arbitrage',
          riskLevel: 0.7,
          maxPositionSize: 1000,
          minProfitThreshold: 0.005,
          minArbSpread: 0.003,
          supportedDexs: ['uniswap-v3', 'sushiswap', 'curve', '1inch'],
          preferredTokens: ['ETH', 'WETH', 'USDC', 'USDT', 'WBTC'],
          executionSpeed: 'fast',
          useFlashbots: true
        }
      }
    });
    
    console.log(`✅ Updated ${agent1.name}:`);
    console.log(`   Strategy: MEV_BOT (Arbitrage Focus)`);
    console.log(`   AI Provider: ${agent1.aiProvider}`);
    console.log(`   Risk Level: 70%`);
    console.log(`   Min Profit: 0.5%`);
    console.log('');
    
    // Update second MEV agent
    const agent2 = await prisma.aIAgent.update({
      where: { id: mevAgents[1].id },
      data: {
        name: 'MEV Sentinel Beta',
        strategyType: 'MEV_BOT',
        aiProvider: 'GROK',
        personality: 'Conservative MEV bot focusing on high-probability, low-risk arbitrage opportunities. Prioritizes consistent small wins over risky large trades. Uses AI to filter out unprofitable opportunities.',
        parameters: {
          tradingStyle: 'mev-arbitrage',
          riskLevel: 0.4,
          maxPositionSize: 500,
          minProfitThreshold: 0.008,
          minArbSpread: 0.005,
          supportedDexs: ['uniswap-v3', 'curve', 'balancer', '1inch'],
          preferredTokens: ['USDC', 'USDT', 'DAI', 'ETH'],
          executionSpeed: 'moderate',
          useFlashbots: true
        }
      }
    });
    
    console.log(`✅ Updated ${agent2.name}:`);
    console.log(`   Strategy: MEV_BOT (Conservative Focus)`);
    console.log(`   AI Provider: ${agent2.aiProvider}`);
    console.log(`   Risk Level: 40%`);
    console.log(`   Min Profit: 0.8%`);
    console.log('');
    
    console.log('🎯 MEV Bot Configuration Complete!');
    console.log('');
    console.log('These agents will now:');
    console.log('  ✓ Monitor prices across multiple DEXs');
    console.log('  ✓ Detect arbitrage opportunities');
    console.log('  ✓ Use AI to score and filter opportunities');
    console.log('  ✓ Execute fast cross-DEX arbitrage trades');
    console.log('  ✓ Optimize for gas efficiency');
    console.log('  ✓ Track mempool for front-running opportunities');
    console.log('');
    console.log('To start MEV bot trading:');
    console.log('  yarn tsx scripts/start-mev-trading.ts');
    
  } catch (error) {
    console.error('❌ Error updating agents:', error);
    throw error;
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

