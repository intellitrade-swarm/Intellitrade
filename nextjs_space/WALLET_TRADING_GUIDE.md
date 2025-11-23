
# Wallet Trading Guide for iCHAIN Swarms

This guide explains how to enable and use wallet trading functionality for your AI trading agents.

## 📋 Overview

Your iCHAIN Swarms application has complete wallet and trading capabilities:

- **Blockchain Wallets**: Each agent has its own Ethereum-compatible wallet
- **Multiple Trading Methods**: Manual trading and AI-powered automated trading
- **Real Trading**: Execute trades on DEXs (Uniswap, PancakeSwap) and Aster Dex perpetual contracts
- **Live Balance Tracking**: Real-time balance monitoring across blockchain networks

## 🔧 Current Setup Status

### ✅ Wallets Created
All 6 agents have wallets configured and ready to trade:

| Agent Name | Wallet Address | Chain | Balance |
|-----------|---------------|-------|---------|
| Reversion Hunter | 0x23080e1847f3BBbb3868306Dda45a96Bad83A383 | Base | $0.00 |
| Sentiment Sage | 0x88Bd590873550C92fA308f46e7d0C9Bc66Dff0C6 | Base | $0.00 |
| Momentum Master | 0x38bCBfF67EF49165097198979EC33Ce2AD670093 | Base | $0.00 |
| Arbitrage Ace | 0xc2661254E113fF48db8b61B4fF4cED8239568ebB | Base | $0.00 |
| Neural Nova | 0x282B6B7D9CDBF2E690cD0c6C7261047a684154e4 | Base | $5.00 |
| Technical Titan | 0xc2A052893CE31017C0047Fcf523603150f6C0de4 | Base | $0.00 |

## 💰 How to Fund Agent Wallets

### Method 1: Direct Transfer (Recommended)

1. **Navigate to the Arena** → **Wallet Management** tab
2. **Select an agent** you want to fund
3. **Copy the wallet address** (or scan QR code)
4. **Send ETH on Base Network** to the wallet address
   - ⚠️ **CRITICAL**: Must use Base network (not Ethereum mainnet)
   - Recommended starting amount: 0.01-0.1 ETH ($25-$250)
5. **Wait for confirmation** (1-2 minutes)
6. **Refresh balance** - The agent's balance will update automatically

### Method 2: From Exchange

If you're funding from Coinbase, Binance, or another exchange:

1. Withdraw **ETH** to the agent's wallet address
2. Select **Base** as the network
3. Confirm the transaction
4. Wait for blockchain confirmations

### Important Network Information

- **Network**: Base (formerly Base L2)
- **Native Token**: ETH
- **Chain ID**: 8453
- **Block Explorer**: https://basescan.org
- **RPC URL**: https://mainnet.base.org

## 🎯 Trading Methods

### 1. Manual Trading

Execute specific trades for your agents:

#### Via UI (Trading Dashboard)

1. Navigate to **Arena** → **Trading** tab
2. Select **Manual Trading** mode
3. Choose:
   - **Agent**: Which agent should execute the trade
   - **Symbol**: BTC, ETH, SOL, etc.
   - **Action**: BUY or SELL
   - **Amount**: USD value to trade
4. Click **Execute Order**

#### Via API

```bash
curl -X POST https://ipollswarms.abacusai.app/api/wallet/manual-trade \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent_id_here",
    "symbol": "BTC",
    "action": "BUY",
    "usdAmount": 10
  }'
```

### 2. AI-Powered Auto-Trading

Let AI agents analyze markets and execute trades automatically:

#### Single Agent Auto-Trade

1. Navigate to **Arena** → **Trading** tab
2. Select **AI Auto-Trading** mode
3. Click on an agent card to select it
4. Click **Run for [Agent Name]**

#### All Agents Auto-Trade

1. Navigate to **Arena** → **Trading** tab
2. Select **AI Auto-Trading** mode
3. Click **Run Auto-Trade for All Agents**
4. All agents with funded wallets will:
   - Analyze current market conditions
   - Generate personalized trading signals
   - Execute trades based on their strategy

#### Via API

```bash
# Single agent
curl -X POST https://ipollswarms.abacusai.app/api/ai/auto-trade \
  -H "Content-Type: application/json" \
  -d '{"agentId": "agent_id_here"}'

# All agents
curl -X POST https://ipollswarms.abacusai.app/api/ai/auto-trade \
  -H "Content-Type": "application/json" \
  -d '{"runAll": true}'
```

### 3. Continuous Auto-Trading (Coming Soon)

Set up agents to trade continuously based on market conditions.

## 📊 Trading Platforms

### Aster Dex (Primary)

- **Type**: Perpetual Contracts Trading
- **Features**: 
  - Leverage trading
  - Market and limit orders
  - Real-time execution
- **API**: Configured and ready
- **Balance Required**: Minimum $1 per trade

### On-Chain DEX Trading

- **Platforms**: 
  - Uniswap V2 (Ethereum)
  - BaseSwap (Base)
  - PancakeSwap (BSC)
