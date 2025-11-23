import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config();

const prisma = new PrismaClient();

async function checkRecentTrades() {
  try {
    console.log('📊 Checking recent trades in database...\n');
    
    const trades = await prisma.trade.findMany({
      take: 10,
      orderBy: { entryTime: 'desc' },
      select: {
        id: true,
        agentId: true,
        symbol: true,
        side: true,
        quantity: true,
        entryPrice: true,
        exitPrice: true,
        status: true,
        profitLoss: true,
        entryTime: true,
        exitTime: true,
        isRealTrade: true,
        orderID: true,
      }
    });
    
    if (trades.length === 0) {
      console.log('❌ No trades found in database');
    } else {
      console.log(`✅ Found ${trades.length} recent trades:\n`);
      trades.forEach((trade, i) => {
        console.log(`${i + 1}. ${trade.symbol} - ${trade.side} - ${trade.status}`);
        console.log(`   Agent: ${trade.agentId}`);
        console.log(`   Entry: $${trade.entryPrice}`);
        console.log(`   Exit: $${trade.exitPrice || 'N/A'}`);
        console.log(`   Qty: ${trade.quantity}`);
        console.log(`   P/L: $${trade.profitLoss || 0}`);
        console.log(`   Real Trade: ${trade.isRealTrade ? 'YES' : 'NO'}`);
        console.log(`   Order ID: ${trade.orderID || 'N/A'}`);
        console.log(`   Time: ${trade.entryTime}`);
        console.log('');
      });
    }
    
    // Check total trades
    const totalTrades = await prisma.trade.count();
    console.log(`\n📈 Total trades in database: ${totalTrades}`);
    
    // Check recent 24h trades
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent24h = await prisma.trade.count({
      where: {
        entryTime: {
          gte: twentyFourHoursAgo
        }
      }
    });
    console.log(`📊 Trades in last 24h: ${recent24h}`);
    
    // Check trades by status
    const openTrades = await prisma.trade.count({ where: { status: 'OPEN' } });
    const closedTrades = await prisma.trade.count({ where: { status: 'CLOSED' } });
    console.log(`🟢 Open trades: ${openTrades}`);
    console.log(`🔴 Closed trades: ${closedTrades}`);
    
  } catch (error) {
    console.error('Error checking trades:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentTrades();
