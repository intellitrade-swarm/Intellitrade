
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function checkTradingStatus() {
  try {
    console.log('\n🔍 CHECKING TRADING STATUS...\n');

    // Check agents
    const agents = await prisma.aIAgent.findMany({
      where: { isActive: true },
      select: { 
        name: true, 
        currentBalance: true, 
        realBalance: true, 
        totalProfitLoss: true,
        totalTrades: true,
        winRate: true
      },
      orderBy: { totalProfitLoss: 'desc' }
    });
    
    console.log('📊 ACTIVE AGENTS:\n');
    let totalBalance = 0;
    agents.forEach(a => {
      const balance = a.realBalance || a.currentBalance || 0;
      totalBalance += balance;
      console.log(`  ${a.name}:`);
      console.log(`    Balance: $${balance.toFixed(2)}`);
      console.log(`    PnL: $${(a.totalProfitLoss || 0).toFixed(2)}`);
      console.log(`    Trades: ${a.totalTrades || 0}`);
      console.log(`    Win Rate: ${((a.winRate || 0) * 100).toFixed(1)}%\n`);
    });
    
    console.log(`💰 TOTAL AGENT CAPITAL: $${totalBalance.toFixed(2)}\n`);

    // Check recent trades
    const recentTrades = await prisma.trade.findMany({
      where: { isRealTrade: true },
      orderBy: { entryTime: 'desc' },
      take: 15,
      select: {
        entryTime: true,
        exitTime: true,
        agentId: true,
        symbol: true,
        side: true,
        profitLoss: true,
        status: true,
        entryPrice: true,
        exitPrice: true,
        quantity: true,
        leverage: true,
        agent: {
          select: { name: true }
        }
      }
    });
    
    console.log('\n📈 RECENT REAL TRADES (Last 15):\n');
    if (recentTrades.length === 0) {
      console.log('  ⚠️  NO RECENT TRADES FOUND\n');
    } else {
      recentTrades.forEach(t => {
        const pnl = t.profitLoss ? `$${t.profitLoss.toFixed(2)}` : 'Pending';
        const pnlColor = t.profitLoss && t.profitLoss > 0 ? '✅' : t.profitLoss && t.profitLoss < 0 ? '❌' : '⏳';
        console.log(`  ${pnlColor} ${t.entryTime.toISOString().substring(0, 16)} - ${t.agent.name}`);
        console.log(`     ${t.side} ${t.symbol} - PnL: ${pnl} - Status: ${t.status}`);
      });
    }

    // Check open positions
    const openTrades = await prisma.trade.findMany({
      where: { 
        status: 'OPEN',
        isRealTrade: true 
      },
      orderBy: { entryTime: 'desc' },
      select: {
        entryTime: true,
        symbol: true,
        side: true,
        entryPrice: true,
        quantity: true,
        leverage: true,
        agent: {
          select: { name: true }
        }
      }
    });
    
    console.log('\n\n🔓 OPEN POSITIONS:\n');
    if (openTrades.length === 0) {
      console.log('  ✅ No open positions (all positions closed)\n');
    } else {
      openTrades.forEach(t => {
        console.log(`  ${t.agent.name} - ${t.side} ${t.symbol} @ $${t.entryPrice}`);
        console.log(`     Opened: ${t.entryTime.toISOString().substring(0, 16)}`);
        console.log(`     Size: ${t.quantity} (Leverage: ${t.leverage || 1}x)\n`);
      });
    }

    // Check if scheduler is running
    console.log('\n⚙️  CHECKING TRADING SCHEDULER STATUS...\n');
    
    // Calculate time since last trade
    if (recentTrades.length > 0) {
      const lastTrade = recentTrades[0];
      const timeSince = Date.now() - lastTrade.entryTime.getTime();
      const hoursSince = (timeSince / (1000 * 60 * 60)).toFixed(1);
      console.log(`  Last trade: ${hoursSince} hours ago`);
      
      if (parseFloat(hoursSince) > 2) {
        console.log('  ⚠️  WARNING: No trades in over 2 hours. Scheduler may not be running.\n');
      } else {
        console.log('  ✅ Trading appears active\n');
      }
    }

    await prisma.$disconnect();
    
    console.log('\n✅ STATUS CHECK COMPLETE\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkTradingStatus();
