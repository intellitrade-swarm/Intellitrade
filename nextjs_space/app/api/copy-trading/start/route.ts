
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      walletAddress,
      agentId,
      allocationAmount,
      copyPercentage = 100,
      maxPositionSize,
      stopLoss,
      takeProfit
    } = body;

    // Validate inputs
    if (!walletAddress || !agentId || !allocationAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if agent exists and is active
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId }
    });

    if (!agent || !agent.isActive) {
      return NextResponse.json(
        { error: 'Agent not found or inactive' },
        { status: 404 }
      );
    }

    // Check if copy trade already exists
    const existingCopyTrade = await prisma.copyTrade.findUnique({
      where: {
        userWalletAddress_agentId: {
          userWalletAddress: walletAddress,
          agentId
        }
      }
    });

    let copyTrade;

    if (existingCopyTrade) {
      // Update existing copy trade
      copyTrade = await prisma.copyTrade.update({
        where: { id: existingCopyTrade.id },
        data: {
          allocationAmount,
          copyPercentage,
          maxPositionSize,
          stopLoss,
          takeProfit,
          isActive: true,
          status: 'ACTIVE'
        }
      });
    } else {
      // Create new copy trade
      copyTrade = await prisma.copyTrade.create({
        data: {
          userWalletAddress: walletAddress,
          agentId,
          allocationAmount,
          copyPercentage,
          maxPositionSize,
          stopLoss,
          takeProfit,
          isActive: true,
          status: 'ACTIVE'
        }
      });
    }

    return NextResponse.json({
      success: true,
      copyTrade
    });

  } catch (error) {
    console.error('Error starting copy trade:', error);
    return NextResponse.json(
      { error: 'Failed to start copy trade' },
      { status: 500 }
    );
  }
}
