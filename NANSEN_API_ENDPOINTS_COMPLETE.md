
# ✅ Nansen API Endpoints - Complete Integration

**Status:** ✅ All endpoints implemented and tested  
**Date:** November 19, 2025  
**Platform:** Intellitrade AI Trading Platform

---

## 📋 Complete Endpoint List

All Nansen API endpoints from the official documentation are now implemented and accessible via our API routes.

### 1. Smart Money Endpoints

#### 1.1 Smart Money Netflows
- **Official Endpoint:** `https://docs.nansen.ai/api/smart-money/netflows`
- **Our API:** `GET /api/nansen/netflows`
- **Parameters:**
  - `address` (required): Token contract address
  - `chain` (optional): Blockchain network (default: 'ethereum')
- **Returns:** Smart money net flow data with accumulation/distribution trends
- **Example:**
  ```bash
  curl "https://intellitrade.xyz/api/nansen/netflows?address=0x...'&chain=ethereum"
  ```

#### 1.2 Smart Money Holdings
- **Official Endpoint:** `https://docs.nansen.ai/api/smart-money/holdings`
- **Our API:** `GET /api/nansen/smart-money/holdings`
- **Parameters:**
  - `address` (required): Token contract address
  - `chain` (optional): Blockchain network (default: 'ethereum')
  - `limit` (optional): Number of holders to return (default: 50)
- **Returns:** Current smart money holders and their balances
- **Example:**
  ```bash
  curl "https://intellitrade.xyz/api/nansen/smart-money/holdings?address=0x...&limit=50"
  ```

#### 1.3 Smart Money Historical Holdings
- **Official Endpoint:** `https://docs.nansen.ai/api/smart-money/historical-holdings`
- **Our API:** `GET /api/nansen/smart-money/historical-holdings`
- **Parameters:**
  - `address` (required): Token contract address
  - `chain` (optional): Blockchain network (default: 'ethereum')
  - `timeframe` (optional): Time period (default: '30d')
- **Returns:** Time-series data of smart money holdings
- **Example:**
  ```bash
  curl "https://intellitrade.xyz/api/nansen/smart-money/historical-holdings?address=0x...&timeframe=30d"
  ```

#### 1.4 Smart Money DEX Trades
- **Official Endpoint:** `https://docs.nansen.ai/api/smart-money/dex-trades`
- **Our API:** `GET /api/nansen/smart-money/dex-trades`
- **Parameters:**
  - `address` (required): Token contract address
  - `chain` (optional): Blockchain network (default: 'ethereum')
  - `limit` (optional): Number of trades to return (default: 50)
- **Returns:** Recent DEX trading activity from smart money wallets
- **Example:**
  ```bash
  curl "https://intellitrade.xyz/api/nansen/smart-money/dex-trades?address=0x...&limit=50"
  ```

---

### 2. Token Screener Endpoint

#### 2.1 Token Information
- **Official Endpoint:** `https://api.nansen.ai/api/v1/token-screener`
- **Our API:** `GET /api/nansen/token-info`
- **Parameters:**
  - `address` (required): Token contract address
  - `chain` (optional): Blockchain network (default: 'ethereum')
- **Returns:** Comprehensive token data including price, market cap, holders, Nansen rating
- **Example:**
  ```bash
  curl "https://intellitrade.xyz/api/nansen/token-info?address=0x..."
  ```

---

### 3. TGM (Token God Mode) Endpoints

#### 3.1 Flow Intelligence
- **Official Endpoint:** `https://api.nansen.ai/api/v1/tgm/flow-intelligence`
- **Our API:** `GET /api/nansen/flow-intelligence`
- **Parameters:**
  - `address` (required): Token contract address
  - `chain` (optional): Blockchain network (default: 'ethereum')
- **Returns:** Comprehensive summary of token flows across Smart Money, Exchanges, and Whales
- **Example:**
  ```bash
  curl "https://intellitrade.xyz/api/nansen/flow-intelligence?address=0x..."
  ```

#### 3.2 Token Holders Distribution
- **Official Endpoint:** `https://api.nansen.ai/api/v1/tgm/holders`
- **Our API:** `GET /api/nansen/tgm/holders`
- **Parameters:**
  - `address` (required): Token contract address
  - `chain` (optional): Blockchain network (default: 'ethereum')
- **Returns:** Token holder distribution including smart money percentage and concentration metrics
- **Example:**
  ```bash
  curl "https://intellitrade.xyz/api/nansen/tgm/holders?address=0x..."
  ```

