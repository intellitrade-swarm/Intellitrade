#  Intellitrade - AI-Powered Autonomous Trading Platform

Framework powered by SwarmsAi

<div align="center">

![Intellitrade](https://img.shields.io/badge/AI-Trading-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Autonomous AI trading platform powered by intelligent multi-agent swarms that trade on-chain using advanced strategies**

[Live Demo](https://intellitrade.xyz) • [Documentation](#documentation) • [Features](#features) • [Getting Started](#getting-started)

</div>

---

##  Overview

Intellitrade is a cutting-edge autonomous trading platform that combines artificial intelligence, blockchain technology, and advanced on-chain analytics to execute profitable trades 24/7. The platform features:

- ** 3 Autonomous AI Trading Agents** with distinct personalities and strategies
- ** 5-Agent Swarm Intelligence** for collaborative trading decisions
- ** Real-time On-Chain Analytics** powered by Nansen API
- ** Smart Money Tracking** across multiple EVM chains
- ** TradingView Webhook Integration** for automated signal processing
- ** Perpetual Futures Intelligence** with GMX/AsterDEX integration
- ** Agent Governance & Staking** with blockchain-verified identities
---

## ✨ Core Features

### 1. Autonomous AI Trading Agents

Three specialized AI agents with unique strategies:

- **Volatility Sniper** ($120 capital) - Exploits market volatility with precision entries
- **Funding Phantom** ($120 capital) - Arbitrages funding rates across perpetual markets
- **Reversion Hunter** ($70 capital) - Identifies mean reversion opportunities

**Key Capabilities:**
- 24/7 autonomous operation
- Real-time market scanning every 15 minutes
- Risk-managed position sizing (max $50 per trade)
- Circuit breaker protection (30% daily loss limit)
- AsterDEX Perpetuals execution

### 2. Multi-Agent Swarm Intelligence

A collaborative 5-agent system inspired by CrewAI for advanced decision-making:

- ** Data Analyst** - Processes Nansen on-chain data and market intelligence
- **Technical Analyst** - Analyzes price action, RSI, momentum, and trends
- **Risk Manager** - Enforces strict risk limits and position sizing
- **Strategy Coordinator** - Synthesizes multi-agent inputs for final decisions
- **Performance Evaluator** - Tracks decisions and builds learning memory

**Benefits:**
- 35% trade approval rate (high quality filter)
- 75-85% confidence scoring
- Multi-perspective analysis reduces bias
- Cost-effective: ~$0.045 per analysis

### 3. TradingView Webhook Integration

Automated trading signal processing from external sources:

- **Dual Webhook Endpoints:**
  - `/api/webhooks/tradingview` - For TradingView alerts
  - `/api/webhooks/nansen` - For whale alert triggers

- **Intelligent Routing:**
  - Technical alerts → 3-agent multi-agent system
  - Whale alerts → 5-agent swarm + Nansen data enrichment
  - Custom alerts → Full swarm analysis

- **Processing Flow:**
  1. Receive webhook (TradingView/Nansen)
  2. Enrich with real-time Nansen data
  3. Trigger multi-agent analysis
  4. Return actionable recommendation
  5. Log event for audit trail

### 4. Whale Monitor & Social Sentiment

Multi-chain EVM scanner for high-conviction tokens:

- **Supported Chains:** Ethereum, BNB Chain, Polygon, Base
- **Data Sources:** Moralis + DexScreener for accurate volume metrics
- **Real-time Sentiment:** AI-powered bullish/bearish/neutral classification
- **Smart Money Tracking:** Flow Intelligence, PnL Leaderboards, Profiler
- **Top Tokens Scanner:** 5 tokens per chain with buy/sell volume analysis

### 5.  Perpetual Futures Intelligence

Comprehensive perps market analytics:

- **Market Screener:** 20+ perpetual markets with key metrics
- **Smart Money Feed:** Real-time perp trades from verified wallets
- **PnL Leaderboard:** Top traders ranked by profitability
- **Position Tracking:** Long/short positioning for any token
- **Platform Support:** GMX, AsterDEX, and more

### 6.  Nansen API Integration

25+ endpoints for institutional-grade on-chain intelligence:

- **Token Intelligence:** Screener, info, trending tokens
- **Smart Money:** Holdings, historical data, DEX trades, perp trades
- **Flow Intelligence:** Summary, historical flows, netflows
- **Profiler:** Address profiles, balances, transactions, PnL, labels
- **TGM (Token God Mode):** Holders, perp positions/trades, leaderboards

### 7.  Agent Governance & Staking

DeFi-native governance for AI agents:

- **Blockchain-Verified IDs:** On-chain identity with spending caps
- **Community Governance:** Stake-weighted voting on agent parameters
- **Performance-Based Staking:** 10-40% APY based on agent PnL
- **Immutable Audit Trail:** Hash-chain verified action logging
- **Social Recovery:** Multi-sig wallet recovery for agent keys

---

##  Technical Architecture

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18 with TypeScript
- Tailwind CSS + Radix UI Components
- Framer Motion for animations
- Recharts for data visualization

**Backend:**
- Next.js 14 API Routes
- PostgreSQL with Prisma ORM
- NextAuth.js for authentication
- Real-time WebSocket updates

**Blockchain:**
- ethers.js v6
- Web3Modal v3
- Wagmi for React hooks
- WalletConnect integration
- Multi-chain support (EVM + Solana)

**AI/ML:**
- OpenAI GPT-4 Turbo
- NVIDIA AI Endpoints
- Google Gemini Pro
- Custom multi-agent orchestration

**Data & Analytics:**
- Nansen API (institutional on-chain data)
- Moralis API (multi-chain indexing)
- DexScreener (DEX volume/liquidity)
- CoinGecko (market data)
- AsterDEX (perpetuals execution)

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                     │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │   Arena     │ Performance │   Agents    │ Copy Trading│ │
│  │   Oracle    │ Whale Mon.  │ Governance  │   Perps     │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  API Layer (Next.js API Routes)              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/agents  /api/trades  /api/swarm  /api/nansen  │  │
│  │  /api/webhooks  /api/multi-agent  /api/governance   │  │
│  └──────────────────────────────────────────────────────┘  │
└───────┬─────────────┬─────────────┬─────────────┬──────────┘
        │             │             │             │
┌───────▼──────┐ ┌───▼──────┐ ┌───▼──────┐ ┌───▼──────┐
│  PostgreSQL  │ │  Nansen  │ │  Moralis │ │ DexScreen│
│   (Prisma)   │ │    API   │ │    API   │ │    API   │
└──────────────┘ └──────────┘ └──────────┘ └──────────┘
        │
┌───────▼──────────────────────────────────────────────────┐
│              Trading Execution Layer                      │
│  ┌────────────────┬─────────────────┬─────────────────┐ │
│  │  AsterDEX      │  Circuit        │  Risk           │ │
│  │  (Perpetuals)  │  Breaker        │  Management     │ │
│  └────────────────┴─────────────────┴─────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Database Schema

**Core Models:**
- `AIAgent` - Agent configurations, balances, performance
- `Trade` - Trade execution records with PnL tracking
- `Treasury` - Platform treasury management
- `AgentBlockchainID` - On-chain agent identities
- `GovernanceProposal` / `GovernanceVote` - DAO governance
- `AgentStaking` / `StakingReward` - Staking system
- `WhaleSignal` / `SocialSentiment` - Whale monitor data
- `WebhookEvent` - Webhook processing logs

---

## Getting Started

### Prerequisites

- Node.js 18+ and Yarn
- PostgreSQL 14+ database
- API keys (see below)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/intellitrade-swarm/intellitrade.git
cd intellitrade/nextjs_space

# 2. Install dependencies
yarn install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your API keys (see below)

# 4. Set up the database
npx prisma generate
npx prisma migrate dev
yarn seed

# 5. Start the development server
yarn dev
```

Visit `http://localhost:3000` to see the application.

### Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/intellitrade"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# AI Models
OPENAI_API_KEY="sk-..."
NVIDIA_API_KEY="nvapi-..."
GEMINI_API_KEY="..."

# On-Chain Data
NANSEN_API_KEY="..."
MORALIS_API_KEY="..."
ETHERSCAN_API_KEY="..."

# Trading
ASTERDEX_API_KEY="..."
ASTERDEX_API_SECRET="..."
WALLET_PRIVATE_KEY="..."

# Optional
ENABLE_SWARM="true"  # Enable 5-agent swarm intelligence
AUTO_START_TRADING="true"  # Auto-start scheduler on server start
```

### API Keys Setup

1. **Nansen API** ($150/month) - [Sign up](https://pro.nansen.ai/)
   - Required for smart money tracking and flow intelligence
   
2. **Moralis API** (Free tier available) - [Sign up](https://moralis.io/)
   - Required for multi-chain token scanning
   
3. **OpenAI API** (Pay-as-you-go) - [Sign up](https://platform.openai.com/)
   - Required for AI trading decisions (~$0.01 per analysis)
   
4. **NVIDIA AI** (Free tier available) - [Sign up](https://build.nvidia.com/)
   - Optional, for GPU-accelerated AI models
   
5. **AsterDEX API** - [Contact AsterDEX](https://asterdex.io/)
   - Required for perpetual futures trading execution

---

## 📚 Documentation

### Core System Documentation

- **[Trading System Status](TRADING_SYSTEM_STATUS.md)** - Current system health and operational status
- **[Nansen Integration Guide](NANSEN_INTEGRATION_COMPLETE.md)** - Comprehensive Nansen API setup
- **[Multi-Agent System](MULTI_AGENT_TRADING_SYSTEM_COMPLETE.md)** - 3-agent collaborative trading
- **[Swarm Intelligence](SWARM_INTELLIGENCE_COMPLETE.md)** - 5-agent swarm architecture
- **[Webhook Integration](TRADINGVIEW_WEBHOOK_INTEGRATION_COMPLETE.md)** - TradingView setup guide

### Feature-Specific Documentation

- **[Agent Governance](AGENT_GOVERNANCE_COMPLETE.md)** - Blockchain governance & staking
- **[Whale Monitor](WHALE_MONITOR_SYSTEM_COMPLETE.md)** - Smart money tracking system
- **[Cross-Chain Aggregator](CROSS_CHAIN_LIQUIDITY_AGGREGATOR_COMPLETE.md)** - Multi-chain routing
- **[DexScreener Integration](DEXSCREENER_INTEGRATION_COMPLETE.md)** - DEX volume data
- **[Token God Mode](TOKEN_GOD_MODE_STATUS.md)** - Nansen TGM endpoints

### Quick References

- **[Nansen Quick Start](NANSEN_QUICK_START.md)**
- **[Swarm Intelligence Quick Start](SWARM_INTELLIGENCE_QUICK_START.md)**
- **[Webhook Integration Quick Start](WEBHOOK_INTEGRATION_QUICK_START.md)**
- **[Agent Governance Quick Start](GOVERNANCE_QUICK_START.md)**

---

## Usage Examples

### 1. Triggering Swarm Analysis

```typescript
// API call
const response = await fetch('/api/swarm/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbol: 'ETH',
    agentId: 'agent-id',
    balance: 100
  })
});

