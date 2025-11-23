import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTradingStatus() {
  console.log('=== Detailed Trade Analysis ===\n');
  
  // Get the two open trades with full details
  const openTrades = await prisma.trade.findMany({
    where: {
      status: 'OPEN',
      isRealTrade: true
    },
    include: {
      agent: true
    },
    orderBy: {
      entryTime: 'desc'
    }
  });
  
  console.log(`Open Real Trades: ${openTrades.length}\n`);
  
  openTrades.forEach(trade => {
    console.log(`=== Trade ${trade.id} ===`);
    console.log(`Agent: ${trade.agent.name}`);
    console.log(`Pair: ${trade.symbol}`);
    console.log(`Side: ${trade.side}`);
    console.log(`Quantity: ${trade.quantity}`);
    console.log(`Entry Price: $${trade.entryPrice}`);
    console.log(`Stop Loss: ${trade.stopLoss ? '$' + trade.stopLoss : 'Not set'}`);
    console.log(`Take Profit: ${trade.takeProfit ? '$' + trade.takeProfit : 'Not set'}`);
    console.log(`Entry Time: ${trade.entryTime}`);
    console.log(`Strategy: ${trade.strategy || 'N/A'}`);
    console.log(`Confidence: ${trade.confidence || 'N/A'}`);
    console.log(`Tx Hash: ${trade.txHash || 'N/A'}`);
    console.log(`Block Number: ${trade.blockNumber || 'N/A'}`);
    
    // Calculate hours open
    const hoursOpen = (Date.now() - trade.entryTime.getTime()) / (1000 * 60 * 60);
    console.log(`Time Open: ${hoursOpen.toFixed(1)} hours\n`);
  });
  
  // Check if the scheduler files exist
  const fs = require('fs');
  const schedulerPath = '/home/ubuntu/ipool_swarms/nextjs_space/lib/trading-scheduler.ts';
  const autonomousPath = '/home/ubuntu/ipool_swarms/nextjs_space/lib/aster-autonomous-trading.ts';
  
  console.log('\n=== Trading System Files ===');
  console.log(`trading-scheduler.ts: ${fs.existsSync(schedulerPath) ? '✓ Exists' : '✗ Missing'}`);
  console.log(`aster-autonomous-trading.ts: ${fs.existsSync(autonomousPath) ? '✓ Exists' : '✗ Missing'}`);
  
  // Check for any errors in recent trading attempts
  const recentClosedTrades = await prisma.trade.findMany({
    where: {
      status: {
        in: ['CLOSED', 'CANCELLED']
      }
    },
    orderBy: {
      exitTime: 'desc'
    },
    take: 5,
    include: {
      agent: {
        select: {
          name: true
        }
      }
    }
  });
  
  console.log('\n=== Recent Closed Trades ===');
  console.log(`Total: ${recentClosedTrades.length}\n`);
  
  if (recentClosedTrades.length > 0) {
    recentClosedTrades.forEach(trade => {
      const pnl = trade.profitLoss || 0;
      console.log(`${trade.agent.name}: ${trade.symbol} ${trade.side}`);
      console.log(`  Status: ${trade.status}`);
      console.log(`  PnL: $${pnl.toFixed(2)}`);
      console.log(`  Entry: $${trade.entryPrice} -> Exit: $${trade.exitPrice || 'N/A'}`);
      console.log(`  Closed: ${trade.exitTime || 'N/A'}\n`);
    });
  } else {
    console.log('No closed trades found.\n');
  }
}

checkTradingStatus()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
