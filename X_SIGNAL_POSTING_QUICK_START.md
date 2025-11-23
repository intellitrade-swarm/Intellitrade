# 🚀 X Signal Posting - Quick Start Guide

## ✅ Current Status

**Service:** ✅ RUNNING  
**Account:** @defidash_agent  
**First Post:** Successfully posted (Tweet ID: 1984686395286569334)

---

## 📝 Quick Commands

### Check Service Status
```bash
ps aux | grep "start-x-signal-posting" | grep -v grep
tail -f /tmp/x-signal-posting.log
```

### Restart Service
```bash
pkill -f "start-x-signal-posting"
cd /home/ubuntu/ipool_swarms/nextjs_space
nohup yarn tsx scripts/start-x-signal-posting.ts > /tmp/x-signal-posting.log 2>&1 &
```

### Post Manual Update
```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
yarn tsx scripts/post-manual-signal.ts update "Your message here #DeFi #AITrading"
```

### Post Trading Signal
```bash
yarn tsx scripts/post-manual-signal.ts signal ETH LONG 2500 10 75 "Breaking resistance"
# Format: signal [TOKEN] [LONG/SHORT] [PRICE] [LEVERAGE] [CONFIDENCE] [REASONING]
```

---

## 🎯 What Gets Posted Automatically

1. **New Trades** (60%+ confidence)
   - Posts when agents open positions
   - Shows token, direction, price, leverage

2. **Trade Closures** ($50+ P&L)
   - Posts when significant trades close
   - Shows profit/loss and performance

3. **Performance Updates** (Every 4 hours)
   - 24H trade summary
   - Win rate and total P&L

---

## ⚙️ Settings

- **Check Interval:** Every 15 minutes
- **Post Cooldown:** 30 minutes between posts
- **Min Confidence:** 60%
- **Min P&L:** $50

**To adjust:** Edit `/home/ubuntu/ipool_swarms/nextjs_space/lib/x-signal-poster.ts`

---

## 📊 Monitor Activity

```bash
# Watch live posts
tail -f /tmp/x-signal-posting.log | grep "Posted"

# Check recent trades
cd /home/ubuntu/ipool_swarms/nextjs_space
yarn tsx scripts/check-recent-trades.ts
```

---

## 🚨 Troubleshooting

**No posts appearing?**
1. Check if service is running (see commands above)
2. Verify agents are trading (service only posts real trades)
3. Check cooldown period (30 min between posts)

**Service crashed?**
1. Check logs: `tail -50 /tmp/x-signal-posting.log`
2. Restart service (see commands above)
3. Verify X API credentials are valid

---

## 📱 Example Posts

### Milestone Announcement
```bash
yarn tsx scripts/post-manual-signal.ts update "🎉 100 trades completed! 📈 $5K+ profit | 68% win rate | 100% AI-driven #DeFi #AITrading"
```

### Market Update
```bash
yarn tsx scripts/post-manual-signal.ts update "📊 ETH consolidating at $2,400 support. AI agents watching for breakout. #CryptoMarket #Trading"
```

### New Feature
```bash
yarn tsx scripts/post-manual-signal.ts update "🚀 NEW: Multi-chain trading activated! Base, Solana, BSC now supported. #DeFi #CryptoTrading"
```

---

## ✨ Tips

- Post manually for special announcements
- Monitor first 24H to adjust settings
- Check X engagement to optimize content
- Keep messages under 280 characters

---

**Full Documentation:** See `X_API_DEFIDASH_AGENT_SUMMARY.md` for complete details

