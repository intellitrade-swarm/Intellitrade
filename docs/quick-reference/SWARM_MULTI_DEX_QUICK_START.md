
# ⚡ Swarm Multi-DEX Trading - Quick Start

## 🎯 3-Step Setup

### 1. Ensure Swarm Agents Exist
```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
yarn tsx scripts/initialize-swarm-agents.ts
```

### 2. Verify Agent Has Balance
```sql
-- Check/update swarm agent balance
UPDATE "AIAgent" 
SET "realBalance" = 1000.0 
WHERE name = 'Swarm Consensus Agent';
```

### 3. Trigger a Debate
```typescript
// Via API or script
const debate = await swarmOrchestrator.initiateDebate({
  symbol: 'BTCUSDT',
  currentPrice: 95000,
  priceChange24h: 5.2,
  volume24h: 28000000000,
  triggerReason: 'Strong momentum + whale accumulation',
  marketData: {}
});
```

---

## 🔄 Automatic Venue Selection

### **No configuration needed!** The swarm automatically routes:

| Token Type | Symbol Examples | Venue | Trade Type |
|------------|----------------|-------|------------|
| Perpetuals | BTCUSDT, ETHUSDT | **AsterDEX** | Leveraged futures |
| Solana | SOL, BONK, JUP | **Jupiter** | Spot trading |
| EVM Tokens | USDC, WETH, DAI | **1inch** | Spot aggregator |

---

## 📊 Query Swarm Trades

### **Via API:**
```
GET /api/swarm/trades
```

### **Via Database:**
```typescript
const swarmTrades = await prisma.trade.findMany({
  where: { 
    swarmDebateId: { not: null },
    isRealTrade: true 
  },
  include: { 
    agent: true, 
    swarmDebate: {
      include: {
        messages: true,
        votes: true,
        decision: true
      }
    }
  },
  orderBy: { entryTime: 'desc' }
});
```

---

## 🎯 Trade Execution Flow

```
Market Opportunity
    ↓
Swarm Debate (7 agents analyze)
    ↓
Weighted Consensus (60%+ confidence)
    ↓
Venue Selection (Auto-selected)
    ↓
Execute Trade (AsterDEX / Jupiter / 1inch)
    ↓
Record in Database (Trade + Balance Update)
```

---

## 💡 Key Configuration

### **Confidence Threshold**
```typescript
// In swarm-orchestrator.ts (line 179)
if (decision.confidence >= 60 && ...
```
- **60%+:** Trade executes
- **Below 60%:** Position skipped

### **Position Sizing**
```typescript
// Default: 5% of agent balance
const positionSizePercent = decision.suggestedSize || 5;
```

### **Leverage (AsterDEX only)**
```typescript
// In selectTradingVenue()
const leverage = suggestedSize && suggestedSize > 20 ? 10 : 5;
```

---

## 🚀 Live Monitoring

### **Check Recent Debates:**
```
GET /api/swarm/debates?limit=10
```

### **Check Swarm Performance:**
```
GET /api/swarm/stats
```

### **View Agent Accuracy:**
```sql
SELECT name, accuracy, "votesCorrect", "votesIncorrect"
FROM "SwarmAgent"
ORDER BY accuracy DESC;
```

---

## 🔧 Troubleshooting

### **No trades executing?**
1. Check agent has balance: `SELECT "realBalance" FROM "AIAgent" WHERE name = 'Swarm Consensus Agent'`
2. Check consensus threshold: Is confidence >= 60%?
3. Check DEX credentials: AsterDEX API key, wallet private keys

### **Venue selection not working?**
- Perpetuals must end in `USDT`
- Solana tokens must be in `solanaTokens` array
- Everything else routes to 1inch

### **Trades failing?**
- Check error logs: `SELECT "errorMessage" FROM "Trade" WHERE status = 'CANCELLED'`
- Verify wallet balances on respective chains
- Ensure API keys are valid

---

## 📚 Reference

### **Venue Logic:**
```typescript
// lib/swarm-orchestrator.ts:433-465
selectTradingVenue(symbol, action, suggestedSize)
```

### **Execution:**
```typescript
// lib/swarm-orchestrator.ts:471-671
executeSwarmTrade(debateId, decision)
```

### **Database Schema:**
```prisma
// prisma/schema.prisma:160-203 (Trade model)
// prisma/schema.prisma:578-612 (SwarmDebate model)
```

---

## ✅ Status Checklist

- [x] Multi-DEX integration complete
- [x] Intelligent venue selection
- [x] AsterDEX perpetuals
- [x] Jupiter Solana DEX
- [x] 1inch EVM aggregator
- [x] Database tracking
- [x] Agent balance management
- [x] Error handling
- [x] Tests passing

---

**Platform:** https://intellitrade.xyz  
**Status:** 🟢 LIVE  
**Version:** 1.0.0

---

**Quick Links:**
- Full Guide: [SWARM_MULTI_DEX_TRADING_COMPLETE.md](./SWARM_MULTI_DEX_TRADING_COMPLETE.md)
- Core Swarm: [SWARM_TRADING_SYSTEM_COMPLETE.md](./SWARM_TRADING_SYSTEM_COMPLETE.md)
