
/**
 * Professional-Grade Chainlink Oracle Integration
 * Implements Chainlink's Any API pattern with external adapters
 * 
 * Features:
 * - Decentralized data aggregation
 * - External adapter framework
 * - Job specifications for data fetching
 * - Request/response cycle management
 * - Multi-source data verification
 */

import { prisma } from './db';
import { callAI, AIProvider } from './ai-providers';

// ============================================================================
// Types and Interfaces
// ============================================================================

export enum RequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  FULFILLED = 'fulfilled',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum DataSourceType {
  PRICE_FEED = 'price_feed',
  MARKET_DATA = 'market_data',
  AI_ANALYSIS = 'ai_analysis',
  CROSS_CHAIN = 'cross_chain',
  LIQUIDITY = 'liquidity',
  TECHNICAL = 'technical',
}

export interface ChainlinkRequest {
  id: string;
  jobId: string;
  requester: string;
  dataSource: DataSourceType;
  parameters: Record<string, any>;
  status: RequestStatus;
  result?: any;
  responses: OracleResponse[];
  consensus?: any;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  callbackUrl?: string;
}

export interface OracleResponse {
  nodeId: string;
  requestId: string;
  data: any;
  timestamp: Date;
  signature?: string;
  metadata?: Record<string, any>;
}

export interface ExternalAdapter {
  id: string;
  name: string;
  endpoint: string;
  type: DataSourceType;
  authentication?: {
    type: 'api_key' | 'oauth' | 'none';
    credentials?: Record<string, string>;
  };
  rateLimit?: {
    requests: number;
    period: number; // seconds
  };
  timeout: number;
  retries: number;
}

export interface JobSpecification {
  id: string;
  name: string;
  description: string;
  dataSource: DataSourceType;
  adapters: string[]; // adapter IDs
  tasks: Task[];
  minResponses: number; // For consensus
  enabled: boolean;
}

export interface Task {
  id: string;
  type: 'http' | 'json_parse' | 'multiply' | 'divide' | 'ai_process' | 'aggregate';
  parameters: Record<string, any>;
  nextTask?: string;
}

// ============================================================================
// External Adapters
// ============================================================================

const EXTERNAL_ADAPTERS: ExternalAdapter[] = [
  {
    id: 'dexscreener_adapter',
    name: 'DexScreener Price Feed',
    endpoint: 'https://api.dexscreener.com',
    type: DataSourceType.PRICE_FEED,
    authentication: { type: 'none' },
    timeout: 5000,
    retries: 3,
  },
  {
    id: 'defillama_adapter',
    name: 'DefiLlama Protocol Data',
    endpoint: 'https://api.llama.fi',
    type: DataSourceType.LIQUIDITY,
    authentication: { type: 'none' },
    timeout: 5000,
    retries: 3,
  },
  {
    id: 'coingecko_adapter',
    name: 'CoinGecko Market Data',
    endpoint: 'https://api.coingecko.com/api/v3',
    type: DataSourceType.MARKET_DATA,
    authentication: { type: 'none' },
    timeout: 5000,
    retries: 3,
  },
  {
    id: 'nvidia_ai_adapter',
    name: 'NVIDIA AI Analysis',
    endpoint: 'internal',
    type: DataSourceType.AI_ANALYSIS,
    authentication: { type: 'api_key' },
    timeout: 30000,
    retries: 2,
  },
  {
    id: 'grok_ai_adapter',
    name: 'Grok AI Analysis',
    endpoint: 'internal',
    type: DataSourceType.AI_ANALYSIS,
    authentication: { type: 'api_key' },
    timeout: 30000,
    retries: 2,
  },
];

// ============================================================================
// Job Specifications
// ============================================================================

