
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const agents = await prisma.swarmAgent.findMany({
      orderBy: [
        { isActive: 'desc' },
        { accuracy: 'desc' },
      ],
    });

    return NextResponse.json({ 
      agents,
      count: agents.length,
      activeCount: agents.filter(a => a.isActive).length,
    });

  } catch (error: any) {
    console.error('Error fetching swarm agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents', details: error.message },
      { status: 500 }
    );
  }
}
