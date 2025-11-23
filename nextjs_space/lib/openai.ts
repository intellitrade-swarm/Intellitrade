
interface OpenAIConfig {
  apiKey: string;
}

function getOpenAIConfig(): OpenAIConfig {
  // Use environment variable for API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set OPENAI_API_KEY environment variable.');
  }
  return { apiKey };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callOpenAI(messages: ChatMessage[], temperature = 0.7, maxTokens = 500) {
  const config = getOpenAIConfig();
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// AI Trading Decision
export async function getAITradingDecision(
  agentData: {
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
  }[]
) {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are ${agentData.name}, an AI trading agent with a ${agentData.strategyType} strategy. Your personality: ${agentData.personality}. You analyze market data and make trading decisions.`
    },
    {
      role: 'user',
      content: `Current Status:
- Balance: $${agentData.currentBalance.toFixed(2)}
- Win Rate: ${(agentData.winRate * 100).toFixed(2)}%
- Sharpe Ratio: ${agentData.sharpeRatio.toFixed(2)}

Market Data:
${marketData.map(m => `- ${m.symbol}: $${m.price.toFixed(2)} (${m.priceChange > 0 ? '+' : ''}${m.priceChange.toFixed(2)}%)`).join('\n')}

Based on your ${agentData.strategyType} strategy, should you:
1. BUY a specific coin (which one and why?)
2. SELL your holdings (which one and why?)
3. HOLD (wait for better opportunity)

Respond in JSON format:
{
  "action": "BUY" | "SELL" | "HOLD",
  "symbol": "BTC" | "ETH" | etc.,
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "quantity": suggested trade size as percentage of balance (0-1)
}`
    }
  ];

  const response = await callOpenAI(messages, 0.7, 300);
  
  try {
    // Extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Error parsing AI trading decision:', e);
  }
  
  // Fallback decision
  return {
    action: 'HOLD',
    symbol: 'BTC',
    confidence: 0.5,
    reasoning: 'Unable to parse AI decision, holding position',
    quantity: 0
  };
}

// AI Strategy Explanation
export async function explainStrategy(
  query: string,
  context: {
    agents?: any[];
    marketData?: any[];
    recentTrades?: any[];
  }
) {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an AI assistant for Intellitrade, an advanced AI-powered autonomous trading platform. You explain trading strategies, analyze agent performance, and help users understand the intelligent trading system. Be concise, helpful, and engaging.`
    },
    {
      role: 'user',
      content: `User Question: ${query}

${context.agents ? `Active Agents:
${context.agents.map(a => `- ${a.name}: ${a.strategyType} strategy, ${(a.winRate * 100).toFixed(1)}% win rate, $${a.currentBalance.toFixed(2)} balance`).join('\n')}` : ''}

${context.marketData ? `Current Market:
${context.marketData.map(m => `- ${m.symbol}: $${m.price.toFixed(2)} (${m.priceChange > 0 ? '+' : ''}${m.priceChange.toFixed(2)}%)`).join('\n')}` : ''}

${context.recentTrades ? `Recent Trades:
${context.recentTrades.slice(0, 3).map(t => `- ${t.agent?.name}: ${t.side} ${t.symbol} at $${t.entryPrice.toFixed(2)}`).join('\n')}` : ''}

Please answer the user's question based on this context.`
    }
  ];

  return await callOpenAI(messages, 0.8, 500);
}

// AI Evolution Strategy
export async function generateEvolutionStrategy(
  topAgents: {
    name: string;
    strategyType: string;
    parameters: any;
    totalProfitLoss: number;
    sharpeRatio: number;
    winRate: number;
  }[],
  bottomAgents: {
    name: string;
    strategyType: string;
    parameters: any;
    totalProfitLoss: number;
    sharpeRatio: number;
    winRate: number;
  }[]
) {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an evolutionary algorithm designer for AI trading agents. You analyze performance data and suggest mutations and crossover strategies to improve agent performance.`
    },
    {
      role: 'user',
      content: `Top Performing Agents:
${topAgents.map(a => `- ${a.name} (${a.strategyType}): P/L $${a.totalProfitLoss.toFixed(2)}, Sharpe ${a.sharpeRatio.toFixed(2)}, Win Rate ${(a.winRate * 100).toFixed(1)}%
  Parameters: ${JSON.stringify(a.parameters)}`).join('\n\n')}

Bottom Performing Agents:
${bottomAgents.map(a => `- ${a.name} (${a.strategyType}): P/L $${a.totalProfitLoss.toFixed(2)}, Sharpe ${a.sharpeRatio.toFixed(2)}, Win Rate ${(a.winRate * 100).toFixed(1)}%
  Parameters: ${JSON.stringify(a.parameters)}`).join('\n\n')}

Suggest evolution strategies:
1. Which parameters from top agents should be preserved?
2. What mutations should be applied to bottom agents?
3. Should we breed top agents (crossover)?
4. Any new strategy types to introduce?

Respond in JSON format:
{
  "mutations": [
    {
      "agentName": "agent name",
      "parameterChanges": { "param": "new value" },
      "reasoning": "why this mutation"
    }
  ],
  "crossovers": [
    {
      "parent1": "agent name",
      "parent2": "agent name",
      "inheritedTraits": "description",
      "reasoning": "why breed these agents"
    }
  ],
  "insights": "key insights about what makes agents successful"
}`
    }
  ];

  const response = await callOpenAI(messages, 0.8, 800);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Error parsing AI evolution strategy:', e);
  }
  
  return {
    mutations: [],
    crossovers: [],
    insights: 'Unable to generate evolution strategy at this time'
  };
}