const JOB_SPECIFICATIONS: JobSpecification[] = [
  {
    id: 'price_feed_job',
    name: 'Multi-Source Price Feed',
    description: 'Aggregates price data from multiple DEXs and verifies consensus',
    dataSource: DataSourceType.PRICE_FEED,
    adapters: ['dexscreener_adapter', 'coingecko_adapter'],
    tasks: [
      {
        id: 'fetch_dexscreener',
        type: 'http',
        parameters: {
          method: 'GET',
          url: 'https://api.dexscreener.com/latest/dex/search',
          queryParam: 'q',
        },
      },
      {
        id: 'parse_dex_response',
        type: 'json_parse',
        parameters: {
          path: 'pairs.0.priceUsd',
        },
        nextTask: 'aggregate_prices',
      },
      {
        id: 'fetch_coingecko',
        type: 'http',
        parameters: {
          method: 'GET',
          url: 'https://api.coingecko.com/api/v3/simple/price',
        },
      },
      {
        id: 'aggregate_prices',
        type: 'aggregate',
        parameters: {
          method: 'median',
          sources: ['dexscreener', 'coingecko'],
        },
      },
    ],
    minResponses: 2,
    enabled: true,
  },
  {
    id: 'ai_analysis_job',
    name: 'Multi-AI Market Analysis',
    description: 'Generates trading signals using multiple AI providers',
    dataSource: DataSourceType.AI_ANALYSIS,
    adapters: ['nvidia_ai_adapter', 'grok_ai_adapter'],
    tasks: [
      {
        id: 'fetch_market_context',
        type: 'http',
        parameters: {
          internal: true,
          method: 'market_data',
        },
      },
      {
        id: 'ai_nvidia_analysis',
        type: 'ai_process',
        parameters: {
          provider: 'NVIDIA',
          promptTemplate: 'analyze_token',
        },
      },
      {
        id: 'ai_grok_analysis',
        type: 'ai_process',
        parameters: {
          provider: 'GROK',
          promptTemplate: 'analyze_token',
        },
      },
      {
        id: 'aggregate_ai_signals',
        type: 'aggregate',
        parameters: {
          method: 'weighted_average',
          weights: { NVIDIA: 0.5, GROK: 0.5 },
        },
      },
    ],
    minResponses: 2,
    enabled: true,
  },
  {
    id: 'liquidity_monitor_job',
    name: 'Cross-Chain Liquidity Monitor',
    description: 'Monitors liquidity across multiple chains and DEXs',
    dataSource: DataSourceType.LIQUIDITY,
    adapters: ['defillama_adapter', 'dexscreener_adapter'],
    tasks: [
      {
        id: 'fetch_defillama_tvl',
        type: 'http',
        parameters: {
          method: 'GET',
          url: 'https://api.llama.fi/protocol',
        },
      },
      {
        id: 'fetch_dex_liquidity',
        type: 'http',
        parameters: {
          method: 'GET',
          url: 'https://api.dexscreener.com/latest/dex/search',
        },
      },
      {
        id: 'aggregate_liquidity',
        type: 'aggregate',
        parameters: {
          method: 'sum',
          field: 'liquidity',
        },
      },
    ],
    minResponses: 2,
    enabled: true,
  },
];

// ============================================================================
// Chainlink Oracle Client
// ============================================================================

export class ChainlinkOracleClient {
  private adapters: Map<string, ExternalAdapter>;
  private jobs: Map<string, JobSpecification>;
  private activeRequests: Map<string, ChainlinkRequest>;

  constructor() {
    this.adapters = new Map(EXTERNAL_ADAPTERS.map(a => [a.id, a]));
    this.jobs = new Map(JOB_SPECIFICATIONS.map(j => [j.id, j]));
    this.activeRequests = new Map();
  }

