
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const evolutionEvents = await prisma.evolutionEvent.findMany({
      include: {
        targetAgent: {
          select: {
            name: true,
            strategyType: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    return NextResponse.json(evolutionEvents);
  } catch (error) {
    console.error('Error fetching evolution events:', error);
    return NextResponse.json({ error: 'Failed to fetch evolution events' }, { status: 500 });
  }
}
