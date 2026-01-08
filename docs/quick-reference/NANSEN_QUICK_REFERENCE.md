
# 📋 Nansen API Quick Reference

**Status:** ✅ All endpoints implemented and tested  
**Total Endpoints:** 23  
**Platform:** https://intellitrade.xyz

---

## 🚀 Quick Test Commands

### Smart Money Endpoints

```bash
# 1. Smart Money Holdings
curl "https://intellitrade.xyz/api/nansen/smart-money/holdings?address=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&limit=50"

# 2. Smart Money Historical Holdings
curl "https://intellitrade.xyz/api/nansen/smart-money/historical-holdings?address=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&timeframe=30d"

# 3. Smart Money DEX Trades
curl "https://intellitrade.xyz/api/nansen/smart-money/dex-trades?address=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&limit=50"

# 4. Smart Money Netflows
curl "https://intellitrade.xyz/api/nansen/netflows?address=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
```

### Token Screener

```bash
# 5. Token Information
curl "https://intellitrade.xyz/api/nansen/token-info?address=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&chain=ethereum"
```

### TGM (Token God Mode)

```bash
# 6. Flow Intelligence
curl "https://intellitrade.xyz/api/nansen/flow-intelligence?address=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

# 7. Token Holders
curl "https://intellitrade.xyz/api/nansen/tgm/holders?address=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
```

### Profiler Endpoints

```bash
# 8. Address Profile
curl "https://intellitrade.xyz/api/nansen/profiler/profile?address=0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503"

# 9. Address Balances
curl "https://intellitrade.xyz/api/nansen/profiler/balances?address=0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503"

# 10. Address Perp Positions (NEW)
curl "https://intellitrade.xyz/api/nansen/profiler/perp-positions?address=0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503"

# 11. Address Transactions
curl "https://intellitrade.xyz/api/nansen/profiler/transactions?address=0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503&limit=50"

# 12. Address Labels
curl "https://intellitrade.xyz/api/nansen/profiler/labels?address=0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503"
```

---

## 📊 Endpoint Mapping

### User's Requested Endpoints → Our Implementation

| # | Official Nansen Endpoint | Our API Endpoint | Status |
|---|--------------------------|------------------|--------|
| 1 | `/api/v1/smart-money/netflows` | `/api/nansen/netflows` | ✅ |
| 2 | `/api/v1/smart-money/holdings` | `/api/nansen/smart-money/holdings` | ✅ NEW |
| 3 | `/api/v1/smart-money/historical-holdings` | `/api/nansen/smart-money/historical-holdings` | ✅ NEW |
| 4 | `/api/v1/smart-money/dex-trades` | `/api/nansen/smart-money/dex-trades` | ✅ NEW |
| 5 | `/api/v1/token-screener` | `/api/nansen/token-info` | ✅ |
| 6 | `/api/v1/tgm/flow-intelligence` | `/api/nansen/flow-intelligence` | ✅ |
| 7 | `/api/v1/tgm/holders` | `/api/nansen/tgm/holders` | ✅ NEW |
| 8 | `/api/v1/profiler/address-current-balances` | `/api/nansen/profiler/balances` | ✅ |
| 9 | `/api/v1/profiler/address-perp-positions` | `/api/nansen/profiler/perp-positions` | ✅ NEW |
| 10 | `/api/v1/profiler/address-transactions` | `/api/nansen/profiler/transactions` | ✅ |

---

## 🆕 Newly Added Endpoints (This Session)

### 1. Smart Money Holdings
- **Endpoint:** `/api/nansen/smart-money/holdings`
- **Purpose:** Get current smart money holders and their balances
- **Method:** `nansenAPI.getSmartMoneyHoldings(address, chain, limit)`

### 2. Smart Money Historical Holdings
- **Endpoint:** `/api/nansen/smart-money/historical-holdings`
- **Purpose:** Time-series data of smart money accumulation/distribution
- **Method:** `nansenAPI.getSmartMoneyHistoricalHoldings(address, chain, timeframe)`

### 3. Smart Money DEX Trades
- **Endpoint:** `/api/nansen/smart-money/dex-trades`
- **Purpose:** Recent DEX trading activity from smart money wallets
- **Method:** `nansenAPI.getSmartMoneyDEXTrades(address, chain, limit)`

### 4. TGM Holders
- **Endpoint:** `/api/nansen/tgm/holders`
- **Purpose:** Token holder distribution with smart money percentage
- **Method:** `nansenAPI.getTokenHolderDistribution(address, chain)`

### 5. Address Perp Positions
- **Endpoint:** `/api/nansen/profiler/perp-positions`
- **Purpose:** Active perpetual positions across platforms
- **Method:** `nansenAPI.getAddressPerpPositions(address, chain)`

