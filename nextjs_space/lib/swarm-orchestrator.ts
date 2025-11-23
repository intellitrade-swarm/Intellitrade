
import { PrismaClient, SwarmRole, DebateStatus, AIProvider } from '@prisma/client';
import { generateAIAnalysis } from './ai-market-analysis';
import { executeRealTrade, executeSolanaRealTrade } from './trading';
import * as AsterDex from './aster-dex';

const prisma = new PrismaClient();

// Trading venue selection
type TradingVenue = 'ASTERDEX' | 'ONEINCH' | 'JUPITER';

interface VenueSelection {
  venue: TradingVenue;
  reason: string;
  chain?: string;
  leverage?: number;
}

interface MarketOpportunity {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  triggerReason: string;
  marketData: any;
}

interface AgentAnalysis {
  agentId: string;
  agentName: string;
  role: SwarmRole;
  message: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD' | 'PASS';
  reasoning: any;
  suggestedPrice?: number;
  suggestedSize?: number;
  stopLoss?: number;
  takeProfit?: number;
}

/**
 * Main orchestrator for swarm trading debates
 */
export class SwarmOrchestrator {
  
  /**
   * Initialize a new trading debate for a market opportunity
   */
  async initiateDebate(opportunity: MarketOpportunity): Promise<string> {
    console.log(`🎯 Initiating swarm debate for ${opportunity.symbol}`);
    
    // Create debate record
    const debate = await prisma.swarmDebate.create({
      data: {
        symbol: opportunity.symbol,
        triggerReason: opportunity.triggerReason,
        currentPrice: opportunity.currentPrice,
        priceChange24h: opportunity.priceChange24h,
        volume24h: opportunity.volume24h,
        marketData: opportunity.marketData,
        status: DebateStatus.IN_PROGRESS,
      },
    });

    console.log(`✅ Debate created: ${debate.id}`);
    
    // Start debate flow (async)
    this.conductDebate(debate.id).catch(err => {
      console.error(`❌ Error in debate ${debate.id}:`, err);
    });

    return debate.id;
  }

