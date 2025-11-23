
/**
 * Blockchain Oracle Service - Chainlink-style Implementation
 * Bridges off-chain data to on-chain smart contracts
 */

import { ethers } from 'ethers';
import axios from 'axios';
import { callAI } from './ai-providers';

// Oracle Smart Contract ABI (simplified)
export const ORACLE_ABI = [
  "event RequestCreated(uint256 indexed id, address requester, string dataUrl)",
  "event DataFulfilled(uint256 indexed id, uint256 value)",
  "function requestData(string calldata _dataUrl) external returns (uint256)",
  "function fulfill(uint256 _id, uint256 _value) external",
  "function getData(uint256 _id) external view returns (uint256)",
  "function requestCount() external view returns (uint256)"
];

// Supported networks for oracle deployment
export interface OracleNetwork {
  name: string;
  chainId: number;
  rpcUrl: string;
  oracleAddress: string;
  explorerUrl: string;
}

export const ORACLE_NETWORKS: Record<string, OracleNetwork> = {
  'sepolia': {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo',
    oracleAddress: process.env.ORACLE_CONTRACT_SEPOLIA || '',
    explorerUrl: 'https://sepolia.etherscan.io'
  },
  'astar-zkevm': {
    name: 'Astar zkEVM',
    chainId: 3776,
    rpcUrl: 'https://rpc.startale.com/astar-zkevm',
    oracleAddress: process.env.ORACLE_CONTRACT_ASTAR || '',
    explorerUrl: 'https://astar-zkevm.explorer.startale.com'
  },
  'polygon': {
    name: 'Polygon',
    chainId: 137,
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    oracleAddress: process.env.ORACLE_CONTRACT_POLYGON || '',
    explorerUrl: 'https://polygonscan.com'
  }
};

export interface OracleRequest {
  id: string;
  requestId: number;
  requester: string;
  dataUrl: string;
  fulfilled: boolean;
  value?: number;
  timestamp: Date;
  txHash: string;
  network: string;
}

export interface OracleNodeStatus {
  isRunning: boolean;
  network: string;
  latestBlock: number;
  requestsListened: number;
  requestsFulfilled: number;
  averageLatency: number;
  uptime: number;
  errors: string[];
  lastUpdate: Date;
}

/**
 * Oracle Node Manager - Listens for on-chain requests and fulfills them
 */
export class OracleNodeManager {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private network: OracleNetwork;
  private isListening: boolean = false;
  private requestsProcessed: number = 0;
  private requestsFulfilled: number = 0;
  private startTime: Date;
  private errors: string[] = [];

  constructor(networkName: string = 'astar-zkevm') {
    this.network = ORACLE_NETWORKS[networkName];
    if (!this.network) {
      throw new Error(`Unsupported network: ${networkName}`);
    }

    this.provider = new ethers.JsonRpcProvider(this.network.rpcUrl);
    
    // Initialize wallet with private key (should be from env)
    const privateKey = process.env.ORACLE_PRIVATE_KEY || ethers.Wallet.createRandom().privateKey;
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    // Initialize contract
    this.contract = new ethers.Contract(
      this.network.oracleAddress || ethers.ZeroAddress,
      ORACLE_ABI,
      this.wallet
    );
    
    this.startTime = new Date();
  }

