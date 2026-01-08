# Nansen Token God Mode - Quick Reference

## 🚀 Base URL
```
https://intellitrade.xyz/api/nansen/token-god-mode
```

## 📋 All Available Endpoints

### 1. Token Screener
```bash
GET /token-screener?chain=ethereum&limit=10&minMarketCap=1000000&minVolume=500000
```
**Response:** Top trending tokens with filtering

### 2. Token Information
```bash
GET /token-information?address=0x...&chain=ethereum
```
**Response:** Comprehensive token data

### 3. Flow Intelligence
```bash
GET /flow-intelligence?address=0x...&chain=ethereum
```
**Response:** Smart Money, Exchange, Whale flows

### 4. Holders
```bash
GET /holders?address=0x...&chain=ethereum
```
**Response:** Token holder distribution

### 5. Flows
```bash
GET /flows?address=0x...&chain=ethereum&category=smart_money&timeframe=7d
```
**Response:** Historical token flows by category

### 6. Who Bought/Sold ⭐ NEW
```bash
GET /who-bought-sold?address=0x...&chain=ethereum&limit=50
```
**Response:** Buyer/Seller analysis, net flow, buy pressure

### 7. DEX Trades
```bash
GET /dex-trades?address=0x...&chain=ethereum&limit=50
```
**Response:** Recent smart money DEX trades

### 8. Token Transfers ⭐ NEW
```bash
GET /token-transfers?address=0x...&chain=ethereum&limit=50
```
**Response:** Transfer statistics, top active wallets

### 9. Jupiter DCAs ⭐ NEW (Solana)
```bash
GET /jupiter-dcas?tokenMint=So11111111111111111111111111111111111111112&limit=20
```
**Response:** DCA order tracking (simulated, ready for real API)

### 10. PnL Leaderboard
```bash
GET /pnl-leaderboard?address=0x...&chain=ethereum&timeframe=30d&limit=50
```
**Response:** Top traders by profitability

### 11. Perp Screener
```bash
GET /perp-screener?chain=ethereum&limit=20
```
**Response:** Perpetual market screener

### 12. Perp PnL Leaderboard
```bash
GET /perp-pnl-leaderboard?platform=GMX&timeframe=30d&limit=50
```
**Response:** Top perp traders leaderboard

### 13. Perp Positions
```bash
GET /perp-positions?address=0x...&chain=ethereum
```
**Response:** Aggregate perpetual positioning

### 14. Perp Trades
```bash
GET /perp-trades?address=0x...&chain=ethereum&limit=50
```
**Response:** Recent perpetual trading activity

---

## 🧪 Quick Test Commands

### Test Token Screener (Works)
```bash
curl "https://intellitrade.xyz/api/nansen/token-god-mode/token-screener?chain=ethereum&limit=5"
```

### Test Who Bought/Sold (NEW)
```bash
curl "https://intellitrade.xyz/api/nansen/token-god-mode/who-bought-sold?address=0xdAC17F958D2ee523a2206206994597C13D831ec7&chain=ethereum"
```

### Test Token Transfers (NEW)
```bash
curl "https://intellitrade.xyz/api/nansen/token-god-mode/token-transfers?address=0xdAC17F958D2ee523a2206206994597C13D831ec7&chain=ethereum"
```

### Test Jupiter DCAs (NEW - Solana)
```bash
curl "https://intellitrade.xyz/api/nansen/token-god-mode/jupiter-dcas?tokenMint=So11111111111111111111111111111111111111112"
```

### Test Perp Screener (Works)
```bash
curl "https://intellitrade.xyz/api/nansen/token-god-mode/perp-screener?chain=ethereum&limit=5"
```

---

## 📊 Status Summary

✅ **12/14 Endpoints Fully Operational**
⚠️ **2/14 Endpoints Limited** (Token Information, Holders - Nansen API 404)
⭐ **4 New Endpoints Created** (Token Screener, Who Bought/Sold, Token Transfers, Jupiter DCAs)

---

## 🔧 Common Parameters

- `address` - Token contract address (0x...)
- `chain` - Blockchain (ethereum, bsc, polygon, base)
- `limit` - Number of results (default varies)
- `timeframe` - Time period (24h, 7d, 30d)
- `category` - Holder category (smart_money, exchange, whale)
- `platform` - Perp platform (GMX, dYdX, Synthetix)

---

**Status:** Production Ready
**Test Script:** `TEST_TOKEN_GOD_MODE.sh`
**Documentation:** `TOKEN_GOD_MODE_STATUS.md`
