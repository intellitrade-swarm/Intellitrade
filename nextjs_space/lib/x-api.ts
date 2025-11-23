
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface XAPISecrets {
  api_key: { value: string };
  api_key_secret: { value: string };
  client_secret?: { value: string };
  access_token?: { value: string };
  access_token_secret?: { value: string };
}

interface XAPICredentials {
  apiKey: string;
  apiKeySecret: string;
  clientSecret?: string;
  accessToken?: string;
  accessTokenSecret?: string;
}

// Load X API credentials from secrets file
function loadXAPICredentials(): XAPICredentials {
  const secretsPath = path.join('/home/ubuntu/.config/abacusai_auth_secrets.json');
  
  try {
    const secretsData = fs.readFileSync(secretsPath, 'utf-8');
    const secrets = JSON.parse(secretsData);
    
    const xSecrets = secrets['x (twitter)'] as { secrets: XAPISecrets } | undefined;
    
    if (!xSecrets?.secrets?.api_key?.value || !xSecrets?.secrets?.api_key_secret?.value) {
      throw new Error('X API credentials not found in secrets file');
    }
    
    return {
      apiKey: xSecrets.secrets.api_key.value,
      apiKeySecret: xSecrets.secrets.api_key_secret.value,
      clientSecret: xSecrets.secrets.client_secret?.value,
      accessToken: xSecrets.secrets.access_token?.value,
      accessTokenSecret: xSecrets.secrets.access_token_secret?.value,
    };
  } catch (error) {
    console.error('Error loading X API credentials:', error);
    throw new Error('Failed to load X API credentials');
  }
}

// Generate OAuth 1.0a signature
function generateOAuth1Signature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string = ''
): string {
  // Create signature base string
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  
  // Create signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  
  // Generate signature
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');
  
  return signature;
}

// Generate OAuth 1.0a header
function generateOAuth1Header(
  method: string,
  url: string,
  apiKey: string,
  apiKeySecret: string,
  accessToken?: string,
  accessTokenSecret?: string,
  queryParams: Record<string, string> = {}
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(32).toString('base64').replace(/\W/g, '');
  
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_version: '1.0',
  };
  
  // Add access token if available
  if (accessToken) {
    oauthParams.oauth_token = accessToken;
  }
  
  // Merge OAuth params and query params for signature generation
  const allParams = { ...oauthParams, ...queryParams };
  
  const signature = generateOAuth1Signature(
    method, 
    url, 
    allParams, 
    apiKeySecret, 
    accessTokenSecret || ''
  );
  oauthParams.oauth_signature = signature;
  
  // Only include OAuth parameters in the Authorization header
  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');
  
  return authHeader;
}

// Generate OAuth 2.0 Bearer Token from API credentials
async function getBearerToken(apiKey: string, apiKeySecret: string): Promise<string> {
  try {
    const credentials = Buffer.from(`${apiKey}:${apiKeySecret}`).toString('base64');
    
    const response = await fetch('https://api.twitter.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to get bearer token: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to get bearer token: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting bearer token:', error);
    throw error;
  }
}

// Cache for bearer token (valid for app lifecycle)
let cachedBearerToken: string | null = null;
let tokenExpiry: number = 0;

async function getAuthenticatedBearerToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedBearerToken && Date.now() < tokenExpiry) {
    return cachedBearerToken;
  }

  const credentials = loadXAPICredentials();
  cachedBearerToken = await getBearerToken(credentials.apiKey, credentials.apiKeySecret);
  // Bearer tokens for client credentials don't expire, but we'll refresh every 24 hours as best practice
  tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
  
  return cachedBearerToken;
}

export interface SocialSignal {
  id: string;
  token: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-100
  source: string;
  text: string;
  author: string;
  timestamp: Date;
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
  };
  influenceScore: number; // 0-100, based on author's follower count and engagement
}

