
/**
 * Grok AI Integration via X API
 * Uses X's Grok model for advanced market analysis and trading insights
 */

import { AIMessage } from './ai-providers';
import * as fs from 'fs';
import * as path from 'path';

interface GrokResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Load Grok API credentials from auth secrets
 */
function loadGrokAPICredentials(): { apiKey: string } {
  try {
    const secretsPath = path.join('/home/ubuntu/.config/abacusai_auth_secrets.json');
    const secretsData = JSON.parse(fs.readFileSync(secretsPath, 'utf-8'));
    
    const grokSecrets = secretsData['grok']?.secrets;
    if (!grokSecrets?.api_key?.value) {
      throw new Error('Grok API key not found in auth secrets');
    }
    
    return {
      apiKey: grokSecrets.api_key.value
    };
  } catch (error) {
    console.error('Error loading Grok API credentials:', error);
    throw new Error('Failed to load Grok API credentials');
  }
}

/**
 * Call Grok AI via X.AI API
 */
export async function callGrok(
  messages: AIMessage[],
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  try {
    const { apiKey } = loadGrokAPICredentials();
    
    console.log('🤖 Calling Grok AI via X.AI API...');
    
    // Format messages for Grok
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Call X.AI API with Grok model
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: formattedMessages,
        model: 'grok-4-latest', // Latest Grok model with reasoning capabilities
        temperature: temperature,
        max_tokens: maxTokens,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Grok API error:', response.status, errorText);
      throw new Error(`Grok API error: ${response.status} - ${errorText}`);
    }

    const data: GrokResponse = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in Grok response');
    }
    
    console.log('✅ Grok AI response received');
    return content;
    
  } catch (error) {
    console.error('❌ Error calling Grok AI:', error);
    throw error;
  }
}

/**
 * Test Grok connection
 */
export async function testGrokConnection(): Promise<boolean> {
  try {
    const testMessages: AIMessage[] = [
      {
        role: 'user',
        content: 'Hello Grok! Please respond with "Connection successful" if you can read this.'
      }
    ];
    
    const response = await callGrok(testMessages, 0.5, 50);
    console.log('Grok test response:', response);
    return true;
  } catch (error) {
    console.error('Grok connection test failed:', error);
    return false;
  }
}
