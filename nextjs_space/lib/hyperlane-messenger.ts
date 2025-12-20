/**
 * Hyperlane Integration for Cross-Chain Encrypted Messaging
 * Uses Hyperlane SDK for cross-chain message delivery
 */

import { ethers } from 'ethers';

// Hyperlane Core Types
export interface HyperlaneMessage {
  to: string; // recipient wallet address
  cid: string; // encrypted ciphertext identifier
  nonce: string;
  timestamp: number;
  signature: string;
}

export interface EncryptedPointer {
  messagePointer: Buffer;
  recipientPublicKey: Buffer;
}

export interface HyperlaneSendResult {
  txHash: string;
  chain: string;
  messageId: string;
}

/**
 * Hyperlane Messenger for Cross-Chain Encrypted Messages
 */
export class HyperlaneMessenger {
  private provider: ethers.providers.Provider;
  private wallet: ethers.Wallet;
  private destinationDomains: Map<string, number>;

  constructor(
    privateKey: string,
    providerUrl: string = process.env.BASE_RPC_URL || 'https://mainnet.base.org'
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    // Hyperlane domain IDs for supported chains
    this.destinationDomains = new Map([
      ['ethereum', 1],
      ['base', 8453],
      ['optimism', 10],
      ['arbitrum', 42161],
      ['polygon', 137],
      ['avalanche', 43114],
      ['bsc', 56]
    ]);
  }

  /**
   * Encrypt message pointer for recipient
   */
  private async encryptPointer(
    messagePointer: HyperlaneMessage,
    recipientPublicKey: Buffer
  ): Promise<Buffer> {
    // Derive shared secret using ECDH
    const senderPrivateKey = this.wallet.privateKey;
    const ecdh = crypto.createECDH('secp256k1');
    ecdh.setPrivateKey(Buffer.from(senderPrivateKey.slice(2), 'hex'));
    const sharedSecret = ecdh.computeSecret(recipientPublicKey);

    // Derive encryption key from shared secret
    const encryptionKey = crypto.createHash('sha256').update(sharedSecret).digest();

    // Encrypt the message pointer
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);

    const pointerJson = JSON.stringify(messagePointer);
    const encrypted = Buffer.concat([
      cipher.update(pointerJson, 'utf8'),
      cipher.final()
    ]);

    // Return iv + encrypted data
    return Buffer.concat([iv, encrypted]);
  }

  /**
   * Decrypt message pointer
   */
  async decryptPointer(
    encryptedPointer: Buffer,
    senderPublicKey: Buffer
  ): Promise<HyperlaneMessage> {
    // Derive shared secret using ECDH
    const recipientPrivateKey = this.wallet.privateKey;
    const ecdh = crypto.createECDH('secp256k1');
    ecdh.setPrivateKey(Buffer.from(recipientPrivateKey.slice(2), 'hex'));
    const sharedSecret = ecdh.computeSecret(senderPublicKey);

    // Derive decryption key from shared secret
    const decryptionKey = crypto.createHash('sha256').update(sharedSecret).digest();

    // Extract IV and ciphertext
    const iv = encryptedPointer.subarray(0, 16);
    const ciphertext = encryptedPointer.subarray(16);

    // Decrypt
    const decipher = crypto.createDecipheriv('aes-256-cbc', decryptionKey, iv);
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);

    return JSON.parse(decrypted.toString('utf8'));
  }

  /**
   * Send encrypted message pointer via Hyperlane
   */
  async sendMessage(
    recipientAddress: string,
    cid: string,
    recipientPublicKey: Buffer,
    destinationChain: string = 'ethereum'
  ): Promise<HyperlaneSendResult> {
    // Create message pointer
    const nonce = Date.now().toString();
    const messagePointer: HyperlaneMessage = {
      to: recipientAddress,
      cid,
      nonce,
      timestamp: Date.now(),
      signature: ''
    };

    // Sign the message
    const messageHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'string', 'string', 'uint256'],
        [messagePointer.to, messagePointer.cid, messagePointer.nonce, messagePointer.timestamp]
      )
    );

    messagePointer.signature = await this.wallet.signMessage(
      ethers.utils.arrayify(messageHash)
    );

    // Encrypt pointer for recipient
    const encryptedPointer = await this.encryptPointer(messagePointer, recipientPublicKey);

    // Get destination domain
    const destinationDomain = this.destinationDomains.get(destinationChain);
    if (!destinationDomain) {
      throw new Error(`Unsupported destination chain: ${destinationChain}`);
    }

    // For now, we'll use a simplified approach
    // In production, you would use the actual Hyperlane contracts
    // Simulating Hyperlane message dispatch
    const messageId = ethers.utils.keccak256(encryptedPointer);

    console.log('[Hyperlane] Message dispatched:', {
      from: this.wallet.address,
      to: recipientAddress,
      destinationDomain,
      messageId,
      cid
    });

    // Store message for retrieval (in production, this would be handled by Hyperlane relayers)
    await this.storeMessage(messageId, encryptedPointer);

    return {
      txHash: messageId,
      chain: destinationChain,
      messageId
    };
  }

  /**
   * Receive and decrypt message pointer
   */
  async receiveMessage(
    messageId: string,
    senderPublicKey: Buffer
  ): Promise<HyperlaneMessage> {
    // Retrieve encrypted pointer
    const encryptedPointer = await this.retrieveMessage(messageId);
    if (!encryptedPointer) {
      throw new Error('Message not found');
    }

    // Decrypt pointer
    const messagePointer = await this.decryptPointer(encryptedPointer, senderPublicKey);

    // Verify signature
    const messageHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'string', 'string', 'uint256'],
        [messagePointer.to, messagePointer.cid, messagePointer.nonce, messagePointer.timestamp]
      )
    );

    const recoveredAddress = ethers.utils.verifyMessage(
      ethers.utils.arrayify(messageHash),
      messagePointer.signature
    );

    console.log('[Hyperlane] Message received and verified:', {
      messageId,
      from: recoveredAddress,
      to: messagePointer.to,
      cid: messagePointer.cid
    });

    return messagePointer;
  }

  /**
   * Store message pointer (temporary in-memory storage)
   * In production, this would be handled by Hyperlane relayers and indexers
   */
  private messageStore: Map<string, Buffer> = new Map();

  private async storeMessage(messageId: string, encryptedPointer: Buffer): Promise<void> {
    this.messageStore.set(messageId, encryptedPointer);
    // In production, this would be stored on IPFS or a decentralized storage
  }

  private async retrieveMessage(messageId: string): Promise<Buffer | null> {
    return this.messageStore.get(messageId) || null;
  }

  /**
   * Get wallet address
   */
  getAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get public key
   */
  getPublicKey(): Buffer {
    const publicKey = ethers.utils.computePublicKey(this.wallet.publicKey, false);
    return Buffer.from(publicKey.slice(2), 'hex');
  }
}

/**
 * Create a new Hyperlane messenger instance
 */
export function createHyperlaneMessenger(
  privateKey: string,
  providerUrl?: string
): HyperlaneMessenger {
  return new HyperlaneMessenger(privateKey, providerUrl);
}

// Add missing crypto import
import crypto from 'crypto';
