import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function testTradingConditions() {
  console.log('🔍 Testing Trading Conditions and Agent Readiness...\n');

  // Get active agents
  const agents = await prisma.aIAgent.findMany({
    where: {
      isActive: true,
      realBalance: { gt: 0 }
    },
    select: {
      id: true,
      name: true,
      realBalance: true,
      strategyType: true,
      aiProvider: true
    }
  });

  console.log('📊 Agent Configuration:');
  console.log('═'.repeat(70));
  agents.forEach(agent => {
    console.log(`\n${agent.name}:`);
    console.log(`  ├─ Balance: $${agent.realBalance.toFixed(2)}`);
    console.log(`  ├─ Strategy: ${agent.strategyType}`);
    console.log(`  └─ AI Provider: ${agent.aiProvider || 'N/A'}`);
  });

  // Check circuit breaker status
  console.log('\n\n🛡️  Checking Circuit Breakers:');
  console.log('═'.repeat(70));
  
  // Check for any tripped circuit breakers
  for (const agent of agents) {
    const todayTrades = await prisma.trade.findMany({
      where: {
        agentId: agent.id,
        isRealTrade: true,
        entryTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      select: {
        profitLoss: true
      }
    });

    const todayPnL = todayTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
    const lossPercent = (Math.abs(todayPnL) / agent.realBalance) * 100;

    console.log(`\n${agent.name}:`);
    console.log(`  ├─ Today's PnL: $${todayPnL.toFixed(2)}`);
    console.log(`  ├─ Loss %: ${lossPercent.toFixed(1)}%`);
    console.log(`  └─ Status: ${lossPercent > 30 ? '🔴 TRIPPED' : '✅ OK'}`);
  }

  // Check open positions
  console.log('\n\n📊 Open Positions:');
  console.log('═'.repeat(70));
  
  const openPositions = await prisma.trade.findMany({
    where: {
      status: 'OPEN',
      isRealTrade: true
    },
    include: {
      agent: {
        select: { name: true }
      }
    }
  });

  if (openPositions.length === 0) {
    console.log('✅ No open positions (agents ready to trade)');
  } else {
    openPositions.forEach(pos => {
      console.log(`${pos.agent.name} - ${pos.symbol} ${pos.type}`);
      console.log(`  ├─ Entry: $${pos.entryPrice.toFixed(2)}`);
      console.log(`  ├─ Quantity: ${pos.quantity}`);
      console.log(`  └─ Status: ${pos.status}`);
    });
  }

  // Recommendations
  console.log('\n\n💡 Recommendations:');
  console.log('═'.repeat(70));
  
  if (agents.length === 0) {
    console.log('❌ No active agents found with balance > 0');
  } else {
    console.log(`✅ ${agents.length} agents ready to trade`);
    console.log(`✅ Total capital: $${agents.reduce((sum, a) => sum + a.realBalance, 0).toFixed(2)}`);
    
    if (openPositions.length === 0) {
      console.log('✅ All positions closed - ready for new trades');
    } else {
      console.log(`⚠️  ${openPositions.length} open positions - agents may be waiting`);
    }
    
    console.log('\n📝 Next Steps:');
    console.log('  1. Scheduler is running every 15 minutes');
    console.log('  2. Agents will scan for opportunities based on:');
    console.log('     - Market conditions (volatility, volume, momentum)');
    console.log('     - Confidence thresholds');
    console.log('     - Risk limits and circuit breakers');
    console.log('  3. Check back in 15 minutes for new trades');
  }

  await prisma.$disconnect();
}

testTradingConditions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
