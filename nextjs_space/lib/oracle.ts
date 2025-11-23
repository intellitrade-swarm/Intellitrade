
/**
 * Defidash Intellitrade Oracle Service
 * Provides comprehensive market data, AI insights, and trading signals for agents
 */

import { callAI, AIProvider } from './ai-providers';
import { getCurrentPrice } from './oneinch';
import { prisma } from './db';

export interface OracleDataPoint {
  id: string;
  symbol: string;
  price: number;
  volume24h: number;
  priceChange24h: number;
  marketCap?: number;
  liquidity?: number;
  timestamp: Date;
  source: 'dexscreener' | '1inch' | 'coingecko' | 'ai_analysis';
}

export interface OracleAIInsight {
  id: string;
  symbol: string;
  provider: AIProvider;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  analysis: string;
  targetPrice?: number;
  stopLoss?: number;
  timestamp: Date;
}

export interface OracleSignal {
  id: string;
  symbol: string;
  signal: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  aiInsights: number; // Count of AI insights supporting this signal
  marketData: OracleDataPoint;
  reasoning: string;
  timestamp: Date;
}

/**
 * Fetch real-time market data from multiple sources
 */
export async function fetchOracleMarketData(symbols: string[]): Promise<OracleDataPoint[]> {
  const dataPoints: OracleDataPoint[] = [];
  
  for (const symbol of symbols) {
    try {
      // Fetch from DexScreener
      const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${symbol}`);
      if (dexResponse.ok) {
        const dexData = await dexResponse.json();
        const pair = dexData.pairs?.[0];
        
        if (pair) {
          dataPoints.push({
            id: `${symbol}-${Date.now()}`,
            symbol: pair.baseToken?.symbol || symbol,
            price: parseFloat(pair.priceUsd || '0'),
            volume24h: parseFloat(pair.volume?.h24 || '0'),
            priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
            liquidity: parseFloat(pair.liquidity?.usd || '0'),
            timestamp: new Date(),
            source: 'dexscreener'
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching market data for ${symbol}:`, error);
    }
  }
  
  return dataPoints;
}

/**
 * Generate AI insights using multiple providers
 */
export async function generateAIInsights(
  symbol: string,
  marketData: OracleDataPoint,
  providers: AIProvider[] = ['OPENAI', 'GROK', 'NVIDIA', 'GEMINI']
): Promise<OracleAIInsight[]> {
  const insights: OracleAIInsight[] = [];
  
  const prompt = `Analyze ${symbol} trading data:
- Current Price: $${marketData.price}
- 24h Volume: $${marketData.volume24h.toLocaleString()}
- 24h Price Change: ${marketData.priceChange24h}%
- Liquidity: $${marketData.liquidity?.toLocaleString() || 'N/A'}

Provide:
1. Sentiment (BULLISH/BEARISH/NEUTRAL)
2. Confidence (0-1)
3. Recommendation (BUY/SELL/HOLD)
4. Brief analysis (2-3 sentences)
5. Optional target price
6. Optional stop loss

Respond in JSON format:
{
  "sentiment": "BULLISH|BEARISH|NEUTRAL",
  "confidence": 0.85,
  "recommendation": "BUY|SELL|HOLD",
  "analysis": "Your analysis here",
  "targetPrice": 1.25,
  "stopLoss": 0.95
}`;

  for (const provider of providers) {
    try {
      const response = await callAI(
        provider,
        [
          { role: 'system', content: 'You are an expert crypto trading analyst. Always respond in valid JSON format.' },
          { role: 'user', content: prompt }
        ],
        0.7,
        1000
      );
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        
        insights.push({
          id: `${symbol}-${provider}-${Date.now()}`,
          symbol,
          provider,
          sentiment: analysis.sentiment,
          confidence: analysis.confidence,
          recommendation: analysis.recommendation,
          analysis: analysis.analysis,
          targetPrice: analysis.targetPrice,
          stopLoss: analysis.stopLoss,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error(`Error generating AI insight from ${provider}:`, error);
    }
  }
  
  return insights;
}

/**
 * Aggregate insights into trading signals
 */
export function aggregateIntoSignals(
  marketData: OracleDataPoint,
  insights: OracleAIInsight[]
): OracleSignal {
  // Calculate weighted sentiment
  let bullishCount = 0;
  let bearishCount = 0;
  let totalConfidence = 0;
  
  insights.forEach(insight => {
    if (insight.sentiment === 'BULLISH') bullishCount++;
    if (insight.sentiment === 'BEARISH') bearishCount++;
    totalConfidence += insight.confidence;
  });
  
  const avgConfidence = insights.length > 0 ? totalConfidence / insights.length : 0;
  const bullishRatio = insights.length > 0 ? bullishCount / insights.length : 0;
  
  // Determine signal strength
  let signal: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  if (bullishRatio >= 0.75 && avgConfidence >= 0.7) {
    signal = 'STRONG_BUY';
  } else if (bullishRatio >= 0.6) {
    signal = 'BUY';
  } else if (bullishRatio <= 0.25 && avgConfidence >= 0.7) {
    signal = 'STRONG_SELL';
  } else if (bullishRatio <= 0.4) {
    signal = 'SELL';
  } else {
    signal = 'HOLD';
  }
  
  // Generate reasoning
  const reasoning = `${insights.length} AI providers analyzed. ${bullishCount} bullish, ${bearishCount} bearish. Average confidence: ${(avgConfidence * 100).toFixed(1)}%. Market shows ${marketData.priceChange24h > 0 ? 'positive' : 'negative'} momentum (${marketData.priceChange24h.toFixed(2)}% 24h).`;
  
  return {
    id: `signal-${marketData.symbol}-${Date.now()}`,
    symbol: marketData.symbol,
    signal,
    confidence: avgConfidence,
    aiInsights: insights.length,
    marketData,
    reasoning,
    timestamp: new Date()
  };
}

/**
 * Get comprehensive oracle data for a symbol
 */
export async function getOracleData(symbol: string): Promise<{
  marketData: OracleDataPoint | null;
  insights: OracleAIInsight[];
  signal: OracleSignal | null;
}> {
  const marketData = await fetchOracleMarketData([symbol]);
  if (marketData.length === 0) {
    return { marketData: null, insights: [], signal: null };
  }
  
  const data = marketData[0];
  const insights = await generateAIInsights(symbol, data);
  const signal = aggregateIntoSignals(data, insights);
  
  return {
    marketData: data,
    insights,
    signal
  };
}

/**
 * Get oracle statistics
 */
export async function getOracleStats(): Promise<{
  totalDataPoints: number;
  totalInsights: number;
  totalSignals: number;
  activeSymbols: number;
  aiProviders: number;
}> {
  // In production, this would query a database
  // For now, return mock stats
  return {
    totalDataPoints: 1247,
    totalInsights: 3891,
    totalSignals: 524,
    activeSymbols: 156,
    aiProviders: 4
  };
}
