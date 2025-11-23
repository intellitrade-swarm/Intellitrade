
# Oracle Features - Quick Reference Guide

## 🚀 Quick Access
**Location:** Oracle Page → Oracle Features Tab

## 📊 Three Main Features

### 1. 🤖 AI Analysis
**What it does:** Get AI-powered market analysis and trading recommendations

**Quick Start:**
1. Select AI provider (Grok recommended)
2. Enter query: "Analyze BTC market conditions"
3. Click "Get AI Analysis"

**Supported Providers:**
- Grok (Default)
- NVIDIA
- OpenAI
- Gemini

---

### 2. 📈 Trading Signals
**What it does:** Generate trading signals for multiple cryptocurrencies

**Quick Start:**
1. Select symbols (BTC, ETH, SOL, etc.)
2. Click "Get Trading Signals"
3. Review signals with confidence scores

**Signal Types:**
- 🟢 STRONG BUY (90%+ confidence)
- 🟢 BUY (75%+ confidence)
- ⚪ HOLD (60% confidence)
- 🔴 SELL (75%+ confidence)
- 🔴 STRONG SELL (90%+ confidence)

**Each signal shows:**
- Current price & 24h change
- Volume & liquidity
- RSI indicator
- AI reasoning

---

### 3. 🔗 Cross-Chain Liquidity
**What it does:** Compare token liquidity across multiple blockchains

**Quick Start:**
1. Enter token (e.g., "USDC")
2. Select chains (Solana, Ethereum, Base, etc.)
3. Click "Get Cross-Chain Liquidity"

**Supported Chains:**
- Solana
- Ethereum
- Base
- Polygon
- Arbitrum
- Optimism

**Shows:**
- Total liquidity across all chains
- Per-chain breakdown
- Top trading pairs
- DEX information

---

## 🎯 Example Use Cases

### Market Analysis
```
Query: "Should I buy Bitcoin right now?"
Provider: Grok
Result: Detailed analysis with confidence score
```

### Trading Decision
```
Symbols: BTC, ETH, SOL
Result: BUY/SELL/HOLD signals with market data
Use: Make informed trading decisions
```

### Liquidity Check
```
Token: USDC
Chains: Solana, Base, Ethereum
Result: Compare liquidity across chains
Use: Find best chain for trading
```

---

## 📝 API Endpoints

| Feature | Endpoint | Method |
|---------|----------|--------|
| AI Analysis | `/api/oracle/ai-analysis` | POST |
| Trading Signals | `/api/oracle/trading-signals` | POST |
| Cross-Chain | `/api/oracle/cross-chain-liquidity` | POST |

---

## ✅ Status
All three Oracle features are **fully operational** and ready to use!

**Last Updated:** November 3, 2025
