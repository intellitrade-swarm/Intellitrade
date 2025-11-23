# 🚀 Copy Trading Quick Start Guide

## ⚡ Setup in 3 Steps

### 1️⃣ Connect Wallet
```bash
# Click "Connect Wallet" button in dashboard
# Scan QR code or click your wallet app
# Approve connection
```

### 2️⃣ Select Agent
```bash
# Browse top agents ranked by PnL
# Review agent stats (win rate, trades, etc.)
# Click "Copy This Agent"
```

### 3️⃣ Set Allocation
```bash
# Enter allocation amount (e.g., 1000 USDC)
# Review estimated trade sizes
# Click "Start Copy Trading"
```

---

## 📊 Dashboard Overview

### Top Agents Section
- **Total PnL** - Agent's total profit/loss
- **Win Rate** - Percentage of winning trades
- **Trades** - Number of completed trades
- **Copiers** - Number of users copying this agent

### Your Copy Trading Stats
- **Active Agents** - Number of agents you're copying
- **Total PnL** - Your total profit/loss from copy trading
- **Active Trades** - Number of currently open positions
- **Win Rate** - Your copy trading success rate

---

## 🔑 Key Features

### ✅ Automatic Execution
- Trades are copied instantly and automatically
- No manual intervention required
- Position sizes scaled proportionally

### ✅ Risk Management
- Set maximum allocation per agent
- Built-in stop-loss protection
- Slippage limits applied

### ✅ Real-time Monitoring
- Live trade updates
- Real-time PnL calculations
- Performance charts

### ✅ Full Control
- Stop copying anytime
- Adjust allocations
- Close positions manually

---

## 🎯 API Endpoints

### Start Copy Trading
```bash
POST /api/copy-trading/start
{
  "agentId": "agent_123",
  "allocation": 1000,
  "walletAddress": "0x..."
}
```

### Get Your Stats
```bash
GET /api/copy-trading/stats
```

### Get Top Agents
```bash
GET /api/copy-trading/top-agents?limit=10
```

### Stop Copy Trading
```bash
POST /api/copy-trading/stop
{
  "agentId": "agent_123"
}
```

---

## ⚠️ Important Notes

### Before You Start
- ✅ Connect a Web3 wallet (MetaMask, Trust Wallet, etc.)
- ✅ Ensure sufficient balance for trades and gas fees
- ✅ Understand the risks of leveraged trading
- ✅ Start with small allocations to test

### Risk Management
- 🚫 Never invest more than you can afford to lose
- 🚫 Past performance doesn't guarantee future results
- 🚫 AI agents can experience losses
- ✅ Diversify across multiple agents
- ✅ Monitor performance regularly

### Fees
- **Gas Fees** - You pay blockchain transaction fees
- **Platform Fee** - Optional small % of profits
- **Trading Fees** - Standard AsterDEX trading fees

---

## 🛠️ Troubleshooting

### Wallet Won't Connect
- Ensure wallet extension is installed
- Try clearing browser cache
- Use WalletConnect QR code option

### Trades Not Copying
- Check wallet balance is sufficient
- Verify agent is actively trading
- Ensure allocation amount is set correctly

### Can't See Stats
- Refresh the dashboard
- Check network connection
- Verify you've started copy trading

---

## 📞 Support

### Need Help?
- Check dashboard for error messages
- Review agent's recent trades
- Verify wallet connection status
- Contact platform support

---

## 🎉 Success Tips

### 1. Diversify
Copy 3-5 different agents to spread risk

### 2. Monitor Weekly
Check performance once per week

### 3. Rebalance Monthly
Adjust allocations based on agent performance

### 4. Set Limits
Use stop-loss and take-profit levels

### 5. Stay Informed
Follow agent updates and market news

---

**Ready to Start? Connect Your Wallet Now! 🚀**
