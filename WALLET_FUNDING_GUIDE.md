
# 💰 Wallet Funding Guide - Real Trading Setup

## 🚨 Current Issue
Your AI agents have **database balances** but **ZERO actual USDC** in their on-chain wallets on Base network. To enable real trading, you must deposit USDC into these wallets.

## 📋 Agent Wallet Addresses (Base Network)

### Arbitrage Ace
- **Address:** `0xc2661254E113fF48db8b61B4fF4cED8239568ebB`
- **Database Balance:** $100.00
- **Actual On-Chain USDC:** $0.00 ❌
- **Needs:** At least $50 USDC to start trading

### Momentum Master
- **Address:** `0x38bCBfF67EF49165097198979EC33Ce2AD670093`
- **Database Balance:** $100.00
- **Actual On-Chain USDC:** $0.00 ❌
- **Needs:** At least $50 USDC to start trading

### Reversion Hunter
- **Address:** `0x23080e1847f3BBbb3868306Dda45a96Bad83A383`
- **Database Balance:** $100.00
- **Actual On-Chain USDC:** $0.00 ❌
- **Needs:** At least $50 USDC to start trading

### Sentiment Sage
- **Address:** `0x88Bd590873550C92fA308f46e7d0C9Bc66Dff0C6`
- **Database Balance:** $100.00
- **Actual On-Chain USDC:** $0.00 ❌
- **Needs:** At least $50 USDC to start trading

### Neural Nova
- **Address:** `0x282B6B7D9CDBF2E690cD0c6C7261047a684154e4`
- **Database Balance:** $5.00
- **Actual On-Chain USDC:** $0.00 ❌
- **Needs:** At least $5 USDC to start trading

### Technical Titan
- **Address:** `0xc2A052893CE31017C0047Fcf523603150f6C0de4`
- **Database Balance:** $100.00
- **Actual On-Chain USDC:** $0.00 ❌
- **Needs:** At least $50 USDC to start trading

---

## 🔧 How to Fund Wallets (Step-by-Step)

### Option 1: Using Coinbase (Recommended)

1. **Login to Coinbase**
   - Go to [coinbase.com](https://www.coinbase.com/)
   - Login to your account

2. **Buy USDC**
   - Navigate to "Trade" → "Buy"
   - Select USDC
   - Choose amount (e.g., $500 total to fund all agents)
   - Complete purchase

3. **Transfer to Base Network**
   - Go to "Assets" → "USDC"
   - Click "Send"
   - Select "Base" network
   - Enter agent wallet address
   - Enter amount (e.g., $100 per agent)
   - Confirm transaction

4. **Repeat for each agent**
   - Send USDC to each of the 6 wallet addresses above
   - Wait 1-2 minutes for confirmation

### Option 2: Using MetaMask

1. **Add Base Network to MetaMask**
   - Network Name: Base Mainnet
   - RPC URL: `https://mainnet.base.org`
   - Chain ID: 8453
   - Currency Symbol: ETH
   - Block Explorer: `https://basescan.org`

2. **Get USDC on Base**
   - Bridge from Ethereum using [bridge.base.org](https://bridge.base.org)
   - Or buy directly on Base DEX

3. **Send to Agent Wallets**
   - For each agent address above
   - Send USDC on Base network
   - Gas fees will be paid in ETH (very small on Base)

### Option 3: Using Bridge

1. **Go to Base Bridge**
   - Visit [bridge.base.org](https://bridge.base.org)
   - Connect your wallet

2. **Bridge USDC**
   - Select "From: Ethereum" → "To: Base"
   - Choose USDC
   - Enter amount
   - Complete bridge transaction (5-10 minutes)

3. **Distribute to Agents**
   - Once USDC is on Base in your wallet
   - Send to each agent address

---

## 💡 Quick Fund Script

I can create a script to automatically distribute USDC from your main wallet to all agent wallets:

```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
yarn tsx scripts/fund-agents.ts
```

**Requirements:**
- You need a funded wallet on Base with USDC
- Set environment variable: `FUNDING_WALLET_PRIVATE_KEY`
- Script will distribute equally to all agents

---

## 🔍 Verify Funding

After funding, run this command to check balances:

```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
yarn tsx --require dotenv/config check-wallets.ts
```

You should see actual USDC balances instead of $0.00.

---

## ⚡ Minimum Required Amounts

For real trading to work:
- **Minimum per agent:** $10 USDC (for small trades)
- **Recommended per agent:** $50-100 USDC (for optimal trading)
- **Total recommended:** $300-600 USDC (for all 6 agents)

---

## 🚀 After Funding

Once wallets are funded:

1. **Verify balances** using the command above
2. **Start automated trading** from the Arena page
3. **Enable continuous trading** for 24/7 operation
4. **Monitor trades** in real-time on the dashboard

---

## ⚠️ Important Notes

- **Network:** All wallets are on **Base network** (not Ethereum mainnet)
- **Gas fees:** Need small amount of ETH on Base for gas (~$0.01 per trade)
- **USDC Contract on Base:** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Security:** Never share your private keys
- **Backup:** Save your wallet recovery phrases securely

---

## 📊 Trading Will Work When:

✅ Wallets have actual USDC balance > $10  
✅ Wallets have small ETH for gas fees  
✅ Base RPC is configured (already done)  
✅ Avantis integration is active (already done)  

Currently you have 0/4 ✅

---

## 🆘 Need Help?

If you need assistance:
1. Fund at least ONE agent wallet with $50 USDC
2. I can test trading with that one agent
3. Once confirmed working, fund the rest

**Test Agent Recommendation:** Start with "Momentum Master"  
`0x38bCBfF67EF49165097198979EC33Ce2AD670093`

Fund this wallet with $50 USDC on Base network, then we can test!
