
/**
 * DeFiLlama API Integration
 * FREE API with comprehensive DeFi data for enhanced trading decisions
 */

// DeFiLlama API endpoints
const DEFILLAMA_BASE_URL = 'https://api.llama.fi';
const COINS_BASE_URL = 'https://coins.llama.fi';
const YIELDS_BASE_URL = 'https://yields.llama.fi';
const STABLECOINS_BASE_URL = 'https://stablecoins.llama.fi';

// Cache configuration
const CACHE_DURATION = {
  TVL: 10 * 60 * 1000, // 10 minutes
  PRICES: 5 * 60 * 1000, // 5 minutes
  VOLUMES: 5 * 60 * 1000, // 5 minutes
  YIELDS: 30 * 60 * 1000, // 30 minutes
  STABLECOINS: 15 * 60 * 1000, // 15 minutes
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Generic fetch with caching
 */
async function fetchWithCache<T>(
  url: string,
  cacheKey: string,
  cacheDuration: number
): Promise<T> {
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < cacheDuration) {
    console.log(`[DeFiLlama] Cache hit: ${cacheKey}`);
    return cached.data;
  }

  try {
    console.log(`[DeFiLlama] Fetching: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`DeFiLlama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  } catch (error) {
    console.error(`[DeFiLlama] Fetch error for ${cacheKey}:`, error);
    
    // Return cached data if available, even if expired
    if (cached) {
      console.log(`[DeFiLlama] Using stale cache: ${cacheKey}`);
      return cached.data;
    }
    
    throw error;
  }
}

/**
 * TVL DATA - Protocol and Chain TVL
 */

export interface Protocol {
  id: string;
  name: string;
  symbol: string;
  category: string;
  chains: string[];
  tvl: number;
  chainTvls: Record<string, number>;
  change_1d: number;
  change_7d: number;
}

export interface ChainTVL {
  gecko_id: string | null;
  tvl: number;
  tokenSymbol: string | null;
  name: string;
  chainId: number | null;
}

/**
 * Get all protocols with TVL data
 */
export async function getAllProtocols(): Promise<Protocol[]> {
  return fetchWithCache<Protocol[]>(
    `${DEFILLAMA_BASE_URL}/protocols`,
    'protocols_all',
    CACHE_DURATION.TVL
  );
}

/**
 * Get top protocols by TVL
 */
export async function getTopProtocols(limit: number = 50): Promise<Protocol[]> {
  const protocols = await getAllProtocols();
  return protocols
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, limit);
}

/**
 * Get trending protocols (highest TVL growth in last 24h)
 */
export async function getTrendingProtocols(limit: number = 20): Promise<Protocol[]> {
  const protocols = await getAllProtocols();
  return protocols
    .filter(p => p.change_1d > 0)
    .sort((a, b) => b.change_1d - a.change_1d)
    .slice(0, limit);
}

/**
 * Get protocols by chain
 */
export async function getProtocolsByChain(chain: string): Promise<Protocol[]> {
  const protocols = await getAllProtocols();
  return protocols.filter(p => 
    p.chains.some(c => c.toLowerCase() === chain.toLowerCase())
  );
}

/**
 * Get TVL of all chains
 */
export async function getAllChainsTVL(): Promise<ChainTVL[]> {
  return fetchWithCache<ChainTVL[]>(
    `${DEFILLAMA_BASE_URL}/v2/chains`,
    'chains_all_tvl',
    CACHE_DURATION.TVL
  );
}

/**
 * Get specific chain TVL
 */
export async function getChainTVL(chain: string): Promise<number> {
  const chains = await getAllChainsTVL();
  const chainData = chains.find(c => c.name.toLowerCase() === chain.toLowerCase());
  return chainData?.tvl || 0;
}

/**
 * PRICE DATA - Token prices with confidence scores
 */

export interface TokenPrice {
  decimals: number;
  price: number;
  symbol: string;
  timestamp: number;
  confidence?: number;
}

