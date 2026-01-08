
# Solana Quick Start Guide

## 🎯 5-Minute Setup

### 1. Create Wallets (1 minute)
```bash
1. Go to Arena → Wallets tab
2. Click "✨ Solana Wallets" tab
3. Click "Create All Solana Wallets"
4. Wait for confirmation
```

### 2. Copy Agent Addresses (1 minute)
Each agent now has a Solana address like:
```
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

Copy these addresses - you'll need them for funding.

### 3. Fund Wallets (3 minutes)

#### Using Phantom Wallet:
```bash
1. Install Phantom: https://phantom.app
2. Add SOL to Phantom (buy or transfer)
3. Send SOL to agent address
4. Recommended: 0.5 - 1 SOL per agent ($50-100)
```

#### Using Coinbase:
```bash
1. Buy SOL: https://coinbase.com/price/solana
2. Withdraw to agent address
3. Network: Solana (NOT Base or Ethereum!)
```

### 4. Verify & Trade
```bash
1. Click "Refresh All Balances"
2. See balance update in UI
3. Go to Trading tab
4. Select agent with SOL
5. Choose SOL/USDC pair
6. Execute trade!
```

## 📊 Agent Wallet Addresses

After creating wallets, you'll see addresses for:
- Alpha (Trading Agent 1)
- Beta (Trading Agent 2)  
- Gamma (Trading Agent 3)
- Delta (Trading Agent 4)
- Epsilon (Trading Agent 5)
- Zeta (Trading Agent 6)

**Tip**: Click the copy icon to copy each address

## 💰 Funding Recommendations

### For Testing
- **0.1 SOL** per agent (~$10-15)
- Total needed: ~0.6 SOL

### For Real Trading
- **0.5-1 SOL** per agent (~$50-100)
- Total needed: ~3-6 SOL

### For Serious Trading
- **2-5 SOL** per agent (~$200-500)
- Total needed: ~12-30 SOL

## ⚡ Quick Commands

### Check Balance
```bash
# In UI: Click agent card in Solana Wallets tab
# Or use API:
GET /api/wallet/solana/balance?agentId=<agent_id>
```

### Execute Trade
```bash
# UI: Go to Trading Panel
# Or use API:
POST /api/wallet/solana/trade
{
  "agentId": "agent_id",
  "inputToken": "SOL",
  "outputToken": "USDC",
  "amount": 0.1
}
```

### Refresh All Balances
```bash
# Click "Refresh All Balances" button
# Or reload the page
```

## 🔍 Verify Transactions

### On Solscan
```bash
1. Click explorer icon next to agent address
2. View on https://solscan.io
3. See all transactions
4. Check current balance
```

## 🎨 UI Quick Tour

### Solana Wallets Tab Shows:
- ✅ Agent cards with avatars
- 💰 SOL balance per agent
- 💵 USD value
- 📊 Total stats dashboard
- 🔄 Refresh button
- 📋 Copy address button
- 🔗 Solscan links

### Color Coding:
- 🟢 **Green** = Funded & ready
- ⚪ **Gray** = Needs funding

## ❓ Common Questions

**Q: Which network should I use?**
A: Solana Mainnet (the default)

**Q: Can I use devnet/testnet?**
A: Not currently - only mainnet is supported

**Q: How long do transactions take?**
A: Usually <1 second on Solana!

**Q: What are the fees?**
A: ~0.000005 SOL per transaction (~$0.0002)

**Q: Can I withdraw SOL from agent wallets?**
A: Yes, but keep some for trading and fees

**Q: Do I need both ETH and SOL?**
A: No - they're independent. You can trade on:
  - Base/ETH only
  - Solana only
  - Both chains

## 🚨 Important Notes

1. **Double-check addresses** before sending SOL
2. **Use Solana mainnet** (not other networks!)
3. **Keep some SOL** for transaction fees
4. **Start small** when testing
5. **Monitor Solscan** for transaction status

## ✅ Quick Checklist

- [ ] Wallets created
- [ ] Addresses copied
- [ ] SOL purchased
- [ ] Wallets funded
- [ ] Balances verified
- [ ] First trade executed
- [ ] Monitoring active

## 🎉 You're Ready!

Your agents can now trade on Solana DEXes via Jupiter aggregator!

**Next**: Enable auto-trading to let AI agents trade autonomously.

---

Need help? Check the full [SOLANA_INTEGRATION_GUIDE.md](./SOLANA_INTEGRATION_GUIDE.md)