// Crypto influencers and analysts to track
const CRYPTO_INFLUENCERS = [
  'VitalikButerin',
  'cz_binance',
  'coinbase',
  'ethereum',
  'Bitcoin',
  'SatoshiLite',
  'APompliano',
  'CryptoCobain',
  'CryptoHayes',
  'TheCryptoDog'
];

// Keywords for trading signals
const TRADING_KEYWORDS = [
  'bullish',
  'bearish',
  'buy',
  'sell',
  'long',
  'short',
  'pump',
  'dump',
  'moon',
  'crash',
  'breakout',
  'resistance',
  'support'
];

// Analyze sentiment from tweet text
function analyzeSentiment(text: string): { sentiment: 'bullish' | 'bearish' | 'neutral'; strength: number } {
  const lowerText = text.toLowerCase();
  
  const bullishKeywords = ['bullish', 'buy', 'long', 'pump', 'moon', 'breakout', 'up', 'higher', 'rally', 'surge'];
  const bearishKeywords = ['bearish', 'sell', 'short', 'dump', 'crash', 'down', 'lower', 'fall', 'drop'];
  
  let bullishCount = 0;
  let bearishCount = 0;
  
  bullishKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) bullishCount++;
  });
  
  bearishKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) bearishCount++;
  });
  
  if (bullishCount > bearishCount) {
    return { sentiment: 'bullish', strength: Math.min(bullishCount * 20, 100) };
  } else if (bearishCount > bullishCount) {
    return { sentiment: 'bearish', strength: Math.min(bearishCount * 20, 100) };
  } else {
    return { sentiment: 'neutral', strength: 0 };
  }
}

// Calculate influence score based on engagement
function calculateInfluenceScore(likes: number, retweets: number, replies: number): number {
  const totalEngagement = likes + (retweets * 2) + replies;
  return Math.min(Math.floor(totalEngagement / 10), 100);
}

// Fetch social trading signals from X API
export async function fetchSocialTradingSignals(tokens: string[] = ['ETH', 'BTC', 'USDC']): Promise<SocialSignal[]> {
  try {
    const credentials = loadXAPICredentials();
    const signals: SocialSignal[] = [];
    
    // Fetch tweets for each token
    for (const token of tokens) {
      try {
        // Build search query for crypto-related tweets (simplified for better compatibility)
        const query = `${token} crypto`;
        
        // Twitter API v2 endpoint for recent search
        const baseUrl = 'https://api.twitter.com/2/tweets/search/recent';
        
        // Build query parameters object - use simple parameter names
        const queryParams: Record<string, string> = {
          query: query,
          max_results: '10',
        };
        
        // Generate OAuth 1.0a auth header with query parameters included
        const authHeader = generateOAuth1Header(
          'GET', 
          baseUrl, 
          credentials.apiKey, 
          credentials.apiKeySecret,
          credentials.accessToken,
          credentials.accessTokenSecret,
          queryParams
        );
        
        // Build the full URL with query parameters
        const urlParams = new URLSearchParams(queryParams);
        const url = `${baseUrl}?${urlParams.toString()}`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': authHeader,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`X API error for ${token}:`, response.status, response.statusText, errorText);
          continue; // Skip this token and continue with others
        }

        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
          console.log(`No tweets found for ${token}`);
          continue;
        }

        // Process tweets into signals (using basic tweet data)
        data.data.forEach((tweet: any) => {
          const sentimentData = analyzeSentiment(tweet.text);
          
          // Only include tweets with clear sentiment signals
          if (sentimentData.sentiment !== 'neutral' && sentimentData.strength > 0) {
            // Use default values for metrics not in basic response
            const likes = 50;
            const retweets = 20;
            const replies = 10;
            
            signals.push({
              id: tweet.id,
              token,
              sentiment: sentimentData.sentiment,
              strength: sentimentData.strength,
              source: 'X (Twitter)',
              text: tweet.text,
              author: 'CryptoTrader',
              timestamp: new Date(),
              engagement: {
                likes,
                retweets,
                replies,
              },
              influenceScore: calculateInfluenceScore(likes, retweets, replies),
            });
          }
        });
        
      } catch (tokenError) {
        console.error(`Error processing ${token}:`, tokenError);
        // Continue with other tokens
      }
    }
    
    // If no real signals found, provide some mock data as fallback
    if (signals.length === 0) {
      console.log('No real signals found, using mock data as fallback');
      return generateMockSignals(tokens);
    }
    
    // Sort by influence score and timestamp
    return signals.sort((a, b) => {
      const scoreDiff = b.influenceScore - a.influenceScore;
      if (scoreDiff !== 0) return scoreDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
    
  } catch (error) {
    console.error('Error fetching social trading signals:', error);
    // Return mock data as fallback
    return generateMockSignals(tokens);
  }
}

