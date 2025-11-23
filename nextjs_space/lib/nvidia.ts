

/**
 * NVIDIA AI API Client
 * Provides access to NVIDIA's Llama 3.3 Nemotron and other models via their API
 */

import fs from 'fs';
import path from 'path';

interface NVIDIAConfig {
  apiKey: string;
  baseUrl: string;
}

function getNVIDIAConfig(): NVIDIAConfig {
  // Check if using local NIM endpoint (e.g., Docker container)
  const nimEndpoint = process.env.NVIDIA_NIM_ENDPOINT;
  
  // First try environment variable
  let apiKey = process.env.NVIDIA_API_KEY;
  
  // If not found, try reading from auth secrets file
  if (!apiKey && !nimEndpoint) {
    try {
      const authSecretsPath = path.join(process.env.HOME || '/home/ubuntu', '.config', 'abacusai_auth_secrets.json');
      if (fs.existsSync(authSecretsPath)) {
        const authData = JSON.parse(fs.readFileSync(authSecretsPath, 'utf-8'));
        apiKey = authData?.nvidia?.secrets?.api_key?.value;
      }
    } catch (error) {
      console.error('Error reading NVIDIA API key from auth secrets:', error);
    }
  }
  
  // If using local NIM, API key is optional (depends on container config)
  if (!apiKey && !nimEndpoint) {
    throw new Error('NVIDIA API key not found. Please configure the NVIDIA API key or set NVIDIA_NIM_ENDPOINT for local inference.');
  }
  
  return {
    apiKey: apiKey || 'local-nim',
    baseUrl: nimEndpoint || 'https://integrate.api.nvidia.com/v1'
  };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Get the appropriate model name based on endpoint
 */
function getModelName(config: NVIDIAConfig): string {
  // If using local NIM, check for specific model in endpoint or use default
  if (config.baseUrl !== 'https://integrate.api.nvidia.com/v1') {
    // Local NIM endpoint - use the model name appropriate for local deployment
    return 'nvidia/nvidia-nemotron-nano-9b-v2';
  }
  // Cloud API - use the more powerful model
  return 'nvidia/llama-3.3-nemotron-super-49b-v1.5';
}

/**
 * Call NVIDIA API for chat completions
 */
export async function callNVIDIA(
  messages: ChatMessage[],
  temperature: number = 0.6,
  maxTokens: number = 1000
): Promise<string> {
  const config = getNVIDIAConfig();
  const modelName = getModelName(config);
  
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature,
        top_p: 0.95,
        max_tokens: maxTokens,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Unknown error';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || errorText;
      } catch {
        errorMessage = errorText;
      }
      throw new Error(`NVIDIA API error: ${errorMessage}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling NVIDIA API:', error);
    throw error;
  }
}

/**
 * Call NVIDIA API with streaming support
 */
export async function callNVIDIAStream(
  messages: ChatMessage[],
  temperature: number = 0.6,
  maxTokens: number = 1000,
  onChunk: (chunk: string) => void
): Promise<string> {
  const config = getNVIDIAConfig();
  const modelName = getModelName(config);
  
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature,
        top_p: 0.95,
        max_tokens: maxTokens,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA API error: ${errorText}`);
    }

    let fullContent = '';
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              fullContent += content;
              onChunk(content);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    return fullContent;
  } catch (error) {
    console.error('Error calling NVIDIA API with streaming:', error);
    throw error;
  }
}
