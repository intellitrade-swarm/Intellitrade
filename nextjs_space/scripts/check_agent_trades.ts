import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function checkAgentTrades() {
  console.log('🔍 Checking latest trades for the 3 active agents...\n');

  // Get the 3 active agents with their allocated capital
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
      totalTrades: true,
      totalWins: true,
      totalLosses: true,
      winRate: true,
      totalProfitLoss: true
    },
    orderBy: {
      realBalance: 'desc'
    }
  });

  console.log('📊 Active Agents:');
  console.log('═'.repeat(80));
  agents.forEach(agent => {
    console.log(`\n${agent.name}`);
    console.log(`  Capital: $${agent.realBalance.toFixed(2)}`);
    console.log(`  Strategy: ${agent.strategyType}`);
    console.log(`  Total Trades: ${agent.totalTrades}`);
    console.log(`  Win Rate: ${agent.winRate?.toFixed(1)}%`);
    console.log(`  Total PnL: $${agent.totalProfitLoss.toFixed(2)}`);
  });

  console.log('\n\n🔥 Latest 5 Trades Per Agent:');
  console.log('═'.repeat(80));

  for (const agent of agents) {
    const recentTrades = await prisma.trade.findMany({
      where: {
        agentId: agent.id,
        isRealTrade: true
      },
      orderBy: {
        entryTime: 'desc'
      },
      take: 5,
      select: {
        id: true,
        symbol: true,
        type: true,
        quantity: true,
        entryPrice: true,
        exitPrice: true,
        profitLoss: true,
        status: true,
        executionVenue: true,
        leverage: true,
        entryTime: true,
        exitTime: true
      }
    });

    console.log(`\n\n${agent.name} - Latest Trades:`);
    console.log('─'.repeat(80));

    if (recentTrades.length === 0) {
      console.log('  No recent trades found.');
    } else {
      recentTrades.forEach((trade, index) => {
        console.log(`\n  ${index + 1}. ${trade.symbol} ${trade.type}`);
        console.log(`     Status: ${trade.status}`);
        console.log(`     Entry: $${trade.entryPrice.toFixed(6)} | Exit: ${trade.exitPrice ? '$' + trade.exitPrice.toFixed(6) : 'N/A'}`);
        console.log(`     Quantity: ${trade.quantity.toFixed(4)}`);
        console.log(`     PnL: $${trade.profitLoss ? trade.profitLoss.toFixed(2) : '0.00'}`);
        console.log(`     Venue: ${trade.executionVenue || 'N/A'}`);
        console.log(`     Leverage: ${trade.leverage ? trade.leverage + 'x' : 'N/A'}`);
        console.log(`     Opened: ${trade.entryTime.toISOString()}`);
        console.log(`     Closed: ${trade.exitTime ? trade.exitTime.toISOString() : 'Still Open'}`);
      });
    }
  }

  // Summary
  const totalCapital = agents.reduce((sum, a) => sum + a.realBalance, 0);
  const totalTrades = agents.reduce((sum, a) => sum + a.totalTrades, 0);
  const totalPnL = agents.reduce((sum, a) => sum + a.totalProfitLoss, 0);

  console.log('\n\n📈 Portfolio Summary:');
  console.log('═'.repeat(80));
  console.log(`Total Capital Allocated: $${totalCapital.toFixed(2)}`);
  console.log(`Total Trades Executed: ${totalTrades}`);
  console.log(`Combined PnL: $${totalPnL.toFixed(2)}`);
  console.log(`Portfolio Win Rate: ${(agents.reduce((sum, a) => sum + (a.winRate || 0), 0) / agents.length).toFixed(1)}%`);
}

checkAgentTrades()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
