
/**
 * Wallet Management for AI Trading Agents
 * Handles creation, encryption, and blockchain interactions
 */

import { ethers } from 'ethers';
import crypto from 'crypto';
import { ChainName } from './blockchain-config';
import { getProvider } from './blockchain';

// Encryption key derived from environment variable
const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY || 'default-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';

/**
 * Create a new wallet for an agent
 */
export function createWallet(): {
  address: string;
  privateKey: string;
  mnemonic: string;
} {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase || '',
  };
}

/**
 * Encrypt a private key for secure storage
 */
export function encryptPrivateKey(privateKey: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt a private key for use
 */
export function decryptPrivateKey(encryptedKey: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const parts = encryptedKey.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Get wallet instance from encrypted private key
 */
export function getWallet(encryptedPrivateKey: string, chain: ChainName): ethers.Wallet {
  const privateKey = decryptPrivateKey(encryptedPrivateKey);
  const provider = getProvider(chain);
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Get wallet balances across multiple tokens
 */
export async function getWalletBalances(
  walletAddress: string,
  chain: ChainName
): Promise<{
  native: string;
  nativeSymbol: string;
  usdc: string;
  tokens: Array<{ symbol: string; balance: string; address: string }>;
}> {
  try {
    const provider = getProvider(chain);
    const nativeBalance = await provider.getBalance(walletAddress);
    
    // Determine native symbol based on chain
    const nativeSymbols: Record<ChainName, string> = {
      ethereum: 'ETH',
      base: 'ETH',
      bsc: 'BNB',
    };
    
    // USDC contract addresses on different chains
    const usdcAddresses: Record<ChainName, string> = {
      ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
      bsc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    };
    
    // Fetch USDC balance
    let usdcBalance = '0';
    const usdcAddress = usdcAddresses[chain];
    if (usdcAddress) {
      try {
        // ERC20 ABI for balanceOf
        const erc20ABI = [
          'function balanceOf(address owner) view returns (uint256)',
          'function decimals() view returns (uint8)',
        ];
        const usdcContract = new ethers.Contract(usdcAddress, erc20ABI, provider);
        const balance = await usdcContract.balanceOf(walletAddress);
        const decimals = await usdcContract.decimals();
        usdcBalance = ethers.formatUnits(balance, decimals);
      } catch (error) {
        console.error('Error fetching USDC balance:', error);
        usdcBalance = '0';
      }
    }
    
    return {
      native: ethers.formatEther(nativeBalance),
      nativeSymbol: nativeSymbols[chain],
      usdc: usdcBalance,
      tokens: [], // Can be extended for other ERC20 tokens
    };
  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    throw error;
  }
}

/**
 * Send native currency (ETH, BNB, etc.)
 */
export async function sendNativeCurrency(
  encryptedPrivateKey: string,
  chain: ChainName,
  toAddress: string,
  amount: string
): Promise<{ txHash: string; blockNumber: number | null }> {
  try {
    const wallet = getWallet(encryptedPrivateKey, chain);
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount),
    });
    
    const receipt = await tx.wait();
    
    return {
      txHash: tx.hash,
      blockNumber: receipt?.blockNumber || null,
    };
  } catch (error) {
    console.error('Error sending native currency:', error);
    throw error;
  }
}

/**
 * Execute a swap on a DEX (Uniswap V2 compatible)
 */
export async function executeSwap(
  encryptedPrivateKey: string,
  chain: ChainName,
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  minAmountOut: string,
  routerAddress: string
): Promise<{ txHash: string; blockNumber: number | null }> {
  try {
    const wallet = getWallet(encryptedPrivateKey, chain);
    
    // Uniswap V2 Router ABI (simplified)
    const routerABI = [
      'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
      'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
      'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
    ];
    
    const router = new ethers.Contract(routerAddress, routerABI, wallet);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
    
    let tx;
    
    // ETH to Token
    if (tokenIn === ethers.ZeroAddress) {
      tx = await router.swapExactETHForTokens(
        ethers.parseUnits(minAmountOut, 18),
        [tokenIn, tokenOut],
        wallet.address,
        deadline,
        { value: ethers.parseEther(amountIn) }
      );
    }
    // Token to ETH
    else if (tokenOut === ethers.ZeroAddress) {
      tx = await router.swapExactTokensForETH(
        ethers.parseEther(amountIn),
        ethers.parseUnits(minAmountOut, 18),
        [tokenIn, tokenOut],
        wallet.address,
        deadline
      );
    }
    // Token to Token
    else {
      tx = await router.swapExactTokensForTokens(
        ethers.parseEther(amountIn),
        ethers.parseUnits(minAmountOut, 18),
        [tokenIn, tokenOut],
        wallet.address,
        deadline
      );
    }
    
    const receipt = await tx.wait();
    
    return {
      txHash: tx.hash,
      blockNumber: receipt?.blockNumber || null,
    };
  } catch (error) {
    console.error('Error executing swap:', error);
    throw error;
  }
}

/**
 * Get wallet portfolio value in USD
 */
export async function getPortfolioValue(
  walletAddress: string,
  chain: ChainName,
  prices: Map<string, number>
): Promise<number> {
  try {
    const balances = await getWalletBalances(walletAddress, chain);
    const nativeBalance = parseFloat(balances.native);
    
    // Get price for native token
    let nativePrice = 0;
    if (chain === 'ethereum' || chain === 'base') {
      nativePrice = prices.get('ETH') || 0;
    } else if (chain === 'bsc') {
      nativePrice = prices.get('BNB') || 0;
    }
    
    const totalValue = nativeBalance * nativePrice;
    
    return totalValue;
  } catch (error) {
    console.error('Error calculating portfolio value:', error);
    return 0;
  }
}
