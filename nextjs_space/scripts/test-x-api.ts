
import { fetchSocialTradingSignals, aggregateSocialSignals } from '../lib/x-api';

async function testXAPI() {
  console.log('🐦 Testing X API Integration for @defidash_agent\n');
  
  try {
    // Test fetching signals for ETH and BTC
    console.log('📡 Fetching social trading signals...');
    const signals = await fetchSocialTradingSignals(['ETH', 'BTC']);
    
    console.log(`\n✅ Fetched ${signals.length} signals`);
    
    // Display first few signals
    console.log('\n📊 Sample Signals:');
    signals.slice(0, 3).forEach((signal, index) => {
      console.log(`\n${index + 1}. ${signal.token} - ${signal.sentiment.toUpperCase()}`);
      console.log(`   Author: @${signal.author}`);
      console.log(`   Text: ${signal.text.substring(0, 100)}...`);
      console.log(`   Strength: ${signal.strength}%`);
      console.log(`   Influence: ${signal.influenceScore}`);
      console.log(`   Engagement: ${signal.engagement.likes}👍 ${signal.engagement.retweets}🔄 ${signal.engagement.replies}💬`);
    });
    
    // Test aggregation
    console.log('\n📈 Aggregated Signals:');
    const aggregated = aggregateSocialSignals(signals);
    
    aggregated.forEach((data, token) => {
      console.log(`\n${token}:`);
      console.log(`  Overall Sentiment: ${data.overallSentiment.toUpperCase()}`);
      console.log(`  Bullish: ${data.bullishCount} | Bearish: ${data.bearishCount} | Neutral: ${data.neutralCount}`);
      console.log(`  Average Strength: ${data.averageStrength.toFixed(1)}%`);
      console.log(`  Total Influence: ${data.totalInfluence}`);
    });
    
    console.log('\n✅ X API Integration Test PASSED!\n');
    
  } catch (error) {
    console.error('\n❌ X API Integration Test FAILED:');
    console.error(error);
    process.exit(1);
  }
}

testXAPI();
