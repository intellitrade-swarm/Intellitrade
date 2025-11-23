import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAgents() {
  try {
    const agents = await prisma.aIAgent.findMany({
      select: {
        id: true,
        name: true,
        realBalance: true,
        isActive: true,
        strategyType: true,
        totalTrades: true,
        totalWins: true,
        totalLosses: true,
        winRate: true,
        totalProfitLoss: true
      },
      orderBy: {
        totalProfitLoss: 'desc'
      }
    });
    
    console.log('=== CURRENT AGENTS ===\n');
    let totalBalance = 0;
    agents.forEach((agent, idx) => {
      console.log(`${idx + 1}. ${agent.name}`);
      console.log(`   Balance: $${(agent.realBalance || 0).toFixed(2)}`);
      console.log(`   Strategy: ${agent.strategyType}`);
      console.log(`   Active: ${agent.isActive}`);
      console.log(`   Total Trades: ${agent.totalTrades || 0}`);
      console.log(`   Win Rate: ${(agent.winRate || 0).toFixed(1)}%`);
      console.log(`   Total PnL: $${(agent.totalProfitLoss || 0).toFixed(2)}`);
      console.log('');
      totalBalance += (agent.realBalance || 0);
    });
    
    console.log(`TOTAL: ${agents.length} agents with $${totalBalance.toFixed(2)} combined`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkAgents();