export interface PriceResponse {
  coins: Record<string, TokenPrice>;
}

/**
 * Get current prices for tokens
 * @param tokens Array of token identifiers in format "chain:address" or "coingecko:id"
 * Example: ["ethereum:0xdF574c24545E5FfEcb9a659c229253D4111d87e1", "coingecko:ethereum"]
 */
export async function getCurrentPrices(tokens: string[]): Promise<Record<string, TokenPrice>> {
  const tokensStr = tokens.join(',');
  const response = await fetchWithCache<PriceResponse>(
    `${COINS_BASE_URL}/prices/current/${tokensStr}`,
    `prices_current_${tokensStr}`,
    CACHE_DURATION.PRICES
  );
  return response.coins;
}

/**
 * Get price percentage change
 */
export async function getPricePercentageChange(
  tokens: string[],
  period: string = '24h'
): Promise<Record<string, number>> {
  const tokensStr = tokens.join(',');
  const response = await fetchWithCache<{ coins: Record<string, number> }>(
    `${COINS_BASE_URL}/percentage/${tokensStr}?period=${period}`,
    `percentage_${tokensStr}_${period}`,
    CACHE_DURATION.PRICES
  );
  return response.coins;
}

/**
 * DEX VOLUME DATA - Trading activity
 */

export interface DexProtocol {
  name: string;
  displayName: string;
  total24h: number;
  total7d: number;
  change_1d: number;
  change_7d: number;
  chains: string[];
}

export interface DexOverview {
  protocols: DexProtocol[];
  totalDataChart?: any[];
  allChains: string[];
}

/**
 * Get all DEXs with volume data
 */
export async function getAllDEXVolumes(): Promise<DexOverview> {
  return fetchWithCache<DexOverview>(
    `${DEFILLAMA_BASE_URL}/overview/dexs?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`,
    'dexs_overview',
    CACHE_DURATION.VOLUMES
  );
}

/**
 * Get top DEXs by 24h volume
 */
export async function getTopDEXsByVolume(limit: number = 20): Promise<DexProtocol[]> {
  const overview = await getAllDEXVolumes();
  return overview.protocols
    .sort((a, b) => b.total24h - a.total24h)
    .slice(0, limit);
}

/**
 * Get DEX volumes for specific chain
 */
export async function getDEXVolumesByChain(chain: string): Promise<DexOverview> {
  return fetchWithCache<DexOverview>(
    `${DEFILLAMA_BASE_URL}/overview/dexs/${chain.toLowerCase()}?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`,
    `dexs_overview_${chain}`,
    CACHE_DURATION.VOLUMES
  );
}

/**
 * YIELDS/APY DATA - Yield farming opportunities
 */

export interface YieldPool {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase: number;
  apyReward: number;
  rewardTokens?: string[];
  underlyingTokens?: string[];
  poolMeta?: string;
  url?: string;
  predictions?: {
    predictedClass: string;
    predictedProbability: number;
    binnedConfidence: number;
  };
}

export interface YieldsResponse {
  status: string;
  data: YieldPool[];
}

/**
 * Get all yield farming pools
 */
export async function getAllYieldPools(): Promise<YieldPool[]> {
  const response = await fetchWithCache<YieldsResponse>(
    `${YIELDS_BASE_URL}/pools`,
    'yields_all_pools',
    CACHE_DURATION.YIELDS
  );
  return response.data;
}

/**
 * Get top yield pools by APY
 */
export async function getTopYieldPools(
  minTVL: number = 100000,
  limit: number = 50
): Promise<YieldPool[]> {
  const pools = await getAllYieldPools();
  return pools
    .filter(p => p.tvlUsd >= minTVL && p.apy > 0)
    .sort((a, b) => b.apy - a.apy)
    .slice(0, limit);
}

/**
 * Get yield pools for specific chain
 */
export async function getYieldPoolsByChain(chain: string): Promise<YieldPool[]> {
  const pools = await getAllYieldPools();
  return pools.filter(p => p.chain.toLowerCase() === chain.toLowerCase());
}

