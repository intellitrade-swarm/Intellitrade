
# 🎯 Profit Taking Quick Reference

## Current Configuration
- **Profit Threshold:** 5.0%
- **Calculation Method:** Leveraged price movement
- **Auto-Close:** ✅ Enabled
- **Check Frequency:** Every 5 minutes

## Current Positions

### ETHUSDT SHORT 5x
- Entry: $3,734.57
- Current: ~$3,712
- Profit: ~2.9%
- Target: $3,640 (5% profit)

### BTCUSDT SHORT 20x
- Entry: $107,613.40
- Current: ~$107,500
- Profit: ~2.1%
- Target: $106,880 (5% profit)

## Quick Commands

```bash
# Check profit status
cd /home/ubuntu/ipool_swarms/nextjs_space
yarn tsx scripts/verify-profit-calculation.ts

# Force close at 5%+
yarn tsx scripts/close-5-percent-positions.ts

# Check monitor
ps aux | grep profit-taking
```

## What's Running
- ✅ Profit-taking monitor (every 5 min)
- ✅ Trading scheduler (new trades)
- ✅ Treasury updates (auto)

## Auto-Close Flow
1. Monitor detects 5% profit
2. Market order placed
3. Position closed
4. Database updated
5. Treasury credited

**Status:** All systems operational ✅
