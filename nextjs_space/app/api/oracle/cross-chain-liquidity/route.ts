
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route for cross-chain liquidity data
 * Aggregates liquidity information across multiple chains
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, chains } = body;

    if (!token || !chains || !Array.isArray(chains)) {
      return NextResponse.json(
        { error: 'Missing required parameters: token, chains (array)' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Fetch liquidity data for each chain
    const liquidityData = await Promise.all(
      chains.map(async (chain: string) => {
        try {
          let apiUrl = '';
          
          switch (chain.toLowerCase()) {
            case 'solana':
              apiUrl = `https://api.dexscreener.com/latest/dex/search?q=${token}`;
              break;
            case 'ethereum':
            case 'base':
            case 'polygon':
              apiUrl = `https://api.dexscreener.com/latest/dex/search?q=${token}`;
              break;
            default:
              throw new Error(`Unsupported chain: ${chain}`);
          }

          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch data for ${chain}`);
          }

          const data = await response.json();
          const pairs = data.pairs || [];
          
          // Filter pairs for the specific chain
          const chainPairs = pairs.filter((p: any) => 
            p.chainId?.toLowerCase() === chain.toLowerCase()
          );

          const totalLiquidity = chainPairs.reduce((sum: number, pair: any) => {
            return sum + (pair.liquidity?.usd || 0);
          }, 0);

          return {
            chain,
            token,
            totalLiquidity,
            pairs: chainPairs.length,
            topPairs: chainPairs.slice(0, 3).map((p: any) => ({
              dex: p.dexId,
              pairAddress: p.pairAddress,
              liquidity: p.liquidity?.usd || 0,
              volume24h: p.volume?.h24 || 0,
            })),
          };
        } catch (error: any) {
          console.error(`Error fetching liquidity for ${chain}:`, error);
          return {
            chain,
            token,
            totalLiquidity: 0,
            pairs: 0,
            error: error.message,
          };
        }
      })
    );

    const totalLiquidityAllChains = liquidityData.reduce(
      (sum, chain) => sum + (chain.totalLiquidity || 0),
      0
    );

    const processingTime = Date.now() - startTime;

    // Generate request ID
    const requestId = `liq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      requestId,
      liquidity: {
        token,
        totalLiquidity: totalLiquidityAllChains,
        byChain: liquidityData,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      processingTime,
      status: 'fulfilled',
    });
  } catch (error: any) {
    console.error('Cross-chain liquidity oracle error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
