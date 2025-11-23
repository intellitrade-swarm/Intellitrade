
# Advanced Trading Flow & Security Guide

## 🚀 Trading Flow Architecture

### Overview
Our trading system implements a secure, AI-powered trading flow that executes real on-chain trades via 1inch DEX Aggregator. The system supports Ethereum, Base, and BSC chains.

### Flow Diagram
```
AI Agent Detects Signal
      ↓
Convert USD → Token Amount
      ↓
Determine Swap Direction
      ↓
Sign Transaction
      ↓
Execute on Blockchain
      ↓
Record Result
```

## 💡 Implementation Example

### Basic Trading Flow

```typescript
import { executeCryptoTrade } from '@/lib/trading-flow';

// Step 1: AI Agent detects trading signal
const signal = {
  symbol: 'BTC',
  action: 'BUY',
  usdAmount: 100,
  confidence: 0.85
};

// Step 2: Execute trade if confidence is high
if (signal.confidence > 0.7) {
  const result = await executeCryptoTrade({
    agentId: agent.id,
    symbol: signal.symbol,
    action: signal.action,
    usdAmount: signal.usdAmount,
    chain: 'base'
  }, {
    address: agent.walletAddress,
    encryptedPrivateKey: agent.encryptedPrivateKey
  });
  
  if (result.success) {
    console.log('✅ Trade executed:', result.txHash);
    console.log('📊 Bought:', result.tokenAmount, signal.symbol);
    console.log('💰 Price:', result.executionPrice);
  }
}
```

### USD to Token Conversion

```typescript
import { convertUsdToTokenAmount } from '@/lib/trading-flow';

// Convert $100 to PEPE tokens
const { tokenAmount, price } = await convertUsdToTokenAmount('PEPE', 100);

console.log(`$100 = ${tokenAmount} PEPE at $${price} per token`);
```

### Complete Trading Flow

```typescript
// 1. Convert USD → Token Amount
const { tokenAmount, price } = await convertUsdToTokenAmount('ETH', 500);

// 2. Execute Swap
if (chain === 'ethereum' || chain === 'base' || chain === 'bsc') {
  const result = await executeCryptoTrade({
    agentId: 'agent123',
    symbol: 'ETH',
    action: 'BUY',
    usdAmount: 500,
    chain: 'base'
  }, agentWallet);
  
  return `Trade executed: ${result.txHash}`;
}

// 3. Future: Solana support
if (chain === 'solana') {
  // Will use Jupiter Aggregator
  await executeSolanaTrade('SOL', 'BUY', 500);
}
```

## 🔒 Security Best Practices

### 1. Private Key Protection

**Risk:** Private key exposure leads to complete loss of funds

**Solutions:**
- ✅ **Current:** AES-256-GCM encryption for private keys
- 🎯 **Recommended:** AWS KMS or similar key management service
- 🏆 **Enterprise:** Fireblocks for institutional-grade security
- 🔐 **Advanced:** TEE (Trusted Execution Environment) wallets

**Implementation:**
```typescript
import { getSecurityConfig } from '@/lib/security-config';

const config = getSecurityConfig();
// Production automatically uses encrypted key management
```

### 2. MEV Protection

**Risk:** Front-running and sandwich attacks steal profits

**Solutions:**
- ✅ Use 1inch Fusion Mode (automatic MEV protection)
- ✅ Flashbots Protect for Ethereum transactions
- ✅ Private RPC endpoints to avoid public mempool

**Implementation:**
```typescript
const config = {
  chain: 'ethereum',
  maxSlippage: 0.5,
  useFlashbotsProtect: true, // Enable MEV protection
  dynamicGas: true
};
```

### 3. Slippage Protection

**Risk:** Excessive slippage causes significant losses

**Solutions:**
- ✅ Maximum 0.5% slippage for production
- ✅ Alert system for unusual slippage
- ✅ Break large trades into smaller chunks

**Configuration:**
```typescript
const SLIPPAGE_CONFIG = {
  maxBasisPoints: 50, // 0.5%
  alertThreshold: 30  // Alert if > 0.3%
};
```

### 4. Gas Optimization

**Risk:** Gas price manipulation and griefing

**Solutions:**
- ✅ Dynamic gas pricing based on network conditions
- ✅ Maximum gas price limits (100 gwei)
- ✅ Gas estimation before execution

**Implementation:**
```typescript
const GAS_CONFIG = {
  strategy: 'dynamic',
  maxGweiAllowed: 100,
  priorityFee: 2 // gwei
};
```

## 📊 Security Configuration

### Production Configuration

```typescript
export const PRODUCTION_SECURITY = {
  keyManagement: 'encrypted', // Use KMS in production
  
  mevProtection: {
    enabled: true,
    method: 'fusion' // 1inch Fusion Mode
  },
  
  slippage: {
    maxBasisPoints: 50, // 0.5%
    alertThreshold: 30
  },
  
  gas: {
    strategy: 'dynamic',
    maxGweiAllowed: 100,
    priorityFee: 2
  },
  
  limits: {
    maxTradeUsd: 10000,
    maxDailyTradesPerAgent: 50,
    minBalanceBuffer: 0.01 // ETH for gas
  }
};
```

