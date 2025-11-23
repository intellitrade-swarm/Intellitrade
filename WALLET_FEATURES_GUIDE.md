# 🔐 Agent Wallet System - Real Crypto Trading Guide

## Overview

Your iCHAIN Swarms platform now supports **real cryptocurrency trading** with blockchain wallets for each AI agent! Each agent can have its own wallet to hold and trade actual cryptocurrency on Base, BSC, and Ethereum networks.

## 🌟 Key Features

### 1. **Blockchain Wallets for Every Agent**
- Each AI agent can have a unique Ethereum-compatible wallet
- Wallets work across Base, BSC, and Ethereum networks
- Private keys are encrypted and stored securely
- Full blockchain transparency - verify all transactions on-chain

### 2. **Real Trading Capabilities**
- Agents trade with real cryptocurrency (ETH, BNB, tokens)
- All trades are executed on-chain through DEXs (Uniswap, PancakeSwap, BaseSwap)
- Transaction hashes recorded for every trade
- Real-time balance tracking

### 3. **Secure Wallet Management**
- Private keys encrypted with AES-256 encryption
- Keys never exposed to frontend
- Secure key derivation from environment variable
- Industry-standard cryptography

## 🚀 Getting Started

### Step 1: Create Wallets for Your Agents

Navigate to the **"Wallets"** tab in the arena interface. You have two options:

#### Option A: Bulk Create (Recommended)
1. Click "Create All Wallets" button
2. Wallets will be created for all active agents automatically
3. Each agent gets a unique address on the Base network

#### Option B: Individual Creation
1. Select an agent from the grid
2. Click "Create Wallet" button on their card
3. Wallet address will be displayed immediately

### Step 2: Fund Your Agent Wallets

Once wallets are created, you need to add cryptocurrency:

1. **Select an agent** from the Wallets panel
2. **Copy the wallet address** (click the copy icon)
3. **Send ETH to this address** using:
   - **Network**: Base (default) - IMPORTANT!
   - **Amount**: Start with a small amount (0.01 ETH recommended)
   - **Source**: Your personal wallet (MetaMask, Coinbase Wallet, etc.)

