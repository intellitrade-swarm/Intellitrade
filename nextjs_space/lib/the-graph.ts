
/**
 * The Graph API Integration for On-Chain Data
 * Provides real-time DEX data, liquidity metrics, and blockchain insights
 */

const GRAPH_API_KEY = process.env.THE_GRAPH_API_KEY || '';
const GRAPH_JWT_TOKEN = process.env.THE_GRAPH_JWT_TOKEN || '';

// Subgraph endpoints for different protocols
const SUBGRAPH_URLS = {
  // Base Chain
  uniswapV3Base: `https://gateway-arbitrum.network.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`,
  aerodrome: `https://gateway-arbitrum.network.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/FNMcbgoEE1v7hY7h5Z6vB8vDhVs2aKPQmjDx7pS2Jmq1`,
  
  // Ethereum
  uniswapV3Eth: `https://gateway-arbitrum.network.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`,
  aaveV3: `https://gateway-arbitrum.network.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/Cd2gEDVeqnjBn1hSeqFMitw8Q1iiyV9FYUgDN7vqBzSM`,
  
  // Arbitrum
  uniswapV3Arb: `https://gateway-arbitrum.network.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/FbCGRftH4a3yZugY7TnbYgPJVEv2LvMT6oF1fxPe9aJM`,
  
  // Polygon
  uniswapV3Polygon: `https://gateway-arbitrum.network.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/3hCPRGf4z88VC5rsBKU5AA9FBBq5nF3jbKJG7VZCbhjm`,
};

interface GraphQLQuery {
  query: string;
  variables?: Record<string, any>;
}

interface TokenData {
  id: string;
  symbol: string;
  name: string;
  decimals: string;
  derivedETH: string;
  volumeUSD: string;
  txCount: string;
  totalValueLockedUSD: string;
}

interface PoolData {
  id: string;
  token0: {
    id: string;
    symbol: string;
    name: string;
  };
  token1: {
    id: string;
    symbol: string;
    name: string;
  };
  liquidity: string;
  sqrtPrice: string;
  token0Price: string;
  token1Price: string;
  volumeUSD: string;
  txCount: string;
  totalValueLockedUSD: string;
  feeTier: string;
}

interface SwapData {
  id: string;
  timestamp: string;
  amount0: string;
  amount1: string;
  amountUSD: string;
  sender: string;
  recipient: string;
  transaction: {
    id: string;
  };
}

interface LiquidityMetrics {
  token: string;
  totalLiquidity: number;
  volume24h: number;
  priceUSD: number;
  priceChange24h: number;
  txCount24h: number;
}

interface DEXVolumeData {
  totalVolumeUSD: number;
  volume24h: number;
  topPools: Array<{
    pair: string;
    volumeUSD: number;
    liquidity: number;
    txCount: number;
  }>;
}

interface OnChainSignal {
  type: 'WHALE_ACTIVITY' | 'LIQUIDITY_SPIKE' | 'VOLUME_SURGE' | 'PRICE_MOMENTUM';
  token: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  data: Record<string, any>;
  timestamp: number;
}

/**
 * Execute GraphQL query against The Graph
 */
async function queryGraph(endpoint: string, query: GraphQLQuery): Promise<any> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GRAPH_JWT_TOKEN}`,
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(`Graph API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      throw new Error(`GraphQL query failed: ${result.errors[0]?.message || 'Unknown error'}`);
    }

    return result.data;
  } catch (error) {
    console.error('Error querying The Graph:', error);
    throw error;
  }
}

/**
 * Get token data from Uniswap V3
 */
export async function getTokenData(tokenAddress: string, chain: 'base' | 'ethereum' | 'arbitrum' | 'polygon' = 'base'): Promise<TokenData | null> {
  const endpointMap = {
    base: SUBGRAPH_URLS.uniswapV3Base,
    ethereum: SUBGRAPH_URLS.uniswapV3Eth,
    arbitrum: SUBGRAPH_URLS.uniswapV3Arb,
    polygon: SUBGRAPH_URLS.uniswapV3Polygon,
  };

  const query = {
    query: `
      query GetToken($tokenId: ID!) {
        token(id: $tokenId) {
          id
          symbol
          name
          decimals
          derivedETH
          volumeUSD
          txCount
          totalValueLockedUSD
        }
      }
    `,
    variables: {
      tokenId: tokenAddress.toLowerCase(),
    },
  };

  try {
    const data = await queryGraph(endpointMap[chain], query);
    return data.token;
  } catch (error) {
    console.error(`Error fetching token data for ${tokenAddress}:`, error);
    return null;
  }
}

