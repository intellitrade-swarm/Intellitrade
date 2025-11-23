
/**
 * API Endpoint: Top Tokens by Buy Volume Across EVM Chains
 * Scans Ethereum, BNB Chain, Polygon, and Base
 * Returns top 5 tokens per chain with sentiment analysis
 * Data Sources: Moralis (token discovery) + DexScreener (volume data)
 */

import { NextRequest, NextResponse } from 'next/server';
import { moralisScanner } from '@/lib/moralis-scanner';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Fetching top tokens across EVM chains...');
    
    // Scan all chains
    const results = await moralisScanner.scanAllChains();
    
    // Format response
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      chains: results.map(result => ({
        chain: result.chain,
        chainName: result.chainName,
        scanTime: result.scanTime,
        totalScanned: result.totalScanned,
        topTokens: result.topTokens.map(token => ({
          rank: result.topTokens.indexOf(token) + 1,
          symbol: token.symbol,
          name: token.name,
          address: token.address,
          buyVolume24h: token.buyVolume24h,
          sellVolume24h: token.sellVolume24h,
          totalVolume24h: token.totalVolume24h,
          buyPercentage: token.buyPercentage,
          priceUsd: token.priceUsd,
          priceChange24h: token.priceChange24h,
          marketCap: token.marketCap,
          holders: token.holders,
          liquidity: token.liquidity,
          transactions24h: token.transactions24h,
          buys24h: token.buys24h,
          sells24h: token.sells24h,
          sentiment: token.sentiment,
          sentimentScore: token.sentimentScore,
          sentimentReasons: token.sentimentReasons,
          lastUpdated: token.lastUpdated,
        })),
      })),
      summary: {
        totalChains: results.length,
        totalTopTokens: results.reduce((sum, r) => sum + r.topTokens.length, 0),
        bullishTokens: results.reduce((sum, r) => sum + r.topTokens.filter(t => t.sentiment === 'BULLISH').length, 0),
        bearishTokens: results.reduce((sum, r) => sum + r.topTokens.filter(t => t.sentiment === 'BEARISH').length, 0),
        neutralTokens: results.reduce((sum, r) => sum + r.topTokens.filter(t => t.sentiment === 'NEUTRAL').length, 0),
      },
    };
    
    console.log(`✅ API: Returning data for ${results.length} chains with ${response.summary.totalTopTokens} top tokens`);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ API Error fetching top tokens:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch top tokens',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to force refresh (bypass cache)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 API: Force refreshing top tokens data...');
    
    // Clear cache
    moralisScanner.clearCache();
    
    // Scan all chains
    const results = await moralisScanner.scanAllChains();
    
    return NextResponse.json({
      success: true,
      message: 'Data refreshed successfully',
      timestamp: new Date().toISOString(),
      chains: results.length,
      topTokens: results.reduce((sum, r) => sum + r.topTokens.length, 0),
    });
  } catch (error) {
    console.error('❌ API Error refreshing top tokens:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
