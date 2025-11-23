
/**
 * Aster Dex API Integration
 * Provides trading capabilities through Aster Dex perpetual contracts platform
 */

import crypto from 'crypto';

// Aster Dex API configuration
const ASTER_API_BASE_URL = 'https://fapi.asterdex.com';

// Dynamic getters for API credentials (read at runtime, not import time)
function getApiKey(): string {
  return process.env.ASTERDEX_API_KEY || '';
}

function getApiSecret(): string {
  return process.env.ASTERDEX_API_SECRET || '';
}

interface AsterOrderParams {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  quantity?: number;
  price?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

interface AsterOrderResponse {
  orderId: string;
  symbol: string;
  status: string;
  price: string;
  executedQty: string;
  side: string;
  type: string;
  transactTime: number;
}

interface AsterAccountInfo {
  totalWalletBalance: string;
  totalUnrealizedProfit: string;
  totalMarginBalance: string;
  availableBalance: string;
  assets: Array<{
    asset: string;
    walletBalance: string;
    unrealizedProfit: string;
    marginBalance: string;
    availableBalance: string;
  }>;
  positions: Array<{
    symbol: string;
    positionAmt: string;
    entryPrice: string;
    markPrice: string;
    unRealizedProfit: string;
    liquidationPrice: string;
    leverage: string;
  }>;
}

interface AsterMarketData {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
}

/**
 * Generate HMAC SHA256 signature for API requests
 */
function generateSignature(queryString: string): string {
  return crypto
    .createHmac('sha256', getApiSecret())
    .update(queryString)
    .digest('hex');
}

/**
 * Make signed request to Aster Dex API
 */
async function makeSignedRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE',
  params: Record<string, any> = {}
): Promise<any> {
  // Add timestamp
  const timestamp = Date.now();
  const queryParams = {
    ...params,
    timestamp,
  };

  // Create query string
  const queryString = Object.entries(queryParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');

  // Generate signature
  const signature = generateSignature(queryString);
  const signedQueryString = `${queryString}&signature=${signature}`;

  // Make request
  const url = `${ASTER_API_BASE_URL}${endpoint}?${signedQueryString}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'X-MBX-APIKEY': getApiKey(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Aster Dex API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Make public request to Aster Dex API (no signature required)
 */
async function makePublicRequest(
  endpoint: string,
  params: Record<string, any> = {}
): Promise<any> {
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');

  const url = queryString
    ? `${ASTER_API_BASE_URL}${endpoint}?${queryString}`
    : `${ASTER_API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Aster Dex API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Get current market price for a symbol
 */
export async function getMarketPrice(symbol: string): Promise<number> {
  try {
    const data = await makePublicRequest('/fapi/v1/ticker/24hr', { symbol });
    return parseFloat(data.lastPrice);
  } catch (error) {
    console.error(`Error getting market price for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get 24-hour ticker data for all symbols
 */
export async function getAllTickers(): Promise<AsterMarketData[]> {
  try {
    return await makePublicRequest('/fapi/v1/ticker/24hr');
  } catch (error) {
    console.error('Error getting all tickers:', error);
    throw error;
  }
}

/**
 * Get account information including balances and positions
 */
export async function getAccountInfo(): Promise<AsterAccountInfo> {
  try {
    return await makeSignedRequest('/fapi/v1/account', 'GET');
  } catch (error) {
    console.error('Error getting account info:', error);
    throw error;
  }
}

/**
 * Get position information
 */
export async function getPositionInfo(): Promise<any[]> {
  try {
    return await makeSignedRequest('/fapi/v2/positionRisk', 'GET');
  } catch (error) {
    console.error('Error getting position info:', error);
    throw error;
  }
}

/**
 * Place a new order on Aster Dex
 */
/**
 * Round quantity to correct precision for AsterDEX
 * Most perpetual contracts use 3 decimal places
 */
function roundToPrecision(quantity: number, symbol: string): number {
  // Most contracts use 3 decimals, but some may vary
  const precision = symbol.includes('USDT') ? 3 : 3;
  const multiplier = Math.pow(10, precision);
  return Math.floor(quantity * multiplier) / multiplier;
}

export async function placeOrder(params: AsterOrderParams): Promise<AsterOrderResponse> {
  try {
    const orderParams: Record<string, any> = {
      symbol: params.symbol,
      side: params.side,
      type: params.type,
    };

    if (params.quantity) {
      // Round quantity to correct precision
      orderParams.quantity = roundToPrecision(params.quantity, params.symbol);
    }

    if (params.price) {
      orderParams.price = params.price;
    }

    if (params.timeInForce) {
      orderParams.timeInForce = params.timeInForce;
    } else if (params.type === 'LIMIT') {
      orderParams.timeInForce = 'GTC'; // Good Till Cancel
    }

    return await makeSignedRequest('/fapi/v1/order', 'POST', orderParams);
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
}

/**
 * Cancel an order
 */
export async function cancelOrder(symbol: string, orderId: string): Promise<any> {
  try {
    return await makeSignedRequest('/fapi/v1/order', 'DELETE', {
      symbol,
      orderId,
    });
  } catch (error) {
    console.error('Error canceling order:', error);
    throw error;
  }
}

/**
 * Get order status
 */
export async function getOrderStatus(symbol: string, orderId: string): Promise<any> {
  try {
    return await makeSignedRequest('/fapi/v1/order', 'GET', {
      symbol,
      orderId,
    });
  } catch (error) {
    console.error('Error getting order status:', error);
    throw error;
  }
}

/**
 * Get all open orders
 */
export async function getOpenOrders(symbol?: string): Promise<any[]> {
  try {
    const params = symbol ? { symbol } : {};
    return await makeSignedRequest('/fapi/v1/openOrders', 'GET', params);
  } catch (error) {
    console.error('Error getting open orders:', error);
    throw error;
  }
}

/**
 * Set leverage for a symbol
 */
export async function setLeverage(symbol: string, leverage: number): Promise<any> {
  try {
    return await makeSignedRequest('/fapi/v1/leverage', 'POST', {
      symbol,
      leverage,
    });
  } catch (error) {
    console.error('Error setting leverage:', error);
    throw error;
  }
}

/**
 * Execute a market trade (simplified wrapper for AI agents)
 */
export async function executeMarketTrade(
  symbol: string,
  side: 'BUY' | 'SELL',
  quantity: number
): Promise<AsterOrderResponse> {
  try {
    console.log(`Executing market ${side} for ${quantity} ${symbol}`);
    
    return await placeOrder({
      symbol,
      side,
      type: 'MARKET',
      quantity,
    });
  } catch (error) {
    console.error('Error executing market trade:', error);
    throw error;
  }
}

/**
 * Test connection to Aster Dex API
 */
export async function testConnection(): Promise<boolean> {
  try {
    await makePublicRequest('/fapi/v1/ping');
    return true;
  } catch (error) {
    console.error('Error testing connection:', error);
    return false;
  }
}

/**
 * Check if Aster Dex is configured
 */
export function isConfigured(): boolean {
  return !!(getApiKey() && getApiSecret());
}

/**
 * Get configuration status
 */
export function getConfigStatus() {
  return {
    isConfigured: isConfigured(),
    hasApiKey: !!getApiKey(),
    hasApiSecret: !!getApiSecret(),
    baseUrl: ASTER_API_BASE_URL,
  };
}

/**
 * Get trade history for a symbol
 * @param symbol - Trading pair symbol (e.g., 'ETHUSDT')
 * @param limit - Number of trades to return (default: 500, max: 1000)
 * @param startTime - Start time in milliseconds
 * @param endTime - End time in milliseconds
 */
export async function getTradeHistory(
  symbol?: string,
  limit: number = 500,
  startTime?: number,
  endTime?: number
): Promise<any[]> {
  try {
    const params: Record<string, any> = {
      limit,
    };

    if (symbol) {
      params.symbol = symbol;
    }
    if (startTime) {
      params.startTime = startTime;
    }
    if (endTime) {
      params.endTime = endTime;
    }

    return await makeSignedRequest('/fapi/v1/userTrades', 'GET', params);
  } catch (error) {
    console.error('Error getting trade history:', error);
    throw error;
  }
}

/**
 * Get all orders (historical)
 * @param symbol - Trading pair symbol (e.g., 'ETHUSDT')
 * @param limit - Number of orders to return (default: 500, max: 1000)
 * @param startTime - Start time in milliseconds
 * @param endTime - End time in milliseconds
 */
export async function getAllOrders(
  symbol?: string,
  limit: number = 500,
  startTime?: number,
  endTime?: number
): Promise<any[]> {
  try {
    const params: Record<string, any> = {
      limit,
    };

    if (symbol) {
      params.symbol = symbol;
    }
    if (startTime) {
      params.startTime = startTime;
    }
    if (endTime) {
      params.endTime = endTime;
    }

    return await makeSignedRequest('/fapi/v1/allOrders', 'GET', params);
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
}

/**
 * Get income history (realized PnL, funding fees, etc.)
 * @param symbol - Trading pair symbol
 * @param incomeType - Type of income (REALIZED_PNL, FUNDING_FEE, etc.)
 * @param limit - Number of records to return (default: 100, max: 1000)
 * @param startTime - Start time in milliseconds
 * @param endTime - End time in milliseconds
 */
export async function getIncomeHistory(
  symbol?: string,
  incomeType?: string,
  limit: number = 1000,
  startTime?: number,
  endTime?: number
): Promise<any[]> {
  try {
    const params: Record<string, any> = {
      limit,
    };

    if (symbol) {
      params.symbol = symbol;
    }
    if (incomeType) {
      params.incomeType = incomeType;
    }
    if (startTime) {
      params.startTime = startTime;
    }
    if (endTime) {
      params.endTime = endTime;
    }

    return await makeSignedRequest('/fapi/v1/income', 'GET', params);
  } catch (error) {
    console.error('Error getting income history:', error);
    throw error;
  }
}
