
/**
 * AI-Powered Trading Engine
 * Analyzes market conditions using AI and executes intelligent trades
 * Supports multiple AI providers: OpenAI GPT-4, Google Gemini Pro, and NVIDIA
 * Now powered by 1inch DEX Aggregator for real on-chain trading
 * Enhanced with Full-Scale Oracle for comprehensive market data
 */

import { callAI, AIMessage, AIProvider } from './ai-providers';
import { prisma } from './db';
import { executeOneInchTrade, getOneInchBalance } from './trading';
import { getCurrentPrice } from './oneinch';
import { cleanNVIDIAResponse } from './nvidia-response-cleaner';
import { fullScaleOracle } from './full-scale-oracle';
import defiLlama from './defillama';
import theGraph from './the-graph';

interface MarketAnalysis {
  topOpportunities: {
    symbol: string;
    action: 'BUY' | 'SELL';
    confidence: number;
    reasoning: string;
    targetPrice: number;
    stopLoss: number;
    riskReward: number;
  }[];
  marketSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  volatility: 'HIGH' | 'MEDIUM' | 'LOW';
  insights: string;
}

interface TradingSignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  quantity: number;
  targetProfit: number;
}

/**
 * Fetch trending/boosted tokens from DexScreener
 * These are tokens with active community interest and real DEX trading activity
 */