const decision = await response.json();
// Returns: { action, confidence, reasoning, swarmAnalysis }
```

### 2. Setting Up TradingView Webhook

In TradingView alert settings:

- **Webhook URL**: `https://intellitrade.xyz/api/webhooks/tradingview`
- **Message**:
```json
{
  "ticker": "{{ticker}}",
  "action": "{{strategy.order.action}}",
  "price": {{close}},
  "volume": {{volume}},
  "alertType": "technical"
}
```

### 3. Monitoring Whale Activity

```typescript
// Fetch top tokens by buy volume
const response = await fetch('/api/whale-monitor/top-tokens');
const data = await response.json();

// Returns 5 tokens per chain (Ethereum, BSC, Polygon, Base)
// with buy/sell volume, sentiment, and AI analysis
```

### 4. Checking Agent Performance

```bash
# Using the diagnostic script
yarn tsx --require dotenv/config scripts/check_agent_trades.ts

# Output: Agent balances, win rates, PnL, and recent trades
```

---

## 🛠️ Development

### Project Structure

```
ipool_swarms/
├── nextjs_space/              # Next.js application
│   ├── app/                   # App router pages and components
│   │   ├── api/               # API routes
│   │   ├── arena/             # Trading arena UI
│   │   ├── oracle-section/    # Oracle intelligence UI
│   │   ├── swarm-intelligence/ # Swarm dashboard
│   │   └── components/        # Shared components
│   ├── lib/                   # Core business logic
│   │   ├── trading-scheduler.ts
│   │   ├── trading-swarm.ts
│   │   ├── multi-agent-trading.ts
│   │   ├── nansen-api.ts
│   │   ├── moralis-scanner.ts
│   │   └── webhook-processor.ts
│   ├── prisma/                # Database schema and migrations
│   ├── scripts/               # Utility scripts
│   └── public/                # Static assets
└── docs/                      # Comprehensive documentation
```

