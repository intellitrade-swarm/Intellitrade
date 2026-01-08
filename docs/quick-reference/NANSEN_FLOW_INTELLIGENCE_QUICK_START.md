# 🔷 Nansen Flow Intelligence - Quick Start

**Status:** ✅ Live at https://intellitrade.xyz/whale-monitor  
**Date:** November 18, 2025

---

## 🚀 Quick Access

### Check Flow Intelligence
```bash
curl "https://intellitrade.xyz/api/nansen/flow-intelligence?address=0x...&chain=ethereum"
```

### Track Smart Money Netflows
```bash
curl "https://intellitrade.xyz/api/nansen/netflows?address=0x...&chain=ethereum"
```

### Get Historical Flows
```bash
curl "https://intellitrade.xyz/api/nansen/flows?address=0x...&category=smart_money&timeframe=7d"
```

### View PnL Leaderboard
```bash
curl "https://intellitrade.xyz/api/nansen/pnl-leaderboard?address=0x...&timeframe=30d"
```

### Get Enhanced Signals
```bash
curl "https://intellitrade.xyz/api/nansen/enhanced-signals?address=0x...&chain=ethereum"
```

---

## 📊 Key Features

✅ **Smart Money Flow Tracking** - Real-time accumulation/distribution  
✅ **Exchange Flow Monitoring** - CEX inflows/outflows  
✅ **Whale Positioning** - Large holder movements  
✅ **PnL Leaderboards** - Top trader rankings  
✅ **Enhanced AI Signals** - Multi-source confidence fusion  

---

## 🎯 Flow Intelligence Summary

### Smart Money Flow
**Metrics:**
- 24h net flow
- 7d net flow
- Trend (ACCUMULATING/DISTRIBUTING/NEUTRAL)

**Interpretation:**
- Positive netflow = Smart Money buying (bullish)
- Negative netflow = Smart Money selling (bearish)

### Exchange Flow
**Metrics:**
- 24h exchange flow
- 7d exchange flow
- Trend (inflow/outflow)

**Interpretation:**
- Negative netflow (outflow) = Withdrawals from CEX (bullish)
- Positive netflow (inflow) = Deposits to CEX (bearish)

### Whale Flow
**Metrics:**
- 24h whale flow
- 7d whale flow
- Trend (accumulating/distributing)

**Interpretation:**
- Positive netflow = Whales buying (bullish)
- Negative netflow = Whales selling (bearish)

---

## 📡 API Endpoints

### 1. Flow Intelligence Summary
**Endpoint**: `/api/nansen/flow-intelligence`  
**Params**: `address`, `chain` (default: ethereum)  
**Returns**: Smart Money, Exchange, Whale, Fresh Wallet flows

### 2. Historical Token Flows
**Endpoint**: `/api/nansen/flows`  
**Params**: `address`, `category`, `timeframe`, `chain`  
**Returns**: Hourly flow data for specified category

**Categories:**
- `smart_money` - Top performing wallets
- `whale` - Large holders
- `exchange` - CEX wallets
- `public_figure` - Known crypto personalities

### 3. Smart Money Netflows
**Endpoint**: `/api/nansen/netflows`  
**Params**: `address`, `chain`  
**Returns**: Net inflow/outflow, top wallets, USD value

### 4. PnL Leaderboard
**Endpoint**: `/api/nansen/pnl-leaderboard`  
**Params**: `address`, `chain`, `timeframe`, `limit`  
**Returns**: Top traders by profitability with PnL, ROI, win rate

### 5. Enhanced Signals
**Endpoint**: `/api/nansen/enhanced-signals`  
**Params**: `address`, `chain`  
**Returns**: AI signals combining flows with traditional signals

---

## 🎯 Enhanced Signal Types

### SMART_MONEY_NETFLOW
- Smart Money net buying/selling
- Confidence: 70-95%
- Urgency: HIGH/CRITICAL

### EXCHANGE_OUTFLOW
- Tokens leaving exchanges (bullish)
- Confidence: 80%
- Urgency: MEDIUM/HIGH

### MULTI_SOURCE_ACCUMULATION
- 2+ bullish flow signals combined
- Confidence: 85-95%
- Urgency: CRITICAL

---

## 💡 Best Practices

### 1. **Combine Multiple Signals**
Don't rely on a single signal - look for confluence:
- Smart Money accumulating +
- Exchange outflows +
- Whale accumulation
= Very strong bullish signal

### 2. **Monitor Trends Over Time**
Use 7d flows to confirm 24h movements:
- If 24h and 7d trends align = stronger signal
- If they conflict = wait for clarity

### 3. **Track Top Wallets**
Identify specific Smart Money wallets and follow their actions:
- Known labels (Jump Trading, etc.) = higher confidence
- Check if they're BUYING or SELLING

### 4. **Use PnL Leaderboard**
Copy successful traders:
- High total PnL
- High win rate (> 70%)
- High holding percentage (still in position)

### 5. **Cache Awareness**
First API call may take 300-800ms, subsequent calls <10ms (1-minute cache)

---

## 🔑 API Key

**Location**: `/nextjs_space/.env`  
**Variable**: `NANSEN_API_KEY`  
**Value**: `QpQGxaiUSPhf8oxAISrgStYW2lXg9rOJ`

---

## 📈 Confidence Scoring

**Smart Money Netflow:**
- Base: 70%
- +|percentChange24h|
- Max: 95%

**Exchange Outflow:**
- Fixed: 80%

**Multi-Source Accumulation:**
- Base: 85%
- +5% per additional signal
- Max: 95%

---

## ✅ Quick Test

```bash
# 1. Check if Nansen is configured
curl https://intellitrade.xyz/api/nansen/status

# Expected: {"success":true,"configured":true,"status":"operational"}

# 2. Get flow intelligence for WETH
curl "https://intellitrade.xyz/api/nansen/flow-intelligence?address=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&chain=ethereum"

# Expected: {"success":true,"flowIntelligence":{...}}

# 3. Get enhanced signals for WETH
curl "https://intellitrade.xyz/api/nansen/enhanced-signals?address=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&chain=ethereum"

# Expected: {"success":true,"signals":[...],"count":N}
```

---

## 🎨 UI Access

**Navigate to:** https://intellitrade.xyz/whale-monitor

**Flow Intelligence Tab:**
1. Click "Alpha Signals" in main navigation
2. Select "Flow Intelligence" tab
3. Enter token contract address
4. Click "Analyze"

**Three Tabs:**
- **Overview** - Smart Money, Exchange, Whale flows
- **Smart Money** - Netflows and top wallets
- **Top Traders** - PnL leaderboard rankings

---

## 🔗 Resources

**Full Documentation**: `/NANSEN_FLOW_INTELLIGENCE_COMPLETE.md`  
**API Client**: `/lib/nansen-api.ts`  
**UI Component**: `/app/whale-monitor/components/flow-intelligence-panel.tsx`  
**Live Platform**: https://intellitrade.xyz/whale-monitor  

---

**Deployed**: November 18, 2025  
**Status**: ✅ Operational