async function fetchDexScreenerTrendingTokens(): Promise<any[]> {
  try {
    // Fetch latest boosted tokens (indicates community interest and activity)
    const response = await fetch('https://api.dexscreener.com/token-boosts/latest/v1', {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`✅ Fetched ${data.length || 0} trending tokens from DexScreener`);
    return data || [];
  } catch (error) {
    console.error('Error fetching DexScreener trending tokens:', error);
    return [];
  }
}

/**
 * Fetch detailed trading data for a token from DexScreener
 */
async function fetchDexScreenerTokenData(symbol: string): Promise<any | null> {
  try {
    // Search for the token across all DEXes
    const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${symbol}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Get the most liquid pair (usually the most reliable)
    const pairs = data.pairs || [];
    if (pairs.length === 0) {
      return null;
    }
    
    // Sort by liquidity and volume to get the best pair
    // NO LIQUIDITY FILTER - agents can trade tokens at ANY price, even $0.0000001
    const sortedPairs = pairs
      .sort((a: any, b: any) => {
        const aScore = (a.liquidity?.usd || 0) + (a.volume?.h24 || 0);
        const bScore = (b.liquidity?.usd || 0) + (b.volume?.h24 || 0);
        return bScore - aScore;
      });

    if (sortedPairs.length === 0) {
      return null;
    }

    const bestPair = sortedPairs[0];
    
    return {
      symbol,
      price: parseFloat(bestPair.priceUsd || '0'),
      change24h: parseFloat(bestPair.priceChange?.h24 || '0'),
      volume: bestPair.volume?.h24 || 0,
      liquidity: bestPair.liquidity?.usd || 0,
      txns24h: (bestPair.txns?.h24?.buys || 0) + (bestPair.txns?.h24?.sells || 0),
      buys24h: bestPair.txns?.h24?.buys || 0,
      sells24h: bestPair.txns?.h24?.sells || 0,
      marketCap: bestPair.marketCap || 0,
      fdv: bestPair.fdv || 0,
      pairAddress: bestPair.pairAddress,
      chainId: bestPair.chainId,
      dexId: bestPair.dexId,
      source: 'dexscreener'
    };
  } catch (error) {
    console.error(`Error fetching DexScreener data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch real-time market data from CoinGecko (free tier)
 */
async function fetchCoinGeckoData(): Promise<any[]> {
  try {
    // CoinGecko IDs mapping
    const coinGeckoIds = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'BNB': 'binancecoin',
      'XRP': 'ripple',
      'ADA': 'cardano',
      'DOGE': 'dogecoin',
      'MATIC': 'matic-network',
      'DOT': 'polkadot',
      'AVAX': 'avalanche-2',
      'RAY': 'raydium',
      'BONK': 'bonk',
      'JUP': 'jupiter-exchange-solana',
      'WIF': 'dogwifcoin'
    };

    const ids = Object.values(coinGeckoIds).join(',');
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Map CoinGecko data back to our symbol format
    const symbolMap: Record<string, string> = {};
    Object.entries(coinGeckoIds).forEach(([symbol, id]) => {
      symbolMap[id] = symbol;
    });

    return data.map((coin: any) => ({
      symbol: symbolMap[coin.id],
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      volume: coin.total_volume || 0,
      marketCap: coin.market_cap || 0,
      high24h: coin.high_24h || coin.current_price,
      low24h: coin.low_24h || coin.current_price
    })).filter((d: any) => d.symbol); // Filter out unmapped coins

  } catch (error) {
    console.error('Error fetching CoinGecko data:', error);
    return [];
  }
}

/**
 * Get market data for major cryptocurrencies
 * Uses BOTH CoinGecko (general market data) and DexScreener (DEX trading data)
 * for comprehensive market intelligence
 */
async function getMarketData(): Promise<any[]> {
  try {
    // Define tradeable symbols by chain
    const evmSymbols = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'MATIC', 'DOT', 'AVAX'];
    const solanaSymbols = ['SOL', 'RAY', 'BONK', 'JUP', 'WIF'];
    
    // Include BOTH EVM and Solana tokens so all agents have trading opportunities
    const symbols = [...evmSymbols, ...solanaSymbols];
    
    console.log('📊 Fetching market data from multiple sources...');
    
    // Fetch from both sources in parallel
    const [coinGeckoData, dexScreenerPromises] = await Promise.all([
      fetchCoinGeckoData(),
      Promise.all(symbols.map(symbol => fetchDexScreenerTokenData(symbol)))
    ]);
    
    // Create a map of DexScreener data by symbol
    const dexScreenerMap = new Map<string, any>();
    dexScreenerPromises.forEach(data => {
      if (data && data.symbol) {
        dexScreenerMap.set(data.symbol, data);
      }
    });
    
    // Combine data sources - prefer CoinGecko for price accuracy, enhance with DexScreener DEX data
    const combinedData = symbols.map(symbol => {
      const coinGecko = coinGeckoData.find(d => d.symbol === symbol);
      const dexScreener = dexScreenerMap.get(symbol);
      
      if (coinGecko && dexScreener) {
        // Both sources available - best case scenario!
        console.log(`✅ ${symbol}: Combined data from CoinGecko + DexScreener`);
        return {
          symbol,
          price: coinGecko.price, // CoinGecko price is more accurate
          change24h: coinGecko.change24h,
          volume: Math.max(coinGecko.volume, dexScreener.volume), // Use higher volume
          marketCap: coinGecko.marketCap || dexScreener.marketCap,
          high24h: coinGecko.high24h,
          low24h: coinGecko.low24h,
          // DexScreener-specific data (DEX trading intelligence)
          liquidity: dexScreener.liquidity,
          txns24h: dexScreener.txns24h,
          buys24h: dexScreener.buys24h,
          sells24h: dexScreener.sells24h,
          buyPressure: dexScreener.buys24h / Math.max(dexScreener.txns24h, 1), // Ratio of buys
          dexChain: dexScreener.chainId,
          dexName: dexScreener.dexId,
          source: 'combined'
        };
      } else if (coinGecko) {
        // Only CoinGecko data available
        console.log(`📈 ${symbol}: CoinGecko data only`);
        return {
          ...coinGecko,
          liquidity: 0,
          txns24h: 0,
          buys24h: 0,
          sells24h: 0,
          buyPressure: 0.5, // Neutral
          source: 'coingecko'
        };
      } else if (dexScreener) {
        // Only DexScreener data available
        console.log(`🔄 ${symbol}: DexScreener data only`);
        return {
          ...dexScreener,
          high24h: dexScreener.price * 1.03,
          low24h: dexScreener.price * 0.97,
          buyPressure: dexScreener.buys24h / Math.max(dexScreener.txns24h, 1),
          source: 'dexscreener'
        };
      }
      
      return null;
    }).filter(d => d !== null);
    
    if (combinedData.length > 0) {
      console.log(`✅ Market data ready: ${combinedData.length} assets with enhanced DEX intelligence`);
      console.log(`   - ${combinedData.filter(d => d.source === 'combined').length} with combined data`);
      console.log(`   - ${combinedData.filter(d => d.source === 'coingecko').length} from CoinGecko only`);
      console.log(`   - ${combinedData.filter(d => d.source === 'dexscreener').length} from DexScreener only`);
      return combinedData;
    }
    
    // Fallback to basic price fetching if both APIs fail
    console.warn('⚠️ All market data sources unavailable, using fallback...');
    const fallbackData = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const price = await getCurrentPrice(symbol);
          const randomChange = (Math.random() - 0.5) * 10;
          const randomVolume = Math.random() * 1000000000;
          
          return {
            symbol,
            price,
            change24h: randomChange,
            volume: randomVolume,
            marketCap: price * randomVolume * 100,
            high24h: price * 1.03,
            low24h: price * 0.97,
            liquidity: randomVolume * 0.1,
            txns24h: Math.floor(Math.random() * 10000),
            buys24h: Math.floor(Math.random() * 5000),
            sells24h: Math.floor(Math.random() * 5000),
            buyPressure: 0.5,
            source: 'fallback'
          };
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
          return null;
        }
      })
    );
    
    return fallbackData.filter(d => d !== null);
  } catch (error) {
    console.error('Error in getMarketData:', error);
    return [];
  }
}

/**
 * Fetch on-chain intelligence from The Graph
 * Provides deep liquidity insights, whale activity, and trading signals
 */
async function getOnChainIntelligence(chain: 'base' | 'ethereum' = 'base'): Promise<any> {
  try {
    console.log(`📊 Fetching on-chain intelligence from The Graph (${chain})...`);
    
    const [topPools, dexMetrics, opportunities, ethData] = await Promise.all([
      theGraph.getTopPools(15, chain),
      theGraph.getDEXMetrics(chain),
      theGraph.findTradingOpportunities(chain),
      // Also fetch Ethereum data for comparison
      chain === 'base' ? theGraph.getDEXMetrics('ethereum') : Promise.resolve(null)
    ]);

    // Extract key insights
    const liquidityHotspots = topPools.slice(0, 5).map((pool: any) => ({
      pair: `${pool.token0?.symbol || 'UNKNOWN'}/${pool.token1?.symbol || 'UNKNOWN'}`,
      liquidity: parseFloat(pool.totalValueLockedUSD || '0'),
      volume24h: parseFloat(pool.volumeUSD || '0'),
      txCount: parseInt(pool.txCount || '0'),
      volumeToLiquidity: parseFloat(pool.volumeUSD || '0') / Math.max(parseFloat(pool.totalValueLockedUSD || '1'), 1)
    }));

    const signals = opportunities.opportunities?.slice(0, 5).map((opp: any) => ({
      token: opp.token,
      signal: opp.signal,
      confidence: opp.confidence,
      metrics: opp.metrics
    })) || [];

    console.log('✅ On-chain intelligence fetched');
    console.log(`  • Top pools: ${liquidityHotspots.map((p: any) => p.pair).join(', ')}`);
    console.log(`  • Trading signals: ${signals.length} opportunities detected`);
    console.log(`  • Total DEX volume (${chain}): $${(dexMetrics?.volume24h || 0).toLocaleString()}`);

    return {
      chain,
      liquidityHotspots,
      dexMetrics,
      tradingSignals: signals,
      topPools: topPools.slice(0, 10),
      ethComparison: ethData ? {
        ethVolume: ethData.volume24h || 0,
        baseVolume: dexMetrics?.volume24h || 0,
        volumeRatio: (dexMetrics?.volume24h || 0) / Math.max(ethData.volume24h || 1, 1)
      } : null
    };
  } catch (error) {
    console.error('Error fetching on-chain intelligence:', error);
    return {
      chain,
      liquidityHotspots: [],
      dexMetrics: null,
      tradingSignals: [],
      topPools: [],
      ethComparison: null
    };
  }
}

/**
 * Analyze market conditions using AI
 */
export async function analyzeMarket(aiProvider: AIProvider = 'OPENAI'): Promise<MarketAnalysis> {
  let marketData: any[] = [];
  
  try {
    console.log('Fetching market data from price feeds...');
    
    marketData = await getMarketData();
    
    if (!marketData || marketData.length === 0) {
      throw new Error('No market data available');
    }

    console.log(`Analyzing ${marketData.length} crypto markets...`);

    // Fetch DeFiLlama market intelligence & The Graph on-chain data
    let defiLlamaData = {
      marketMomentum: null as any,
      baseChainHealth: null as any,
      tradingOpportunities: null as any,
    };
    
    let onChainData = {
      chain: 'base' as const,
      liquidityHotspots: [],
      dexMetrics: null as any,
      tradingSignals: [],
      topPools: [],
      ethComparison: null as any
    };
    
    try {
      console.log('📊 Fetching DeFiLlama & The Graph market intelligence...');
      const [momentum, chainHealth, opportunities, onChainIntel] = await Promise.all([
        defiLlama.getMarketMomentum().catch(() => null),
        defiLlama.getChainHealthScore('Base').catch(() => null),
        defiLlama.getTradingOpportunities('Base').catch(() => null),
        getOnChainIntelligence('base').catch(() => ({
          chain: 'base' as const,
          liquidityHotspots: [],
          dexMetrics: null,
          tradingSignals: [],
          topPools: [],
          ethComparison: null
        })),
      ]);
      
      defiLlamaData = {
        marketMomentum: momentum,
        baseChainHealth: chainHealth,
        tradingOpportunities: opportunities,
      };
      
      onChainData = onChainIntel;
      
      console.log('✅ DeFiLlama data fetched successfully');
      if (defiLlamaData.marketMomentum) {
        console.log(`  • Trending protocols: ${defiLlamaData.marketMomentum.trendingProtocols?.slice(0, 3).map((p: any) => `${p.name} (+${p.change_1d.toFixed(1)}%)`).join(', ')}`);
      }
      if (defiLlamaData.baseChainHealth) {
        console.log(`  • Base chain health: ${defiLlamaData.baseChainHealth.healthScore.toFixed(0)}/100 (${defiLlamaData.baseChainHealth.trend})`);
      }
      if (defiLlamaData.tradingOpportunities) {
        console.log(`  • Market sentiment: ${defiLlamaData.tradingOpportunities.marketSentiment}`);
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch DeFiLlama/Graph data, continuing without it:', error);
    }

    const marketSummary = marketData.map(ticker => ({
      symbol: ticker.symbol,
      price: ticker.price || 0,
      change24h: ticker.change24h || 0,
      volume: ticker.volume || 0,
      marketCap: ticker.marketCap || 0,
      high24h: ticker.high24h || ticker.price || 0,
      low24h: ticker.low24h || ticker.price || 0,
      // DEX trading intelligence from DexScreener
      liquidity: ticker.liquidity || 0,
      txns24h: ticker.txns24h || 0,
      buys24h: ticker.buys24h || 0,
      sells24h: ticker.sells24h || 0,
      buyPressure: ticker.buyPressure || 0.5,
      source: ticker.source || 'unknown'
    }));

    console.log(`Using ${aiProvider} for market analysis...`);
    console.log('Market data summary:', marketSummary.map(m => {
      const buyPressureLabel = m.buyPressure > 0.55 ? '🟢' : m.buyPressure < 0.45 ? '🔴' : '⚪';
      const price = m.price || 0;
      const change = m.change24h || 0;
      return `${m.symbol}: $${price.toLocaleString()} (${change > 0 ? '+' : ''}${change.toFixed(2)}%) ${buyPressureLabel}`;
    }).join(', '));

    // AI-powered market analysis
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an expert cryptocurrency trading analyst with deep knowledge of technical analysis, DEX trading patterns, DeFi protocol analysis, on-chain analysis, market psychology, and risk management. You analyze real-time market data from multiple sources:
1. Centralized exchanges (CoinGecko) - Price, volume, market cap
2. Decentralized exchanges (DexScreener) - DEX liquidity, buy/sell pressure, transaction counts
3. DeFiLlama - Protocol TVL trends, chain health, market sentiment, stablecoin flows
4. The Graph - On-chain DEX data, liquidity pools, whale activity, trading signals

Your analysis should consider:

📈 PRICE ACTION & TECHNICALS:
- Price momentum and trends (positive/negative % changes)
- Volume patterns (higher volume = stronger signals)
- Market volatility (24h high/low ranges)
- Support and resistance levels

🔄 DEX TRADING INTELLIGENCE:
- DEX liquidity levels (higher liquidity = more reliable trades)
- Buy/Sell pressure (ratio of buy vs sell transactions on DEX)
- Transaction activity (active trading indicates real market interest)

📊 DEFILLAMA PROTOCOL INTELLIGENCE (NEW):
- Trending protocols with TVL growth indicate capital inflows and bullish sentiment
- Protocol tokens from trending DeFi projects often outperform
- Chain health metrics indicate overall ecosystem strength
- Market sentiment (bullish/bearish/neutral) provides macro context
- Stablecoin market cap changes signal capital entering/leaving crypto
- Growing TVL = More capital locked = Stronger fundamentals

💡 HOW TO USE DEFILLAMA DATA:
- If a protocol has +10% TVL growth: Its token likely has bullish momentum
- If Base chain is "growing": Base-native tokens have tailwinds
- If stablecoin mcap is increasing: Capital is entering crypto (bullish)
- If market sentiment is "bullish": Be more aggressive with LONG positions
- If market sentiment is "bearish": Look for SHORT opportunities or reduce exposure

🔗 HOW TO USE THE GRAPH ON-CHAIN INTELLIGENCE:
- **High Volume/Liquidity Ratio (>2x)**: Active trading, strong price discovery, good opportunity
- **Deep Liquidity Pools (>$1M)**: Stable trading environment, lower slippage risk
- **On-Chain Trading Signals**: Algorithmic detection of opportunities (HIGH_VOLUME_RATIO, DEEP_LIQUIDITY, etc.)
- **Liquidity Hotspots**: Most active trading pairs on DEX - prioritize these for entry/exit
- **Base vs Ethereum Volume**: Compare relative chain activity - higher Base volume = Base chain momentum
- Combine on-chain liquidity data with price action for confirmation
- Tokens appearing in both "Top Liquidity Pools" and "On-Chain Trading Signals" are prime opportunities

🎯 TRADING RULES:
- Risk-reward ratios (minimum 2:1)
- Confidence threshold: > 65% for any trade
- Overall market sentiment from DeFiLlama guides aggression level

KEY STRATEGY - DEX TRADING INTELLIGENCE:
- **Buy Pressure > 55%**: Strong bullish signal (more buyers than sellers on DEX)
- **Buy Pressure < 45%**: Strong bearish signal (more sellers than buyers on DEX)
- **High Transaction Count (>1000/24h)**: Active market with real trading interest
- **Any Price Level Accepted**: Trade tokens at ANY price - $100,000 or $0.0000001 are both valid
- **All Liquidity Levels**: Low liquidity tokens are acceptable - focus on price action and momentum
- Look for assets with ANY price movements - even micro-cap tokens with tiny prices
- Combine price action with DEX trading patterns for stronger signals
- Consider both bullish (positive % + high buy pressure) and bearish (negative % + low buy pressure) opportunities
- Identify 2-5 opportunities if any assets show movement
- DO NOT filter out tokens based on price - all price ranges are tradable

CRITICAL: You MUST respond with ONLY a valid JSON object. No markdown, no code blocks, no explanations - just the pure JSON object.`
      },
      {
        role: 'user',
        content: `Analyze this LIVE cryptocurrency market data with DEX trading intelligence and DeFiLlama market intelligence to identify the best trading opportunities:

📊 DEFILLAMA MARKET INTELLIGENCE:
${defiLlamaData.marketMomentum ? `
🔥 Top Trending Protocols (24h TVL Growth):
${defiLlamaData.marketMomentum.trendingProtocols.slice(0, 5).map((p: any, i: number) => 
  `${i + 1}. ${p.name} (${p.symbol}): +${p.change_1d.toFixed(2)}% | TVL: $${(p.tvl / 1e6).toFixed(1)}M | Category: ${p.category}`
).join('\n')}

💪 Base Chain Health:
${defiLlamaData.baseChainHealth ? `
  • Health Score: ${defiLlamaData.baseChainHealth.healthScore.toFixed(0)}/100
  • Trend: ${defiLlamaData.baseChainHealth.trend.toUpperCase()}
  • Total TVL: $${(defiLlamaData.baseChainHealth.tvl / 1e9).toFixed(2)}B
  • Active Protocols: ${defiLlamaData.baseChainHealth.protocolCount}
  • 24h DEX Volume: $${(defiLlamaData.baseChainHealth.dexVolume24h / 1e6).toFixed(1)}M` : 'Data unavailable'}

🎯 Market Sentiment: ${defiLlamaData.tradingOpportunities?.marketSentiment || 'NEUTRAL'}

💵 Stablecoin Market Cap: $${((defiLlamaData.marketMomentum?.stablecoinMcap || 0) / 1e9).toFixed(1)}B
` : 'DeFiLlama data unavailable - using price data only'}

🔗 THE GRAPH ON-CHAIN INTELLIGENCE:
${onChainData.dexMetrics ? `
📊 DEX Market Overview (${onChainData.chain.toUpperCase()}):
  • Total DEX Volume (24h): $${(onChainData.dexMetrics.volume24h / 1e6).toFixed(1)}M
  • Active Trading Pools: ${onChainData.topPools.length}
  ${onChainData.ethComparison ? `• Base vs Ethereum Volume: ${(onChainData.ethComparison.volumeRatio * 100).toFixed(1)}%` : ''}

🔥 Top Liquidity Pools:
${onChainData.liquidityHotspots.slice(0, 5).map((pool: any, i: number) => 
  `${i + 1}. ${pool.pair}: $${(pool.liquidity / 1e6).toFixed(2)}M liquidity | Volume: $${(pool.volume24h / 1e6).toFixed(2)}M | V/L Ratio: ${pool.volumeToLiquidity.toFixed(2)}x`
).join('\n')}

🎯 On-Chain Trading Signals:
${onChainData.tradingSignals.length > 0 ? onChainData.tradingSignals.map((signal: any, i: number) => 
  `${i + 1}. ${signal.token} - ${signal.signal} (Confidence: ${(signal.confidence * 100).toFixed(0)}%)`
).join('\n') : 'No strong signals detected'}
` : 'On-chain data unavailable - using price data only'}

💹 LIVE CRYPTO PRICE DATA:

${marketSummary.map((m, i) => {
  const price = m.price || 0;
  const high24h = m.high24h || price;
  const low24h = m.low24h || price;
  const change24h = m.change24h || 0;
  const volume = m.volume || 0;
  const marketCap = m.marketCap || 0;
  const liquidity = m.liquidity || 0;
  const txns24h = m.txns24h || 0;
  const buys24h = m.buys24h || 0;
  const sells24h = m.sells24h || 0;
  const buyPressure = m.buyPressure || 0.5;
  
  const priceRange = low24h > 0 ? ((high24h - low24h) / low24h * 100).toFixed(2) : '0.00';
  const buyPressurePercent = (buyPressure * 100).toFixed(1);
  const buyPressureSignal = buyPressure > 0.55 ? '🟢 BULLISH' : buyPressure < 0.45 ? '🔴 BEARISH' : '⚪ NEUTRAL';
  
  return `${i + 1}. ${m.symbol} [Data: ${m.source}]
   Current Price: $${price.toLocaleString()}
   24h Change: ${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%
   24h High/Low: $${high24h.toLocaleString()} / $${low24h.toLocaleString()} (${priceRange}% range)
   24h Volume: $${(volume / 1e6).toFixed(2)}M
   Market Cap: $${(marketCap / 1e9).toFixed(2)}B
   
   🔄 DEX Trading Intelligence:
   ${liquidity > 0 ? `   • Liquidity: $${(liquidity / 1e6).toFixed(2)}M` : '   • Liquidity: Not available'}
   ${txns24h > 0 ? `   • 24h Transactions: ${txns24h.toLocaleString()} (${buys24h} buys, ${sells24h} sells)` : '   • Transactions: Not available'}
   ${txns24h > 0 ? `   • Buy Pressure: ${buyPressurePercent}% ${buyPressureSignal}` : '   • Buy Pressure: Not available'}`;
}).join('\n\n')}

CRITICAL INSTRUCTIONS:
1. Respond with ONLY a valid JSON object
2. Do NOT use markdown code blocks (no \`\`\`)
3. Do NOT include any text before or after the JSON
4. Start your response with { and end with }

Required JSON format:
{
  "topOpportunities": [
    {
      "symbol": "BTC",
      "action": "BUY",
      "confidence": 0.78,
      "reasoning": "Strong upward momentum (+3.2%) with high volume and DEX buy pressure at 62% indicating sustained buying interest",
      "targetPrice": 96500,
      "stopLoss": 93000,
      "riskReward": 2.3
    },
    {
      "symbol": "ETH",
      "action": "BUY",
      "confidence": 0.72,
      "reasoning": "Positive momentum (+2.8%) with 8,500 DEX transactions and 58% buy pressure confirming bullish sentiment",
      "targetPrice": 3500,
      "stopLoss": 3300,
      "riskReward": 2.0
    },
    {
      "symbol": "DOGE",
      "action": "SELL",
      "confidence": 0.68,
      "reasoning": "Declining price (-2.1%) with DEX buy pressure at 38%, high sell pressure indicates bearish continuation",
      "targetPrice": 0.068,
      "stopLoss": 0.074,
      "riskReward": 1.8
    }
  ],
  "marketSentiment": "BULLISH",
  "volatility": "MEDIUM",
  "insights": "Overall market shows positive momentum with BTC and ETH leading. Strong DEX trading activity confirms bullish sentiment for majors while some altcoins show selling pressure."
}

Requirements - BALANCED TRADING APPROACH:
- Identify 2-4 GOOD trading opportunities (quality AND quantity)
- Each opportunity should have reasonable conviction with clear edge
- Confidence threshold: Must be > 0.65 (65%+) for inclusion
- Risk-reward ratio must be at least 2:1 
- Prefer multiple confirming indicators (price action + volume + DEX metrics)
- Clear trend preferred: Uptrend for BUY, downtrend for SELL
- Volume confirmation: Increasing volume supporting the move
- DEX metrics helpful (buy pressure >55% for BUY, <45% for SELL)
- Moderate sideways markets acceptable if momentum building
- If some good setups exist, include them (trading regularly is important)
- Set targetPrice based on support/resistance levels
- stopLoss must protect capital (max -3% per trade)
- Mention specific technical reasons in reasoning (not generic statements)
- Use exact symbol format provided (BTC, ETH, DOGE, MATIC, etc.)
- marketSentiment must be: "BULLISH", "BEARISH", or "NEUTRAL"
- volatility must be: "HIGH", "MEDIUM", or "LOW"
- action must be: "BUY" or "SELL"

REMEMBER: Regular trading with good risk management is important for profitability.
Look for solid setups with reasonable confidence, not just perfect setups.

Return ONLY the JSON object, starting with { and ending with }`
      }
    ];

    const response = await callAI(aiProvider, messages, 0.7, 1500);
    
    console.log('🔍 AI Response from', aiProvider, '- Length:', response.length, 'chars');
    console.log('📝 First 500 chars:', response.substring(0, 500));
    console.log('📝 Last 200 chars:', response.substring(Math.max(0, response.length - 200)));
    
    // Pre-process response to handle NVIDIA's think tags and markdown
    let cleanedResponse = cleanNVIDIAResponse(response);
    
    console.log('📄 Cleaned response - Length:', cleanedResponse.length, 'chars');
    console.log('📄 First 500 chars:', cleanedResponse.substring(0, 500));
    console.log('📄 Last 200 chars:', cleanedResponse.substring(Math.max(0, cleanedResponse.length - 200)));
    
    // Try multiple JSON extraction methods
    let analysis: MarketAnalysis | null = null;
    
    // Method 1: Try to extract JSON from markdown code blocks
    let jsonMatch = cleanedResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1];
        analysis = JSON.parse(jsonStr);
        console.log('✅ Extracted JSON from markdown code block');
      } catch (e) {
        console.log('Failed to parse JSON from markdown block');
      }
    }
    
    // Method 2: Try to extract any JSON object from response
    if (!analysis) {
      jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[0];
          analysis = JSON.parse(jsonStr);
          console.log('✅ Extracted JSON from plain text');
        } catch (e) {
          console.log('Failed to parse JSON from plain text');
        }
      }
    }
    
    // Method 3: Try parsing the entire response as JSON
    if (!analysis) {
      try {
        analysis = JSON.parse(cleanedResponse);
        console.log('✅ Parsed entire response as JSON');
      } catch (e) {
        console.log('Response is not pure JSON');
      }
    }
    
    // Validate and return analysis (accept empty arrays - market may have no good trades)
    if (analysis && analysis.topOpportunities && Array.isArray(analysis.topOpportunities)) {
      const message = analysis.topOpportunities.length === 0 
        ? 'No high-confidence opportunities found' 
        : 'Opportunities identified';
      console.log('✅ Market analysis completed successfully:', {
        opportunities: analysis.topOpportunities.length,
        sentiment: analysis.marketSentiment,
        volatility: analysis.volatility,
        message
      });
      return analysis;
    }

    // If all parsing methods failed, use technical analysis fallback
    console.error('❌ All JSON parsing methods failed. AI Response:', response);
    console.warn('⚠️ Switching to technical analysis fallback...');
    
    // Generate technical-based opportunities as fallback
    const fallbackOpportunities = await generateTechnicalOpportunities(marketData);
    
    console.log(`✅ Technical analysis found ${fallbackOpportunities.length} opportunities`);
    
    // Return technical fallback analysis
    return {
      topOpportunities: fallbackOpportunities,
      marketSentiment: 'NEUTRAL',
      volatility: 'MEDIUM',
      insights: `Using technical analysis fallback. AI response parsing failed but ${fallbackOpportunities.length} opportunities identified via price action.`
    };

  } catch (error) {
    console.error('Error analyzing market:', error);
    
    // Generate technical-based opportunities as fallback
    const fallbackOpportunities = await generateTechnicalOpportunities(marketData);
    
    console.log(`⚠️ Using technical analysis fallback: ${fallbackOpportunities.length} opportunities found`);
    
    // Return technical fallback instead of empty opportunities
    return {
      topOpportunities: fallbackOpportunities,
      marketSentiment: 'NEUTRAL',
      volatility: 'MEDIUM',
      insights: `Using technical analysis (AI temporarily unavailable). Found ${fallbackOpportunities.length} trading opportunities based on price action and volume.`
    };
  }
}

