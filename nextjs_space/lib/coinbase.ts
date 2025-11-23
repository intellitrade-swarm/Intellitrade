
/**
 * Coinbase API Integration (DEPRECATED)
 * THIS MODULE IS NO LONGER USED - ALL TRADING NOW USES AVANTIS DEX
 * Kept for backward compatibility only
 */

export function isConfigured(): boolean {
  console.warn('⚠️ Coinbase integration is deprecated. Please use Avantis DEX instead.');
  return false;
}

export async function getAccountBalances(): Promise<any[]> {
  throw new Error('Coinbase integration is deprecated. Use Avantis DEX instead.');
}

export async function getUSDBalance(): Promise<number> {
  throw new Error('Coinbase integration is deprecated. Use Avantis DEX instead.');
}

export async function getProducts(): Promise<any[]> {
  throw new Error('Coinbase integration is deprecated. Use Avantis DEX instead.');
}

export async function getAllTickers(): Promise<any[]> {
  throw new Error('Coinbase integration is deprecated. Use Avantis DEX instead.');
}

export async function getProductTicker(productId: string): Promise<any> {
  throw new Error('Coinbase integration is deprecated. Use Avantis DEX instead.');
}

export async function getCurrentPrice(symbol: string): Promise<number> {
  throw new Error('Coinbase integration is deprecated. Use Avantis DEX instead.');
}

export async function executeMarketTrade(
  symbol: string,
  side: 'BUY' | 'SELL',
  usdAmount: number
): Promise<any> {
  throw new Error('Coinbase integration is deprecated. Use Avantis DEX instead.');
}

export async function getOrderHistory(limit: number = 100): Promise<any[]> {
  throw new Error('Coinbase integration is deprecated. Use Avantis DEX instead.');
}

export async function getAccountInfo(): Promise<any> {
  throw new Error('Coinbase integration is deprecated. Use Avantis DEX instead.');
}

export async function testConnection(): Promise<boolean> {
  console.warn('⚠️ Coinbase integration is deprecated. Please use Avantis DEX instead.');
  return false;
}
