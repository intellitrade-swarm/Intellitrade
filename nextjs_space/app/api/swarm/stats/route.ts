
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const totalDebates = await prisma.swarmDebate.count();
    const completedDebates = await prisma.swarmDebate.count({
      where: { status: 'COMPLETED' },
    });
    const activeDebates = await prisma.swarmDebate.count({
      where: { status: 'IN_PROGRESS' },
    });

    const totalDecisions = await prisma.swarmDecision.count();
    const executedTrades = await prisma.swarmDecision.count({
      where: { executed: true },
    });

    // Get decision breakdown
    const decisions = await prisma.swarmDecision.groupBy({
      by: ['action'],
      _count: true,
    });

    const decisionBreakdown = decisions.reduce((acc: any, d: any) => {
      acc[d.action] = d._count;
      return acc;
    }, {});

    // Get recent successful debates
    const recentSuccessful = await prisma.swarmDebate.findMany({
      where: {
        status: 'COMPLETED',
        consensusReached: true,
      },
      include: {
        decision: true,
      },
      orderBy: { completedAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      totalDebates,
      completedDebates,
      activeDebates,
      totalDecisions,
      executedTrades,
      decisionBreakdown,
      consensusRate: totalDebates > 0 
        ? ((completedDebates / totalDebates) * 100).toFixed(1)
        : '0',
      recentSuccessful: recentSuccessful.map(d => ({
        id: d.id,
        symbol: d.symbol,
        decision: d.finalDecision,
        confidence: d.confidence,
        completedAt: d.completedAt?.toISOString(),
      })),
    });

  } catch (error: any) {
    console.error('Error fetching swarm stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    );
  }
}
