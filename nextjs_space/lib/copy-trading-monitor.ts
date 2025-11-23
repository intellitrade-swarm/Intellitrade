
import { prisma } from './db';
import { monitorAgentTrades } from './copy-trading';

// Monitor and automatically execute copy trades when agents trade
export async function triggerCopyTradesForAgent(agentId: string, trade: any) {
  try {
    console.log(`[Copy Trading Monitor] New trade detected for agent ${agentId}:`, trade.id);
    
    // Only trigger copy trades for real trades
    if (!trade.isRealTrade) {
      console.log('[Copy Trading Monitor] Skipping simulation trade');
      return;
    }

    // Monitor and execute copy trades
    await monitorAgentTrades(agentId, trade);
    
    console.log(`[Copy Trading Monitor] Copy trades processed for agent ${agentId}`);
  } catch (error) {
    console.error('[Copy Trading Monitor] Error triggering copy trades:', error);
  }
}

// Close copy trades when agent closes a position
export async function closeCopyTradesForAgent(agentId: string, originalTradeId: string, exitPrice: number) {
  try {
    console.log(`[Copy Trading Monitor] Closing copy trades for agent ${agentId}, trade ${originalTradeId}`);

    // Find all copy trades for this original trade
    const copyTrades = await prisma.copyTradeTx.findMany({
      where: {
        originalTradeId,
        status: 'OPEN'
      },
      include: {
        copyTrade: true
      }
    });

    // Close each copy trade
    for (const copyTrade of copyTrades) {
      const profitLoss = copyTrade.side === 'BUY'
        ? (exitPrice - copyTrade.entryPrice) * copyTrade.quantity
        : (copyTrade.entryPrice - exitPrice) * copyTrade.quantity;

      await prisma.copyTradeTx.update({
        where: { id: copyTrade.id },
        data: {
          exitPrice,
          exitTime: new Date(),
          profitLoss,
          status: 'CLOSED'
        }
      });

      // Update copy trade stats
      await prisma.copyTrade.update({
        where: { id: copyTrade.copyTradeId },
        data: {
          totalProfit: profitLoss > 0 
            ? { increment: profitLoss }
            : undefined,
          totalLoss: profitLoss < 0
            ? { increment: Math.abs(profitLoss) }
            : undefined
        }
      });

      console.log(`[Copy Trading Monitor] Closed copy trade ${copyTrade.id} with P&L: ${profitLoss}`);
    }

    console.log(`[Copy Trading Monitor] Closed ${copyTrades.length} copy trades`);
  } catch (error) {
    console.error('[Copy Trading Monitor] Error closing copy trades:', error);
  }
}
