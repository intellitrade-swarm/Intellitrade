# 📊 Performance Tracking System Guide

## Overview
The Performance Tracking System has been fully integrated into the iCHAIN Swarms platform, providing comprehensive real-time performance metrics for all AI trading agents.

---

## ✨ What's New

### 1. Performance Overview Dashboard
A prominent new section on the main Arena page displaying:
- **Total Trades**: All executed trades across all agents
- **Open Trades**: Currently active positions
- **Total P&L**: Combined realized + unrealized profit/loss
- **Average Win Rate**: Success rate across all agents
- **Average Sharpe Ratio**: Risk-adjusted performance metric

### 2. Real-Time Performance Metrics
- **Realized P&L**: Profit/loss from closed trades
- **Unrealized P&L**: Current profit/loss on open positions
- **Live Updates**: Metrics refresh every 10 seconds automatically
- **Top Performer**: Highlights the best-performing agent
- **Performance Leaderboard**: Ranks all agents by total P&L

### 3. Performance Calculation Engine

#### New Files Created:
```
lib/performance-tracker.ts
app/api/performance/update/route.ts
app/api/performance/live/route.ts
app/arena/components/performance-overview.tsx
scripts/update-performance-metrics.ts
```

#### Metrics Tracked:
- **Total Trades**: Number of completed trades
- **Wins/Losses**: Count of profitable vs losing trades
- **Win Rate**: Percentage of winning trades
- **Total P&L**: Net profit or loss
- **Sharpe Ratio**: Risk-adjusted returns
- **Max Drawdown**: Largest peak-to-trough decline
- **Unrealized P&L**: Real-time profit/loss on open positions

---

## 🚀 How to Use

### Viewing Performance
1. Navigate to the Arena page: `https://ipollswarms.abacusai.app/arena`
2. Performance Overview appears at the top of the page
3. Metrics auto-refresh every 10 seconds

### Manual Performance Update
Click the **"Refresh Metrics"** button to:
- Recalculate all performance metrics
- Update agent statistics
- Create performance snapshots

### Command Line Update
Update performance metrics for all agents:
```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
yarn tsx --require dotenv/config scripts/update-performance-metrics.ts
```

---

## 📈 Performance Display Features

### 1. Aggregate Metrics Cards
Four key metric cards at the top:
- **Total Trades** with open trade count
- **Total P&L** with unrealized breakdown
- **Average Win Rate** across all agents
- **Average Sharpe Ratio** for risk assessment

### 2. Top Performer Card
Highlights the best-performing agent with:
- Agent name and strategy
- Total P&L (realized + unrealized)
- Total and open trade counts
- Unrealized P&L breakdown

### 3. Win/Loss Distribution
Visual representation of:
- Total wins vs losses
- Progress bar showing win ratio
- Color-coded for easy reading

### 4. Performance Leaderboard
Complete ranking of all agents showing:
- Position ranking (1st, 2nd, 3rd get special badges)
- Agent name and strategy type
- Total P&L with unrealized breakdown
- Trade counts and open positions

---

## 🔧 Technical Implementation

### Performance Calculation
```typescript
// Calculate performance for an agent
await calculateAgentPerformance(agentId)

// Update database with latest metrics
await updateAgentPerformance(agentId)

// Update all agents
await updateAllAgentPerformance()
```

### Unrealized P&L Calculation
Calculates live profit/loss on open trades:
```typescript
unrealizedPnL = (currentPrice - entryPrice) × quantity × multiplier
```
where multiplier is +1 for BUY positions, -1 for SELL positions

### Real-Time Updates
- Live performance API fetches every 10 seconds
- Calculates unrealized P&L using current market prices
- Updates UI without page refresh

---

## 📊 API Endpoints

### GET `/api/performance/live`
Returns real-time performance with unrealized P&L:
```json
{
  "agents": [
    {
      "id": "...",
      "name": "Arbitrage Ace",
      "totalProfitLoss": 125.50,
      "unrealizedPnL": 32.25,
      "totalPnL": 157.75,
      "totalTrades": 45,
      "openTrades": 3,
      "winRate": 0.72,
      "sharpeRatio": 1.85
    }
  ],
  "currentPrices": {
    "ETHUSDT": 4100,
    "BTCUSDT": 95000
  }
}
```

### POST `/api/performance/update`
Recalculates and updates performance metrics for all agents.

---

## 🎯 Performance Metrics Explained

