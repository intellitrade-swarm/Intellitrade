
# Solana Integration Guide for iCHAIN Swarms

## 🚀 Overview

Your AI agents now support **dual-chain trading**:
- **EVM chains** (Base/Ethereum) - Existing functionality
- **Solana** (NEW) - Jupiter DEX aggregator for SOL trading

## 📋 What's New

### 1. Solana Wallet Support
- Each agent can have a dedicated Solana wallet
- Wallets are stored securely in the database
- Public addresses visible in the UI for funding

### 2. Jupiter DEX Integration
- **Jupiter** is the leading DEX aggregator on Solana
- Automatically finds best prices across multiple Solana DEXes
- Support for:
  - SOL ⇄ USDC swaps
  - SOL ⇄ USDT swaps
  - Any SPL token swaps
  - Slippage protection (default 0.5%)
  - Price impact warnings

### 3. Database Schema Updates
Added Solana wallet fields to the Agent model:
```prisma
solanaWalletAddress   String?       @unique
solanaPrivateKey      String?       // base58 encoded
```

### 4. New API Endpoints

#### Create Solana Wallet for an Agent
```
POST /api/wallet/solana/create
Body: { "agentId": "agent_id" }
```

#### Create Solana Wallets for All Agents
```
POST /api/wallet/solana/bulk-create
```

#### Get Solana Wallet Balance
```
GET /api/wallet/solana/balance?agentId=agent_id
GET /api/wallet/solana/balance?address=solana_address
```

#### Execute Solana Trade
```
POST /api/wallet/solana/trade
Body: {
  "agentId": "agent_id",
  "inputToken": "SOL",
  "outputToken": "USDC",
  "amount": 0.5,
  "slippageBps": 50  // 0.5% slippage
}
```

## 🎯 How to Use

### Step 1: Create Solana Wallets

1. Navigate to the **Wallets** section in the Arena
2. Switch to the **✨ Solana Wallets** tab
3. Click **"Create All Solana Wallets"** button
4. Each agent will get a unique Solana address

### Step 2: Fund Agent Wallets

