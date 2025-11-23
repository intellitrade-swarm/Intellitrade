import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const realTrades = await prisma.trade.findMany({
    where: {
      entryTime: { gte: oneDayAgo },
      isRealTrade: true,
    },
    take: 10,
  });
  
  console.log(`\nFound ${realTrades.length} real trades in last 24 hours\n`);
  
  if (realTrades.length > 0) {
    realTrades.forEach(t => {
      const hoursAgo = ((Date.now() - new Date(t.entryTime).getTime()) / (60 * 60 * 1000)).toFixed(1);
      console.log(`- ${t.symbol} ${t.side} at $${t.entryPrice} (${t.status}) - ${hoursAgo}h ago - Real: ${t.isRealTrade}`);
    });
  } else {
    const allTrades = await prisma.trade.findMany({
      where: { entryTime: { gte: oneDayAgo } },
      take: 10,
      orderBy: { entryTime: 'desc' },
    });
    
    console.log(`Found ${allTrades.length} total trades (any isRealTrade value):\n`);
    allTrades.forEach(t => {
      const hoursAgo = ((Date.now() - new Date(t.entryTime).getTime()) / (60 * 60 * 1000)).toFixed(1);
      console.log(`- ${t.symbol} ${t.side} at $${t.entryPrice} (${t.status}) - ${hoursAgo}h ago - Real: ${t.isRealTrade}`);
    });
  }
  
  await prisma.$disconnect();
}

main();
