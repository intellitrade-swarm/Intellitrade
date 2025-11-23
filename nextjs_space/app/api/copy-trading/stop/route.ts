
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { copyTradeId } = body;

    if (!copyTradeId) {
      return NextResponse.json(
        { error: 'Missing copyTradeId' },
        { status: 400 }
      );
    }

    // Update copy trade status
    const copyTrade = await prisma.copyTrade.update({
      where: { id: copyTradeId },
      data: {
        isActive: false,
        status: 'STOPPED'
      }
    });

    return NextResponse.json({
      success: true,
      copyTrade
    });

  } catch (error) {
    console.error('Error stopping copy trade:', error);
    return NextResponse.json(
      { error: 'Failed to stop copy trade' },
      { status: 500 }
    );
  }
}