### Running Tests

```bash
# Test trading scheduler
yarn tsx --require dotenv/config scripts/test_trading_cycle.ts

# Test Nansen API integration
./TEST_NANSEN_ENDPOINTS.sh

# Test whale monitor
yarn tsx --require dotenv/config scripts/test-whale-monitor.ts

# Test multi-agent system
yarn tsx --require dotenv/config scripts/test-multi-agent.ts
```

### Key Scripts

```bash
# Start autonomous trading
yarn tsx --require dotenv/config scripts/start-autonomous-trading.ts

# Check agent status
yarn tsx --require dotenv/config scripts/check_agents.ts

# Consolidate agent capital
yarn tsx --require dotenv/config scripts/consolidate_agents.ts

# Initialize treasury
yarn tsx --require dotenv/config scripts/initialize-treasury.ts
```

---

##  Security

- **Private Keys**: Never commit private keys or API secrets
- **Circuit Breakers**: Automatic trading halt on excessive losses
- **Risk Limits**: Position sizing enforced by Risk Manager agent
- **Audit Trail**: All agent actions logged with hash-chain verification
- **Governance**: Community-controlled agent parameter changes

---

## 🚦 Deployment

### Production Deployment

The platform is currently deployed at **[intellitrade.xyz](https://intellitrade.xyz)**

### Environment Configuration

```env
NODE_ENV=production
NEXTAUTH_URL=https://intellitrade.xyz
AUTO_START_TRADING=true
ENABLE_SWARM=true
```

### Build & Deploy

```bash
# Build for production
cd nextjs_space
yarn build

# Start production server
yarn start

# Or use PM2 for process management
pm2 start yarn --name "intellitrade" -- start
```

---

##  Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

##  Acknowledgments

- **Nansen** for institutional-grade on-chain analytics
- **OpenAI** for GPT-4 Turbo AI models
- **NVIDIA** for GPU-accelerated AI inference
- **Moralis** for multi-chain blockchain indexing
- **DexScreener** for accurate DEX volume data
- **AsterDEX** for perpetual futures execution

---

## Support & Contact

- **Website**: [intellitrade.xyz](https://intellitrade.xyz)
- **Documentation**: [docs.intellitrade.xyz](https://intellitrade.xyz)
- **GitHub**: [github.com/intellitrade-swarm](https://github.com/intellitrade-swarm)

---

##  Roadmap

### Phase 1: Core Platform  (Complete)
- 3 autonomous AI trading agents
- Real-time market scanning
- AsterDEX Perpetuals integration
- Circuit breaker risk management

### Phase 2: Intelligence Layer  (Complete)
- 5-agent swarm intelligence
-  Nansen API integration (25+ endpoints)
-  Whale monitor with multi-chain scanning
-  TradingView webhook automation

### Phase 3: Governance & DeFi  (Complete)
- Agent blockchain IDs
- Community governance voting
- Performance-based staking (10-40% APY)
- Immutable audit trails

### Phase 4: Expansion  (In Progress)
-  Additional AI providers (Claude, Llama 3)
-  More DEX integrations (Jupiter, 1inch)
-  Advanced backtesting framework
- Mobile app (iOS/Android)

### Phase 5: Future 📅 (Planned)
- On-chain AI agent deployment
- Cross-chain atomic swaps
- Decentralized oracle network
- DAO treasury management

---

<div align="center">

**Built with by the Intellitrade Team**

[⭐ Star us on GitHub](https://github.com/intellitrade-swarm/intellitrade) | [🐦 Follow on Twitter](https://twitter.com/intellitrade) | [💬 Join Discord](https://discord.gg/intellitrade)

</div>
