

/**
 * Agent Improvement Engine
 * Analyzes agent performance and adjusts strategies to improve profitability
 */

import { PrismaClient } from '@prisma/client';
import { calculateAgentPerformance } from './performance-tracker';

const prisma = new PrismaClient();

interface ImprovementInsights {
  agentId: string;
  agentName: string;
  currentPerformance: {
    winRate: number;
    totalProfitLoss: number;
    sharpeRatio: number;
    avgWinSize: number;
    avgLossSize: number;
  };
  recommendations: string[];
  riskAdjustments: {
    increaseLeverage: boolean;
    decreaseLeverage: boolean;
    tightenStopLoss: boolean;
    expandTakeProfit: boolean;
  };
  shouldPause: boolean;
}

/**
 * Analyze agent performance and generate improvement insights
 */
export async function analyzeAgentPerformance(agentId: string): Promise<ImprovementInsights> {
  const agent = await prisma.aIAgent.findUnique({
    where: { id: agentId },
    include: {
      trades: {
        where: {
          status: 'CLOSED',
          isRealTrade: true
        },
        orderBy: { exitTime: 'desc' },
        take: 50 // Last 50 trades
      }
    }
  });

  if (!agent) {
    throw new Error(`Agent ${agentId} not found`);
  }

  const performance = await calculateAgentPerformance(agentId);
  
  const recommendations: string[] = [];
  const riskAdjustments = {
    increaseLeverage: false,
    decreaseLeverage: false,
    tightenStopLoss: false,
    expandTakeProfit: false
  };

  // Calculate average win and loss sizes
  const winningTrades = agent.trades.filter(t => (t.profitLoss || 0) > 0);
  const losingTrades = agent.trades.filter(t => (t.profitLoss || 0) < 0);
  
  const avgWinSize = winningTrades.length > 0 
    ? winningTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0) / winningTrades.length 
    : 0;
  
  const avgLossSize = losingTrades.length > 0 
    ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0) / losingTrades.length)
    : 0;

  // Performance analysis
  if (performance.winRate >= 0.65) {
    recommendations.push('✅ Excellent win rate - consider increasing position sizes slightly');
    riskAdjustments.increaseLeverage = true;
  } else if (performance.winRate < 0.40) {
    recommendations.push('⚠️ Low win rate - tighten entry criteria and use stricter stop losses');
    riskAdjustments.tightenStopLoss = true;
    riskAdjustments.decreaseLeverage = true;
  }

  // Risk-reward analysis
  const riskRewardRatio = avgLossSize > 0 ? avgWinSize / avgLossSize : avgWinSize > 0 ? 999 : 0;
  
  if (riskRewardRatio < 1.5) {
    recommendations.push('📊 Improve risk-reward ratio - let winners run longer');
    riskAdjustments.expandTakeProfit = true;
  } else if (riskRewardRatio > 3) {
    recommendations.push('🎯 Excellent risk-reward ratio - maintain current strategy');
  }

  // Profit consistency
  if (performance.totalProfitLoss > 0 && performance.winRate > 0.50) {
    recommendations.push('💰 Profitable and consistent - maintain current approach');
  } else if (performance.totalProfitLoss < -100) {
    recommendations.push('🚨 Significant losses - review strategy and reduce position sizes');
    riskAdjustments.decreaseLeverage = true;
  }

  // Trading frequency
  if (agent.trades.length < 10) {
    recommendations.push('📈 Low trading frequency - consider more aggressive entry criteria');
  }

  // Sharpe ratio analysis
  if (performance.sharpeRatio > 1.5) {
    recommendations.push('⭐ Strong risk-adjusted returns - excellent performance');
  } else if (performance.sharpeRatio < 0.5) {
    recommendations.push('⚠️ Weak risk-adjusted returns - reduce volatility or improve consistency');
  }

  // Determine if agent should be paused
  const shouldPause = performance.totalProfitLoss < -200 || 
                      (performance.totalTrades > 20 && performance.winRate < 0.30);

  if (shouldPause) {
    recommendations.push('🛑 RECOMMENDATION: Pause agent for strategy review');
  }

  return {
    agentId,
    agentName: agent.name,
    currentPerformance: {
      winRate: performance.winRate,
      totalProfitLoss: performance.totalProfitLoss,
      sharpeRatio: performance.sharpeRatio,
      avgWinSize,
      avgLossSize
    },
    recommendations,
    riskAdjustments,
    shouldPause
  };
}