  /**
   * Conduct the debate: get agent analyses, collect votes, reach consensus
   */
  private async conductDebate(debateId: string) {
    try {
      const debate = await prisma.swarmDebate.findUnique({
        where: { id: debateId },
      });

      if (!debate) {
        throw new Error(`Debate ${debateId} not found`);
      }

      console.log(`\n💭 Starting debate for ${debate.symbol}`);
      console.log(`   Current Price: $${debate.currentPrice}`);
      console.log(`   24h Change: ${debate.priceChange24h.toFixed(2)}%`);
      console.log(`   Trigger: ${debate.triggerReason}\n`);

      // Phase 1: Get all active swarm agents
      const agents = await prisma.swarmAgent.findMany({
        where: { isActive: true },
        orderBy: { role: 'asc' },
      });

      console.log(`👥 ${agents.length} agents participating\n`);

      // Phase 2: Collect agent analyses
      const analyses: AgentAnalysis[] = [];
      
      for (const agent of agents) {
        console.log(`🤖 ${agent.name} (${agent.role}) analyzing...`);
        
        try {
          const analysis = await this.getAgentAnalysis(agent, debate);
          analyses.push(analysis);
          
          // Save agent message to debate
          await prisma.swarmDebateMessage.create({
            data: {
              debateId: debate.id,
              agentId: agent.id,
              message: analysis.message,
              sentiment: analysis.sentiment,
              confidence: analysis.confidence,
              reasoning: analysis.reasoning,
              recommendation: analysis.recommendation,
              suggestedPrice: analysis.suggestedPrice,
              suggestedSize: analysis.suggestedSize,
              stopLoss: analysis.stopLoss,
              takeProfit: analysis.takeProfit,
            },
          });

          console.log(`   → ${analysis.recommendation} (${analysis.confidence}% confidence)`);
          console.log(`   "${analysis.message.substring(0, 80)}..."\n`);
          
        } catch (err) {
          console.error(`   ⚠️  ${agent.name} analysis failed:`, err);
        }
      }

      // Phase 3: Update debate status to voting
      await prisma.swarmDebate.update({
        where: { id: debateId },
        data: { status: DebateStatus.VOTING },
      });

      // Phase 4: Collect votes from agents
      console.log(`\n🗳️  Collecting votes...\n`);
      
      for (const analysis of analyses) {
        await prisma.swarmVote.create({
          data: {
            debateId: debate.id,
            agentId: analysis.agentId,
            decision: analysis.recommendation,
            confidence: analysis.confidence,
            weight: (await prisma.swarmAgent.findUnique({
              where: { id: analysis.agentId }
            }))?.votingWeight || 1.0,
            reasoning: analysis.message,
          },
        });

        console.log(`   ${analysis.agentName}: ${analysis.recommendation} (weight: ${(await prisma.swarmAgent.findUnique({
          where: { id: analysis.agentId }
        }))?.votingWeight})`);
      }

      // Phase 5: Calculate consensus
      const decision = await this.calculateConsensus(debateId);

      // Phase 6: Complete debate
      const completedAt = new Date();
      const duration = Math.floor((completedAt.getTime() - debate.startedAt.getTime()) / 1000);

      await prisma.swarmDebate.update({
        where: { id: debateId },
        data: {
          status: DebateStatus.COMPLETED,
          completedAt,
          duration,
          consensusReached: decision.confidence >= 60, // 60% threshold
          finalDecision: decision.action,
          confidence: decision.confidence,
        },
      });

      console.log(`\n✅ Debate completed in ${duration}s`);
      console.log(`   Final Decision: ${decision.action}`);
      console.log(`   Consensus: ${decision.confidence.toFixed(1)}%`);
      console.log(`   Vote Breakdown: BUY(${decision.buyVotes}) SELL(${decision.sellVotes}) HOLD(${decision.holdVotes}) PASS(${decision.passVotes})\n`);

      // Phase 7: Execute trade if consensus reached
      if (decision.confidence >= 60 && (decision.action === 'BUY' || decision.action === 'SELL')) {
        await this.executeSwarmTrade(debateId, decision);
      }

    } catch (error) {
      console.error(`❌ Fatal error in debate ${debateId}:`, error);
      await prisma.swarmDebate.update({
        where: { id: debateId },
        data: { status: DebateStatus.CANCELLED },
      });
    }
  }