/**
 * Get top liquidity pools
 */
export async function getTopPools(limit: number = 10, chain: 'base' | 'ethereum' = 'base'): Promise<PoolData[]> {
  const endpoint = chain === 'base' ? SUBGRAPH_URLS.uniswapV3Base : SUBGRAPH_URLS.uniswapV3Eth;

  const query = {
    query: `
      query GetTopPools($limit: Int!) {
        pools(
          first: $limit
          orderBy: totalValueLockedUSD
          orderDirection: desc
          where: { totalValueLockedUSD_gt: "1000" }
        ) {
          id
          token0 {
            id
            symbol
            name
          }
          token1 {
            id
            symbol
            name
          }
          liquidity
          sqrtPrice
          token0Price
          token1Price
          volumeUSD
          txCount
          totalValueLockedUSD
          feeTier
        }
      }
    `,
    variables: { limit },
  };

  try {
    const data = await queryGraph(endpoint, query);
    return data.pools || [];
  } catch (error) {
    console.error('Error fetching top pools:', error);
    return [];
  }
}

/**
 * Get recent swaps for a token pair
 */
export async function getRecentSwaps(
  poolAddress: string,
  limit: number = 50,
  chain: 'base' | 'ethereum' = 'base'
): Promise<SwapData[]> {
  const endpoint = chain === 'base' ? SUBGRAPH_URLS.uniswapV3Base : SUBGRAPH_URLS.uniswapV3Eth;

  const query = {
    query: `
      query GetSwaps($poolId: String!, $limit: Int!) {
        swaps(
          first: $limit
          orderBy: timestamp
          orderDirection: desc
          where: { pool: $poolId }
        ) {
          id
          timestamp
          amount0
          amount1
          amountUSD
          sender
          recipient
          transaction {
            id
          }
        }
      }
    `,
    variables: {
      poolId: poolAddress.toLowerCase(),
      limit,
    },
  };

  try {
    const data = await queryGraph(endpoint, query);
    return data.swaps || [];
  } catch (error) {
    console.error('Error fetching recent swaps:', error);
    return [];
  }
}

/**
 * Get liquidity metrics for trading decisions
 */
export async function getLiquidityMetrics(tokenAddress: string, chain: 'base' | 'ethereum' = 'base'): Promise<LiquidityMetrics | null> {
  const tokenData = await getTokenData(tokenAddress, chain);
  
  if (!tokenData) {
    return null;
  }

  // Get pools for this token
  const endpoint = chain === 'base' ? SUBGRAPH_URLS.uniswapV3Base : SUBGRAPH_URLS.uniswapV3Eth;
  
  const poolQuery = {
    query: `
      query GetTokenPools($tokenId: ID!) {
        pools(
          where: { 
            or: [
              { token0: $tokenId },
              { token1: $tokenId }
            ]
          }
          orderBy: totalValueLockedUSD
          orderDirection: desc
          first: 5
        ) {
          id
          volumeUSD
          totalValueLockedUSD
          txCount
        }
      }
    `,
    variables: {
      tokenId: tokenAddress.toLowerCase(),
    },
  };

  try {
    const poolData = await queryGraph(endpoint, poolQuery);
    const pools = poolData.pools || [];

    const totalLiquidity = pools.reduce((sum: number, pool: any) => 
      sum + parseFloat(pool.totalValueLockedUSD || '0'), 0
    );

    const volume24h = parseFloat(tokenData.volumeUSD || '0');
    const priceUSD = parseFloat(tokenData.derivedETH || '0') * 2000; // Rough ETH price estimate
    const txCount24h = parseInt(tokenData.txCount || '0');

    return {
      token: tokenData.symbol,
      totalLiquidity,
      volume24h,
      priceUSD,
      priceChange24h: 0, // Would need historical data
      txCount24h,
    };
  } catch (error) {
    console.error('Error fetching liquidity metrics:', error);
    return null;
  }
}

/**
 * Detect whale activity (large swaps)
 */
