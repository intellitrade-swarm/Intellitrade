
/**
 * Multi-Agent Trading Swarm System
 * Inspired by CrewAI - Role-based collaborative AI agents for advanced trading decisions
 * 
 * Architecture:
 * 1. Data Analyst Agent: Processes Nansen data, on-chain metrics, smart money flows
 * 2. Technical Analyst Agent: RSI, MACD, volume, price action analysis
 * 3. Risk Manager Agent: Position sizing, stop-loss, portfolio risk assessment
 * 4. Strategy Coordinator: Synthesizes inputs and makes final trade decision
 * 5. Performance Evaluator: Reviews past trades, identifies improvements
 * 
 * Workflow: Parallel Analysis → Consensus Building → Final Decision → Execution → Evaluation
 */

import { prisma } from './db';
import { nansenAPI } from './nansen-api';

// ===== TYPES & INTERFACES =====

export interface AgentRole {
  role: 'data_analyst' | 'technical_analyst' | 'risk_manager' | 'strategy_coordinator' | 'performance_evaluator';
  name: string;
  expertise: string[];
  priority: number; // 1-5, higher = more weight in decisions
}

export interface AgentAnalysis {
  agentRole: string;
  symbol: string;
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: number; // 0-100
  reasoning: string;
  keyMetrics: Record<string, any>;
  riskFactors: string[];
  timestamp: Date;
}

export interface SwarmDecision {
  symbol: string;
  finalRecommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  consensusConfidence: number;
  individualAnalyses: AgentAnalysis[];
  synthesizedReasoning: string;
  suggestedPositionSize: number;
  suggestedStopLoss: number;
  suggestedTakeProfit: number;
  timestamp: Date;
}

export interface SwarmMemory {
  pastDecisions: SwarmDecision[];
  successfulPatterns: string[];
  failedPatterns: string[];
  learnings: string[];
}

// ===== AGENT DEFINITIONS =====

const AGENT_ROLES: AgentRole[] = [
  {
    role: 'data_analyst',
    name: 'Data Intelligence Agent',
    expertise: ['nansen_data', 'smart_money_flows', 'whale_tracking', 'on_chain_metrics'],
    priority: 5, // Highest - data quality is critical
  },
  {
    role: 'technical_analyst',
    name: 'Technical Analysis Agent',
    expertise: ['rsi', 'macd', 'volume_analysis', 'price_action', 'support_resistance'],
    priority: 4,
  },
  {
    role: 'risk_manager',
    name: 'Risk Management Agent',
    expertise: ['position_sizing', 'stop_loss', 'portfolio_risk', 'drawdown_protection'],
    priority: 5, // Critical for capital preservation
  },
  {
    role: 'strategy_coordinator',
    name: 'Strategy Coordination Agent',
    expertise: ['decision_synthesis', 'pattern_recognition', 'market_timing'],
    priority: 3,
  },
  {
    role: 'performance_evaluator',
    name: 'Performance Evaluation Agent',
    expertise: ['trade_review', 'win_loss_analysis', 'improvement_suggestions'],
    priority: 2,
  },
];

// ===== SWARM ORCHESTRATOR =====

class TradingSwarm {
  private memory: SwarmMemory = {
    pastDecisions: [],
    successfulPatterns: [],
    failedPatterns: [],
    learnings: [],
  };

  private llmConfig = {
    nvidia: {
      endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: 'meta/llama-3.1-70b-instruct',
      apiKey: process.env.NVIDIA_API_KEY,
    },
    gemini: {
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      apiKey: process.env.GEMINI_API_KEY,
    },
  };

