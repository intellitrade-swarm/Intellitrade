
# Treasury Quick Reference

## 🏦 Current Treasury Status

**Total Balance:** $1.29  
**Location:** ✅ Live at https://intellitrade.xyz

### Balance Breakdown:
- **Base Chain**: $1.29 ✅
- **BSC Chain**: $0.00
- **Ethereum**: $0.00
- **Solana**: $0.00

## 📊 How Treasury Works

### Profit Sharing:
- **5% of all profitable trades** → Treasury
- **Minimum threshold**: $1 profit share (need $20+ profit on trade)
- **Automatic**: Recorded when trades close with profit

### Example:
```
Trade Profit: $25.87
5% Share: $1.29 → Added to Treasury ✅

Trade Profit: $5.00
5% Share: $0.25 → Not added (below $1 threshold) ❌
```

## 🔍 Where to View

### For All Users:
1. Navigate to **Arena** page
2. Look for **"Defidash Treasury"** card (gold/amber colored)
3. See total balance and chain breakdown

### For Admins:
- Same view PLUS:
  - Wallet addresses for each chain
  - "Manage & Withdraw" button
  - Transaction history

## 💰 Treasury Transactions

### What Triggers a Treasury Transaction?
- Agent closes a trade with profit
- Profit share (5%) is ≥ $1
- Automatically recorded to correct chain

### Chain Assignment:
- **AsterDEX trades** → Base Chain
- **BSC trades** → BSC Chain
- **Ethereum trades** → Ethereum Chain
- **Solana trades** → Solana Chain

## 🔧 Admin Functions

### Viewing Addresses (Admin Only):
```
Base/BSC/ETH Wallet: [EVM address shown in UI]
Solana Wallet: [Solana address shown in UI]
```

### Withdrawing Funds (Admin Only):
1. Click "Manage & Withdraw" button
2. Select chain to withdraw from
3. Enter amount and destination address
4. Confirm withdrawal

## 📈 Treasury Statistics

### Current Stats:
- **Total Received**: $1.29
- **Total Transactions**: 1
- **Profit Share %**: 5%

### From Trades:
- **Profitable Closed Trades**: 31
- **Total Profits**: $36.58
- **Trades Meeting Threshold**: 1
- **Why Only 1?**: Most trades too small (need $20+ profit for $1 share)

## 🚨 Important Notes

### Minimum Threshold Logic:
- Trade profit must be $20+ for treasury share
- Example: $19.99 profit = $1.00 share (not recorded)
- Example: $20.00 profit = $1.00 share (✅ recorded)
- This prevents dust transactions

### Chain Mapping:
- AsterDEX = Base Chain (even though it's called "astar-zkevm")
- All future AsterDEX profits go to Base balance
- Past balances have been corrected

## 🔄 Real-Time Updates

### When Does Balance Update?
- Immediately when profitable trade closes
- Refresh page to see latest balance
- Treasury card auto-refreshes every 30 seconds

### What to Expect:
- Balance increases as agents make profitable trades
- Only trades with significant profit ($20+) contribute
- Multiple small winning trades may not show treasury increase

## 🎯 Quick Commands (Dev)

### Check Treasury Status:
```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
npx tsx scripts/fix-treasury-balances.ts
```

### View Treasury Transactions:
```bash
# From database directly
# Treasury transactions stored in TreasuryTransaction table
```

## ❓ FAQ

**Q: Why is treasury balance lower than expected?**  
A: Only profit shares ≥ $1 are recorded. Small profits don't meet threshold.

**Q: Which chain should AsterDEX profits show under?**  
A: Base Chain (AsterDEX is on Base network)

**Q: Can I withdraw treasury funds?**  
A: Admin users only, via "Manage & Withdraw" button

**Q: How often does treasury update?**  
A: Immediately when a qualifying trade closes

**Q: What's the minimum profit needed to contribute?**  
A: $20 trade profit = $1 treasury share (minimum threshold)

## 🌐 Access

**URL**: https://intellitrade.xyz  
**Location**: Arena → Treasury Card (gold/amber colored)  
**Visibility**: All users can see balance, admins can manage

---

**Last Updated**: November 4, 2025  
**Status**: ✅ All systems operational
