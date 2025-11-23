
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { postTradingSignal, postMarketUpdate } from '../../../../lib/x-api';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, signal, text } = body;

    if (type === 'signal' && signal) {
      // Post trading signal
      const success = await postTradingSignal(signal);
      return NextResponse.json({ success, type: 'signal' });
    } else if (type === 'update' && text) {
      // Post market update
      const success = await postMarketUpdate(text);
      return NextResponse.json({ success, type: 'update' });
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error posting to X:', error);
    return NextResponse.json(
      { error: 'Failed to post to X' },
      { status: 500 }
    );
  }
}
