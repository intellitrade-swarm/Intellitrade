
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Jupiter DCA Orders API Endpoint
 * Fetches Dollar Cost Averaging orders on Solana via Jupiter
 * Note: This requires Jupiter API integration (currently simulated)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenMint = searchParams.get('tokenMint');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!tokenMint) {
      return NextResponse.json(
        { success: false, error: 'Token mint address is required' },
        { status: 400 }
      );
    }

    // Note: Jupiter DCA API integration would go here
    // For now, returning simulated data structure
    const simulatedDCAs = [
      {
        orderId: `dca_${Date.now()}_1`,
        tokenMint,
        inputMint: 'So11111111111111111111111111111111111111112', // WSOL
        totalAmount: 1000,
        amountPerCycle: 50,
        cycleFrequency: 3600, // 1 hour
        cyclesCompleted: 5,
        cyclesRemaining: 15,
        averagePrice: 0.025,
        totalSpent: 250,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      },
      {
        orderId: `dca_${Date.now()}_2`,
        tokenMint,
        inputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        totalAmount: 5000,
        amountPerCycle: 100,
        cycleFrequency: 7200, // 2 hours
        cyclesCompleted: 12,
        cyclesRemaining: 38,
        averagePrice: 0.024,
        totalSpent: 1200,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      },
    ];

    // Calculate aggregated statistics
    const totalOrders = simulatedDCAs.length;
    const activeOrders = simulatedDCAs.filter(d => d.status === 'active').length;
    const totalVolume = simulatedDCAs.reduce((sum, d) => sum + d.totalSpent, 0);
    const avgExecutionPrice = simulatedDCAs.reduce((sum, d) => sum + d.averagePrice, 0) / totalOrders;

    return NextResponse.json({
      success: true,
      data: {
        dcaOrders: simulatedDCAs.slice(0, limit),
        statistics: {
          totalOrders,
          activeOrders,
          totalVolume,
          avgExecutionPrice,
        },
      },
      tokenMint,
      count: simulatedDCAs.length,
      note: 'Jupiter DCA API integration pending - showing simulated data',
    });
  } catch (error: any) {
    console.error('[Jupiter DCA API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Jupiter DCA orders' },
      { status: 500 }
    );
  }
}