export async function detectWhaleActivity(
  poolAddress: string,
  thresholdUSD: number = 100000,
  chain: 'base' | 'ethereum' = 'base'
): Promise<SwapData[]> {
  const swaps = await getRecentSwaps(poolAddress, 100, chain);
  
  return swaps.filter(swap => {
    const amountUSD = parseFloat(swap.amountUSD || '0');
    return Math.abs(amountUSD) >= thresholdUSD;
  });
}

/**
 * Get comprehensive on-chain signals for trading
 */
export async function getOnChainSignals(
  tokenAddress: string,
  chain: 'base' | 'ethereum' = 'base'
): Promise<OnChainSignal[]> {
  const signals: OnChainSignal[] = [];

  try {
    // Get token metrics
    const metrics = await getLiquidityMetrics(tokenAddress, chain);
    
    if (!metrics) {
      return signals;
    }

    // Check for high volume (volume > 2x liquidity)
    if (metrics.volume24h > metrics.totalLiquidity * 2) {
      signals.push({
        type: 'VOLUME_SURGE',
        token: metrics.token,
        severity: 'HIGH',
        confidence: 0.85,
        data: {
          volume24h: metrics.volume24h,
          liquidity: metrics.totalLiquidity,
          ratio: metrics.volume24h / metrics.totalLiquidity,
        },
        timestamp: Date.now(),
      });
    }

    // Check for liquidity changes
    if (metrics.totalLiquidity > 1000000) { // $1M+ liquidity
      signals.push({
        type: 'LIQUIDITY_SPIKE',
        token: metrics.token,
        severity: 'MEDIUM',
        confidence: 0.75,
        data: {
          totalLiquidity: metrics.totalLiquidity,
        },
        timestamp: Date.now(),
      });
    }

    // Check transaction velocity
    if (metrics.txCount24h > 1000) {
      signals.push({
        type: 'PRICE_MOMENTUM',
        token: metrics.token,
        severity: 'MEDIUM',
        confidence: 0.7,
        data: {
          txCount24h: metrics.txCount24h,
          volumePerTx: metrics.volume24h / metrics.txCount24h,
        },
        timestamp: Date.now(),
      });
    }

    // Get top pools and check for whale activity
    const tokenData = await getTokenData(tokenAddress, chain);
    if (tokenData) {
      const endpoint = chain === 'base' ? SUBGRAPH_URLS.uniswapV3Base : SUBGRAPH_URLS.uniswapV3Eth;
      
      const poolQuery = {
        query: `
          query GetTokenPools($tokenId: ID!) {
            pools(
              where: { 
                or: [
                  { token0: $tokenId },
                  { token1: $tokenId }
                ]
              }
              orderBy: totalValueLockedUSD
              orderDirection: desc
              first: 1
            ) {
              id
            }
          }
        `,
        variables: {
          tokenId: tokenAddress.toLowerCase(),
        },
      };

      const poolData = await queryGraph(endpoint, poolQuery);
      
      if (poolData.pools && poolData.pools.length > 0) {
        const whaleSwaps = await detectWhaleActivity(poolData.pools[0].id, 50000, chain);
        
        if (whaleSwaps.length > 0) {
          signals.push({
            type: 'WHALE_ACTIVITY',
            token: metrics.token,
            severity: 'HIGH',
            confidence: 0.9,
            data: {
              whaleSwapCount: whaleSwaps.length,
              totalWhaleVolume: whaleSwaps.reduce((sum, swap) => 
                sum + Math.abs(parseFloat(swap.amountUSD || '0')), 0
              ),
              recentSwaps: whaleSwaps.slice(0, 5),
            },
            timestamp: Date.now(),
          });
        }
      }
    }

    return signals;
  } catch (error) {
    console.error('Error generating on-chain signals:', error);
    return signals;
  }
}

/**
 * Get DEX volume and liquidity aggregated data
 */
export async function getDEXMetrics(chain: 'base' | 'ethereum' = 'base'): Promise<DEXVolumeData> {
  const pools = await getTopPools(20, chain);

  const totalVolumeUSD = pools.reduce((sum, pool) => 
    sum + parseFloat(pool.volumeUSD || '0'), 0
  );

  const topPools = pools.slice(0, 10).map(pool => ({
    pair: `${pool.token0.symbol}/${pool.token1.symbol}`,
    volumeUSD: parseFloat(pool.volumeUSD || '0'),
    liquidity: parseFloat(pool.totalValueLockedUSD || '0'),
    txCount: parseInt(pool.txCount || '0'),
  }));

  return {
    totalVolumeUSD,
    volume24h: totalVolumeUSD, // This is approximate
    topPools,
  };
}

