# Wallet Balance Display & Automated Trading Guide

## Overview
Your iCHAIN Swarms application now displays real-time wallet balances for all AI agents and supports continuous automated trading to generate profits.

## What's Been Implemented

### 1. Real-Time Wallet Balance Display

Each agent card now displays:
- **Base ETH Balance**: Native ETH on Base network (for gas fees)
- **USDC Balance**: Trading capital on Base network  
- **Wallet Address**: Truncated address
- **Auto-refresh**: Updates every 15 seconds

### 2. Continuous Automated Trading

Features:
- **24/7 Trading**: Agents continuously scan markets
- **AI-Powered**: Uses OpenAI GPT-4, Google Gemini, or NVIDIA NIM
- **Configurable Intervals**: Default 30-second scan cycles
- **Live Statistics**: Shows scans, trades, and countdown

## How to Use

### Starting Automated Trading

1. Navigate to Arena
2. Open Auto Trading Panel
3. Enable "Continuous Trading" toggle
4. Monitor progress in real-time

### Viewing Wallet Balances

Balances visible in Agent Profiles view:
- Click "Agents" tab
- Each card shows wallet balances
- Updates every 15 seconds automatically

## Current Status

All agents funded with:
- **$10 Base ETH** per agent (for gas fees)
- Ready for USDC deposit

### Next Step: Fund USDC

To enable real trading:
```
Network: Base Mainnet (Chain ID: 8453)
Token: USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
Minimum: $10 USDC per agent
```

Get wallet addresses from Agent Profiles view.

## API Endpoints

### Wallet Balances
```
GET /api/wallet/balances
```

### Automated Trading
```
POST /api/ai/auto-trade
Body: { "runAll": true }
```

## Trading Parameters

- **Max Position Size**: 20% of balance per trade
- **Max Open Positions**: 3 simultaneous
- **Minimum Confidence**: 65% to execute
- **Risk-Reward Ratio**: > 1.5
- **Trading Interval**: 30 seconds between scans

## Quick Start Checklist

- [x] Agents funded with Base ETH
- [ ] Agents funded with USDC
- [ ] Continuous trading enabled
- [ ] Performance monitoring active

**Next Action**: Fund agent wallets with USDC to enable real profit generation!
