
/**
 * Solana Blockchain Integration
 * Handles wallet generation, balance checking, and basic SOL operations
 */

import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import bs58 from 'bs58';

// Solana RPC endpoint - using mainnet
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

// Common Solana token addresses
export const TOKEN_ADDRESSES = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
};

/**
 * Get Solana connection instance
 */
export function getSolanaConnection(): Connection {
  return new Connection(SOLANA_RPC_URL, 'confirmed');
}

/**
 * Generate a new Solana wallet keypair
 */
export function generateSolanaWallet(): {
  publicKey: string;
  privateKey: string;
} {
  const keypair = Keypair.generate();
  
  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKey: bs58.encode(keypair.secretKey),
  };
}

/**
 * Get keypair from private key
 */
export function getKeypairFromPrivateKey(privateKey: string): Keypair {
  try {
    const secretKey = bs58.decode(privateKey);
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error('Error decoding private key:', error);
    throw new Error('Invalid Solana private key');
  }
}

/**
 * Get SOL balance for a wallet address
 */
export async function getSolBalance(address: string): Promise<number> {
  try {
    const connection = getSolanaConnection();
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    
    // Convert lamports to SOL
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    return 0;
  }
}

/**
 * Get USD value of SOL balance
 */
export async function getSolBalanceInUSD(address: string): Promise<number> {
  try {
    const solBalance = await getSolBalance(address);
    const solPrice = await getSolPrice();
    
    return solBalance * solPrice;
  } catch (error) {
    console.error('Error calculating SOL balance in USD:', error);
    return 0;
  }
}

/**
 * Get current SOL price in USD
 */
// Price cache to avoid excessive API calls
let solPriceCache: { price: number; timestamp: number } | null = null;
const PRICE_CACHE_TTL = 60 * 1000; // 1 minute

export async function getSolPrice(): Promise<number> {
  try {
    // Return cached price if fresh
    if (solPriceCache && (Date.now() - solPriceCache.timestamp) < PRICE_CACHE_TTL) {
      return solPriceCache.price;
    }

    // Try CoinGecko API first
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        const price = data.solana?.usd;
        
        if (price && price > 0) {
          solPriceCache = { price, timestamp: Date.now() };
          return price;
        }
      }
    } catch (cgError) {
      console.warn('CoinGecko API failed, trying fallback...');
    }

    // Fallback: Try Binance API
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT');
      
      if (response.ok) {
        const data = await response.json();
        const price = parseFloat(data.price);
        
        if (price && price > 0) {
          solPriceCache = { price, timestamp: Date.now() };
          return price;
        }
      }
    } catch (binanceError) {
      console.warn('Binance API failed');
    }

    // If both APIs fail, use last cached price if available
    if (solPriceCache && solPriceCache.price > 0) {
      console.warn('Using stale cached SOL price:', solPriceCache.price);
      return solPriceCache.price;
    }

    // Last resort: Use approximate price
    console.warn('All price APIs failed, using approximate SOL price: $200');
    return 200;
    
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    // Return approximate price rather than 0
    return 200;
  }
}

/**
 * Transfer SOL from one wallet to another
 */
export async function transferSol(
  fromPrivateKey: string,
  toAddress: string,
  amountSOL: number
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    const connection = getSolanaConnection();
    const fromKeypair = getKeypairFromPrivateKey(fromPrivateKey);
    const toPublicKey = new PublicKey(toAddress);
    
    // Create transfer instruction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKey,
        lamports: amountSOL * LAMPORTS_PER_SOL,
      })
    );
    
    // Send and confirm transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [fromKeypair],
      { commitment: 'confirmed' }
    );
    
    return {
      success: true,
      signature,
    };
  } catch (error: any) {
    console.error('Error transferring SOL:', error);
    return {
      success: false,
      error: error.message || 'Failed to transfer SOL',
    };
  }
}

/**
 * Get transaction history for a wallet
 */
export async function getTransactionHistory(
  address: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const connection = getSolanaConnection();
    const publicKey = new PublicKey(address);
    
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit,
    });
    
    return signatures;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
}

/**
 * Validate Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get wallet info including balance and USD value
 */
export async function getWalletInfo(address: string): Promise<{
  address: string;
  solBalance: number;
  usdValue: number;
  isValid: boolean;
}> {
  const isValid = isValidSolanaAddress(address);
  
  if (!isValid) {
    return {
      address,
      solBalance: 0,
      usdValue: 0,
      isValid: false,
    };
  }
  
  const solBalance = await getSolBalance(address);
  const usdValue = await getSolBalanceInUSD(address);
  
  return {
    address,
    solBalance,
    usdValue,
    isValid: true,
  };
}
