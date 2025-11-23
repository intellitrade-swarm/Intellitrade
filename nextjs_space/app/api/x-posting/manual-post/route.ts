
import { NextRequest, NextResponse } from 'next/server';
import { postTradingSignal, postMarketUpdate } from '@/lib/x-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content } = body;
    
    if (type === 'signal') {
      const { token, action, price, leverage, confidence, reasoning } = content;
      
      const signal = {
        token,
        action: action.toUpperCase() as 'LONG' | 'SHORT' | 'CLOSE',
        price: parseFloat(price),
        leverage: parseInt(leverage),
        confidence: parseInt(confidence),
        reasoning,
      };
      
      const success = await postTradingSignal(signal);
      
      return NextResponse.json({
        success,
        message: success ? 'Signal posted successfully' : 'Failed to post signal',
      });
      
    } else if (type === 'update') {
      const { text } = content;
      const success = await postMarketUpdate(text);
      
      return NextResponse.json({
        success,
        message: success ? 'Update posted successfully' : 'Failed to post update',
      });
      
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid post type' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error posting to X:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
