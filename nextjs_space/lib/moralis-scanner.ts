
/**
 * Multi-Chain Token Scanner with DexScreener Integration
 * Scans EVM chains for tokens with highest buy volume
 * Integrates Moralis (token discovery) + DexScreener (volume data)
 * Includes sentiment analysis
 */

export interface TokenData {
  chain: 'ethereum' | 'bsc' | 'polygon' | 'base';
  chainName: string;
  address: string;
  symbol: string;
  name: string;
  buyVolume24h: number;
  sellVolume24h: number;
  totalVolume24h: number;
  buyPercentage: number;
  priceUsd: number;
  priceChange24h: number;
  marketCap: number;
  holders: number;
  liquidity: number;
  transactions24h: number;
  buys24h: number;
  sells24h: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sentimentScore: number;
  sentimentReasons: string[];
  lastUpdated: Date;
}

export interface ChainScanResult {
  chain: 'ethereum' | 'bsc' | 'polygon' | 'base';
  chainName: string;
  topTokens: TokenData[];
  scanTime: Date;
  totalScanned: number;
}

class MoralisScanner {
  private moralisApiKey: string;
  private etherscanApiKey: string;
  private readonly SCAN_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private cache: Map<string, ChainScanResult> = new Map();
  private lastScan: Map<string, Date> = new Map();

  // Chain configurations
  // Moralis API supports multiple chains with correct identifiers
  private chains: Record<string, { name: string; chainId: string; moralisChain: string; scannerUrl?: string }> = {
    ethereum: { 
      name: 'Ethereum', 
      chainId: '0x1',
      moralisChain: 'eth', // Moralis expects "eth" not "ethereum"
      scannerUrl: 'https://api.etherscan.io/api'
    },
    bsc: { 
      name: 'BNB Chain', 
      chainId: '0x38',
      moralisChain: 'bsc', // Correct identifier for BSC
      scannerUrl: 'https://api.bscscan.com/api'
    },
    polygon: { 
      name: 'Polygon', 
      chainId: '0x89',
      moralisChain: 'polygon', // Correct identifier for Polygon
      scannerUrl: 'https://api.polygonscan.com/api'
    },
    base: { 
      name: 'Base', 
      chainId: '0x2105',
      moralisChain: 'base', // Correct identifier for Base
      scannerUrl: 'https://api.basescan.org/api'
    },
  };

  constructor() {
    this.moralisApiKey = process.env.MORALIS_API_KEY || '';
    this.etherscanApiKey = process.env.ETHERSCAN_API_KEY || '';
    
    if (!this.moralisApiKey) {
      console.warn('⚠️  Moralis API key not configured');
    }
    if (!this.etherscanApiKey) {
      console.warn('⚠️  Etherscan API key not configured');
    }
  }

  /**
   * Scan all EVM chains for top tokens by buy volume
   */
  async scanAllChains(): Promise<ChainScanResult[]> {
    console.log('🔍 Starting multi-chain scan for top tokens by buy volume...');
    
    const results: ChainScanResult[] = [];
    
    for (const [chainKey, chainConfig] of Object.entries(this.chains)) {
      try {
        // Check cache first
        const cachedResult = this.getCachedResult(chainKey);
        if (cachedResult) {
          results.push(cachedResult);
          continue;
        }

        console.log(`\n📊 Scanning ${chainConfig.name}...`);
        const topTokens = await this.scanChain(chainKey as any);
        
        const scanResult: ChainScanResult = {
          chain: chainKey as any,
          chainName: chainConfig.name,
          topTokens: topTokens.slice(0, 5), // Top 5 tokens per chain
          scanTime: new Date(),
          totalScanned: topTokens.length,
        };
        
        this.cache.set(chainKey, scanResult);
        this.lastScan.set(chainKey, new Date());
        results.push(scanResult);
        
      } catch (error) {
        console.error(`❌ Error scanning ${chainConfig.name}:`, error);
        // Return cached data if available, even if expired
        const cachedResult = this.cache.get(chainKey);
        if (cachedResult) {
          results.push(cachedResult);
        }
      }
    }
    
    console.log(`\n✅ Multi-chain scan complete. Found ${results.length} chains with data.`);
    return results;
  }

