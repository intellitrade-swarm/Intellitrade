

/**
 * AI Provider Factory
 * Supports multiple AI providers (OpenAI, Gemini, NVIDIA) for trading analysis
 */

import { callOpenAI } from './openai';
import { callGemini, GeminiMessage } from './gemini';
import { callNVIDIA } from './nvidia';
import { callGrok } from './grok';

export type AIProvider = 'OPENAI' | 'GEMINI' | 'NVIDIA' | 'GROK';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Call AI with specified provider
 */
export async function callAI(
  provider: AIProvider,
  messages: AIMessage[],
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  try {
    if (provider === 'GROK') {
      // Grok uses OpenAI-compatible format via X API
      return await callGrok(messages, temperature, maxTokens);
    } else if (provider === 'NVIDIA') {
      // NVIDIA uses OpenAI-compatible format
      return await callNVIDIA(messages, temperature, maxTokens);
    } else if (provider === 'GEMINI') {
      // Convert messages to Gemini format
      const geminiMessages: GeminiMessage[] = messages.map((msg, index) => {
        if (msg.role === 'system') {
          // Gemini doesn't have system role, prepend to first user message
          return {
            role: 'user' as const,
            parts: msg.content
          };
        }
        return {
          role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
          parts: msg.content
        };
      });

      // Merge system message with first user message if present
      if (messages[0]?.role === 'system' && messages[1]?.role === 'user') {
        const mergedMessages = [
          {
            role: 'user' as const,
            parts: `${messages[0].content}\n\n${messages[1].content}`
          },
          ...geminiMessages.slice(2)
        ];
        return await callGemini(mergedMessages, temperature, maxTokens);
      }

      return await callGemini(geminiMessages, temperature, maxTokens);
    } else {
      // Default to OpenAI
      return await callOpenAI(messages, temperature, maxTokens);
    }
  } catch (error) {
    console.error(`Error calling ${provider} API:`, error);
    throw error;
  }
}

/**
 * Get AI provider display name
 */
export function getProviderDisplayName(provider: AIProvider): string {
  const names: Record<AIProvider, string> = {
    'OPENAI': 'OpenAI GPT-4',
    'GEMINI': 'Google Gemini Pro',
    'NVIDIA': 'NVIDIA Nemotron',
    'GROK': 'Grok AI (X/Twitter)'
  };
  return names[provider];
}

/**
 * Get AI provider description
 */
export function getProviderDescription(provider: AIProvider): string {
  const descriptions: Record<AIProvider, string> = {
    'OPENAI': 'Advanced reasoning and analysis with GPT-4',
    'GEMINI': 'Google\'s latest multimodal AI with enhanced market understanding',
    'NVIDIA': 'NVIDIA\'s Llama 3.3 Nemotron - powerful reasoning and trading analysis',
    'GROK': 'X\'s Grok AI - real-time insights with access to X platform data and trends'
  };
  return descriptions[provider];
}

/**
 * Get all available AI providers
 */
export function getAllProviders(): AIProvider[] {
  return ['OPENAI', 'GEMINI', 'NVIDIA', 'GROK'];
}
