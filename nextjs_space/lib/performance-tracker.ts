
/**
 * Performance Tracking System
 * Calculates and updates agent performance metrics
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PerformanceData {
  totalTrades: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  totalProfitLoss: number;
  sharpeRatio: number;
  maxDrawdown: number;
  currentBalance: number;
}

/**
 * Calculate performance metrics for an agent based on their closed trades
 */
export async function calculateAgentPerformance(agentId: string): Promise<PerformanceData> {
  try {
    // Get all closed trades for the agent
    const closedTrades = await prisma.trade.findMany({
      where: {
        agentId,
        status: 'CLOSED',
        profitLoss: { not: null }
      },
      orderBy: { exitTime: 'asc' }
    });

    const totalTrades = closedTrades.length;
    
    if (totalTrades === 0) {
      return {
        totalTrades: 0,
        totalWins: 0,
        totalLosses: 0,
        winRate: 0,
        totalProfitLoss: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        currentBalance: 0
      };
    }

    // Calculate wins and losses
    const totalWins = closedTrades.filter(t => (t.profitLoss || 0) > 0).length;
    const totalLosses = closedTrades.filter(t => (t.profitLoss || 0) < 0).length;
    const winRate = totalTrades > 0 ? totalWins / totalTrades : 0;

    // Calculate total P&L
    const totalProfitLoss = closedTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);

    // Calculate returns for Sharpe ratio
    const returns = closedTrades.map(t => (t.profitLoss || 0));
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

    // Calculate max drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let runningBalance = 0;

    for (const trade of closedTrades) {
      runningBalance += (trade.profitLoss || 0);
      if (runningBalance > peak) {
        peak = runningBalance;
      }
      const drawdown = peak > 0 ? (peak - runningBalance) / peak : 0;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    // Get current balance
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
      select: { realBalance: true, currentBalance: true }
    });

    const currentBalance = agent?.realBalance || agent?.currentBalance || 0;

    return {
      totalTrades,
      totalWins,
      totalLosses,
      winRate,
      totalProfitLoss,
      sharpeRatio,
      maxDrawdown,
      currentBalance
    };
  } catch (error) {
    console.error(`Error calculating performance for agent ${agentId}:`, error);
    throw error;
  }
}

/**
 * Update agent performance metrics in the database
 */
export async function updateAgentPerformance(agentId: string): Promise<void> {
  try {
    const performance = await calculateAgentPerformance(agentId);

    await prisma.aIAgent.update({
      where: { id: agentId },
      data: {
        totalTrades: performance.totalTrades,
        totalWins: performance.totalWins,
        totalLosses: performance.totalLosses,
        winRate: performance.winRate,
        totalProfitLoss: performance.totalProfitLoss,
        sharpeRatio: performance.sharpeRatio,
        maxDrawdown: performance.maxDrawdown
      }
    });

    // Create a performance metric snapshot
    await prisma.performanceMetric.create({
      data: {
        agentId,
        balance: performance.currentBalance,
        totalTrades: performance.totalTrades,
        winRate: performance.winRate,
        profitLoss: performance.totalProfitLoss,
        sharpeRatio: performance.sharpeRatio,
        maxDrawdown: performance.maxDrawdown
      }
    });

    console.log(`✅ Updated performance for agent ${agentId}`);
  } catch (error) {
    console.error(`Error updating performance for agent ${agentId}:`, error);
    throw error;
  }
}

/**
 * Update performance for all active agents
 */
export async function updateAllAgentPerformance(): Promise<void> {
  try {
    const agents = await prisma.aIAgent.findMany({
      where: { isActive: true },
      select: { id: true, name: true }
    });

    console.log(`📊 Updating performance for ${agents.length} agents...`);

    for (const agent of agents) {
      try {
        await updateAgentPerformance(agent.id);
      } catch (error) {
        console.error(`Failed to update performance for ${agent.name}:`, error);
      }
    }

    console.log('✅ All agent performance updated');
  } catch (error) {
    console.error('Error updating all agent performance:', error);
    throw error;
  }
}

/**
 * Calculate unrealized P&L for open trades
 */
export async function calculateUnrealizedPnL(agentId: string, currentPrices: Record<string, number>): Promise<number> {
  try {
    const openTrades = await prisma.trade.findMany({
      where: {
        agentId,
        status: 'OPEN',
        entryPrice: { gt: 0 }
      }
    });

    let unrealizedPnL = 0;

    for (const trade of openTrades) {
      const currentPrice = currentPrices[trade.symbol];
      if (!currentPrice || trade.entryPrice === 0 || trade.quantity === 0) continue;

      const priceDiff = currentPrice - trade.entryPrice;
      const multiplier = trade.side === 'BUY' ? 1 : -1;
      const tradePnL = priceDiff * trade.quantity * multiplier;
      unrealizedPnL += tradePnL;
    }

    return unrealizedPnL;
  } catch (error) {
    console.error(`Error calculating unrealized P&L for agent ${agentId}:`, error);
    return 0;
  }
}
