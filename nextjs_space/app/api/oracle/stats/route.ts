
import { NextResponse } from 'next/server';
import { getOracleStats } from '@/lib/oracle';

export async function GET() {
  try {
    const stats = await getOracleStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Oracle stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch oracle stats' },
      { status: 500 }
    );
  }
}
