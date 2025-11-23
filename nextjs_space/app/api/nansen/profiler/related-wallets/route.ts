
import { NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

/**
 * GET /api/nansen/profiler/related-wallets
 * Get related wallets (funded by, funded, or similar behavior)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
    }

    if (!nansenAPI.isConfigured()) {
      return NextResponse.json({ error: 'Nansen API not configured' }, { status: 503 });
    }

    const relatedWallets = await nansenAPI.getAddressRelatedWallets(address, chain, limit);

    return NextResponse.json({
      success: true,
      relatedWallets,
      count: relatedWallets.length,
    });
  } catch (error: any) {
    console.error('[Nansen Profiler API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch related wallets', details: error.message }, { status: 500 });
  }
}
