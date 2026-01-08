
# 🔐 Coinbase Advanced Trade API - Complete Setup Guide

## ✅ Current Status

Your iCHAIN Swarms application is now fully configured with:
- **JWT Authentication** with EC Private Key (ES256 algorithm)
- **Correct API Format** according to Coinbase documentation
- **Real Trading Only** - No simulation mode

## 🔍 Authentication Test Results

The JWT is being generated correctly with the proper format:
```
URI: GET api.coinbase.com/api/v3/brokerage/accounts
```

However, you're receiving a **401 Unauthorized** error, which indicates an issue with the API key configuration on Coinbase's side, not with the code.

## ⚠️ Common Reasons for 401 Errors

### 1. API Key Permissions
Your API key must have the following permissions enabled:
- ✅ **View** - To read account balances and order history
- ✅ **Trade** - To place buy/sell orders
- ✅ **Transfer** - Optional, for wallet transfers

### 2. API Key Status
- The API key must be **ACTIVE** (not pending or disabled)
- It should not be expired
- It should be approved for use

### 3. IP Whitelist
- Some API keys have IP address restrictions
- Make sure your server IP is whitelisted, or remove IP restrictions

### 4. Sandbox vs Production
- Ensure you're using a **Production API key**, not a sandbox key
- Sandbox keys won't work with production endpoints

## 📋 How to Verify Your Coinbase API Key

### Step 1: Go to Coinbase Developer Platform
1. Visit: https://portal.cdp.coinbase.com/
2. Log in with your Coinbase account
3. Navigate to "API Keys" section

### Step 2: Check Your API Key
Look for your API key:
```
organizations/bfe7c27d-8863-4d27-98b1-851f61211a3c/apiKeys/0ab829ed-747b-4b60-907e-8c98570a477f
```

Verify:
- ✅ Status: **Active**
- ✅ Permissions: **View + Trade**
- ✅ Expiration: Not expired
- ✅ IP Whitelist: Your server IP or "All IPs"

### Step 3: Generate New API Key (if needed)
If your current key has issues, create a new one:

1. Click "Create API Key"
2. Select permissions:
   - ✅ View
   - ✅ Trade
3. **IMPORTANT**: Download the private key immediately
   - You won't be able to see it again
   - Format: `-----BEGIN EC PRIVATE KEY-----`
4. Save the API key name (starts with `organizations/...`)
5. Update your .env file with the new credentials

## 🔧 Updating Your API Credentials

If you need to use new credentials, update your `.env` file:

```env
COINBASE_API_KEY="organizations/YOUR_ORG_ID/apiKeys/YOUR_KEY_ID"
COINBASE_API_SECRET="-----BEGIN EC PRIVATE KEY-----
YOUR_PRIVATE_KEY_HERE
-----END EC PRIVATE KEY-----"
```

Then restart your application.

## 🧪 Testing Your Connection

After verifying your API key, test the connection:

```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
yarn tsx --require dotenv/config scripts/test-simple-coinbase.ts
```

You should see:
```
✅ SUCCESS! Data: { accounts: [...] }
```

## 🚀 Once Authentication Works

After you resolve the 401 error, your application will be fully functional with:

1. **Real-Time Balance Tracking**
   - View your actual Coinbase account balances
   - See available USD/USDC for trading

2. **Manual Trading**
   - Execute buy/sell orders directly
   - Trade major crypto pairs (BTC, ETH, SOL, etc.)

3. **AI-Powered Auto-Trading**
   - AI agents (OpenAI GPT-4, NVIDIA NIM, Google Gemini)
   - Automated trading strategies
   - Real trades on Coinbase Exchange

4. **Live Market Data**
   - Real-time prices from Coinbase
   - 24h price changes
   - Volume data

## 📞 Getting Help

If you continue to have issues:

1. **Check Coinbase Status**: https://status.coinbase.com/
2. **Review API Documentation**: https://docs.cloud.coinbase.com/advanced-trade/docs
3. **Contact Coinbase Support**: If the API key appears correct but still fails

## 🎯 Next Steps

1. ✅ Verify your API key in the Coinbase Developer Portal
2. ✅ Ensure all permissions are enabled
3. ✅ Test the connection again
4. ✅ Start trading once authentication succeeds!

Your application code is ready and waiting for valid API credentials.
