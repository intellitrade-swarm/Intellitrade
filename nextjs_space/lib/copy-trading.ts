
import { ethers } from 'ethers';
import { prisma } from './db';

// Execute a copy trade transaction
export async function executeCopyTrade(
  copyTradeId: string,
  originalTrade: {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    entryPrice: number;
  },
  userWallet: {
    address: string;
    signer: ethers.Signer;
  }
) {
  try {
    // Get copy trade settings
    const copyTrade = await prisma.copyTrade.findUnique({
      where: { id: copyTradeId },
      include: { agent: true }
    });

    if (!copyTrade || !copyTrade.isActive) {
      throw new Error('Copy trade not active');
    }

    // Calculate position size based on copy percentage
    const adjustedQuantity = originalTrade.quantity * (copyTrade.copyPercentage / 100);
    
    // Check max position size
    const positionSize = adjustedQuantity * originalTrade.entryPrice;
    if (copyTrade.maxPositionSize && positionSize > copyTrade.maxPositionSize) {
      console.log(`Position size ${positionSize} exceeds max ${copyTrade.maxPositionSize}, skipping`);
      return null;
    }

    // Check allocation
    if (positionSize > copyTrade.allocationAmount) {
      console.log(`Insufficient allocation: ${positionSize} > ${copyTrade.allocationAmount}`);
      return null;
    }

    // Create copy trade transaction record
    const copyTradeTx = await prisma.copyTradeTx.create({
      data: {
        copyTradeId: copyTrade.id,
        symbol: originalTrade.symbol,
        side: originalTrade.side,
        quantity: adjustedQuantity,
        entryPrice: originalTrade.entryPrice,
        status: 'OPEN',
        chain: 'base' // Default to Base chain
      }
    });

    // Update copy trade stats
    await prisma.copyTrade.update({
      where: { id: copyTrade.id },
      data: {
        totalCopiedTrades: { increment: 1 }
      }
    });

    console.log(`Copy trade executed: ${copyTradeTx.id}`);
    return copyTradeTx;

  } catch (error) {
    console.error('Error executing copy trade:', error);
    throw error;
  }
}

// Close a copy trade position
export async function closeCopyTrade(
  copyTradeTxId: string,
  exitPrice: number,
  txHash?: string
) {
  try {
    const copyTradeTx = await prisma.copyTradeTx.findUnique({
      where: { id: copyTradeTxId },
      include: { copyTrade: true }
    });

    if (!copyTradeTx) {
      throw new Error('Copy trade transaction not found');
    }

    // Calculate P&L
    const profitLoss = copyTradeTx.side === 'BUY'
      ? (exitPrice - copyTradeTx.entryPrice) * copyTradeTx.quantity
      : (copyTradeTx.entryPrice - exitPrice) * copyTradeTx.quantity;

    // Update transaction
    const updatedTx = await prisma.copyTradeTx.update({
      where: { id: copyTradeTxId },
      data: {
        exitPrice,
        exitTime: new Date(),
        profitLoss,
        status: 'CLOSED',
        txHash
      }
    });

    // Update copy trade stats
    await prisma.copyTrade.update({
      where: { id: copyTradeTx.copyTradeId },
      data: {
        totalProfit: profitLoss > 0 
          ? { increment: profitLoss }
          : undefined,
        totalLoss: profitLoss < 0
          ? { increment: Math.abs(profitLoss) }
          : undefined
      }
    });

    return updatedTx;

  } catch (error) {
    console.error('Error closing copy trade:', error);
    throw error;
  }
}

// Monitor agent trades and trigger copy trades
export async function monitorAgentTrades(agentId: string, newTrade: any) {
  try {
    // Get all active copy traders for this agent
    const copyTrades = await prisma.copyTrade.findMany({
      where: {
        agentId,
        isActive: true,
        status: 'ACTIVE'
      }
    });

    if (copyTrades.length === 0) {
      return;
    }

    console.log(`Found ${copyTrades.length} copy traders for agent ${agentId}`);

    // Trigger copy trade for each copier
    for (const copyTrade of copyTrades) {
      try {
        // Create copy trade transaction
        const positionSize = newTrade.quantity * (copyTrade.copyPercentage / 100) * newTrade.entryPrice;
        
        if (copyTrade.maxPositionSize && positionSize > copyTrade.maxPositionSize) {
          console.log(`Skipping copy trade for ${copyTrade.userWalletAddress}: position too large`);
          continue;
        }

        if (positionSize > copyTrade.allocationAmount) {
          console.log(`Skipping copy trade for ${copyTrade.userWalletAddress}: insufficient allocation`);
          continue;
        }

        await prisma.copyTradeTx.create({
          data: {
            copyTradeId: copyTrade.id,
            originalTradeId: newTrade.id,
            symbol: newTrade.symbol,
            side: newTrade.side,
            quantity: newTrade.quantity * (copyTrade.copyPercentage / 100),
            entryPrice: newTrade.entryPrice,
            status: 'OPEN',
            chain: newTrade.chain || 'base'
          }
        });

        await prisma.copyTrade.update({
          where: { id: copyTrade.id },
          data: { totalCopiedTrades: { increment: 1 } }
        });

        console.log(`Copy trade created for ${copyTrade.userWalletAddress}`);
      } catch (error) {
        console.error(`Error creating copy trade for ${copyTrade.userWalletAddress}:`, error);
      }
    }

  } catch (error) {
    console.error('Error monitoring agent trades:', error);
  }
}

// Get copy trading statistics
export async function getCopyTradingStats(walletAddress: string) {
  const copyTrades = await prisma.copyTrade.findMany({
    where: { userWalletAddress: walletAddress },
    include: {
      agent: true,
      copiedTrades: {
        orderBy: { entryTime: 'desc' },
        take: 10
      }
    }
  });

  const stats = {
    totalCopyTrades: copyTrades.length,
    activeCopyTrades: copyTrades.filter(ct => ct.isActive).length,
    totalProfit: copyTrades.reduce((sum, ct) => sum + ct.totalProfit, 0),
    totalLoss: copyTrades.reduce((sum, ct) => sum + ct.totalLoss, 0),
    totalCopiedTrades: copyTrades.reduce((sum, ct) => sum + ct.totalCopiedTrades, 0),
    copyTrades
  };

  return stats;
}