/**
 * Search for trading opportunities based on on-chain data
 */
export async function findTradingOpportunities(chain: 'base' | 'ethereum' = 'base'): Promise<{
  opportunities: Array<{
    token: string;
    pair: string;
    signal: string;
    confidence: number;
    metrics: any;
  }>;
}> {
  const opportunities: Array<{
    token: string;
    pair: string;
    signal: string;
    confidence: number;
    metrics: any;
  }> = [];

  try {
    // Get top pools
    const pools = await getTopPools(30, chain);

    for (const pool of pools) {
      // Analyze each pool for opportunities
      const volumeToLiquidityRatio = parseFloat(pool.volumeUSD || '0') / parseFloat(pool.totalValueLockedUSD || '1');
      const txCount = parseInt(pool.txCount || '0');

      // High volume relative to liquidity = potential opportunity
      if (volumeToLiquidityRatio > 1.5 && txCount > 100) {
        opportunities.push({
          token: pool.token0.symbol,
          pair: `${pool.token0.symbol}/${pool.token1.symbol}`,
          signal: 'HIGH_VOLUME_RATIO',
          confidence: Math.min(0.95, volumeToLiquidityRatio / 3),
          metrics: {
            volumeUSD: pool.volumeUSD,
            liquidity: pool.totalValueLockedUSD,
            ratio: volumeToLiquidityRatio,
            txCount,
          },
        });
      }

      // Deep liquidity with decent volume = stable trading
      if (parseFloat(pool.totalValueLockedUSD || '0') > 1000000 && txCount > 500) {
        opportunities.push({
          token: pool.token0.symbol,
          pair: `${pool.token0.symbol}/${pool.token1.symbol}`,
          signal: 'DEEP_LIQUIDITY',
          confidence: 0.8,
          metrics: {
            volumeUSD: pool.volumeUSD,
            liquidity: pool.totalValueLockedUSD,
            txCount,
          },
        });
      }
    }

    // Sort by confidence
    opportunities.sort((a, b) => b.confidence - a.confidence);

    return { opportunities: opportunities.slice(0, 10) };
  } catch (error) {
    console.error('Error finding trading opportunities:', error);
    return { opportunities: [] };
  }
}

/**
 * Get market depth and liquidity analysis
 */
export async function getMarketDepth(
  poolAddress: string,
  chain: 'base' | 'ethereum' = 'base'
): Promise<{
  depth: number;
  spread: number;
  liquidity: number;
  recentVolume: number;
} | null> {
  const endpoint = chain === 'base' ? SUBGRAPH_URLS.uniswapV3Base : SUBGRAPH_URLS.uniswapV3Eth;

  const query = {
    query: `
      query GetPoolDepth($poolId: ID!) {
        pool(id: $poolId) {
          totalValueLockedUSD
          volumeUSD
          token0Price
          token1Price
          liquidity
          sqrtPrice
        }
      }
    `,
    variables: {
      poolId: poolAddress.toLowerCase(),
    },
  };

  try {
    const data = await queryGraph(endpoint, query);
    const pool = data.pool;

    if (!pool) {
      return null;
    }

    const liquidity = parseFloat(pool.totalValueLockedUSD || '0');
    const volume = parseFloat(pool.volumeUSD || '0');
    const token0Price = parseFloat(pool.token0Price || '0');
    const token1Price = parseFloat(pool.token1Price || '0');

    // Calculate approximate spread
    const spread = Math.abs(token0Price - token1Price) / ((token0Price + token1Price) / 2);

    return {
      depth: liquidity / 1000, // Depth in thousands
      spread: spread * 100, // Spread as percentage
      liquidity,
      recentVolume: volume,
    };
  } catch (error) {
    console.error('Error fetching market depth:', error);
    return null;
  }
}

export default {
  getTokenData,
  getTopPools,
  getRecentSwaps,
  getLiquidityMetrics,
  detectWhaleActivity,
  getOnChainSignals,
  getDEXMetrics,
  findTradingOpportunities,
  getMarketDepth,
};
