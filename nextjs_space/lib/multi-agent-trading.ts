
/**
 * Multi-Agent Collaborative Trading System
 * Inspired by CrewAI architecture with role-based agents
 * 
 * Architecture:
 * - Analyst Agent: Analyzes Nansen data, market trends, on-chain metrics
 * - Trader Agent: Makes trading decisions based on analyst insights
 * - Risk Manager Agent: Reviews and approves/rejects trade proposals
 * 
 * Each agent has:
 * - Specific role and expertise
 * - Access to relevant tools/data
 * - Ability to collaborate with other agents
 */

interface AgentRole {
  name: string;
  role: string;
  goal: string;
  backstory: string;
  tools: string[];
}

interface AnalysisTask {
  symbol: string;
  chain: string;
  marketData: any;
  nansenData?: any;
  onChainData?: any;
}

interface TradingDecision {
  action: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  confidence: number;
  reasoning: string;
  analystInsights: string;
  riskAssessment: string;
  recommendedSize: number;
  stopLoss?: number;
  takeProfit?: number;
  approved: boolean;
}

class MultiAgentTradingSystem {
  private openAIKey: string;

  // Agent Roles (CrewAI-inspired)
  private agents: AgentRole[] = [
    {
      name: 'Analyst',
      role: 'Market Intelligence Analyst',
      goal: 'Analyze market data, Nansen smart money flows, and on-chain metrics to identify trading opportunities',
      backstory: 'Expert in on-chain analytics with 10+ years of DeFi research. Specializes in interpreting smart money movements, whale activity, and DEX analytics. Known for discovering alpha before the market.',
      tools: ['nansen_api', 'dexscreener', 'coingecko', 'on_chain_analysis'],
    },
    {
      name: 'Trader',
      role: 'Quantitative Trader',
      goal: 'Make data-driven trading decisions based on analyst insights and technical indicators',
      backstory: 'Former hedge fund quantitative trader with expertise in algorithmic trading and risk-adjusted returns. Focuses on high-probability setups with favorable risk/reward ratios.',
      tools: ['technical_analysis', 'order_execution', 'position_sizing'],
    },
    {
      name: 'Risk Manager',
      role: 'Portfolio Risk Manager',
      goal: 'Protect capital by evaluating risk, setting position limits, and approving/rejecting trades',
      backstory: 'Experienced risk management professional from traditional finance. Implements strict risk controls, position sizing, and drawdown management. Never compromises on risk management principles.',
      tools: ['risk_calculator', 'portfolio_monitor', 'circuit_breaker'],
    },
  ];

  constructor() {
    this.openAIKey = process.env.OPENAI_API_KEY || '';
  }

