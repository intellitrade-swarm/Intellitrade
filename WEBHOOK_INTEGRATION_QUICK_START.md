
# 🔔 Webhook Integration - Quick Start Guide

**Live Dashboard:** https://intellitrade.xyz/webhooks  
**Status:** ✅ Operational

---

## 📌 Quick Reference

### Webhook URLs

**TradingView Alerts:**
```
https://intellitrade.xyz/api/webhooks/tradingview
```

**Nansen Whale Alerts:**
```
https://intellitrade.xyz/api/webhooks/nansen
```

---

## 🚀 TradingView Setup (2 Minutes)

### Step 1: Create Alert
1. Open TradingView chart
2. Press `Alt+A` (or right-click → "Add Alert")
3. Configure your strategy/indicator

### Step 2: Configure Webhook
**Webhook URL:** `https://intellitrade.xyz/api/webhooks/tradingview`

**Message (JSON):**
```json
{
  "ticker": "{{ticker}}",
  "action": "buy",
  "price": {{close}},
  "alertType": "technical"
}
```

### Step 3: Test
```bash
curl -X POST https://intellitrade.xyz/api/webhooks/tradingview \
  -H "Content-Type: application/json" \
  -d '{"ticker":"BTCUSDT","action":"buy","price":45000,"alertType":"technical"}'
```

---

## 🐋 Nansen Whale Alert Setup

### Webhook Configuration
**URL:** `https://intellitrade.xyz/api/webhooks/nansen`

**Payload:**
```json
{
  "whaleAddress": "0x...",
  "tokenAddress": "0x...",
  "chain": "ethereum",
  "amount": 1000000,
  "action": "buy"
}
```

### What Happens
1. 🔔 Webhook received
2. 📊 Nansen data auto-fetched (smart money, flow intel)
3. 🤖 5-agent swarm analyzes
4. ✅ Returns BUY/SELL/HOLD recommendation

---

## 📊 Alert Types Supported

| Type | Description | Example |
|------|-------------|---------|
| `technical` | RSI, MACD, indicators | RSI oversold |
| `price` | Price crosses threshold | BTC > $50k |
| `volume` | Volume spikes | Volume 3x avg |
| `whale` | Large wallet movements | Whale bought 1M |
| `custom` | Any custom strategy | Your algo |

---

## 🎯 What You Get Back

**Response:**
```json
{
  "success": true,
  "data": {
    "webhookId": "clx123...",
    "action": "technical_alert_analyzed",
    "swarmDecision": {
      "action": "BUY",
      "confidence": 85,
      "reasoning": "Strong bullish setup...",
      "recommendedSize": 5,
      "stopLoss": 4,
      "takeProfit": 12,
      "approved": true
    },
    "processingTime": 3450
  }
}
```

**Key Fields:**
- `action`: BUY, SELL, or HOLD
- `confidence`: 0-100% (only trade if >75%)
- `recommendedSize`: % of capital to allocate
- `stopLoss/takeProfit`: Risk management levels
- `approved`: Risk manager approval (true/false)

---

## 🧪 Testing Your Webhooks

### 1. Test TradingView
```bash
curl -X POST https://intellitrade.xyz/api/webhooks/tradingview \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "ETHUSDT",
    "action": "buy",
    "price": 2500,
    "alertType": "technical"
  }'
```

### 2. Test Nansen
```bash
curl -X POST https://intellitrade.xyz/api/webhooks/nansen \
  -H "Content-Type: application/json" \
  -d '{
    "whaleAddress": "0x1234...",
    "tokenAddress": "0xc02a...",
    "chain": "ethereum",
    "amount": 1000000
  }'
```

### 3. Check Dashboard
Visit https://intellitrade.xyz/webhooks to see:
- ✅ Total webhooks received
- 📊 Processing time stats
- 🕐 Recent event feed
- 📈 Alert type distribution

---

## 💡 Pro Tips

### For TradingView
- Use `{{ticker}}` to auto-fill symbol
- Add `"strategy": "My Strategy Name"` for tracking
- Set `alertType` to categorize signals

### For Whale Alerts
- Include `transactionHash` for verification
- Set `confidence` (0-100) if you have it
- Specify `chain` for multi-chain tokens

### General
- All webhooks return in <5 seconds
- Swarm analysis is automatic
- Nansen data auto-enriched (if available)
- Full audit trail in database

---

## 📊 Dashboard Features

**URL:** https://intellitrade.xyz/webhooks

**What You See:**
- Total webhooks (24h, 7d, 30d)
- Processed vs pending
- Average processing time
- Alert type breakdown
- Recent 10 events with status
- Copy-to-clipboard webhook URLs
- Example payloads for each type

---

## 🔄 Processing Flow

```
Alert Fires → Webhook Received → Validated
                    ↓
              Nansen Enrichment (if whale alert)
                    ↓
         Multi-Agent Swarm Analysis
                    ↓
         BUY/SELL/HOLD Decision + Risk Check
                    ↓
         Response Returned + Event Logged
```

**Average Time:** 3-5 seconds

---

## 🎓 Examples

### Example 1: RSI Oversold
**TradingView Alert:**
```json
{
  "ticker": "BTCUSDT",
  "action": "buy",
  "price": 44500,
  "alertType": "technical",
  "strategy": "RSI Oversold"
}
```

**Swarm Response:**
- Action: BUY
- Confidence: 82%
- Size: 5% of capital
- Reasoning: "RSI at 28, strong support at $44k..."

### Example 2: Whale Buy
**Nansen Webhook:**
```json
{
  "whaleAddress": "0xabc...",
  "tokenAddress": "0xc02a...", // ETH
  "chain": "ethereum",
  "amount": 5000000,
  "action": "buy"
}
```

**Swarm Response:**
- Action: BUY
- Confidence: 88%
- Size: 7% of capital
- Reasoning: "Smart money accumulation, netflow +$12M, bullish flow intel..."

---

## ⚠️ Important Notes

1. **Webhooks are PUBLIC** - No auth required (TradingView limitation)
2. **Processing takes 3-5 seconds** - Don't expect instant response
3. **Only 35% of signals are approved** - Strict risk management
4. **Nansen enrichment only for mapped tokens** - ETH, USDC, USDT, etc.
5. **Results logged forever** - Full audit trail

---

## 🔗 Resources

**Documentation:**
- Full Guide: `/TRADINGVIEW_WEBHOOK_INTEGRATION_COMPLETE.md`
- Swarm System: `/SWARM_INTELLIGENCE_COMPLETE.md`
- Multi-Agent: `/MULTI_AGENT_TRADING_SYSTEM_COMPLETE.md`

**API Endpoints:**
- `POST /api/webhooks/tradingview` - TradingView alerts
- `POST /api/webhooks/nansen` - Whale alerts
- `GET /api/webhooks/stats` - Statistics

**Live URLs:**
- Dashboard: https://intellitrade.xyz/webhooks
- TradingView: https://intellitrade.xyz/api/webhooks/tradingview
- Nansen: https://intellitrade.xyz/api/webhooks/nansen

---

**Status:** ✅ Operational  
**Cost:** ~$0.045 per webhook analysis  
**Speed:** 3-5 seconds average  
**Approval Rate:** ~35% (high-confidence only)  

**Ready to trade smarter! 🚀**
