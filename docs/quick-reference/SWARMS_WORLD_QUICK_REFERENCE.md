# 🚀 Swarms.World Integration - Quick Reference

## 📌 Essential Info

**Integration File**: `/nextjs_space/lib/swarms-hedge-fund.ts`  
**API Base**: `https://api.swarms.world/v1`  
**Environment Variable**: `SWARMS_API_KEY`

## 🔧 Setup

1. Get API key from [swarms.world](https://swarms.world)
2. Add to `.env`: `SWARMS_API_KEY=your_key_here`
3. Initialize: `yarn tsx scripts/initialize-swarms-hedge-fund.ts`

## 📊 Core Functions

### Initialize Hedge Fund
```typescript
import { initializeHedgeFundStructure } from '@/lib/swarms-hedge-fund';
await initializeHedgeFundStructure();
```

### CEO Capital Allocation
```typescript
import { ceoAllocateCapital } from '@/lib/swarms-hedge-fund';

await ceoAllocateCapital([
  {
    agentId: 'agent-id',
    allocatedCapital: 50000,
    maxDrawdown: 10,
    targetReturn: 20,
    riskTolerance: 'MODERATE'
  }
], 'Allocation reasoning');
```

### CEO Risk Override
```typescript
import { ceoRiskOverride } from '@/lib/swarms-hedge-fund';

await ceoRiskOverride(
  'agent-id',
  'HALT_TRADING', // or REDUCE_POSITION, CLOSE_ALL, RESUME_TRADING
  'Risk reasoning'
);
```

### Daily Report
```typescript
import { generateCEODailyReport } from '@/lib/swarms-hedge-fund';
const report = await generateCEODailyReport();
```

### Agent Communication
```typescript
import { agentCommunication } from '@/lib/swarms-hedge-fund';

await agentCommunication(
  'from-agent-id',
  'to-agent-id',
  'Message content',
  'HIGH' // LOW, MEDIUM, HIGH, URGENT
);
```

### Portfolio Rebalancing
```typescript
import { suggestPortfolioRebalance } from '@/lib/swarms-hedge-fund';
const suggestions = await suggestPortfolioRebalance();
```

## 🏢 Organizational Hierarchy

```
Intel CEO (Level 5)
  ├── Funding Phantom (Level 3)
  ├── Volatility Sniper (Level 3)
  ├── Sentiment Sage (Level 3)
  └── Arbitrage Ace (Level 3)
```

## 🎯 Risk Tolerance Levels

- **CONSERVATIVE**: Max drawdown 5%, Target return 10%
- **MODERATE**: Max drawdown 10%, Target return 20%
- **AGGRESSIVE**: Max drawdown 15%, Target return 35%

## ⚠️ Override Actions

- `HALT_TRADING`: Stop agent immediately
- `REDUCE_POSITION`: Scale down positions
- `CLOSE_ALL`: Emergency close all
- `RESUME_TRADING`: Reactivate agent

## 📈 Rebalancing Logic

- Base allocation: **25%** per agent
- **+15%** for win rate > 60%
- **+10%** for strong profits
- **-15%** for win rate < 30%
- Min: **10%**, Max: **40%**

## 🔄 Fallback Behavior

If Swarms API unavailable:
- ✅ Functions work locally
- ⚠️ Warnings logged
- 🔄 Auto-sync when reconnected

## 🐛 Quick Troubleshooting

**API Error**: Check `SWARMS_API_KEY` in `.env`  
**Agent Not Found**: Run `yarn prisma generate`  
**Permission Denied**: Regenerate API key

## 📚 Resources

- **Docs**: https://docs.swarms.world
- **API**: https://api.swarms.world/docs
- **Support**: support@swarms.world

---

**Status**: ✅ Integrated  
**Version**: 1.0.0  
**Platform**: Intellitrade
