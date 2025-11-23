# 🐋 Whale Monitor & Social Sentiment AI - Quick Start

**Status:** ✅ Core infrastructure deployed  
**API Base:** https://intellitrade.xyz/api/whale-monitor

---

## 🎯 What It Does

1. **Tracks whale wallets** - Monitors $100k+ on-chain moves
2. **Analyzes X sentiment** - Real-time social buzz tracking  
3. **Generates AI signals** - Multi-source confidence scoring
4. **Auto-adjusts positions** - Whale Shadow Mode
5. **Sends Telegram alerts** - Instant pump notifications

---

## 🚀 Quick Usage

### **1. Check Signals**
```bash
POST /api/whale-monitor/signals
{
  "symbol": "ETH",
  "userId": "user123"
}

Response:
{
  "signal": {
    "action": "BUY",
    "confidence": 87,
    "urgency": "HIGH"
  }
}
```

### **2. Set Preferences**
```bash
POST /api/whale-monitor/preferences
{
  "userId": "user123",
  "whaleShadowMode": true,
  "minimumConfidence": 75,
  "maxPositionSize": 5
}
```

### **3. Get Stats**
```bash
GET /api/whale-monitor/stats

Response:
{
  "whaleActivity": {
    "signals": 12,
    "totalVolume": "$15.4M"
  }
}
```

---

## 🐋 Tracked Whales

- **Vitalik Buterin** (95 reputation)
- **Binance Wallets** (90 reputation)
- **Jump Trading** (85 reputation)
- **Unknown Whales** (70+ reputation)

---

## 📊 Signal Types

- **WHALE_MOVE** - Pure whale activity
- **SOCIAL_BUZZ** - X sentiment only
- **MULTI_SIGNAL** - Combined (highest confidence)

---

## ⚡ Urgency Levels

- **CRITICAL** (90-100) - Execute in 15 min
- **HIGH** (75-89) - Execute in 1-4 hours
- **MEDIUM** (60-74) - Execute in 4-24 hours
- **LOW** (<60) - Monitor only

---

## 🎮 User Controls

```typescript
{
  enabledSignals: {
    whaleMoves: true,
    socialBuzz: true,
    news: true
  },
  minimumConfidence: 65,
  autoAdjustPositions: false,
  whaleShadowMode: false, // Opt-in whale mimicking
  maxPositionSize: 10,
  telegramAlerts: true
}
```

---

## 🔐 Security

✅ All whale moves verified on-chain  
✅ Transaction hash proof included  
✅ No off-chain trust required  
✅ User override at any time  

---

## 📱 Telegram Alerts

```
🚨 IMMINENT HIGH SIGNAL

Symbol: ETH
Action: BUY
Confidence: 87%

🐋 Whale Activity:
   • Vitalik BUY $500,000
   • Jump Trading BUY $2,000,000

🐦 Social Sentiment:
   • 15,430 tweets
   • Sentiment: +78
   • 47 influencer mentions
   • 🔥 TRENDING

⏰ Timeframe: 1-4 hours
📊 Position Size: 8.7%
```

---

## 🌐 X API Integration

```env
X_API_KEY=QRBhZ2UjfUVK4FjAsYUVc5mcv
X_API_SECRET=PKFVAlm7U9GlTD9yy3OnIsom8ews0FEUAOo5vU7uPd7Uh8MFCB
X_BEARER_TOKEN=...
X_ACCESS_TOKEN=...
X_ACCESS_TOKEN_SECRET=...
```

---

## 📁 API Endpoints

```
POST /api/whale-monitor/signals
GET  /api/whale-monitor/signals?symbol=ETH
GET  /api/whale-monitor/preferences
POST /api/whale-monitor/preferences
GET  /api/whale-monitor/stats
```

---

## 🎯 Key Features

- ✅ On-chain verification (txHash proof)
- ✅ Multi-source confidence scoring
- ✅ Whale Shadow Mode (auto-mimic)
- ✅ User-defined risk controls
- ✅ Telegram instant alerts
- ✅ No trust required

---

**Built:** November 17, 2025  
**Platform:** Intellitrade  
**Docs:** `/WHALE_MONITOR_SYSTEM_COMPLETE.md`
