
# Intellitrade - AI-Powered Autonomous Trading Platform

## 🚀 Overview

iCHAIN Swarms is a cutting-edge AI-driven trading platform that leverages advanced artificial intelligence and blockchain technology to execute autonomous trading strategies across multiple decentralized exchanges (DEXs). The platform combines NVIDIA AI, sophisticated trading algorithms, and real-time market analysis to maximize profitability while minimizing risk.

## ✨ Key Features

### 🤖 AI-Powered Trading
- **NVIDIA AI Integration**: Advanced market analysis using NVIDIA's powerful AI models
- **Multiple AI Providers**: Support for NVIDIA, Gemini, Grok, and OpenAI
- **Intelligent Signal Generation**: AI-driven trading signals with real-time market sentiment analysis
- **Adaptive Strategies**: Dynamic strategy adjustment based on market conditions

### 💹 Multi-DEX Trading
- **AsterDEX**: 24/7 leveraged perpetual trading on Arbitrum
- **Avantis**: Advanced perpetual futures trading on Base chain
- **Cross-Chain Support**: ETH, BSC, Solana, and more
- **Intelligent Position Management**: Automated position sizing and risk management

### 🎯 Aggressive Profit-Taking Strategies
- **Ultra-Profitable Trading Engine**: Optimized for maximum returns
- **Dynamic Take-Profit Levels**: Adaptive profit-taking based on market volatility
- **Intelligent Trailing Stops**: Secure profits while allowing for further gains
- **High-Frequency Trading**: Execute more trades to capture market opportunities

### 📊 Real-Time Analytics
- **Live Trade Monitoring**: Real-time trade execution and performance tracking
- **Performance Metrics**: Comprehensive analytics and ROI tracking
- **Agent Competition**: Multiple AI agents competing for best performance
- **Market Data Integration**: DefiLlama, DexScreener, The Graph, and more

### 🔒 Security & Risk Management
- **Circuit Breakers**: Automatic trading halts on excessive losses
- **Position Limits**: Maximum position size and leverage controls
- **Wallet Security**: Secure multi-wallet management
- **API Key Management**: Encrypted storage of sensitive credentials

### 🌐 Social Trading Features
- **X (Twitter) Integration**: Automated trading signal posting
- **Social Feeds**: Real-time market sentiment from social media
- **Signal Sharing**: Share successful trades with the community

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: ethers.js, Web3 integration
- **AI/ML**: NVIDIA AI, Gemini, Grok, OpenAI APIs
- **Charts**: Recharts, Chart.js, Plotly
- **State Management**: Zustand, React Query

## 📋 Prerequisites

- Node.js 18+ (recommended: 20.x)
- Yarn package manager
- PostgreSQL database
- API Keys:
  - NVIDIA API key
  - AsterDEX API credentials
  - X (Twitter) API credentials (optional)
  - Other AI provider keys (optional)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ichain-swarms.git
cd ichain-swarms
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ichain_swarms"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# AI Providers
NVIDIA_API_KEY="your-nvidia-api-key"
GEMINI_API_KEY="your-gemini-api-key"
GROK_API_KEY="your-grok-api-key"
OPENAI_API_KEY="your-openai-api-key"

# AsterDEX
ASTERDEX_API_KEY="your-asterdex-api-key"
ASTERDEX_API_SECRET="your-asterdex-api-secret"

# Blockchain
ETHEREUM_PRIVATE_KEY="your-eth-private-key"
ARBITRUM_RPC_URL="https://arb1.arbitrum.io/rpc"
BASE_RPC_URL="https://mainnet.base.org"

# X (Twitter) - Optional
X_API_KEY="your-x-api-key"
X_API_SECRET="your-x-api-secret"
X_ACCESS_TOKEN="your-x-access-token"
X_ACCESS_TOKEN_SECRET="your-x-access-token-secret"
```

### 4. Set Up Database

```bash
# Generate Prisma client
yarn prisma generate

# Run migrations
yarn prisma migrate dev

