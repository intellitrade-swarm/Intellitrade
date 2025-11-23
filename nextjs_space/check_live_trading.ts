import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLiveTrading() {
  console.log('🔍 Checking Live Trading Status...\n');

  // Check recent trades (last 24 hours)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentTrades = await prisma.trade.findMany({
    where: {
      timestamp: {
        gte: yesterday
      },
      isRealTrade: true
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: 10,
    include: {
      agent: {
        select: {
          name: true,
          strategyType: true
        }
      }
    }
  });

  console.log(`📊 Real Trades in Last 24 Hours: ${recentTrades.length}\n`);

  if (recentTrades.length > 0) {
    console.log('Recent Real Trades:');
    recentTrades.forEach((trade, i) => {
      console.log(`\n${i + 1}. ${trade.agent.name} (${trade.agent.strategyType})`);
      console.log(`   Symbol: ${trade.symbol}`);
      console.log(`   Side: ${trade.side}`);
      console.log(`   Amount: $${trade.amountUSD.toFixed(2)}`);
      console.log(`   PnL: $${trade.profitLoss?.toFixed(2) || 'N/A'}`);
      console.log(`   Status: ${trade.status}`);
      console.log(`   Time: ${trade.timestamp.toLocaleString()}`);
    });
  } else {
    console.log('⚠️  No real trades found in the last 24 hours');
  }

  // Check scheduler status
  const scheduler = await prisma.schedulerConfig.findFirst();
  console.log('\n\n📅 Trading Scheduler Status:');
  console.log(`   Enabled: ${scheduler?.schedulerEnabled ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Interval: ${scheduler?.intervalMinutes || 'N/A'} minutes`);
  console.log(`   Last Update: ${scheduler?.lastUpdate?.toLocaleString() || 'Never'}`);

  // Check active agents
  const activeAgents = await prisma.aIAgent.count({
    where: {
      isActive: true
    }
  });
  console.log(`\n👥 Active Agents: ${activeAgents}`);

  // Check open positions
  const openPositions = await prisma.trade.count({
    where: {
      status: 'OPEN',
      isRealTrade: true
    }
  });
  console.log(`📈 Open Positions: ${openPositions}`);

  await prisma.$disconnect();
}

checkLiveTrading().catch(console.error);
