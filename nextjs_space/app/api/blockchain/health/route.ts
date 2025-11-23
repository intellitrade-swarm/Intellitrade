

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { getBlockchainHealth } from '../../../../lib/blockchain';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const healthData = await getBlockchainHealth();

    return NextResponse.json({
      chains: healthData,
      timestamp: new Date().toISOString(),
      overallStatus: healthData.every(chain => chain.status === 'healthy') ? 'healthy' : 'degraded',
    });
  } catch (error) {
    console.error('Error fetching blockchain health:', error);
    return NextResponse.json({ error: 'Failed to fetch blockchain health' }, { status: 500 });
  }
}