  /**
   * Scan a specific chain for top tokens
   */
  private async scanChain(chain: 'ethereum' | 'bsc' | 'polygon' | 'base'): Promise<TokenData[]> {
    const tokens: TokenData[] = [];
    
    try {
      // Get top tokens by market cap first
      const topTokensData = await this.getTopTokensByMarketCap(chain);
      
      // For each token, get detailed trading data
      for (const tokenData of topTokensData) {
        try {
          const detailedData = await this.getTokenDetails(chain, tokenData.address);
          tokens.push(detailedData);
          
          // Rate limiting
          await this.sleep(100);
        } catch (error) {
          console.warn(`  Warning: Could not fetch details for ${tokenData.symbol}`, error);
        }
      }
      
      // Sort by buy volume
      tokens.sort((a, b) => b.buyVolume24h - a.buyVolume24h);
      
      return tokens;
    } catch (error) {
      console.error(`Error scanning ${chain}:`, error);
      return [];
    }
  }

  /**
   * Get top tokens using DexScreener (supports all chains, free API)
   */
  private async getTopTokensByMarketCap(chain: string): Promise<Array<{ address: string; symbol: string; name: string }>> {
    console.log(`[DexScreener] getTopTokensByMarketCap called for chain: ${chain}`);
    
    try {
      const chainConfig = this.chains[chain];
      const dexScreenerChain = chainConfig?.moralisChain || 'ethereum';
      
      // Map chain names to DexScreener format
      const chainMap: Record<string, string> = {
        'eth': 'ethereum',
        'bsc': 'bsc',
        'polygon': 'polygon',
        'base': 'base',
      };
      
      const targetChain = chainMap[dexScreenerChain] || dexScreenerChain;
      console.log(`[DexScreener] Using chain identifier: ${targetChain}`);
      
      // Get trending tokens from DexScreener's latest endpoint
      const url = `https://api.dexscreener.com/latest/dex/search?q=${targetChain}`;
      console.log(`[DexScreener] Fetching: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log(`[DexScreener] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DexScreener] API error: ${response.status} ${response.statusText} - ${errorText}`);
        throw new Error(`DexScreener API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[DexScreener] Got pairs data`);
      
      // DexScreener returns pairs, extract unique tokens with high volume
      const pairs = data.pairs || [];
      
      // Group by token address and sum volumes
      const tokenMap = new Map<string, { address: string; symbol: string; name: string; volume: number }>();
      
      for (const pair of pairs) {
        if (pair.chainId === targetChain && pair.baseToken) {
          const address = pair.baseToken.address;
          const symbol = pair.baseToken.symbol || 'UNKNOWN';
          const name = pair.baseToken.name || 'Unknown Token';
          const volume = parseFloat(pair.volume?.h24 || '0');
          
          if (!tokenMap.has(address)) {
            tokenMap.set(address, { address, symbol, name, volume });
          } else {
            const existing = tokenMap.get(address)!;
            existing.volume += volume;
          }
        }
      }
      
      // Sort by volume and take top 10
      const tokens = Array.from(tokenMap.values())
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 10)
        .map(({ address, symbol, name }) => ({ address, symbol, name }));
      
      console.log(`[DexScreener] Mapped ${tokens.length} tokens successfully`);
      return tokens;
    } catch (error) {
      console.error(`[DexScreener] Error in getTopTokensByMarketCap for ${chain}:`, error);
      return [];
    }
  }

  /**
   * Get detailed token data including buy/sell volume
   * Enhanced with DexScreener for accurate volume data
   */
  private async getTokenDetails(chain: 'ethereum' | 'bsc' | 'polygon' | 'base', address: string): Promise<TokenData> {
    const chainConfig = this.chains[chain];
    
    // Get token stats from Moralis (basic metadata)
    const stats = await this.getTokenStats(chain, address);
    
    // Get price and market data from Moralis
    const priceData = await this.getTokenPrice(chain, address);
    
    // Get enhanced volume data from DexScreener
    const dexScreenerData = await this.getDexScreenerData(chain, address);
    
    // Merge data, preferring DexScreener for volume metrics
    const mergedData = {
      symbol: stats.symbol || priceData.symbol || 'UNKNOWN',
      name: stats.name || priceData.name || 'Unknown Token',
      
      // Volume data - prefer DexScreener (accurate), fallback to Moralis estimates
      buyVolume24h: dexScreenerData?.buyVolume24h || stats.buyVolume24h || 0,
      sellVolume24h: dexScreenerData?.sellVolume24h || stats.sellVolume24h || 0,
      totalVolume24h: dexScreenerData?.totalVolume24h || stats.totalVolume24h || 0,
      
      // Transaction counts - prefer DexScreener
      transactions24h: dexScreenerData?.transactions24h || stats.transactions24h || 0,
      buys24h: dexScreenerData?.buys24h || stats.buys24h || 0,
      sells24h: dexScreenerData?.sells24h || stats.sells24h || 0,
      
      // Liquidity - prefer DexScreener
      liquidity: dexScreenerData?.totalLiquidity || stats.liquidity || 0,
      
      // Price data - prefer DexScreener if available, otherwise Moralis
      priceUsd: dexScreenerData?.priceUsd || priceData.priceUsd || 0,
      priceChange24h: dexScreenerData?.priceChange24h || priceData.priceChange24h || 0,
      
      // Market cap and holders from Moralis
      marketCap: priceData.marketCap || 0,
      holders: stats.holders || 0,
    };
    
    // Calculate buy percentage from accurate volume data
    const buyPercentage = mergedData.totalVolume24h > 0 
      ? (mergedData.buyVolume24h / mergedData.totalVolume24h) * 100 
      : 50; // Default to 50% if no volume data
    
    // Calculate sentiment using merged data
    const sentiment = this.calculateSentiment(
      { ...stats, ...mergedData, buyPercentage }, 
      { ...priceData, ...mergedData }
    );
    
    console.log(`[Token Details] ${mergedData.symbol} - Volume: $${mergedData.totalVolume24h.toFixed(2)}, Buys: ${mergedData.buys24h}, Sells: ${mergedData.sells24h}`);
    
    return {
      chain,
      chainName: chainConfig.name,
      address,
      symbol: mergedData.symbol,
      name: mergedData.name,
      buyVolume24h: mergedData.buyVolume24h,
      sellVolume24h: mergedData.sellVolume24h,
      totalVolume24h: mergedData.totalVolume24h,
      buyPercentage,
      priceUsd: mergedData.priceUsd,
      priceChange24h: mergedData.priceChange24h,
      marketCap: mergedData.marketCap,
      holders: mergedData.holders,
      liquidity: mergedData.liquidity,
      transactions24h: mergedData.transactions24h,
      buys24h: mergedData.buys24h,
      sells24h: mergedData.sells24h,
      sentiment: sentiment.sentiment,
      sentimentScore: sentiment.score,
      sentimentReasons: sentiment.reasons,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get token stats from Moralis
   */
  private async getTokenStats(chain: string, address: string): Promise<any> {
    if (!this.moralisApiKey) {
      return this.getDefaultStats();
    }

    try {
      // Get the correct Moralis chain identifier
      const chainConfig = this.chains[chain];
      const moralisChain = chainConfig?.moralisChain || 'eth';
      
      // Get token metadata
      const metadataResponse = await fetch(
        `https://deep-index.moralis.io/api/v2.2/erc20/metadata?chain=${moralisChain}&addresses%5B0%5D=${address}`,
        {
          headers: {
            'X-API-Key': this.moralisApiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!metadataResponse.ok) {
        throw new Error(`Failed to fetch token metadata: ${metadataResponse.statusText}`);
      }

      const metadata = await metadataResponse.json();
      const tokenInfo = metadata[0] || {};

      // Note: /stats endpoint not available in paid Moralis API
      // Using estimated/default values for volume data
      // In production, you'd need to use on-chain data or alternative APIs
      
      const stats: any = {};
      
      // Calculate estimated buy/sell volumes based on market cap
      // This is a simplified estimation
      const volume24h = 0; // Not available without stats endpoint
      const transactions = 0;
      
      // Estimate buy/sell split (simplified)
      const buys = 0;
      const sells = 0;
      const buyVolume = 0;
      const sellVolume = 0;

      return {
        symbol: tokenInfo.symbol || 'UNKNOWN',
        name: tokenInfo.name || 'Unknown Token',
        buyVolume24h: buyVolume,
        sellVolume24h: sellVolume,
        totalVolume24h: volume24h,
        buyPercentage: 50, // Default to 50/50 split
        transactions24h: transactions,
        buys24h: buys,
        sells24h: sells,
        holders: 0, // Not available
        liquidity: 0, // Not available
      };
    } catch (error) {
      console.warn(`Could not fetch token stats for ${address}:`, error);
      return this.getDefaultStats();
    }
  }

  /**
   * Get token price data from Moralis
   */
  private async getTokenPrice(chain: string, address: string): Promise<any> {
    if (!this.moralisApiKey) {
      return this.getDefaultPriceData();
    }

    try {
      // Get the correct Moralis chain identifier
      const chainConfig = this.chains[chain];
      const moralisChain = chainConfig?.moralisChain || 'eth';
      
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2.2/erc20/${address}/price?chain=${moralisChain}&include=percent_change`,
        {
          headers: {
            'X-API-Key': this.moralisApiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch token price: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        symbol: data.tokenSymbol || 'UNKNOWN',
        name: data.tokenName || 'Unknown Token',
        priceUsd: parseFloat(data.usdPrice || '0'),
        priceChange24h: parseFloat(data['24hrPercentChange'] || '0'),
        marketCap: parseFloat(data.usdMarketCap || '0'),
      };
    } catch (error) {
      console.warn(`Could not fetch token price for ${address}:`, error);
      return this.getDefaultPriceData();
    }
  }

  /**
   * Get token data from DexScreener API (accurate volume and DEX data)
   */
  private async getDexScreenerData(chain: string, address: string): Promise<any> {
    try {
      // Map our chain names to DexScreener chain IDs
      const dexScreenerChainMap: Record<string, string> = {
        'ethereum': 'ethereum',
        'bsc': 'bsc',
        'polygon': 'polygon',
        'base': 'base',
      };

      const dexScreenerChain = dexScreenerChainMap[chain] || 'ethereum';
      
      console.log(`[DexScreener] Fetching data for ${address} on ${dexScreenerChain}...`);
      
      // DexScreener API endpoint - free, no API key required
      const url = `https://api.dexscreener.com/latest/dex/tokens/${address}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`[DexScreener] API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      
      // DexScreener returns an array of pairs for this token across different DEXs
      // We'll aggregate the data from all pairs on the target chain
      const pairs = data.pairs?.filter((pair: any) => 
        pair.chainId?.toLowerCase() === dexScreenerChain.toLowerCase()
      ) || [];

      if (pairs.length === 0) {
        console.warn(`[DexScreener] No pairs found for ${address} on ${dexScreenerChain}`);
        return null;
      }

      console.log(`[DexScreener] Found ${pairs.length} pairs for ${address} on ${dexScreenerChain}`);

      // Aggregate volume, liquidity, and transaction data from all pairs
      const aggregatedData = {
        totalVolume24h: 0,
        buyVolume24h: 0,
        sellVolume24h: 0,
        totalLiquidity: 0,
        transactions24h: 0,
        buys24h: 0,
        sells24h: 0,
        priceUsd: 0,
        priceChange24h: 0,
        holders: 0,
        pairs: pairs.length,
      };

      // Sum up data from all pairs
      for (const pair of pairs) {
        aggregatedData.totalVolume24h += parseFloat(pair.volume?.h24 || '0');
        aggregatedData.totalLiquidity += parseFloat(pair.liquidity?.usd || '0');
        aggregatedData.transactions24h += parseInt(pair.txns?.h24?.buys || '0') + parseInt(pair.txns?.h24?.sells || '0');
        aggregatedData.buys24h += parseInt(pair.txns?.h24?.buys || '0');
        aggregatedData.sells24h += parseInt(pair.txns?.h24?.sells || '0');
        
        // Use price from the largest liquidity pair
        const pairLiquidity = parseFloat(pair.liquidity?.usd || '0');
        if (pairLiquidity > aggregatedData.totalLiquidity / 2) {
          aggregatedData.priceUsd = parseFloat(pair.priceUsd || '0');
          aggregatedData.priceChange24h = parseFloat(pair.priceChange?.h24 || '0');
        }
      }

      // Estimate buy/sell volume split based on transaction counts
      // This is an approximation since DexScreener doesn't provide exact buy/sell volumes
      const buyRatio = aggregatedData.buys24h / (aggregatedData.buys24h + aggregatedData.sells24h || 1);
      aggregatedData.buyVolume24h = aggregatedData.totalVolume24h * buyRatio;
      aggregatedData.sellVolume24h = aggregatedData.totalVolume24h * (1 - buyRatio);

      console.log(`[DexScreener] Aggregated data:`, {
        volume24h: aggregatedData.totalVolume24h.toFixed(2),
        liquidity: aggregatedData.totalLiquidity.toFixed(2),
        buys: aggregatedData.buys24h,
        sells: aggregatedData.sells24h,
        txns: aggregatedData.transactions24h,
      });

      return aggregatedData;
    } catch (error) {
      console.error(`[DexScreener] Error fetching data for ${address}:`, error);
      return null;
    }
  }

  /**
   * Calculate token sentiment based on trading data
   */
  private calculateSentiment(stats: any, priceData: any): { sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 50; // Neutral starting point

    // Buy/Sell ratio
    if (stats.buyPercentage > 60) {
      score += 15;
      reasons.push(`Strong buying pressure (${stats.buyPercentage.toFixed(1)}% buys)`);
    } else if (stats.buyPercentage < 40) {
      score -= 15;
      reasons.push(`Selling pressure detected (${stats.buyPercentage.toFixed(1)}% buys)`);
    }

    // Price change
    if (priceData.priceChange24h > 10) {
      score += 15;
      reasons.push(`Strong 24h price increase (+${priceData.priceChange24h.toFixed(1)}%)`);
    } else if (priceData.priceChange24h < -10) {
      score -= 15;
      reasons.push(`24h price decline (${priceData.priceChange24h.toFixed(1)}%)`);
    } else if (priceData.priceChange24h > 0) {
      score += 5;
      reasons.push(`Positive price movement (+${priceData.priceChange24h.toFixed(1)}%)`);
    } else if (priceData.priceChange24h < 0) {
      score -= 5;
      reasons.push(`Negative price movement (${priceData.priceChange24h.toFixed(1)}%)`);
    }

    // Volume trend
    if (stats.buyVolume24h > stats.sellVolume24h * 1.5) {
      score += 10;
      reasons.push('Buy volume significantly exceeds sell volume');
    } else if (stats.sellVolume24h > stats.buyVolume24h * 1.5) {
      score -= 10;
      reasons.push('Sell volume significantly exceeds buy volume');
    }

    // Transaction count
    if (stats.transactions24h > 100) {
      score += 5;
      reasons.push(`High trading activity (${stats.transactions24h} txns)`);
    } else if (stats.transactions24h < 10) {
      score -= 5;
      reasons.push('Low trading activity');
    }

    // Liquidity
    if (stats.liquidity > 100000) {
      score += 5;
      reasons.push('Strong liquidity');
    } else if (stats.liquidity < 10000) {
      score -= 5;
      reasons.push('Low liquidity warning');
    }

    // Normalize score to 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine sentiment
    let sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    if (score >= 65) {
      sentiment = 'BULLISH';
    } else if (score <= 35) {
      sentiment = 'BEARISH';
    } else {
      sentiment = 'NEUTRAL';
    }

    return { sentiment, score, reasons };
  }

  /**
   * Get cached result if still valid
   */
  private getCachedResult(chain: string): ChainScanResult | null {
    const cached = this.cache.get(chain);
    const lastScanTime = this.lastScan.get(chain);
    
    if (cached && lastScanTime) {
      const age = Date.now() - lastScanTime.getTime();
      if (age < this.SCAN_INTERVAL) {
        console.log(`  Using cached data for ${chain} (age: ${Math.floor(age / 1000)}s)`);
        return cached;
      }
    }
    
    return null;
  }

  /**
   * Default stats for fallback
   */
  private getDefaultStats(): any {
    return {
      symbol: 'UNKNOWN',
      name: 'Unknown Token',
      buyVolume24h: 0,
      sellVolume24h: 0,
      totalVolume24h: 0,
      buyPercentage: 50,
      transactions24h: 0,
      buys24h: 0,
      sells24h: 0,
      holders: 0,
      liquidity: 0,
    };
  }

  /**
   * Default price data for fallback
   */
  private getDefaultPriceData(): any {
    return {
      symbol: 'UNKNOWN',
      name: 'Unknown Token',
      priceUsd: 0,
      priceChange24h: 0,
      marketCap: 0,
    };
  }

  /**
   * Sleep utility for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
    this.lastScan.clear();
    console.log('🧹 Cache cleared');
  }
}

// Export singleton instance
export const moralisScanner = new MoralisScanner();
