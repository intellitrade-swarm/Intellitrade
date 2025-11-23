
/**
 * Alert & Monitoring System
 * Sends notifications for important events
 * 
 * Supports:
 * - Telegram alerts
 * - Console logs
 * - Future: Email, Discord, Slack
 */

import { prisma } from './db';

export interface Alert {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  agentId?: string;
  data?: any;
  timestamp: Date;
}

/**
 * Send Telegram alert
 */
export async function sendTelegramAlert(message: string): Promise<void> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.log('⚠️  Telegram not configured - Alert:', message);
      return;
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Telegram alert:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Telegram alert:', error);
  }
}

/**
 * Log alert to database
 */
export async function logAlert(alert: Alert): Promise<void> {
  try {
    console.log(`[${alert.type.toUpperCase()}] ${alert.message}`);
    
    // TODO: Store in database for audit trail
    // await prisma.alert.create({ data: alert });
  } catch (error) {
    console.error('Error logging alert:', error);
  }
}

/**
 * Send trade execution alert
 */
export async function alertTradeExecution(
  agentName: string,
  action: 'BUY' | 'SELL',
  symbol: string,
  amount: number,
  txHash?: string
): Promise<void> {
  const message = 
    `🤖 *Trade Executed*\n` +
    `Agent: ${agentName}\n` +
    `Action: ${action} ${symbol}\n` +
    `Amount: $${amount.toFixed(2)}\n` +
    (txHash ? `TX: \`${txHash}\`\n` : '') +
    `Time: ${new Date().toLocaleTimeString()}`;

  await sendTelegramAlert(message);
  await logAlert({
    type: 'success',
    message: `Trade executed: ${action} ${symbol} for $${amount.toFixed(2)}`,
    data: { action, symbol, amount, txHash },
    timestamp: new Date(),
  });
}

/**
 * Send risk alert
 */
export async function alertRiskEvent(
  agentName: string,
  riskLevel: 'medium' | 'high' | 'critical',
  warnings: string[]
): Promise<void> {
  const emoji = riskLevel === 'critical' ? '🚨' : riskLevel === 'high' ? '⚠️' : '⚡';
  
  const message =
    `${emoji} *Risk Alert*\n` +
    `Agent: ${agentName}\n` +
    `Level: ${riskLevel.toUpperCase()}\n` +
    `Warnings:\n${warnings.map(w => `• ${w}`).join('\n')}`;

  await sendTelegramAlert(message);
  await logAlert({
    type: riskLevel === 'critical' ? 'error' : 'warning',
    message: `Risk alert for ${agentName}: ${warnings.join(', ')}`,
    data: { riskLevel, warnings },
    timestamp: new Date(),
  });
}

/**
 * Send balance alert
 */
export async function alertLowBalance(
  agentName: string,
  balance: number,
  walletAddress: string
): Promise<void> {
  const message =
    `💰 *Low Balance Alert*\n` +
    `Agent: ${agentName}\n` +
    `Balance: $${balance.toFixed(2)}\n` +
    `Wallet: \`${walletAddress}\`\n` +
    `Action: Fund wallet to continue trading`;

  await sendTelegramAlert(message);
  await logAlert({
    type: 'warning',
    message: `Low balance for ${agentName}: $${balance.toFixed(2)}`,
    data: { balance, walletAddress },
    timestamp: new Date(),
  });
}

/**
 * Send circuit breaker alert
 */
export async function alertCircuitBreakerTripped(
  agentName: string,
  reason: string
): Promise<void> {
  const message =
    `🔴 *Circuit Breaker Tripped*\n` +
    `Agent: ${agentName}\n` +
    `Reason: ${reason}\n` +
    `Status: Trading halted for this agent`;

  await sendTelegramAlert(message);
  await logAlert({
    type: 'error',
    message: `Circuit breaker tripped for ${agentName}: ${reason}`,
    data: { reason },
    timestamp: new Date(),
  });
}

/**
 * Send system status alert
 */
export async function alertSystemStatus(
  status: 'online' | 'offline' | 'maintenance',
  message: string
): Promise<void> {
  const emoji = status === 'online' ? '✅' : status === 'offline' ? '🔴' : '🔧';
  
  const text =
    `${emoji} *System Status: ${status.toUpperCase()}*\n` +
    message;

  await sendTelegramAlert(text);
  await logAlert({
    type: status === 'online' ? 'success' : 'warning',
    message: `System status: ${status} - ${message}`,
    data: { status },
    timestamp: new Date(),
  });
}