---

### 4. Profiler Endpoints

#### 4.1 Address Current Balances
- **Official Endpoint:** `https://docs.nansen.ai/api/profiler/address-current-balances`
- **Our API:** `GET /api/nansen/profiler/balances`
- **Parameters:**
  - `address` (required): Wallet address
  - `chain` (optional): Blockchain network (default: 'ethereum')
- **Returns:** Current token balances for the specified address
- **Example:**
  ```bash
  curl "https://intellitrade.xyz/api/nansen/profiler/balances?address=0x..."
  ```

#### 4.2 Address Perpetual Positions
- **Official Endpoint:** `https://docs.nansen.ai/api/profiler/address-perp-positions`
- **Our API:** `GET /api/nansen/profiler/perp-positions`
- **Parameters:**
  - `address` (required): Wallet address
  - `chain` (optional): Blockchain network (default: 'ethereum')
- **Returns:** Active perpetual positions across platforms (GMX, dYdX, etc.)
- **Example:**
  ```bash
  curl "https://intellitrade.xyz/api/nansen/profiler/perp-positions?address=0x..."
  ```

#### 4.3 Address Transactions
- **Official Endpoint:** `https://docs.nansen.ai/api/profiler/address-transactions`
- **Our API:** `GET /api/nansen/profiler/transactions`
- **Parameters:**
  - `address` (required): Wallet address
  - `chain` (optional): Blockchain network (default: 'ethereum')
  - `limit` (optional): Number of transactions (default: 50)
  - `token` (optional): Filter by specific token
- **Returns:** Recent transaction history for the address
- **Example:**
  ```bash
  curl "https://intellitrade.xyz/api/nansen/profiler/transactions?address=0x...&limit=50"
  ```

---

### 5. Additional Enhanced Endpoints

#### 5.1 Historical Token Flows
- **Our API:** `GET /api/nansen/flows`
- **Parameters:**
  - `address` (required): Token contract address
  - `chain` (optional): Blockchain network (default: 'ethereum')
  - `category` (optional): Holder category (default: 'smart_money')
  - `timeframe` (optional): Time period (default: '7d')
- **Returns:** Hourly snapshots of balances, inflows, and outflows

#### 5.2 PnL Leaderboard
- **Our API:** `GET /api/nansen/pnl-leaderboard`
- **Parameters:**
  - `address` (required): Token contract address
  - `chain` (optional): Blockchain network (default: 'ethereum')
  - `timeframe` (optional): Time period (default: '30d')
  - `limit` (optional): Number of traders (default: 50)
- **Returns:** Top traders by profitability with ROI and win rate

#### 5.3 Enhanced AI Signals
- **Our API:** `GET /api/nansen/enhanced-signals`
- **Parameters:**
  - `address` (required): Token contract address
  - `chain` (optional): Blockchain network (default: 'ethereum')
- **Returns:** Advanced AI trading signals incorporating Flow Intelligence

#### 5.4 Address Profile
- **Our API:** `GET /api/nansen/profiler/profile`
- **Parameters:**
  - `address` (required): Wallet address
  - `chain` (optional): Blockchain network (default: 'ethereum')
- **Returns:** Comprehensive profile including labels, Nansen score, and category

#### 5.5 Address Counterparties
- **Our API:** `GET /api/nansen/profiler/counterparties`
- **Parameters:**
  - `address` (required): Wallet address
  - `chain` (optional): Blockchain network (default: 'ethereum')
  - `limit` (optional): Number of counterparties (default: 20)
- **Returns:** Frequent interaction partners

#### 5.6 Address Related Wallets
- **Our API:** `GET /api/nansen/profiler/related-wallets`
- **Parameters:**
  - `address` (required): Wallet address
  - `chain` (optional): Blockchain network (default: 'ethereum')
  - `limit` (optional): Number of wallets (default: 10)
- **Returns:** Connected wallet clusters

#### 5.7 Address PnL
- **Our API:** `GET /api/nansen/profiler/pnl`
- **Parameters:**
  - `address` (required): Wallet address
  - `chain` (optional): Blockchain network (default: 'ethereum')
  - `token` (optional): Specific token
  - `timeframe` (optional): Time period (default: '30d')
- **Returns:** Profit & Loss and trade performance metrics

#### 5.8 Address Labels
- **Our API:** `GET /api/nansen/profiler/labels`
- **Parameters:**
  - `address` (required): Wallet address
  - `chain` (optional): Blockchain network (default: 'ethereum')
- **Returns:** Nansen-assigned labels and categories

