
import { prisma } from '../lib/db';
import { getAccountInfo } from '../lib/aster-dex';

async function syncLivePositions() {
  console.log('🔄 Syncing live AsterDEX positions...\n');

  try {
    // Fetch live positions from AsterDEX
    const accountInfo = await getAccountInfo();

    if (!accountInfo || !accountInfo.positions) {
      console.log('❌ No account info or positions found');
      return;
    }

    console.log(`📊 Account Balance: $${parseFloat(accountInfo.totalWalletBalance).toFixed(2)}`);
    console.log(`💰 Available Balance: $${parseFloat(accountInfo.availableBalance).toFixed(2)}`);
    console.log(`📈 Unrealized PnL: $${parseFloat(accountInfo.totalUnrealizedProfit).toFixed(2)}`);
    console.log(`\n🎯 Found ${accountInfo.positions.length} positions`);

    // Filter for non-zero positions
    const activePositions = accountInfo.positions.filter(
      (pos: any) => parseFloat(pos.positionAmt) !== 0
    );

    console.log(`✅ Active positions: ${activePositions.length}\n`);

    if (activePositions.length === 0) {
      console.log('No active positions to sync');
      return;
    }

    // Get all agents to assign positions
    const agents = await prisma.aIAgent.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        strategyType: true,
      },
    });

    let synced = 0;
    let skipped = 0;

    for (const pos of activePositions) {
      const positionAmt = parseFloat(pos.positionAmt);
      const entryPrice = parseFloat(pos.entryPrice);
      const markPrice = parseFloat(pos.markPrice);
      const unrealizedProfit = parseFloat(pos.unRealizedProfit);
      const leverage = parseInt(pos.leverage);

      const side = positionAmt > 0 ? 'BUY' : 'SELL';
      const quantity = Math.abs(positionAmt);

      console.log(`\n📍 ${pos.symbol} ${side} ${quantity} @ $${entryPrice}`);
      console.log(`   Current: $${markPrice} | PnL: $${unrealizedProfit.toFixed(2)} | Leverage: ${leverage}x`);

      // Check if this position already exists in database
      const existing = await prisma.trade.findFirst({
        where: {
          symbol: pos.symbol,
          side,
          status: 'OPEN',
          chain: 'astar-zkevm',
          entryPrice: {
            gte: entryPrice * 0.995,
            lte: entryPrice * 1.005,
          },
        },
      });

      if (existing) {
        console.log(`   ⏭️  Already in database (${existing.id})`);
        skipped++;
        continue;
      }

      // Find most recent agent for this symbol or use round-robin
      let assignedAgent = agents[synced % agents.length];
      
      const recentTrade = await prisma.trade.findFirst({
        where: {
          symbol: pos.symbol,
          chain: 'astar-zkevm',
        },
        include: {
          agent: true,
        },
        orderBy: {
          entryTime: 'desc',
        },
      });

      if (recentTrade) {
        assignedAgent = {
          id: recentTrade.agent.id,
          name: recentTrade.agent.name,
          strategyType: recentTrade.agent.strategyType,
        };
      }

      // Create trade record
      try {
        await prisma.trade.create({
          data: {
            agentId: assignedAgent.id,
            symbol: pos.symbol,
            side,
            type: 'PERPETUAL',
            quantity,
            entryPrice,
            leverage,
            status: 'OPEN',
            entryTime: new Date(),
            txHash: `aster-${pos.symbol}-${Date.now()}`,
            chain: 'astar-zkevm',
            isRealTrade: true,
            strategy: `AsterDEX ${side} ${leverage}x - Live sync`,
          },
        });

        console.log(`   ✅ Synced to ${assignedAgent.name}`);
        synced++;
      } catch (error) {
        console.error(`   ❌ Error syncing:`, error);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Sync complete!`);
    console.log(`   Synced: ${synced}`);
    console.log(`   Skipped (already in DB): ${skipped}`);
    console.log(`   Total active positions: ${activePositions.length}`);
    console.log(`${'='.repeat(60)}\n`);

  } catch (error) {
    console.error('❌ Error syncing positions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

syncLivePositions()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
