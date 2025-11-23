
/**
 * Swarm-Enhanced Trading Executor
 * Integrates multi-agent swarm intelligence into trading decisions
 * 
 * This module provides a drop-in replacement for single-agent AI decisions
 * with collaborative multi-agent analysis when ENABLE_SWARM=true
 */

import { tradingSwarm, SwarmDecision } from './trading-swarm';
import { getAITradingDecision } from './openai';

export interface SwarmTradingDecision {
  action: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  confidence: number; // 0-1
  reasoning: string;
  quantity: number; // 0-1 (percentage of balance)
  swarmAnalysis?: SwarmDecision; // Full swarm analysis details
  mode: 'swarm' | 'single'; // Which mode was used
}

/**
 * Get trading decision using swarm intelligence or fallback to single agent
 */
export async function getSwarmTradingDecision(
  agentData: {
    id: string;
    name: string;
    strategyType: string;
    personality: string;
    parameters: any;
    currentBalance: number;
    winRate: number;
    sharpeRatio: number;
  },
  marketData: {
    symbol: string;
    price: number;
    priceChange: number;
    volume: number;
  }[],
  options: {
    useSwarm?: boolean; // Enable/disable swarm
    symbol?: string; // Specific symbol to analyze
  } = {}
): Promise<SwarmTradingDecision> {
  const useSwarm = options.useSwarm ?? (process.env.ENABLE_SWARM === 'true');
  
  if (useSwarm && options.symbol) {
    try {
      console.log(`🐝 Using Swarm Intelligence for ${agentData.name} analyzing ${options.symbol}`);
      
      // Run swarm analysis
      const swarmDecision = await tradingSwarm.analyzeSymbol(
        options.symbol,
        agentData.id,
        agentData.currentBalance
      );

      // Convert swarm decision to trading decision format
      const action = 
        swarmDecision.finalRecommendation === 'STRONG_BUY' || 
        swarmDecision.finalRecommendation === 'BUY'
          ? 'BUY'
          : swarmDecision.finalRecommendation === 'STRONG_SELL' ||
            swarmDecision.finalRecommendation === 'SELL'
          ? 'SELL'
          : 'HOLD';

      const confidence = swarmDecision.consensusConfidence / 100; // Convert to 0-1

      // Position size based on confidence and recommendation strength
      let quantity = 0;
      if (action === 'BUY') {
        if (swarmDecision.finalRecommendation === 'STRONG_BUY') {
          quantity = swarmDecision.suggestedPositionSize * 1.2; // 12% for strong buy
        } else {
          quantity = swarmDecision.suggestedPositionSize; // 10% for buy
        }
      } else if (action === 'SELL') {
        quantity = 1.0; // Close entire position
      }

      return {
        action,
        symbol: options.symbol,
        confidence,
        reasoning: swarmDecision.synthesizedReasoning,
        quantity: Math.min(quantity, 0.15), // Cap at 15% of balance
        swarmAnalysis: swarmDecision,
        mode: 'swarm',
      };

    } catch (error) {
      console.error('❌ Swarm analysis failed, falling back to single agent:', error);
      // Fall through to single agent decision
    }
  }

  // Single agent decision (fallback or when swarm is disabled)
  console.log(`🤖 Using Single Agent AI for ${agentData.name}`);
  
  const singleAgentDecision = await getAITradingDecision(agentData, marketData);

  return {
    action: singleAgentDecision.action,
    symbol: singleAgentDecision.symbol,
    confidence: singleAgentDecision.confidence,
    reasoning: singleAgentDecision.reasoning,
    quantity: singleAgentDecision.quantity,
    mode: 'single',
  };
}

/**
 * Batch analyze multiple symbols using swarm
 * Useful for scanning multiple opportunities
 */
export async function getSwarmBatchAnalysis(
  agentData: {
    id: string;
    name: string;
    currentBalance: number;
  },
  symbols: string[]
): Promise<SwarmTradingDecision[]> {
  const decisions: SwarmTradingDecision[] = [];

  for (const symbol of symbols) {
    try {
      const decision = await getSwarmTradingDecision(
        {
          ...agentData,
          strategyType: 'MULTI_AGENT',
          personality: 'Collaborative',
          parameters: {},
          winRate: 0.5,
          sharpeRatio: 1.0,
        },
        [],
        { useSwarm: true, symbol }
      );

      decisions.push(decision);
    } catch (error) {
      console.error(`Error analyzing ${symbol}:`, error);
    }
  }

  // Sort by confidence (highest first)
  return decisions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get swarm statistics and performance metrics
 */
export async function getSwarmStatistics() {
  const memory = tradingSwarm.getMemory();

  const totalDecisions = memory.pastDecisions.length;
  const buyDecisions = memory.pastDecisions.filter(
    (d) =>
      d.finalRecommendation === 'BUY' || d.finalRecommendation === 'STRONG_BUY'
  ).length;
  const sellDecisions = memory.pastDecisions.filter(
    (d) =>
      d.finalRecommendation === 'SELL' || d.finalRecommendation === 'STRONG_SELL'
  ).length;

  const avgConfidence =
    totalDecisions > 0
      ? memory.pastDecisions.reduce((sum, d) => sum + d.consensusConfidence, 0) /
        totalDecisions
      : 0;

  return {
    totalDecisions,
    buyDecisions,
    sellDecisions,
    holdDecisions: totalDecisions - buyDecisions - sellDecisions,
    averageConfidence: avgConfidence,
    recentDecisions: memory.pastDecisions.slice(-10),
    learnings: memory.learnings,
  };
}