/**
 * Generate technical-based trading opportunities when AI is unavailable
 */
async function generateTechnicalOpportunities(marketData: any[]): Promise<MarketAnalysis['topOpportunities']> {
  const opportunities: MarketAnalysis['topOpportunities'] = [];
  
  for (const ticker of marketData) {
    const { symbol, price, change24h, volume, buyPressure } = ticker;
    
    // Skip if missing critical data
    if (!price || price === 0 || !volume) continue;
    
    // Technical signals
    const strongUptrend = change24h > 3 && buyPressure > 0.6;
    const moderateUptrend = change24h > 1 && change24h <= 3 && buyPressure > 0.55;
    const oversold = change24h < -3 && buyPressure > 0.5; // Potential reversal
    const highVolume = volume > 100000000; // $100M+ volume
    
    let action: 'BUY' | 'SELL' | null = null;
    let confidence = 0;
    let reasoning = '';
    
    // Strong buy signals
    if (strongUptrend && highVolume) {
      action = 'BUY';
      confidence = 75;
      reasoning = `Strong uptrend (+${change24h.toFixed(1)}%) with high volume and buying pressure (${(buyPressure * 100).toFixed(0)}%)`;
    } else if (moderateUptrend) {
      action = 'BUY';
      confidence = 60;
      reasoning = `Moderate uptrend (+${change24h.toFixed(1)}%) with positive buying pressure`;
    } else if (oversold && buyPressure > 0.55) {
      action = 'BUY';
      confidence = 55;
      reasoning = `Oversold bounce opportunity (${change24h.toFixed(1)}%) with buyers stepping in`;
    }
    
    // Add opportunity if signal found
    if (action && confidence >= 55) {
      // Calculate target price and stop loss based on technical signals
      const targetPrice = action === 'BUY' 
        ? price * (1 + Math.abs(change24h) * 0.01 * 0.5) // 50% of recent move
        : price * (1 - Math.abs(change24h) * 0.01 * 0.5);
      
      const stopLoss = action === 'BUY'
        ? price * 0.97 // 3% stop loss for buys
        : price * 1.03; // 3% stop loss for sells
        
      const riskReward = Math.abs(targetPrice - price) / Math.abs(stopLoss - price);
      
      opportunities.push({
        symbol,
        action,
        confidence: confidence / 100, // Convert to decimal
        reasoning,
        targetPrice,
        stopLoss,
        riskReward
      });
    }
  }
  
  // Sort by confidence and return top 5
  return opportunities
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}

