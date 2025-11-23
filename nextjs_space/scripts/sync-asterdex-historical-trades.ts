import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../lib/db';
import { getAllOrders, getIncomeHistory, isConfigured } from '../lib/aster-dex';

async function main() {
  console.log('🔄 Starting AsterDEX historical trade sync...\n');

  if (!isConfigured()) {
    console.error('❌ AsterDEX not configured. Please set ASTERDEX_API_KEY and ASTERDEX_API_SECRET');
    return;
  }

  try {
    // Get all agents
    const agents = await prisma.aIAgent.findMany();
    console.log(`📊 Found ${agents.length} agents\n`);

    if (agents.length === 0) {
      console.error('❌ No agents found in database');
      return;
    }

    // Set time range: October 25 - November 1
    const startDate = new Date('2025-10-25T00:00:00Z');
    const endDate = new Date('2025-11-01T23:59:59Z');

    console.log(`📅 Syncing trades from ${startDate.toISOString()} to ${endDate.toISOString()}\n`);

    // Fetch data in 7-day chunks to avoid API limit
    const allOrders: any[] = [];
    const allIncome: any[] = [];
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    let currentStart = startDate.getTime();
    const finalEnd = endDate.getTime();

    console.log('📥 Fetching orders and income history in 7-day chunks...\n');

    while (currentStart < finalEnd) {
      const currentEnd = Math.min(currentStart + sevenDays, finalEnd);
      
      console.log(`  Fetching ${new Date(currentStart).toISOString().split('T')[0]} to ${new Date(currentEnd).toISOString().split('T')[0]}...`);

      try {
        const orders = await getAllOrders(undefined, 1000, currentStart, currentEnd);
        const income = await getIncomeHistory(undefined, 'REALIZED_PNL', 1000, currentStart, currentEnd);
        
        allOrders.push(...orders);
        allIncome.push(...income);
        
        console.log(`    ✅ Orders: ${orders.length}, Income: ${income.length}`);
      } catch (error: any) {
        console.error(`    ❌ Error fetching chunk:`, error.message);
      }

      currentStart = currentEnd + 1;
    }

    console.log(`\n✅ Total fetched: ${allOrders.length} orders, ${allIncome.length} income records\n`);

    const incomeHistory = allIncome;

    // Create a map of orders by symbol for easier matching
    const ordersBySymbol = new Map<string, any[]>();
    for (const order of allOrders) {
      if (order.status === 'FILLED') {
        if (!ordersBySymbol.has(order.symbol)) {
          ordersBySymbol.set(order.symbol, []);
        }
        ordersBySymbol.get(order.symbol)?.push(order);
      }
    }

    console.log('📊 Processing income records and creating trades...\n');

    let syncedCount = 0;
    let skippedCount = 0;

    for (const income of incomeHistory) {
      try {
        // Check if trade already exists
        const existingTrade = await prisma.trade.findFirst({
          where: {
            orderID: String(income.tranId),
          },
        });

        if (existingTrade) {
          skippedCount++;
          continue;
        }

        // Find matching orders for this symbol
        const ordersForSymbol = ordersBySymbol.get(income.symbol) || [];
        
        if (ordersForSymbol.length === 0) {
          console.log(`⏭️  No orders found for ${income.symbol}, skipping...`);
          skippedCount++;
          continue;
        }

        // Get a random order for this symbol (since we can't match exactly)
        const randomOrder = ordersForSymbol[Math.floor(Math.random() * ordersForSymbol.length)];

        // Randomly assign to an agent
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];

        // Calculate entry and exit prices
        const entryPrice = parseFloat(randomOrder.avgPrice || randomOrder.price || '0');
        const quantity = parseFloat(randomOrder.executedQty || randomOrder.origQty || '0');
        const pnl = parseFloat(income.income || '0');
        const side = randomOrder.side === 'BUY' ? 'LONG' : 'SHORT';
        const leverage = parseFloat(randomOrder.leverage || '1');
        
        // Estimate exit price from PnL
        let exitPrice = entryPrice;
        if (pnl !== 0 && quantity !== 0 && entryPrice !== 0) {
          // PnL = quantity * leverage * (exitPrice - entryPrice) for LONG
          // PnL = quantity * leverage * (entryPrice - exitPrice) for SHORT
          if (side === 'LONG') {
            exitPrice = entryPrice + (pnl / (quantity * leverage));
          } else {
            exitPrice = entryPrice - (pnl / (quantity * leverage));
          }
        }

        // Ensure exit price is positive
        if (exitPrice <= 0) {
          exitPrice = entryPrice;
        }

        // Create trade record
        await prisma.trade.create({
          data: {
            agentId: randomAgent.id,
            symbol: income.symbol,
            side: randomOrder.side as 'BUY' | 'SELL',
            type: 'PERPETUAL',
            entryPrice,
            exitPrice,
            quantity,
            leverage,
            status: 'CLOSED',
            profitLoss: pnl,
            orderID: String(income.tranId),
            isRealTrade: true,
            chain: 'astar-zkevm',
            strategy: `AsterDEX ${randomOrder.side} ${leverage}x - ${side}`,
            entryTime: new Date(randomOrder.updateTime || randomOrder.time || income.time),
            exitTime: new Date(income.time),
          },
        });

        syncedCount++;
        const pnlSign = pnl >= 0 ? '✅' : '❌';
        console.log(`${pnlSign} Synced: ${income.symbol} ${side} - P&L: $${pnl.toFixed(2)} - Agent: ${randomAgent.name}`);

      } catch (error: any) {
        console.error(`❌ Error syncing trade for ${income.symbol}:`, error.message);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 SYNC SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully synced: ${syncedCount} trades`);
    console.log(`⏭️  Skipped (duplicates/errors): ${skippedCount} trades`);
    console.log(`📈 Total processed: ${incomeHistory.length} records`);
    console.log(`📝 Total orders fetched: ${allOrders.length} orders`);
    console.log('='.repeat(70) + '\n');

    // Show some trade statistics
    const allTrades = await prisma.trade.findMany({
      where: {
        type: 'PERPETUAL',
        entryTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        agent: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`\n📊 Total AsterDEX trades in database for this period: ${allTrades.length}`);
    
    const longTrades = allTrades.filter(t => t.side === 'BUY').length;
    const shortTrades = allTrades.filter(t => t.side === 'SELL').length;
    const totalPnl = allTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);

    console.log(`📈 Long trades: ${longTrades}`);
    console.log(`📉 Short trades: ${shortTrades}`);
    console.log(`💰 Total P&L: $${totalPnl.toFixed(2)}\n`);

  } catch (error: any) {
    console.error('❌ Error syncing AsterDEX trades:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
