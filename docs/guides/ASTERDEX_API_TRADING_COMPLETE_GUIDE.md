# 🚀 AsterDEX API Trading - Complete Setup Guide

## ✅ Integration Status

**Your AI agents are now fully configured to trade on AsterDEX 24/7 using the REST API!**

### API Credentials Configured
- ✅ **API Key**: `864664e9cbd002582bd7233953b2a38c27dd699e0435664e20dfca50772a6803`
- ✅ **API Secret**: `2961b2bd8362eb7481690ea69ed7bb965ecc962916564987d96b6cb908470e39`
- ✅ **Base URL**: `https://fapi.asterdex.com`
- ✅ **Authentication**: HMAC SHA256 signature-based (Binance-style API)

---

## 🎯 How It Works

### Architecture
```
┌─────────────────────────────────────────────────────┐
│           AI Agent Market Analysis                   │
│   (NVIDIA, GPT-4, Gemini, Grok AI Analysis)         │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│      AsterDEX API Integration Layer                 │
│  • REST API Authentication (HMAC SHA256)            │
│  • Market Data Fetching                             │
│  • Position Management                              │
│  • Order Execution                                  │
│  • Risk Management                                  │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│          AsterDEX Exchange API                      │
│  • Perpetual Futures Trading                        │
│  • Leverage: 1x - 125x                              │
│  • Real-time Position Monitoring                    │
│  • USDT-margined Contracts                          │
└─────────────────────────────────────────────────────┘
```

### Supported Markets
- **BTCUSDT** - Bitcoin perpetual futures
- **ETHUSDT** - Ethereum perpetual futures
- **SOLUSDT** - Solana perpetual futures
- **MATICUSDT** - Polygon perpetual futures
- **LINKUSDT** - Chainlink perpetual futures
- **ASTRUSDT** - Astar perpetual futures
- **AVAXUSDT** - Avalanche perpetual futures
- **ARBUSDT** - Arbitrum perpetual futures

---

## 🔧 Key Features

### ✅ Intelligent Trading System
- **AI-Powered Analysis**: Uses NVIDIA/GPT-4/Gemini/Grok for market sentiment
- **Dynamic Position Sizing**: 10% max of available balance per trade
- **Smart Leverage**: 2x-5x based on AI confidence and market volatility
  - High confidence + Low volatility = 5x leverage
  - Normal conditions = 3x leverage
  - High volatility = 2x leverage

### ✅ Risk Management
- **Circuit Breaker Integration**: Prevents over-trading
- **Stop Loss**: Auto-close at -5% PnL
- **Take Profit**: Auto-close at +10% PnL
- **Position Limits**: Max $100 per trade
- **Minimum Balance**: $10 required to trade

### ✅ 24/7 Autonomous Operation
- **Trading Cycles**: Every 15 minutes (configurable)
- **Position Monitoring**: Continuous PnL tracking
- **Telegram Alerts**: Real-time notifications for all trades
- **Error Recovery**: Self-healing with retry logic

---

## 📋 How to Start Trading

### Method 1: Via API (Recommended)

#### Start 24/7 Trading
```bash
curl -X POST http://localhost:3000/api/ai/scheduler \
  -H "Content-Type: application/json" \
  -d '{
    "action": "start",
    "intervalMinutes": 15
  }'
```

#### Check Status
```bash
curl http://localhost:3000/api/ai/scheduler
```

#### Stop Trading
```bash
curl -X POST http://localhost:3000/api/ai/scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "stop"}'
```

### Method 2: Manual Test Trade

#### Execute Single Trade for an Agent
```bash
curl -X POST http://localhost:3000/api/aster-dex/autonomous \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "YOUR_AGENT_ID"
  }'
```