### Development Configuration

```typescript
export const DEVELOPMENT_SECURITY = {
  slippage: {
    maxBasisPoints: 100, // 1% for testing
  },
  
  limits: {
    maxTradeUsd: 1000,
    maxDailyTradesPerAgent: 100
  }
};
```

## 🤖 AI Agent Integration

### Create Trading Agent

```typescript
import { createReactAgent } from 'your-ai-framework';
import { executeCryptoTrade } from '@/lib/trading-flow';

// Define trading tool for AI agent
const tradeCryptoTool = {
  name: 'trade_crypto',
  description: 'Execute cryptocurrency trades based on market signals',
  execute: async (params: TradeRequest) => {
    return await executeCryptoTrade(params, agentWallet);
  }
};

// Create AI agent with trading capability
const agent = createReactAgent(llm, {
  tools: [tradeCryptoTool],
  systemPrompt: `You are a trading agent. Analyze market conditions and execute trades when opportunities arise.`
});

// Use agent
await agent.invoke("Buy $100 of PEPE on Base if RSI < 30");
```

### Risk Assessment

```typescript
import { assessTradeRisk } from '@/lib/trading-flow';

const risk = assessTradeRisk(
  balance: 1000,
  tradeAmount: 250,
  openPositions: 2
);

if (!risk.safe) {
  console.warn('⚠️ Trade warnings:', risk.warnings);
  // Example warnings:
  // - "Trade size (25%) exceeds 20% of balance"
  // - "Too many open positions (3/3 max)"
}
```

## 🌐 Supported Chains

### Current Support
- **Ethereum** (Chain ID: 1)
  - 1inch Aggregator
  - Flashbots MEV protection
  - High liquidity

- **Base** (Chain ID: 8453)
  - Low gas fees
  - Fast confirmations
  - 1inch support

- **BSC** (Chain ID: 56)
  - Alternative to Ethereum
  - Lower fees
  - 1inch support

### Future Support
- **Solana** (via Jupiter Aggregator)
  - Extremely low fees
  - High speed
  - Different architecture (SPL tokens)

## 📈 Trading Strategies

### Momentum Strategy
```typescript
const momentumSignal = await aiAgent.analyze({
  strategy: 'momentum',
  indicators: ['RSI', 'MACD', 'Volume'],
  threshold: 0.75
});
```

### Mean Reversion Strategy
```typescript
const reversionSignal = await aiAgent.analyze({
  strategy: 'mean_reversion',
  indicators: ['Bollinger Bands', 'Support/Resistance'],
  threshold: 0.70
});
```

### Trend Following Strategy
```typescript
const trendSignal = await aiAgent.analyze({
  strategy: 'trend_following',
  indicators: ['Moving Averages', 'Trend Lines'],
  threshold: 0.65
});
```

## 🔧 API Endpoints

### Manual Trade
```typescript
POST /api/wallet/manual-trade

{
  "agentId": "agent123",
  "symbol": "BTC",
  "action": "BUY",
  "usdAmount": 100,
  "chain": "base"
}
```

### Automated Trade
```typescript
POST /api/ai/auto-trade

{
  "agentId": "agent123"
}

// Returns: { success, trade, signal, txHash }
```

### Check Balance
```typescript
GET /api/wallet/balance?address=0x...&chain=base

// Returns: { eth, usdc, totalUsd }
```

## 🚨 Monitoring & Alerts

### Security Alerts
```typescript
import { createSecurityAlert } from '@/lib/security-config';

// High slippage detected
createSecurityAlert(
  'high',
  'slippage_warning',
  'Slippage exceeded 0.3% threshold',
  { slippage: 0.45, trade: tradeId }
);

// Gas price spike
createSecurityAlert(
  'medium',
  'gas_warning',
  'Gas price above 80 gwei',
  { gasPrice: 95, timestamp: Date.now() }
);
```

### Trade Monitoring
```typescript
// Monitor all agent trades
const trades = await prisma.trade.findMany({
  where: {
    isRealTrade: true,
    status: 'CLOSED'
  },
  include: {
    agent: true
  }
});

// Calculate success metrics
const successful = trades.filter(t => t.profitLoss > 0);
const winRate = (successful.length / trades.length) * 100;
```

## 📚 Additional Resources

### Documentation
- [1inch API Documentation](https://portal.1inch.dev/)
- [Security Best Practices](./SECURITY_BEST_PRACTICES.md)
- [AI Trading Engine Guide](./AI_FEATURES_GUIDE.md)

### Support
- For trading issues, check agent wallet balance
- For API issues, verify 1inch API key configuration
- For security concerns, review security configuration

---

**Last Updated:** 2025-10-27
**Version:** 2.0.0
**Status:** ✅ Production Ready