  /**
   * Create a new oracle request
   */
  async createRequest(
    jobId: string,
    requester: string,
    parameters: Record<string, any>,
    callbackUrl?: string
  ): Promise<ChainlinkRequest> {
    const job = this.jobs.get(jobId);
    if (!job || !job.enabled) {
      throw new Error(`Job ${jobId} not found or disabled`);
    }

    const request: ChainlinkRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      jobId,
      requester,
      dataSource: job.dataSource,
      parameters,
      status: RequestStatus.PENDING,
      responses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 300000), // 5 minutes
      callbackUrl,
    };

    this.activeRequests.set(request.id, request);

    // Execute request asynchronously
    this.executeRequest(request.id).catch(error => {
      console.error(`Request ${request.id} failed:`, error);
      this.updateRequestStatus(request.id, RequestStatus.FAILED);
    });

    return request;
  }

  /**
   * Execute a request through external adapters
   */
  private async executeRequest(requestId: string): Promise<void> {
    const request = this.activeRequests.get(requestId);
    if (!request) throw new Error(`Request ${requestId} not found`);

    const job = this.jobs.get(request.jobId);
    if (!job) throw new Error(`Job ${request.jobId} not found`);

    this.updateRequestStatus(requestId, RequestStatus.PROCESSING);

    const responses: OracleResponse[] = [];

    // Execute tasks through adapters
    for (const adapterId of job.adapters) {
      const adapter = this.adapters.get(adapterId);
      if (!adapter) continue;

      try {
        const response = await this.callAdapter(adapter, request);
        responses.push(response);
      } catch (error) {
        console.error(`Adapter ${adapterId} failed:`, error);
      }
    }

    // Store responses
    request.responses = responses;

    // Check if we have minimum responses for consensus
    if (responses.length >= job.minResponses) {
      const consensus = this.calculateConsensus(responses, job);
      request.consensus = consensus;
      request.result = consensus;
      this.updateRequestStatus(requestId, RequestStatus.FULFILLED);

      // Trigger callback if provided
      if (request.callbackUrl) {
        await this.triggerCallback(request);
      }
    } else {
      this.updateRequestStatus(requestId, RequestStatus.FAILED);
      request.result = { error: 'Insufficient responses for consensus' };
    }
  }

  /**
   * Call external adapter
   */
  private async callAdapter(
    adapter: ExternalAdapter,
    request: ChainlinkRequest
  ): Promise<OracleResponse> {
    const startTime = Date.now();

    let result: any;

    switch (adapter.type) {
      case DataSourceType.PRICE_FEED:
        result = await this.fetchPriceData(adapter, request.parameters);
        break;

      case DataSourceType.MARKET_DATA:
        result = await this.fetchMarketData(adapter, request.parameters);
        break;

      case DataSourceType.AI_ANALYSIS:
        result = await this.callAIAdapter(adapter, request.parameters);
        break;

      case DataSourceType.LIQUIDITY:
        result = await this.fetchLiquidityData(adapter, request.parameters);
        break;

      default:
        throw new Error(`Unsupported adapter type: ${adapter.type}`);
    }

    return {
      nodeId: adapter.id,
      requestId: request.id,
      data: result,
      timestamp: new Date(),
      metadata: {
        processingTime: Date.now() - startTime,
        adapterName: adapter.name,
      },
    };
  }

  /**
   * Fetch price data from adapter
   */
  private async fetchPriceData(
    adapter: ExternalAdapter,
    params: Record<string, any>
  ): Promise<any> {
    const { symbol } = params;

    if (adapter.id === 'dexscreener_adapter') {
      const response = await fetch(
        `${adapter.endpoint}/latest/dex/search?q=${symbol}`,
        { signal: AbortSignal.timeout(adapter.timeout) }
      );

      if (!response.ok) throw new Error(`DexScreener API error: ${response.statusText}`);

      const data = await response.json();
      const pair = data.pairs?.[0];

      return {
        price: parseFloat(pair?.priceUsd || '0'),
        volume24h: parseFloat(pair?.volume?.h24 || '0'),
        liquidity: parseFloat(pair?.liquidity?.usd || '0'),
        priceChange24h: parseFloat(pair?.priceChange?.h24 || '0'),
        source: 'dexscreener',
      };
    }

    if (adapter.id === 'coingecko_adapter') {
      const response = await fetch(
        `${adapter.endpoint}/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`,
        { signal: AbortSignal.timeout(adapter.timeout) }
      );

      if (!response.ok) throw new Error(`CoinGecko API error: ${response.statusText}`);

      const data = await response.json();
      const tokenData = data[symbol.toLowerCase()];

      return {
        price: tokenData?.usd || 0,
        volume24h: tokenData?.usd_24h_vol || 0,
        priceChange24h: tokenData?.usd_24h_change || 0,
        source: 'coingecko',
      };
    }

    throw new Error(`Unknown price adapter: ${adapter.id}`);
  }

  /**
   * Fetch market data from adapter
   */
  private async fetchMarketData(
    adapter: ExternalAdapter,
    params: Record<string, any>
  ): Promise<any> {
    // Similar to fetchPriceData but with more comprehensive data
    return this.fetchPriceData(adapter, params);
  }

  /**
   * Call AI analysis adapter
   */
  private async callAIAdapter(
    adapter: ExternalAdapter,
    params: Record<string, any>
  ): Promise<any> {
    const { symbol, marketData, prompt } = params;

    let provider: AIProvider;
    if (adapter.id === 'nvidia_ai_adapter') {
      provider = 'NVIDIA';
    } else if (adapter.id === 'grok_ai_adapter') {
      provider = 'GROK';
    } else {
      provider = 'OPENAI';
    }

    const analysisPrompt = prompt || `Analyze ${symbol} with the following data:
Price: $${marketData?.price || 'N/A'}
24h Volume: $${marketData?.volume24h?.toLocaleString() || 'N/A'}
24h Change: ${marketData?.priceChange24h || 'N/A'}%
Liquidity: $${marketData?.liquidity?.toLocaleString() || 'N/A'}

Provide:
1. Sentiment (BULLISH/BEARISH/NEUTRAL)
2. Confidence score (0-100)
3. Trading recommendation (BUY/SELL/HOLD)
4. Brief analysis (2-3 sentences)

Format response as JSON:
{
  "sentiment": "BULLISH/BEARISH/NEUTRAL",
  "confidence": 85,
  "recommendation": "BUY/SELL/HOLD",
  "analysis": "..."
}`;

    try {
      const aiResponse = await callAI(provider, analysisPrompt);
      
      // Try to parse JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          provider,
          source: 'ai_analysis',
        };
      }

      // Fallback parsing
      return {
        sentiment: aiResponse.includes('BULLISH') ? 'BULLISH' : 
                   aiResponse.includes('BEARISH') ? 'BEARISH' : 'NEUTRAL',
        confidence: 50,
        recommendation: 'HOLD',
        analysis: aiResponse,
        provider,
        source: 'ai_analysis',
      };
    } catch (error) {
      console.error(`AI adapter ${adapter.id} error:`, error);
      throw error;
    }
  }

  /**
   * Fetch liquidity data from adapter
   */
  private async fetchLiquidityData(
    adapter: ExternalAdapter,
    params: Record<string, any>
  ): Promise<any> {
    const { protocol, chain } = params;

    if (adapter.id === 'defillama_adapter') {
      const response = await fetch(
        `${adapter.endpoint}/protocol/${protocol}`,
        { signal: AbortSignal.timeout(adapter.timeout) }
      );

      if (!response.ok) throw new Error(`DefiLlama API error: ${response.statusText}`);

      const data = await response.json();

      return {
        tvl: data.tvl || 0,
        chainTvls: data.chainTvls || {},
        change24h: data.change_1d || 0,
        source: 'defillama',
      };
    }

    throw new Error(`Unknown liquidity adapter: ${adapter.id}`);
  }

  /**
   * Calculate consensus from multiple responses
   */
  private calculateConsensus(
    responses: OracleResponse[],
    job: JobSpecification
  ): any {
    if (responses.length === 0) return null;

    switch (job.dataSource) {
      case DataSourceType.PRICE_FEED:
      case DataSourceType.MARKET_DATA:
        return this.calculatePriceConsensus(responses);

      case DataSourceType.AI_ANALYSIS:
        return this.calculateAIConsensus(responses);

      case DataSourceType.LIQUIDITY:
        return this.calculateLiquidityConsensus(responses);

      default:
        return responses[0]?.data;
    }
  }

  /**
   * Calculate price consensus (median of prices)
   */
  private calculatePriceConsensus(responses: OracleResponse[]): any {
    const prices = responses.map(r => r.data.price).filter(p => p > 0);
    if (prices.length === 0) return null;

    prices.sort((a, b) => a - b);
    const median = prices.length % 2 === 0
      ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
      : prices[Math.floor(prices.length / 2)];

    // Calculate average of other metrics
    const avgVolume = responses.reduce((sum, r) => sum + (r.data.volume24h || 0), 0) / responses.length;
    const avgChange = responses.reduce((sum, r) => sum + (r.data.priceChange24h || 0), 0) / responses.length;

    return {
      price: median,
      volume24h: avgVolume,
      priceChange24h: avgChange,
      sources: responses.length,
      consensus: 'median',
      timestamp: new Date(),
    };
  }

  /**
   * Calculate AI consensus (weighted average of signals)
   */
  private calculateAIConsensus(responses: OracleResponse[]): any {
    const bullishCount = responses.filter(r => r.data.sentiment === 'BULLISH').length;
    const bearishCount = responses.filter(r => r.data.sentiment === 'BEARISH').length;
    const neutralCount = responses.filter(r => r.data.sentiment === 'NEUTRAL').length;

    const avgConfidence = responses.reduce((sum, r) => sum + (r.data.confidence || 50), 0) / responses.length;

    let consensusSentiment: string;
    if (bullishCount > bearishCount && bullishCount > neutralCount) {
      consensusSentiment = 'BULLISH';
    } else if (bearishCount > bullishCount && bearishCount > neutralCount) {
      consensusSentiment = 'BEARISH';
    } else {
      consensusSentiment = 'NEUTRAL';
    }

    // Determine recommendation based on sentiment and confidence
    let recommendation: string;
    if (consensusSentiment === 'BULLISH' && avgConfidence > 70) {
      recommendation = 'BUY';
    } else if (consensusSentiment === 'BEARISH' && avgConfidence > 70) {
      recommendation = 'SELL';
    } else {
      recommendation = 'HOLD';
    }

    return {
      sentiment: consensusSentiment,
      confidence: avgConfidence,
      recommendation,
      aiProviders: responses.length,
      breakdown: {
        bullish: bullishCount,
        bearish: bearishCount,
        neutral: neutralCount,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Calculate liquidity consensus
   */
  private calculateLiquidityConsensus(responses: OracleResponse[]): any {
    const totalTvl = responses.reduce((sum, r) => sum + (r.data.tvl || 0), 0);
    const avgChange = responses.reduce((sum, r) => sum + (r.data.change24h || 0), 0) / responses.length;

    return {
      totalTvl,
      change24h: avgChange,
      sources: responses.length,
      timestamp: new Date(),
    };
  }

  /**
   * Update request status
   */
  private updateRequestStatus(requestId: string, status: RequestStatus): void {
    const request = this.activeRequests.get(requestId);
    if (request) {
      request.status = status;
      request.updatedAt = new Date();
    }
  }

  /**
   * Trigger callback URL with result
   */
  private async triggerCallback(request: ChainlinkRequest): Promise<void> {
    if (!request.callbackUrl) return;

    try {
      await fetch(request.callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          status: request.status,
          result: request.result,
          consensus: request.consensus,
        }),
      });
    } catch (error) {
      console.error(`Callback failed for ${request.id}:`, error);
    }
  }

  /**
   * Get request status
   */
  getRequest(requestId: string): ChainlinkRequest | undefined {
    return this.activeRequests.get(requestId);
  }

  /**
   * List all active requests
   */
  listRequests(): ChainlinkRequest[] {
    return Array.from(this.activeRequests.values());
  }

  /**
   * Get adapter info
   */
  getAdapter(adapterId: string): ExternalAdapter | undefined {
    return this.adapters.get(adapterId);
  }

  /**
   * List all adapters
   */
  listAdapters(): ExternalAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Get job specification
   */
  getJob(jobId: string): JobSpecification | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * List all job specifications
   */
  listJobs(): JobSpecification[] {
    return Array.from(this.jobs.values());
  }
}