#### Run Full Trading Cycle (All Agents)
```bash
curl -X POST http://localhost:3000/api/aster-dex/autonomous \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Method 3: Via UI

1. Navigate to the **Arena** page
2. Look for the **AsterDEX Trading Panel**
3. Click **"Enable 24/7 Trading"**
4. Monitor trades in real-time

---

## 💰 Fund Your AsterDEX Account

Before trading, you need to deposit USDT to your AsterDEX account:

1. **Login to AsterDEX**: https://asterdex.com
2. **Go to Wallet**: Navigate to the futures wallet
3. **Deposit USDT**: Transfer USDT from your wallet
4. **Minimum Recommended**: $100 USDT to start

### Important Notes
- Each AI agent uses the **same AsterDEX account** (the one you configured with API key/secret)
- Agent balances in the database are for tracking only
- Actual trading happens on your AsterDEX account
- Make sure you have sufficient USDT balance in your AsterDEX futures wallet

---

## 📊 Trading Flow

### Cycle Execution (Every 15 Minutes)

1. **Market Analysis**
   - AI agents analyze current market conditions
   - Sentiment, volatility, and trends evaluated
   - Top opportunities identified

2. **Signal Generation**
   - Each agent generates trading signals
   - Confidence scores calculated (0-1)
   - Only signals with >70% confidence proceed

3. **Position Sizing**
   - Calculate risk-adjusted position size
   - Apply leverage based on confidence
   - Respect maximum limits

4. **Risk Check**
   - Circuit breaker validation
   - Balance verification
   - Position limits checked

5. **Trade Execution**
   - Set leverage on AsterDEX
   - Place market order via API
   - Record in database
   - Send Telegram alert

6. **Position Monitoring**
   - Check existing positions
   - Calculate unrealized PnL
   - Auto-close if stop loss/take profit hit

---

## 🔍 Monitoring & Alerts

### Telegram Notifications

You'll receive alerts for:
- ✅ Trade opened (with details)
- 🔻 Position closed (with PnL)
- ⚠️ Errors or failures
- 📊 Periodic summaries (every 10 cycles)
- 🚫 Circuit breaker activations

### Check AsterDEX Account Info
```bash
curl http://localhost:3000/api/aster-dex/info
```

Response includes:
- Total wallet balance
- Available balance
- Total unrealized profit
- Open positions
- Position details

### Check Trading Scheduler Status
```bash
curl http://localhost:3000/api/ai/scheduler
```

Response includes:
- Is running?
- Last cycle time
- Next cycle time
- Cycles completed
- Success rate
- AsterDEX mode enabled

---

## 🛠️ Configuration

### Environment Variables (Already Set)
```bash
ASTERDEX_API_KEY=864664e9cbd002582bd7233953b2a38c27dd699e0435664e20dfca50772a6803
ASTERDEX_API_SECRET=2961b2bd8362eb7481690ea69ed7bb965ecc962916564987d96b6cb908470e39
```

### Trading Parameters (in code)

Located in: `lib/aster-autonomous-trading.ts`

```typescript
// Position Sizing
maxCollateral: Math.min(
  availableBalance * 0.1,  // Max 10% of balance
  100                       // Max $100 per trade
)

minCollateral: 10           // Minimum $10

// Leverage Settings
highConfidenceLeverage: 5x  // When confidence > 85% + low volatility
normalLeverage: 3x          // Normal conditions
lowConfidenceLeverage: 2x   // High volatility markets

// Risk Management
stopLoss: -5%               // Auto-close at -5% loss
takeProfit: +10%            // Auto-close at +10% profit
confidenceThreshold: 0.7    // Min 70% confidence to trade

// Trading Interval
cycleInterval: 15 minutes   // Can be adjusted via API
```

---

## 🧪 Testing

### 1. Test API Connection
```bash
curl http://localhost:3000/api/aster-dex/test
```

### 2. Get Market Data
```bash
curl http://localhost:3000/api/aster-dex/markets
```

### 3. Manual Single Trade
```bash
curl -X POST http://localhost:3000/api/aster-dex/trade \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "YOUR_AGENT_ID",
    "symbol": "ETHUSDT",
    "side": "BUY",
    "leverage": 3
  }'
