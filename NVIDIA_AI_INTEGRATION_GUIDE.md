
# NVIDIA AI Integration Guide

## Overview

The iCHAIN Swarms platform now supports **NVIDIA Llama 3.3 Nemotron Super 49B v1.5** as an AI provider for agent trading analysis and decision-making. This powerful language model brings advanced reasoning capabilities to your AI trading agents.

## What is NVIDIA Nemotron?

NVIDIA Llama 3.3 Nemotron is a state-of-the-art large language model optimized for:
- **Advanced reasoning** - Complex multi-step analysis
- **Market analysis** - Understanding trading patterns and trends
- **Decision making** - High-confidence trading signals
- **Risk assessment** - Sophisticated risk/reward evaluation

## Available AI Providers

Your agents can now use any of these AI providers:

| Provider | Model | Best For |
|----------|-------|----------|
| 🤖 **OpenAI** | GPT-4o Mini | General purpose trading, fast responses |
| 🧠 **Gemini** | Gemini Pro | Multimodal analysis, market understanding |
| ⚡ **NVIDIA** | Llama 3.3 Nemotron | Advanced reasoning, complex strategies |

## How to Use NVIDIA AI

### Option 1: Update an Existing Agent

You can update any existing agent to use NVIDIA AI:

```bash
cd nextjs_space
yarn tsx scripts/update-nvidia-agent.ts "Agent Name"
```

**Examples:**
```bash
# Update Technical Titan to use NVIDIA
yarn tsx scripts/update-nvidia-agent.ts "Technical Titan"

# Update Momentum Master to use NVIDIA
yarn tsx scripts/update-nvidia-agent.ts "Momentum Master"

# Update any agent
yarn tsx scripts/update-nvidia-agent.ts "Your Agent Name"
```

### Option 2: Direct Database Update

You can also update agents directly via the database:

```typescript
await prisma.aIAgent.update({
  where: { name: 'Agent Name' },
  data: { aiProvider: 'NVIDIA' }
});
```

### Option 3: API Update (If Available)

If you have an API endpoint for agent updates:

```javascript
const response = await fetch('/api/agents/update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: 'agent_id_here',
    aiProvider: 'NVIDIA'
  })
});
```

## Visual Indicators

Agents using NVIDIA AI are displayed with distinctive styling:

- **Badge**: ⚡ NVIDIA
- **Color**: Green-to-Emerald gradient
- **Status**: Visible in the AutoTrading Panel

## API Configuration

### Environment Setup

The NVIDIA API is configured via:
1. **API Key**: Stored in `~/.config/abacusai_auth_secrets.json`
2. **Endpoint**: `https://integrate.api.nvidia.com/v1`
3. **Model**: `nvidia/llama-3.3-nemotron-super-49b-v1.5`

### API Parameters

```typescript
{
  model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
  temperature: 0.6,        // Slightly lower for more focused responses
  top_p: 0.95,             // Nucleus sampling
  max_tokens: 1000,        // Response length
  frequency_penalty: 0,    // No repetition penalty
  presence_penalty: 0,     // No presence penalty
  stream: false            // Non-streaming by default
}
```

## Trading Analysis with NVIDIA

When an agent uses NVIDIA AI for trading decisions, it:

1. **Analyzes Market Data**
   - Current prices and trends
   - Volume patterns
   - Historical performance

2. **Evaluates Strategy**
   - Agent's specific strategy type
   - Risk parameters
   - Portfolio balance

3. **Generates Signals**
   - Action: BUY, SELL, or HOLD
   - Symbol: Which asset to trade
   - Confidence: 0.0 to 1.0
   - Reasoning: Detailed explanation
   - Quantity: Position size

4. **Risk Management**
   - Stop loss levels
   - Take profit targets
   - Position sizing

## Example Trading Flow

```
1. Agent receives market data from Aster Dex
2. NVIDIA AI analyzes the data with agent's strategy
3. AI returns trading signal with reasoning
4. Agent executes trade if confidence > threshold
5. Transaction is recorded on blockchain
6. Portfolio and metrics are updated
```

## Performance Comparison

Test different AI providers with the same agent to compare:

- **Response time**
- **Win rate**
- **Sharpe ratio**
- **Profit/Loss**
- **Risk-adjusted returns**

## Technical Implementation

### Provider Integration

The NVIDIA provider is integrated into the multi-AI system:

```typescript
// lib/ai-providers.ts
export type AIProvider = 'OPENAI' | 'GEMINI' | 'NVIDIA';

export async function callAI(
  provider: AIProvider,
  messages: AIMessage[],
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  if (provider === 'NVIDIA') {
    return await callNVIDIA(messages, temperature, maxTokens);
  }
  // ... other providers
}
```

### Database Schema

```prisma
enum AIProvider {
  OPENAI
  GEMINI
  NVIDIA
}

model AIAgent {
  id           String      @id @default(cuid())
  name         String      @unique
  aiProvider   AIProvider  @default(OPENAI)
  // ... other fields
}
```

## Troubleshooting

### API Key Not Found

If you see an error about missing API key:

```bash
Error: NVIDIA API key not found
```

**Solution**: Ensure the API key is configured in `~/.config/abacusai_auth_secrets.json`:

```json
{
  "nvidia": {
    "secrets": {
      "api_key": {
        "value": "your_api_key_here"
      }
    }
  }
}
```

### API Rate Limits

NVIDIA API has rate limits. If you encounter rate limit errors:

- Reduce trading frequency
- Implement retry logic with exponential backoff
- Consider caching recent analyses

### Model Availability

If the model is unavailable:

```bash
Error: NVIDIA API error: Model not found
```

**Solution**: Verify the model name is correct:
- Current model: `nvidia/llama-3.3-nemotron-super-49b-v1.5`
- Check NVIDIA's documentation for model availability

## Best Practices

1. **Start with One Agent**: Test NVIDIA AI with one agent before switching multiple agents
2. **Monitor Performance**: Track metrics to compare against other AI providers
3. **Adjust Parameters**: Fine-tune temperature and other parameters for your strategy
4. **Diversify**: Use different AI providers across agents for portfolio diversification
5. **Review Decisions**: Regularly check AI reasoning and trading logic

## Resources

- **NVIDIA NIM**: [https://build.nvidia.com](https://build.nvidia.com)
- **API Documentation**: NVIDIA AI Endpoints
- **Model Card**: Llama 3.3 Nemotron specifications
- **iCHAIN Swarms**: [https://ipollswarms.abacusai.app](https://ipollswarms.abacusai.app)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review NVIDIA API documentation
3. Check agent logs and error messages
4. Test with manual trading first

---

**Last Updated**: October 26, 2025  
**Version**: 1.0.0  
**Status**: ✅ Fully Integrated and Operational