### Win Rate
```
Win Rate = (Total Wins / Total Trades) × 100%
```
Percentage of trades that resulted in profit.

### Sharpe Ratio
```
Sharpe Ratio = Average Return / Standard Deviation
```
Measures risk-adjusted performance. Higher is better.
- **< 1.0**: Below average
- **1.0 - 2.0**: Good
- **> 2.0**: Excellent

### Max Drawdown
```
Max Drawdown = (Peak - Trough) / Peak
```
Largest percentage decline from peak equity. Lower is better.
- **< 10%**: Excellent risk management
- **10% - 20%**: Acceptable
- **> 20%**: High risk

### Total P&L
```
Total P&L = Realized P&L + Unrealized P&L
```
Complete picture of agent performance including open positions.

---

## 🔄 Automatic Updates

Performance metrics update automatically:
1. **Every 10 seconds**: Live performance data with unrealized P&L
2. **On page load**: Initial metrics fetched from database
3. **On trade close**: Performance recalculated and saved
4. **Manual refresh**: Click "Refresh Metrics" button

---

## 🎨 Visual Indicators

### Color Coding
- **Green**: Positive P&L, profits
- **Red**: Negative P&L, losses
- **Blue**: Neutral metrics (trades, win rate)
- **Purple**: Sharpe ratio
- **Yellow**: Top performer

### Ranking Badges
- **🥇 1st Place**: Gold badge
- **🥈 2nd Place**: Silver badge
- **🥉 3rd Place**: Bronze badge
- **4-6**: Gray badges

---

## 📝 Database Schema

### AIAgent Model
```prisma
model AIAgent {
  totalTrades       Int     @default(0)
  totalWins         Int     @default(0)
  totalLosses       Int     @default(0)
  winRate           Float   @default(0)
  totalProfitLoss   Float   @default(0)
  sharpeRatio       Float   @default(0)
  maxDrawdown       Float   @default(0)
  realBalance       Float   @default(0)
}
```

### PerformanceMetric Model
```prisma
model PerformanceMetric {
  id              String   @id @default(cuid())
  agentId         String
  timestamp       DateTime @default(now())
  balance         Float
  totalTrades     Int
  winRate         Float
  profitLoss      Float
  sharpeRatio     Float
  maxDrawdown     Float
}
```

---

## 🐛 Troubleshooting

### No Performance Data Showing
1. Check if agents have any closed trades
2. Run manual performance update:
   ```bash
   yarn tsx --require dotenv/config scripts/update-performance-metrics.ts
   ```
3. Click "Refresh Metrics" button on UI

### Unrealized P&L Not Updating
1. Verify agents have open trades
2. Check if market prices are being fetched
3. Wait for automatic refresh (10 seconds)

### Performance Seems Incorrect
1. Verify trades have proper entry/exit prices
2. Check that profitLoss is calculated on trade close
3. Run performance recalculation script

---

## 🎯 Current Status

### Active Agents with Performance:
- **Arbitrage Ace**: 4 trades, 0 closed
- **Reversion Hunter**: 6 trades, 0 closed
- **Neural Nova**: 0 trades
- **Technical Titan**: 1 trade, 1 closed
- **Sentiment Sage**: 3 trades, 0 closed
- **Momentum Master**: 4 trades, 0 closed

### Live Trading Status:
- **Total Open Trades**: 6 positions
- **Real Trading**: Active on AsterDEX
- **Trading Interval**: Every 15 minutes
- **Next Cycle**: Automated

---

## 📚 Next Steps

To see meaningful performance metrics:
1. **Wait for trades to close**: Realized P&L requires closed trades
2. **Monitor unrealized P&L**: Shows current profit/loss on open positions
3. **Watch the leaderboard**: Rankings update as agents trade
4. **Check regularly**: Performance compounds over time

---

## 🎉 Key Benefits

1. **Real-Time Visibility**: See exactly how agents are performing
2. **Risk Assessment**: Sharpe ratio and max drawdown show risk levels
3. **Performance Comparison**: Leaderboard ranks agents objectively
4. **Unrealized Tracking**: Know current position values before closing
5. **Historical Snapshots**: PerformanceMetric records for analysis

---

## 📞 Support

For questions or issues with performance tracking:
1. Check the troubleshooting section above
2. Review agent trades to ensure proper execution
3. Verify database contains trade records
4. Contact support if metrics seem persistently incorrect

---

**Last Updated**: October 28, 2025
**System Status**: ✅ Operational
**Build Status**: ✅ Successfully Deployed
