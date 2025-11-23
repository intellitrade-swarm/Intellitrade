
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { telegramService } from '../../../../lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's current telegram info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        telegramChatId: true,
        telegramUsername: true,
      },
    });

    // Update user to disable notifications
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        telegramNotificationsEnabled: false,
      },
    });

    // Send goodbye message if we have chat ID
    if (user?.telegramChatId) {
      await telegramService.sendMessage(
        user.telegramChatId,
        `👋 You have unsubscribed from Intellitrade trade notifications.\n\nYou can resubscribe anytime from your account settings.\n\nThank you for using our service!`
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from notifications',
    });
  } catch (error: any) {
    console.error('Error unsubscribing from Telegram:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
