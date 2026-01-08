# 🏛️ Agent Governance & Staking - Quick Start

**Status:** ✅ Live at https://intellitrade.xyz/governance  
**Date:** November 18, 2025

---

## 🎯 What We Built

A complete **DeFAI governance system** with blockchain-verified agent IDs, community voting, and performance-based staking.

---

## ✅ Components

### 1. Database (6 New Models)
- **AgentBlockchainID** - On-chain identity with spending rules
- **GovernanceProposal** - Community proposals for voting
- **GovernanceVote** - Stake-weighted voting records
- **AgentStaking** - User stakes on agents
- **StakingReward** - Performance-based rewards (10-40% APY)
- **AgentAuditLog** - Immutable action history

### 2. Backend (700+ lines)
- Core governance library (`lib/agent-governance.ts`)
- 14 API endpoints across 3 categories:
  - `/api/agent-governance/*` (4 routes)
  - `/api/agent-staking/*` (5 routes)
  - `/api/agent-blockchain/*` (3 routes)

### 3. Frontend
- Governance dashboard at `/governance`
- 4 tabs: Overview, Governance, Staking, Audit Trail
- Added to main navigation (7 items now)

---

## 🚀 Quick Test

### 1. Visit Governance Page
```
https://intellitrade.xyz/governance
```

### 2. Create Blockchain ID (API)
```bash
curl -X POST https://intellitrade.xyz/api/agent-blockchain/mint-id \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "cmh6ak01r0001wf83gk4eauhf",
    "chain": "base",
    "spendingCap": 5000,
    "dailySpendingCap": 10000,
    "allowedStrategies": ["MOMENTUM", "ARBITRAGE"]
  }'
```

### 3. Create Proposal (API)
```bash
curl -X POST https://intellitrade.xyz/api/agent-governance/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Increase Spending Cap",
    "description": "Agent proven profitable",
    "proposalType": "SPENDING_CAP",
    "targetAgentId": "cmh6ak01r0001wf83gk4eauhf",
    "proposedChanges": {"spendingCap": 10000},
    "votingDuration": 48
  }'
```

### 4. Stake on Agent (API)
```bash
curl -X POST https://intellitrade.xyz/api/agent-staking/stake \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user",
    "userAddress": "0x...",
    "agentId": "cmh6ak01r0001wf83gk4eauhf",
    "amount": 1000,
    "lockPeriod": 30
  }'
```

---

## 💰 Staking Rewards

**Base APY:** 10%  
**PnL Improvement Bonus:** Up to 20%  
**Win Rate Improvement Bonus:** Up to 10%  
**Total Possible APY:** 10-40%

### Example
```
Stake: $1000 for 30 days
Agent improves PnL by 10% and win rate by 5%
APY: 10% + 10% + 5% = 25%
Reward: $20.55
```

---

## 🔐 Security Features

✅ **Spending Caps** - Single trade + daily limits  
✅ **Quorum Voting** - 10% of staked tokens must vote  
✅ **Super-majority** - 66% yes votes to pass  
✅ **Audit Trail** - Hash chain verification  
✅ **Social Recovery** - Community-based access recovery  

---

## 📊 Key Features

1. **Blockchain-Verified IDs** - Every agent has on-chain identity
2. **Community Governance** - Stake-weighted voting on parameters
3. **Performance Staking** - Earn from agent success
4. **Audit Trails** - Transparent, verifiable history
5. **Social Recovery** - No single point of failure

---

## 📚 Documentation

- **Complete Guide:** `AGENT_GOVERNANCE_COMPLETE.md`
- **Technical Summary:** `AGENT_GOVERNANCE_SYSTEM_SUMMARY.md`
- **This File:** Quick reference

---

## 🎯 Navigation

1. Visit https://intellitrade.xyz
2. Click **"Governance"** button (7th in nav)
3. Explore tabs: Overview, Governance, Staking, Audit Trail

---

**Deployed:** November 18, 2025  
**Checkpoint:** "Add blockchain governance and staking system"  
**Status:** ✅ Production ready
