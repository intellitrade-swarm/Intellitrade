
# 🐝 Swarm Intelligence - Quick Start Guide

**Status:** ✅ DEPLOYED  
**URL:** https://intellitrade.xyz/swarm-intelligence

---

## What is Swarm Intelligence?

Multi-agent collaborative AI system with **5 specialized trading agents**:
1. 🧠 **Data Analyst** - Nansen data, smart money flows
2. 📊 **Technical Analyst** - RSI, MACD, volume analysis
3. 🛡️ **Risk Manager** - Position sizing, stop-loss
4. 🎯 **Strategy Coordinator** - Consensus building
5. 📈 **Performance Evaluator** - Trade review, learning

---

## Quick Access

### Dashboard
```
https://intellitrade.xyz/swarm-intelligence
```

### API Endpoints
```bash
# Analyze symbol
POST /api/swarm/analyze
{
  "symbol": "ETH",
  "agentId": "agent-id",
  "balance": 100
}

# Get status
GET /api/swarm/status
```

---

## How It Works

```
User Input (ETH) 
    ↓
🐝 SWARM ACTIVATED
    ↓
┌─────────────────────┐
│  PARALLEL ANALYSIS  │
├─────────────────────┤
│ • Data Analyst      │ → Nansen data, smart money
│ • Technical Analyst │ → RSI, MACD, volume
│ • Risk Manager      │ → Position sizing, risk
└─────────────────────┘
    ↓
🎯 STRATEGY COORDINATOR
    ↓
Weighted Consensus (78% confidence)
    ↓
📊 FINAL DECISION: BUY
```

---

## Quick Test

### Via Dashboard
1. Go to `/swarm-intelligence`
2. Enter "ETH" in symbol input
3. Click "Analyze"
4. View swarm decision + individual agent analyses

### Via API
```bash
curl -X POST http://localhost:3000/api/swarm/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol": "ETH", "agentId": "demo", "balance": 100}'
```

---

## Agent Breakdown

| Agent | Priority | Expertise | Output |
|-------|----------|-----------|--------|
| 🧠 Data Analyst | 5 (Critical) | Nansen, on-chain | Recommendation + metrics |
| 📊 Technical Analyst | 4 | RSI, MACD, volume | Recommendation + technicals |
| 🛡️ Risk Manager | 5 (Critical) | Position size, risk | Risk-adjusted recommendation |
| 🎯 Strategy Coordinator | 3 | Consensus | Final decision |
| 📈 Performance Evaluator | 2 | Learning | Patterns, improvements |

---

## Decision Confidence

- **75-100%:** High confidence → Execute trade
- **50-74%:** Medium confidence → Consider execution
- **<50%:** Low confidence → HOLD

---

## Risk Management

- Max Position: 15% of balance
- Recommended: 10% (12% for STRONG_BUY)
- Stop Loss: 5%
- Take Profit: 10%
- Max Open Positions: 5
- Circuit Breaker: -30% daily loss

---

## Integration Example

```typescript
import { getSwarmTradingDecision } from '@/lib/swarm-trading-executor';

const decision = await getSwarmTradingDecision(
  agentData,
  marketData,
  { useSwarm: true, symbol: 'ETH' }
);

if (decision.action === 'BUY' && decision.confidence >= 0.75) {
  executeTrade({
    symbol: decision.symbol,
    side: 'BUY',
    quantity: decision.quantity * balance,
  });
}
```

---

## Cost Per Analysis

- Data Analyst: ~$0.02
- Technical Analyst: ~$0.01
- Risk Manager: ~$0.01
- Strategy Coordinator: ~$0.005

**Total:** ~$0.045 per swarm decision

---

## Key Advantages

✅ Multi-perspective analysis  
✅ Reduced bias (vs single agent)  
✅ Dedicated risk management  
✅ Nansen on-chain intelligence  
✅ Weighted consensus  
✅ Cost-effective ($0.045/decision)  

---

## Enable/Disable

Add to `.env`:
```bash
ENABLE_SWARM=true  # Enable swarm mode
```

---

## Documentation

**Full Guide:** `/SWARM_INTELLIGENCE_COMPLETE.md`  
**Live Dashboard:** `https://intellitrade.xyz/swarm-intelligence`  
**API Docs:** See complete guide  

---

## Support

**Files:**
- `/lib/trading-swarm.ts` - Core swarm logic
- `/lib/swarm-trading-executor.ts` - Integration layer
- `/app/api/swarm/*/route.ts` - API endpoints
- `/app/swarm-intelligence/page.tsx` - Dashboard UI

**Status:** ✅ Production Ready  
**Platform:** Intellitrade AI Trading  
**Version:** 1.0.0
