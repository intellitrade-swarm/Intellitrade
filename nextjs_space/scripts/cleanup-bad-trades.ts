
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupBadTrades() {
  try {
    console.log('🧹 Cleaning up bad trades with $0 values...\n');
    
    // Find trades with 0 entry price or 0 quantity
    const badTrades = await prisma.trade.findMany({
      where: {
        OR: [
          { entryPrice: 0 },
          { quantity: 0 },
          { 
            AND: [
              { entryPrice: { lte: 0 } },
              { quantity: { lte: 0 } }
            ]
          }
        ]
      },
      include: {
        agent: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`Found ${badTrades.length} bad trades to clean up:\n`);
    
    for (const trade of badTrades) {
      console.log(`- Trade ID: ${trade.id}`);
      console.log(`  Agent: ${trade.agent.name}`);
      console.log(`  Symbol: ${trade.symbol}`);
      console.log(`  Entry Price: $${trade.entryPrice}`);
      console.log(`  Quantity: ${trade.quantity}`);
      console.log(`  Status: ${trade.status}`);
      console.log(`  Created: ${trade.entryTime.toISOString()}\n`);
    }

    if (badTrades.length === 0) {
      console.log('✅ No bad trades found. Database is clean!\n');
      return;
    }

    // Delete the bad trades
    const result = await prisma.trade.deleteMany({
      where: {
        OR: [
          { entryPrice: 0 },
          { quantity: 0 },
          { 
            AND: [
              { entryPrice: { lte: 0 } },
              { quantity: { lte: 0 } }
            ]
          }
        ]
      }
    });

    console.log(`✅ Successfully deleted ${result.count} bad trades!\n`);

  } catch (error) {
    console.error('Error cleaning up bad trades:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupBadTrades();