  /**
   * Get analysis from a specific agent based on their role and expertise
   */
  private async getAgentAnalysis(agent: any, debate: any): Promise<AgentAnalysis> {
    const rolePrompts: Record<SwarmRole, string> = {
      RISK_ASSESSOR: `You are ${agent.name}, a Risk Assessor. Analyze ${debate.symbol} from a risk management perspective. Consider volatility, potential drawdowns, position sizing, and risk/reward ratios. Be conservative and highlight dangers.`,
      
      MOMENTUM_TRADER: `You are ${agent.name}, a Momentum Trader. Analyze ${debate.symbol} for momentum signals. Look for breakouts, volume patterns, and trend strength. Be aggressive when you see strong momentum.`,
      
      MEAN_REVERSION: `You are ${agent.name}, a Mean Reversion specialist. Analyze ${debate.symbol} for overbought/oversold conditions. Identify support/resistance levels and potential reversals.`,
      
      SENTIMENT_ANALYZER: `You are ${agent.name}, a Sentiment Analyzer. Assess ${debate.symbol}'s market sentiment, social media buzz, whale activity, and crowd psychology. Read between the lines.`,
      
      TECHNICAL_ANALYST: `You are ${agent.name}, a Technical Analyst. Perform chart analysis on ${debate.symbol}. Identify patterns, key levels, and indicator signals. Be methodical and precise.`,
      
      FUNDAMENTAL_ANALYST: `You are ${agent.name}, a Fundamental Analyst. Evaluate ${debate.symbol}'s fundamentals, project viability, team, tokenomics, and long-term prospects.`,
      
      VOLATILITY_SPECIALIST: `You are ${agent.name}, a Volatility Specialist. Analyze ${debate.symbol}'s volatility dynamics, option flows, and volatility arbitrage opportunities.`,
    };

    const systemPrompt = rolePrompts[agent.role as SwarmRole] || `You are ${agent.name}. Analyze ${debate.symbol}.`;
    
    const userPrompt = `
Market Context:
- Symbol: ${debate.symbol}
- Current Price: $${debate.currentPrice}
- 24h Change: ${debate.priceChange24h.toFixed(2)}%
- 24h Volume: $${(debate.volume24h / 1000000).toFixed(2)}M
- Trigger: ${debate.triggerReason}

Provide your analysis as an expert ${agent.role} with the following structure:
{
  "message": "Your concise argument (2-3 sentences max)",
  "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
  "recommendation": "BUY" | "SELL" | "HOLD" | "PASS",
  "confidence": <0-100>,
  "reasoning": {
    "keyPoints": ["point1", "point2", "point3"],
    "dataSupport": "What data supports your view",
    "concerns": "What are the risks"
  },
  "suggestedPrice": <entry price if BUY/SELL, null otherwise>,
  "suggestedSize": <position size % of portfolio>,
  "stopLoss": <stop loss price if applicable>,
  "takeProfit": <take profit price if applicable>
}

Be specific, actionable, and stay true to your role as ${agent.role}.
`;

    try {
      const aiResponse = await generateAIAnalysis(
        systemPrompt,
        userPrompt,
        agent.aiProvider as AIProvider
      );

      // Parse AI response
      const analysis = this.parseAIResponse(aiResponse, agent);
      
      return {
        agentId: agent.id,
        agentName: agent.name,
        role: agent.role,
        ...analysis,
      };

    } catch (error) {
      console.error(`Error getting analysis from ${agent.name}:`, error);
      
      // Fallback: neutral stance
      return {
        agentId: agent.id,
        agentName: agent.name,
        role: agent.role,
        message: `Unable to analyze due to error. Recommending PASS.`,
        sentiment: 'NEUTRAL',
        confidence: 0,
        recommendation: 'PASS',
        reasoning: { error: 'Analysis failed' },
      };
    }
  }

