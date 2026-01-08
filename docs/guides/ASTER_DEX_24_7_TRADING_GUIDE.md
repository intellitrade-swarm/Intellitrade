
# 🚀 AsterDEX 24/7 Autonomous Trading Integration

## Overview
Your AI agents can now trade perpetual futures on **Astar zkEVM** with 2-5x leverage, fully autonomously 24/7. This integration combines AI-powered market analysis with leveraged trading on AsterDEX for maximum profit potential.

## 🎯 Key Features

### ✅ **On-Chain Perpetuals Trading**
- Trade BTC-USD, ETH-USD, MATIC-USD, LINK-USD, ASTR-USD
- Leverage: 2x-5x (dynamically adjusted based on AI confidence)
- Real blockchain transactions on Astar zkEVM
- Viem-based smart contract interaction

### ✅ **Intelligent Position Management**
- AI-driven entry signals with confidence scoring
- Dynamic position sizing (max 10% of balance as collateral)
- Automatic PnL-based exit triggers:
  - Stop loss: -5% PnL
  - Take profit: +10% PnL
- Risk-adjusted leverage selection

### ✅ **24/7 Autonomous Operation**
- Continuous market scanning every 15 minutes (configurable)
- Automatic position monitoring
- Self-healing error recovery
- Telegram alerts for all trades

### ✅ **Advanced Risk Management**
- Circuit breaker integration
- Maximum collateral limits per trade
- Volatility-based leverage adjustment
- Position size caps

## 🔧 Architecture

### Components
```
┌──────────────────────────────────────────────────────┐
│                    AI Trading Brain                   │
│  (NVIDIA, GPT-4, Gemini, Grok AI Market Analysis)   │
└─────────────────┬────────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────────┐
│              AsterDEX Integration Layer              │
│  • Position Management                               │
│  • Smart Contract Interaction (Viem)                 │
│  • Risk Assessment                                   │
└─────────────────┬────────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────────┐
│              Astar zkEVM Network                     │
│  • Perpetuals Router Contract                        │
│  • USDC.e Collateral                                 │
│  • Real-time Settlement                              │
└──────────────────────────────────────────────────────┘
```

### Files Created
1. **lib/aster-dex-onchain.ts** - Core AsterDEX integration
   - Contract ABIs and addresses
   - Position open/close functions
   - Market data retrieval
   - USDC balance checks

2. **lib/aster-autonomous-trading.ts** - Autonomous trading engine
   - AI-driven trading cycles
   - Position monitoring
   - Risk management
   - Trade execution logic

3. **app/api/aster-dex/trade/route.ts** - Trading API endpoints
   - POST: Open position
   - GET: Get position info
   - DELETE: Close position

4. **app/api/aster-dex/autonomous/route.ts** - Autonomous trading API
   - POST: Execute trading cycle
   - GET: Get status and features

5. **app/arena/components/aster-dex-panel.tsx** - UI Component
   - Trading controls
   - Position monitoring
   - Status display

6. **lib/trading-scheduler.ts** (Updated) - 24/7 Scheduler
   - AsterDEX mode toggle
   - Dual-mode support (DEX + AsterDEX)
   - Configurable intervals

## 📋 Configuration

### Network Setup
```typescript
// Astar zkEVM Configuration
Chain ID: 3776
RPC: https://rpc.startale.com/astar-zkevm
Explorer: https://astar-zkevm.explorer.startale.com

// Contracts
Router: 0x8C8B... (Replace with actual)
USDC.e: 0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4
```

### Trading Parameters
```typescript
// Position Sizing
Max Collateral per Trade: Min(Balance * 10%, $100)
Minimum Collateral: $10
Minimum Agent Balance: $10

// Leverage
Low Volatility + High Confidence: 5x
Medium Volatility: 3x
High Volatility: 2x

// Exit Thresholds
Stop Loss: -5% PnL
Take Profit: +10% PnL
```

## 🚀 Getting Started

### 1. Fund Agent Wallets with USDC on Astar zkEVM

**Option A: Bridge from Ethereum**
```bash
# Visit Astar Bridge
https://portal.astar.network/astar-zkevm/bridge

# Bridge USDC to Astar zkEVM
# Send to agent wallet addresses
```

**Option B: Buy on Exchange and Withdraw**
```bash
# 1. Buy USDC on exchange
# 2. Withdraw to Astar zkEVM network
# 3. Use agent wallet addresses
```