#### ⚠️ Important Funding Notes:
- **Always use Base network** (unless you changed the agent's primary chain)
- Sending to wrong network = **funds lost forever**
- Start with small amounts for testing
- Wait 1-2 minutes for blockchain confirmation
- Click "Refresh" to see updated balance

### Step 3: Monitor Agent Trading

Once funded, agents can start trading:

1. **Real Balance** displayed in USD value
2. **Native Balance** shown in ETH/BNB
3. **Transaction History** with blockchain links
4. **Live Updates** every 5 seconds

## 📊 Wallet Features

### Balance Tracking
```
Native Balance: 0.0523 ETH
USD Value: $127.45
Chain: BASE
```

### Agent Statistics
- Total Agents: All registered agents
- With Wallets: Agents that have wallets
- Without Wallets: Agents needing wallet creation

### Blockchain Explorer Integration
- Click the external link icon to view wallet on block explorer
- Verify all transactions on BaseScan/BSCScan/Etherscan
- Complete transaction transparency

## 🔧 Technical Details

### Database Schema
New fields added to `AIAgent` model:
- `walletAddress`: Unique wallet address
- `encryptedPrivateKey`: Encrypted private key
- `primaryChain`: Network (base/bsc/ethereum)
- `realBalance`: Current balance in USD

New fields added to `Trade` model:
- `isRealTrade`: Boolean flag for on-chain trades
- `txHash`: Transaction hash
- `blockNumber`: Block number of execution
- `chain`: Network where trade occurred
- `gasUsed`: Gas consumed

### API Endpoints

#### Create Wallet
```
POST /api/wallet/create
Body: { agentId, chain }
Response: { walletAddress, chain }
```

#### Bulk Create Wallets
```
POST /api/wallet/bulk-create
Response: { created: number, wallets: [...] }
```

#### Get Balance
```
GET /api/wallet/balance?agentId=xxx
Response: { native, symbol, usdValue }
```

#### Execute Trade
```
POST /api/wallet/trade
Body: { agentId, tokenIn, tokenOut, amountIn, minAmountOut }
Response: { txHash, blockNumber }
```

### Security Features

1. **Encrypted Storage**
   - Private keys encrypted with AES-256-CBC
   - Encryption key from `WALLET_ENCRYPTION_KEY` env variable
   - Never exposed to client-side code

2. **Key Management**
   - Decryption only happens server-side
   - Keys stored with unique initialization vectors
   - Secure key derivation using scrypt

3. **Access Control**
   - All endpoints require authentication
   - NextAuth session validation
   - User must be logged in

## 💡 Best Practices

### For Testing
1. Start with Base network (lowest fees)
2. Fund agents with small amounts (0.001 - 0.01 ETH)
3. Monitor transactions on BaseScan
4. Test with one agent before funding all

### For Production
1. Use strong encryption key in production
2. Back up wallet addresses (but not private keys!)
3. Monitor agent performance before adding more funds
4. Set up alerts for low balances
5. Regularly check transaction history

### Safety Tips
- ✅ Always verify network before sending
- ✅ Start with test amounts
- ✅ Keep encryption key secure
- ✅ Monitor agent performance
- ❌ Never share encryption key
- ❌ Never send to wrong network
- ❌ Don't fund underperforming agents immediately

## 🔗 Supported Networks

### Base (Recommended)
- **Network**: Base Mainnet
- **Chain ID**: 8453
- **Native Token**: ETH
- **DEX**: BaseSwap
- **Explorer**: basescan.org
- **Why**: Lowest fees, fast confirmations

### Binance Smart Chain (BSC)
- **Network**: BSC Mainnet
- **Chain ID**: 56
- **Native Token**: BNB
- **DEX**: PancakeSwap
- **Explorer**: bscscan.com

### Ethereum
- **Network**: Ethereum Mainnet
- **Chain ID**: 1
- **Native Token**: ETH
- **DEX**: Uniswap V2
- **Explorer**: etherscan.io
- **Note**: Highest fees

## 📈 Trading Features

### Automated Trading
- Agents automatically analyze markets
- AI-powered decision making with GPT
- Real-time price feeds from Chainlink oracles
- Smart trade execution on DEXs

### Trade Recording
- All trades saved to database
- Transaction hashes for verification
- Profit/loss tracking
- Performance metrics updated

### Real-time Updates
- Balance refreshes every 5 seconds
- Live price updates from blockchain
- Instant transaction confirmations
- Real-time P&L calculations

## 🎯 Example Workflow

1. **Setup Phase**
   ```
   1. Go to Wallets tab
   2. Click "Create All Wallets"
   3. Wait for confirmation
   ```

2. **Funding Phase**
   ```
   1. Select agent "Quantum Trader"
   2. Copy wallet: 0x1234...5678
   3. Send 0.01 ETH on Base network
   4. Wait 1-2 minutes
   5. Click "Refresh"
   6. See updated balance
   ```

3. **Trading Phase**
   ```
   1. Agent analyzes market automatically
   2. AI decides to trade ETH → USDC
   3. Transaction executed on BaseSwap
   4. Trade recorded with tx hash
   5. Balance updates in real-time
   ```

4. **Monitoring Phase**
   ```
   1. View agent performance in Dashboard
   2. Check transaction history
   3. Verify trades on BaseScan
   4. Monitor P&L in real-time
   ```

## 🛟 Troubleshooting

### "Failed to fetch balance"
- Check RPC endpoint is working
- Verify wallet address is correct
- Ensure blockchain node is synced

### "Transaction failed"
- Check if agent has sufficient balance
- Verify gas price is not too low
- Ensure slippage tolerance is adequate

### "Agent doesn't have a wallet"
- Click "Create Wallet" first
- Wait for blockchain confirmation
- Refresh the page

### Balance shows $0 after funding
- Wait 1-2 minutes for confirmation
- Click "Refresh" button
- Check transaction on block explorer
- Verify correct network was used

## 🔐 Environment Variables

Make sure these are set in your `.env` file:

```bash
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...

# OpenAI (for AI trading decisions)
OPENAI_API_KEY=sk-...

# Blockchain RPCs
BASE_RPC_URL=https://...
BSC_RPC_URL=https://...
ETH_RPC_URL=https://...

# Wallet Security (IMPORTANT!)
WALLET_ENCRYPTION_KEY=your-secure-random-key-here
```

## 📝 Notes

- This is a real trading system using actual cryptocurrency
- All transactions cost gas fees (paid by agents)
- Agents can lose money through bad trades
- Always monitor agent performance
- Start with small amounts to test
- Blockchain transactions are irreversible

## 🎉 What's Next?

Now that your agents have wallets:
1. Fund them with small amounts
2. Watch them trade in real-time
3. Monitor performance metrics
4. Scale up successful agents
5. Let evolution create better traders

Remember: This is REAL MONEY. Start small, test thoroughly, and scale gradually!

---

**Need Help?** Check the AI Chatbot in the arena for strategy advice and trading insights!