```

---

## 🚨 Troubleshooting

### Issue: "AsterDEX API credentials not configured"
**Solution**: Environment variables are set. Restart the Next.js server:
```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
yarn dev
```

### Issue: "Failed to fetch AsterDEX account information"
**Solutions**:
1. Check API credentials are correct
2. Verify AsterDEX API is accessible
3. Check your account is not suspended
4. Ensure IP whitelist is configured (if required by AsterDEX)

### Issue: "Insufficient balance for perpetuals"
**Solution**: Deposit USDT to your AsterDEX futures wallet

### Issue: Trades are being skipped
**Possible Reasons**:
1. AI confidence < 70%
2. Circuit breaker activated
3. Insufficient balance
4. Market conditions unfavorable
5. Agent balance < $10 (database tracking)

**Check Logs**:
```bash
# If using PM2 or similar
pm2 logs
# Or check Next.js console output
```

### Issue: "API signature verification failed"
**Solution**: Verify API secret is correct and system time is synchronized

---

## 📈 Performance Optimization

### Adjust Trading Frequency
```bash
curl -X PUT http://localhost:3000/api/ai/scheduler \
  -H "Content-Type: application/json" \
  -d '{
    "intervalMinutes": 30
  }'
```

### Switch Trading Mode
```bash
# Enable AsterDEX (default)
curl -X PUT http://localhost:3000/api/ai/scheduler \
  -H "Content-Type: application/json" \
  -d '{"useAsterDex": true}'

# Disable AsterDEX (use regular DEX)
curl -X PUT http://localhost:3000/api/ai/scheduler \
  -H "Content-Type: application/json" \
  -d '{"useAsterDex": false}'
```

---

## 🔐 Security Best Practices

1. **API Keys**
   - ✅ Already stored in .env file (not in code)
   - ⚠️ Never commit .env to git
   - ⚠️ Rotate keys periodically
   - ⚠️ Use read-only keys for monitoring

2. **Access Control**
   - Limit API access to authorized IPs only
   - Use authentication for all API endpoints
   - Monitor for suspicious activity

3. **Risk Limits**
   - Set daily loss limits
   - Monitor position sizes
   - Regular balance checks
   - Circuit breaker settings

---

## 📊 Database Schema

Trades are recorded with:
```typescript
{
  agentId: string,
  symbol: string,        // e.g., "ETHUSDT"
  side: "BUY" | "SELL",
  type: "PERPETUAL",
  quantity: number,
  entryPrice: number,
  status: "OPEN" | "CLOSED",
  entryTime: Date,
  txHash: string,        // Order ID from AsterDEX
  chain: "astar-zkevm",
  isRealTrade: true,
  strategy: string       // e.g., "AsterDEX BUY 3x - Bullish momentum"
}
```

---

## 🎉 Quick Start Checklist

- [x] ✅ AsterDEX API credentials configured
- [x] ✅ Integration code deployed
- [x] ✅ API endpoints ready
- [x] ✅ Trading scheduler available
- [x] ✅ Risk management active
- [ ] ⚠️ **Fund AsterDEX account with USDT**
- [ ] ⚠️ **Start 24/7 trading scheduler**
- [ ] ⚠️ **Monitor first few trades**

---

## 🚀 Start Trading Now!

### Option A: Start Immediately
```bash
curl -X POST http://localhost:3000/api/ai/scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "start", "intervalMinutes": 15}'
```

### Option B: Test First
```bash
# Run single cycle manually
curl -X POST http://localhost:3000/api/aster-dex/autonomous

# If successful, enable auto-trading
curl -X POST http://localhost:3000/api/ai/scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "start", "intervalMinutes": 15}'
```

---

## 📞 Support & Documentation

- **API Documentation**: Check `/lib/aster-dex.ts` for all available functions
- **Trading Logic**: See `/lib/aster-autonomous-trading.ts`
- **Scheduler**: See `/lib/trading-scheduler.ts`
- **API Routes**: Check `/app/api/aster-dex/` and `/app/api/ai/scheduler/`

---

## 🎯 Next Steps

1. **Fund Account**: Deposit USDT to AsterDEX futures wallet
2. **Test Connection**: Run `curl http://localhost:3000/api/aster-dex/test`
3. **Start Trading**: Enable 24/7 scheduler
4. **Monitor**: Watch Telegram for trade alerts
5. **Optimize**: Adjust parameters based on performance

**Your AI agents are ready to trade autonomously on AsterDEX 24/7! 🚀**

