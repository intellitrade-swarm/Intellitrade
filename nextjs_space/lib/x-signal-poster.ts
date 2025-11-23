
import { PrismaClient } from '@prisma/client';
import { postTradingSignal, postMarketUpdate } from './x-api';
import { getCurrentPrice } from './price-feed';

const prisma = new PrismaClient();

interface SignalPostingConfig {
  minConfidence: number;
  minPnlForUpdate: number;
  cooldownMinutes: number;
}

const config: SignalPostingConfig = {
  minConfidence: 60, // Only post signals with 60%+ confidence
  minPnlForUpdate: 10, // Post updates for trades with $10+ PnL (MORE FREQUENT)
  cooldownMinutes: 10, // Wait 10 minutes between posts (INCREASED FREQUENCY)
};

let lastPostTime: Date | null = null;
let postedTradeIds = new Set<string>(); // Track which trades we've already posted

// Check if enough time has passed since last post
function canPost(): boolean {
  if (!lastPostTime) return true;
  
  const now = new Date();
  const minutesSinceLastPost = (now.getTime() - lastPostTime.getTime()) / (1000 * 60);
  
  return minutesSinceLastPost >= config.cooldownMinutes;
}

// Get the most recent high-value AsterDEX trades only
async function getRecentHighValueTrades(limit: number = 10) {
  // Extended to 48 hours to ensure we catch all recent trades
  const lookbackTime = new Date(Date.now() - 48 * 60 * 60 * 1000);
  
  return await prisma.trade.findMany({
    where: {
      entryTime: {
        gte: lookbackTime,
      },
      status: {
        in: ['OPEN', 'CLOSED'],
      },
      isRealTrade: true, // ONLY ACTUAL TRADES ON ASTERDEX
    },
    orderBy: {
      entryTime: 'desc',
    },
    take: limit,
    include: {
      agent: true,
    },
  });
}

// Generate trading signal post from trade
async function postTradeSignal(trade: any): Promise<boolean> {
  if (!canPost()) {
    console.log('⏳ Cooldown period active, skipping post');
    return false;
  }

  // Add verification that this is a real trade
  if (!trade.isRealTrade) {
    console.log('⚠️ Skipping simulated trade - only posting actual trades on AsterDEX');
    return false;
  }

  // Fetch REAL-TIME price for accurate data
  const tokenSymbol = trade.symbol.replace('/USD', '').replace('/USDC', '');
  console.log(`📊 Fetching real-time price for ${tokenSymbol}...`);
  const currentPrice = await getCurrentPrice(trade.symbol);
  
  const price = currentPrice?.price || parseFloat(trade.entryPrice);
  
  if (currentPrice) {
    console.log(`✅ Using real-time price: $${price} from ${currentPrice.source}`);
  } else {
    console.log(`⚠️ Using trade entry price: $${price} (real-time price unavailable)`);
  }

  const signal = {
    token: tokenSymbol,
    action: trade.side === 'LONG' ? 'LONG' as const : 'SHORT' as const,
    price: price,
    leverage: trade.leverage || 1,
    confidence: (trade.confidence || 0.7) * 100,
    reasoning: `Strategy: ${trade.strategy || 'AI'}`,
  };

  const success = await postTradingSignal(signal);
  
  if (success) {
    lastPostTime = new Date();
    console.log(`✅ Posted signal for ${trade.symbol} ${trade.side} at $${price}`);
    if (trade.txHash) {
      console.log(`   Tx Hash: ${trade.txHash}`);
    }
  }
  
  return success;
}

// Generate performance update post
async function postPerformanceUpdate(): Promise<boolean> {
  if (!canPost()) {
    console.log('⏳ Cooldown period active, skipping post');
    return false;
  }

  try {
    // Get recent trade statistics - ASTERDEX TRADES ONLY
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const trades = await prisma.trade.findMany({
      where: {
        entryTime: {
          gte: last24Hours,
        },
        status: 'CLOSED',
        isRealTrade: true, // ONLY ACTUAL TRADES ON ASTERDEX
      },
    });

    if (trades.length === 0) {
      console.log('No recent trades to report');
      return false;
    }

    const totalPnl = trades.reduce((sum, trade) => {
      return sum + (trade.profitLoss || 0);
    }, 0);

    const winningTrades = trades.filter(t => (t.profitLoss || 0) > 0).length;
    const winRate = ((winningTrades / trades.length) * 100).toFixed(1);

    // Only post if performance is notable
    if (Math.abs(totalPnl) < config.minPnlForUpdate && trades.length < 5) {
      console.log('Performance not significant enough for update');
      return false;
    }

    const emoji = totalPnl > 0 ? '📈' : '📉';
    const direction = totalPnl > 0 ? 'profit' : 'loss';
    
    const text = `${emoji} 24H Update\n\n` +
      `Trades: ${trades.length}\n` +
      `Win Rate: ${winRate}%\n` +
      `P&L: $${totalPnl.toFixed(2)}`;

    const success = await postMarketUpdate(text);
    
    if (success) {
      lastPostTime = new Date();
    }
    
    return success;
  } catch (error) {
    console.error('Error posting performance update:', error);
    return false;
  }
}

