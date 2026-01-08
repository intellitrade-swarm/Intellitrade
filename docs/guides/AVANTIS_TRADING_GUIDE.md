
# Avantis DEX Trading Integration Guide

## 🎯 Overview

Your iCHAIN Swarms application now uses **Avantis DEX** for all cryptocurrency trading. Avantis is a decentralized perpetual trading platform built on the Base network that offers:

- ⚡ **High Leverage**: Up to 100x leverage on crypto, forex, and commodities
- 💎 **Zero Fees**: Trade perpetuals with zero trading fees
- 🛡️ **Loss Protection**: Automatic rebates on losing positions
- 🌐 **Decentralized**: No centralized exchange risk
- 💰 **USDC Collateral**: All trades use USDC as collateral on Base network

## 📋 Configuration Required

### Environment Variables

Add these to your `.env` file:

```bash
# Base Network RPC URL (required)
BASE_RPC_URL=https://mainnet.base.org

# Wallet Private Key for trading (required)
WALLET_PRIVATE_KEY=your_private_key_here

# USDC on Base
USDC_CONTRACT=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

### Wallet Setup

1. **Create a Base Network Wallet**
   - Use MetaMask or any Web3 wallet
   - Switch to Base network
   - Export your private key (keep it secure!)

2. **Fund with USDC**
   - Bridge USDC to Base network
   - Each AI agent will need USDC for trading collateral
   - Recommended: $100-$1000 per agent

3. **Configure Agent Wallets**
   - Each agent has its own wallet address
   - Private keys are encrypted in the database
   - Agents use their wallets to execute trades

## 🚀 How It Works

### 1. Perpetual Trading

Unlike spot trading, perpetuals allow you to:
- **Go Long (BUY)**: Bet on price increases
- **Go Short (SELL)**: Bet on price decreases
- **Use Leverage**: Multiply your position size (10x default)
- **Keep Positions Open**: No expiration date

### 2. Trading Flow

```typescript
// Example: Agent opens a 10x leveraged long position on BTC
const result = await executeAvantisTrade(
  agent,
  'BTC',      // Symbol
  'BUY',      // Long position
  100,        // $100 USDC collateral
  50000,      // Current BTC price
  10          // 10x leverage = $1000 position
);
```

### 3. Supported Assets

Current supported trading pairs:
- **Crypto**: BTC, ETH, SOL, BNB, XRP, ADA, DOGE, MATIC, DOT, AVAX
- **More**: Additional pairs available on Avantis

## 💡 Features

### Automatic Trading

AI agents automatically:
1. Analyze market conditions
2. Make trading decisions
3. Execute perpetual trades on Avantis
4. Manage positions with take-profit/stop-loss
5. Track PnL in real-time

### Manual Trading

You can also execute manual trades:
1. Go to the Trading Panel
2. Select a cryptocurrency
3. Choose BUY (long) or SELL (short)
4. Set leverage (1x - 100x)
5. Enter USDC amount
6. Confirm trade

### Position Management

```typescript
// Get open positions for an agent
const positions = await getOpenPositions(agent.walletAddress);

// Close a position
await closePerpTrade(pairIndex, tradeIndex, privateKey);
```

## 📊 Trading Panel Features

The UI now shows:
- **Real-Time Prices**: Live crypto prices from Avantis
- **Position Status**: Open/closed positions with PnL
- **Leverage Indicator**: Shows leverage for each trade
- **Transaction Links**: View trades on Base block explorer
- **USDC Balance**: Available collateral for new positions

## ⚙️ Technical Details

### Smart Contract Integration

```typescript
// Avantis Trading Contract (Base mainnet)
const TRADING_CONTRACT = '0x...'; // Trading execution
const PRICE_FEED = '0x...';       // Price oracle
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
```

### Transaction Flow

1. **Approve USDC**: Allow Avantis contract to use your USDC
2. **Build Trade**: Create trade parameters (pair, size, leverage)
3. **Execute**: Submit transaction to Avantis contract
4. **Confirm**: Wait for on-chain confirmation
5. **Record**: Save trade details in database

### Gas Costs

- Network: Base (L2)
- Gas Token: ETH
- Typical Cost: $0.01 - $0.10 per trade
- Fast confirmation: ~2 seconds

## 🔒 Security

### Private Key Safety

- Private keys are encrypted in database
- Never exposed in API responses
- Used only for signing transactions
- Each agent has isolated wallet

### Risk Management

- **Default Leverage**: 10x (adjustable)
- **Auto Stop-Loss**: Protect against large losses
- **Position Limits**: Maximum position sizes enforced
- **Balance Checks**: Prevent over-trading

## 📈 Example Usage

### AI Auto-Trading

```typescript
// AI agent decides to trade
const decision = await makeTradeDecision(agent, marketData);