  /**
   * Start listening for oracle requests
   */
  async start() {
    if (this.isListening) {
      console.log('Oracle node is already running');
      return;
    }

    console.log(`🔮 Starting Oracle Node on ${this.network.name}...`);
    console.log(`📍 Oracle Contract: ${this.network.oracleAddress}`);
    console.log(`👛 Oracle Wallet: ${this.wallet.address}`);

    this.isListening = true;

    // Listen for RequestCreated events
    this.contract.on('RequestCreated', async (id, requester, dataUrl, event) => {
      try {
        console.log(`\n📡 New Oracle Request Received!`);
        console.log(`   ID: ${id}`);
        console.log(`   Requester: ${requester}`);
        console.log(`   Data URL: ${dataUrl}`);

        this.requestsProcessed++;

        // Fetch the data
        const value = await this.fetchData(dataUrl);

        if (value !== null) {
          // Fulfill the request on-chain
          const tx = await this.contract.fulfill(id, value);
          console.log(`   ✅ Fulfilling request... TX: ${tx.hash}`);
          
          await tx.wait();
          this.requestsFulfilled++;
          
          console.log(`   ✅ Request ${id} fulfilled with value: ${value}`);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error) {
        const errorMsg = `Error fulfilling request ${id}: ${error}`;
        console.error(`   ❌ ${errorMsg}`);
        this.errors.push(errorMsg);
        
        // Keep only last 10 errors
        if (this.errors.length > 10) {
          this.errors.shift();
        }
      }
    });

    console.log('✅ Oracle node started successfully!');
  }

  /**
   * Stop listening for oracle requests
   */
  stop() {
    if (!this.isListening) {
      console.log('Oracle node is not running');
      return;
    }

    this.contract.removeAllListeners();
    this.isListening = false;
    console.log('Oracle node stopped');
  }

  /**
   * Fetch data from the specified URL or data identifier
   */
  private async fetchData(dataUrl: string): Promise<number | null> {
    try {
      // Handle different data sources
      if (dataUrl.includes('eth-price')) {
        // Fetch ETH price from CoinGecko
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        const price = response.data.ethereum.usd;
        // Convert to integer (multiply by 100 for 2 decimal precision)
        return Math.floor(price * 100);
      } else if (dataUrl.includes('btc-price')) {
        // Fetch BTC price
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
        );
        const price = response.data.bitcoin.usd;
        return Math.floor(price * 100);
      } else if (dataUrl.startsWith('ai-sentiment:')) {
        // AI-powered sentiment analysis
        const symbol = dataUrl.split(':')[1];
        const sentiment = await this.getAISentiment(symbol);
        // Convert sentiment to number: bullish=100, neutral=50, bearish=0
        return sentiment === 'BULLISH' ? 100 : sentiment === 'NEUTRAL' ? 50 : 0;
      } else if (dataUrl.startsWith('http')) {
        // Generic HTTP request
        const response = await axios.get(dataUrl);
        return typeof response.data === 'number' ? response.data : parseInt(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  }

  /**
   * Get AI sentiment for a symbol
   */
  private async getAISentiment(symbol: string): Promise<'BULLISH' | 'BEARISH' | 'NEUTRAL'> {
    try {
      const messages = [
        {
          role: 'user' as const,
          content: `Analyze current market sentiment for ${symbol}. Respond with only one word: BULLISH, BEARISH, or NEUTRAL.`
        }
      ];
      const response = await callAI('NVIDIA', messages);
      
      const sentiment = response.toUpperCase();
      if (sentiment.includes('BULLISH')) return 'BULLISH';
      if (sentiment.includes('BEARISH')) return 'BEARISH';
      return 'NEUTRAL';
    } catch (error) {
      console.error('AI sentiment analysis failed:', error);
      return 'NEUTRAL';
    }
  }

  /**
   * Get current status of the oracle node
   */
  async getStatus(): Promise<OracleNodeStatus> {
    const latestBlock = await this.provider.getBlockNumber();
    const uptime = Date.now() - this.startTime.getTime();

    return {
      isRunning: this.isListening,
      network: this.network.name,
      latestBlock,
      requestsListened: this.requestsProcessed,
      requestsFulfilled: this.requestsFulfilled,
      averageLatency: 0, // TODO: Calculate average latency
      uptime,
      errors: [...this.errors],
      lastUpdate: new Date()
    };
  }

  /**
   * Get oracle contract balance
   */
  async getBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }
}

/**
 * Oracle Client - For users to request data
 */
export class OracleClient {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private network: OracleNetwork;

  constructor(networkName: string = 'astar-zkevm') {
    this.network = ORACLE_NETWORKS[networkName];
    if (!this.network) {
      throw new Error(`Unsupported network: ${networkName}`);
    }

    this.provider = new ethers.JsonRpcProvider(this.network.rpcUrl);
    this.contract = new ethers.Contract(
      this.network.oracleAddress || ethers.ZeroAddress,
      ORACLE_ABI,
      this.provider
    );
  }

  /**
   * Request data from the oracle
   */
  async requestData(dataUrl: string, signer: ethers.Signer): Promise<number> {
    const contractWithSigner = this.contract.connect(signer) as any;
    const tx = await contractWithSigner.requestData(dataUrl);
    const receipt = await tx.wait();
    
    // Extract request ID from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = this.contract.interface.parseLog(log);
        return parsed?.name === 'RequestCreated';
      } catch {
        return false;
      }
    });

    if (event) {
      const parsed = this.contract.interface.parseLog(event);
      return Number(parsed?.args[0]);
    }

    throw new Error('Failed to get request ID');
  }

  /**
   * Get data from a fulfilled request
   */
  async getData(requestId: number): Promise<number> {
    const data = await this.contract.getData(requestId);
    return Number(data);
  }

  /**
   * Get total number of requests
   */
  async getRequestCount(): Promise<number> {
    const count = await this.contract.requestCount();
    return Number(count);
  }
}

// Global oracle node instance
let globalOracleNode: OracleNodeManager | null = null;

/**
 * Initialize and start the global oracle node
 */
export async function startOracleNode(network: string = 'astar-zkevm'): Promise<OracleNodeManager> {
  if (globalOracleNode) {
    console.log('Oracle node already running');
    return globalOracleNode;
  }

  globalOracleNode = new OracleNodeManager(network);
  await globalOracleNode.start();
  return globalOracleNode;
}

/**
 * Get the global oracle node instance
 */
export function getOracleNode(): OracleNodeManager | null {
  return globalOracleNode;
}

/**
 * Stop the global oracle node
 */
export function stopOracleNode() {
  if (globalOracleNode) {
    globalOracleNode.stop();
    globalOracleNode = null;
  }
}
