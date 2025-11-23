import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function closeStuckTrades() {
  console.log('=== Closing Stuck AsterDEX Trades ===\n');
  
  // Get current ETH price (approximate)
  // In production, this would come from your oracle or price feed
  const currentEthPrice = 3250.00; // Current approximate ETH price
  
  console.log(`Current ETH Price: $${currentEthPrice}\n`);
  
  // Get open real trades
  const openTrades = await prisma.trade.findMany({
    where: {
      status: 'OPEN',
      isRealTrade: true
    },
    include: {
      agent: true
    }
  });
  
  console.log(`Found ${openTrades.length} open trades to close.\n`);
  
  for (const trade of openTrades) {
    console.log(`Closing Trade ${trade.id}:`);
    console.log(`  Agent: ${trade.agent.name}`);
    console.log(`  Pair: ${trade.symbol}`);
    console.log(`  Entry Price: $${trade.entryPrice}`);
    console.log(`  Exit Price: $${currentEthPrice}`);
    
    // Calculate P&L
    let pnl = 0;
    if (trade.side === 'BUY') {
      // Long position: profit if price went up
      pnl = (currentEthPrice - trade.entryPrice) * trade.quantity;
    } else {
      // Short position: profit if price went down
      pnl = (trade.entryPrice - currentEthPrice) * trade.quantity;
    }
    
    const pnlPercentage = ((currentEthPrice - trade.entryPrice) / trade.entryPrice) * 100;
    
    console.log(`  P&L: $${pnl.toFixed(2)} (${pnlPercentage.toFixed(2)}%)`);
    
    // Update the trade
    await prisma.trade.update({
      where: { id: trade.id },
      data: {
        status: 'CLOSED',
        exitPrice: currentEthPrice,
        exitTime: new Date(),
        profitLoss: pnl
      }
    });
    
    // Update agent stats
    if (pnl > 0) {
      await prisma.aIAgent.update({
        where: { id: trade.agentId },
        data: {
          totalWins: { increment: 1 }
        }
      });
      console.log(`  ✓ Win recorded for ${trade.agent.name}`);
    } else {
      await prisma.aIAgent.update({
        where: { id: trade.agentId },
        data: {
          totalLosses: { increment: 1 }
        }
      });
      console.log(`  ✓ Loss recorded for ${trade.agent.name}`);
    }
    
    console.log(`  ✓ Trade closed successfully\n`);
  }
  
  console.log('=== All Trades Closed ===');
}

closeStuckTrades()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
