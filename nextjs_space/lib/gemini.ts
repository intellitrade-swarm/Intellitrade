
/**
 * Google Gemini API Client
 * Provides access to Gemini Pro for advanced AI trading analysis
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  
  return genAI;
}

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: string;
}

/**
 * Call Gemini API for text generation
 */
export async function callGemini(
  messages: GeminiMessage[],
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  try {
    const model = getGeminiClient().getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      }
    });

    // Build conversation history
    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts }],
      })),
    });

    // Send the last message
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

/**
 * Call Gemini with simple prompt (no chat history)
 */
export async function callGeminiSimple(
  prompt: string,
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  try {
    const model = getGeminiClient().getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}
