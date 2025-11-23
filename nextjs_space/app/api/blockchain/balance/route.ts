

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { getBalance, getTokenBalance } from '../../../../lib/blockchain';
import { ChainName, TOKEN_ADDRESSES } from '../../../../lib/blockchain-config';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') as ChainName;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    if (!chain || !['ethereum', 'bsc', 'base'].includes(chain)) {
      return NextResponse.json({ error: 'Valid chain is required (ethereum, bsc, or base)' }, { status: 400 });
    }

    // Get native token balance
    const nativeBalance = await getBalance(chain, address);

    // Get some popular token balances
    const tokenBalances: Record<string, string> = {};
    const tokens = TOKEN_ADDRESSES[chain];
    
    if (tokens) {
      const tokenPromises = Object.entries(tokens).map(async ([symbol, tokenAddress]) => {
        const balance = await getTokenBalance(chain, tokenAddress, address);
        return { symbol, balance };
      });

      const results = await Promise.all(tokenPromises);
      results.forEach(({ symbol, balance }) => {
        tokenBalances[symbol] = balance;
      });
    }

    return NextResponse.json({
      chain,
      address,
      nativeBalance,
      tokenBalances,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching blockchain balance:', error);
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}

