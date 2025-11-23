
/**
 * Start MEV Bot Trading for Configured Agents
 */

import { prisma } from '../lib/db';
import { runMEVBotTradingCycle } from '../lib/mev-bot-trading';

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          MEV BOT TRADING SYSTEM - STARTING                    ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Get MEV bot agents
    const mevAgents = await prisma.aIAgent.findMany({
      where: {
        strategyType: 'MEV_BOT',
        isActive: true
      }
    });
    
    if (mevAgents.length === 0) {
      console.log('⚠️ No active MEV bot agents found');
      console.log('Please run: yarn tsx scripts/update-agents-to-mev.ts');
      return;
    }
    
    console.log(`Found ${mevAgents.length} active MEV bot agents:\n`);
    mevAgents.forEach(agent => {
      console.log(`  🤖 ${agent.name}`);
      console.log(`     AI Provider: ${agent.aiProvider}`);
      console.log(`     Risk Level: ${(agent.parameters as any).riskLevel * 100}%`);
      console.log(`     Min Profit: ${(agent.parameters as any).minProfitThreshold * 100}%`);
      console.log('');
    });
    
    console.log('Starting MEV trading cycles...\n');
    
    // Run trading cycle for each MEV agent
    let totalOpportunitiesFound = 0;
    let totalOpportunitiesExecuted = 0;
    let totalProfit = 0;
    
    for (const agent of mevAgents) {
      const result = await runMEVBotTradingCycle(agent.id);
      
      if (result.success) {
        totalOpportunitiesFound += result.opportunitiesFound;
        totalOpportunitiesExecuted += result.opportunitiesExecuted;
        totalProfit += result.totalProfit;
      } else {
        console.error(`❌ Trading cycle failed for ${agent.name}: ${result.error}`);
      }
      
      // Brief delay between agents
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          MEV BOT TRADING SUMMARY                               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log(`\n📊 Total Results:`);
    console.log(`   Agents Active: ${mevAgents.length}`);
    console.log(`   Opportunities Found: ${totalOpportunitiesFound}`);
    console.log(`   Opportunities Executed: ${totalOpportunitiesExecuted}`);
    console.log(`   Total Profit: $${totalProfit.toFixed(2)}`);
    console.log(`   Success Rate: ${totalOpportunitiesFound > 0 ? ((totalOpportunitiesExecuted / totalOpportunitiesFound) * 100).toFixed(1) : 0}%`);
    console.log('');
    
    if (totalOpportunitiesExecuted > 0) {
      console.log('✅ MEV trading cycle completed successfully!');
    } else {
      console.log('ℹ️ No opportunities executed in this cycle');
    }
    
    console.log('\nFor continuous trading, run this script periodically or integrate with the trading scheduler.');
    
  } catch (error) {
    console.error('\n❌ MEV trading error:', error);
    throw error;
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