// Post about a notable trade closure
async function postTradeClosureUpdate(trade: any): Promise<boolean> {
  if (!canPost()) {
    console.log('⏳ Cooldown period active, skipping post');
    return false;
  }

  // Verify this is a real trade
  if (!trade.isRealTrade) {
    console.log('⚠️ Skipping simulated trade closure - only posting actual trades on AsterDEX');
    return false;
  }

  const pnl = trade.profitLoss || 0;
  
  // Only post significant wins or learning moments
  if (Math.abs(pnl) < config.minPnlForUpdate) {
    return false;
  }

  const token = trade.symbol.replace('/USD', '').replace('/USDC', '');
  const emoji = pnl > 0 ? '✅' : '📊';
  const outcome = pnl > 0 ? 'Profit' : 'Loss';
  
  const text = `${emoji} CLOSED ${trade.side} $${token}\n` +
    `P&L: $${pnl.toFixed(2)}\n` +
    `Leverage: ${trade.leverage}x\n` +
    `Outcome: ${outcome}`;

  const success = await postMarketUpdate(text);
  
  if (success) {
    lastPostTime = new Date();
    console.log(`✅ Posted trade closure for ${trade.symbol}`);
    if (trade.txHash) {
      console.log(`   Tx Hash: ${trade.txHash}`);
    }
  }
  
  return success;
}

// Main function to check for new signals and post
export async function checkAndPostSignals(): Promise<void> {
  try {
    console.log('🔍 Checking for new trading signals...');

    // Get recent AsterDEX trades only
    const recentTrades = await getRecentHighValueTrades(5);
    
    console.log(`📊 Query returned ${recentTrades.length} trades`);
    
    if (recentTrades.length === 0) {
      console.log('⚠️ No recent AsterDEX trades found in the last 48 hours');
      console.log('   This could mean:');
      console.log('   - No trades have isRealTrade=true');
      console.log('   - All trades are older than 48 hours');
      console.log('   - Database query is not returning results');
      return;
    }

    console.log(`✅ Found ${recentTrades.length} trades in the last 48 hours`);

    // Find trades that haven't been posted yet
    const unpostedTrades = recentTrades.filter(trade => !postedTradeIds.has(trade.id));

    // Post the most recent unposted trade
    if (unpostedTrades.length > 0 && canPost()) {
      const trade = unpostedTrades[0];
      console.log(`📱 Posting signal for ${trade.symbol} ${trade.side} (Trade ID: ${trade.id})`);
      const success = await postTradeSignal(trade);
      if (success) {
        postedTradeIds.add(trade.id); // Mark as posted
      }
      return;
    }

    // Check for recently closed trades worth reporting
    const unpostedClosures = recentTrades.filter(
      trade => trade.status === 'CLOSED' && !postedTradeIds.has(trade.id)
    );

    if (unpostedClosures.length > 0 && canPost()) {
      const trade = unpostedClosures[0];
      const pnl = trade.profitLoss || 0;
      
      if (Math.abs(pnl) >= config.minPnlForUpdate) {
        console.log(`📱 Posting closure update for ${trade.symbol} (Trade ID: ${trade.id})`);
        const success = await postTradeClosureUpdate(trade);
        if (success) {
          postedTradeIds.add(trade.id); // Mark as posted
        }
        return;
      }
    }

    // If no specific trades to post, consider posting a performance summary
    const hoursSinceLastPost = lastPostTime 
      ? (Date.now() - lastPostTime.getTime()) / (1000 * 60 * 60)
      : 999;

    // Post performance update every 2 hours if there's activity (INCREASED FREQUENCY)
    if (hoursSinceLastPost >= 2 && recentTrades.length >= 1) {
      console.log('📱 Posting performance update');
      await postPerformanceUpdate();
    }

  } catch (error) {
    console.error('Error in checkAndPostSignals:', error);
  }
}

// Run continuous monitoring
export async function startSignalPosting(intervalMinutes: number = 5): Promise<void> {
  console.log(`🚀 Starting X signal posting service (every ${intervalMinutes} minutes)`);
  
  // Post immediately on start
  await checkAndPostSignals();
  
  // Then run on interval
  setInterval(async () => {
    await checkAndPostSignals();
  }, intervalMinutes * 60 * 1000);
}

export default {
  checkAndPostSignals,
  startSignalPosting,
  postTradeSignal,
  postTradeClosureUpdate,
  postPerformanceUpdate,
};