  /**
   * Analyst Agent: Analyzes market and Nansen data
   */
  private async analystAgent(task: AnalysisTask): Promise<string> {
    const agent = this.agents[0]; // Analyst

    const prompt = `You are ${agent.role}. ${agent.backstory}

GOAL: ${agent.goal}

ANALYSIS TASK:
Symbol: ${task.symbol}
Chain: ${task.chain}

MARKET DATA:
${JSON.stringify(task.marketData, null, 2)}

${task.nansenData ? `NANSEN SMART MONEY DATA:
${JSON.stringify(task.nansenData, null, 2)}` : ''}

${task.onChainData ? `ON-CHAIN METRICS:
${JSON.stringify(task.onChainData, null, 2)}` : ''}

Analyze this data and provide:
1. Smart money sentiment (are whales accumulating or distributing?)
2. Technical trend (bullish, bearish, neutral)
3. Volume analysis (increasing, decreasing, stable)
4. On-chain activity assessment
5. Key support/resistance levels
6. Recommended action (BUY/SELL/HOLD) with confidence (0-100%)

Format your response as a detailed analysis that a quantitative trader can use to make decisions.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are an expert market intelligence analyst specializing in on-chain analytics and smart money tracking.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Analysis failed';
    } catch (error) {
      console.error('Analyst agent error:', error);
      return 'Error generating analysis';
    }
  }

  /**
   * Trader Agent: Makes trading decisions
   */
  private async traderAgent(analystInsights: string, task: AnalysisTask): Promise<{ action: string; confidence: number; reasoning: string; size: number }> {
    const agent = this.agents[1]; // Trader

    const prompt = `You are ${agent.role}. ${agent.backstory}

GOAL: ${agent.goal}

ANALYST INSIGHTS:
${analystInsights}

MARKET DATA:
Price: $${task.marketData.price}
24h Change: ${task.marketData.priceChange24h}%
Volume: $${task.marketData.volume24h}

Based on the analyst's insights and market data, make a trading decision:
1. ACTION: BUY, SELL, or HOLD
2. CONFIDENCE: 0-100% (only trade if >75%)
3. POSITION SIZE: Recommended % of capital (1-10%)
4. REASONING: Brief explanation of your decision
5. ENTRY STRATEGY: Market or limit order
6. STOP LOSS: Recommended stop loss % (3-5%)
7. TAKE PROFIT: Recommended take profit % (8-15%)

Respond in JSON format:
{
  "action": "BUY|SELL|HOLD",
  "confidence": 85,
  "positionSize": 5,
  "reasoning": "...",
  "stopLoss": 4,
  "takeProfit": 12
}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are an expert quantitative trader. Respond only in JSON format.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 400,
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '{}';
      const decision = JSON.parse(content);

      return {
        action: decision.action || 'HOLD',
        confidence: decision.confidence || 50,
        reasoning: decision.reasoning || 'No clear opportunity',
        size: decision.positionSize || 0,
      };
    } catch (error) {
      console.error('Trader agent error:', error);
      return {
        action: 'HOLD',
        confidence: 0,
        reasoning: 'Error in trading decision',
        size: 0,
      };
    }
  }

  /**
   * Risk Manager Agent: Reviews and approves trades
   */
  private async riskManagerAgent(
    tradeProposal: { action: string; confidence: number; reasoning: string; size: number },
    task: AnalysisTask,
    currentPortfolio: { balance: number; openPositions: number; dailyPnL: number }
  ): Promise<{ approved: boolean; reasoning: string; adjustedSize: number }> {
    const agent = this.agents[2]; // Risk Manager

    const prompt = `You are ${agent.role}. ${agent.backstory}

GOAL: ${agent.goal}

TRADE PROPOSAL:
Action: ${tradeProposal.action}
Symbol: ${task.symbol}
Confidence: ${tradeProposal.confidence}%
Proposed Size: ${tradeProposal.size}% of capital
Reasoning: ${tradeProposal.reasoning}

CURRENT PORTFOLIO:
Balance: $${currentPortfolio.balance}
Open Positions: ${currentPortfolio.openPositions}
Daily P&L: $${currentPortfolio.dailyPnL}

RISK LIMITS:
- Max position size: 10% of capital
- Max open positions: 5
- Daily loss limit: 30% of capital
- Minimum confidence: 75%

Evaluate this trade proposal and decide:
1. APPROVED: true/false
2. ADJUSTED SIZE: Recommended position size (may be lower than proposed)
3. REASONING: Why approved/rejected

Respond in JSON format:
{
  "approved": true,
  "adjustedSize": 5,
  "reasoning": "..."
}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are a strict risk manager. Respond only in JSON format.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 300,
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '{}';
      const decision = JSON.parse(content);

      return {
        approved: decision.approved === true,
        reasoning: decision.reasoning || 'Risk assessment failed',
        adjustedSize: decision.adjustedSize || 0,
      };
    } catch (error) {
      console.error('Risk manager agent error:', error);
      return {
        approved: false,
        reasoning: 'Error in risk assessment - trade rejected',
        adjustedSize: 0,
      };
    }
  }

  /**
   * Execute full multi-agent trading workflow
   */
  async analyzeTrade(
    task: AnalysisTask,
    currentPortfolio: { balance: number; openPositions: number; dailyPnL: number }
  ): Promise<TradingDecision> {
    console.log(`\n${'='.repeat(70)}`);
    console.log('🤖 MULTI-AGENT TRADING ANALYSIS');
    console.log(`${'='.repeat(70)}\n`);

    // Step 1: Analyst analyzes the market
    console.log('📊 STEP 1: Analyst Agent analyzing market data...');
    const analystInsights = await this.analystAgent(task);
    console.log('✅ Analysis complete\n');

    // Step 2: Trader makes trading decision
    console.log('💼 STEP 2: Trader Agent making decision...');
    const tradeProposal = await this.traderAgent(analystInsights, task);
    console.log(`✅ Decision: ${tradeProposal.action} (${tradeProposal.confidence}% confidence)\n`);

    // Step 3: Risk Manager reviews the trade
    console.log('🛡️  STEP 3: Risk Manager reviewing trade...');
    const riskDecision = await this.riskManagerAgent(tradeProposal, task, currentPortfolio);
    console.log(`✅ Risk Decision: ${riskDecision.approved ? 'APPROVED' : 'REJECTED'}\n`);

    console.log(`${'='.repeat(70)}\n`);

    // Return final decision
    return {
      action: tradeProposal.action as 'BUY' | 'SELL' | 'HOLD',
      symbol: task.symbol,
      confidence: tradeProposal.confidence,
      reasoning: tradeProposal.reasoning,
      analystInsights: analystInsights,
      riskAssessment: riskDecision.reasoning,
      recommendedSize: riskDecision.adjustedSize,
      approved: riskDecision.approved,
    };
  }
}

// Export singleton instance
export const multiAgentTrading = new MultiAgentTradingSystem();

// Export types
export type { AnalysisTask, TradingDecision };
