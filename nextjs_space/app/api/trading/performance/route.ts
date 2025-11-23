
/**
 * API endpoint for real-time trading performance metrics
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Get all agents with their real-time balances
    const agents = await prisma.aIAgent.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        realBalance: true,
        aiProvider: true,
      },
    });

    // Get recent trades (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTrades = await prisma.trade.findMany({
      where: {
        entryTime: {
          gte: oneDayAgo,
        },
        isRealTrade: true,
      },
      include: {
        agent: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        entryTime: 'desc',
      },
    });

    // Calculate performance metrics
    const totalPnL = recentTrades
      .filter((t) => t.profitLoss !== null)
      .reduce((sum, t) => sum + (t.profitLoss || 0), 0);

    const closedTrades = recentTrades.filter((t) => t.status === 'CLOSED');
    const winningTrades = closedTrades.filter((t) => (t.profitLoss || 0) > 0);
    const losingTrades = closedTrades.filter((t) => (t.profitLoss || 0) < 0);
    const winRate = closedTrades.length > 0 
      ? (winningTrades.length / closedTrades.length) * 100 
      : 0;

    const totalWins = winningTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;

    // Get open positions
    const openPositions = recentTrades.filter((t) => t.status === 'OPEN');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      agents: agents.map((a) => ({
        id: a.id,
        name: a.name,
        balance: a.realBalance,
        aiProvider: a.aiProvider,
      })),
      performance: {
        totalPnL: Number(totalPnL.toFixed(2)),
        totalTrades: recentTrades.length,
        closedTrades: closedTrades.length,
        openTrades: openPositions.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate: Number(winRate.toFixed(1)),
        profitFactor: Number(profitFactor.toFixed(2)),
        totalWins: Number(totalWins.toFixed(2)),
        totalLosses: Number(totalLosses.toFixed(2)),
      },
      recentTrades: recentTrades.slice(0, 10).map((t) => ({
        id: t.id,
        agent: t.agent.name,
        symbol: t.symbol,
        side: t.side,
        status: t.status,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        quantity: t.quantity,
        profitLoss: t.profitLoss,
        entryTime: t.entryTime,
        exitTime: t.exitTime,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching trading performance:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trading performance',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
