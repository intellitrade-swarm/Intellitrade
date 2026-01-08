# Chainlink Oracle Quick Start Guide

## 🚀 Access Your Professional Oracle

### Web Interface
1. **Login** to your iCHAIN Swarms platform
2. Navigate to **Oracle** page (top navigation)
3. Click the **"Chainlink Oracle"** tab

---

## 🎯 Quick Tasks

### 1. Get Multi-Source Price Feed
- Go to **Price Feed** section
- Enter token symbol (e.g., ETH, BTC, SOL)
- Click **"Get Price"**
- View consensus price from multiple sources

**Features:**
- ✅ Median price calculation
- ✅ DexScreener + CoinGecko aggregation
- ✅ 24h volume and change data
- ✅ Source verification

### 2. Request AI Consensus Analysis
- Go to **AI Analysis** section
- Enter token symbol
- Click **"Analyze"**
- Get multi-AI trading recommendation

**Features:**
- ✅ NVIDIA + Grok AI consensus
- ✅ Sentiment analysis (BULLISH/BEARISH/NEUTRAL)
- ✅ Confidence scoring (0-100%)
- ✅ Trading recommendation (BUY/SELL/HOLD)

### 3. Monitor Protocol Liquidity
- Go to **Liquidity** section
- Enter protocol name (e.g., uniswap, aave)
- Click **"Get Data"**
- View cross-chain TVL data

**Features:**
- ✅ Total Value Locked (TVL)
- ✅ 24h change tracking
- ✅ DefiLlama integration

### 4. View System Status
- Go to **Requests** section
- View active oracle requests
- Check external adapters status
- Monitor job specifications

---

## 📡 API Integration

### Get Price Feed
```bash
curl -X POST https://intellitrade.xyz/api/oracle/chainlink \
  -H "Content-Type: application/json" \
  -d '{
    "action": "request_price_feed",
    "symbol": "ETH"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "price": 3250.45,
    "volume24h": 12500000000,
    "priceChange24h": 2.3,
    "sources": 2,
    "consensus": "median",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Get AI Analysis
```bash
curl -X POST https://intellitrade.xyz/api/oracle/chainlink \
  -H "Content-Type: application/json" \
  -d '{
    "action": "request_ai_analysis",
    "symbol": "ETH",
    "marketData": {
      "price": 3250,
      "volume24h": 12500000000
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sentiment": "BULLISH",
    "confidence": 85,
    "recommendation": "BUY",
    "aiProviders": 2,
    "breakdown": {
      "bullish": 2,
      "bearish": 0,
      "neutral": 0
    }
  }
}
```

### Get Liquidity Data
```bash
curl -X POST https://intellitrade.xyz/api/oracle/chainlink \
  -H "Content-Type: application/json" \
  -d '{
    "action": "request_liquidity",
    "protocol": "uniswap"
  }'
```

---

## 🛠️ External Adapters

Your oracle includes 5 professional adapters:

1. **DexScreener Adapter**
   - Type: Price Feed
   - Source: https://api.dexscreener.com
   - Status: ✅ Active

2. **CoinGecko Adapter**
   - Type: Market Data
   - Source: https://api.coingecko.com
   - Status: ✅ Active

3. **DefiLlama Adapter**
   - Type: Liquidity
   - Source: https://api.llama.fi
   - Status: ✅ Active

4. **NVIDIA AI Adapter**
   - Type: AI Analysis
   - Provider: NVIDIA
   - Status: ✅ Active

5. **Grok AI Adapter**
   - Type: AI Analysis
   - Provider: Grok
   - Status: ✅ Active

---

## 📋 Job Specifications

### 1. Price Feed Job
- **ID:** `price_feed_job`
- **Sources:** DexScreener + CoinGecko
- **Consensus:** Median of prices
- **Min Responses:** 2

### 2. AI Analysis Job
- **ID:** `ai_analysis_job`
- **Providers:** NVIDIA + Grok
- **Consensus:** Weighted sentiment
- **Min Responses:** 2

### 3. Liquidity Monitor Job
- **ID:** `liquidity_monitor_job`
- **Sources:** DefiLlama + DexScreener
- **Consensus:** Aggregated TVL
- **Min Responses:** 2

---

## 🔐 Security Features

- ✅ **Multi-Source Verification**: No single point of failure
- ✅ **Consensus Mechanism**: Multiple sources must agree
- ✅ **Timeout Protection**: Prevents hanging requests
- ✅ **Retry Logic**: Auto-retries failed adapters
- ✅ **Data Validation**: Filters outliers and bad data

---

## 📊 Use Cases

### For Traders
1. Verify prices before large trades
2. Get AI consensus for entry/exit points
3. Check liquidity before DEX trades
4. Monitor protocol health

### For Developers
1. Build trading bots with reliable data
2. Integrate multi-source price feeds
3. Access AI analysis programmatically
4. Monitor request lifecycle

### For Operations
1. Track oracle performance
2. Monitor adapter health
3. View request history
4. Audit data sources

---

## 🎓 Advanced Usage

### Custom Request
```typescript
import { chainlinkOracle } from '@/lib/chainlink-oracle';

const request = await chainlinkOracle.createRequest(
  'price_feed_job',     // Job ID
  'my_service',         // Requester
  { symbol: 'BTC' },    // Parameters
  'https://my-app.com/callback' // Callback URL
);

// Poll for result
const result = chainlinkOracle.getRequest(request.id);
```

### List All Adapters
```bash
curl https://intellitrade.xyz/api/oracle/chainlink?action=list_adapters
```

### List All Jobs
```bash
curl https://intellitrade.xyz/api/oracle/chainlink?action=list_jobs
```

### Check Request Status
```bash
curl "https://intellitrade.xyz/api/oracle/chainlink?action=get_request&requestId=req_xxx"
```

---

## 📈 Benefits

### Accuracy
- Median consensus reduces price manipulation
- Multiple AI providers improve signal quality
- Cross-verification ensures data integrity

### Reliability
- Automatic retries on failures
- Fallback to available sources
- Timeout protection

### Transparency
- Full audit trail of data sources
- Request lifecycle tracking
- Consensus methodology visible

---

## 🆘 Troubleshooting

### Price Feed Not Working
1. Check if symbol is supported
2. Verify API rate limits
3. Check adapter status in Requests tab

### AI Analysis Slow
- AI analysis takes 30-60 seconds
- Multiple providers need to respond
- High confidence requires agreement

### Liquidity Data Missing
- Protocol name must match DefiLlama
- Use lowercase (e.g., "uniswap" not "Uniswap")
- Check if protocol is indexed

---

## 📚 Documentation

- **Full Guide**: `/CHAINLINK_ORACLE_INTEGRATION.md`
- **Chainlink Docs**: https://docs.chain.link/any-api/getting-started
- **External Adapters**: https://github.com/smartcontractkit/external-adapters-js

---

## ✅ System Status

- 🟢 Oracle Service: **ACTIVE**
- 🟢 External Adapters: **5 Active**
- 🟢 Job Specifications: **3 Enabled**
- 🟢 Consensus: **Multi-Source**

Your professional-grade oracle is ready! 🚀