---

## 💻 TypeScript Usage Examples

```typescript
import { nansenAPI } from '@/lib/nansen-api';

// Get smart money holdings
const holdings = await nansenAPI.getSmartMoneyHoldings(
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  'ethereum',
  50
);

console.log(`Total smart money holders: ${holdings.totalHolders}`);
console.log(`Total value USD: $${holdings.totalValueUSD.toLocaleString()}`);

// Get historical holdings
const historical = await nansenAPI.getSmartMoneyHistoricalHoldings(
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  'ethereum',
  '30d'
);

console.log(`Historical data points: ${historical.history.length}`);

// Get DEX trades
const trades = await nansenAPI.getSmartMoneyDEXTrades(
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  'ethereum',
  50
);

console.log(`Recent DEX trades: ${trades.length}`);

// Get perp positions
const positions = await nansenAPI.getAddressPerpPositions(
  '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503',
  'ethereum'
);

console.log(`Total positions: ${positions.positions.length}`);
console.log(`Total unrealized PnL: $${positions.totalUnrealizedPnLUSD}`);

// Get token holders
const holders = await nansenAPI.getTokenHolderDistribution(
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  'ethereum'
);

console.log(`Smart money percentage: ${holders.smartMoneyPercentage}%`);
```

---

## 🧪 Test All Endpoints

Run the automated test script:

```bash
cd /home/ubuntu/ipool_swarms
./TEST_NANSEN_ENDPOINTS.sh
```

Expected output: All 16 endpoints should return ✅

---

## 📝 New TypeScript Interfaces

### SmartMoneyHoldings
```typescript
interface SmartMoneyHoldings {
  token: string;
  chain: string;
  holders: Array<{
    address: string;
    label?: string;
    balance: number;
    balanceUSD: number;
    percentage: number;
    firstSeen: string;
    lastActivity: string;
  }>;
  totalHolders: number;
  totalValueUSD: number;
}
```

### SmartMoneyHistoricalHoldings
```typescript
interface SmartMoneyHistoricalHoldings {
  token: string;
  chain: string;
  history: Array<{
    timestamp: string;
    holders: number;
    totalBalanceUSD: number;
    netFlow: number;
    netFlowUSD: number;
  }>;
}
```

### SmartMoneyDEXTrade
```typescript
interface SmartMoneyDEXTrade {
  hash: string;
  timestamp: string;
  address: string;
  label?: string;
  token: string;
  tokenSymbol: string;
  action: 'BUY' | 'SELL';
  amount: number;
  amountUSD: number;
  price: number;
  dex: string;
  chain: string;
}
```

### AddressPerpPosition
```typescript
interface AddressPerpPosition {
  address: string;
  chain: string;
  platform: string;
  positions: Array<{
    market: string;
    side: 'LONG' | 'SHORT';
    size: number;
    sizeUSD: number;
    entryPrice: number;
    markPrice: number;
    leverage: number;
    unrealizedPnL: number;
    unrealizedPnLUSD: number;
    liquidationPrice?: number;
    timestamp: string;
  }>;
  totalPositionValueUSD: number;
  totalUnrealizedPnLUSD: number;
}
```

---

## ✅ Testing Results

All endpoints tested successfully on November 19, 2025:

```
✅ Smart Money Holdings - OK
✅ Smart Money Historical Holdings - OK
✅ Smart Money DEX Trades - OK
✅ Smart Money Netflows - OK
✅ Token Info - OK
✅ Flow Intelligence - OK
✅ TGM Holders - OK
✅ Address Balances - OK
✅ Address Perp Positions - OK
✅ Address Transactions - OK
✅ Address Profile - OK
✅ Address Labels - OK
✅ Enhanced Signals - OK
✅ PnL Leaderboard - OK
✅ Whale Transactions - OK
✅ Nansen API Status - OK
```

---

## 🔧 Configuration

Nansen API key is configured at:
```
/home/ubuntu/ipool_swarms/nextjs_space/.env
NANSEN_API_KEY=QpQGxaiUSPhf8oxAISrgStYW2lXg9rOJ
```

---

## 📚 Full Documentation

For complete details, see:
- **Complete Guide:** `/home/ubuntu/ipool_swarms/NANSEN_API_ENDPOINTS_COMPLETE.md`
- **API Client:** `/home/ubuntu/ipool_swarms/nextjs_space/lib/nansen-api.ts`
- **Test Script:** `/home/ubuntu/ipool_swarms/TEST_NANSEN_ENDPOINTS.sh`

---

**Last Updated:** November 19, 2025  
**Status:** ✅ All endpoints operational  
**Platform:** https://intellitrade.xyz
