
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Public access - no authentication required

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const trades = await prisma.trade.findMany({
      where: agentId ? { agentId } : {},
      include: {
        agent: {
          select: {
            name: true,
            strategyType: true
          }
        }
      },
      orderBy: { entryTime: 'desc' },
      take: limit
    });

    return NextResponse.json(trades);
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
  }
}
