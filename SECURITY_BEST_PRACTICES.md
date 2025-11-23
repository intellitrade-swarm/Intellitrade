
# Security Best Practices for Trading System

## 🔒 Overview

This document outlines comprehensive security measures implemented in the iCHAIN Swarms trading platform. Our security architecture follows industry best practices for DeFi trading and cryptocurrency asset management.

## 🎯 Security Framework

### Core Security Principles
1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Minimal permissions for all components
3. **Zero Trust**: Verify everything, trust nothing
4. **Fail Secure**: Safe defaults and graceful degradation
5. **Continuous Monitoring**: Real-time threat detection

## 🔐 1. Private Key Management

### Current Implementation
```typescript
// Keys are encrypted at rest using AES-256-GCM
const encryptedKey = encryptPrivateKey(privateKey);
const decryptedKey = decryptPrivateKey(encryptedKey);
```

### Risk Matrix
| Risk Level | Threat | Mitigation Status |
|------------|--------|-------------------|
| 🔴 Critical | Key exposure in logs | ✅ Implemented |
| 🔴 Critical | Unencrypted storage | ✅ Implemented |
| 🟡 High | Memory dumps | ⚠️ Partial |
| 🟡 High | Process inspection | ⚠️ Partial |

### Recommended Upgrades

#### Level 1: AWS KMS Integration
```typescript
import { KMSClient, DecryptCommand } from "@aws-sdk/client-kms";

async function decryptWithKMS(encryptedKey: string): Promise<string> {
  const kms = new KMSClient({ region: 'us-east-1' });
  const command = new DecryptCommand({
    CiphertextBlob: Buffer.from(encryptedKey, 'base64'),
    KeyId: process.env.KMS_KEY_ID
  });
  const response = await kms.send(command);
  return Buffer.from(response.Plaintext!).toString('utf-8');
}
```

**Benefits:**
- Hardware-backed encryption
- Automatic key rotation
- AWS IAM access controls
- Audit logging

**Cost:** ~$1/month per key + $0.03 per 10,000 requests

#### Level 2: Fireblocks Integration
```typescript
import { FireblocksSDK } from 'fireblocks-sdk';

const fireblocks = new FireblocksSDK(apiKey, apiSecret);

async function createTransaction(params: TransactionParams) {
  return await fireblocks.createTransaction({
    operation: 'TRANSFER',
    source: { type: 'VAULT_ACCOUNT', id: vaultId },
    destination: { type: 'ONE_TIME_ADDRESS', address: toAddress },
    amount: amount,
    assetId: 'ETH'
  });
}
```

**Benefits:**
- Institutional-grade security
- MPC (Multi-Party Computation) wallets
- No single point of failure
- Compliance features

**Cost:** Enterprise pricing (contact Fireblocks)

#### Level 3: TEE (Trusted Execution Environment)
```typescript
// Example using Intel SGX
import { initEnclave } from '@fortanix/sgx';

const enclave = await initEnclave('trading-enclave');
const result = await enclave.call('sign_transaction', {
  transaction: txData,
  keyId: 'agent-wallet-001'
});
```

**Benefits:**
- Hardware-isolated execution
- Memory encryption
- Remote attestation
- Zero-knowledge proofs

**Cost:** Infrastructure dependent

## 🛡️ 2. MEV Protection

### What is MEV?
Maximal Extractable Value (MEV) refers to profits that can be extracted by reordering, including, or censoring transactions within a block.

### Attack Vectors
1. **Front-running**: Attacker sees your pending transaction and submits a similar one with higher gas
2. **Back-running**: Attacker's transaction executes right after yours to profit from price impact
3. **Sandwich Attack**: Combination of front-running + back-running

### Mitigation Strategies

#### Strategy 1: 1inch Fusion Mode
```typescript
const config = {
  mevProtection: {
    enabled: true,
    method: 'fusion'
  }
};

// 1inch Fusion automatically:
// - Splits orders across multiple DEXs
// - Uses Dutch auctions for best price
// - Protects against sandwich attacks
```

**Pros:**
- ✅ No extra configuration needed
- ✅ Built into 1inch API
- ✅ Free to use

**Cons:**
- ⚠️ Slight execution delay
- ⚠️ Not available on all chains

#### Strategy 2: Flashbots Protect (Ethereum Only)
```typescript
import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';

const flashbotsProvider = await FlashbotsBundleProvider.create(
  provider,
  signer,
  'https://relay.flashbots.net'
);

const bundle = await flashbotsProvider.sendBundle([
  { signedTransaction: signedTx }
], targetBlockNumber);
```

**Pros:**
- ✅ Transactions never enter public mempool
- ✅ No failed transaction costs
- ✅ Direct to miners

**Cons:**
- ⚠️ Ethereum mainnet only
- ⚠️ Requires bundle creation
- ⚠️ Longer confirmation times

