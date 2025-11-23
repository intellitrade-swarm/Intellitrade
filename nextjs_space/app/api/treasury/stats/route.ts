
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Treasury stats are publicly visible to all users
    // Only withdrawal and management operations require admin access
    
    // Fetch treasury data
    const treasury = await prisma.treasury.findFirst({
      include: {
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!treasury) {
      return NextResponse.json({
        balance: { base: 0, bsc: 0, ethereum: 0, solana: 0, total: 0 },
        totalReceived: 0,
        totalTransactions: 0,
        profitSharePercentage: 5,
        recentTransactions: [],
      });
    }

    const totalBalance = 
      treasury.baseBalance +
      treasury.bscBalance +
      treasury.ethereumBalance +
      treasury.solanaBalance;

    return NextResponse.json({
      balance: {
        base: treasury.baseBalance,
        bsc: treasury.bscBalance,
        ethereum: treasury.ethereumBalance,
        solana: treasury.solanaBalance,
        total: totalBalance,
      },
      totalReceived: treasury.totalReceived,
      totalTransactions: treasury.totalTransactions,
      profitSharePercentage: treasury.profitSharePercentage,
      recentTransactions: treasury.transactions,
    });
  } catch (error) {
    console.error('Error fetching treasury stats:', error);
    return NextResponse.json({ error: 'Failed to fetch treasury stats' }, { status: 500 });
  }
}
