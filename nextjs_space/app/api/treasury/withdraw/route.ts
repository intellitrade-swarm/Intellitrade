
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ethers } from 'ethers';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { chain, amount, recipientAddress } = body;

    if (!chain || !amount || !recipientAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get treasury
    const treasury = await prisma.treasury.findFirst();
    
    if (!treasury) {
      return NextResponse.json({ error: 'Treasury not found' }, { status: 404 });
    }

    // Validate amount
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    let txHash = '';
    let success = false;

    // Process withdrawal based on chain
    if (chain === 'solana') {
      // Solana withdrawal
      if (!treasury.solanaPrivateKey || !treasury.solanaWalletAddress) {
        return NextResponse.json({ error: 'Solana wallet not configured' }, { status: 400 });
      }

      if (withdrawAmount > treasury.solanaBalance) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }

      try {
        const connection = new Connection(
          process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
        );

        const fromKeypair = Keypair.fromSecretKey(
          Buffer.from(treasury.solanaPrivateKey, 'base64')
        );

        const toPublicKey = new PublicKey(recipientAddress);

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: fromKeypair.publicKey,
            toPubkey: toPublicKey,
            lamports: withdrawAmount * LAMPORTS_PER_SOL,
          })
        );

        const signature = await connection.sendTransaction(transaction, [fromKeypair]);
        await connection.confirmTransaction(signature);

        txHash = signature;
        success = true;

        // Update treasury balance
        await prisma.treasury.update({
          where: { id: treasury.id },
          data: {
            solanaBalance: treasury.solanaBalance - withdrawAmount,
          },
        });
      } catch (error: any) {
        console.error('Solana withdrawal failed:', error);
        return NextResponse.json({ error: `Withdrawal failed: ${error.message}` }, { status: 500 });
      }
    } else {
      // EVM chains (base, bsc, ethereum)
      if (!treasury.evmPrivateKey || !treasury.evmWalletAddress) {
        return NextResponse.json({ error: 'EVM wallet not configured' }, { status: 400 });
      }

      let chainBalance = 0;
      let rpcUrl = '';

      if (chain === 'base') {
        chainBalance = treasury.baseBalance;
        rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
      } else if (chain === 'bsc') {
        chainBalance = treasury.bscBalance;
        rpcUrl = process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org';
      } else if (chain === 'ethereum') {
        chainBalance = treasury.ethereumBalance;
        rpcUrl = process.env.ETH_RPC_URL || 'https://eth.llamarpc.com';
      } else {
        return NextResponse.json({ error: 'Invalid chain' }, { status: 400 });
      }

      if (withdrawAmount > chainBalance) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }

      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(treasury.evmPrivateKey, provider);

        // For USDC, we need to use the token contract
        // For now, we'll send native token (ETH/BNB)
        const tx = await wallet.sendTransaction({
          to: recipientAddress,
          value: ethers.parseEther(withdrawAmount.toString()),
        });

        await tx.wait();
        txHash = tx.hash;
        success = true;

        // Update treasury balance
        const updateData: any = {};
        if (chain === 'base') {
          updateData.baseBalance = treasury.baseBalance - withdrawAmount;
        } else if (chain === 'bsc') {
          updateData.bscBalance = treasury.bscBalance - withdrawAmount;
        } else if (chain === 'ethereum') {
          updateData.ethereumBalance = treasury.ethereumBalance - withdrawAmount;
        }

        await prisma.treasury.update({
          where: { id: treasury.id },
          data: updateData,
        });
      } catch (error: any) {
        console.error('EVM withdrawal failed:', error);
        return NextResponse.json({ error: `Withdrawal failed: ${error.message}` }, { status: 500 });
      }
    }

    // Record transaction
    await prisma.treasuryTransaction.create({
      data: {
        treasuryId: treasury.id,
        amount: -withdrawAmount, // Negative for withdrawal
        currency: 'USDC',
        chain,
        txHash,
        description: `Admin withdrawal to ${recipientAddress}`,
      },
    });

    return NextResponse.json({
      success,
      txHash,
      message: 'Withdrawal successful',
    });
  } catch (error: any) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json({ error: error.message || 'Failed to process withdrawal' }, { status: 500 });
  }
}