#### Strategy 3: Private RPC
```typescript
// Use private RPC endpoints
const provider = new ethers.JsonRpcProvider(
  'https://private-rpc.example.com/your-key'
);

// Transactions sent here don't hit public mempool
```

**Providers:**
- Alchemy Private RPC
- Infura Private Transaction API
- Eden Network
- bloXroute

## 💧 3. Slippage Protection

### Understanding Slippage
Slippage is the difference between expected trade price and actual execution price.

### Risk Levels
| Slippage | Risk | Action |
|----------|------|--------|
| < 0.1% | Low | ✅ Safe |
| 0.1-0.5% | Medium | ⚠️ Monitor |
| 0.5-1% | High | 🚨 Alert |
| > 1% | Critical | ❌ Reject |

### Implementation
```typescript
export const SLIPPAGE_CONFIG = {
  maxBasisPoints: 50, // 0.5% max
  alertThreshold: 30, // Alert at 0.3%
  
  // Trade size based limits
  sizeBasedLimits: [
    { maxSize: 1000, maxSlippage: 0.2 },   // Small trades
    { maxSize: 5000, maxSlippage: 0.5 },   // Medium trades
    { maxSize: 10000, maxSlippage: 1.0 },  // Large trades
  ]
};

function calculateMaxSlippage(tradeSize: number): number {
  for (const limit of SLIPPAGE_CONFIG.sizeBasedLimits) {
    if (tradeSize <= limit.maxSize) {
      return limit.maxSlippage;
    }
  }
  return SLIPPAGE_CONFIG.maxBasisPoints / 100;
}
```

### Advanced Protection
```typescript
// Price impact estimation before trade
async function estimatePriceImpact(
  symbol: string,
  amount: number
): Promise<number> {
  const quote = await getQuote(chain, tokenIn, tokenOut, amount);
  const spotPrice = await getCurrentPrice(symbol);
  
  const priceImpact = Math.abs(
    (quote.executionPrice - spotPrice) / spotPrice
  );
  
  if (priceImpact > 0.01) { // 1% impact
    console.warn(`⚠️ High price impact: ${priceImpact * 100}%`);
  }
  
  return priceImpact;
}
```

## ⛽ 4. Gas Management

### Dynamic Gas Pricing
```typescript
import { ethers } from 'ethers';

async function getOptimalGasPrice(
  provider: ethers.Provider
): Promise<bigint> {
  const feeData = await provider.getFeeData();
  
  // EIP-1559 chains
  if (feeData.maxFeePerGas) {
    return feeData.maxFeePerGas;
  }
  
  // Legacy gas pricing
  return feeData.gasPrice || BigInt(20e9); // 20 gwei fallback
}

// Gas price limits
const GAS_LIMITS = {
  normal: 50, // gwei
  urgent: 100,
  emergency: 200
};

function shouldExecuteTrade(gasPriceGwei: number): boolean {
  if (gasPriceGwei > GAS_LIMITS.emergency) {
    console.error('⛽ Gas too high, skipping trade');
    return false;
  }
  
  if (gasPriceGwei > GAS_LIMITS.urgent) {
    console.warn('⚠️ Gas price elevated');
  }
  
  return true;
}
```

### Gas Optimization
```typescript
// Batch transactions to save gas
async function batchTrades(trades: Trade[]): Promise<string[]> {
  const bundle = trades.map(trade => ({
    to: trade.contract,
    data: trade.calldata,
    value: trade.value
  }));
  
  // Use multicall to execute all at once
  const tx = await multicall.aggregate(bundle);
  return tx.wait();
}
```

## 🎯 5. Smart Contract Security

### Contract Interaction Safety
```typescript
// Whitelist verified contracts only
const APPROVED_CONTRACTS = {
  '1inch_router_v5': '0x1111111254EEB25477B68fb85Ed929f73A960582',
  '1inch_router_v6': '0x111111125421cA6dc452d289314280a0f8842A65',
};

function verifyContract(address: string): boolean {
  const approved = Object.values(APPROVED_CONTRACTS);
  return approved.includes(address.toLowerCase());
}

// Verify before interaction
async function safeContractCall(
  address: string,
  method: string,
  params: any[]
) {
  if (!verifyContract(address)) {
    throw new Error('Unauthorized contract interaction');
  }
  
  // Additional checks
  const code = await provider.getCode(address);
  if (code === '0x') {
    throw new Error('Contract not deployed');
  }
  
  return contract[method](...params);
}
```

### Token Verification
```typescript
interface TokenMetadata {
  address: string;
  symbol: string;
  decimals: number;
  verified: boolean;
  holders: number;
}

async function verifyToken(address: string): Promise<TokenMetadata> {
  // Check against token registry
  const metadata = await fetchTokenMetadata(address);
  
  if (!metadata.verified) {
    throw new Error('Unverified token');
  }
  
  if (metadata.holders < 1000) {
    console.warn('⚠️ Low liquidity token');
  }
  
  return metadata;
}
```

## 🚨 6. Monitoring & Alerting