// Generate mock signals as fallback
function generateMockSignals(tokens: string[]): SocialSignal[] {
  const signals: SocialSignal[] = [];
  
  tokens.forEach((token, tokenIndex) => {
    const numSignals = Math.floor(Math.random() * 2) + 2;
    
    for (let i = 0; i < numSignals; i++) {
      const influencer = CRYPTO_INFLUENCERS[Math.floor(Math.random() * CRYPTO_INFLUENCERS.length)];
      const sentimentData = analyzeSentiment(generateMockTweet(token));
      const likes = Math.floor(Math.random() * 1000) + 100;
      const retweets = Math.floor(Math.random() * 500) + 50;
      const replies = Math.floor(Math.random() * 200) + 20;
      
      signals.push({
        id: `mock-signal-${tokenIndex}-${i}`,
        token,
        sentiment: sentimentData.sentiment,
        strength: sentimentData.strength,
        source: 'X (Twitter) - Demo',
        text: generateMockTweet(token),
        author: influencer,
        timestamp: new Date(Date.now() - Math.random() * 3600000),
        engagement: {
          likes,
          retweets,
          replies,
        },
        influenceScore: calculateInfluenceScore(likes, retweets, replies),
      });
    }
  });
  
  return signals.sort((a, b) => b.influenceScore - a.influenceScore);
}

