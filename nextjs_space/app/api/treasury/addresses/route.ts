
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch treasury wallet addresses
    const treasury = await prisma.treasury.findFirst({
      select: {
        evmWalletAddress: true,
        solanaWalletAddress: true,
      },
    });

    if (!treasury) {
      return NextResponse.json({
        evm: null,
        solana: null,
      });
    }

    return NextResponse.json({
      evm: treasury.evmWalletAddress,
      solana: treasury.solanaWalletAddress,
    });
  } catch (error) {
    console.error('Error fetching treasury addresses:', error);
    return NextResponse.json({ error: 'Failed to fetch treasury addresses' }, { status: 500 });
  }
}