### 2. Enable AsterDEX Trading

**Via UI:**
1. Go to Arena → Trading tab
2. Find AsterDEX Perpetuals panel
3. Toggle "Perpetuals Trading" switch to ON
4. Click "Execute Cycle Now" to test

**Via API:**
```bash
# Start scheduler with AsterDEX
curl -X POST http://localhost:3000/api/ai/scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "start", "intervalMinutes": 15}'

# Enable AsterDEX mode
curl -X PUT http://localhost:3000/api/ai/scheduler \
  -H "Content-Type: application/json" \
  -d '{"useAsterDex": true}'
```

### 3. Monitor Trading

**Check Positions:**
```bash
# Get agent position
curl http://localhost:3000/api/aster-dex/trade?agentId=AGENT_ID&market=BTC-USD
```

**View Trades in Database:**
```sql
SELECT * FROM Trade 
WHERE chain = 'astar-zkevm' 
  AND type = 'PERPETUAL' 
ORDER BY entryTime DESC;
```

**Check Telegram Alerts:**
- All trades send notifications to Telegram (if configured)
- Includes entry/exit signals, PnL, and risk warnings

## 📊 Trading Flow

### Autonomous Cycle (Every 15 Minutes)

1. **Market Analysis** (AI Provider)
   - Fetch market sentiment
   - Analyze volatility
   - Identify top opportunities

2. **Agent Evaluation**
   - Check wallet balance (>$10 required)
   - Check existing positions
   - Calculate available collateral

3. **Signal Generation** (AI)
   - Generate trading signal with confidence
   - Determine market and side (LONG/SHORT)
   - Calculate position size

4. **Risk Assessment**
   - Circuit breaker check
   - Position size validation
   - Leverage selection

5. **Trade Execution** (if approved)
   - Approve USDC spending
   - Open position on AsterDEX
   - Record in database
   - Send Telegram alert

6. **Position Monitoring**
   - Check PnL on existing positions
   - Close if stop loss (-5%) or take profit (+10%)
   - Update agent balance

## 🔧 Manual Trading

### Open Position
```typescript
// Via API
const response = await fetch('/api/aster-dex/trade', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: 'agent_123',
    market: 'BTC-USD',
    side: 'LONG',
    collateralUSD: 50,
    leverage: 3
  })
});
```

### Close Position
```typescript
// Via API
const response = await fetch('/api/aster-dex/trade', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: 'agent_123',
    market: 'BTC-USD',
    tradeId: 'trade_123'
  })
});
```

## 🛡️ Risk Management

### Circuit Breaker Rules
- Max 20% of balance per trade
- Daily loss limit: 30% of balance
- Consecutive loss limit: 3 trades
- Cooling period after loss limit: 1 hour

### Position Limits
- Max open positions per agent: 3
- Max collateral per position: $100
- Max leverage: 5x
- Min collateral: $10

### Volatility Adjustments
```typescript
High Volatility:
  - Reduce leverage to 2x
  - Reduce position size by 50%
  - Increase confidence threshold to 80%

Medium Volatility:
  - Use 3x leverage
  - Normal position sizing
  - 70% confidence threshold

Low Volatility:
  - Allow up to 5x leverage
  - Larger position sizes
  - 65% confidence threshold
```

## 📈 Performance Metrics

### Track Results
```sql
-- Total PnL on AsterDEX
SELECT 
  SUM(profitLoss) as total_pnl,
  COUNT(*) as total_trades,
  AVG(profitLoss) as avg_pnl,
  SUM(CASE WHEN profitLoss > 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as win_rate
FROM Trade
WHERE chain = 'astar-zkevm' AND status = 'CLOSED';

-- Agent Performance
SELECT 
  a.name,
  COUNT(t.id) as trades,
  SUM(t.profitLoss) as pnl,
  AVG(t.profitLoss) as avg_pnl
FROM AIAgent a
LEFT JOIN Trade t ON t.agentId = a.id
WHERE t.chain = 'astar-zkevm' AND t.status = 'CLOSED'
GROUP BY a.id
ORDER BY pnl DESC;
```

## 🚨 Troubleshooting

### "Insufficient USDC balance"
**Solution:** Fund agent wallet on Astar zkEVM
```bash
# Check balance
curl http://localhost:3000/api/aster-dex/trade?agentId=AGENT_ID&market=BTC-USD

# Fund via bridge: https://portal.astar.network/astar-zkevm/bridge
```

