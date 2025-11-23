import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAsterDexTrades() {
  try {
    console.log('=== CHECKING ASTERDEX TRADES ===\n');
    
    // Get all PERPETUAL trades (AsterDEX trades)
    const trades = await prisma.trade.findMany({
      where: {
        type: 'PERPETUAL'
      },
      include: {
        agent: {
          select: {
            name: true,
            walletAddress: true
          }
        }
      },
      orderBy: {
        entryTime: 'desc'
      }
    });

    console.log(`Total AsterDEX Trades: ${trades.length}\n`);

    if (trades.length === 0) {
      console.log('No AsterDEX trades found.\n');
      return;
    }

    // Group by status
    const byStatus = {
      OPEN: trades.filter(t => t.status === 'OPEN'),
      CLOSED: trades.filter(t => t.status === 'CLOSED'),
      CANCELLED: trades.filter(t => t.status === 'CANCELLED')
    };

    console.log(`OPEN Trades: ${byStatus.OPEN.length}`);
    console.log(`CLOSED Trades: ${byStatus.CLOSED.length}`);
    console.log(`CANCELLED Trades: ${byStatus.CANCELLED.length}\n`);

    // Display all trades
    console.log('=== ALL ASTERDEX TRADES ===\n');
    
    for (const trade of trades) {
      console.log(`Trade ID: ${trade.id}`);
      console.log(`Agent: ${trade.agent.name}`);
      console.log(`Status: ${trade.status}`);
      console.log(`Side: ${trade.side}`);
      console.log(`Symbol: ${trade.symbol}`);
      console.log(`Entry Price: $${trade.entryPrice}`);
      console.log(`Quantity: ${trade.quantity}`);
      console.log(`Stop Loss: ${trade.stopLoss || 'N/A'}`);
      console.log(`Take Profit: ${trade.takeProfit || 'N/A'}`);
      console.log(`Strategy: ${trade.strategy || 'N/A'}`);
      console.log(`Confidence: ${trade.confidence ? (trade.confidence * 100).toFixed(1) + '%' : 'N/A'}`);
      
      if (trade.exitPrice) {
        console.log(`Exit Price: $${trade.exitPrice}`);
      }
      
      if (trade.profitLoss !== null && trade.profitLoss !== undefined) {
        const pnlColor = trade.profitLoss >= 0 ? '✅' : '❌';
        console.log(`P&L: ${pnlColor} $${trade.profitLoss.toFixed(2)}`);
      }
      
      if (trade.txHash) {
        console.log(`Order ID: ${trade.txHash}`);
      }
      
      console.log(`Entry Time: ${trade.entryTime.toISOString()}`);
      
      if (trade.exitTime) {
        console.log(`Exit Time: ${trade.exitTime.toISOString()}`);
      }
      
      console.log('---\n');
    }

    // Calculate total P&L
    const totalPnL = trades
      .filter(t => t.profitLoss !== null && t.profitLoss !== undefined)
      .reduce((sum, t) => sum + (t.profitLoss || 0), 0);
    
    const pnlEmoji = totalPnL >= 0 ? '✅' : '❌';
    console.log(`\n=== TOTAL P&L: ${pnlEmoji} $${totalPnL.toFixed(2)} ===\n`);

    // Show agent performance
    const agentStats = new Map();
    
    for (const trade of trades) {
      const agentName = trade.agent.name;
      if (!agentStats.has(agentName)) {
        agentStats.set(agentName, {
          name: agentName,
          trades: 0,
          open: 0,
          closed: 0,
          cancelled: 0,
          totalPnL: 0
        });
      }
      
      const stats = agentStats.get(agentName);
      stats.trades++;
      
      if (trade.status === 'OPEN') stats.open++;
      if (trade.status === 'CLOSED') stats.closed++;
      if (trade.status === 'CANCELLED') stats.cancelled++;
      
      if (trade.profitLoss !== null && trade.profitLoss !== undefined) {
        stats.totalPnL += (trade.profitLoss || 0);
      }
    }

    console.log('=== AGENT PERFORMANCE ===\n');
    for (const [agentName, stats] of agentStats.entries()) {
      const pnlEmoji = stats.totalPnL >= 0 ? '✅' : '❌';
      console.log(`${agentName}:`);
      console.log(`  Total Trades: ${stats.trades}`);
      console.log(`  Open: ${stats.open}`);
      console.log(`  Closed: ${stats.closed}`);
      console.log(`  Cancelled: ${stats.cancelled}`);
      console.log(`  P&L: ${pnlEmoji} $${stats.totalPnL.toFixed(2)}`);
      console.log('');
    }

  } catch (error) {
    console.error('Error checking AsterDEX trades:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAsterDexTrades();
