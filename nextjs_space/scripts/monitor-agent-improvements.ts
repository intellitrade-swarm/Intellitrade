

/**
 * Agent Improvement Monitor
 * Continuously monitors and improves agent performance
 */

import { runImprovementCycle, getAggregatedProfits } from '../lib/agent-improvement-engine';
import { updateAllAgentPerformance } from '../lib/performance-tracker';

async function monitorAndImprove() {
  console.log('\n🔍 Starting Agent Improvement Monitor...\n');

  try {
    // Update all performance metrics first
    console.log('📊 Updating performance metrics...');
    await updateAllAgentPerformance();
    console.log('✅ Performance metrics updated\n');

    // Run improvement analysis
    console.log('🧠 Running improvement analysis...');
    const insights = await runImprovementCycle();
    console.log(`✅ Analyzed ${insights.length} agents\n`);

    // Display insights
    console.log('📈 AGENT PERFORMANCE INSIGHTS\n');
    console.log('═'.repeat(80));
    
    for (const insight of insights) {
      console.log(`\n🤖 ${insight.agentName}`);
      console.log('─'.repeat(80));
      console.log(`   Win Rate: ${(insight.currentPerformance.winRate * 100).toFixed(1)}%`);
      console.log(`   Total P&L: $${insight.currentPerformance.totalProfitLoss.toFixed(2)}`);
      console.log(`   Sharpe Ratio: ${insight.currentPerformance.sharpeRatio.toFixed(2)}`);
      console.log(`   Avg Win: $${insight.currentPerformance.avgWinSize.toFixed(2)}`);
      console.log(`   Avg Loss: $${insight.currentPerformance.avgLossSize.toFixed(2)}`);
      console.log('\n   Recommendations:');
      insight.recommendations.forEach(rec => console.log(`   ${rec}`));
      
      if (insight.shouldPause) {
        console.log('\n   ⚠️ AGENT PAUSED FOR REVIEW');
      }
    }

    // Get aggregated profits
    console.log('\n\n💰 AGGREGATED PROFIT SUMMARY\n');
    console.log('═'.repeat(80));
    const profitSummary = await getAggregatedProfits();
    
    console.log(`\n📊 Overall Performance:`);
    console.log(`   Total Realized Profit: $${profitSummary.totalRealized.toFixed(2)}`);
    console.log(`   Total Unrealized Profit: $${profitSummary.totalUnrealized.toFixed(2)}`);
    console.log(`   TOTAL PROFIT: $${profitSummary.totalProfit.toFixed(2)}`);
    console.log(`   Overall Win Rate: ${profitSummary.overallWinRate.toFixed(1)}%`);
    console.log(`   Total Wins/Losses: ${profitSummary.totalWins}/${profitSummary.totalLosses}`);
    
    console.log(`\n🏆 Best Performing Agent: ${profitSummary.bestAgent.name} ($${profitSummary.bestAgent.profit.toFixed(2)})`);
    console.log(`📉 Needs Improvement: ${profitSummary.worstAgent.name} ($${profitSummary.worstAgent.profit.toFixed(2)})`);

    console.log('\n\n📋 AGENT RANKINGS\n');
    console.log('═'.repeat(80));
    console.log('Rank | Agent                    | Strategy         | Realized   | Unrealized | Total      | Win Rate');
    console.log('─'.repeat(80));
    
    profitSummary.agentPerformances.forEach((agent, index) => {
      const rank = (index + 1).toString().padStart(4);
      const name = agent.name.padEnd(24);
      const strategy = agent.strategy.padEnd(16);
      const realized = `$${agent.realized.toFixed(2)}`.padStart(10);
      const unrealized = `$${agent.unrealized.toFixed(2)}`.padStart(10);
      const total = `$${agent.total.toFixed(2)}`.padStart(10);
      const winRate = `${agent.winRate.toFixed(1)}%`.padStart(8);
      
      console.log(`${rank} | ${name} | ${strategy} | ${realized} | ${unrealized} | ${total} | ${winRate}`);
    });

    console.log('\n═'.repeat(80));
    console.log('\n✅ Monitoring cycle completed successfully!\n');

  } catch (error) {
    console.error('❌ Error in monitoring cycle:', error);
    throw error;
  }
}

// Run the monitor
monitorAndImprove()
  .then(() => {
    console.log('🎯 Agent improvement monitoring complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to complete monitoring:', error);
    process.exit(1);
  });

