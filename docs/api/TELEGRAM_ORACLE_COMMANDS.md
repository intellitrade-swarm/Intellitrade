
# 🔮 Telegram Oracle Commands - Complete Guide

## Overview
Users can now access the full Defidash Intellitrade Oracle service directly through Telegram commands, getting real-time market data, AI analysis, and trading signals without leaving their chat app.

## Available Commands

### 🔔 Notification Commands
- `/start` - Activate trade notifications
- `/status` - Check your subscription status

### 🔮 Oracle Service Commands
- `/oracle [symbol]` - Full AI analysis with multi-provider insights
- `/price [symbol]` - Quick price and market data check
- `/trending` - View trending tokens by 24h volume
- `/stats` - Oracle network statistics

### ℹ️ General
- `/help` - Show all commands and help information

## Command Details

### `/oracle [symbol]`
**Get comprehensive AI analysis from multiple providers**

**Example:** `/oracle ETH`

**Response includes:**
- Current market price
- 24h change percentage
- 24h volume and liquidity
- AI insights from 4 providers (OpenAI, Grok, NVIDIA, Gemini)
- Individual sentiment, confidence, and recommendations
- Target prices and stop losses
- Aggregated trading signal (STRONG BUY/BUY/HOLD/SELL/STRONG SELL)
- Overall confidence score

**Use case:** 
- Before making trading decisions
- Getting multiple AI perspectives
- Understanding market sentiment

---

### `/price [symbol]`
**Quick price check and market stats**

**Example:** `/price BTC`

**Response includes:**
- Current price (6 decimal precision)
- 24h price change percentage
- 24h trading volume
- Liquidity information
- Real-time timestamp

**Use case:**
- Quick price checks
- Monitoring specific tokens
- Checking 24h performance

---

### `/trending`
**View trending tokens by volume**

**Example:** `/trending`

**Response includes:**
- Top 5 tokens by 24h volume
- Current prices
- 24h change percentages
- Trading volumes
- Visual indicators (🟢 for up, 🔴 for down)

**Use case:**
- Discovering hot tokens
- Finding trading opportunities
- Market overview

---

### `/stats`
**Oracle network statistics**

**Example:** `/stats`

**Response includes:**
- Oracle network status
- Total data points processed
- AI insights generated
- Trading signals issued
- Active symbols tracked
- Number of AI providers

**Use case:**
- Understanding platform metrics
- Verifying oracle activity
- Platform transparency

---

## How to Use

### 1. Initial Setup (For Notifications)
```
1. Go to intellitrade.xyz
2. Create an account or log in
3. Navigate to AI Arena section
4. Enter your Telegram username (e.g., @yourhandle)
5. Click "Subscribe to Notifications"
6. Message the bot: /start
```

### 2. Using Oracle Commands (No Setup Required)
Simply send any oracle command to the bot:
```
/price ETH
/oracle BTC
/trending
```

**No subscription needed for Oracle queries!**

## Example Workflows

### Workflow 1: Quick Token Check
```
You: /price SOL
Bot: 
🟢 SOL Price Data
💰 Current Price: $95.234567
📊 24h Statistics:
📈 Change: +5.23%
💵 Volume: $2,451,234,890
💧 Liquidity: $123,456,789
```

### Workflow 2: Deep Analysis Before Trading
```
You: /oracle ETH
Bot: 🔮 Oracle Analysis Loading...
[Few seconds later]
Bot:
🔮 ORACLE ANALYSIS: ETH

📊 Market Data
💰 Price: $2,450.123456
📈 24h Change: +3.45%
💵 24h Volume: $15,234,567,890
💧 Liquidity: $8,901,234,567

🤖 AI Analysis (4 Providers)

1. 🟢 OPENAI
   📈 BUY | Confidence: 82%
   Strong upward momentum with institutional buying...
   🎯 Target: $2,650.00

2. 🟢 GROK
   📈 BUY | Confidence: 78%
   Technical indicators showing bullish divergence...
   🎯 Target: $2,600.00

3. 🟡 NVIDIA
   ⏸️ HOLD | Confidence: 65%
   Market consolidation expected before next move...

4. 🟢 GEMINI
   📈 BUY | Confidence: 85%
   Network activity increasing, positive sentiment...
   🎯 Target: $2,700.00

🟢 AGGREGATED SIGNAL: BUY
📊 Confidence: 78%
💡 4 AI providers analyzed. 3 bullish, 0 bearish. 
Average confidence: 77.5%. Market shows positive momentum (+3.45% 24h).

⏰ Analysis generated at 11/04/2025, 10:30:15 AM
```

