
// Telegram Bot Service for Trade Notifications

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
  disable_web_page_preview?: boolean;
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

class TelegramService {
  private botToken: string;
  private baseUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  /**
   * Send a message to a specific chat/user
   */
  async sendMessage(chatId: string, message: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
    if (!this.botToken) {
      console.error('❌ Telegram bot token not configured');
      return false;
    }

    try {
      const payload: TelegramMessage = {
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      };

      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: TelegramResponse = await response.json();

      if (!data.ok) {
        console.error('❌ Telegram API error:', data.description);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error sending Telegram message:', error);
      return false;
    }
  }

  /**
   * Get chat ID from username
   */
  async getChatIdFromUsername(username: string): Promise<string | null> {
    try {
      // Note: Telegram API doesn't provide a direct way to get chat_id from username
      // Users need to start a conversation with the bot first
      // We'll return the username as-is for now, and handle the actual chat_id when they message the bot
      return username;
    } catch (error) {
      console.error('❌ Error getting chat ID:', error);
      return null;
    }
  }

  /**
   * Send trade notification
   */
  async sendTradeNotification(
    chatId: string,
    tradeData: {
      agentName: string;
      symbol: string;
      side: string;
      profit: number;
      profitPercent: number;
      entryPrice: number;
      exitPrice: number;
      size: number;
    }
  ): Promise<boolean> {
    const emoji = tradeData.profit > 0 ? '🟢' : '🔴';
    const profitEmoji = tradeData.profit > 0 ? '💰' : '📉';
    
    const message = `
${emoji} <b>Trade Completed - Profitable!</b> ${profitEmoji}

<b>Agent:</b> ${tradeData.agentName}
<b>Asset:</b> ${tradeData.symbol}
<b>Side:</b> ${tradeData.side === 'BUY' ? '📈 LONG' : '📉 SHORT'}

<b>Entry Price:</b> $${tradeData.entryPrice.toFixed(4)}
<b>Exit Price:</b> $${tradeData.exitPrice.toFixed(4)}
<b>Position Size:</b> $${tradeData.size.toFixed(2)}

<b>Profit:</b> <b>$${tradeData.profit.toFixed(2)}</b> (${tradeData.profitPercent >= 0 ? '+' : ''}${tradeData.profitPercent.toFixed(2)}%)

⏰ <i>${new Date().toLocaleString()}</i>
    `.trim();

    return await this.sendMessage(chatId, message);
  }

  /**
   * Send subscription confirmation
   */
  async sendSubscriptionConfirmation(chatId: string, username: string): Promise<boolean> {
    const message = `
🎉 <b>Subscription Confirmed!</b>

Welcome to <b>Intellitrade</b> live trade notifications, @${username}!

You will now receive real-time alerts whenever our AI agents complete profitable trades.

📊 What you'll get:
✅ Real-time trade completions
✅ Profit/Loss details
✅ Entry & Exit prices
✅ Agent performance updates

To stop receiving notifications, visit your account settings on intellitrade.xyz

Happy Trading! 🚀
    `.trim();

    return await this.sendMessage(chatId, message);
  }

  /**
   * Verify bot is working
   */
  async verifyBot(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/getMe`);
      const data: TelegramResponse = await response.json();
      return data.ok;
    } catch (error) {
      console.error('❌ Error verifying Telegram bot:', error);
      return false;
    }
  }
}

// Export singleton instance
export const telegramService = new TelegramService();

// Export types
export type { TelegramMessage, TelegramResponse };
