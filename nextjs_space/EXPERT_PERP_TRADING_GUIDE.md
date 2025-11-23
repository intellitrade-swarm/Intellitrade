
# 🎯 Expert Perpetual Trading Guide for Aster DEX

## Overview

This guide documents the expert-level perpetual trading strategies implemented for AI agents on Aster DEX, based on professional trading methodologies from industry experts.

## 🚀 Key Features

### 1. Advanced Technical Indicators

**RSI (Relative Strength Index)**
- Measures momentum (0-100 scale)
- > 70: Overbought (potential SHORT signal)
- < 30: Oversold (potential LONG signal)
- 14-period default

**Volatility Calculation**
- Standard deviation of price returns
- Used to adjust position sizing and leverage
- High vol (>5%): Reduced leverage
- Low vol (<2%): Full leverage allowed

**Volume Imbalance**
- Measures deviation from average volume
- Normalized to -1 to +1 scale
- > 0.3: Strong buying interest
- < -0.3: Strong selling pressure

**Momentum Indicators**
- 5-minute momentum: Short-term trends
- 15-minute momentum: Medium-term trends
- Used for entry/exit timing

### 2. Expert Trading Strategies

#### Strategy 1: Funding Rate Arbitrage
```
Entry Conditions:
- Funding rate < -0.01 (negative = shorts pay longs)
- RSI < 50 (not overbought)
- 15min momentum > -0.005 (no strong downtrend)

Action: LONG
Leverage: 5x
Stop Loss: 1.5% below entry
Take Profit: 3% above entry

Reasoning: Earn funding payments while holding long position
```

#### Strategy 2: Volatility Breakout
```
Entry Conditions:
- 3-sigma price move detected (3 standard deviations)
- Direction: Follow the breakout (UP = LONG, DOWN = SHORT)

Action: LONG or SHORT (based on direction)
Leverage: 3x (conservative for high volatility)
Stop Loss: 1.5%
Take Profit: 5%

Reasoning: Capture momentum from significant price moves
```

#### Strategy 3: Momentum Trading
```
LONG Entry:
- 15min momentum > 0.01 (+1%)
- RSI between 45-70
- Volume imbalance > 0.3

SHORT Entry:
- 15min momentum < -0.01 (-1%)
- RSI between 30-55
- Volume imbalance > 0.3

Leverage: 7x
Stop Loss: 1.5%
Take Profit: 4%

Reasoning: Ride strong directional moves with volume confirmation
```

#### Strategy 4: Mean Reversion
```
SHORT Entry:
- RSI > 75 (strongly overbought)
- Volatility > 3% (stretched price)

LONG Entry:
- RSI < 25 (strongly oversold)
- Volatility > 3% (stretched price)

Leverage: 5x
Stop Loss: 1.5%
Take Profit: 3%

Reasoning: Profit from price reversion to mean
```

### 3. Advanced Risk Management

**Circuit Breakers**
- Auto-halt trading if drawdown > 10%
- Stop trading after 5 consecutive losses
- Requires manual reset to resume

**Position Sizing**
- Kelly Criterion for optimal sizing
- 25% fractional Kelly for safety
- Max 30% of capital per position
- Scaled by confidence level

**Dynamic Leverage**
- Volatility-adjusted leverage
- Low vol (<2%): Full leverage
- Medium vol (2-5%): 70% of base
- High vol (>5%): 40% of base
- Max leverage: 10x

**Stop Loss Management**
- Tighter stop: 1.5% (vs previous 3%)
- Auto-close on stop hit
- No exceptions or manual overrides

## 📊 Technical Implementation

### Price Data Sources (Priority Order)
1. **Pyth Oracle** - Real-time, 1-2 second edge over CEXs
2. **Aster DEX API** - `/fapi/v1/klines` for historical data
3. **TheGraph Subgraph** - On-chain trading data

### Hidden Orders Feature
- Available on Aster DEX
- Prevents MEV/front-running
- Recommended for all trades > $1000

## 🎓 Expert Best Practices

### Before Going Live
1. **Backtest Everything**
   - Minimum 30 days historical data
   - Sharpe ratio > 1.5 required
   - Max drawdown < 15%

2. **Start Small**
   - Begin with $10-50 positions
   - Scale up only after 20+ profitable trades
   - Never risk more than 2% per trade

3. **Monitor Key Metrics**
   - Win rate (target: > 55%)
   - Risk/reward ratio (target: > 1.5)
   - Maximum drawdown
   - Sharpe ratio

### Risk Management Rules
1. Never exceed 30% capital per position
2. Max 10x leverage (reduce in high volatility)
3. Always use stop losses (1.5%)
4. Close all positions on circuit breaker trigger
5. Review strategy after every 10 trades

### Market Conditions
- **Bull Market**: Focus on momentum longs, funding arb
- **Bear Market**: Focus on shorts, mean reversion
- **Sideways Market**: Focus on range trading, funding arb
- **High Volatility**: Reduce leverage, widen stops slightly

## 🚨 Warning Signs to Stop Trading

1. **Drawdown > 10%** - Circuit breaker auto-triggers
2. **5 consecutive losses** - Strategy may be broken
3. **Low liquidity** - Slippage > 0.5%
4. **Extreme volatility** - Volatility > 10%
5. **Funding rate manipulation** - Rates > 0.1% or < -0.1%

## 📈 Performance Targets

### Minimum Viable Performance
- Monthly return: > 5%
- Win rate: > 50%
- Sharpe ratio: > 1.0
- Max drawdown: < 15%

### Excellent Performance
- Monthly return: > 15%
- Win rate: > 60%
- Sharpe ratio: > 2.0
- Max drawdown: < 10%

## 🔧 Monitoring & Maintenance

### Daily Tasks
- Check circuit breaker status
- Review open positions
- Monitor funding rates
- Check for API connectivity issues

### Weekly Tasks
- Analyze win/loss ratio
- Review strategy performance
- Adjust risk parameters if needed
- Update market condition assessment

### Monthly Tasks
- Full strategy backtest
- Performance review vs benchmarks
- Risk parameter optimization
- Capital rebalancing

## 📚 References

- Aster DEX Documentation: https://docs.aster-dex.trade
- Pyth Network: https://pyth.network
- Kelly Criterion: https://en.wikipedia.org/wiki/Kelly_criterion
- RSI: https://www.investopedia.com/terms/r/rsi.asp
- Volatility Trading: https://www.investopedia.com/terms/v/volatility.asp

## ⚖️ Legal Disclaimer

Trading perpetual futures is extremely risky. You can lose more than your initial investment due to leverage. This software is provided "AS IS" without warranty. The developers are not responsible for trading losses. Trade at your own risk.

**Important:**
- Start with small amounts ($10-50)
- Never use leverage you can't afford to lose
- Always use stop losses
- Keep emergency funds separate from trading capital
- Consider this highly experimental software

---

**Last Updated:** October 28, 2025
**Version:** 1.0 - Expert Strategies Implementation
