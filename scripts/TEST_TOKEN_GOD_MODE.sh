
#!/bin/bash

# Token God Mode Endpoint Testing Script
# Tests all 14 Token God Mode endpoints

BASE_URL="http://localhost:3000"
TEST_TOKEN="0xdAC17F958D2ee523a2206206994597C13D831ec7" # USDT
TEST_CHAIN="ethereum"

echo "🔍 Testing Nansen Token God Mode Endpoints"
echo "=========================================="
echo ""

# Test 1: Token Information
echo "1️⃣  Testing Token Information..."
RESULT=$(curl -s "${BASE_URL}/api/nansen/token-god-mode/token-information?address=${TEST_TOKEN}&chain=${TEST_CHAIN}" | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "✅ Token Information - OK"
else
  echo "❌ Token Information - FAILED"
fi
echo ""

# Test 2: Token Screener
echo "2️⃣  Testing Token Screener..."
RESULT=$(curl -s "${BASE_URL}/api/nansen/token-god-mode/token-screener?chain=${TEST_CHAIN}&limit=10" | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "✅ Token Screener - OK"
else
  echo "❌ Token Screener - FAILED"
fi
echo ""

# Test 3: Flow Intelligence
echo "3️⃣  Testing Flow Intelligence..."
RESULT=$(curl -s "${BASE_URL}/api/nansen/token-god-mode/flow-intelligence?address=${TEST_TOKEN}&chain=${TEST_CHAIN}" | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "✅ Flow Intelligence - OK"
else
  echo "❌ Flow Intelligence - FAILED"
fi
echo ""

# Test 4: Holders
echo "4️⃣  Testing Holders..."
RESULT=$(curl -s "${BASE_URL}/api/nansen/token-god-mode/holders?address=${TEST_TOKEN}&chain=${TEST_CHAIN}" | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "✅ Holders - OK"
else
  echo "❌ Holders - FAILED"
fi
echo ""

# Test 5: Flows
echo "5️⃣  Testing Flows..."
RESULT=$(curl -s "${BASE_URL}/api/nansen/token-god-mode/flows?address=${TEST_TOKEN}&chain=${TEST_CHAIN}" | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "✅ Flows - OK"
else
  echo "❌ Flows - FAILED"
fi
echo ""

# Test 6: Who Bought/Sold
echo "6️⃣  Testing Who Bought/Sold..."
RESULT=$(curl -s "${BASE_URL}/api/nansen/token-god-mode/who-bought-sold?address=${TEST_TOKEN}&chain=${TEST_CHAIN}" | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "✅ Who Bought/Sold - OK"
else
  echo "❌ Who Bought/Sold - FAILED"
fi
echo ""

# Test 7: DEX Trades
echo "7️⃣  Testing DEX Trades..."
RESULT=$(curl -s "${BASE_URL}/api/nansen/token-god-mode/dex-trades?address=${TEST_TOKEN}&chain=${TEST_CHAIN}" | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "✅ DEX Trades - OK"
else
  echo "❌ DEX Trades - FAILED"
fi
echo ""

# Test 8: Token Transfers
echo "8️⃣  Testing Token Transfers..."
RESULT=$(curl -s "${BASE_URL}/api/nansen/token-god-mode/token-transfers?address=${TEST_TOKEN}&chain=${TEST_CHAIN}" | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "✅ Token Transfers - OK"
else
  echo "❌ Token Transfers - FAILED"
fi
echo ""

# Test 9: Jupiter DCAs
echo "9️⃣  Testing Jupiter DCAs..."
RESULT=$(curl -s "${BASE_URL}/api/nansen/token-god-mode/jupiter-dcas?tokenMint=So11111111111111111111111111111111111111112" | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "✅ Jupiter DCAs - OK (Simulated)"
else
  echo "❌ Jupiter DCAs - FAILED"
fi
echo ""

# Test 10: PnL Leaderboard
echo "🔟 Testing PnL Leaderboard..."
RESULT=$(curl -s "${BASE_URL}/api/nansen/token-god-mode/pnl-leaderboard?address=${TEST_TOKEN}&chain=${TEST_CHAIN}" | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "✅ PnL Leaderboard - OK"
else
  echo "❌ PnL Leaderboard - FAILED"
fi
echo ""

# Test 11: Perp Screener
echo "1️⃣1️⃣  Testing Perp Screener..."
RESULT=$(curl -s "${BASE_URL}/api/nansen/token-god-mode/perp-screener?chain=${TEST_CHAIN}" | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "✅ Perp Screener - OK"
else
  echo "❌ Perp Screener - FAILED"
fi
echo ""

# Test 12: Perp PnL Leaderboard
echo "1️⃣2️⃣  Testing Perp PnL Leaderboard..."
RESULT=$(curl -s "${BASE_URL}/api/nansen/token-god-mode/perp-pnl-leaderboard?platform=GMX" | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "✅ Perp PnL Leaderboard - OK"
else
  echo "❌ Perp PnL Leaderboard - FAILED"
fi
echo ""

# Test 13: Perp Positions
echo "1️⃣3️⃣  Testing Perp Positions..."
RESULT=$(curl -s "${BASE_URL}/api/nansen/token-god-mode/perp-positions?address=${TEST_TOKEN}&chain=${TEST_CHAIN}" | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "✅ Perp Positions - OK"
else
  echo "❌ Perp Positions - FAILED"
fi
echo ""

# Test 14: Perp Trades
echo "1️⃣4️⃣  Testing Perp Trades..."
RESULT=$(curl -s "${BASE_URL}/api/nansen/token-god-mode/perp-trades?address=${TEST_TOKEN}&chain=${TEST_CHAIN}" | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "✅ Perp Trades - OK"
else
  echo "❌ Perp Trades - FAILED"
fi
echo ""

echo "=========================================="
echo "✅ All Token God Mode endpoints tested!"
echo "=========================================="
