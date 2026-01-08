
# 🔗 Real Cryptocurrency Trading Guide

## Overview

Your AI agents can now execute **real on-chain cryptocurrency trades** using their blockchain wallets. This guide explains how the system works, how to set it up, and what to expect.

---

## 🎯 How It Works

### Intelligent Trading Mode Selection

The system automatically determines whether an agent should execute real trades or simulated trades:

1. **Real Trading Mode** ✅
   - Agent has a blockchain wallet (walletAddress + encryptedPrivateKey)
   - Agent has real balance > $0 (funded wallet)
   - Trade amount > $1 minimum threshold
   - Sufficient ETH to cover trade + gas fees

2. **Simulated Trading Mode** 💭
   - Agent doesn't have a wallet yet
   - Agent wallet has zero balance
   - Insufficient funds for real trade
   - Trade amount below minimum threshold
   - Real trade fails (automatic fallback)

### Real Trade Execution Flow

```
1. AI analyzes market → Makes trading decision
2. Check if agent can trade real → Verify wallet & balance
3. Calculate trade amounts → Convert USD to ETH/tokens
4. Execute swap on DEX → BaseSwap/Uniswap on-chain
5. Wait for confirmation → ~2 seconds on Base network
6. Record transaction → Save txHash & blockNumber
7. Update balance → Fetch new balance from blockchain
8. Display result → Show success with transaction link
```

---

## 💰 Setting Up Real Trading

### Step 1: Create Wallets for Agents

Navigate to the **Wallets** tab in the arena interface:

```
1. Click "Wallets" tab
2. Click "Create All Wallets" button
   - Creates secure wallets for all agents
   - Private keys encrypted in database
   - Each agent gets unique address
```

### Step 2: Fund Agent Wallets

For each agent you want to enable for real trading:

```
1. Select the agent in Wallets tab
2. Click "Show QR Code"
3. Fund the wallet with ETH:
   - Network: Base
   - Asset: ETH
   - Minimum: 0.001 ETH (~$2.50)
   - Recommended: 0.01-0.1 ETH ($25-$250)
```

**⚠️ Critical**: Only send ETH on **Base network**. Sending on wrong network = permanent loss!

### Step 3: Start Real Trading

Once funded, agents automatically switch to real trading:

```
1. Go to "Live Arena" tab
2. Click "AI Trade" on any funded agent
3. Look for indicators:
   - 🔗 icon next to agent name = Real trading enabled
   - "🔗 REAL TRADE" in toast notification
   - Transaction hash displayed in results
```

---

## 🎮 Trading Controls & Limits

### Automatic Risk Management

- **Maximum trade size**: 20% of agent's balance per trade
- **Minimum trade amount**: $1 USD
- **Maximum trade amount**: $10,000 USD
- **Slippage tolerance**: 5% (protects against price manipulation)
- **Gas estimation**: Automatically calculated and included

### Supported Assets

Currently trading **ETH to Stablecoins** on Base network:

| Asset | Symbol | Contract Address |
|-------|--------|-----------------|
| Ethereum | ETH | Native (0x0) |
| USD Coin | USDC | 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 |
| Wrapped ETH | WETH | 0x4200000000000000000000000000000000000006 |

### Decentralized Exchanges (DEX)

| Network | DEX | Router Address |
|---------|-----|----------------|
| Base | BaseSwap | 0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24 |
| Ethereum | Uniswap V2 | 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D |
| BSC | PancakeSwap | 0x10ED43C718714eb63d5aA57B78B54704E256024E |

---

## 📊 Monitoring Real Trades

### UI Indicators

**Live Arena:**
- 🔗 icon next to agent names with funded wallets
- "🔗 REAL TRADE" badge in trade notifications
- Transaction hash shown in success messages

**Trade History:**
- `isRealTrade` flag = true
- `txHash` field populated
- `blockNumber` recorded
- `chain` specified

### Blockchain Verification

Every real trade is verifiable on-chain:

1. Copy transaction hash from notification
2. Visit [BaseScan](https://basescan.org)
3. Paste hash in search
4. View full transaction details:
   - From/To addresses
   - Gas used
   - Token amounts
   - Timestamp
   - Confirmation status

---

## 🔒 Security Features

### Wallet Protection

1. **Encryption at Rest**
   - Private keys encrypted with AES-256-CBC
   - Encryption key from environment variable
   - Never exposed to client-side code

2. **Secure Key Derivation**
   - Uses scrypt with salt
   - 32-byte keys
   - Industry-standard algorithms

3. **Database Security**
   - Unique wallet addresses per agent
   - Encrypted private keys only
   - No plain-text sensitive data

### Transaction Security

- **Nonce Management**: Prevents replay attacks
- **Gas Estimation**: Ensures transactions succeed
- **Slippage Protection**: Prevents sandwich attacks
- **Deadline Protection**: Transactions expire after 20 minutes

---

## 💡 Best Practices

### For Testing

```
1. Start with small amounts (0.001-0.01 ETH)
2. Test one agent first
3. Monitor first few trades closely
4. Verify transactions on blockchain explorer
5. Scale up gradually
```

### For Production

```
1. Fund agents with appropriate amounts for strategy
2. Monitor gas prices (trade during low-gas periods)
3. Set up balance alerts
4. Regular wallet balance checks
5. Keep backup of wallet addresses
```

### Cost Management

**Typical Trade Costs on Base:**
- Gas cost: ~$0.01-0.05 per trade
- Slippage: Up to 5% (usually <1%)
- Total cost: $0.01-0.10 per small trade

**Optimization Tips:**
- Trade during low network activity
- Use larger trade sizes (better gas efficiency)
- Monitor slippage on volatile assets

---

## 🐛 Troubleshooting

### Agent Not Trading Real Crypto

**Check:**
1. ✅ Agent has wallet address (Wallets tab)
2. ✅ Wallet has ETH balance > 0
3. ✅ Balance shows in USD on Wallets tab
4. ✅ Network is Base (not Ethereum mainnet)
5. ✅ Trade amount > $1 minimum

### Transaction Failed

**Common Causes:**
- Insufficient ETH for trade + gas
- Slippage exceeded 5%
- Network congestion
- Invalid token address

**Solutions:**
- Add more ETH to wallet
- Wait for better market conditions
- Retry transaction
- Check BaseScan for specific error

### Balance Not Updating

**Steps:**
1. Click "Refresh" button in Wallets tab
2. Wait 30 seconds for blockchain sync
3. Check transaction on BaseScan
4. Verify correct network (Base)

---

## 📈 Performance Tracking

### Real vs Simulated Trades

The system tracks both modes separately:

| Metric | Real Trades | Simulated Trades |
|--------|-------------|------------------|
| Database Field | `isRealTrade = true` | `isRealTrade = false` |
| Balance Updated | From blockchain | From calculation |
| Transaction Hash | Recorded | null |
| Gas Cost | Actual | $0 |
| Slippage | Actual | 0% |

### Agent Performance

Monitor these fields for funded agents:
- `realBalance`: Current USD value in wallet
- `totalTrades`: Total trades executed (real + simulated)
- `winRate`: Success rate of trading decisions
- `sharpeRatio`: Risk-adjusted returns
- `maxDrawdown`: Maximum loss from peak

---

## 🚀 Advanced Features

### Multi-Chain Support (Coming Soon)

Future support for:
- Ethereum mainnet (higher liquidity, higher gas)
- BSC (Binance Smart Chain) (lower fees)
- Arbitrum & Optimism (L2 scaling)

### Token Trading (Coming Soon)

Planned support for:
- ERC-20 token swaps
- Liquidity pool trading
- Cross-chain swaps
- Limit orders

### Advanced Strategies

Real trading enables:
- Arbitrage between DEXs
- Flash loan strategies
- Yield farming positions
- Liquidity provision

---

## 📞 Support

### Need Help?

1. Check transaction on [BaseScan](https://basescan.org)
2. Review console logs for errors
3. Verify wallet balances
4. Check network status

### Emergency

If funds are stuck or transactions failing:
1. Stop all trading immediately
2. Check wallet balance on BaseScan
3. Export wallet address for recovery
4. Wait for network congestion to clear

---

## ⚠️ Disclaimers

1. **Risk Warning**: Cryptocurrency trading involves substantial risk. Only trade with funds you can afford to lose.

2. **Network Fees**: All transactions incur gas fees paid in ETH. Fees vary with network congestion.

3. **No Guarantees**: Past performance does not guarantee future results. AI decisions are probabilistic.

4. **Smart Contract Risk**: DEX contracts are third-party. We don't control or audit these contracts.

5. **Private Key Security**: You are responsible for securing your environment variables. Never share encryption keys.

---

## 🎓 Technical Details

### System Architecture

```
┌─────────────────────────────────────────┐
│  AI Trade Decision API                  │
│  /api/ai/trade-decision                 │
└────────────┬────────────────────────────┘
             │
             ├─→ Check: Agent has wallet?
             ├─→ Check: Real balance > 0?
             ├─→ Fetch: Current blockchain balance
             │
      ┌──────▼──────────────┐
      │  Can Trade Real?    │
      └──────┬──────────────┘
             │
      ┌──────▼──────────┐         ┌────────────────┐
      │  YES: Execute   │────────→│  lib/trading   │
      │  Real Trade     │         │  executeSwap() │
      └─────────────────┘         └────────┬───────┘
                                           │
                                    ┌──────▼────────┐
                                    │  Blockchain   │
                                    │  Transaction  │
                                    └──────┬────────┘
                                           │
                                    ┌──────▼────────┐
                                    │  Record in DB │
                                    │  + Update UI  │
                                    └───────────────┘
```

### Database Schema

Real trading adds these fields to `Trade` model:

```prisma
model Trade {
  isRealTrade   Boolean  @default(false)  // Real vs simulated
  txHash        String?                   // Transaction hash
  blockNumber   BigInt?                   // Block number
  chain         String?                   // Network name
  gasUsed       BigInt?                   // Gas consumed
}
```

### Trade Execution Code

Located in `lib/trading.ts`:
- `executeRealTrade()`: Main function
- `getTokenAddress()`: Symbol to address mapping
- `calculateTradeSize()`: Risk management
- `estimateGasCost()`: Gas estimation

---

## 📚 Additional Resources

- [Base Network Documentation](https://docs.base.org)
- [BaseSwap DEX](https://baseswap.fi/)
- [Ethers.js Documentation](https://docs.ethers.org)
- [BaseScan Explorer](https://basescan.org)

---

**Ready to start real trading? Fund your agents and watch them trade live crypto!** 🚀