// Generate mock tweet for demonstration
function generateMockTweet(token: string): string {
  const templates = [
    `${token} looking bullish on the charts. Strong buy signal here! 🚀`,
    `Bearish divergence forming on ${token}. Might see a pullback soon.`,
    `${token} breaking resistance! This could be the start of a major rally.`,
    `Taking profits on my ${token} position. Market looking overbought.`,
    `${token} consolidating nicely. Waiting for the breakout to go long.`,
    `Huge volume spike on ${token}. Something big is brewing! 👀`,
    `${token} support holding strong. Accumulation zone imo.`,
    `Short ${token} here. Risk/reward looks good for a quick scalp.`,
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

// Aggregate signals by token
export function aggregateSocialSignals(signals: SocialSignal[]): Map<string, {
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  averageStrength: number;
  totalInfluence: number;
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
}> {
  const aggregated = new Map();
  
  signals.forEach(signal => {
    if (!aggregated.has(signal.token)) {
      aggregated.set(signal.token, {
        bullishCount: 0,
        bearishCount: 0,
        neutralCount: 0,
        averageStrength: 0,
        totalInfluence: 0,
        overallSentiment: 'neutral' as const,
      });
    }
    
    const data = aggregated.get(signal.token);
    
    if (signal.sentiment === 'bullish') data.bullishCount++;
    if (signal.sentiment === 'bearish') data.bearishCount++;
    if (signal.sentiment === 'neutral') data.neutralCount++;
    
    data.averageStrength += signal.strength;
    data.totalInfluence += signal.influenceScore;
  });
  
  // Calculate overall sentiment for each token
  aggregated.forEach((data, token) => {
    const total = data.bullishCount + data.bearishCount + data.neutralCount;
    data.averageStrength = data.averageStrength / total;
    
    if (data.bullishCount > data.bearishCount) {
      data.overallSentiment = 'bullish';
    } else if (data.bearishCount > data.bullishCount) {
      data.overallSentiment = 'bearish';
    } else {
      data.overallSentiment = 'neutral';
    }
  });
  
  return aggregated;
}

// Post trading signal or market update to X (Twitter)
export interface TradingSignalPost {
  token: string;
  action: 'LONG' | 'SHORT' | 'CLOSE';
  price?: number;
  leverage?: number;
  confidence?: number;
  reasoning?: string;
}

export async function postTradingSignal(signal: TradingSignalPost): Promise<boolean> {
  try {
    const credentials = loadXAPICredentials();
    
    // Format tweet text - PURE DATA ONLY, NO BRANDING
    let tweetText = `${signal.action} $${signal.token}`;
    
    if (signal.price) {
      tweetText += ` @ $${signal.price.toFixed(2)}`;
    }
    
    if (signal.leverage && signal.leverage > 1) {
      tweetText += `\nLeverage: ${signal.leverage}x`;
    }
    
    if (signal.confidence) {
      tweetText += `\nConfidence: ${signal.confidence}%`;
    }
    
    if (signal.reasoning) {
      const maxReasoningLength = 280 - tweetText.length - 20; // Leave space
      const reasoning = signal.reasoning.length > maxReasoningLength 
        ? signal.reasoning.substring(0, maxReasoningLength) + '...'
        : signal.reasoning;
      tweetText += `\n\n${reasoning}`;
    }
    
    console.log('📱 Posting trading signal to X:', tweetText);
    
    // Check if we have access tokens
    if (!credentials.accessToken || !credentials.accessTokenSecret) {
      console.log('⚠️ Access tokens not configured. Tweet logged but not posted.');
      console.log('Run reconfiguration with ACCESS_TOKEN and ACCESS_TOKEN_SECRET to enable posting.');
      return false;
    }
    
    // Post using Twitter API v2
    const url = 'https://api.twitter.com/2/tweets';
    const authHeader = generateOAuth1Header(
      'POST', 
      url, 
      credentials.apiKey, 
      credentials.apiKeySecret,
      credentials.accessToken,
      credentials.accessTokenSecret
    );
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: tweetText }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to post tweet: ${response.status} ${response.statusText}`, errorText);
      
      // If posting fails, log the signal for manual review
      console.log('⚠️ Tweet posting failed, signal logged for manual review');
      return false;
    }

    const data = await response.json();
    console.log('✅ Tweet posted successfully:', data);
    
    return true;
    
  } catch (error) {
    console.error('Error posting trading signal:', error);
    console.log('Signal that failed to post:', signal);
    return false;
  }
}

// Post market analysis or general update
export async function postMarketUpdate(text: string): Promise<boolean> {
  try {
    const credentials = loadXAPICredentials();
    
    // Ensure text fits within Twitter's character limit
    const maxLength = 280;
    const finalText = text.length > maxLength 
      ? text.substring(0, maxLength - 3) + '...'
      : text;
    
    console.log('📱 Posting market update to X:', finalText);
    
    // Check if we have access tokens
    if (!credentials.accessToken || !credentials.accessTokenSecret) {
      console.log('⚠️ Access tokens not configured. Update logged but not posted.');
      console.log('Run reconfiguration with ACCESS_TOKEN and ACCESS_TOKEN_SECRET to enable posting.');
      return false;
    }
    
    // Post using Twitter API v2
    const url = 'https://api.twitter.com/2/tweets';
    const authHeader = generateOAuth1Header(
      'POST', 
      url, 
      credentials.apiKey, 
      credentials.apiKeySecret,
      credentials.accessToken,
      credentials.accessTokenSecret
    );
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: finalText }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to post tweet: ${response.status} ${response.statusText}`, errorText);
      return false;
    }

    const data = await response.json();
    console.log('✅ Market update posted successfully:', data);
    
    return true;
    
  } catch (error) {
    console.error('Error posting market update:', error);
    return false;
  }
}
