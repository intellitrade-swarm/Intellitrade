
/**
 * Jupiter DEX Integration
 * Handles token swaps on Solana via Jupiter aggregator
 */

import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { getKeypairFromPrivateKey, getSolanaConnection } from './solana';

// Jupiter API endpoint
const JUPITER_API_URL = 'https://quote-api.jup.ag/v6';

interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  marketInfos: any[];
  slippageBps: number;
}

interface SwapResult {
  success: boolean;
  signature?: string;
  inputAmount?: number;
  outputAmount?: number;
  error?: string;
}

/**
 * Get a quote for a token swap
 */
export async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: number, // Amount in base units (lamports for SOL)
  slippageBps: number = 50 // 0.5% slippage
): Promise<JupiterQuote | null> {
  try {
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: slippageBps.toString(),
    });
    
    const response = await fetch(`${JUPITER_API_URL}/quote?${params}`);
    
    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.statusText}`);
    }
    
    const quote = await response.json();
    return quote;
  } catch (error) {
    console.error('Error fetching Jupiter quote:', error);
    return null;
  }
}

/**
 * Execute a swap transaction
 */
export async function executeJupiterSwap(
  privateKey: string,
  quote: JupiterQuote
): Promise<SwapResult> {
  try {
    const connection = getSolanaConnection();
    const keypair = getKeypairFromPrivateKey(privateKey);
    
    // Get swap transaction from Jupiter
    const response = await fetch(`${JUPITER_API_URL}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: keypair.publicKey.toBase58(),
        wrapAndUnwrapSol: true,
        computeUnitPriceMicroLamports: 'auto',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Jupiter swap API error: ${response.statusText}`);
    }
    
    const { swapTransaction } = await response.json();
    
    // Deserialize the transaction
    const transactionBuf = Buffer.from(swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(transactionBuf);
    
    // Sign the transaction
    transaction.sign([keypair]);
    
    // Send and confirm transaction
    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      {
        skipPreflight: false,
        maxRetries: 3,
      }
    );
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    
    return {
      success: true,
      signature,
      inputAmount: parseFloat(quote.inAmount),
      outputAmount: parseFloat(quote.outAmount),
    };
  } catch (error: any) {
    console.error('Error executing Jupiter swap:', error);
    return {
      success: false,
      error: error.message || 'Failed to execute swap',
    };
  }
}

/**
 * Swap SOL for USDC
 */
export async function swapSolForUsdc(
  privateKey: string,
  solAmount: number, // Amount in SOL (not lamports)
  slippageBps: number = 50
): Promise<SwapResult> {
  try {
    const SOL_MINT = 'So11111111111111111111111111111111111111112';
    const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
    
    // Convert SOL to lamports
    const lamports = Math.floor(solAmount * 1e9);
    
    // Get quote
    const quote = await getJupiterQuote(SOL_MINT, USDC_MINT, lamports, slippageBps);
    
    if (!quote) {
      return {
        success: false,
        error: 'Failed to get quote from Jupiter',
      };
    }
    
    // Execute swap
    return await executeJupiterSwap(privateKey, quote);
  } catch (error: any) {
    console.error('Error swapping SOL for USDC:', error);
    return {
      success: false,
      error: error.message || 'Swap failed',
    };
  }
}

/**
 * Swap USDC for SOL
 */
export async function swapUsdcForSol(
  privateKey: string,
  usdcAmount: number, // Amount in USDC (not base units)
  slippageBps: number = 50
): Promise<SwapResult> {
  try {
    const SOL_MINT = 'So11111111111111111111111111111111111111112';
    const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
    
    // Convert USDC to base units (6 decimals)
    const baseUnits = Math.floor(usdcAmount * 1e6);
    
    // Get quote
    const quote = await getJupiterQuote(USDC_MINT, SOL_MINT, baseUnits, slippageBps);
    
    if (!quote) {
      return {
        success: false,
        error: 'Failed to get quote from Jupiter',
      };
    }
    
    // Execute swap
    return await executeJupiterSwap(privateKey, quote);
  } catch (error: any) {
    console.error('Error swapping USDC for SOL:', error);
    return {
      success: false,
      error: error.message || 'Swap failed',
    };
  }
}

/**
 * Swap any token for another token
 */
export async function swapTokens(
  privateKey: string,
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 50
): Promise<SwapResult> {
  try {
    // Get quote
    const quote = await getJupiterQuote(inputMint, outputMint, amount, slippageBps);
    
    if (!quote) {
      return {
        success: false,
        error: 'Failed to get quote from Jupiter',
      };
    }
    
    // NO PRICE IMPACT CHECK - agents can trade at ANY price
    // They can buy tokens at $0.0000001 or any other price
    // Price impact is acceptable for low-liquidity tokens
    
    // Execute swap
    return await executeJupiterSwap(privateKey, quote);
  } catch (error: any) {
    console.error('Error swapping tokens:', error);
    return {
      success: false,
      error: error.message || 'Swap failed',
    };
  }
}

/**
 * Get best price for a token pair
 */
export async function getBestPrice(
  inputMint: string,
  outputMint: string,
  amount: number
): Promise<{ price: number; priceImpact: number } | null> {
  try {
    const quote = await getJupiterQuote(inputMint, outputMint, amount);
    
    if (!quote) {
      return null;
    }
    
    const price = parseFloat(quote.outAmount) / parseFloat(quote.inAmount);
    
    return {
      price,
      priceImpact: quote.priceImpactPct,
    };
  } catch (error) {
    console.error('Error fetching best price:', error);
    return null;
  }
}
