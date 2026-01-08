# 🔷 Nansen API Integration - Quick Start

**Status:** ✅ Live at https://intellitrade.xyz  
**Date:** November 18, 2025

---

## 🚀 Quick Access

### Check API Status
```bash
curl https://intellitrade.xyz/api/nansen/status
```

### Get Token Info
```bash
curl "https://intellitrade.xyz/api/nansen/token-info?address=0x...&chain=ethereum"
```

### Track Smart Money
```bash
curl "https://intellitrade.xyz/api/nansen/smart-money?address=0x...&chain=ethereum"
```

### Monitor Whales
```bash
curl "https://intellitrade.xyz/api/nansen/whales?chain=ethereum&minAmount=100000"
```

### Get AI Signals
```bash
curl "https://intellitrade.xyz/api/nansen/signals?address=0x...&chain=ethereum"
```

---

## 📊 Key Features

✅ **Real On-Chain Data** - Live blockchain analytics from Nansen  
✅ **Smart Money Tracking** - Identify profitable wallets (70%+ win rate)  
✅ **Whale Monitoring** - Track $100K+ transactions  
✅ **AI Signals** - Automated trading recommendations  
✅ **Response Caching** - 1-minute cache for performance  

---

## 🔑 API Key

**Location**: `/nextjs_space/.env`  
**Variable**: `NANSEN_API_KEY`  
**Value**: `QpQGxaiUSPhf8oxAISrgStYW2lXg9rOJ`

---

## 📡 API Endpoints

### 1. Token Information
**Endpoint**: `/api/nansen/token-info`  
**Params**: `address`, `chain` (default: ethereum)  
**Returns**: Price, holders, smart money count, Nansen rating

### 2. Smart Money Activity
**Endpoint**: `/api/nansen/smart-money`  
**Params**: `address`, `chain`  
**Returns**: Buys, sells, net flow, top wallets

### 3. Whale Transactions
**Endpoint**: `/api/nansen/whales`  
**Params**: `chain`, `token` (optional), `minAmount`, `limit`  
**Returns**: Recent whale movements with confidence scores

### 4. AI Trading Signals
**Endpoint**: `/api/nansen/signals`  
**Params**: `address`, `chain`  
**Returns**: Signal type, confidence, urgency, recommendation

### 5. Status Check
**Endpoint**: `/api/nansen/status`  
**Params**: None  
**Returns**: Configuration status, operational status

---

## 🎯 Signal Types

1. **SMART_MONEY_ACCUMULATION**
   - Smart money buying > selling
   - Confidence: 60-95%
   - Urgency: MEDIUM/HIGH

2. **WHALE_MOVEMENT**
   - Multiple whale buys detected
   - Confidence: 50-90%
   - Urgency: HIGH/CRITICAL

3. **DEX_VOLUME_SPIKE**
   - High trading volume + smart money inflow
   - Confidence: 75%
   - Urgency: MEDIUM

---

## 🔧 Integration Examples

### JavaScript/TypeScript
```typescript
// Get token info
const response = await fetch('/api/nansen/token-info?address=0x...&chain=ethereum');
const { tokenInfo } = await response.json();

// Track smart money
const smartMoney = await fetch('/api/nansen/smart-money?address=0x...');
const { activity } = await smartMoney.json();

// Get signals
const signals = await fetch('/api/nansen/signals?address=0x...');
const { signals: nansenSignals } = await signals.json();
```

### Enhanced Whale Monitor
```typescript
// Combine traditional + Nansen signals
const response = await fetch('/api/whale-monitor/signals?symbol=ETH&address=0x...&chain=ethereum');
const { signal, nansen } = await response.json();

// nansen.signals - Nansen AI signals
// nansen.tokenInfo - Token intelligence
// nansen.smartMoney - Smart money activity
```

---

## 💡 Best Practices

1. **Cache Awareness**: First API call may take 200-800ms, subsequent calls <10ms (1-minute cache)
2. **Error Handling**: Always check `success` field in response
3. **Fallback Logic**: System works without Nansen if unavailable
4. **Chain Support**: Currently supports Ethereum (more chains coming)
5. **Rate Limiting**: Built-in caching reduces API calls

---

## 📈 Confidence Scoring

**Smart Money Accumulation:**
- Base: 60%
- +1% per net flow unit
- Max: 95%

**Whale Movement:**
- Base: 50%
- +10% per whale transaction
- Max: 90%

**Signal Fusion:**
- Traditional: 50%
- Smart Money: 30%
- Whale Activity: 20%

---

## ✅ Quick Test

```bash
# 1. Check if Nansen is configured
curl https://intellitrade.xyz/api/nansen/status

# Expected: {"success":true,"configured":true,"status":"operational"}

# 2. Get recent whale transactions
curl "https://intellitrade.xyz/api/nansen/whales?chain=ethereum&limit=10"

# Expected: {"success":true,"transactions":[...],"count":10}

# 3. Get signals for ETH
curl "https://intellitrade.xyz/api/nansen/signals?address=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&chain=ethereum"

# Expected: {"success":true,"signals":[...],"count":N}
```

---

## 🔗 Resources

**Full Documentation**: `/NANSEN_INTEGRATION_COMPLETE.md`  
**API Client**: `/lib/nansen-api.ts`  
**Integration**: `/lib/whale-monitor.ts`  
**Live Platform**: https://intellitrade.xyz  

---

**Deployed**: November 18, 2025  
**Status**: ✅ Operational