- **Features**:
  - Spot trading
  - Direct wallet execution
  - Gas fees apply
- **Balance Required**: Sufficient ETH/BNB for gas + trade amount

## 🤖 AI Trading Strategy

When auto-trading is enabled, each agent:

1. **Analyzes Market**:
   - Fetches live market data from Aster Dex
   - Uses their designated AI provider (OpenAI, Gemini, or NVIDIA)
   - Evaluates opportunities based on their strategy type

2. **Generates Signal**:
   - Considers agent personality and strategy
   - Calculates risk-reward ratios
   - Determines confidence level
   - Decides: BUY, SELL, or HOLD

3. **Executes Trade**:
   - Only if confidence > 65%
   - Maximum 20% of balance per trade
   - Sets stop-loss and take-profit levels
   - Records trade on-chain

4. **Updates Metrics**:
   - Win rate
   - Total profit/loss
   - Sharpe ratio
   - Maximum drawdown

## 📈 Monitoring Trades

### View Recent Trades

- **UI**: Arena → Trading tab → Recent Real Trades section
- **API**: `GET /api/trades`

### Check Agent Balance

- **UI**: Arena → Wallet Management → Select Agent → Refresh
- **API**: `GET /api/wallet/balance?agentId=xxx`

### View Transaction on Blockchain

For on-chain trades (DEX):
1. Copy transaction hash (TX Hash)
2. Visit https://basescan.org
3. Paste TX hash in search

For Aster Dex trades:
- Transaction ID is stored in the database
- View in Recent Trades section

## 🛡️ Safety & Risk Management

### Built-in Protections

- **Maximum Position Size**: 20% of balance per trade
- **Minimum Balance Check**: Won't trade if balance < $1
- **Slippage Protection**: 5% maximum slippage on DEX trades
- **Gas Estimation**: Automatically calculated for on-chain trades

### Best Practices

1. **Start Small**: Fund with small amounts initially ($10-$50)
2. **Monitor Closely**: Watch first few trades
3. **Diversify**: Don't put all funds in one agent
4. **Set Limits**: Consider your risk tolerance
5. **Regular Checkups**: Monitor agent performance

## 🔍 Troubleshooting

### Trade Not Executing

**Problem**: Manual or auto-trade fails

**Solutions**:
- Check agent has sufficient balance
- Verify wallet is funded (not just database balance)
- Ensure Aster Dex API credentials are configured
- Check network connectivity
- Review error message in toast notification

### Balance Not Updating

**Problem**: Balance shows $0 after funding

**Solutions**:
- Wait 1-2 minutes for blockchain confirmation
- Click "Refresh" button in wallet panel
- Check transaction on Basescan
- Verify correct network (Base, not Ethereum)

### Auto-Trade Not Working

**Problem**: AI auto-trade returns "holding position"

**Solutions**:
- This is normal - agent decided not to trade
- Market conditions may not meet strategy criteria
- Try again later or try different agent
- Check agent's confidence threshold

### Insufficient Balance Error

**Problem**: "Insufficient Aster Dex balance"

**Solutions**:
- Check if `ASTER_DEX_API_KEY` is configured
- Verify Aster Dex account has funds
- Use on-chain DEX trading instead
- Fund Aster Dex account separately

## 🔧 Configuration Files

### Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://...

# Wallet Encryption
WALLET_ENCRYPTION_KEY=your-encryption-key

# Aster Dex (Optional)
ASTER_DEX_API_KEY=your-api-key
ASTER_DEX_API_SECRET=your-api-secret

# AI Providers
OPENAI_API_KEY=your-key
GOOGLE_API_KEY=your-key
NVIDIA_API_KEY=your-key
```

### Important Code Locations

- **Wallet Management**: `/lib/wallet.ts`
- **Trading Engine**: `/lib/trading.ts`
- **AI Trading**: `/lib/ai-trading-engine.ts`
- **Aster Dex**: `/lib/aster-dex.ts`
- **Manual Trade API**: `/app/api/wallet/manual-trade/route.ts`
- **Auto Trade API**: `/app/api/ai/auto-trade/route.ts`

## 📞 Support

If you encounter issues:

1. Check the application logs
2. Verify all environment variables are set
3. Test with small amounts first
4. Review the transaction on block explorer
5. Check agent balance vs. wallet balance

## 🎯 Quick Start Checklist

- [x] Wallets created for all agents ✅
- [ ] Fund at least one agent wallet with ETH on Base
- [ ] Test manual trade with small amount ($5-$10)
- [ ] Try AI auto-trade for one agent
- [ ] Monitor results and adjust strategy
- [ ] Scale up trading amounts as comfortable

## 🚀 Next Steps

1. **Fund a Test Agent**: Start with Neural Nova (already has $5)
2. **Execute Test Trade**: Try a small manual trade
3. **Enable Auto-Trading**: Let AI take over for automated trading
4. **Monitor Performance**: Track wins/losses and refine strategy
5. **Scale Up**: Gradually increase trading amounts

---

**Happy Trading! 🎊**

Your agents are ready to trade - just fund their wallets and let the AI do its magic!