  /**
   * Parse AI response and extract structured analysis
   */
  private parseAIResponse(aiResponse: string, agent: any): Omit<AgentAnalysis, 'agentId' | 'agentName' | 'role'> {
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          message: parsed.message || 'No message provided',
          sentiment: parsed.sentiment || 'NEUTRAL',
          confidence: parsed.confidence || 50,
          recommendation: parsed.recommendation || 'HOLD',
          reasoning: parsed.reasoning || {},
          suggestedPrice: parsed.suggestedPrice,
          suggestedSize: parsed.suggestedSize,
          stopLoss: parsed.stopLoss,
          takeProfit: parsed.takeProfit,
        };
      }
    } catch (err) {
      console.error(`Failed to parse AI response for ${agent.name}:`, err);
    }

    // Fallback: extract basic sentiment from text
    const lowerResponse = aiResponse.toLowerCase();
    let sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    let recommendation: 'BUY' | 'SELL' | 'HOLD' | 'PASS' = 'HOLD';

    if (lowerResponse.includes('buy') || lowerResponse.includes('bullish')) {
      sentiment = 'BULLISH';
      recommendation = 'BUY';
    } else if (lowerResponse.includes('sell') || lowerResponse.includes('bearish')) {
      sentiment = 'BEARISH';
      recommendation = 'SELL';
    }

    return {
      message: aiResponse.substring(0, 500),
      sentiment,
      confidence: 50,
      recommendation,
      reasoning: { rawResponse: aiResponse },
    };
  }

  /**
   * Calculate weighted consensus from all votes
   */
  private async calculateConsensus(debateId: string) {
    const votes = await prisma.swarmVote.findMany({
      where: { debateId },
      include: { agent: true },
    });

    let buyScore = 0;
    let sellScore = 0;
    let holdScore = 0;
    let passScore = 0;
    let totalWeight = 0;

    let buyVotes = 0;
    let sellVotes = 0;
    let holdVotes = 0;
    let passVotes = 0;

    for (const vote of votes) {
      const weightedConfidence = (vote.confidence / 100) * vote.weight;
      totalWeight += vote.weight;

      switch (vote.decision) {
        case 'BUY':
          buyScore += weightedConfidence;
          buyVotes++;
          break;
        case 'SELL':
          sellScore += weightedConfidence;
          sellVotes++;
          break;
        case 'HOLD':
          holdScore += weightedConfidence;
          holdVotes++;
          break;
        case 'PASS':
          passScore += weightedConfidence;
          passVotes++;
          break;
      }
    }

    // Determine winner
    const scores = { BUY: buyScore, SELL: sellScore, HOLD: holdScore, PASS: passScore };
    const action = Object.keys(scores).reduce((a, b) => scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b) as string;
    const confidence = (scores[action as keyof typeof scores] / totalWeight) * 100;

    // Calculate average suggested trade parameters from votes that match winning action
    const winningVotes = votes.filter(v => v.decision === action);
    const messages = await prisma.swarmDebateMessage.findMany({
      where: {
        debateId,
        agentId: { in: winningVotes.map(v => v.agentId) },
      },
    });

    const suggestedPrices = messages.map(m => m.suggestedPrice).filter(Boolean) as number[];
    const suggestedSizes = messages.map(m => m.suggestedSize).filter(Boolean) as number[];
    const stopLosses = messages.map(m => m.stopLoss).filter(Boolean) as number[];
    const takeProfits = messages.map(m => m.takeProfit).filter(Boolean) as number[];

    const decision = await prisma.swarmDecision.create({
      data: {
        debateId,
        action,
        confidence,
        totalVotes: votes.length,
        buyVotes,
        sellVotes,
        holdVotes,
        passVotes,
        buyScore,
        sellScore,
        holdScore,
        passScore,
        suggestedPrice: suggestedPrices.length > 0 
          ? suggestedPrices.reduce((a, b) => a + b, 0) / suggestedPrices.length
          : undefined,
        suggestedSize: suggestedSizes.length > 0
          ? suggestedSizes.reduce((a, b) => a + b, 0) / suggestedSizes.length
          : undefined,
        stopLoss: stopLosses.length > 0
          ? stopLosses.reduce((a, b) => a + b, 0) / stopLosses.length
          : undefined,
        takeProfit: takeProfits.length > 0
          ? takeProfits.reduce((a, b) => a + b, 0) / takeProfits.length
          : undefined,
      },
    });

    return decision;
  }

  /**
   * Select optimal trading venue based on trade characteristics
   */
  private selectTradingVenue(
    symbol: string,
    action: 'BUY' | 'SELL',
    suggestedSize?: number
  ): VenueSelection {
    // Check for Solana tokens (SOL, USDC on Solana, etc.)
    const solanaTokens = ['SOL', 'BONK', 'JUP', 'PYTH', 'RAY', 'ORCA'];
    if (solanaTokens.includes(symbol)) {
      return {
        venue: 'JUPITER',
        reason: 'Solana native token - Jupiter DEX provides best liquidity',
        chain: 'solana',
      };
    }

    // Check for perpetual futures symbols (ending in USDT)
    if (symbol.endsWith('USDT')) {
      // Use AsterDEX for leveraged perpetual trading
      const leverage = suggestedSize && suggestedSize > 20 ? 10 : 5;
      return {
        venue: 'ASTERDEX',
        reason: 'Perpetual futures with leverage for enhanced returns',
        leverage,
      };
    }

    // Default to 1inch for EVM spot trading
    // 1inch automatically routes to best DEX (Uniswap, Curve, Balancer, etc.)
    return {
      venue: 'ONEINCH',
      reason: '1inch aggregates best prices across multiple DEXs',
      chain: 'base', // Default to Base for lower fees
    };
  }

  /**
   * Execute trade based on swarm consensus
   */
  private async executeSwarmTrade(debateId: string, decision: any) {
    console.log(`\n🚀 Executing swarm trade based on consensus...`);
    console.log(`   Action: ${decision.action}`);
    console.log(`   Confidence: ${decision.confidence.toFixed(1)}%`);
    console.log(`   Position Size: ${decision.suggestedSize?.toFixed(2) || 'N/A'}%`);
    console.log(`   Entry Price: $${decision.suggestedPrice?.toFixed(2) || 'Market'}`);

    try {
      // Get debate details
      const debate = await prisma.swarmDebate.findUnique({
        where: { id: debateId },
      });

      if (!debate) {
        throw new Error(`Debate ${debateId} not found`);
      }

      // Select optimal trading venue
      const venueSelection = this.selectTradingVenue(
        debate.symbol,
        decision.action,
        decision.suggestedSize
      );

      console.log(`\n📍 Selected venue: ${venueSelection.venue}`);
      console.log(`   Reason: ${venueSelection.reason}`);
      if (venueSelection.leverage) {
        console.log(`   Leverage: ${venueSelection.leverage}x`);
      }

      // Get or create swarm agent
      let swarmAgent = await prisma.aIAgent.findFirst({
        where: { name: 'Swarm Consensus Agent' },
      });

      if (!swarmAgent) {
        // Create swarm agent if it doesn't exist
        console.log(`\n⚠️  Swarm agent not found. Please ensure at least one agent exists.`);
        console.log(`   Skipping trade execution for now.\n`);
        return;
      }

      // Calculate USD amount based on agent balance and suggested size
      const agentBalance = parseFloat(swarmAgent.realBalance?.toString() || '100');
      const positionSizePercent = decision.suggestedSize || 5; // Default 5%
      const usdAmount = (agentBalance * positionSizePercent) / 100;

      console.log(`\n💰 Trade allocation:`);
      console.log(`   Agent: ${swarmAgent.name}`);
      console.log(`   Balance: $${agentBalance.toFixed(2)}`);
      console.log(`   Position size: ${positionSizePercent}%`);
      console.log(`   USD amount: $${usdAmount.toFixed(2)}`);

      // Execute trade based on selected venue
      let tradeResult;
      let executionDetails = '';

      if (venueSelection.venue === 'ASTERDEX') {
        // Execute AsterDEX perpetual futures trade
        console.log(`\n📈 Executing AsterDEX perpetual trade...`);
        
        try {
          const quantity = usdAmount / debate.currentPrice;
          const orderResult = await AsterDex.placeOrder({
            symbol: debate.symbol,
            side: decision.action,
            type: 'MARKET',
            quantity,
          });

          tradeResult = {
            success: true,
            txHash: orderResult.orderId,
            executedPrice: parseFloat(orderResult.price),
            executedQuantity: parseFloat(orderResult.executedQty),
          };

          executionDetails = `AsterDEX Order ID: ${orderResult.orderId}`;
          console.log(`✅ AsterDEX order executed: ${orderResult.orderId}`);
        } catch (error) {
          console.error(`❌ AsterDEX execution failed:`, error);
          tradeResult = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }

      } else if (venueSelection.venue === 'JUPITER') {
        // Execute Jupiter (Solana) trade
        console.log(`\n🔮 Executing Jupiter (Solana) trade...`);
        
        tradeResult = await executeSolanaRealTrade(
          swarmAgent,
          debate.symbol,
          decision.action,
          usdAmount,
          debate.currentPrice
        );

        executionDetails = tradeResult.txHash
          ? `Solana TX: ${tradeResult.txHash.slice(0, 8)}...`
          : 'Jupiter trade';

      } else {
        // Execute 1inch (EVM) spot trade
        console.log(`\n💎 Executing 1inch spot trade...`);
        
        tradeResult = await executeRealTrade(
          swarmAgent,
          debate.symbol,
          decision.action,
          usdAmount,
          debate.currentPrice
        );

        executionDetails = tradeResult.txHash
          ? `TX: ${tradeResult.txHash.slice(0, 8)}...`
          : '1inch trade';
      }

      // Log trade result
      if (tradeResult.success) {
        console.log(`\n✅ Trade executed successfully!`);
        console.log(`   ${executionDetails}`);
        console.log(`   Amount: $${usdAmount.toFixed(2)}`);
        console.log(`   Price: $${debate.currentPrice.toFixed(2)}\n`);

        // Record trade in database
        await prisma.trade.create({
          data: {
            agentId: swarmAgent.id,
            symbol: debate.symbol,
            type: venueSelection.venue === 'ASTERDEX' ? 'PERPETUAL' : 'SPOT',
            side: decision.action,
            quantity: usdAmount / debate.currentPrice,
            entryPrice: debate.currentPrice,
            usdValue: usdAmount,
            status: 'OPEN', // Trade is opened, will be closed when position is exited
            isRealTrade: true,
            txHash: tradeResult.txHash,
            executionVenue: venueSelection.venue,
            swarmDebateId: debateId,
            confidence: decision.confidence,
            leverage: venueSelection.leverage,
          },
        });

        // Update agent balance (deduct trade amount from realBalance)
        await prisma.aIAgent.update({
          where: { id: swarmAgent.id },
          data: {
            realBalance: {
              decrement: usdAmount,
            },
            totalTrades: {
              increment: 1,
            },
          },
        });

      } else {
        console.error(`\n❌ Trade execution failed:`);
        console.error(`   ${tradeResult.error}\n`);

        // Log failed trade attempt
        await prisma.trade.create({
          data: {
            agentId: swarmAgent.id,
            symbol: debate.symbol,
            type: venueSelection.venue === 'ASTERDEX' ? 'PERPETUAL' : 'SPOT',
            side: decision.action,
            quantity: 0,
            entryPrice: debate.currentPrice,
            usdValue: 0,
            status: 'CANCELLED', // Trade cancelled due to execution failure
            isRealTrade: false,
            errorMessage: tradeResult.error,
            swarmDebateId: debateId,
            executionVenue: venueSelection.venue,
          },
        });
      }

    } catch (error) {
      console.error(`\n❌ Fatal error executing swarm trade:`, error);
      
      // Log error to database
      try {
        await prisma.swarmDebate.update({
          where: { id: debateId },
          data: {
            status: 'CANCELLED', // Debate cancelled due to execution error
            marketData: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          },
        });
      } catch (dbError) {
        console.error(`Failed to log error to database:`, dbError);
      }
    }

    // Mark decision as executed
    await prisma.swarmDecision.update({
      where: { id: decision.id },
      data: {
        executed: true,
        executedAt: new Date(),
      },
    });
  }

  /**
   * Monitor market for trading opportunities and trigger debates
   */
  async monitorAndTrigger() {
    console.log('👀 Monitoring markets for trading opportunities...\n');
    
    // TODO: Integrate with market data feeds
    // For now, this is a placeholder that would:
    // 1. Monitor price movements, volume spikes, sentiment changes
    // 2. Identify potential opportunities
    // 3. Trigger debates when conditions are met
    
    console.log('⚠️  Market monitoring integration pending');
  }
}

// Export singleton instance
export const swarmOrchestrator = new SwarmOrchestrator();
