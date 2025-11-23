# 🔐 How to Get Coinbase Advanced Trade API Credentials

## ⚠️ IMPORTANT: You Need Advanced Trade API Keys

For **real cryptocurrency trading**, you must use **Coinbase Advanced Trade API** credentials.

❌ **NOT** Coinbase Commerce API (for merchant payments)  
❌ **NOT** Coinbase Cloud API  
✅ **YES** Coinbase Advanced Trade API (for trading)

---

## Step-by-Step Guide

### 1. Create Coinbase Account
1. Go to https://www.coinbase.com
2. Sign up or log in
3. Complete identity verification (KYC)
4. Fund your account with USD

### 2. Access API Settings
1. Go to https://www.coinbase.com/settings/api
2. Or navigate: Profile → Settings → API

### 3. Create API Key
1. Click "New API Key"
2. Give it a name (e.g., "iCHAIN Swarms Trading")
3. Select permissions:
   - ✅ **wallet:accounts:read** - View account balances
   - ✅ **wallet:transactions:read** - View transactions
   - ✅ **wallet:buys:create** - Execute buy orders
   - ✅ **wallet:sells:create** - Execute sell orders
   - ✅ **wallet:trades:create** - Execute trades
4. Save the API Key and API Secret immediately
   - ⚠️ API Secret is shown ONLY ONCE
   - Store it securely

### 4. Alternative: Coinbase Cloud
If you can't find Advanced Trade API:
1. Go to https://cloud.coinbase.com
2. Create a new project
3. Generate API credentials
4. Select "Trading" permissions

---

## API Credential Format

You should receive:
- **API Key**: Format like `organizations/{org_id}/apiKeys/{key_id}`
- **API Secret**: Base64-encoded string (long)
- **Private Key**: PEM format (for Cloud API)

Example formats:
```
API Key: organizations/abc123.../apiKeys/xyz789...
API Secret: -----BEGIN EC PRIVATE KEY-----...-----END EC PRIVATE KEY-----
```

OR

```
API Key: 969056aa-85f1-44f5-bac7-2d1c7f479525
API Secret: suuU4nHHAy4hCyz6sZ6zXLgjHAAtnuUR3b5G4C16mNPU...
```

---

## Testing Your API Keys

Once you have the correct API credentials:

1. Update `.env` file:
```bash
COINBASE_API_KEY=your_api_key_here
COINBASE_API_SECRET=your_api_secret_here
```

2. Test the connection:
```bash
yarn tsx --require dotenv/config scripts/test-coinbase-connection.ts
```

3. Should see:
```
✅ Coinbase API connection test PASSED!
🚀 Ready for REAL trading!
```

---

## Common Issues

### 401 Unauthorized
**Causes:**
- Wrong API type (Commerce vs Trade)
- Incorrect credentials
- Missing permissions
- Expired API key

**Solution:**
1. Verify you're using Advanced Trade API
2. Check permissions include trading
3. Regenerate API key if needed

### 403 Forbidden
**Causes:**
- Account not verified
- Trading not enabled
- Region restrictions

**Solution:**
1. Complete KYC verification
2. Enable trading on your account
3. Check if trading is available in your region

---

## Security Best Practices

✅ **DO:**
- Store API keys in `.env` file (never in code)
- Use API keys with minimum required permissions
- Rotate API keys periodically
- Enable 2FA on your Coinbase account
- Monitor API usage regularly

❌ **DON'T:**
- Share API keys publicly
- Commit API keys to version control
- Use same API keys across multiple apps
- Give API keys full account access

---

## Resources

- Coinbase Advanced Trade API Docs: https://docs.cloud.coinbase.com/advanced-trade-api/docs
- Coinbase API Settings: https://www.coinbase.com/settings/api
- Coinbase Cloud Console: https://cloud.coinbase.com
- Coinbase API Status: https://status.coinbase.com

---

## Need Help?

If you're still having issues:
1. Check Coinbase API documentation
2. Verify your account is fully verified
3. Contact Coinbase support: https://help.coinbase.com
4. Ensure your region supports trading

---

**Once you have the correct API credentials, update them in the `.env` file and the trading platform will be ready!** 🚀
