
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { explainStrategy } from '../../../../lib/openai';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Gather context for the AI
    const [agents, marketData, recentTrades] = await Promise.all([
      prisma.aIAgent.findMany({
        where: { isActive: true },
        select: {
          name: true,
          strategyType: true,
          personality: true,
          currentBalance: true,
          winRate: true,
          sharpeRatio: true,
          totalProfitLoss: true
        }
      }),
      prisma.marketData.findMany({
        orderBy: { timestamp: 'desc' },
        take: 6,
        distinct: ['symbol']
      }),
      prisma.trade.findMany({
        include: {
          agent: {
            select: { name: true }
          }
        },
        orderBy: { entryTime: 'desc' },
        take: 10
      })
    ]);

    // Get AI response
    const response = await explainStrategy(message, {
      agents,
      marketData,
      recentTrades
    });

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Error in AI chatbot:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
