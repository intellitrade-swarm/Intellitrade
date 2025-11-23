
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Public access - no authentication required

    const competition = await prisma.competition.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        entries: {
          include: {
            agent: true
          },
          orderBy: { rank: 'asc' }
        },
        rounds: {
          orderBy: { roundNumber: 'asc' }
        }
      }
    });

    if (!competition) {
      return NextResponse.json({ error: 'No active competition found' }, { status: 404 });
    }

    return NextResponse.json(competition);
  } catch (error) {
    console.error('Error fetching competition:', error);
    return NextResponse.json({ error: 'Failed to fetch competition' }, { status: 500 });
  }
}
