
import { callAI, AIMessage } from './ai-providers';
import { AIProvider } from '@prisma/client';

/**
 * Generate AI analysis for market data
 */
export async function generateAIAnalysis(
  systemPrompt: string,
  userPrompt: string,
  provider: AIProvider,
  temperature: number = 0.7,
  maxTokens: number = 1500
): Promise<string> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: userPrompt,
    },
  ];

  try {
    // Map Prisma AIProvider enum to the string format expected by callAI
    const providerString = provider as unknown as 'OPENAI' | 'GEMINI' | 'NVIDIA' | 'GROK';
    const response = await callAI(providerString, messages, temperature, maxTokens);
    return response;
  } catch (error) {
    console.error(`Error generating AI analysis with ${provider}:`, error);
    throw new Error(`Failed to generate AI analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate market sentiment analysis
 */
export async function generateSentimentAnalysis(
  symbol: string,
  marketData: any,
  provider: AIProvider = AIProvider.OPENAI
): Promise<{
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  reasoning: string;
}> {
  const systemPrompt = `You are a market sentiment analyst. Analyze the given market data and provide a sentiment assessment.`;
  
  const userPrompt = `
Analyze the sentiment for ${symbol}:
Market Data: ${JSON.stringify(marketData, null, 2)}

Respond with JSON only:
{
  "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
  "confidence": <0-100>,
  "reasoning": "Brief explanation"
}
`;

  try {
    const response = await generateAIAnalysis(systemPrompt, userPrompt, provider, 0.5, 500);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        sentiment: parsed.sentiment || 'NEUTRAL',
        confidence: parsed.confidence || 50,
        reasoning: parsed.reasoning || 'Unable to determine sentiment',
      };
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    return {
      sentiment: 'NEUTRAL',
      confidence: 0,
      reasoning: 'Error analyzing sentiment',
    };
  }
}
