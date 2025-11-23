
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStatus() {
  try {
    console.log('\n=== Current Status Check ===');
    
    // Check recent trades
    const recentTrades = await prisma.trade.findMany({
      where: {
        exitTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        exitTime: 'desc'
      },
      take: 10,
      include: {
        agent: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log(`\n📊 Trades closed in last 24 hours: ${recentTrades.length}`);
    
    if (recentTrades.length > 0) {
      const totalProfit = recentTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
      console.log(`💰 Total profit from closed trades: $${totalProfit.toFixed(2)}`);
      
      console.log('\n--- Recent Closed Trades ---');
      recentTrades.forEach(trade => {
        console.log(`
Agent: ${trade.agent.name}
Symbol: ${trade.symbol}
Entry: $${trade.entryPrice.toFixed(2)}
Exit: $${trade.exitPrice?.toFixed(2) || 'N/A'}
PnL: $${(trade.profitLoss || 0).toFixed(2)}
Closed: ${trade.exitTime?.toISOString() || 'N/A'}
        `);
      });
    }
    
    // Check treasury
    const treasury = await prisma.treasury.findFirst({
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    if (treasury) {
      console.log('\n=== Treasury Status ===');
      const totalBalance = treasury.baseBalance + treasury.bscBalance + treasury.ethereumBalance + treasury.solanaBalance;
      console.log(`Total Balance: $${totalBalance.toFixed(2)}`);
      console.log(`Base Balance: $${treasury.baseBalance.toFixed(2)}`);
      console.log(`BSC Balance: $${treasury.bscBalance.toFixed(2)}`);
      console.log(`Ethereum Balance: $${treasury.ethereumBalance.toFixed(2)}`);
      console.log(`Solana Balance: $${treasury.solanaBalance.toFixed(2)}`);
      console.log(`Total Received: $${treasury.totalReceived.toFixed(2)}`);
      console.log(`Last Updated: ${treasury.updatedAt.toISOString()}`);
    }
    
    // Check open trades
    const openTrades = await prisma.trade.findMany({
      where: {
        status: 'OPEN'
      }
    });
    
    console.log(`\n📊 Currently open trades: ${openTrades.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();
