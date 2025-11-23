
/**
 * Security Configuration for Trading System
 * Implements industry best practices for DeFi trading security
 */

export interface SecurityConfig {
  // Private Key Protection
  keyManagement: 'encrypted' | 'kms' | 'fireblocks' | 'tee';
  encryptionAlgorithm: string;
  
  // MEV Protection
  mevProtection: {
    enabled: boolean;
    method: 'flashbots' | 'fusion' | 'none';
    rpcEndpoint?: string;
  };
  
  // Slippage Protection
  slippage: {
    maxBasisPoints: number; // 50 = 0.5%
    alertThreshold: number;
  };
  
  // Gas Management
  gas: {
    strategy: 'dynamic' | 'fixed';
    maxGweiAllowed: number;
    priorityFee: number;
  };
  
  // Transaction Limits
  limits: {
    maxTradeUsd: number;
    maxDailyTradesPerAgent: number;
    minBalanceBuffer: number; // Keep this much for gas
  };
  
  // Rate Limiting
  rateLimit: {
    maxRequestsPerMinute: number;
    cooldownSeconds: number;
  };
}

/**
 * PRODUCTION SECURITY CONFIGURATION
 * This is the recommended configuration for real trading
 */
export const PRODUCTION_SECURITY: SecurityConfig = {
  keyManagement: 'encrypted', // Use KMS for production
  encryptionAlgorithm: 'AES-256-GCM',
  
  mevProtection: {
    enabled: true,
    method: 'fusion', // 1inch Fusion Mode
  },
  
  slippage: {
    maxBasisPoints: 50, // 0.5% maximum slippage
    alertThreshold: 30, // Alert if slippage > 0.3%
  },
  
  gas: {
    strategy: 'dynamic',
    maxGweiAllowed: 100, // Reject if gas > 100 gwei
    priorityFee: 2, // 2 gwei priority
  },
  
  limits: {
    maxTradeUsd: 10000, // $10k max per trade
    maxDailyTradesPerAgent: 50,
    minBalanceBuffer: 0.01, // Keep 0.01 ETH for gas
  },
  
  rateLimit: {
    maxRequestsPerMinute: 30,
    cooldownSeconds: 2,
  },
};

/**
 * DEVELOPMENT SECURITY CONFIGURATION
 * More relaxed for testing
 */
export const DEVELOPMENT_SECURITY: SecurityConfig = {
  keyManagement: 'encrypted',
  encryptionAlgorithm: 'AES-256-GCM',
  
  mevProtection: {
    enabled: false,
    method: 'none',
  },
  
  slippage: {
    maxBasisPoints: 100, // 1% for testing
    alertThreshold: 50,
  },
  
  gas: {
    strategy: 'dynamic',
    maxGweiAllowed: 200,
    priorityFee: 1,
  },
  
  limits: {
    maxTradeUsd: 1000,
    maxDailyTradesPerAgent: 100,
    minBalanceBuffer: 0.001,
  },
  
  rateLimit: {
    maxRequestsPerMinute: 60,
    cooldownSeconds: 1,
  },
};

/**
 * Get security configuration based on environment
 */
export function getSecurityConfig(): SecurityConfig {
  const isProd = process.env.NODE_ENV === 'production';
  return isProd ? PRODUCTION_SECURITY : DEVELOPMENT_SECURITY;
}

/**
 * Security Best Practices Documentation
 */
export const SECURITY_BEST_PRACTICES = {
  privateKeys: {
    risk: 'Private key exposure can lead to complete loss of funds',
    fixes: [
      'Use AWS KMS or similar key management service',
      'Implement Fireblocks for institutional-grade security',
      'Consider TEE (Trusted Execution Environment) based wallets',
      'Never log or expose private keys in any form',
      'Use hardware security modules (HSM) for critical operations'
    ]
  },
  
  mevProtection: {
    risk: 'Front-running and sandwich attacks can steal profits',
    fixes: [
      'Use 1inch Fusion Mode for MEV protection',
      'Submit transactions via Flashbots Protect (Ethereum)',
      'Use private RPC endpoints to avoid public mempool',
      'Set appropriate slippage limits to prevent sandwich attacks'
    ]
  },
  
  slippage: {
    risk: 'Excessive slippage can result in significant losses',
    fixes: [
      'Set maximum slippage to 0.5% for production',
      'Use limit orders when possible',
      'Monitor and alert on high slippage events',
      'Consider breaking large trades into smaller chunks'
    ]
  },
  
  gasGriefing: {
    risk: 'Malicious actors can cause transactions to fail and waste gas',
    fixes: [
      'Use dynamic gas pricing based on network conditions',
      'Set maximum gas price limits',
      'Implement gas estimation before trade execution',
      'Monitor network congestion and adjust strategies'
    ]
  },
  
  smartContractRisk: {
    risk: 'Interacting with malicious or vulnerable contracts',
    fixes: [
      'Only interact with audited and verified contracts',
      'Use established DEX aggregators (1inch, Jupiter)',
      'Implement token address whitelisting',
      'Verify contract addresses before each interaction'
    ]
  },
  
  operationalSecurity: {
    risk: 'System compromise or unauthorized access',
    fixes: [
      'Implement IP whitelisting for admin operations',
      'Use multi-signature wallets for treasury management',
      'Enable audit logging for all trading operations',
      'Set up real-time alerts for suspicious activity',
      'Regular security audits and penetration testing'
    ]
  }
};

/**
 * Validate trade against security policies
 */
export function validateTradeSecurity(
  tradeAmount: number,
  gasPrice: number,
  slippage: number,
  config: SecurityConfig = getSecurityConfig()
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  
  // Check trade amount
  if (tradeAmount > config.limits.maxTradeUsd) {
    violations.push(`Trade amount ($${tradeAmount}) exceeds max limit ($${config.limits.maxTradeUsd})`);
  }
  
  // Check gas price
  const gasPriceGwei = gasPrice / 1e9;
  if (gasPriceGwei > config.gas.maxGweiAllowed) {
    violations.push(`Gas price (${gasPriceGwei.toFixed(2)} gwei) exceeds max allowed (${config.gas.maxGweiAllowed} gwei)`);
  }
  
  // Check slippage
  const slippageBp = slippage * 100;
  if (slippageBp > config.slippage.maxBasisPoints) {
    violations.push(`Slippage (${slippage}%) exceeds max allowed (${config.slippage.maxBasisPoints / 100}%)`);
  }
  
  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Security Monitoring and Alerts
 */
export interface SecurityAlert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  timestamp: Date;
  metadata?: any;
}

export function createSecurityAlert(
  severity: SecurityAlert['severity'],
  type: string,
  message: string,
  metadata?: any
): SecurityAlert {
  const alert: SecurityAlert = {
    severity,
    type,
    message,
    timestamp: new Date(),
    metadata
  };
  
  // In production, send to monitoring service (e.g., Datadog, Sentry)
  console.warn(`🚨 SECURITY ALERT [${severity.toUpperCase()}]:`, alert);
  
  return alert;
}

