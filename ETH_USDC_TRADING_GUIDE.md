
# ETH & USDC Trading Support Guide

## 🎯 Overview

Your iCHAIN Swarms application now supports **dual-collateral trading** on the Base network. Agents can trade using either **ETH (native token)** or **USDC (stablecoin)** as collateral for perpetual positions on Avantis DEX.

---

## ✨ New Features

### 1. **Dual Collateral Support**
- ✅ **ETH**: Use native ETH as trading collateral
- ✅ **USDC**: Use USDC stablecoin as trading collateral
- ✅ **Auto-Selection**: System automatically chooses the best available collateral
- ✅ **Manual Selection**: Optionally specify which collateral to use

### 2. **Smart Balance Checking**
The system now checks both ETH and USDC balances:
- **ETH Balance**: For gas fees AND trading collateral
- **USDC Balance**: For stablecoin trading collateral
- **Total USD Value**: Combined value of both assets

### 3. **Flexible Trading Logic**
```
Priority Order:
1. USDC (if available) - Preferred for stable collateral
2. ETH (if available) - Used when USDC is insufficient
3. Error - If neither has sufficient balance
```

---

## 💰 Funding Your Agents

### Option 1: Fund with USDC (Stablecoin - Recommended)

**Advantages:**
- ✅ Price stability (always $1)
- ✅ No price volatility
- ✅ Easier to calculate position sizes

**How to Fund:**
1. **Network**: Base Mainnet (Chain ID: 8453)
2. **Token**: USDC
3. **Contract**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
4. **Amount**: Minimum $10, Recommended $50-100 per agent

**Funding Steps:**
```bash
# Using Coinbase, MetaMask, or any Base-compatible wallet:
1. Switch to Base Mainnet
2. Send USDC to agent wallet addresses
3. Verify balances in Arena UI
```

### Option 2: Fund with ETH (Native Token)

**Advantages:**
- ✅ No token approval needed
- ✅ Pays for gas fees automatically
- ✅ Can be used for both gas AND collateral

**How to Fund:**
1. **Network**: Base Mainnet (Chain ID: 8453)
2. **Token**: ETH (native)
3. **Amount**: Minimum $10 worth, Recommended $50-100 worth per agent

**Funding Steps:**
```bash
# Using Coinbase, MetaMask, or any Base-compatible wallet:
1. Switch to Base Mainnet
2. Send ETH to agent wallet addresses
3. Verify balances in Arena UI
```

### Option 3: Fund with Both (Best Practice)

**Recommended Setup:**
- 🔹 **$20-50 worth of ETH**: For gas fees and backup collateral
- 🔹 **$50-100 worth of USDC**: For primary trading collateral

This ensures maximum flexibility and trading reliability!

---

## 🔄 How Auto-Selection Works

When an agent executes a trade, the system automatically selects collateral:

### Selection Logic:
```typescript
1. Check USDC balance
   ├─ If USDC >= trade amount → Use USDC
   └─ If USDC < trade amount → Check ETH

2. Check ETH balance
   ├─ If ETH value >= trade amount → Use ETH
   └─ If ETH value < trade amount → Error (insufficient balance)
```

### Example:
```
Agent Balance:
- ETH: 0.02 ($50 @ $2500/ETH)
- USDC: $30

Trade: $20 position

Result: Uses USDC (preferred and sufficient)
```

```
Agent Balance:
- ETH: 0.02 ($50 @ $2500/ETH)
- USDC: $5

Trade: $20 position

Result: Uses ETH (USDC insufficient)
```

---

## 🖥️ UI Updates

### Agent Profile Cards

Each agent now displays:
```
┌─────────────────────────┐
│ Available Crypto:       │
├──────────┬──────────────┤
│   ETH    │    USDC      │
│ 0.0234   │   $45.00     │
│ Gas &    │   Stable     │
│ Collat.  │   Collat.    │
└──────────┴──────────────┘
```

**Status Indicators:**
- 🟢 Green Pulse: Balance available
- ⚫ Gray: No balance
- 🔴 Red: Insufficient for trading

### Balance Display:
- **ETH**: Shows actual ETH amount (e.g., "0.0234")
- **USDC**: Shows USD value (e.g., "$45.00")
- Labels updated to reflect trading capabilities

---

## 🚀 Trading Execution

### API Functions

#### 1. Get Trading Balances
```typescript
import { getTradingBalances } from '@/lib/avantis';

const balances = await getTradingBalances(walletAddress);
console.log(balances);
// {
//   eth: 0.02,
//   usdc: 45.0,
//   totalUsd: 95.0  // (0.02 * 2500) + 45
// }
```

#### 2. Execute Trade with Auto-Selection
```typescript
import { executeAvantisTrade } from '@/lib/trading';

const result = await executeAvantisTrade(
  agent,
  'BTC',        // symbol
  'BUY',        // action
  20,           // USD amount
  50000,        // market price
  10,           // leverage
  // collateralType omitted = auto-select
);
```

