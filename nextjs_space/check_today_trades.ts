import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkTodayTrading() {
  try {
    // Check trades from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTrades = await prisma.trade.findMany({
      where: {
        timestamp: {
          gte: today
        },
        isRealTrade: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        agent: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`📊 Real Trades Today (${today.toDateString()}): ${todayTrades.length}`);

    if (todayTrades.length > 0) {
      console.log('\nRecent trades:');
      todayTrades.slice(0, 5).forEach((trade) => {
        console.log(`  - ${trade.agent.name}: ${trade.symbol} ${trade.side} at ${trade.timestamp.toLocaleString()}`);
      });
    }

    // Check last week
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekTrades = await prisma.trade.count({
      where: {
        timestamp: {
          gte: lastWeek
        },
        isRealTrade: true
      }
    });

    console.log(`\n📊 Real Trades Last 7 Days: ${weekTrades}`);

    // Check scheduler
    const scheduler = await prisma.schedulerConfig.findFirst();
    console.log(`\n⏰ Scheduler Enabled: ${scheduler?.schedulerEnabled ? 'YES' : 'NO'}`);
    console.log(`   Last Updated: ${scheduler?.lastUpdate?.toLocaleString()}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTodayTrading();