  /**
   * Data Analyst Agent: Analyzes Nansen data and on-chain intelligence
   */
  private async dataAnalystAgent(symbol: string, agentId: string): Promise<AgentAnalysis> {
    try {
      console.log(`🔍 [Data Analyst] Analyzing ${symbol} with Nansen intelligence...`);

      // Fetch Nansen data
      const tokenMap: Record<string, string> = {
        'ETH': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        'USDC': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        'USDT': '0xdac17f958d2ee523a2206206994597c13d831ec7',
      };

      const tokenAddress = tokenMap[symbol.toUpperCase()];
      let nansenData: any = null;

      if (tokenAddress) {
        try {
          const [tokenInfo, smartMoney, flowIntel] = await Promise.all([
            nansenAPI.getTokenInfo(tokenAddress, 'ethereum'),
            nansenAPI.getSmartMoneyActivity(tokenAddress, 'ethereum'),
            nansenAPI.getFlowIntelligence(tokenAddress, 'ethereum'),
          ]);

          nansenData = { tokenInfo, smartMoney, flowIntel };
        } catch (error) {
          console.warn(`⚠️  [Data Analyst] Nansen data unavailable for ${symbol}:`, error);
        }
      }

      // Build analysis prompt
      const analysisPrompt = nansenData
        ? `You are a Data Intelligence Agent analyzing cryptocurrency ${symbol}.

**Nansen Smart Money Data:**
- Net Flow: ${nansenData.smartMoney?.netFlow24h || 'N/A'}
- Smart Money Buys: ${nansenData.smartMoney?.buys24h || 'N/A'}
- Smart Money Sells: ${nansenData.smartMoney?.sells24h || 'N/A'}
- Flow Intelligence: ${JSON.stringify(nansenData.flowIntel?.summary || {})}

**Your Task:**
Analyze this data and provide:
1. Clear recommendation: STRONG_BUY, BUY, HOLD, SELL, or STRONG_SELL
2. Confidence score (0-100)
3. Brief reasoning (2-3 sentences)
4. Top 3 risk factors

Format your response as JSON:
{
  "recommendation": "...",
  "confidence": ...,
  "reasoning": "...",
  "riskFactors": ["...", "...", "..."]
}`
        : `You are a Data Intelligence Agent analyzing cryptocurrency ${symbol}.
Note: Nansen data is not available for this token. Base your analysis on general market conditions and known behavior patterns for ${symbol}.

Provide:
1. Recommendation: STRONG_BUY, BUY, HOLD, SELL, or STRONG_SELL
2. Confidence score (0-100)
3. Brief reasoning
4. Top 3 risk factors

Format as JSON.`;

      // Call LLM (NVIDIA)
      const response = await fetch(this.llmConfig.nvidia.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.llmConfig.nvidia.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.llmConfig.nvidia.model,
          messages: [{ role: 'user', content: analysisPrompt }],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      const result = await response.json();
      const aiResponse = result.choices?.[0]?.message?.content || '{}';
      
      // Parse AI response
      let parsed: any = {};
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('⚠️  [Data Analyst] Failed to parse AI response, using defaults');
        parsed = {
          recommendation: 'HOLD',
          confidence: 50,
          reasoning: 'Unable to analyze data',
          riskFactors: ['Data unavailable', 'High uncertainty', 'Market volatility'],
        };
      }

      return {
        agentRole: 'Data Analyst',
        symbol,
        recommendation: parsed.recommendation || 'HOLD',
        confidence: parsed.confidence || 50,
        reasoning: parsed.reasoning || 'Analysis based on available data',
        keyMetrics: nansenData || {},
        riskFactors: parsed.riskFactors || ['Data limitations'],
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('❌ [Data Analyst] Error:', error);
      return {
        agentRole: 'Data Analyst',
        symbol,
        recommendation: 'HOLD',
        confidence: 30,
        reasoning: 'Analysis error occurred',
        keyMetrics: {},
        riskFactors: ['System error', 'Data unavailable'],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Technical Analyst Agent: RSI, MACD, volume, price action analysis
   */
  private async technicalAnalystAgent(symbol: string): Promise<AgentAnalysis> {
    try {
      console.log(`📊 [Technical Analyst] Analyzing ${symbol} technical indicators...`);

      // Fetch price data (simulated for now - can integrate with DeFiLlama/CoinGecko)
      const mockTechnicals = {
        rsi: 45 + Math.random() * 30, // 45-75 range
        macd: { signal: Math.random() > 0.5 ? 'bullish' : 'bearish' },
        volume24h: 1000000 + Math.random() * 5000000,
        priceChange24h: -5 + Math.random() * 15, // -5% to +10%
      };

      const prompt = `You are a Technical Analysis Agent for ${symbol}.

**Technical Indicators:**
- RSI: ${mockTechnicals.rsi.toFixed(2)}
- MACD: ${mockTechnicals.macd.signal}
- 24h Volume: $${(mockTechnicals.volume24h / 1000000).toFixed(2)}M
- 24h Price Change: ${mockTechnicals.priceChange24h.toFixed(2)}%

Provide technical recommendation as JSON:
{
  "recommendation": "...",
  "confidence": ...,
  "reasoning": "...",
  "riskFactors": ["...", "...", "..."]
}`;

      const response = await fetch(this.llmConfig.nvidia.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.llmConfig.nvidia.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.llmConfig.nvidia.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 400,
        }),
      });

      const result = await response.json();
      const aiResponse = result.choices?.[0]?.message?.content || '{}';
      
      let parsed: any = {};
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        parsed = {
          recommendation: 'HOLD',
          confidence: 50,
          reasoning: 'Technical analysis inconclusive',
          riskFactors: ['High volatility', 'Mixed signals'],
        };
      }

      return {
        agentRole: 'Technical Analyst',
        symbol,
        recommendation: parsed.recommendation || 'HOLD',
        confidence: parsed.confidence || 50,
        reasoning: parsed.reasoning || 'Technical analysis complete',
        keyMetrics: mockTechnicals,
        riskFactors: parsed.riskFactors || [],
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('❌ [Technical Analyst] Error:', error);
      return {
        agentRole: 'Technical Analyst',
        symbol,
        recommendation: 'HOLD',
        confidence: 40,
        reasoning: 'Technical analysis error',
        keyMetrics: {},
        riskFactors: ['Analysis error'],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Risk Manager Agent: Position sizing, stop-loss, portfolio risk
   */
  private async riskManagerAgent(
    symbol: string,
    agentId: string,
    balance: number
  ): Promise<AgentAnalysis> {
    try {
      console.log(`🛡️  [Risk Manager] Evaluating risk for ${symbol} (Balance: $${balance})...`);

      // Fetch agent's open positions
      const openPositions = await prisma.trade.count({
        where: {
          agentId,
          status: 'OPEN',
        },
      });

      // Fetch recent PnL
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayTrades = await prisma.trade.findMany({
        where: {
          agentId,
          entryTime: { gte: todayStart },
        },
        select: { profitLoss: true },
      });

      const todayPnL = todayTrades.reduce((sum: number, t: any) => sum + (t.profitLoss || 0), 0);
      const todayPnLPercent = (todayPnL / balance) * 100;

      const maxPositionSize = balance * 0.15; // Max 15% per trade
      const recommendedSize = balance * 0.10; // Recommended 10%

      const riskAnalysis = {
        currentBalance: balance,
        openPositions,
        maxOpenPositions: 5,
        todayPnLPercent: todayPnLPercent.toFixed(2),
        maxPositionSize,
        recommendedPositionSize: recommendedSize,
        stopLossPercent: 5, // 5% stop loss
        takeProfitPercent: 10, // 10% take profit
      };

      // Risk assessment
      const highRisk = openPositions >= 4 || todayPnLPercent < -20;
      const mediumRisk = openPositions >= 3 || todayPnLPercent < -10;

      const recommendation = highRisk
        ? 'SELL' // Close positions
        : mediumRisk
        ? 'HOLD' // Wait
        : 'BUY'; // Can open new position

      const confidence = highRisk ? 90 : mediumRisk ? 70 : 80;

      const reasoning = highRisk
        ? `High risk: ${openPositions} open positions, ${todayPnLPercent.toFixed(2)}% daily PnL. Recommend closing positions.`
        : mediumRisk
        ? `Medium risk: ${openPositions} open positions. Wait for better risk/reward.`
        : `Low risk: ${openPositions} open positions. Safe to open new position up to $${recommendedSize.toFixed(2)}.`;

      return {
        agentRole: 'Risk Manager',
        symbol,
        recommendation: recommendation as any,
        confidence,
        reasoning,
        keyMetrics: riskAnalysis,
        riskFactors: [
          openPositions >= 4 ? 'Too many open positions' : '',
          todayPnLPercent < -15 ? 'Significant daily loss' : '',
          balance < 50 ? 'Low capital' : '',
        ].filter(Boolean),
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('❌ [Risk Manager] Error:', error);
      return {
        agentRole: 'Risk Manager',
        symbol,
        recommendation: 'HOLD',
        confidence: 50,
        reasoning: 'Risk analysis error - default to HOLD',
        keyMetrics: {},
        riskFactors: ['System error'],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Strategy Coordinator: Synthesizes all agent inputs and makes final decision
   */
  private async strategyCoordinatorAgent(
    symbol: string,
    analyses: AgentAnalysis[]
  ): Promise<SwarmDecision> {
    try {
      console.log(`🎯 [Strategy Coordinator] Synthesizing decision for ${symbol}...`);

      // Calculate weighted consensus
      const weights: Record<string, number> = {
        'Data Analyst': 5,
        'Technical Analyst': 4,
        'Risk Manager': 5,
      };

      const recommendationScores: Record<string, number> = {
        'STRONG_BUY': 2,
        'BUY': 1,
        'HOLD': 0,
        'SELL': -1,
        'STRONG_SELL': -2,
      };

      let weightedScore = 0;
      let totalWeight = 0;
      let totalConfidence = 0;

      analyses.forEach((analysis) => {
        const weight = weights[analysis.agentRole] || 1;
        const score = recommendationScores[analysis.recommendation] || 0;
        weightedScore += score * weight * (analysis.confidence / 100);
        totalWeight += weight;
        totalConfidence += analysis.confidence;
      });

      const avgScore = weightedScore / totalWeight;
      const avgConfidence = totalConfidence / analyses.length;

      // Convert score to recommendation
      const finalRecommendation =
        avgScore >= 1.5
          ? 'STRONG_BUY'
          : avgScore >= 0.5
          ? 'BUY'
          : avgScore <= -1.5
          ? 'STRONG_SELL'
          : avgScore <= -0.5
          ? 'SELL'
          : 'HOLD';

      // Synthesize reasoning
      const synthesizedReasoning = `Swarm consensus: ${analyses.length} specialized agents analyzed ${symbol}. ${
        analyses.filter((a) => a.recommendation === 'BUY' || a.recommendation === 'STRONG_BUY').length
      } recommend buying, ${
        analyses.filter((a) => a.recommendation === 'HOLD').length
      } recommend holding, ${
        analyses.filter((a) => a.recommendation === 'SELL' || a.recommendation === 'STRONG_SELL').length
      } recommend selling. Average confidence: ${avgConfidence.toFixed(0)}%. Key factors: ${analyses
        .map((a) => a.reasoning.substring(0, 50))
        .join('; ')}.`;

      const decision: SwarmDecision = {
        symbol,
        finalRecommendation: finalRecommendation as any,
        consensusConfidence: Math.round(avgConfidence),
        individualAnalyses: analyses,
        synthesizedReasoning,
        suggestedPositionSize: 0.1, // 10% of balance
        suggestedStopLoss: 0.05, // 5%
        suggestedTakeProfit: 0.10, // 10%
        timestamp: new Date(),
      };

      // Store in memory
      this.memory.pastDecisions.push(decision);
      if (this.memory.pastDecisions.length > 50) {
        this.memory.pastDecisions.shift(); // Keep last 50
      }

      return decision;

    } catch (error) {
      console.error('❌ [Strategy Coordinator] Error:', error);
      return {
        symbol,
        finalRecommendation: 'HOLD',
        consensusConfidence: 50,
        individualAnalyses: analyses,
        synthesizedReasoning: 'Error in consensus building - defaulting to HOLD',
        suggestedPositionSize: 0,
        suggestedStopLoss: 0.05,
        suggestedTakeProfit: 0.10,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Main swarm analysis workflow
   * Runs all agents in parallel, then synthesizes decision
   */
  public async analyzeSymbol(
    symbol: string,
    agentId: string,
    balance: number
  ): Promise<SwarmDecision> {
    try {
      console.log(`\n🐝 ===== TRADING SWARM ACTIVATED =====`);
      console.log(`🎯 Target: ${symbol} | Agent: ${agentId} | Balance: $${balance}`);
      console.log(`👥 Deploying ${AGENT_ROLES.length} specialized agents...`);

      const startTime = Date.now();

      // Run specialized agents in parallel
      const [dataAnalysis, technicalAnalysis, riskAnalysis] = await Promise.all([
        this.dataAnalystAgent(symbol, agentId),
        this.technicalAnalystAgent(symbol),
        this.riskManagerAgent(symbol, agentId, balance),
      ]);

      const allAnalyses = [dataAnalysis, technicalAnalysis, riskAnalysis];

      // Coordinator synthesizes decision
      const swarmDecision = await this.strategyCoordinatorAgent(symbol, allAnalyses);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`\n✅ SWARM CONSENSUS REACHED (${duration}s)`);
      console.log(`📊 Recommendation: ${swarmDecision.finalRecommendation}`);
      console.log(`🎯 Confidence: ${swarmDecision.consensusConfidence}%`);
      console.log(`💡 Reasoning: ${swarmDecision.synthesizedReasoning.substring(0, 150)}...`);
      console.log(`🐝 ===== SWARM DEACTIVATED =====\n`);

      return swarmDecision;

    } catch (error) {
      console.error('❌ [Trading Swarm] Fatal error:', error);
      throw error;
    }
  }

  /**
   * Get swarm memory and learnings
   */
  public getMemory(): SwarmMemory {
    return this.memory;
  }

  /**
   * Clear swarm memory (for testing/reset)
   */
  public clearMemory(): void {
    this.memory = {
      pastDecisions: [],
      successfulPatterns: [],
      failedPatterns: [],
      learnings: [],
    };
  }
}

// Export singleton instance
export const tradingSwarm = new TradingSwarm();
