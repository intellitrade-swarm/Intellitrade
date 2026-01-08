# 5% Minimum Profit Threshold Update

**Date**: November 3, 2025  
**Status**: ✅ ACTIVE

---

## 🎯 Overview

The profit-taking system has been updated to use a **5% minimum profit threshold** (previously 2%). This ensures agents only close positions when substantial gains are achieved, allowing more room for positions to develop into larger profits.

---

## ⚙️ Changes Implemented

### Profit-Taking Tiers (Updated)

| Tier | Threshold | Action | Status |
|------|-----------|--------|--------|
| **TIER 1** | ≥8% profit | Close immediately | 🚀 EXCELLENT PROFIT |
| **TIER 2** | ≥5% profit | Close immediately | 💎 GREAT PROFIT |

### Removed Tiers

The following tiers have been **removed** to focus on larger gains:
- ~~TIER 3: >3% profit~~
- ~~TIER 4: >2% profit~~
- ~~TIER 5: >1.5% profit (after 4h)~~

### Time-Based Exit Logic

| Condition | Threshold | Action |
|-----------|-----------|--------|
| **24h+ holding** | ≥3% profit | Close with profit |
| **48h+ holding** | Any PnL | Force close |
| **Stop Loss** | ≤-2.5% | Cut losses |

---

## 📈 Expected Impact

### Advantages
- ✅ **Larger average profits** per trade
- ✅ **Reduced noise trading** (fewer small exits)
- ✅ **Better position development** (more time to reach targets)
- ✅ **Lower transaction costs** (fewer trades)

### Considerations
- ⏰ Longer holding times expected
- 📊 Fewer but more profitable trades
- 💎 Focus on quality over quantity

---

## 🔧 Technical Details

**File Updated**: `lib/aster-autonomous-trading.ts`

### Profit-Taking Logic
```typescript
// TIER 1: EXCELLENT PROFIT (>8%)
if (pnlPercent >= 8) {
  shouldClose = true;
  closeReason = `🚀 EXCELLENT PROFIT: ${pnlPercent.toFixed(2)}%`;
}
// TIER 2: GREAT PROFIT (>5%)
else if (pnlPercent >= 5) {
  shouldClose = true;
  closeReason = `💎 GREAT PROFIT: ${pnlPercent.toFixed(2)}%`;
}
```

---

## 📊 Monitoring

To monitor the impact of this change:

### Check Recent Trades
```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
npx tsx scripts/check-recent-trades.ts
```

### View Performance
```bash
npx tsx scripts/check-performance-data.ts
```

### Monitor Open Positions
```bash
npx tsx scripts/check-open-trades.ts
```

---

## 🎓 Best Practices

1. **Let positions develop**: The 5% threshold allows more time for trades to mature
2. **Trust the system**: Don't manually close positions below 5% unless stop-loss triggered
3. **Monitor time-based exits**: Positions held >24h with 3%+ profit will still close
4. **Review performance weekly**: Assess if threshold needs adjustment

---

## 🚀 Status

- ✅ Code updated and tested
- ✅ Application rebuilt
- ✅ Checkpoint saved
- ✅ Trading scheduler active

**Next Profit-Taking**: When positions reach ≥5% or ≥8% gains

---

## 📝 Notes

- Stop-loss remains at -2.5% for quick loss cutting
- Time-based exits still active (24h @ 3%, 48h force close)
- Treasury profit sharing (5%) continues as before
- All existing positions will use new thresholds going forward

---

*Updated by: AI Trading System*  
*Last Modified: 2025-11-03*
