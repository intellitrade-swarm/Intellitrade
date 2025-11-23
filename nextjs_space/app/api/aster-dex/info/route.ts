
import { NextRequest, NextResponse } from 'next/server';
import { getAccountInfo, getAllTickers, isConfigured, testConnection } from '../../../../lib/aster-dex';

export const dynamic = "force-dynamic";

/**
 * Get Aster Dex account information
 */
export async function GET(request: NextRequest) {
  try {
    // Public access - no authentication required

    // Check if Aster Dex is configured
    if (!isConfigured()) {
      return NextResponse.json({ 
        error: 'Aster Dex API not configured',
        configured: false 
      }, { status: 400 });
    }

    // Test connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json({ 
        error: 'Failed to connect to Aster Dex API',
        configured: true,
        connected: false
      }, { status: 500 });
    }

    // Get account info
    const accountInfo = await getAccountInfo();

    return NextResponse.json({
      success: true,
      configured: true,
      connected: true,
      account: {
        totalWalletBalance: parseFloat(accountInfo.totalWalletBalance),
        totalUnrealizedProfit: parseFloat(accountInfo.totalUnrealizedProfit),
        totalMarginBalance: parseFloat(accountInfo.totalMarginBalance),
        availableBalance: parseFloat(accountInfo.availableBalance),
        assets: accountInfo.assets.map(asset => ({
          asset: asset.asset,
          walletBalance: parseFloat(asset.walletBalance),
          unrealizedProfit: parseFloat(asset.unrealizedProfit),
          marginBalance: parseFloat(asset.marginBalance),
          availableBalance: parseFloat(asset.availableBalance)
        })),
        positions: accountInfo.positions.map(pos => ({
          symbol: pos.symbol,
          positionAmt: parseFloat(pos.positionAmt),
          entryPrice: parseFloat(pos.entryPrice),
          markPrice: parseFloat(pos.markPrice),
          unrealizedProfit: parseFloat(pos.unRealizedProfit),
          liquidationPrice: parseFloat(pos.liquidationPrice),
          leverage: parseFloat(pos.leverage)
        }))
      }
    });

  } catch (error) {
    console.error('Error getting Aster Dex account info:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get Aster Dex account information',
        details: error instanceof Error ? error.message : 'Unknown error',
        configured: isConfigured()
      },
      { status: 500 }
    );
  }
}