### Real-time Monitoring
```typescript
interface TradingMetrics {
  totalVolume: number;
  failedTrades: number;
  avgSlippage: number;
  avgGasUsed: number;
  suspiciousActivity: boolean;
}

async function monitorTradingActivity(): Promise<TradingMetrics> {
  const trades = await prisma.trade.findMany({
    where: {
      entryTime: { gte: new Date(Date.now() - 3600000) } // Last hour
    }
  });
  
  const metrics: TradingMetrics = {
    totalVolume: trades.reduce((sum, t) => sum + (t.quantity * t.entryPrice), 0),
    failedTrades: trades.filter(t => t.status === 'FAILED').length,
    avgSlippage: calculateAvgSlippage(trades),
    avgGasUsed: calculateAvgGas(trades),
    suspiciousActivity: detectAnomalies(trades)
  };
  
  if (metrics.suspiciousActivity) {
    await sendAlert('CRITICAL', 'Suspicious trading activity detected', metrics);
  }
  
  return metrics;
}
```

### Alert System
```typescript
enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

async function sendAlert(
  severity: AlertSeverity,
  message: string,
  data?: any
) {
  const alert = {
    severity,
    message,
    timestamp: new Date(),
    data
  };
  
  // Log to database
  await prisma.securityAlert.create({ data: alert });
  
  // Send notifications based on severity
  if (severity === AlertSeverity.CRITICAL) {
    await sendPagerDutyAlert(alert);
    await sendSlackAlert(alert);
    await sendEmailAlert(alert);
  } else if (severity === AlertSeverity.HIGH) {
    await sendSlackAlert(alert);
  }
  
  // Log to monitoring service
  console.error(`🚨 [${severity.toUpperCase()}]`, message, data);
}
```

## 📊 7. Rate Limiting

### API Rate Limiting
```typescript
import { RateLimiter } from 'limiter';

// 30 requests per minute per agent
const limiter = new RateLimiter({
  tokensPerInterval: 30,
  interval: 'minute'
});

async function rateLimitedTrade(agentId: string) {
  const allowed = await limiter.removeTokens(1);
  
  if (!allowed) {
    throw new Error('Rate limit exceeded. Try again later.');
  }
  
  return executeTrade();
}
```

### Chain-specific Limits
```typescript
const CHAIN_RATE_LIMITS = {
  ethereum: {
    maxTxPerBlock: 1, // Don't spam blocks
    cooldownMs: 15000 // Wait 15s between trades
  },
  base: {
    maxTxPerBlock: 2,
    cooldownMs: 2000
  },
  bsc: {
    maxTxPerBlock: 3,
    cooldownMs: 3000
  }
};
```

## 🔍 8. Audit Logging

### Comprehensive Logging
```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  agentId: string;
  action: string;
  parameters: any;
  result: 'success' | 'failure';
  txHash?: string;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

async function logTrade(trade: AuditLog) {
  await prisma.auditLog.create({ data: trade });
  
  // Also send to external audit service
  await sendToAuditService(trade);
}
```

## 🛠️ Implementation Checklist

### Pre-Production
- [ ] Enable private key encryption
- [ ] Configure slippage limits (0.5% max)
- [ ] Set up gas price monitoring
- [ ] Implement rate limiting
- [ ] Enable audit logging
- [ ] Set up alert system
- [ ] Configure MEV protection
- [ ] Whitelist approved contracts

### Production
- [ ] Upgrade to AWS KMS or Fireblocks
- [ ] Enable Flashbots Protect (Ethereum)
- [ ] Set up 24/7 monitoring
- [ ] Configure incident response
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] Bug bounty program

## 📈 Security Metrics

### Key Performance Indicators
```typescript
interface SecurityMetrics {
  // Authentication
  failedLoginAttempts: number;
  suspiciousIPs: string[];
  
  // Trading
  rejectedTradesHighGas: number;
  rejectedTradesHighSlippage: number;
  mevAttacksBlocked: number;
  
  // System
  uptimePercentage: number;
  avgResponseTime: number;
  alertsTriggered: number;
}
```

## 🎓 Security Training

### Team Guidelines
1. **Never** log private keys or sensitive data
2. **Always** use environment variables for secrets
3. **Verify** contract addresses before deployment
4. **Monitor** for unusual trading patterns
5. **Update** dependencies regularly
6. **Test** security measures in staging first

## 📞 Incident Response

### Security Incident Procedure
1. **Detect**: Automated alerts or manual discovery
2. **Contain**: Pause affected services immediately
3. **Investigate**: Analyze logs and metrics
4. **Remediate**: Fix vulnerability and deploy patch
5. **Review**: Post-mortem and lessons learned

### Emergency Contacts
- Security Team: security@example.com
- On-Call Engineer: +1-XXX-XXX-XXXX
- AWS Support: Enterprise plan
- 1inch Support: portal.1inch.dev

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-27  
**Next Review:** 2025-11-27  
**Owner:** Security Team

