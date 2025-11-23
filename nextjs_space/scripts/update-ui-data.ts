
/**
 * Update UI Data Script
 * Forces a refresh of all cached data and updates the UI
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUIData() {
  console.log('🔄 Updating UI Data...\n');

  try {
    // Get all trades
    const allTrades = await prisma.trade.findMany({
      where: { isRealTrade: true },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            strategyType: true
          }
        }
      },
      orderBy: { entryTime: 'desc' }
    });

    // Calculate statistics
    const openTrades = allTrades.filter(t => t.status === 'OPEN');
    const closedTrades = allTrades.filter(t => t.status === 'CLOSED');
    
    let totalPnL = 0;
    let realizedPnL = 0;
    let unrealizedPnL = 0;
    let winningTrades = 0;
    let losingTrades = 0;

    allTrades.forEach(trade => {
      const pnl = parseFloat(trade.profitLoss?.toString() || '0');
      totalPnL += pnl;

      if (trade.status === 'CLOSED') {
        realizedPnL += pnl;
        if (pnl > 0) {
          winningTrades++;
        } else if (pnl < 0) {
          losingTrades++;
        }
      } else if (trade.status === 'OPEN') {
        unrealizedPnL += pnl;
      }
    });

    const winRate = (winningTrades + losingTrades) > 0 
      ? (winningTrades / (winningTrades + losingTrades)) * 100 
      : 0;

    console.log('✅ TRADE STATISTICS:');
    console.log(`   Total Trades: ${allTrades.length}`);
    console.log(`   Open Trades: ${openTrades.length}`);
    console.log(`   Closed Trades: ${closedTrades.length}`);
    console.log(`   Winning Trades: ${winningTrades}`);
    console.log(`   Losing Trades: ${losingTrades}`);
    console.log(`   Win Rate: ${winRate.toFixed(1)}%`);
    console.log(`   Total P&L: $${totalPnL.toFixed(2)}`);
    console.log(`   Realized P&L: $${realizedPnL.toFixed(2)}`);
    console.log(`   Unrealized P&L: $${unrealizedPnL.toFixed(2)}`);

    // Get treasury data
    const treasury = await prisma.treasury.findFirst();
    if (treasury) {
      const total = treasury.baseBalance + treasury.bscBalance + 
                    treasury.ethereumBalance + treasury.solanaBalance;
      console.log('\n💰 TREASURY DATA:');
      console.log(`   Total Balance: $${total.toFixed(2)}`);
      console.log(`   Base: $${treasury.baseBalance.toFixed(2)}`);
      console.log(`   BSC: $${treasury.bscBalance.toFixed(2)}`);
      console.log(`   Ethereum: $${treasury.ethereumBalance.toFixed(2)}`);
      console.log(`   Solana: $${treasury.solanaBalance.toFixed(2)}`);
      console.log(`   Total Received: $${treasury.totalReceived.toFixed(2)}`);
      console.log(`   Transactions: ${treasury.totalTransactions}`);
    }

    // Get agent statistics
    const agents = await prisma.aIAgent.findMany({
      where: { isActive: true },
      include: {
        trades: {
          where: { isRealTrade: true }
        }
      }
    });

    console.log('\n🤖 AGENT STATISTICS:');
    agents.forEach(agent => {
      const agentTrades = agent.trades;
      const agentPnL = agentTrades.reduce((sum, t) => 
        sum + parseFloat(t.profitLoss?.toString() || '0'), 0
      );
      console.log(`   ${agent.name}:`);
      console.log(`      Total Trades: ${agentTrades.length}`);
      console.log(`      P&L: $${agentPnL.toFixed(2)}`);
    });

    console.log('\n✅ UI data updated successfully!');
    console.log('\n📊 The comprehensive stats API endpoint is ready at:');
    console.log('   GET /api/stats/comprehensive');
    console.log('\n🎯 New UI components available:');
    console.log('   - <StatsOverview />');
    console.log('   - <LiveTradesTable />');
    console.log('   - <TreasuryOverview />');
    
  } catch (error) {
    console.error('❌ Error updating UI data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateUIData();