### "Agent not found or missing private key"
**Solution:** Ensure agent has EVM wallet configured
```sql
SELECT walletAddress, encryptedPrivateKey FROM AIAgent WHERE id = 'AGENT_ID';
```

### "Position already exists"
**Solution:** Close existing position first
```typescript
// System auto-closes before opening new position
// Manual close:
await closeAsterTrade(agentId, market, tradeId);
```

### "Risk check failed"
**Solution:** Circuit breaker triggered, wait for cooling period
```typescript
// Check circuit breaker status
const status = await circuitBreaker.canTrade(agentId, amount, balance);
console.log(status.reasons);
```

## 🎯 Best Practices

### 1. Start Small
- Begin with $10-20 per agent
- Use 2x leverage initially
- Monitor for 24 hours

### 2. Diversify Agents
- Different AI providers (NVIDIA, GPT-4, Gemini)
- Different strategies
- Different risk tolerances

### 3. Monitor Performance
- Check Telegram alerts daily
- Review PnL weekly
- Adjust parameters based on performance

### 4. Risk Management
- Never exceed 10% collateral per trade
- Keep total leverage under 3x average
- Maintain minimum $50 per agent

### 5. Regular Maintenance
- Top up USDC weekly
- Review trade history
- Update AI prompts based on performance

## 🔗 API Reference

### Trading Endpoints

**Execute Autonomous Cycle**
```http
POST /api/aster-dex/autonomous
Content-Type: application/json

{
  "agentId": "optional_agent_id" // If omitted, trades for all agents
}

Response:
{
  "success": true,
  "results": [...],
  "summary": {
    "total": 5,
    "successful": 2,
    "holds": 2,
    "errors": 1
  }
}
```

**Get Status**
```http
GET /api/aster-dex/autonomous

Response:
{
  "enabled": true,
  "description": "24/7 autonomous perpetuals trading on Astar zkEVM",
  "markets": ["BTC-USD", "ETH-USD", ...],
  "features": [...]
}
```

**Open Position**
```http
POST /api/aster-dex/trade
Content-Type: application/json

{
  "agentId": "agent_123",
  "market": "BTC-USD",
  "side": "LONG",
  "collateralUSD": 50,
  "leverage": 3
}
```

**Close Position**
```http
DELETE /api/aster-dex/trade
Content-Type: application/json

{
  "agentId": "agent_123",
  "market": "BTC-USD",
  "tradeId": "trade_123"
}
```

### Scheduler Endpoints

**Start Scheduler**
```http
POST /api/ai/scheduler
Content-Type: application/json

{
  "action": "start",
  "intervalMinutes": 15
}
```

**Toggle AsterDEX Mode**
```http
PUT /api/ai/scheduler
Content-Type: application/json

{
  "useAsterDex": true
}
```

**Get Status**
```http
GET /api/ai/scheduler

Response:
{
  "isRunning": true,
  "useAsterDex": true,
  "cyclesCompleted": 42,
  "successfulTrades": 18,
  "nextCycleTime": "2025-10-27T21:30:00Z"
}
```

## 📚 Additional Resources

- **Astar zkEVM Docs:** https://docs.astar.network/
- **AsterDEX Docs:** https://docs.asterdex.finance/
- **Viem Docs:** https://viem.sh/
- **Trading Guide:** /REAL_TRADING_GUIDE.md
- **Wallet Setup:** /WALLET_FUNDING_GUIDE.md

## ✅ Success Checklist

- [ ] Agents funded with USDC on Astar zkEVM (min $10 each)
- [ ] EVM wallets configured for all agents
- [ ] AsterDEX mode enabled in UI
- [ ] 24/7 scheduler running (15min intervals)
- [ ] Telegram alerts configured
- [ ] First test trade executed successfully
- [ ] Position monitoring confirmed working
- [ ] Risk limits properly configured

## 🎉 You're Ready!

Your AI agents are now equipped to trade perpetuals 24/7 on AsterDEX. They will:
- ✅ Analyze markets autonomously
- ✅ Open leveraged positions (2-5x)
- ✅ Monitor and close positions automatically
- ✅ Manage risk with circuit breakers
- ✅ Send alerts for all trades

**Let them trade! 🚀💰**

---

**Need Help?**
Check the troubleshooting section or review the code in:
- `/lib/aster-dex-onchain.ts`
- `/lib/aster-autonomous-trading.ts`
- `/app/arena/components/aster-dex-panel.tsx`
