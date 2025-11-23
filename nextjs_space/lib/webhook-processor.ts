
/**
 * TradingView Webhook Processor
 * Handles incoming webhooks and triggers appropriate swarm actions
 */

import { PrismaClient } from '@prisma/client';
import { tradingSwarm } from './trading-swarm';
import { multiAgentTrading } from './multi-agent-trading';
import { nansenAPI } from './nansen-api';

const prisma = new PrismaClient();

export interface WebhookPayload {
  // TradingView standard fields
  ticker?: string;
  exchange?: string;
  action?: 'buy' | 'sell' | 'hold';
  strategy?: string;
  price?: number;
  time?: string;
  
  // Nansen whale alert fields
  whaleAddress?: string;
  tokenAddress?: string;
  chain?: string;
  amount?: number;
  transactionHash?: string;
  
  // Custom fields
  alertType?: 'price' | 'volume' | 'whale' | 'technical' | 'custom';
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface WebhookResponse {
  success: boolean;
  webhookId: string;
  action: string;
  swarmDecision?: any;
  agentAction?: string;
  timestamp: string;
  processingTime: number;
}

class WebhookProcessor {
  /**
   * Process incoming TradingView webhook
   */
  async processTradingViewWebhook(
    payload: WebhookPayload,
    source: string = 'tradingview'
  ): Promise<WebhookResponse> {
    const startTime = Date.now();
    
    try {
      // Validate payload
      if (!payload.ticker && !payload.tokenAddress) {
        throw new Error('Missing ticker or tokenAddress in webhook payload');
      }

      // Store webhook event
      const webhookEvent = await this.storeWebhookEvent(payload, source);

      console.log(`\n${'='.repeat(70)}`);
      console.log(`🔔 WEBHOOK RECEIVED: ${source.toUpperCase()}`);
      console.log(`${'='.repeat(70)}`);
      console.log(`Ticker: ${payload.ticker || 'N/A'}`);
      console.log(`Action: ${payload.action || 'N/A'}`);
      console.log(`Alert Type: ${payload.alertType || 'N/A'}`);
      console.log(`${'='.repeat(70)}\n`);

      // Route to appropriate handler
      let response: WebhookResponse;

      if (payload.alertType === 'whale' || payload.whaleAddress) {
        response = await this.handleWhaleAlert(payload, webhookEvent.id);
      } else if (payload.alertType === 'technical') {
        response = await this.handleTechnicalAlert(payload, webhookEvent.id);
      } else {
        response = await this.handleGeneralAlert(payload, webhookEvent.id);
      }

      // Update webhook event with result
      await this.updateWebhookEvent(webhookEvent.id, {
        processed: true,
        swarmDecision: response.swarmDecision,
        processingTime: Date.now() - startTime,
      });

      return {
        ...response,
        webhookId: webhookEvent.id,
        processingTime: Date.now() - startTime,
      };

    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }

  /**
   * Handle Nansen whale alerts
   */
  private async handleWhaleAlert(
    payload: WebhookPayload,
    webhookId: string
  ): Promise<WebhookResponse> {
    console.log('🐋 Processing Whale Alert...');

    const symbol = payload.ticker || this.extractSymbolFromToken(payload.tokenAddress);
    const chain = payload.chain || 'ethereum';

    // Fetch additional Nansen data for context
    let nansenData = null;
    try {
      if (payload.tokenAddress && nansenAPI.isConfigured()) {
        const [smartMoney, flowIntel] = await Promise.all([
          nansenAPI.getSmartMoneyActivity(payload.tokenAddress, chain),
          nansenAPI.getFlowIntelligence(payload.tokenAddress, chain),
        ]);

        nansenData = { smartMoney, flowIntel };
        console.log('✅ Fetched Nansen data for whale alert context');
      }
    } catch (error) {
      console.warn('⚠️  Failed to fetch Nansen data:', error);
    }

    // Trigger swarm analysis with whale context
    const swarmDecision = await tradingSwarm.analyzeSymbol(
      symbol,
      'webhook-whale-alert',
      10000 // Default balance for analysis
    );

    console.log(`🎯 Swarm Decision: ${(swarmDecision as any).finalRecommendation || 'HOLD'} (${(swarmDecision as any).consensusConfidence || 0}% confidence)`);

    return {
      success: true,
      webhookId,
      action: 'whale_alert_analyzed',
      swarmDecision,
      agentAction: this.determineAgentAction(swarmDecision),
      timestamp: new Date().toISOString(),
      processingTime: 0, // Will be filled by caller
    };
  }

  /**
   * Handle technical indicator alerts
   */
  private async handleTechnicalAlert(
    payload: WebhookPayload,
    webhookId: string
  ): Promise<WebhookResponse> {
    console.log('📊 Processing Technical Alert...');

    const symbol = payload.ticker || 'UNKNOWN';

    // Use multi-agent system for technical analysis
    const decision = await multiAgentTrading.analyzeTrade(
      {
        symbol,
        chain: payload.exchange || 'ethereum',
        marketData: {
          symbol,
          price: payload.price || 0,
          priceChange24h: 0,
          volume24h: 0,
          marketCap: 0,
        },
      },
      {
        balance: 10000,
        openPositions: 0,
        dailyPnL: 0,
      }
    );

    console.log(`🎯 Multi-Agent Decision: ${decision.action} (${decision.confidence}% confidence)`);

    return {
      success: true,
      webhookId,
      action: 'technical_alert_analyzed',
      swarmDecision: decision,
      agentAction: decision.approved ? decision.action : 'HOLD',
      timestamp: new Date().toISOString(),
      processingTime: 0,
    };
  }

  /**
   * Handle general alerts
   */
  private async handleGeneralAlert(
    payload: WebhookPayload,
    webhookId: string
  ): Promise<WebhookResponse> {
    console.log('🔔 Processing General Alert...');

    const symbol = payload.ticker || 'UNKNOWN';

    // Use swarm for general analysis
    const swarmDecision = await tradingSwarm.analyzeSymbol(
      symbol,
      'webhook-general',
      10000
    );

    return {
      success: true,
      webhookId,
      action: 'general_alert_analyzed',
      swarmDecision,
      agentAction: this.determineAgentAction(swarmDecision),
      timestamp: new Date().toISOString(),
      processingTime: 0,
    };
  }

  /**
   * Store webhook event in database
   */
  private async storeWebhookEvent(payload: WebhookPayload, source: string) {
    try {
      // @ts-ignore - WebhookEvent model will be available after migration
      const event = await prisma.webhookEvent.create({
        data: {
          source,
          payload: payload as any,
          alertType: payload.alertType || 'custom',
          symbol: payload.ticker || this.extractSymbolFromToken(payload.tokenAddress),
          processed: false,
          createdAt: new Date(),
        },
      });

      return event;
    } catch (error) {
      // If WebhookEvent table doesn't exist, log warning and return mock
      console.warn('⚠️  WebhookEvent table not available, using in-memory tracking');
      return {
        id: `mock-${Date.now()}`,
        source,
        payload,
        alertType: payload.alertType || 'custom',
        symbol: payload.ticker || 'UNKNOWN',
        processed: false,
        createdAt: new Date(),
      };
    }
  }

  /**
   * Update webhook event with processing results
   */
  private async updateWebhookEvent(
    id: string,
    updates: {
      processed: boolean;
      swarmDecision?: any;
      processingTime: number;
    }
  ) {
    try {
      // @ts-ignore - WebhookEvent model will be available after migration
      await prisma.webhookEvent.update({
        where: { id },
        data: {
          processed: updates.processed,
          swarmDecision: updates.swarmDecision as any,
          processingTime: updates.processingTime,
          processedAt: new Date(),
        },
      });
    } catch (error) {
      console.warn('⚠️  Could not update webhook event:', error);
    }
  }

  /**
   * Extract symbol from token address (simplified)
   */
  private extractSymbolFromToken(tokenAddress?: string): string {
    if (!tokenAddress) return 'UNKNOWN';
    
    // Map common token addresses to symbols
    const tokenMap: Record<string, string> = {
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'ETH',
      '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT',
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'WBTC',
    };

    return tokenMap[tokenAddress.toLowerCase()] || 'UNKNOWN';
  }

  /**
   * Determine agent action from swarm decision
   */
  private determineAgentAction(decision: any): string {
    if (!decision) return 'NONE';
    
    if (decision.recommendation) {
      return decision.recommendation;
    }
    
    if (decision.action) {
      return decision.action;
    }

    return 'HOLD';
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<{
    total: number;
    processed: number;
    pending: number;
    byAlertType: Record<string, number>;
    bySource: Record<string, number>;
    avgProcessingTime: number;
    recentEvents: any[];
  }> {
    try {
      const timeMap = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };

      const since = new Date(Date.now() - timeMap[timeframe]);

      // @ts-ignore - WebhookEvent model will be available after migration
      const events = await prisma.webhookEvent.findMany({
        where: {
          createdAt: {
            gte: since,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      });

      const stats = {
        total: events.length,
        processed: events.filter((e: any) => e.processed).length,
        pending: events.filter((e: any) => !e.processed).length,
        byAlertType: {} as Record<string, number>,
        bySource: {} as Record<string, number>,
        avgProcessingTime: 0,
        recentEvents: events.slice(0, 10),
      };

      // Calculate aggregations
      events.forEach((event: any) => {
        stats.byAlertType[event.alertType] = (stats.byAlertType[event.alertType] || 0) + 1;
        stats.bySource[event.source] = (stats.bySource[event.source] || 0) + 1;
      });

      const processedEvents = events.filter((e: any) => e.processed && e.processingTime);
      if (processedEvents.length > 0) {
        stats.avgProcessingTime = processedEvents.reduce((sum: number, e: any) => sum + (e.processingTime || 0), 0) / processedEvents.length;
      }

      return stats;

    } catch (error) {
      console.warn('⚠️  Could not fetch webhook stats:', error);
      return {
        total: 0,
        processed: 0,
        pending: 0,
        byAlertType: {},
        bySource: {},
        avgProcessingTime: 0,
        recentEvents: [],
      };
    }
  }
}

// Export singleton instance
export const webhookProcessor = new WebhookProcessor();