// Export singleton instance
export const chainlinkOracle = new ChainlinkOracleClient();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Request price feed data with consensus
 */
export async function requestPriceFeed(
  symbol: string,
  requester: string = 'system'
): Promise<any> {
  const request = await chainlinkOracle.createRequest(
    'price_feed_job',
    requester,
    { symbol }
  );

  // Wait for fulfillment (with timeout)
  const maxWait = 30000; // 30 seconds
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    const current = chainlinkOracle.getRequest(request.id);
    if (current?.status === RequestStatus.FULFILLED) {
      return current.result;
    }
    if (current?.status === RequestStatus.FAILED) {
      throw new Error('Request failed');
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw new Error('Request timeout');
}

/**
 * Request AI analysis with multi-provider consensus
 */
export async function requestAIAnalysis(
  symbol: string,
  marketData: any,
  requester: string = 'system'
): Promise<any> {
  const request = await chainlinkOracle.createRequest(
    'ai_analysis_job',
    requester,
    { symbol, marketData }
  );

  // Wait for fulfillment
  const maxWait = 60000; // 60 seconds for AI
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    const current = chainlinkOracle.getRequest(request.id);
    if (current?.status === RequestStatus.FULFILLED) {
      return current.result;
    }
    if (current?.status === RequestStatus.FAILED) {
      throw new Error('Request failed');
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Request timeout');
}

/**
 * Request liquidity monitoring
 */
export async function requestLiquidityData(
  protocol: string,
  chain?: string,
  requester: string = 'system'
): Promise<any> {
  const request = await chainlinkOracle.createRequest(
    'liquidity_monitor_job',
    requester,
    { protocol, chain }
  );

  // Wait for fulfillment
  const maxWait = 30000;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    const current = chainlinkOracle.getRequest(request.id);
    if (current?.status === RequestStatus.FULFILLED) {
      return current.result;
    }
    if (current?.status === RequestStatus.FAILED) {
      throw new Error('Request failed');
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw new Error('Request timeout');
}
