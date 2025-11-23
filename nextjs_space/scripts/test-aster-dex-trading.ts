
/**
 * Test script to verify Aster Dex trading functionality
 * Run with: npx tsx scripts/test-aster-dex-trading.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
config({ path: resolve(__dirname, '../.env') });

import { prisma } from '../lib/db';
import * as AsterDex from '../lib/aster-dex';
import { executeAutoTrade, analyzeMarket } from '../lib/ai-trading-engine';

async function testAsterDexTrading() {
  console.log('🧪 Testing Aster Dex Trading System\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Test Aster Dex Connection
    console.log('\n📡 Step 1: Testing Aster Dex Connection...');
    console.log('-'.repeat(60));
    
    const isConfigured = AsterDex.isConfigured();
    console.log(`✓ API Credentials Configured: ${isConfigured ? '✅ Yes' : '❌ No'}`);
    
    if (!isConfigured) {
      console.error('❌ Aster Dex API credentials not configured!');
      console.log('\nPlease set the following environment variables:');
      console.log('- ASTER_DEX_API_KEY');
      console.log('- ASTER_DEX_API_SECRET');
      process.exit(1);
    }

    const connected = await AsterDex.testConnection();
    console.log(`✓ Connection Test: ${connected ? '✅ Passed' : '❌ Failed'}`);
    
    if (!connected) {
      console.error('❌ Failed to connect to Aster Dex API!');
      process.exit(1);
    }

    // Step 2: Get Account Info
    console.log('\n💰 Step 2: Checking Account Balance...');
    console.log('-'.repeat(60));
    
    const accountInfo = await AsterDex.getAccountInfo();
    const balance = parseFloat(accountInfo.availableBalance);
    console.log(`✓ Available Balance: $${balance.toFixed(2)}`);
    console.log(`✓ Total Wallet Balance: $${parseFloat(accountInfo.totalWalletBalance).toFixed(2)}`);
    console.log(`✓ Open Positions: ${accountInfo.positions.filter(p => parseFloat(p.positionAmt) !== 0).length}`);

    if (balance < 1) {
      console.warn('⚠️  Warning: Balance is very low, may not be able to execute trades');
    }

    // Step 3: Get Market Data
    console.log('\n📊 Step 3: Fetching Market Data...');
    console.log('-'.repeat(60));
    
    const tickers = await AsterDex.getAllTickers();
    const majorPairs = tickers
      .filter(t => ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'].includes(t.symbol))
      .slice(0, 5);
    
    console.log('✓ Top Trading Pairs:');
    majorPairs.forEach((ticker, i) => {
      const change = parseFloat(ticker.priceChangePercent);
      const changeIcon = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
      console.log(`  ${i + 1}. ${ticker.symbol.padEnd(10)} ${changeIcon}`);
      console.log(`     Price: $${parseFloat(ticker.lastPrice).toLocaleString()}`);
      console.log(`     24h Change: ${change > 0 ? '+' : ''}${change.toFixed(2)}%`);
      console.log(`     Volume: $${(parseFloat(ticker.quoteVolume) / 1e6).toFixed(2)}M`);
    });

    // Step 4: Check Agents
    console.log('\n🤖 Step 4: Checking AI Agents...');
    console.log('-'.repeat(60));
    
    const agents = await prisma.aIAgent.findMany({
      where: {
        realBalance: { gt: 0 }
      },
      orderBy: {
        realBalance: 'desc'
      }
    });

    console.log(`✓ Agents with Real Balance: ${agents.length}`);
    
    if (agents.length === 0) {
      console.warn('⚠️  No agents found with real balance!');
      console.log('\nYou need to create agents with real balance first.');
      process.exit(0);
    }

    console.log('\nActive Agents:');
    agents.forEach((agent, i) => {
      console.log(`  ${i + 1}. ${agent.name}`);
      console.log(`     Balance: $${agent.realBalance.toFixed(2)}`);
      console.log(`     Strategy: ${agent.strategyType}`);
      console.log(`     AI Provider: ${agent.aiProvider || 'OPENAI'}`);
      console.log(`     Total Trades: ${agent.totalTrades}`);
      console.log(`     Win Rate: ${(agent.winRate * 100).toFixed(1)}%`);
    });

    // Step 5: Run Market Analysis
    console.log('\n🧠 Step 5: Running AI Market Analysis...');
    console.log('-'.repeat(60));
    
    const testAgent = agents[0];
    console.log(`Using agent: ${testAgent.name} (AI: ${testAgent.aiProvider || 'OPENAI'})`);
    
    const marketAnalysis = await analyzeMarket(testAgent.aiProvider as any || 'OPENAI');
    
    console.log(`✓ Market Sentiment: ${marketAnalysis.marketSentiment}`);
    console.log(`✓ Volatility: ${marketAnalysis.volatility}`);
    console.log(`✓ Insights: ${marketAnalysis.insights}`);
    
    console.log('\nTop Trading Opportunities:');
    marketAnalysis.topOpportunities.forEach((opp, i) => {
      console.log(`  ${i + 1}. ${opp.symbol} - ${opp.action}`);
      console.log(`     Confidence: ${(opp.confidence * 100).toFixed(0)}%`);
      console.log(`     Risk/Reward: ${opp.riskReward.toFixed(2)}x`);
      console.log(`     Reasoning: ${opp.reasoning}`);
    });

    // Step 6: Test Trade Execution (DRY RUN)
    console.log('\n🎯 Step 6: Testing Trade Execution...');
    console.log('-'.repeat(60));
    
    const shouldExecute = process.env.EXECUTE_REAL_TRADE === 'true';
    
    if (shouldExecute) {
      console.log('⚠️  EXECUTING REAL TRADE...');
      console.log(`Agent: ${testAgent.name}`);
      console.log(`Balance: $${testAgent.realBalance.toFixed(2)}`);
      console.log('');
      
      const tradeResult = await executeAutoTrade(testAgent.id);
      
      if (tradeResult.success) {
        console.log('✅ TRADE EXECUTED SUCCESSFULLY!');
        console.log(`Symbol: ${tradeResult.trade?.symbol}`);
        console.log(`Side: ${tradeResult.trade?.side}`);
        console.log(`Quantity: ${tradeResult.trade?.quantity}`);
        console.log(`Price: $${tradeResult.trade?.entryPrice}`);
        console.log(`TX Hash: ${tradeResult.trade?.txHash}`);
      } else {
        console.log('ℹ️  Trade not executed:', tradeResult.reason);
      }
    } else {
      console.log('ℹ️  DRY RUN MODE - No actual trade executed');
      console.log('\nTo execute a real trade, run:');
      console.log('EXECUTE_REAL_TRADE=true npx tsx scripts/test-aster-dex-trading.ts');
      
      // Simulate what would happen
      const topOpp = marketAnalysis.topOpportunities[0];
      if (topOpp && topOpp.confidence >= 0.65) {
        const tradeAmount = Math.min(
          testAgent.realBalance * 0.2,
          testAgent.realBalance * 0.1
        );
        
        console.log('\nWould execute:');
        console.log(`  Symbol: ${topOpp.symbol}`);
        console.log(`  Action: ${topOpp.action}`);
        console.log(`  Amount: $${tradeAmount.toFixed(2)}`);
        console.log(`  Confidence: ${(topOpp.confidence * 100).toFixed(0)}%`);
        console.log(`  Agent: ${testAgent.name}`);
      } else {
        console.log('\nNo high-confidence opportunities found');
        console.log('Agent would HOLD position');
      }
    }

    // Step 7: Summary
    console.log('\n✅ Test Summary');
    console.log('='.repeat(60));
    console.log('✓ Aster Dex Connection: Working');
    console.log(`✓ Account Balance: $${balance.toFixed(2)}`);
    console.log(`✓ Active Agents: ${agents.length}`);
    console.log(`✓ Market Analysis: Working`);
    console.log(`✓ Trading System: ${shouldExecute ? 'Executed' : 'Ready'}`);
    console.log('\n🎉 All systems operational!\n');

  } catch (error) {
    console.error('\n❌ Test Failed!');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAsterDexTrading();
