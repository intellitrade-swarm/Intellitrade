
import { NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * GET /api/nansen/profiler/labels
 * Get address labels and categories
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
    }

    if (!nansenAPI.isConfigured()) {
      return NextResponse.json({ error: 'Nansen API not configured' }, { status: 503 });
    }

    const labels = await nansenAPI.getAddressLabels(address, chain);

    return NextResponse.json({
      success: true,
      labels,
    });
  } catch (error: any) {
    console.error('[Nansen Profiler API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch address labels', details: error.message }, { status: 500 });
  }
}
