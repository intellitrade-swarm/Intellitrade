
# ⚡ Real Money Trading - Quick Start Guide

## 🎯 Current Status

- ✅ **Scheduler**: Running (checks markets every 15 min)
- ✅ **API**: Connected to AsterDEX  
- ✅ **Agents**: 10 AI agents ready
- ✅ **Profit Logic**: 1.5%+ targets configured
- ❌ **AsterDEX Balance**: $0.00 - **NEEDS FUNDING**

---

## 💰 To Start Trading (3 Steps)

### 1. Fund AsterDEX Account

```
1. Go to: https://asterdex.com
2. Click: Wallet → Deposit
3. Transfer: $100+ USDT/USDC to Futures Account
4. Wait: 1-5 minutes for confirmation
```

### 2. Verify Balance

```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
yarn tsx scripts/check-asterdex-account.ts
```

Should show: `Available Balance: $XXX.XX`

### 3. Trading Starts Automatically!

The scheduler will:
- Analyze markets every 15 minutes
- Execute profitable trades
- Close positions at 1.5%+ profit
- Apply -2.5% stop-loss

---

## 📊 Monitor Trading

### Check Status:
```bash
yarn tsx scripts/check-trading-status.ts
```

### View Dashboard:
- **Arena**: https://intellitrade.xyz/arena
- **Oracle**: https://intellitrade.xyz/oracle

---

## 🤖 Your Trading Agents

| Agent | AI Model | Strategy |
|-------|----------|----------|
| Sentiment Sage | Grok AI | Sentiment analysis |
| MEV Sentinel Beta | Grok AI | MEV opportunities |
| Neural Nova | NVIDIA AI | Neural predictions |
| Technical Titan | NVIDIA AI | Technical analysis |
| Reversion Hunter | OpenAI | Mean reversion |
| MEV Hunter Alpha | OpenAI | MEV arbitrage |
| Volatility Sniper | OpenAI | Volatility trading |
| Funding Phantom | OpenAI | Funding arbitrage |
| Arbitrage Ace | OpenAI | Cross-exchange arb |
| Momentum Master | OpenAI | Momentum trading |

---

## ⚙️ Trading Configuration

- **Platform**: AsterDEX Perpetuals
- **Mode**: Real Money Only
- **Leverage**: 3x-7x (dynamic)
- **Profit Target**: 1.5%+ (aggressive)
- **Stop Loss**: -2.5%
- **Cycle**: Every 15 minutes
- **Trading**: 24/7 Autonomous

---

## ⚠️ Remember

- This is REAL MONEY trading
- Start with $100-$500 to test
- Monitor positions regularly
- Only trade what you can afford to lose

---

## 🔧 Quick Commands

```bash
# Check balance
yarn tsx scripts/check-asterdex-account.ts

# Check trading status  
yarn tsx scripts/check-trading-status.ts

# Restart scheduler
yarn tsx scripts/restart-real-trading.ts

# Stop trading
curl -X POST https://intellitrade.xyz/api/trading/scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "stop"}'
```

---

**✅ System Ready - Just Add Funds to Start!**