if (decision.shouldTrade) {
  const result = await executeAvantisTrade(
    agent,
    decision.symbol,
    decision.action,    // 'BUY' or 'SELL'
    decision.usdAmount,
    decision.price,
    decision.leverage
  );
  
  if (result.success) {
    console.log('Trade executed:', result.txHash);
  }
}
```

### Check Balances

```typescript
// Get USDC balance on Base
const balance = await getUSDCBalance(walletAddress);
console.log(`Available: $${balance.toFixed(2)} USDC`);
```

### View Positions

```typescript
// Get all open positions
const positions = await getOpenPositions(agent.walletAddress);

positions.forEach(pos => {
  console.log(`${pos.buy ? 'LONG' : 'SHORT'} ${pos.pairIndex}`);
  console.log(`Size: $${pos.positionSizeDai}`);
  console.log(`Leverage: ${pos.leverage}x`);
});
```

## 🎮 Getting Started

1. **Fund Your Agents**
   ```bash
   cd nextjs_space
   yarn tsx scripts/fund-agents.ts
   ```

2. **Start the App**
   ```bash
   yarn dev
   ```

3. **Navigate to Arena**
   - View AI agents trading
   - See live positions and PnL
   - Monitor trading activity

4. **Enable Auto-Trading**
   - Click "Start Auto-Trading"
   - Agents will begin trading automatically
   - Refresh to see live updates

## 🛠️ Troubleshooting

### "Avantis not configured" Error

✅ **Solution**: Add `BASE_RPC_URL` and `WALLET_PRIVATE_KEY` to `.env`

### "Insufficient USDC balance" Error

✅ **Solution**: Bridge USDC to Base and fund agent wallets

### Transaction Fails

✅ **Check**:
- Sufficient ETH for gas on Base
- USDC approved for Avantis contract
- Valid trading pair
- Reasonable leverage (1-100x)

### Prices Not Loading

✅ **Check**:
- Base RPC URL is correct
- Network connection is stable
- Avantis contracts are accessible

## 📚 Resources

- **Avantis Documentation**: https://docs.avantisfi.com
- **Avantis SDK**: https://sdk.avantisfi.com
- **Base Network**: https://base.org
- **Block Explorer**: https://basescan.org

## 🎉 Benefits Over Centralized Exchanges

| Feature | Avantis DEX | Coinbase/CEX |
|---------|-------------|--------------|
| Custody | Self-custodial | Exchange custody |
| Fees | Zero trading fees | 0.5-1% per trade |
| Leverage | Up to 100x | Limited to 3-5x |
| Pairs | 80+ markets | Limited pairs |
| Downtime | No downtime | Maintenance windows |
| KYC | Not required | Required |
| Geographic | No restrictions | Regional limits |

## 🚨 Important Notes

1. **High Risk**: Leveraged trading is extremely risky
2. **Only Risk What You Can Lose**: Never invest more than you can afford
3. **Test First**: Start with small positions to test the system
4. **Monitor Closely**: Keep an eye on open positions
5. **Set Limits**: Use stop-losses to protect capital

## 🎯 Next Steps

- Set up your Base wallet
- Fund with USDC
- Configure environment variables
- Test with small trades
- Enable AI auto-trading
- Monitor performance

---

**Questions or Issues?**  
Check the troubleshooting section or review the Avantis documentation.

**Ready to Trade?**  
Your AI agents are ready to start trading on Avantis DEX! 🚀
