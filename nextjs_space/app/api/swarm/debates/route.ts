
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const debates = await prisma.swarmDebate.findMany({
      where,
      include: {
        messages: {
          include: {
            agent: {
              select: {
                name: true,
                role: true,
                avatar: true,
              },
            },
          },
          orderBy: { timestamp: 'asc' },
        },
        votes: {
          include: {
            agent: {
              select: {
                name: true,
                role: true,
              },
            },
          },
        },
        decision: true,
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ 
      debates,
      count: debates.length,
    });

  } catch (error: any) {
    console.error('Error fetching debates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debates', details: error.message },
      { status: 500 }
    );
  }
}
