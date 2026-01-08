# 1inch DEX Aggregator Integration Guide

## Overview

The iPOLL Swarms platform now uses **1inch DEX Aggregator** for autonomous on-chain trading, replacing the previous Avantis SDK integration. This provides:

✅ **Multi-Chain Support**: Ethereum, Base, BSC, Polygon, Arbitrum, Optimism
✅ **Best Prices**: Automatically routes through 30+ DEXs for optimal execution
✅ **Lower Slippage**: Splits trades across multiple liquidity sources
✅ **Direct On-Chain Execution**: No centralized intermediaries
✅ **Permissionless**: No account setup required, just wallet + gas

---

## Architecture

```
AI Agent → Market Analysis → Trading Signal
    ↓
1inch API → Get Best Route + Calldata
    ↓
ethers.js → Sign Transaction (Private Key)
    ↓
RPC Node → Broadcast to Blockchain
    ↓
Trade Executed On-Chain ✅
```

---

## Key Changes

### 1. **Removed: Avantis SDK**
- Old file: `lib/avantis.ts` (renamed to `.backup`)
- Perpetual trading (leverage) no longer supported
- USDC collateral no longer required

### 2. **Added: 1inch Integration**
- New file: `lib/oneinch.ts`
- Spot trading only (no leverage)
- Native token swaps (ETH → Token, Token → ETH)

### 3. **Updated: Trading Engine**
- `lib/trading.ts` - Now uses 1inch for all trades
- `lib/ai-trading-engine.ts` - Updated to use 1inch balance checks and price feeds
- All backward compatibility maintained via function aliases

---

## Supported Chains & Tokens

### Ethereum (Chain ID: 1)
- WETH, USDC, USDT, WBTC

### Base (Chain ID: 8453) - Default
- WETH, USDC, USDbC

### BSC (Chain ID: 56)
- WBNB, USDT, USDC, BTCB

### Coming Soon
- Polygon, Arbitrum, Optimism

---

## API Configuration

### Environment Variables (.env)

```bash
# Required - RPC URLs for blockchain access
ETH_RPC_URL=https://rpc.ankr.com/eth
BASE_RPC_URL=https://rpc.ankr.com/base
BSC_RPC_URL=https://rpc.ankr.com/bsc

# Optional - 1inch API Key (higher rate limits)
# Get free key at: https://portal.1inch.dev/
ONEINCH_API_KEY=

# Required - Wallet encryption
WALLET_ENCRYPTION_KEY=your-secure-key-here
```

---

## Trading Flow

### Automated Trading (AI Agents)

1. **AI analyzes market** using OpenAI/Gemini/NVIDIA
2. **Generates trading signal** (BUY/SELL/HOLD)
3. **Checks on-chain balance** via RPC
4. **Executes trade** via 1inch:
   - Gets best route from 1inch API
   - Signs transaction with agent's private key
   - Broadcasts to blockchain
   - Records tx hash in database

### Manual Trading (API)

```typescript
POST /api/wallet/manual-trade
{
  "agentId": "agent-id-here",
  "symbol": "BTC",
  "action": "BUY",
  "usdAmount": 10
}
```

Response:
```json
{
  "success": true,
  "txHash": "0x123...",
  "details": {
    "symbol": "BTC",
    "side": "BUY",
    "amount": "$10.00",
    "entryPrice": "$65000.00",
    "quantity": "0.00015384"
  }
}
```

---

## Code Examples

### Execute a Swap

```typescript
import * as OneInch from './lib/oneinch';

const result = await OneInch.executeSwap(
  'base',                          // Chain
  ethers.ZeroAddress,              // From: Native ETH
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // To: USDC
  ethers.parseEther('0.01').toString(), // Amount: 0.01 ETH
  privateKey,                      // Wallet private key
  1                                // Slippage: 1%
);

if (result.success) {
  console.log('Trade executed:', result.txHash);
}
```

### Get Balance

```typescript
const balances = await OneInch.getTradingBalances('base', walletAddress);

console.log({
  eth: balances.native,
  usdc: balances.usdc,
  total: balances.totalUsd
});
```

### Get Current Price

```typescript
const btcPrice = await OneInch.getCurrentPrice('BTC');
const ethPrice = await OneInch.getCurrentPrice('ETH');
```

---

## Database Schema

Trades are recorded with the following structure:

```prisma
model Trade {
  id            String    @id @default(cuid())
  agentId       String
  agent         AIAgent   @relation(fields: [agentId], references: [id])
  symbol        String    // e.g., "BTC", "ETH"
  type          String    // "SPOT" (1inch only supports spot)
  side          String    // "BUY" or "SELL"
  quantity      Float
  entryPrice    Float
  exitPrice     Float?
  profitLoss    Float?
  status        String    // "CLOSED" (spot trades close immediately)
  isRealTrade   Boolean   @default(true)
  txHash        String?   // Blockchain transaction hash
  blockNumber   BigInt?
  chain         String    // "ethereum", "base", "bsc"
  entryTime     DateTime  @default(now())
  exitTime      DateTime?
}
```

---

## Important Notes

### ⚠️ No Perpetual Trading
- 1inch only supports spot trading
- Leverage is not available
- All positions close immediately after execution

### 💰 Balance Requirements
- Agents need native tokens (ETH/BNB) for gas
- Minimum balance: $10 USD equivalent
- 10% buffer recommended for gas fees

### 🔐 Security
- Private keys are encrypted with AES-256
- Never exposed in logs or responses
- Stored securely in database

### 📊 Transaction Costs
- Gas fees vary by network (Base typically cheaper)
- 1inch protocol fees: ~0.3-0.5%
- Slippage tolerance: 1% default

---

## Migration from Avantis

All existing code continues to work via function aliases:

```typescript
// Old Avantis functions
executeAvantisTrade()   → executeOneInchTrade()
getAvantisBalance()     → getOneInchBalance()
getCoinbaseBalance()    → getOneInchBalance()

// New 1inch functions (recommended)
executeOneInchTrade()
getOneInchBalance()
```

---

## Testing

### Test Connection
```typescript
import { testConnection } from './lib/oneinch';

const isConnected = await testConnection('base');
// ✅ Connected to network: base 8453
// ✅ ETH price: 2500
```

### Test Swap (Testnet)
Use testnet RPC URLs and testnet tokens for safe testing before going live.

---

## Troubleshooting

### "Insufficient balance" error
- Check agent wallet has enough ETH/BNB for the trade + gas
- Use `/api/wallet/balances` to verify on-chain balances

### "Token not found on chain" error
- Token may not be supported on that chain
- Check `TOKEN_ADDRESSES` in `lib/oneinch.ts`

### "Swap execution failed"
- Insufficient slippage tolerance (increase from 1%)
- Low liquidity for token pair
- Gas price too low (auto-handled with 20% buffer)

---

## Resources

- 1inch API Docs: https://docs.1inch.io/
- Get API Key: https://portal.1inch.dev/
- Supported Chains: https://docs.1inch.io/docs/aggregation-protocol/introduction
- Smart Contract Addresses: https://docs.1inch.io/docs/aggregation-protocol/smart-contract

---

## Support

For issues or questions:
1. Check transaction hash on blockchain explorer (Etherscan, BaseScan, etc.)
2. Review server logs for detailed error messages
3. Verify wallet has sufficient balance and gas

---

## Future Enhancements

🔜 **Planned Features**:
- Support for more chains (Polygon, Arbitrum, Optimism)
- Advanced order types (limit orders, stop loss)
- Portfolio rebalancing
- Gas optimization strategies
- Cross-chain swaps

---

**Last Updated**: October 27, 2025
**Version**: 1.0.0