#### 3. Execute Trade with Manual Selection
```typescript
const result = await executeAvantisTrade(
  agent,
  'BTC',        // symbol
  'BUY',        // action
  20,           // USD amount
  50000,        // market price
  10,           // leverage
  'ETH'         // force ETH as collateral
);
```

---

## 🔍 Technical Implementation

### Key Changes:

#### 1. **avantis.ts**
```typescript
// New functions
export async function getETHBalance(address: string): Promise<number>
export async function getTradingBalances(address: string): Promise<{
  eth: number;
  usdc: number;
  totalUsd: number;
}>

// Updated function
export async function executePerpTrade(
  symbol: string,
  side: 'BUY' | 'SELL',
  usdAmount: number,
  leverage: number = 10,
  privateKey: string,
  collateralType?: 'ETH' | 'USDC'  // ← New parameter
): Promise<TradeResult>
```

#### 2. **trading.ts**
```typescript
// Updated balance check
export async function getAvantisBalance(
  walletAddress: string
): Promise<{ eth: number; usdc: number; totalUsd: number }>

// New helper functions
export async function getAvantisUSDCBalance(address: string): Promise<number>
export async function getAvantisETHBalance(address: string): Promise<number>
```

#### 3. **ai-trading-engine.ts**
```typescript
// Updated balance check
const balances = await getAvantisBalance(agent.walletAddress);
if (balances.totalUsd < 10) {
  // Error: insufficient balance
}
```

---

## 📊 Monitoring & Debugging

### Check Balances via API:
```bash
# Get all agent balances
curl https://ipollswarms.abacusai.app/api/wallet/balances

# Response:
{
  "balances": [
    {
      "agentId": "...",
      "agentName": "GPT-4 Momentum Hunter",
      "walletAddress": "0x...",
      "ethBalance": "0.0234",
      "usdcBalance": "45.00",
      "databaseBalance": 100
    }
  ]
}
```

### Logs:
Trading execution logs now show:
```
Using USDC as collateral for BUY BTC trade {
  ethBalance: '0.0234',
  usdcBalance: '45.00',
  totalUsd: '103.50',
  requiredUsd: 20
}
```

---

## ⚠️ Important Notes

### 1. **Gas Fees**
- ETH is still required for gas fees
- USDC trades require ETH approval transactions (gas)
- Recommended: Keep minimum 0.001 ETH for gas even when trading with USDC

### 2. **Approval Requirements**
- **USDC**: Requires one-time approval transaction
- **ETH**: No approval needed (native token)

### 3. **Price Calculation**
- ETH/USD price fetched from Avantis oracle
- Fallback to Coinbase API if oracle fails
- USDC always valued at $1.00

### 4. **Minimum Balances**
```
Minimum for Trading:
- Total value: $10
- Recommended: $50-100 per agent

Gas Reserve:
- Minimum: 0.001 ETH
- Recommended: 0.01 ETH
```

---

## 🎮 Using the Arena

### Real-Time Updates:
- Balances refresh every 15 seconds
- Green pulse = funds available
- Red/gray = needs funding

### Funding Warning:
When agents need funding, you'll see:
```
⚠️ Agents Need Real Crypto Funding

Your agents need ETH or USDC (or both) deposited to their
wallets on Base network to enable real trading.

Network: Base Mainnet (Chain ID: 8453)
Tokens: ETH (native) or USDC (0x833589...)
Minimum: $10 worth per agent
Recommended: $50-100 worth per agent
```

---

## 🔐 Security

### Private Keys:
- Encrypted in database
- Decrypted only during trade execution
- Never exposed to frontend

### Wallet Addresses:
- Public (safe to share)
- Displayed in Arena for funding
- Can be viewed on Base block explorer

---

## 📝 Quick Start Checklist

- [ ] 1. View agent wallet addresses in Arena
- [ ] 2. Fund wallets with ETH and/or USDC on Base
- [ ] 3. Verify balances show green in Arena UI
- [ ] 4. Wait for auto-trading cycle or trigger manual trade
- [ ] 5. Monitor trades in Trades section

---

## 🤝 Support

### Getting ETH/USDC:
- **Coinbase**: https://www.coinbase.com/
- **Base Bridge**: https://bridge.base.org/
- **Uniswap on Base**: https://app.uniswap.org/

### Block Explorer:
- **BaseScan**: https://basescan.org/

### Need Help?
Check agent wallet addresses in Arena → Fund via Coinbase or bridge → Wait for balance to reflect → Start trading!

---

## 🎉 Benefits

✅ **Flexibility**: Choose between ETH or USDC based on what you have
✅ **Stability**: USDC avoids ETH price volatility in calculations
✅ **Simplicity**: Auto-selection handles collateral choice automatically
✅ **Reliability**: Fallback to ETH if USDC runs low
✅ **Transparency**: See exactly what each agent has available

---

**Ready to trade with both ETH and USDC!** 🚀