/**
 * STABLECOIN DATA - Capital flows
 */

export interface Stablecoin {
  id: string;
  name: string;
  symbol: string;
  pegType: string;
  pegMechanism: string;
  circulating: {
    peggedUSD: number;
  };
  chains: string[];
  chainCirculating: Record<string, any>;
  price?: number;
}

export interface StablecoinsResponse {
  peggedAssets: Stablecoin[];
}

/**
 * Get all stablecoins with circulation data
 */
export async function getAllStablecoins(includePrices: boolean = true): Promise<Stablecoin[]> {
  const response = await fetchWithCache<StablecoinsResponse>(
    `${STABLECOINS_BASE_URL}/stablecoins?includePrices=${includePrices}`,
    `stablecoins_all_${includePrices}`,
    CACHE_DURATION.STABLECOINS
  );
  return response.peggedAssets;
}

/**
 * Get total stablecoin market cap
 */
export async function getTotalStablecoinMarketCap(): Promise<number> {
  const stablecoins = await getAllStablecoins(false);
  return stablecoins.reduce((sum, s) => sum + s.circulating.peggedUSD, 0);
}

/**
 * TRADING INTELLIGENCE FUNCTIONS
 * High-level functions for trading decision making
 */

/**
 * Get market momentum indicators
 */
export async function getMarketMomentum(): Promise<{
  trendingProtocols: Protocol[];
  topDEXs: DexProtocol[];
  chainTVLs: ChainTVL[];
  stablecoinMcap: number;
}> {
  const [trendingProtocols, topDEXs, chainTVLs, stablecoinMcap] = await Promise.all([
    getTrendingProtocols(10),
    getTopDEXsByVolume(10),
    getAllChainsTVL(),
    getTotalStablecoinMarketCap(),
  ]);

  return {
    trendingProtocols,
    topDEXs,
    chainTVLs,
    stablecoinMcap,
  };
}

/**
 * Get chain health score based on TVL, volume, and protocols
 */
export async function getChainHealthScore(chain: string): Promise<{
  chain: string;
  tvl: number;
  protocolCount: number;
  dexVolume24h: number;
  healthScore: number;
  trend: 'growing' | 'stable' | 'declining';
}> {
  const [chainTVL, protocols, dexData] = await Promise.all([
    getChainTVL(chain),
    getProtocolsByChain(chain),
    getDEXVolumesByChain(chain).catch(() => ({ protocols: [] })),
  ]);

  const dexVolume24h = dexData.protocols.reduce((sum, p) => sum + (p.total24h || 0), 0);
  
  // Calculate health score (0-100)
  const tvlScore = Math.min(chainTVL / 1e9, 50); // Max 50 points for TVL
  const protocolScore = Math.min(protocols.length * 2, 25); // Max 25 points for protocol count
  const volumeScore = Math.min(dexVolume24h / 1e8, 25); // Max 25 points for volume
  
  const healthScore = tvlScore + protocolScore + volumeScore;

  // Determine trend based on protocol TVL changes
  const avgChange = protocols.reduce((sum, p) => sum + (p.change_1d || 0), 0) / protocols.length;
  const trend = avgChange > 2 ? 'growing' : avgChange < -2 ? 'declining' : 'stable';

  return {
    chain,
    tvl: chainTVL,
    protocolCount: protocols.length,
    dexVolume24h,
    healthScore,
    trend,
  };
}

/**
 * Get trading opportunities based on DeFiLlama data
 */