/**
 * Generate personalized trading signal for an agent
 */
export async function generateTradingSignal(
  agent: any,
  marketAnalysis: MarketAnalysis
): Promise<TradingSignal> {
  try {
    // Get agent's trading history
    const recentTrades = await prisma.trade.findMany({
      where: { agentId: agent.id },
      orderBy: { entryTime: 'desc' },
      take: 10
    });

    const openPositions = recentTrades.filter(t => t.status === 'OPEN');
    
    // Calculate agent's current performance metrics
    const winningTrades = recentTrades.filter(t => 
      t.status === 'CLOSED' && t.profitLoss && t.profitLoss > 0
    );
    const recentWinRate = recentTrades.length > 0 
      ? winningTrades.length / recentTrades.filter(t => t.status === 'CLOSED').length 
      : 0;

    // Get agent's available balance
    const availableBalance = agent.realBalance || 0;

    // Determine which chain the agent is trading on
    const chain = agent.primaryChain || 'base';
    const isSolana = chain === 'solana';

    // Filter opportunities based on the agent's chain
    // Solana agents can only trade SOL and Solana-native tokens
    // EVM agents can only trade ETH, BTC, and other EVM tokens
    let filteredOpportunities = marketAnalysis.topOpportunities;
    if (isSolana) {
      // Solana agents: only SOL and Solana tokens
      filteredOpportunities = marketAnalysis.topOpportunities.filter(opp => 
        ['SOL', 'RAY', 'BONK', 'JUP', 'WIF'].includes(opp.symbol)
      );
    } else {
      // EVM agents: only EVM tokens (exclude SOL and Solana-specific tokens)
      filteredOpportunities = marketAnalysis.topOpportunities.filter(opp => 
        !['SOL', 'RAY', 'BONK', 'JUP', 'WIF'].includes(opp.symbol)
      );
    }

    // If no suitable opportunities found, return HOLD
    if (filteredOpportunities.length === 0) {
      console.log(`⏸️  No suitable opportunities for ${agent.name} on ${chain.toUpperCase()} chain`);
      return {
        symbol: isSolana ? 'SOL' : 'ETH',
        action: 'HOLD',
        confidence: 0,
        reasoning: `No tradable opportunities available on ${chain.toUpperCase()} chain`,
        quantity: 0,
        targetProfit: 0
      };
    }

    const aiProvider = agent.aiProvider as AIProvider || 'OPENAI';
    
    console.log(`Generating trading signal for ${agent.name}:`, {
      aiProvider,
      chain: chain.toUpperCase(),
      balance: availableBalance,
      openPositions: openPositions.length,
      recentWinRate: (recentWinRate * 100).toFixed(1) + '%',
      availableOpportunities: filteredOpportunities.length
    });

    // AI-powered personalized signal
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are ${agent.name}, an AI trading agent with ${agent.strategyType} strategy. Your personality: ${agent.personality}. 

BLOCKCHAIN: You trade on ${chain.toUpperCase()} chain ${isSolana ? '(Solana blockchain)' : '(EVM blockchain - Base chain)'}
${isSolana ? 'You can ONLY trade SOL and Solana-native tokens (SOL, RAY, BONK, JUP, WIF).' : 'You can ONLY trade EVM-compatible tokens (ETH, BTC, DOGE, MATIC, etc.). You CANNOT trade SOL or Solana tokens.'}

Your current stats:
- Win Rate: ${(recentWinRate * 100).toFixed(1)}%
- Available Balance: $${availableBalance.toFixed(2)}
- Open Positions: ${openPositions.length}
- Strategy Type: ${agent.strategyType}
- Trading Chain: ${chain.toUpperCase()}

Trading Rules:
1. Maximum 20% of balance per trade
2. Never open more than 3 positions simultaneously
3. Always maintain risk-reward ratio > 1.5
4. Only trade with confidence > 0.65
5. ${isSolana ? 'ONLY trade SOL and Solana tokens' : 'ONLY trade EVM tokens (NO SOL)'}

CRITICAL: You MUST respond with ONLY a valid JSON object. No markdown, no code blocks, no explanations - just the pure JSON object.`
      },
      {
        role: 'user',
        content: `Market Analysis:
Sentiment: ${marketAnalysis.marketSentiment}
Volatility: ${marketAnalysis.volatility}

Top Opportunities for ${chain.toUpperCase()} chain:
${filteredOpportunities.map((opp, i) => `${i + 1}. ${opp.symbol}
   Action: ${opp.action}
   Confidence: ${(opp.confidence * 100).toFixed(0)}%
   Reasoning: ${opp.reasoning}
   Risk/Reward: ${opp.riskReward.toFixed(2)}`).join('\n\n')}

Insights: ${marketAnalysis.insights}

Based on your strategy, current positions, and these opportunities, what should you do next?

CRITICAL INSTRUCTIONS:
1. Respond with ONLY a valid JSON object
2. Do NOT use markdown code blocks (no \`\`\`)
3. Do NOT include any text before or after the JSON
4. Start your response with { and end with }

Required JSON format:
{
  "symbol": "BTC",
  "action": "BUY",
  "confidence": 0.75,
  "reasoning": "Strong upward momentum aligns with my momentum strategy",
  "quantity": 0.15,
  "targetProfit": 5.2
}

Requirements:
- action must be: "BUY", "SELL", or "HOLD"
- If HOLD, set quantity to 0 and explain why in reasoning
- Use exact symbol format provided (BTC, ETH, DOGE, MATIC, etc.)
- confidence must be a number between 0 and 1
- quantity is a decimal representing portion of balance to use (0.0 to 1.0)

Return ONLY the JSON object, starting with { and ending with }`
      }
    ];

    const response = await callAI(aiProvider, messages, 0.7, 800);
    
    console.log(`🔍 Signal Response for ${agent.name} from`, aiProvider, '- Length:', response.length, 'chars');
    console.log('📝 First 200 chars:', response.substring(0, 200));
    
    // Pre-process response to handle NVIDIA's think tags and markdown
    let cleanedSignalResponse = cleanNVIDIAResponse(response);
    
    console.log('📄 Cleaned signal response - Length:', cleanedSignalResponse.length, 'chars');
    console.log('📄 First 200 chars:', cleanedSignalResponse.substring(0, 200));
    
    // Try multiple JSON extraction methods
    let signal: TradingSignal | null = null;
    
    // Method 1: Try to extract JSON from markdown code blocks
    let jsonMatch = cleanedSignalResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1];
        signal = JSON.parse(jsonStr);
        console.log('✅ Extracted signal JSON from markdown code block');
      } catch (e) {
        console.log('Failed to parse signal JSON from markdown block');
      }
    }
    
    // Method 2: Try to extract any JSON object from response
    if (!signal) {
      jsonMatch = cleanedSignalResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[0];
          signal = JSON.parse(jsonStr);
          console.log('✅ Extracted signal JSON from plain text');
        } catch (e) {
          console.log('Failed to parse signal JSON from plain text');
        }
      }
    }
    
    // Method 3: Try parsing the entire response as JSON
    if (!signal) {
      try {
        signal = JSON.parse(response);
        console.log('✅ Parsed entire response as signal JSON');
      } catch (e) {
        console.log('Response is not pure JSON');
      }
    }
    
    // Validate and return signal
    if (signal && signal.symbol && signal.action && typeof signal.confidence === 'number') {
      console.log(`✅ Trading signal generated for ${agent.name}:`, {
        symbol: signal.symbol,
        action: signal.action,
        confidence: signal.confidence
      });
      return signal;
    }

    // If all parsing methods failed, throw detailed error
    console.error(`❌ All JSON parsing methods failed for ${agent.name}. AI Response:`, response);
    throw new Error(`Failed to generate trading signal for ${agent.name} - invalid response format from ${aiProvider}`);

  } catch (error) {
    console.error('Error generating trading signal:', error);
    throw error;
  }
}

