import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config();

const prisma = new PrismaClient();

async function checkTradingStatus() {
  try {
    console.log('🤖 Checking autonomous trading status...\n');
    
    // Check agent status
    const agents = await prisma.aIAgent.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        strategyType: true,
        walletAddress: true,
        solanaWalletAddress: true,
        _count: {
          select: {
            trades: true
          }
        }
      }
    });
    
    console.log(`🤖 AI Agents (${agents.length} total):\n`);
    agents.forEach(agent => {
      console.log(`  📊 ${agent.name}: ${agent.isActive ? '✅ ACTIVE' : '❌ INACTIVE'}`);
      console.log(`     Strategy: ${agent.strategyType}`);
      console.log(`     EVM Wallet: ${agent.walletAddress ? '✅ ' + agent.walletAddress.slice(0, 10) + '...' : '❌ Not configured'}`);
      console.log(`     Solana Wallet: ${agent.solanaWalletAddress ? '✅' : '❌'}`);
      console.log(`     Total Trades: ${agent._count.trades}`);
      console.log('');
    });
    
    // Check open trades
    const openTrades = await prisma.trade.findMany({
      where: { status: 'OPEN' },
      include: {
        agent: {
          select: {
            name: true
          }
        }
      }
    });
    
    if (openTrades.length > 0) {
      console.log(`🟢 Open Trades (${openTrades.length}):\n`);
      openTrades.forEach(trade => {
        console.log(`  - ${trade.symbol} ${trade.side} @ $${trade.entryPrice}`);
        console.log(`    Agent: ${trade.agent.name}`);
        console.log(`    Entered: ${trade.entryTime}`);
        console.log(`    Time Open: ${Math.round((Date.now() - trade.entryTime.getTime()) / (1000 * 60 * 60))} hours`);
        console.log('');
      });
    } else {
      console.log('🟢 No open trades\n');
    }
    
    // Check AsterDEX API configuration
    const hasAsterDexKey = !!process.env.ASTERDEX_API_KEY;
    const hasAsterDexSecret = !!process.env.ASTERDEX_API_SECRET;
    console.log('🔑 AsterDEX API Configuration:');
    console.log(`   API Key: ${hasAsterDexKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   API Secret: ${hasAsterDexSecret ? '✅ Configured' : '❌ Missing'}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTradingStatus();