export async function getTradingOpportunities(chain?: string): Promise<{
  hotProtocols: Protocol[];
  activeChains: ChainTVL[];
  yieldOpportunities: YieldPool[];
  volumeLeaders: DexProtocol[];
  marketSentiment: 'bullish' | 'neutral' | 'bearish';
}> {
  const [protocols, chains, yields, dexs, stablecoinMcap] = await Promise.all([
    getTrendingProtocols(20),
    getAllChainsTVL(),
    getTopYieldPools(500000, 20),
    getTopDEXsByVolume(20),
    getTotalStablecoinMarketCap(),
  ]);

  // Filter by chain if specified
  const hotProtocols = chain
    ? protocols.filter(p => p.chains.some(c => c.toLowerCase() === chain.toLowerCase()))
    : protocols;

  const activeChains = chains
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 10);

  const yieldOpportunities = chain
    ? yields.filter(y => y.chain.toLowerCase() === chain.toLowerCase())
    : yields;

  const volumeLeaders = dexs;

  // Determine market sentiment based on protocol trends
  const avgGrowth = protocols.reduce((sum, p) => sum + p.change_1d, 0) / protocols.length;
  const marketSentiment = avgGrowth > 5 ? 'bullish' : avgGrowth < -5 ? 'bearish' : 'neutral';

  return {
    hotProtocols,
    activeChains,
    yieldOpportunities,
    volumeLeaders,
    marketSentiment,
  };
}

/**
 * Analyze protocol strength for trading decisions
 */
export async function analyzeProtocol(protocolName: string): Promise<{
  protocol: Protocol | null;
  rank: number;
  tvlTrend: 'strong_growth' | 'moderate_growth' | 'stable' | 'declining' | 'strong_decline';
  volumeRank?: number;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid';
}> {
  const protocols = await getAllProtocols();
  const protocol = protocols.find(p => 
    p.name.toLowerCase() === protocolName.toLowerCase()
  );

  if (!protocol) {
    return {
      protocol: null,
      rank: -1,
      tvlTrend: 'stable',
      recommendation: 'avoid',
    };
  }

  // Calculate rank
  const sortedProtocols = [...protocols].sort((a, b) => b.tvl - a.tvl);
  const rank = sortedProtocols.findIndex(p => p.id === protocol.id) + 1;

  // Determine TVL trend
  let tvlTrend: 'strong_growth' | 'moderate_growth' | 'stable' | 'declining' | 'strong_decline';
  if (protocol.change_1d > 10) tvlTrend = 'strong_growth';
  else if (protocol.change_1d > 2) tvlTrend = 'moderate_growth';
  else if (protocol.change_1d > -2) tvlTrend = 'stable';
  else if (protocol.change_1d > -10) tvlTrend = 'declining';
  else tvlTrend = 'strong_decline';

  // Get volume rank if available
  const dexData = await getAllDEXVolumes().catch(() => null);
  const volumeRank = dexData?.protocols.findIndex(d => 
    d.name.toLowerCase() === protocolName.toLowerCase()
  );

  // Recommendation logic
  let recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid';
  if (tvlTrend === 'strong_growth' && rank <= 50) {
    recommendation = 'strong_buy';
  } else if (tvlTrend === 'moderate_growth' || (tvlTrend === 'stable' && rank <= 20)) {
    recommendation = 'buy';
  } else if (tvlTrend === 'stable') {
    recommendation = 'hold';
  } else {
    recommendation = 'avoid';
  }

  return {
    protocol,
    rank,
    tvlTrend,
    volumeRank: volumeRank !== undefined && volumeRank >= 0 ? volumeRank + 1 : undefined,
    recommendation,
  };
}

export default {
  // TVL
  getAllProtocols,
  getTopProtocols,
  getTrendingProtocols,
  getProtocolsByChain,
  getAllChainsTVL,
  getChainTVL,
  
  // Prices
  getCurrentPrices,
  getPricePercentageChange,
  
  // Volumes
  getAllDEXVolumes,
  getTopDEXsByVolume,
  getDEXVolumesByChain,
  
  // Yields
  getAllYieldPools,
  getTopYieldPools,
  getYieldPoolsByChain,
  
  // Stablecoins
  getAllStablecoins,
  getTotalStablecoinMarketCap,
  
  // Intelligence
  getMarketMomentum,
  getChainHealthScore,
  getTradingOpportunities,
  analyzeProtocol,
};
