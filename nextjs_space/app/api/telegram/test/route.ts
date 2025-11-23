
import { NextRequest, NextResponse } from 'next/server';
import { telegramService } from '../../../../lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify bot is working
    const isWorking = await telegramService.verifyBot();

    if (!isWorking) {
      return NextResponse.json(
        { error: 'Telegram bot not configured or not working' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Telegram bot is working correctly',
      bot: '@swarmiQbot',
    });
  } catch (error: any) {
    console.error('Error testing Telegram bot:', error);
    return NextResponse.json(
      { error: 'Failed to test bot' },
      { status: 500 }
    );
  }
}
