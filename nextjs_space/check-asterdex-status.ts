import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStatus() {
  console.log('=== Checking AsterDEX Trading Activity ===\n');
  
  // Get all agents
  const agents = await prisma.aIAgent.findMany({
    select: {
      id: true,
      name: true,
      walletAddress: true,
      isActive: true,
      totalWins: true,
      totalLosses: true
    }
  });
  
  console.log(`=== All Agents ===`);
  console.log(`Total: ${agents.length}\n`);
  agents.forEach(agent => {
    console.log(`- ${agent.name} (${agent.isActive ? 'Active' : 'Inactive'})`);
    console.log(`  Wallet: ${agent.walletAddress || 'N/A'}`);
    console.log(`  W/L: ${agent.totalWins}/${agent.totalLosses}\n`);
  });
  
  // Check all open trades
  const openTrades = await prisma.trade.findMany({
    where: {
      status: 'OPEN'
    },
    include: {
      agent: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      entryTime: 'desc'
    }
  });
  
  console.log(`\n=== All Open Trades ===`);
  console.log(`Total: ${openTrades.length}\n`);
  
  if (openTrades.length > 0) {
    openTrades.forEach(trade => {
      console.log(`Trade ID: ${trade.id}`);
      console.log(`  Agent: ${trade.agent.name}`);
      console.log(`  Pair: ${trade.symbol}`);
      console.log(`  Side: ${trade.side} ${trade.quantity}`);
      console.log(`  Entry: ${trade.entryPrice}`);
      console.log(`  Chain: ${trade.chain || 'N/A'}`);
      console.log(`  Real Trade: ${trade.isRealTrade}`);
      console.log(`  Created: ${trade.entryTime}\n`);
    });
  } else {
    console.log('No open trades.\n');
  }
  
  // Check recent trades
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentTrades = await prisma.trade.findMany({
    where: {
      entryTime: {
        gte: oneDayAgo
      }
    },
    include: {
      agent: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      entryTime: 'desc'
    },
    take: 20
  });
  
  console.log(`=== Recent Trades (Last 24h) ===`);
  console.log(`Total: ${recentTrades.length}\n`);
  
  if (recentTrades.length > 0) {
    recentTrades.forEach(trade => {
      const pnl = trade.profitLoss || 0;
      console.log(`${trade.agent.name}: ${trade.symbol} ${trade.side}`);
      console.log(`  Status: ${trade.status}, PnL: ${pnl.toFixed(2)}`);
      console.log(`  Chain: ${trade.chain || 'N/A'}, Real: ${trade.isRealTrade}`);
      console.log(`  Time: ${trade.entryTime}\n`);
    });
  } else {
    console.log('No recent trades.\n');
  }
  
  // Check config
  console.log('=== Environment Configuration ===');
  console.log('ASTER_DEX_API_KEY:', process.env.ASTER_DEX_API_KEY ? '✓ Set' : '✗ Not set');
  console.log('ASTER_DEX_API_SECRET:', process.env.ASTER_DEX_API_SECRET ? '✓ Set' : '✗ Not set');
  console.log('ASTER_DEX_BASE_URL:', process.env.ASTER_DEX_BASE_URL || 'https://api.aster.finance');
}

checkStatus()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
