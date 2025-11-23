
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const debateId = params.id;

    const debate = await prisma.swarmDebate.findUnique({
      where: { id: debateId },
      include: {
        messages: {
          include: {
            agent: {
              select: {
                name: true,
                role: true,
                avatar: true,
                expertise: true,
                votingWeight: true,
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
                votingWeight: true,
              },
            },
          },
        },
        decision: true,
      },
    });

    if (!debate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ debate });

  } catch (error: any) {
    console.error('Error fetching debate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debate', details: error.message },
      { status: 500 }
    );
  }
}
