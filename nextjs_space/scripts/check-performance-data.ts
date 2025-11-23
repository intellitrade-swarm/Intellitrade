import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check agents and their performance data
  const agents = await prisma.aIAgent.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      totalTrades: true,
      winRate: true,
      totalProfitLoss: true,
      sharpeRatio: true,
      maxDrawdown: true,
      currentBalance: true,
      realBalance: true,
      totalWins: true,
      totalLosses: true,
      performances: {
        orderBy: { timestamp: 'desc' },
        take: 1
      }
    }
  });

  console.log('=== AGENT PERFORMANCE DATA ===');
  agents.forEach(agent => {
    console.log(`\n${agent.name}:`);
    console.log(`  Total Trades: ${agent.totalTrades}`);
    console.log(`  Wins/Losses: ${agent.totalWins}/${agent.totalLosses}`);
    console.log(`  Win Rate: ${(agent.winRate * 100).toFixed(1)}%`);
    console.log(`  Total P&L: $${agent.totalProfitLoss.toFixed(2)}`);
    console.log(`  Sharpe Ratio: ${agent.sharpeRatio.toFixed(2)}`);
    console.log(`  Max Drawdown: ${(agent.maxDrawdown * 100).toFixed(1)}%`);
    console.log(`  Real Balance: $${agent.realBalance.toFixed(2)}`);
    console.log(`  Performance Metrics: ${agent.performances.length}`);
  });

  // Check recent trades
  const recentTrades = await prisma.trade.findMany({
    where: {
      status: 'CLOSED'
    },
    orderBy: { entryTime: 'desc' },
    take: 10,
    select: {
      symbol: true,
      side: true,
      entryPrice: true,
      exitPrice: true,
      profitLoss: true,
      entryTime: true,
      exitTime: true,
      agent: {
        select: { name: true }
      }
    }
  });

  console.log('\n\n=== RECENT CLOSED TRADES ===');
  if (recentTrades.length === 0) {
    console.log('No closed trades found');
  } else {
    recentTrades.forEach(trade => {
      console.log(`${trade.agent.name} - ${trade.symbol} ${trade.side} - P&L: $${trade.profitLoss?.toFixed(2) || 'N/A'}`);
    });
  }

  await prisma.$disconnect();
}

main().catch(console.error);
