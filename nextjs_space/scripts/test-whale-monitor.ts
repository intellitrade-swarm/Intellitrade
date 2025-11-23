
/**
 * Test Whale Monitor / Moralis Scanner
 * Diagnoses issues with multi-chain token scanning
 */

import { moralisScanner } from '../lib/moralis-scanner';

async function main() {
  console.log('\n🔍 Testing Whale Monitor Scanner...\n');
  
  try {
    // Test scanning all chains
    console.log('📊 Scanning all EVM chains (Ethereum, BNB, Polygon, Base)...\n');
    
    const results = await moralisScanner.scanAllChains();
    
    console.log('\n📈 Scan Results:');
    console.log('━'.repeat(70));
    
    if (results.length === 0) {
      console.log('❌ No results returned! Scanner may not be working.');
      console.log('\nPossible issues:');
      console.log('  1. Moralis API key not configured or invalid');
      console.log('  2. API rate limits exceeded');
      console.log('  3. Network connectivity issues');
      console.log('  4. Chain configuration errors');
    } else {
      for (const chainResult of results) {
        console.log(`\n${chainResult.chainName} (${chainResult.chain}):`);
        console.log(`  ✅ Tokens found: ${chainResult.topTokens.length}`);
        console.log(`  🕐 Scan time: ${chainResult.scanTime.toLocaleString()}`);
        
        if (chainResult.topTokens.length > 0) {
          console.log(`\n  Top 3 tokens by buy volume:`);
          chainResult.topTokens.slice(0, 3).forEach((token, idx) => {
            console.log(`    ${idx + 1}. ${token.symbol} (${token.name})`);
            console.log(`       Buy Volume: $${token.buyVolume24h.toFixed(2)}`);
            console.log(`       Sentiment: ${token.sentiment} (${token.sentimentScore.toFixed(1)}%)`);
          });
        }
      }
      
      const totalTokens = results.reduce((sum, r) => sum + r.topTokens.length, 0);
      console.log(`\n${'━'.repeat(70)}`);
      console.log(`✅ Total chains scanned: ${results.length}/4`);
      console.log(`✅ Total tokens found: ${totalTokens}`);
      console.log(`✅ Expected: 20 tokens (5 per chain × 4 chains)`);
      
      if (totalTokens < 20) {
        console.log(`\n⚠️  Warning: Expected 20 tokens but only got ${totalTokens}`);
        console.log('   Some chains may be failing to return data.');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error testing whale monitor:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
  }
}

main();
