
/**
 * Simple Aster Dex test without AI
 * Tests just the core trading infrastructure
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { prisma } from '../lib/db';
import * as AsterDex from '../lib/aster-dex';
import { executeAsterDexTrade } from '../lib/trading';

async function simpleAsterTest() {
  console.log('🧪 Simple Aster Dex Trading Test\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Connection
    console.log('\n📡 Testing Aster Dex Connection...');
    const isConfigured = AsterDex.isConfigured();
    console.log(`✓ Configured: ${isConfigured ? '✅' : '❌'}`);
    
    if (!isConfigured) {
      console.error('❌ Not configured!');
      process.exit(1);
    }

    const connected = await AsterDex.testConnection();
    console.log(`✓ Connected: ${connected ? '✅' : '❌'}`);

    // Step 2: Account Info
    console.log('\n💰 Checking Account...');
    const accountInfo = await AsterDex.getAccountInfo();
    console.log(`✓ Balance: $${parseFloat(accountInfo.availableBalance).toFixed(2)}`);
    console.log(`✓ Open Positions: ${accountInfo.positions.filter(p => parseFloat(p.positionAmt) !== 0).length}`);

    // Step 3: Market Data
    console.log('\n📊 Fetching Market Data...');
    const btcPrice = await AsterDex.getMarketPrice('BTCUSDT');
    console.log(`✓ BTC Price: $${btcPrice.toLocaleString()}`);

    const ethPrice = await AsterDex.getMarketPrice('ETHUSDT');
    console.log(`✓ ETH Price: $${ethPrice.toLocaleString()}`);

    // Step 4: Check Agent
    console.log('\n🤖 Checking Agent...');
    const agent = await prisma.aIAgent.findFirst({
      where: { realBalance: { gt: 0 } }
    });

    if (!agent) {
      console.log('❌ No agent with balance found');
      process.exit(0);
    }

    console.log(`✓ Agent: ${agent.name}`);
    console.log(`✓ Balance: $${agent.realBalance.toFixed(2)}`);
    console.log(`✓ Wallet: ${agent.walletAddress ? '✅' : '❌'}`);

    // Step 5: Trading Capability Test (DRY RUN)
    console.log('\n🎯 Testing Trading Capability...');
    
    const asterBalance = parseFloat(accountInfo.availableBalance);
    const agentBalance = agent.realBalance;
    
    console.log(`\nTrading Requirements:`);
    console.log(`  Aster Dex Balance: $${asterBalance.toFixed(2)} ${asterBalance >= 1 ? '✅' : '❌'}`);
    console.log(`  Agent Balance: $${agentBalance.toFixed(2)} ${agentBalance >= 1 ? '✅' : '❌'}`);
    
    if (asterBalance >= 1 && agentBalance >= 1) {
      console.log(`\n✅ READY TO TRADE!`);
      console.log(`\nTo execute a real trade, the system would:`);
      console.log(`  1. Analyze market with AI`);
      console.log(`  2. Generate trading signal`);
      console.log(`  3. Calculate position size`);
      console.log(`  4. Execute trade on Aster Dex`);
      console.log(`  5. Record trade in database`);
      
      console.log(`\n💡 Trade Example:`);
      const tradeAmount = Math.min(agentBalance * 0.1, 5); // 10% or $5 max
      const quantity = (tradeAmount / btcPrice).toFixed(6);
      console.log(`  Symbol: BTCUSDT`);
      console.log(`  Action: BUY`);
      console.log(`  Amount: $${tradeAmount.toFixed(2)}`);
      console.log(`  Quantity: ${quantity} BTC`);
      console.log(`  Price: $${btcPrice.toLocaleString()}`);
      
    } else {
      console.log(`\n⚠️  Cannot trade - insufficient balance`);
      if (asterBalance < 1) {
        console.log(`   Need to fund Aster Dex account`);
      }
      if (agentBalance < 1) {
        console.log(`   Need to increase agent balance`);
      }
    }

    // Step 6: Test Order Placement (if explicitly enabled)
    if (process.env.EXECUTE_REAL_TRADE === 'true' && asterBalance >= 10 && agentBalance >= 5) {
      console.log('\n🚀 Executing REAL TEST TRADE...');
      
      const tradeAmount = 5; // $5 test trade
      const result = await executeAsterDexTrade(
        agent,
        'BTC',
        'BUY',
        tradeAmount,
        btcPrice
      );

      if (result.success) {
        console.log('✅ Trade Executed!');
        console.log(`   TX: ${result.txHash}`);
        console.log(`   Trade ID: ${result.trade?.id}`);
      } else {
        console.log('❌ Trade Failed:', result.error);
      }
    }

    // Summary
    console.log('\n✅ Test Summary');
    console.log('='.repeat(60));
    console.log('✓ Aster Dex API: Working');
    console.log('✓ Market Data: Working');
    console.log('✓ Account Access: Working');
    console.log(`✓ Trading System: ${asterBalance >= 1 && agentBalance >= 1 ? 'Ready' : 'Needs funding'}`);
    console.log('\n🎉 Core infrastructure is operational!\n');

  } catch (error) {
    console.error('\n❌ Test Failed!');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

simpleAsterTest();