#### 5.9 Whale Transactions
- **Our API:** `GET /api/nansen/whales`
- **Parameters:**
  - `chain` (optional): Blockchain network (default: 'ethereum')
  - `token` (optional): Token address filter
  - `minAmount` (optional): Minimum USD value (default: 100000)
  - `limit` (optional): Number of transactions (default: 50)
- **Returns:** Recent whale transaction activity

#### 5.10 Smart Money Activity
- **Our API:** `GET /api/nansen/smart-money`
- **Parameters:**
  - `address` (required): Token contract address
  - `chain` (optional): Blockchain network (default: 'ethereum')
- **Returns:** Smart money activity summary including buys, sells, and net flow

#### 5.11 Basic Signals
- **Our API:** `GET /api/nansen/signals`
- **Parameters:**
  - `address` (required): Token contract address
  - `chain` (optional): Blockchain network (default: 'ethereum')
- **Returns:** Basic AI trading signals

#### 5.12 Historical Balances
- **Our API:** `GET /api/nansen/profiler/historical-balances`
- **Parameters:**
  - `address` (required): Wallet address
  - `token` (required): Token contract address
  - `chain` (optional): Blockchain network (default: 'ethereum')
  - `timeframe` (optional): Time period (default: '30d')
- **Returns:** Historical balance timeline for a specific token

#### 5.13 Nansen API Status
- **Our API:** `GET /api/nansen/status`
- **Returns:** Health check for Nansen API integration

---

## 🎯 Summary

### Total Endpoints Implemented: 23

#### By Category:
- **Smart Money:** 4 endpoints (netflows, holdings, historical-holdings, dex-trades)
- **Token Screener:** 1 endpoint (token-info)
- **TGM (Token God Mode):** 2 endpoints (flow-intelligence, holders)
- **Profiler:** 9 endpoints (profile, balances, historical-balances, transactions, counterparties, related-wallets, pnl, labels, perp-positions)
- **Enhanced Features:** 6 endpoints (flows, pnl-leaderboard, enhanced-signals, whales, smart-money, signals)
- **Utility:** 1 endpoint (status)

---

## 🔧 Configuration

All endpoints require the Nansen API key to be configured in the environment:

```env
NANSEN_API_KEY=your_api_key_here
```

The API key is stored in `/home/ubuntu/ipool_swarms/nextjs_space/.env`

---

## ✅ Testing

### Test Endpoint Availability
```bash
# Check API status
curl "https://intellitrade.xyz/api/nansen/status"

# Test token info
curl "https://intellitrade.xyz/api/nansen/token-info?address=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

# Test smart money holdings
curl "https://intellitrade.xyz/api/nansen/smart-money/holdings?address=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

# Test perp positions
curl "https://intellitrade.xyz/api/nansen/profiler/perp-positions?address=0x..."
```

### Test with TypeScript Client
```typescript
import { nansenAPI } from '@/lib/nansen-api';

// Get smart money holdings
const holdings = await nansenAPI.getSmartMoneyHoldings(
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  'ethereum',
  50
);

// Get perp positions
const positions = await nansenAPI.getAddressPerpPositions(
  '0x...',
  'ethereum'
);

// Get DEX trades
const trades = await nansenAPI.getSmartMoneyDEXTrades(
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  'ethereum',
  50
);
```

---

## 📚 Implementation Details

### Library Location
- **Core API Client:** `/lib/nansen-api.ts` (1700+ lines)
- **API Endpoints:** `/app/api/nansen/`

### Features
- ✅ All official Nansen API endpoints covered
- ✅ Comprehensive TypeScript interfaces
- ✅ Built-in caching (1-minute cache duration)
- ✅ Fallback to simulated data when API is unavailable
- ✅ Detailed error handling and logging
- ✅ Support for multiple blockchain networks

### Error Handling
All endpoints include:
- Input validation
- API key configuration checks
- Graceful fallback to simulated data
- Detailed error messages
- HTTP status codes (400, 503, 500)

---

## 🚀 Deployment Status

**Status:** ✅ All endpoints deployed and operational  
**Platform:** https://intellitrade.xyz  
**Last Updated:** November 19, 2025

---

## 📝 Notes

- All endpoints support CORS for browser-based requests
- Rate limiting is handled by the Nansen API
- Caching reduces API calls and improves performance
- Simulated data is returned when API is unavailable (fallback mode)
- All responses follow a consistent JSON structure

---

**Documentation Version:** 1.0  
**Integration Status:** Complete ✅
