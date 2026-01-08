# 🌐 Cross-Chain Liquidity Aggregator - Quick Start

**URL:** https://intellitrade.xyz/cross-chain  
**Status:** ✅ Live  
**Innovation:** AI-powered cross-chain routing with 20-40% savings

---

## 🎯 What It Does

1. **Finds the cheapest route** across 7 chains, 20+ DEXs, and 7 bridges
2. **Executes in one click** - no manual bridging needed
3. **Saves 20-40%** compared to CEX fees
4. **Uses AI** to rank and select optimal paths

---

## 🚀 Quick Usage

### **1. Access Dashboard**
Visit: https://intellitrade.xyz/cross-chain

### **2. Set Up Trade**
- Select **from chain** and **token**
- Enter **amount**
- Select **to chain** and **token**
- Click "Find Optimal Routes"

### **3. Review Routes**
- Compare multiple route options
- View cost breakdown (gas, fees, slippage)
- Check execution time and confidence score
- See savings vs CEX fees

### **4. Execute**
- Select your preferred route
- Click "Execute Selected Route"
- Done! 🎉

---

## 📊 Supported Chains

- ✅ Ethereum
- ✅ Base
- ✅ BSC
- ✅ Solana
- ✅ Arbitrum
- ✅ Optimism
- ✅ Polygon

---

## 🌉 Supported Bridges

- ✅ Across (fastest - 1 min)
- ✅ Stargate
- ✅ Hop
- ✅ Synapse
- ✅ Celer
- ✅ Connext
- ✅ Axelar

---

## 🔒 Risk Budget Levels

### **Conservative**
- Max slippage: 0.5%
- Max gas: $50
- Time: 5 minutes
- Chains: ETH, Base, Arbitrum
- Bridges: Across, Stargate, Hop

### **Moderate** (Default)
- Max slippage: 1.0%
- Max gas: $100
- Time: 10 minutes
- Chains: 5 chains
- Bridges: 5 bridges

### **Aggressive**
- Max slippage: 2.0%
- Max gas: $200
- Time: 30 minutes
- Chains: All 7
- Bridges: All 7

---

## 📊 Example Routes

### **Same Chain**
```
ETH → USDC on Ethereum
Cost: $18 | Time: 30s | Savings: 40%
```

### **Cross-Chain**
```
ETH (Ethereum) → SOL (Solana)
Steps: ETH → USDC → Bridge → SOL
Cost: $20 | Time: 90s | Savings: 32%
```

---

## 🎯 Key Features

- ✅ AI route optimization
- ✅ Real-time cost calculation
- ✅ Confidence scoring (0-100)
- ✅ Multi-step execution
- ✅ Comprehensive analytics
- ✅ One-click trading

---

## 📊 API Endpoints

```
POST /api/cross-chain/find-route
GET  /api/cross-chain/risk-budget
POST /api/cross-chain/risk-budget
POST /api/cross-chain/execute-route
GET  /api/cross-chain/stats
```

---

## 📁 Documentation

**Full Guide:** `/CROSS_CHAIN_LIQUIDITY_AGGREGATOR_COMPLETE.md`  
**Dashboard:** https://intellitrade.xyz/cross-chain  
**Platform:** Intellitrade

---

**Built:** November 17, 2025  
**Status:** ✅ Production Ready
