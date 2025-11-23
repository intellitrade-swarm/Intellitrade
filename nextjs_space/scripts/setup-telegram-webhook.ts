
import { config } from 'dotenv';
config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = 'https://intellitrade.xyz/api/telegram/webhook';

async function setupWebhook() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
    process.exit(1);
  }

  try {
    console.log('🔄 Setting up Telegram webhook...');
    console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);

    // First, delete any existing webhook
    console.log('🗑️  Deleting existing webhook...');
    const deleteResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`,
      { method: 'POST' }
    );
    const deleteData = await deleteResponse.json();
    console.log('Delete webhook response:', deleteData);

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Set the new webhook
    console.log('📝 Setting new webhook...');
    const setResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: WEBHOOK_URL,
          allowed_updates: ['message'],
          drop_pending_updates: true,
        }),
      }
    );

    const setData = await setResponse.json();
    
    if (setData.ok) {
      console.log('✅ Webhook set successfully!');
      console.log('Response:', setData);
    } else {
      console.error('❌ Failed to set webhook');
      console.error('Error:', setData);
      process.exit(1);
    }

    // Verify webhook info
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('\n🔍 Verifying webhook info...');
    const infoResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    );
    const infoData = await infoResponse.json();
    
    console.log('✅ Webhook info:');
    console.log(JSON.stringify(infoData.result, null, 2));

    // Get bot info
    console.log('\n🤖 Bot information:');
    const botInfoResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
    );
    const botInfoData = await botInfoResponse.json();
    
    if (botInfoData.ok) {
      console.log(`Bot username: @${botInfoData.result.username}`);
      console.log(`Bot name: ${botInfoData.result.first_name}`);
      console.log(`Bot ID: ${botInfoData.result.id}`);
    }

    console.log('\n✅ Telegram webhook setup complete!');
    console.log(`\n📱 Users can now send /start to @${botInfoData.result.username} to activate notifications`);
    
  } catch (error) {
    console.error('❌ Error setting up webhook:', error);
    process.exit(1);
  }
}

setupWebhook();
