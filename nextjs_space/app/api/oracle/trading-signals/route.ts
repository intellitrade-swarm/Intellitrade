
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fullScaleOracle } from '@/lib/full-scale-oracle';

/**
 * API route for comprehensive trading signals
 * Combines market data, AI analysis, and technical indicators
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, symbols } = body;

    if (!agentId || !symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { error: 'Missing required parameters: agentId, symbols (array)' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Fetch agent details (if not demo)
    let agent: any = null;
    if (agentId !== 'oracle-demo') {
      agent = await prisma.aIAgent.findUnique({
        where: { id: agentId },
      });

      if (!agent) {
        return NextResponse.json(
          { error: 'Agent not found' },
          { status: 404 }
        );
      }
    } else {
      // Demo agent with default settings
      agent = {
        id: 'oracle-demo',
        name: 'Oracle Demo',
        strategyType: 'SWING',
        aiProvider: 'GROK',
        riskTolerance: 'medium',
      };
    }

    // Gather comprehensive data for each symbol
    const signals = await Promise.all(
      symbols.map(async (symbol: string) => {
        try {
          // Fetch market data
          const [priceData, volumeData, liquidityData, technicalData] = await Promise.all([
            fetch(`${req.nextUrl.origin}/api/oracle/market-data`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                symbol,
                chain: 'solana',
                dataType: 'price',
                timeframe: '15m',
              }),
            }).then((r) => r.json()),
            fetch(`${req.nextUrl.origin}/api/oracle/market-data`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                symbol,
                chain: 'solana',
                dataType: 'volume',
                timeframe: '24h',
              }),
            }).then((r) => r.json()),
            fetch(`${req.nextUrl.origin}/api/oracle/market-data`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                symbol,
                chain: 'solana',
                dataType: 'liquidity',
              }),
            }).then((r) => r.json()),
            fetch(`${req.nextUrl.origin}/api/oracle/market-data`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                symbol,
                chain: 'solana',
                dataType: 'technical',
                timeframe: '24h',
              }),
            }).then((r) => r.json()),
          ]);

          // Prepare context for AI analysis
          const marketContext = {
            symbol,
            price: priceData.result?.price || 0,
            volume24h: volumeData.result?.volume24h || 0,
            liquidity: liquidityData.result?.liquidityUsd || 0,
            technical: technicalData.result || {},
            agentStrategy: agent?.strategyType || 'SWING',
            agentRiskTolerance: agent?.riskTolerance || 'medium',
          };

          // Get AI recommendation
          const aiAnalysis = await fetch(`${req.nextUrl.origin}/api/oracle/ai-analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `As a trading expert, analyze this market data and provide a clear trading signal (BUY, SELL, or HOLD) with reasoning:\n${JSON.stringify(marketContext, null, 2)}`,
              context: marketContext,
              modelType: agent?.aiProvider?.toLowerCase() || 'grok',
              maxTokens: 300,
            }),
          }).then((r) => r.json());

          // Extract signal from AI analysis
          const analysisText = aiAnalysis.result?.analysis?.toLowerCase() || '';
          let signal = 'HOLD';
          let confidence = 0.5;

          if (analysisText.includes('strong buy') || analysisText.includes('strongly recommend buying')) {
            signal = 'STRONG_BUY';
            confidence = 0.9;
          } else if (analysisText.includes('buy')) {
            signal = 'BUY';
            confidence = 0.75;
          } else if (analysisText.includes('strong sell') || analysisText.includes('strongly recommend selling')) {
            signal = 'STRONG_SELL';
            confidence = 0.9;
          } else if (analysisText.includes('sell')) {
            signal = 'SELL';
            confidence = 0.75;
          } else {
            confidence = 0.6;
          }

          return {
            symbol,
            signal,
            confidence,
            marketData: {
              price: priceData.result?.price || 0,
              volume24h: volumeData.result?.volume24h || 0,
              liquidity: liquidityData.result?.liquidityUsd || 0,
              priceChange24h: technicalData.result?.priceChange?.['24h'] || 0,
              rsi: technicalData.result?.rsi || 50,
              trend: technicalData.result?.trend || 'neutral',
            },
            aiReasoning: aiAnalysis.result?.analysis || 'No analysis available',
            timestamp: new Date().toISOString(),
          };
        } catch (error: any) {
          console.error(`Error fetching signal for ${symbol}:`, error);
          return {
            symbol,
            signal: 'HOLD',
            confidence: 0,
            error: error.message,
            timestamp: new Date().toISOString(),
          };
        }
      })
    );

    const processingTime = Date.now() - startTime;

    // Generate request ID
    const requestId = `signals_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      requestId,
      signals,
      agentId,
      timestamp: new Date().toISOString(),
      processingTime,
      status: 'fulfilled',
    });
  } catch (error: any) {
    console.error('Trading signals oracle error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
