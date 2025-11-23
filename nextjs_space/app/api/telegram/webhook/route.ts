
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getOracleData, fetchOracleMarketData, getOracleStats } from '../../../../lib/oracle';

export const dynamic = 'force-dynamic';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      type: string;
    };
    date: number;
    text?: string;
  };
}

async function sendTelegramMessage(chatId: number, text: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.error('❌ Telegram bot token not configured');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error('❌ Telegram API error:', data.description);
      return false;
    }

    console.log('✅ Message sent successfully to chat', chatId);
    return true;
  } catch (error) {
    console.error('❌ Error sending Telegram message:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();
    console.log('📱 Telegram webhook received:', JSON.stringify(update, null, 2));

    // Check if this is a message update
    if (!update.message) {
      console.log('ℹ️ Update is not a message, ignoring');
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    const chatId = message.chat.id;
    const username = message.from.username || message.chat.username;
    const text = message.text?.trim() || '';

    console.log(`📝 Message from @${username} (chat_id: ${chatId}): "${text}"`);

    // Handle /start command
    if (text === '/start') {
      console.log(`🚀 Processing /start command from @${username}`);

      // Try to find user by Telegram username
      let user = null;
      if (username) {
        user = await prisma.user.findFirst({
          where: {
            telegramUsername: {
              equals: username,
              mode: 'insensitive',
            },
          },
        });
      }

      if (user) {
        console.log(`✅ Found user: ${user.email}`);

        // Update user's chat_id if not already set
        if (user.telegramChatId !== chatId.toString()) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              telegramChatId: chatId.toString(),
              telegramNotificationsEnabled: true,
            },
          });
          console.log(`✅ Updated chat_id for user ${user.email}`);
        }

        // Send personalized confirmation
        const confirmationMessage = `
🎉 <b>Activation Successful!</b>

Hi @${username}! Your <b>Intellitrade</b> notifications are now <b>ACTIVE</b>! ✅

📊 <b>You'll receive instant alerts for:</b>
✅ Real-time trade completions
✅ Profit/Loss details  
✅ Entry & Exit prices
✅ Agent performance updates

💰 Get ready to track profitable AI trading signals in real-time!

🔔 <i>Notifications are enabled for your account: ${user.email}</i>

To stop notifications, visit your account settings at intellitrade.xyz

Happy Trading! 🚀
        `.trim();

        await sendTelegramMessage(chatId, confirmationMessage);
      } else {
        // User not found in database
        console.log(`⚠️ Username @${username} not found in database`);

        const welcomeMessage = `
👋 <b>Welcome to Intellitrade Bot!</b>

Hello @${username || 'there'}!

⚠️ <b>To activate notifications:</b>

1️⃣ Go to <b>intellitrade.xyz</b>
2️⃣ Log in or create an account
3️⃣ Navigate to the <b>AI Arena</b> section
4️⃣ Enter your Telegram username: <b>@${username}</b>
5️⃣ Click "Subscribe to Notifications"
6️⃣ Come back here and send /start again

📱 Once activated, you'll receive real-time trade alerts from our AI agents!

Need help? Visit intellitrade.xyz for support.
        `.trim();

        await sendTelegramMessage(chatId, welcomeMessage);
      }
    } else if (text === '/help') {
      // Handle help command
      const helpMessage = `
ℹ️ <b>Intellitrade Bot - Help</b>

<b>🔔 Notification Commands:</b>
/start - Activate trade notifications
/status - Check your subscription status

<b>🔮 Oracle Service Commands:</b>
/oracle [symbol] - Full AI analysis with multi-provider insights
/price [symbol] - Quick price and market data
/trending - View trending tokens by volume
/stats - Oracle network statistics

<b>ℹ️ General:</b>
/help - Show this help message

<b>📚 Examples:</b>
• <code>/oracle ETH</code> - Get comprehensive AI analysis for Ethereum
• <code>/price BTC</code> - Check current Bitcoin price
• <code>/trending</code> - See hot tokens right now

<b>What is this bot?</b>
This bot provides:
✅ Real-time profitable trade notifications
✅ On-demand AI market analysis
✅ Multi-provider oracle insights
✅ Price tracking and trending tokens

<b>How to activate notifications:</b>
1. Register at intellitrade.xyz
2. Go to AI Arena section
3. Enter your Telegram username
4. Send /start to this bot

<b>Support:</b>
Visit intellitrade.xyz for more information

🚀 <i>Powered by Intellitrade Oracle</i>
      `.trim();

      await sendTelegramMessage(chatId, helpMessage);
    } else if (text === '/status') {
      // Handle status command
      let user = null;
      if (username) {
        user = await prisma.user.findFirst({
          where: {
            telegramUsername: {
              equals: username,
              mode: 'insensitive',
            },
          },
        });
      }

      if (user && user.telegramNotificationsEnabled) {
        const statusMessage = `
✅ <b>Notifications Status: ACTIVE</b>

📊 <b>Your subscription details:</b>
• Account: ${user.email}
• Username: @${username}
• Status: 🟢 Enabled

You're all set to receive trade notifications!

To manage your subscription, visit intellitrade.xyz
        `.trim();

        await sendTelegramMessage(chatId, statusMessage);
      } else {
        const statusMessage = `
⚠️ <b>Notifications Status: INACTIVE</b>

You haven't subscribed to notifications yet.

To activate:
1. Visit intellitrade.xyz
2. Go to the AI Arena section
3. Enter your Telegram username: @${username}
4. Subscribe to notifications
5. Send /start to activate

Need help? Visit intellitrade.xyz
        `.trim();

        await sendTelegramMessage(chatId, statusMessage);
      }
    } else if (text.startsWith('/oracle ')) {
      // Handle Oracle analysis command
      const symbol = text.replace('/oracle ', '').trim().toUpperCase();
      
      if (!symbol) {
        await sendTelegramMessage(chatId, '⚠️ Please provide a token symbol. Example: /oracle ETH');
        return NextResponse.json({ ok: true });
      }

      await sendTelegramMessage(chatId, `🔮 <b>Oracle Analysis Loading...</b>\n\nAnalyzing <b>${symbol}</b> across multiple AI providers and market data sources...\n\nThis may take a few seconds ⏳`);

      try {
        const oracleData = await getOracleData(symbol);

        if (!oracleData.marketData) {
          await sendTelegramMessage(chatId, `❌ <b>Token Not Found</b>\n\nCouldn't find market data for <b>${symbol}</b>. Please check the symbol and try again.`);
          return NextResponse.json({ ok: true });
        }

        const { marketData, insights, signal } = oracleData;

        // Build comprehensive analysis message
        let analysisMessage = `
🔮 <b>ORACLE ANALYSIS: ${marketData.symbol}</b>

📊 <b>Market Data</b>
💰 Price: $${marketData.price.toFixed(6)}
📈 24h Change: ${marketData.priceChange24h >= 0 ? '+' : ''}${marketData.priceChange24h.toFixed(2)}%
💵 24h Volume: $${marketData.volume24h.toLocaleString()}
💧 Liquidity: $${marketData.liquidity?.toLocaleString() || 'N/A'}

🤖 <b>AI Analysis (${insights.length} Providers)</b>
`;

        // Add each AI insight
        insights.forEach((insight, index) => {
          const sentimentEmoji = insight.sentiment === 'BULLISH' ? '🟢' : insight.sentiment === 'BEARISH' ? '🔴' : '🟡';
          const recEmoji = insight.recommendation === 'BUY' ? '📈' : insight.recommendation === 'SELL' ? '📉' : '⏸️';
          
          analysisMessage += `
${index + 1}. ${sentimentEmoji} <b>${insight.provider}</b>
   ${recEmoji} ${insight.recommendation} | Confidence: ${(insight.confidence * 100).toFixed(0)}%
   ${insight.analysis}
`;

          if (insight.targetPrice) {
            analysisMessage += `   🎯 Target: $${insight.targetPrice.toFixed(6)}\n`;
          }
        });

        // Add aggregated signal
        if (signal) {
          const signalEmoji = signal.signal.includes('BUY') ? '🟢' : signal.signal.includes('SELL') ? '🔴' : '🟡';
          analysisMessage += `
${signalEmoji} <b>AGGREGATED SIGNAL: ${signal.signal}</b>
📊 Confidence: ${(signal.confidence * 100).toFixed(0)}%
💡 ${signal.reasoning}

⏰ <i>Analysis generated at ${new Date().toLocaleString()}</i>
`;
        }

        await sendTelegramMessage(chatId, analysisMessage.trim());
      } catch (error) {
        console.error('Error generating oracle analysis:', error);
        await sendTelegramMessage(chatId, `❌ <b>Analysis Failed</b>\n\nAn error occurred while analyzing <b>${symbol}</b>. Please try again later.`);
      }
    } else if (text.startsWith('/price ')) {
      // Handle price query command
      const symbol = text.replace('/price ', '').trim().toUpperCase();
      
      if (!symbol) {
        await sendTelegramMessage(chatId, '⚠️ Please provide a token symbol. Example: /price ETH');
        return NextResponse.json({ ok: true });
      }

      try {
        const marketData = await fetchOracleMarketData([symbol]);

        if (marketData.length === 0) {
          await sendTelegramMessage(chatId, `❌ <b>Token Not Found</b>\n\nCouldn't find price data for <b>${symbol}</b>.`);
          return NextResponse.json({ ok: true });
        }

        const data = marketData[0];
        const priceEmoji = data.priceChange24h >= 0 ? '🟢' : '🔴';

        const priceMessage = `
${priceEmoji} <b>${data.symbol} Price Data</b>

💰 <b>Current Price:</b> $${data.price.toFixed(6)}

📊 <b>24h Statistics:</b>
${data.priceChange24h >= 0 ? '📈' : '📉'} Change: ${data.priceChange24h >= 0 ? '+' : ''}${data.priceChange24h.toFixed(2)}%
💵 Volume: $${data.volume24h.toLocaleString()}
💧 Liquidity: $${data.liquidity?.toLocaleString() || 'N/A'}

⏰ <i>${new Date().toLocaleString()}</i>

<i>For AI analysis, use: /oracle ${symbol}</i>
        `.trim();

        await sendTelegramMessage(chatId, priceMessage);
      } catch (error) {
        console.error('Error fetching price:', error);
        await sendTelegramMessage(chatId, `❌ Error fetching price for <b>${symbol}</b>. Please try again.`);
      }
    } else if (text === '/trending') {
      // Handle trending tokens command
      await sendTelegramMessage(chatId, '🔥 <b>Loading Trending Tokens...</b>\n\nFetching the hottest tokens right now...');

      try {
        // Fetch trending tokens from popular symbols
        const trendingSymbols = ['ETH', 'BTC', 'SOL', 'USDC', 'MATIC'];
        const marketData = await fetchOracleMarketData(trendingSymbols);

        if (marketData.length === 0) {
          await sendTelegramMessage(chatId, '❌ Unable to fetch trending data. Please try again later.');
          return NextResponse.json({ ok: true });
        }

        // Sort by 24h volume
        marketData.sort((a, b) => b.volume24h - a.volume24h);

        let trendingMessage = `
🔥 <b>TRENDING TOKENS</b>

<i>Sorted by 24h trading volume</i>

`;

        marketData.forEach((data, index) => {
          const emoji = data.priceChange24h >= 0 ? '🟢' : '🔴';
          trendingMessage += `
${index + 1}. ${emoji} <b>${data.symbol}</b>
   💰 Price: $${data.price.toFixed(6)}
   📊 24h: ${data.priceChange24h >= 0 ? '+' : ''}${data.priceChange24h.toFixed(2)}%
   💵 Volume: $${data.volume24h.toLocaleString()}
`;
        });

        trendingMessage += `
⏰ <i>${new Date().toLocaleString()}</i>

<i>Use /oracle [symbol] for detailed analysis</i>
        `.trim();

        await sendTelegramMessage(chatId, trendingMessage);
      } catch (error) {
        console.error('Error fetching trending:', error);
        await sendTelegramMessage(chatId, '❌ Error fetching trending data. Please try again later.');
      }
    } else if (text === '/stats') {
      // Handle oracle stats command
      try {
        const stats = await getOracleStats();

        const statsMessage = `
📊 <b>ORACLE STATISTICS</b>

🔮 <b>Oracle Network Status:</b>
✅ Active and operational

📈 <b>Platform Metrics:</b>
• Data Points: ${stats.totalDataPoints.toLocaleString()}
• AI Insights: ${stats.totalInsights.toLocaleString()}
• Trading Signals: ${stats.totalSignals.toLocaleString()}
• Active Symbols: ${stats.activeSymbols}
• AI Providers: ${stats.aiProviders}

🤖 <b>Available Commands:</b>
/oracle [symbol] - Comprehensive analysis
/price [symbol] - Quick price check
/trending - Hot tokens now
/stats - Oracle statistics
/help - All commands

⏰ <i>${new Date().toLocaleString()}</i>
        `.trim();

        await sendTelegramMessage(chatId, statsMessage);
      } catch (error) {
        console.error('Error fetching stats:', error);
        await sendTelegramMessage(chatId, '❌ Error fetching statistics. Please try again later.');
      }
    } else {
      // Unknown command
      console.log('ℹ️ Unknown command or message');
      
      const unknownMessage = `
ℹ️ <b>Unknown Command</b>

I didn't understand that command. 

<b>🔔 Notification Commands:</b>
/start - Activate notifications
/status - Check subscription status

<b>🔮 Oracle Commands:</b>
/oracle [symbol] - Full AI analysis
/price [symbol] - Quick price check
/trending - Hot tokens now
/stats - Oracle statistics

<b>ℹ️ General:</b>
/help - Show all commands

<b>Examples:</b>
• /oracle ETH
• /price BTC
• /trending

For more information, visit intellitrade.xyz
      `.trim();

      await sendTelegramMessage(chatId, unknownMessage);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('❌ Error processing webhook:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
    
    // Always return 200 to Telegram to prevent retries
    return NextResponse.json({ ok: true });
  }
}

// GET endpoint to verify webhook is working
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Telegram webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
