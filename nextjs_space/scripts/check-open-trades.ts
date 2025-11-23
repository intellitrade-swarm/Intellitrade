import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check open trades
  const openTrades = await prisma.trade.findMany({
    where: {
      status: 'OPEN'
    },
    orderBy: { entryTime: 'desc' },
    select: {
      id: true,
      symbol: true,
      side: true,
      type: true,
      entryPrice: true,
      quantity: true,
      entryTime: true,
      stopLoss: true,
      takeProfit: true,
      isRealTrade: true,
      chain: true,
      txHash: true,
      agent: {
        select: { name: true }
      }
    }
  });

  console.log('=== OPEN TRADES ===');
  console.log(`Total Open Trades: ${openTrades.length}\n`);
  
  if (openTrades.length === 0) {
    console.log('No open trades found');
  } else {
    openTrades.forEach(trade => {
      console.log(`${trade.agent.name}:`);
      console.log(`  ${trade.symbol} ${trade.type} ${trade.side}`);
      console.log(`  Entry: $${trade.entryPrice.toFixed(2)}`);
      console.log(`  Quantity: ${trade.quantity}`);
      console.log(`  Time: ${trade.entryTime.toISOString()}`);
      console.log(`  Real Trade: ${trade.isRealTrade ? 'Yes' : 'No'}`);
      if (trade.chain) console.log(`  Chain: ${trade.chain}`);
      if (trade.txHash) console.log(`  Tx: ${trade.txHash.slice(0, 20)}...`);
      console.log('');
    });
  }

  await prisma.$disconnect();
}

main().catch(console.error);
