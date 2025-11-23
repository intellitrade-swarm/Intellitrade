
import { NextRequest, NextResponse } from 'next/server';
import { callAI, AIProvider, AIMessage } from '@/lib/ai-providers';

/**
 * API route for AI analysis oracle requests
 * Provides AI-powered market analysis and trading recommendations
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, context, modelType, maxTokens } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing required parameter: prompt' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Route to appropriate AI provider
    let result: any;
    const model = modelType || 'grok';

    try {
      let provider: AIProvider;
      switch (model.toLowerCase()) {
        case 'grok':
          provider = 'GROK';
          break;
        case 'nvidia':
          provider = 'NVIDIA';
          break;
        case 'openai':
          provider = 'OPENAI';
          break;
        case 'gemini':
          provider = 'GEMINI';
          break;
        default:
          throw new Error(`Unknown AI model: ${model}`);
      }

      const messages: AIMessage[] = [
        { role: 'system' as const, content: 'You are a financial market analysis expert. Provide clear, actionable insights.' },
        { role: 'user' as const, content: prompt + (context ? `\n\nContext: ${JSON.stringify(context)}` : '') }
      ];

      result = await callAI(provider, messages, 0.7, maxTokens);
    } catch (error: any) {
      console.error(`AI analysis error with ${model}:`, error);
      // Fallback to Grok if another provider fails
      if (model !== 'grok') {
        try {
          const messages: AIMessage[] = [
            { role: 'system' as const, content: 'You are a financial market analysis expert. Provide clear, actionable insights.' },
            { role: 'user' as const, content: prompt + (context ? `\n\nContext: ${JSON.stringify(context)}` : '') }
          ];
          result = await callAI('GROK', messages, 0.7, maxTokens);
        } catch (fallbackError: any) {
          throw new Error(`All AI providers failed: ${error.message}, ${fallbackError.message}`);
        }
      } else {
        throw error;
      }
    }

    const processingTime = Date.now() - startTime;

    // Generate request ID
    const requestId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      requestId,
      result: {
        analysis: result,
        provider: model,
        confidence: result.confidence || 0.8,
      },
      timestamp: new Date().toISOString(),
      processingTime,
      status: 'fulfilled',
    });
  } catch (error: any) {
    console.error('AI analysis oracle error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