### Workflow 3: Market Discovery
```
You: /trending
Bot:
🔥 TRENDING TOKENS

Sorted by 24h trading volume

1. 🟢 ETH
   💰 Price: $2,450.123456
   📊 24h: +3.45%
   💵 Volume: $15,234,567,890

2. 🔴 BTC
   💰 Price: $65,432.12
   📊 24h: -1.23%
   💵 Volume: $28,901,234,567

[... more tokens ...]

Use /oracle [symbol] for detailed analysis
```

## Response Times
- **Price queries:** < 2 seconds
- **Oracle analysis:** 5-15 seconds (multiple AI providers)
- **Trending:** < 3 seconds
- **Stats:** < 1 second

## Error Handling
The bot handles errors gracefully:
- Token not found → Suggests checking symbol
- Analysis timeout → Retry message
- Network issues → Error notification
- Invalid commands → Shows help with examples

## Pro Tips

### 1. Symbol Formats
- Use standard trading symbols: `ETH`, `BTC`, `SOL`, `MATIC`
- Case insensitive: `/price eth` = `/price ETH`
- No need for trading pairs (e.g., just `ETH`, not `ETH/USD`)

### 2. Best Times to Use
- **Before trading:** Use `/oracle` for AI insights
- **During trading hours:** Use `/price` for quick checks
- **Morning routine:** Use `/trending` to see market movers
- **Regular intervals:** Use `/stats` to track oracle activity

### 3. Combining with Web App
- Use Telegram for quick on-the-go checks
- Use web app (intellitrade.xyz) for detailed charting
- Set up notifications for profitable trades
- Access Oracle via both interfaces

### 4. Speed Tips
- `/price` is fastest for price checks
- `/oracle` takes longer but provides deep insights
- Save frequently used commands in Telegram
- Use keyboard shortcuts for common queries

## Security & Privacy
- No API keys or credentials needed
- All queries are processed server-side
- Oracle data is real-time and verified
- Notification subscription requires account
- Commands work even without subscription

## Troubleshooting

### "Token Not Found"
- Check symbol spelling
- Try common symbols: ETH, BTC, SOL, USDC
- Use official token tickers

### "Analysis Failed"
- AI providers may be temporarily unavailable
- Try again in a few seconds
- Use `/price` as fallback

### Slow Responses
- Oracle analysis uses 4 AI providers (takes time)
- Use `/price` for instant responses
- Peak times may have slight delays

## Technical Details

### Data Sources
- **DexScreener:** Primary market data
- **1inch:** Price verification
- **AI Providers:** OpenAI, Grok, NVIDIA, Gemini

### Analysis Method
1. Fetch real-time market data
2. Query each AI provider with market context
3. Parse and structure AI responses
4. Aggregate insights into trading signals
5. Calculate confidence scores
6. Format and deliver via Telegram

### Signal Calculation
- **STRONG BUY:** ≥75% bullish, ≥70% confidence
- **BUY:** ≥60% bullish
- **HOLD:** 40-60% bullish
- **SELL:** ≤40% bullish
- **STRONG SELL:** ≤25% bullish, ≥70% confidence

## Integration with Web App

### Synced Features
- Same Oracle service as web app
- Same AI providers
- Same data sources
- Same signal logic

### Unique to Telegram
- Instant notifications
- Command-based interface
- Mobile-first experience
- No login required for Oracle queries

## Support & Feedback

### Getting Help
1. Use `/help` command in bot
2. Visit intellitrade.xyz/help
3. Check documentation
4. Contact support

### Reporting Issues
- Note the command used
- Screenshot the error
- Report via web app
- Include your Telegram username

## Roadmap

### Coming Soon
- Custom watchlists
- Price alerts
- Portfolio tracking
- Trade execution via Telegram
- Historical analysis
- Comparative analysis (e.g., `/compare ETH BTC`)

## Examples by Use Case

### Day Trader
```
Morning: /trending
During day: /price [symbol] (frequent checks)
Before trade: /oracle [symbol]
```

### Swing Trader
```
Weekly: /trending
Before entry: /oracle [symbol]
Position monitoring: /price [symbol]
```

### Research Analyst
```
Deep dives: /oracle [multiple symbols]
Market overview: /trending
Network health: /stats
```

### Casual Investor
```
Weekly: /trending
Before buying: /oracle [symbol]
Price checks: /price [symbol]
```

## Conclusion
The Telegram Oracle integration brings professional-grade market analysis and AI insights directly to your messaging app. Whether you need a quick price check or comprehensive multi-provider analysis, the bot delivers institutional-quality data in seconds.

**Get started now:** Message the bot and send `/help`

---

**Last Updated:** November 4, 2025  
**Status:** ✅ Live and Operational  
**Bot:** @YourBotHandle  
**Platform:** intellitrade.xyz