# Seed database with initial agents
yarn prisma db seed
```

### 5. Run Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

Comprehensive guides are available in the project root:

### Quick Start Guides
- `QUICK_START_TRADING.md` - Get started with trading immediately
- `QUICK_REFERENCE_ACCOUNT_TRADING.md` - Account-based trading reference
- `PROFIT_TAKING_QUICK_REFERENCE.md` - Aggressive profit-taking strategies

### Trading Guides
- `ASTERDEX_24_7_TRADING_ACTIVATED.md` - 24/7 AsterDEX trading setup
- `AVANTIS_TRADING_GUIDE.md` - Avantis perpetual futures guide
- `REAL_TRADING_GUIDE.md` - Real money trading activation
- `AI_AUTO_TRADING_GUIDE.md` - AI-powered autonomous trading

### Integration Guides
- `NVIDIA_AI_INTEGRATION_GUIDE.md` - NVIDIA AI setup and usage
- `X_API_INTEGRATION_COMPLETE.md` - X (Twitter) integration
- `DEFILLAMA_INTEGRATION_COMPLETE.md` - DefiLlama market data
- `THE_GRAPH_INTEGRATION_COMPLETE.md` - The Graph protocol integration

### Feature Guides
- `WALLET_FUNDING_GUIDE.md` - Fund agent wallets
- `COMPREHENSIVE_FEATURES_GUIDE.md` - Complete feature overview
- `SECURITY_BEST_PRACTICES.md` - Security recommendations

## 🤖 AI Agents

The platform runs multiple AI agents that compete for the best trading performance:

1. **NVIDIA Agent** - Primary market analysis and signal generation
2. **Gemini Agent** - Alternative AI provider for diversification
3. **Grok Agent** - Social sentiment and trend analysis
4. **Volatility Sniper** - High-frequency volatility trading
5. **Funding Phantom** - Funding rate arbitrage specialist

Each agent has its own wallet, trading strategy, and performance metrics.

## 💰 Wallet Setup

### Create Agent Wallets

```bash
cd scripts
yarn ts-node create-new-agent-wallets.ts
```

### Fund Agent Wallets

See `WALLET_FUNDING_GUIDE.md` for detailed instructions on funding your agent wallets with ETH, USDC, or other tokens.

### Check Balances

```bash
yarn ts-node scripts/check-all-agent-balances.ts
```

## 🎮 Trading Activation

### Start 24/7 Autonomous Trading

```bash
yarn ts-node scripts/start-24-7-trading.ts
```

### Activate Aggressive Profit-Taking

```bash
yarn ts-node scripts/activate-volatility-sniper.ts
```

### Verify Trading Status

```bash
yarn ts-node scripts/check-asterdex-trades.ts
```

## 📊 Monitoring & Analytics

### View Live Trades
Navigate to `/arena` to see:
- Real-time trade execution
- Live profit/loss tracking
- Agent performance comparison
- Market analysis and signals

### Check Performance

```bash
yarn ts-node scripts/check-performance-data.ts
```

### View Recent Trades

```bash
yarn ts-node scripts/check-recent-trades.ts
```

## 🔧 Configuration

### Trading Parameters

Edit `lib/aster-autonomous-trading.ts` to adjust:
- Trade frequency
- Position sizing
- Risk limits
- Leverage settings
- Take-profit targets
- Stop-loss levels

### AI Settings

Edit `lib/ai-trading-engine.ts` to configure:
- AI provider selection
- Market analysis depth
- Signal generation sensitivity
- Trading strategies

## 🚨 Risk Management

### Built-in Safety Features
- ✅ Maximum position size limits
- ✅ Maximum leverage constraints
- ✅ Circuit breakers for rapid losses
- ✅ Intelligent stop-loss placement
- ✅ Portfolio balance monitoring
- ✅ API rate limiting

### Best Practices
1. Start with small position sizes
2. Monitor agents closely in the first 24 hours
3. Use simulation mode to test strategies
4. Maintain adequate wallet balances
5. Set appropriate risk limits
6. Regularly review performance metrics

## 🧪 Testing

```bash
# Run all tests
yarn test

# Check trading cycle
yarn ts-node test-trading-cycle.ts

# Test AsterDEX connection
yarn ts-node scripts/test-aster-dex-trading.ts

# Verify configuration
yarn ts-node scripts/verify-real-trading-config.ts
```

## 📈 Performance Optimization

### Aggressive Profit-Taking (Active)
- ✅ Faster trade execution (10-minute cycles)
- ✅ Lower profit-taking thresholds (0.8% minimum)
- ✅ Tighter trailing stops (0.3%)
- ✅ Higher position sizes (up to 40% of balance)
- ✅ More aggressive leverage (up to 15x)

See `AGGRESSIVE_PROFIT_TAKING_ACTIVATED.md` for full details.

## 🐛 Troubleshooting

### Common Issues

**Trading not executing:**
- Check agent wallet balances
- Verify API keys are set correctly
- Review logs in `x_signal_posting.log`
- Check circuit breaker status

**AI analysis failing:**
- Verify NVIDIA API key is valid
- Check API rate limits
- Review error logs
- Try alternative AI provider

**Trades showing as "Skipped":**
- Review AI market analysis output
- Check minimum trade requirements
- Verify market conditions meet criteria
- Increase position size limits

### Debug Commands

```bash
# Check scheduler status
yarn ts-node check-trading-scheduler.ts

# Check AsterDEX status
yarn ts-node check-asterdex-status.ts

# Clean up stuck trades
yarn ts-node close-stuck-trades.ts
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## ⚠️ Disclaimer

This software is for educational and research purposes. Cryptocurrency trading carries significant risk. Always:
- Trade with funds you can afford to lose
- Start with small position sizes
- Monitor your positions regularly
- Understand the risks involved
- Comply with local regulations

The developers are not responsible for any financial losses incurred through the use of this software.

## 📞 Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Review documentation in the repository
- Check existing guides and troubleshooting resources

## 🎯 Roadmap

- [ ] Multi-DEX arbitrage strategies
- [ ] Advanced MEV bot integration
- [ ] Mobile app for monitoring
- [ ] Enhanced social trading features
- [ ] Additional AI provider integrations
- [ ] Backtesting framework
- [ ] Strategy marketplace

---

**Built with ❤️ for the DeFi community**