/**
 * Execute automated trade for an agent
 */
export async function executeAutoTrade(agentId: string): Promise<any> {
  try {
    console.log(`Starting automated trade execution for agent ${agentId}...`);

    // Get agent data
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
      include: {
        trades: {
          where: { status: 'OPEN' },
          take: 10
        }
      }
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Check if agent can trade
    if (!agent.realBalance || agent.realBalance < 1) {
      console.log(`Agent ${agent.name} has insufficient database balance: $${agent.realBalance}`);
      return {
        success: false,
        reason: 'Insufficient database balance'
      };
    }

    // Check agent wallet configuration
    if (!agent.walletAddress || !agent.encryptedPrivateKey) {
      console.log(`Agent ${agent.name} wallet not configured`);
      return {
        success: false,
        reason: 'Wallet not configured'
      };
    }

    // Check actual on-chain balance
    const balances = await getOneInchBalance(agent.walletAddress, agent.primaryChain as any);
    const totalBalance = balances.totalUsd;
    
    console.log(`💰 ${agent.name} Wallet Balance Check:`, {
      wallet: agent.walletAddress,
      chain: agent.primaryChain,
      eth: balances.eth.toFixed(4),
      usdc: `$${balances.usdc.toFixed(2)}`,
      totalUSD: `$${totalBalance.toFixed(2)}`
    });
    
    if (totalBalance < 10) {
      console.log(`❌ ${agent.name} has insufficient balance for trading!`);
      return {
        success: false,
        reason: `Insufficient balance: $${totalBalance.toFixed(2)}. Minimum: $10.00. Fund wallet: ${agent.walletAddress}`,
        walletAddress: agent.walletAddress,
        onChainBalance: totalBalance,
        balances,
        needsFunding: true
      };
    }
    
    console.log(`✅ ${agent.name} has sufficient balance for trading: $${totalBalance.toFixed(2)}`);

    // Analyze market using agent's AI provider
    const aiProvider = agent.aiProvider as AIProvider || 'OPENAI';
    console.log(`Analyzing market conditions with ${aiProvider}...`);
    const marketAnalysis = await analyzeMarket(aiProvider);

    // Generate personalized trading signal
    console.log(`Generating trading signal for ${agent.name}...`);
    const signal = await generateTradingSignal(agent, marketAnalysis);

    // Execute trade if signal is strong enough
    if (signal.action !== 'HOLD' && signal.confidence >= 0.65 && signal.quantity > 0) {
      const tradeAmount = Math.min(
        agent.realBalance * signal.quantity,
        agent.realBalance * 0.2 // Max 20% per trade
      );

      if (tradeAmount < 1) {
        console.log('Trade amount too small:', tradeAmount);
        return {
          success: false,
          reason: 'Trade amount below minimum'
        };
      }

      console.log(`Executing ${signal.action} trade for ${agent.name}:`, {
        symbol: signal.symbol,
        amount: tradeAmount.toFixed(2),
        confidence: signal.confidence
      });

      // Get current price
      const currentPrice = marketAnalysis.topOpportunities.find(
        o => o.symbol === signal.symbol
      )?.targetPrice || await getCurrentPrice(signal.symbol);

      if (!currentPrice) {
        throw new Error('Unable to get current price');
      }

      // Execute real on-chain trade via 1inch
      console.log(`🚀 ${agent.name} executing REAL trade via 1inch:`, {
        symbol: signal.symbol,
        action: signal.action,
        amount: `$${tradeAmount.toFixed(2)}`,
        chain: agent.primaryChain
      });
      
      const tradeResult = await executeOneInchTrade(
        agent,
        signal.symbol,
        signal.action,
        tradeAmount,
        currentPrice,
        1 // No leverage on 1inch (spot trading only)
      );

      if (!tradeResult.success) {
        console.error(`❌ Real trade failed for ${agent.name}: ${tradeResult.error}`);
        return {
          success: false,
          reason: `Trade execution failed: ${tradeResult.error}`,
          signal
        };
      }

      // Update agent stats
      await prisma.aIAgent.update({
        where: { id: agent.id },
        data: {
          totalTrades: { increment: 1 },
          realBalance: signal.action === 'BUY'
            ? agent.realBalance - tradeAmount
            : agent.realBalance + tradeAmount
        }
      });

      console.log(`✅ REAL trade executed successfully via 1inch!`, {
        agent: agent.name,
        txHash: tradeResult.txHash,
        symbol: signal.symbol,
        action: signal.action,
        amount: `$${tradeAmount.toFixed(2)}`
      });
      
      return {
        success: true,
        trade: tradeResult.trade,
        signal,
        tradeMode: 'oneinch_real',
        marketAnalysis: {
          sentiment: marketAnalysis.marketSentiment,
          volatility: marketAnalysis.volatility,
          insights: marketAnalysis.insights
        }
      };
    } else {
      console.log(`${agent.name} decided to HOLD:`, signal.reasoning);
      return {
        success: false,
        reason: 'Holding position',
        signal
      };
    }

  } catch (error) {
    console.error('Error in automated trade execution:', error);
    return {
      success: false,
      reason: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Run automated trading for all agents with real balance
 */
export async function runAutomatedTradingCycle(): Promise<any[]> {
  try {
    console.log('🤖 Starting automated trading cycle...');

    // Get all agents with real balance
    const agents = await prisma.aIAgent.findMany({
      where: {
        realBalance: { gt: 0 }
      },
      orderBy: {
        realBalance: 'desc'
      }
    });

    console.log(`Found ${agents.length} agents with real balance`);

    const results = [];

    // Execute trades for each agent
    for (const agent of agents) {
      console.log(`\n📊 Processing agent: ${agent.name} (Balance: $${agent.realBalance.toFixed(2)})`);
      
      try {
        const result = await executeAutoTrade(agent.id);
        results.push({
          agentId: agent.id,
          agentName: agent.name,
          ...result
        });

        // Add delay between trades to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error trading for ${agent.name}:`, error);
        results.push({
          agentId: agent.id,
          agentName: agent.name,
          success: false,
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('\n✅ Automated trading cycle completed!');
    console.log(`Successful trades: ${results.filter(r => r.success).length}/${results.length}`);

    return results;

  } catch (error) {
    console.error('Error in automated trading cycle:', error);
    throw error;
  }
}