#### Option A: Using Phantom Wallet
1. Install [Phantom Wallet](https://phantom.app)
2. Copy agent's Solana address from the UI
3. Send SOL to the address
4. **Recommended**: $50-100 worth of SOL per agent

#### Option B: Using Coinbase
1. Buy SOL on [Coinbase](https://www.coinbase.com/price/solana)
2. Withdraw to agent's Solana address
3. Use Solana mainnet (not Base or Ethereum!)

### Step 3: Verify Balances

- Balances are shown in the Solana Wallets tab
- Click **"Refresh All Balances"** to update
- View on Solscan: Click the explorer icon next to any address

### Step 4: Execute Trades

#### Manual Trading
Use the Trading Panel with Solana-specific pairs:
- SOL/USDC
- SOL/USDT
- Other SPL tokens

#### Auto-Trading with AI
The AI agents can automatically trade on Solana:
- Market analysis via NVIDIA AI
- Executes trades through Jupiter DEX
- Records transactions in the database

## 🔧 Technical Details

### Solana Libraries Used
```json
{
  "@solana/web3.js": "1.98.4",  // Core Solana SDK
  "@jup-ag/api": "6.0.45",      // Jupiter DEX aggregator
  "bs58": "6.0.0"                // Base58 encoding
}
```

### Key Files

#### Core Libraries
- `/lib/solana.ts` - Wallet management, balance checking
- `/lib/jupiter.ts` - DEX trading via Jupiter

#### API Routes
- `/app/api/wallet/solana/create/route.ts` - Create single wallet
- `/app/api/wallet/solana/bulk-create/route.ts` - Create all wallets
- `/app/api/wallet/solana/balance/route.ts` - Get balance
- `/app/api/wallet/solana/trade/route.ts` - Execute trades

#### UI Components
- `/app/arena/components/SolanaWalletPanel.tsx` - Main Solana UI
- `/app/arena/components/arena-interface.tsx` - Tabs integration

### RPC Endpoint
Default: `https://api.mainnet-beta.solana.com`

For better performance, consider upgrading to:
- **Helius** (https://helius.xyz)
- **QuickNode** (https://quicknode.com)
- **Alchemy** (https://alchemy.com)

Set custom RPC in `.env`:
```bash
SOLANA_RPC_URL=https://your-custom-rpc-url
```

## 🎨 UI Features

### Solana Wallet Panel
- **Visual wallet cards** with agent avatars
- **Real-time SOL balances** in SOL and USD
- **Funding status badges** (Funded/Needs Funding)
- **Copy address** with one click
- **Solscan integration** - View on explorer
- **Stats dashboard**:
  - Total agents with SOL wallets
  - Combined SOL balance
  - Total USD value
  - Current SOL price

### Tab System
Switch between:
- **💎 EVM Wallets** - Base/Ethereum wallets
- **✨ Solana Wallets** - Solana wallets

## 🔐 Security

### Wallet Storage
- Private keys stored **encrypted** in PostgreSQL
- Database uses SSL/TLS connections
- Never exposed in API responses or client-side code

### Trading Safety
- **Slippage protection** (default 0.5%, adjustable)
- **Price impact warnings** (rejects if >5%)
- **Transaction confirmation** before recording

### Best Practices
1. Start with small amounts for testing
2. Monitor transactions on Solscan
3. Use separate wallets for different strategies
4. Regular balance checks

## 📊 Trading Flow

### AI-Powered SOL Trading
1. **AI Analysis** - NVIDIA AI analyzes SOL market
2. **Quote Fetching** - Jupiter API gets best price
3. **Trade Execution** - Transaction signed and sent
4. **Confirmation** - Wait for Solana confirmation
5. **Recording** - Save trade to database
6. **Balance Update** - Update agent balances

### Manual SOL Trading
1. Select agent with SOL wallet
2. Choose trading pair (SOL/USDC, etc.)
3. Enter amount and slippage tolerance
4. Click execute
5. Transaction confirmed on Solana
6. Balance updates automatically

## 🌐 Network Information

### Solana Mainnet
- **Chain ID**: Mainnet-beta
- **RPC**: https://api.mainnet-beta.solana.com
- **Explorer**: https://solscan.io

### Common Token Addresses
```javascript
{
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
}
```

## 💡 Tips & Tricks

### Optimizing Costs
- **Bundle transactions** when possible
- Use **priority fees** during high congestion
- Monitor **SOL balance** for transaction fees

### Testing Strategy
1. Create wallets for all agents
2. Fund 1-2 agents with small amounts
3. Test manual trades first
4. Enable auto-trading gradually
5. Monitor performance metrics

### Monitoring
- Check balances regularly
- Review transactions on Solscan
- Monitor slippage and price impact
- Track win rates per agent

## 🐛 Troubleshooting

### Issue: Wallet Creation Fails
**Solution**: Check database connection and Prisma schema

### Issue: Balance Shows 0.00
**Solution**: 
1. Verify SOL was sent to correct address
2. Check on Solscan
3. Click "Refresh All Balances"
4. Ensure using Solana mainnet (not devnet/testnet)

### Issue: Trade Execution Fails
**Possible Causes**:
- Insufficient SOL balance for fees
- Network congestion
- RPC rate limiting
- Price impact too high

**Solutions**:
1. Add more SOL to wallet
2. Increase slippage tolerance
3. Use premium RPC endpoint
4. Try smaller trade amounts

### Issue: Transaction Stuck
**Solution**:
1. Check transaction on Solscan
2. Solana transactions are fast (typically <1s)
3. If stuck >30s, may need to retry
4. Contact support if persistent

## 📈 Performance Optimization

### For High-Frequency Trading
1. **Use Premium RPC** - Helius, QuickNode, or Alchemy
2. **Increase compute units** - For complex transactions
3. **Monitor priority fees** - Pay more during congestion
4. **Batch operations** - When possible

### For Better Prices
1. **Compare routes** - Jupiter finds best path
2. **Adjust slippage** - Balance speed vs. price
3. **Monitor depth** - Check liquidity before trading
4. **Time trades** - Avoid high volatility periods

## 🎓 Learning Resources

### Solana Documentation
- Official Docs: https://docs.solana.com
- Web3.js Guide: https://docs.solana.com/developing/clients/javascript-api

### Jupiter Documentation
- Jupiter API: https://station.jup.ag/docs
- Integration Guide: https://docs.jup.ag/jupiter-api

### Community
- Solana Discord: https://discord.com/invite/solana
- Jupiter Discord: https://discord.gg/jup

## ✅ Success Checklist

- [ ] Solana wallets created for all agents
- [ ] Agents funded with SOL
- [ ] Balances verified on Solscan
- [ ] Test manual trade executed successfully
- [ ] AI auto-trading enabled
- [ ] Monitoring trades in real-time
- [ ] Performance metrics tracking

## 🚀 Next Steps

1. **Create Solana wallets** for all agents
2. **Fund wallets** with SOL
3. **Test trades** with small amounts
4. **Monitor performance** over time
5. **Optimize strategies** based on results
6. **Scale up** successful agents

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review transaction on Solscan
3. Check application logs
4. Contact development team

---

**Happy Trading on Solana! 🚀✨**
