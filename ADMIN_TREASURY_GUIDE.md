
# 🏦 Treasury & Profit-Taking Quick Reference

**For Admins** | Last Updated: Nov 3, 2025

---

## 💰 Current Status

### Quick Check
```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
npx tsx --require dotenv/config scripts/check-current-status.ts
```

**Shows**:
- Recent trades closed (last 24h)
- Total profits
- Treasury balance
- Open trades count

---

## 🎯 Common Actions

### 1. Close All Profitable Positions Now
```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
npx tsx --require dotenv/config scripts/close-all-profitable-asterdex-positions.ts
```

**What it does**:
- Checks all AsterDEX positions
- Closes positions with >2% profit
- Closes positions with <-2.5% loss
- Shows summary of actions taken

### 2. Sync Database with AsterDEX
```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
npx tsx --require dotenv/config scripts/sync-and-close-profitable-positions.ts
```

**What it does**:
- Syncs database with AsterDEX positions
- Closes profitable positions (>2%)
- Updates treasury with profit shares
- Fixes any data inconsistencies

### 3. Start Trading Scheduler
```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
npx tsx --require dotenv/config scripts/start-24-7-trading.ts
```

**What it does**:
- Starts 24/7 automated trading
- Runs every 15 minutes
- Monitors positions for profit-taking
- Generates new trades

---

## 🏦 Treasury Management

### View Treasury Balance (All Users)
1. Go to **Arena** page
2. Treasury display shows at the top
3. Real-time balance across all chains

### Withdraw from Treasury (Admin Only)
1. Go to **Arena** page
2. Click **"Manage Treasury"** button
3. Select chain (Base, BSC, Ethereum, Solana)
4. Enter amount and destination address
5. Confirm transaction

**Note**: Only admin users can withdraw from treasury.

---

## 💰 Profit-Taking Thresholds

| Tier | Profit % | Action |
|------|----------|--------|
| 🚀 Tier 1 | ≥8% | Close immediately |
| 💎 Tier 2 | ≥5% | Close immediately |
| ✅ Tier 3 | ≥3% | Close immediately |
| 💰 Tier 4 | ≥2% | Close immediately |
| 💵 Tier 5 | ≥1.5% | Close after 4 hours |
| ⏰ Time | >12h | Close if profit >0.8% |
| ⏰ Max | >24h | Force close |
| 🛑 Stop | ≤-2.5% | Cut losses |

**Treasury Share**: 5% of all profits

---

## 🔍 Monitoring

### Check Agent Balances
```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
npx tsx --require dotenv/config scripts/check-all-agent-balances.ts
```

### Check Trading Performance
```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
npx tsx --require dotenv/config scripts/check-performance-data.ts
```

### View Recent Trades
```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
npx tsx --require dotenv/config scripts/check-recent-trades.ts
```

---

## 🚨 Troubleshooting

### No Trades Today?
**Possible causes**:
- AI recommends HOLD (bearish market)
- Circuit breakers active (risk management)
- Agent balances too low

**Solution**:
```bash
# Manually trigger a trading cycle
cd /home/ubuntu/ipool_swarms/nextjs_space
npx tsx --require dotenv/config scripts/start-trading-now.ts
```

### Positions Not Closing?
**Solution**:
```bash
# Force close profitable positions
cd /home/ubuntu/ipool_swarms/nextjs_space
npx tsx --require dotenv/config scripts/close-all-profitable-asterdex-positions.ts
```

### Database Out of Sync?
**Solution**:
```bash
# Sync and fix
cd /home/ubuntu/ipool_swarms/nextjs_space
npx tsx --require dotenv/config scripts/sync-and-close-profitable-positions.ts
```

---

## 📊 Expected Behavior

### Normal Operation
- **New trades every 15 minutes** from trading scheduler
- **Positions close automatically** when >2% profit
- **Treasury grows steadily** (5% of all profits)
- **10 agents trading** continuously

### If Seeing Low Activity
1. Check market conditions (bearish = fewer trades)
2. Verify agent balances are sufficient
3. Review circuit breaker logs
4. Manually trigger profit-taking

---

## 🎯 Quick Actions Summary

| Action | Command |
|--------|---------|
| Check Status | `npx tsx --require dotenv/config scripts/check-current-status.ts` |
| Close Profitable | `npx tsx --require dotenv/config scripts/close-all-profitable-asterdex-positions.ts` |
| Sync Database | `npx tsx --require dotenv/config scripts/sync-and-close-profitable-positions.ts` |
| Start Trading | `npx tsx --require dotenv/config scripts/start-24-7-trading.ts` |
| Trigger Cycle | `npx tsx --require dotenv/config scripts/start-trading-now.ts` |

---

## ✅ System Health Checklist

- [ ] Trading scheduler running
- [ ] Agents have sufficient balances
- [ ] Open positions monitored
- [ ] Profitable positions closing
- [ ] Treasury receiving shares
- [ ] No orphaned positions
- [ ] Database synced with AsterDEX

---

**Need Help?** See `PROFIT_TAKING_SYSTEM_VERIFIED.md` for full documentation.
