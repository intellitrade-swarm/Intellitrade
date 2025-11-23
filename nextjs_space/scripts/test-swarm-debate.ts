
import { swarmOrchestrator } from '../lib/swarm-orchestrator';
import * as dotenv from 'dotenv';

dotenv.config();

async function testSwarmDebate() {
  console.log('🚀 Testing Swarm Trading Debate System\n');
  console.log('=' .repeat(60));

  const marketOpportunity = {
    symbol: 'ETH/USDT',
    currentPrice: 3245.67,
    priceChange24h: 4.2,
    volume24h: 18500000000, // $18.5B
    triggerReason: 'Strong momentum detected: +4.2% in 24h with high volume',
    marketData: {
      rsi: 68,
      macd: 'bullish',
      volumeProfile: 'high',
      sentiment: 'positive',
      whaleActivity: 'accumulating',
    },
  };

  console.log('\n📊 Market Opportunity Detected:');
  console.log(`   Symbol: ${marketOpportunity.symbol}`);
  console.log(`   Price: $${marketOpportunity.currentPrice}`);
  console.log(`   24h Change: +${marketOpportunity.priceChange24h}%`);
  console.log(`   24h Volume: $${(marketOpportunity.volume24h / 1000000000).toFixed(2)}B`);
  console.log(`   Trigger: ${marketOpportunity.triggerReason}\n`);
  console.log('=' .repeat(60));

  try {
    console.log('\n🎯 Initiating Swarm Debate...\n');
    
    const debateId = await swarmOrchestrator.initiateDebate(marketOpportunity);

    console.log(`\n✅ Debate initiated successfully!`);
    console.log(`   Debate ID: ${debateId}`);
    console.log('\n💭 Agents are now analyzing and debating...');
    console.log('   This may take 30-60 seconds for all agents to respond.\n');
    console.log('🔗 View live debate at: http://localhost:3000/swarm');
    console.log('=' .repeat(60));
    console.log('\nℹ️  The debate will continue in the background.');
    console.log('   Check the database or UI for results in a few moments.\n');

    // Wait a bit for the debate to progress
    console.log('⏳ Waiting 45 seconds for agents to analyze...\n');
    await new Promise(resolve => setTimeout(resolve, 45000));

    console.log('✅ Test completed! Check /swarm page to see the results.\n');

  } catch (error) {
    console.error('\n❌ Error during swarm debate test:', error);
    process.exit(1);
  }
}

testSwarmDebate()
  .then(() => {
    console.log('\n🎉 Swarm debate test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
