
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { telegramService } from '../../../../lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('📱 Telegram subscription request received');
    
    const session = await getServerSession(authOptions);
    console.log('🔐 Session:', session ? 'Valid' : 'Invalid', session?.user?.email);
    
    if (!session?.user?.email) {
      console.error('❌ No session or email found');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in again' },
        { status: 401 }
      );
    }

    const { telegramUsername } = await request.json();
    console.log('📝 Received username:', telegramUsername);

    if (!telegramUsername || typeof telegramUsername !== 'string') {
      console.error('❌ Invalid username format');
      return NextResponse.json(
        { error: 'Telegram username is required' },
        { status: 400 }
      );
    }

    // Clean username (remove @ if present)
    const cleanUsername = telegramUsername.replace('@', '').trim();
    console.log('🧹 Cleaned username:', cleanUsername);

    if (!cleanUsername) {
      console.error('❌ Empty username after cleaning');
      return NextResponse.json(
        { error: 'Invalid Telegram username' },
        { status: 400 }
      );
    }

    console.log('💾 Updating user in database...');
    
    // Update user with Telegram info (save to database first)
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        telegramUsername: cleanUsername,
        telegramChatId: null, // Will be updated when user messages the bot
        telegramNotificationsEnabled: true,
      },
    });

    console.log('✅ User updated successfully:', updatedUser.id);

    // Try to send confirmation message (this will only work if user has messaged the bot)
    // We don't fail the subscription if this doesn't work
    let confirmationSent = false;
    try {
      // For now, we can't send messages until the user messages the bot first
      // This is a Telegram API limitation - we need the numeric chat_id
      confirmationSent = false;
    } catch (error) {
      console.log('ℹ️ Could not send confirmation message yet - user needs to message the bot first');
    }

    console.log('✅ Subscription successful, returning response');

    return NextResponse.json({
      success: true,
      message: '✅ Successfully subscribed to Telegram notifications! Please start a chat with @swarmiQbot and send /start to activate.',
      username: cleanUsername,
      confirmationSent: false,
      requiresBotInteraction: true,
    });
  } catch (error: any) {
    console.error('❌ Error subscribing to Telegram:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message || 'Failed to subscribe to notifications' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        telegramUsername: true,
        telegramNotificationsEnabled: true,
      },
    });

    return NextResponse.json({
      subscribed: user?.telegramNotificationsEnabled || false,
      username: user?.telegramUsername || null,
    });
  } catch (error: any) {
    console.error('Error getting Telegram subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}