/**
 * Apply automatic improvements to agent configuration
 */
export async function applyAutomaticImprovements(agentId: string): Promise<void> {
  const insights = await analyzeAgentPerformance(agentId);
  const agent = await prisma.aIAgent.findUnique({ where: { id: agentId } });
  
  if (!agent) return;

  const updates: any = {};

  // Apply risk adjustments based on performance
  if (insights.riskAdjustments.increaseLeverage && insights.currentPerformance.winRate >= 0.65) {
    // For high-performing agents, record the success
    console.log(`📈 ${agent.name} performing well - Win Rate: ${(insights.currentPerformance.winRate * 100).toFixed(1)}%`);
    console.log(`   Recommendation: Maintain or slightly increase position sizes`);
  }

  if (insights.riskAdjustments.decreaseLeverage && insights.currentPerformance.totalProfitLoss < 0) {
    // For underperforming agents, log the recommendation
    console.log(`📉 ${agent.name} needs improvement - Total P&L: $${insights.currentPerformance.totalProfitLoss.toFixed(2)}`);
    console.log(`   Recommendation: Reduce position sizes and tighten risk management`);
  }

  // Pause agent if necessary (only for severe cases)
  if (insights.shouldPause && agent.isActive) {
    updates.isActive = false;
    console.log(`⏸️ PAUSING ${agent.name} due to poor performance`);
    console.log(`   P&L: $${insights.currentPerformance.totalProfitLoss.toFixed(2)} | Win Rate: ${(insights.currentPerformance.winRate * 100).toFixed(1)}%`);
  }

  // Update agent if there are changes
  if (Object.keys(updates).length > 0) {
    await prisma.aIAgent.update({
      where: { id: agentId },
      data: updates
    });
  }
}

/**
 * Run improvement analysis for all active agents
 */
export async function runImprovementCycle(): Promise<ImprovementInsights[]> {
  const agents = await prisma.aIAgent.findMany({
    where: { 
      isActive: true,
      totalTrades: { gt: 5 } // Only analyze agents with at least 5 trades
    }
  });

  const insights: ImprovementInsights[] = [];

  for (const agent of agents) {
    try {
      const agentInsights = await analyzeAgentPerformance(agent.id);
      insights.push(agentInsights);
      
      // Apply automatic improvements
      await applyAutomaticImprovements(agent.id);
    } catch (error) {
      console.error(`Error analyzing agent ${agent.name}:`, error);
    }
  }

  return insights;
}

/**
 * Get profit aggregation across all agents
 */
export async function getAggregatedProfits() {
  const agents = await prisma.aIAgent.findMany({
    include: {
      trades: {
        where: {
          status: 'CLOSED',
          isRealTrade: true
        }
      }
    }
  });

  let totalRealized = 0;
  let totalUnrealized = 0;
  let totalWins = 0;
  let totalLosses = 0;
  let bestAgent = { name: '', profit: -Infinity };
  let worstAgent = { name: '', profit: Infinity };

  const agentPerformances = agents.map(agent => {
    const closedTrades = agent.trades.filter(t => t.status === 'CLOSED');
    const openTrades = agent.trades.filter(t => t.status === 'OPEN');
    
    const realized = closedTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
    const unrealized = openTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
    
    const wins = closedTrades.filter(t => (t.profitLoss || 0) > 0).length;
    const losses = closedTrades.filter(t => (t.profitLoss || 0) < 0).length;

    totalRealized += realized;
    totalUnrealized += unrealized;
    totalWins += wins;
    totalLosses += losses;

    if (realized > bestAgent.profit) {
      bestAgent = { name: agent.name, profit: realized };
    }
    if (realized < worstAgent.profit) {
      worstAgent = { name: agent.name, profit: realized };
    }

    return {
      name: agent.name,
      strategy: agent.strategyType,
      realized,
      unrealized,
      total: realized + unrealized,
      wins,
      losses,
      winRate: (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0
    };
  }).sort((a, b) => b.total - a.total);

  return {
    totalRealized,
    totalUnrealized,
    totalProfit: totalRealized + totalUnrealized,
    totalWins,
    totalLosses,
    overallWinRate: (totalWins + totalLosses) > 0 ? (totalWins / (totalWins + totalLosses)) * 100 : 0,
    bestAgent,
    worstAgent,
    agentPerformances
  };
}

