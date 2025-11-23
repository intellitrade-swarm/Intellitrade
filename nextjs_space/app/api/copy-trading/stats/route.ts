
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  try {
    // Public access - no authentication required

    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing walletAddress' },
        { status: 400 }
      );
    }

    // Get all copy trades for this wallet
    const copyTrades = await prisma.copyTrade.findMany({
      where: { userWalletAddress: walletAddress },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            avatar: true,
            winRate: true,
            totalProfitLoss: true
          }
        },
        copiedTrades: {
          orderBy: { entryTime: 'desc' },
          take: 20
        }
      }
    });

    // Calculate overall stats
    const stats = {
      totalCopyTrades: copyTrades.length,
      activeCopyTrades: copyTrades.filter(ct => ct.isActive).length,
      totalProfit: copyTrades.reduce((sum, ct) => sum + ct.totalProfit, 0),
      totalLoss: copyTrades.reduce((sum, ct) => sum + ct.totalLoss, 0),
      totalCopiedTrades: copyTrades.reduce((sum, ct) => sum + ct.totalCopiedTrades, 0),
      netProfit: copyTrades.reduce((sum, ct) => sum + ct.totalProfit - ct.totalLoss, 0),
      copyTrades
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching copy trading stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
