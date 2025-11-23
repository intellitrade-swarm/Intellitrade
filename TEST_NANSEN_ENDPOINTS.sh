
#!/bin/bash

# Nansen API Endpoints Test Script
# Tests all Nansen API endpoints to ensure they are working

echo "======================================"
echo "🧪 TESTING NANSEN API ENDPOINTS"
echo "======================================"
echo ""

BASE_URL="http://localhost:3000"
TEST_TOKEN="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" # WETH
TEST_ADDRESS="0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503" # Binance wallet

echo "🔍 Testing Smart Money Endpoints..."
echo "-----------------------------------"

echo "1. Smart Money Holdings"
curl -s "${BASE_URL}/api/nansen/smart-money/holdings?address=${TEST_TOKEN}&limit=10" | jq -r '.success' && echo "✅ Holdings endpoint OK" || echo "❌ Holdings endpoint FAILED"

echo "2. Smart Money Historical Holdings"
curl -s "${BASE_URL}/api/nansen/smart-money/historical-holdings?address=${TEST_TOKEN}&timeframe=7d" | jq -r '.success' && echo "✅ Historical Holdings endpoint OK" || echo "❌ Historical Holdings endpoint FAILED"

echo "3. Smart Money DEX Trades"
curl -s "${BASE_URL}/api/nansen/smart-money/dex-trades?address=${TEST_TOKEN}&limit=10" | jq -r '.success' && echo "✅ DEX Trades endpoint OK" || echo "❌ DEX Trades endpoint FAILED"

echo "4. Smart Money Netflows"
curl -s "${BASE_URL}/api/nansen/netflows?address=${TEST_TOKEN}" | jq -r '.success' && echo "✅ Netflows endpoint OK" || echo "❌ Netflows endpoint FAILED"

echo ""
echo "🎯 Testing Token Screener Endpoints..."
echo "---------------------------------------"

echo "5. Token Info"
curl -s "${BASE_URL}/api/nansen/token-info?address=${TEST_TOKEN}" | jq -r '.success' && echo "✅ Token Info endpoint OK" || echo "❌ Token Info endpoint FAILED"

echo ""
echo "🌐 Testing TGM Endpoints..."
echo "---------------------------"

echo "6. Flow Intelligence"
curl -s "${BASE_URL}/api/nansen/flow-intelligence?address=${TEST_TOKEN}" | jq -r '.success' && echo "✅ Flow Intelligence endpoint OK" || echo "❌ Flow Intelligence endpoint FAILED"

echo "7. TGM Holders"
curl -s "${BASE_URL}/api/nansen/tgm/holders?address=${TEST_TOKEN}" | jq -r '.success' && echo "✅ TGM Holders endpoint OK" || echo "❌ TGM Holders endpoint FAILED"

echo ""
echo "👤 Testing Profiler Endpoints..."
echo "---------------------------------"

echo "8. Address Balances"
curl -s "${BASE_URL}/api/nansen/profiler/balances?address=${TEST_ADDRESS}" | jq -r '.success' && echo "✅ Address Balances endpoint OK" || echo "❌ Address Balances endpoint FAILED"

echo "9. Address Perp Positions"
curl -s "${BASE_URL}/api/nansen/profiler/perp-positions?address=${TEST_ADDRESS}" | jq -r '.success' && echo "✅ Perp Positions endpoint OK" || echo "❌ Perp Positions endpoint FAILED"

echo "10. Address Transactions"
curl -s "${BASE_URL}/api/nansen/profiler/transactions?address=${TEST_ADDRESS}&limit=10" | jq -r '.success' && echo "✅ Transactions endpoint OK" || echo "❌ Transactions endpoint FAILED"

echo "11. Address Profile"
curl -s "${BASE_URL}/api/nansen/profiler/profile?address=${TEST_ADDRESS}" | jq -r '.success' && echo "✅ Profile endpoint OK" || echo "❌ Profile endpoint FAILED"

echo "12. Address Labels"
curl -s "${BASE_URL}/api/nansen/profiler/labels?address=${TEST_ADDRESS}" | jq -r '.success' && echo "✅ Labels endpoint OK" || echo "❌ Labels endpoint FAILED"

echo ""
echo "🎲 Testing Additional Endpoints..."
echo "----------------------------------"

echo "13. Enhanced Signals"
curl -s "${BASE_URL}/api/nansen/enhanced-signals?address=${TEST_TOKEN}" | jq -r '.success' && echo "✅ Enhanced Signals endpoint OK" || echo "❌ Enhanced Signals endpoint FAILED"

echo "14. PnL Leaderboard"
curl -s "${BASE_URL}/api/nansen/pnl-leaderboard?address=${TEST_TOKEN}" | jq -r '.success' && echo "✅ PnL Leaderboard endpoint OK" || echo "❌ PnL Leaderboard endpoint FAILED"

echo "15. Whale Transactions"
curl -s "${BASE_URL}/api/nansen/whales?limit=10" | jq -r '.success' && echo "✅ Whales endpoint OK" || echo "❌ Whales endpoint FAILED"

echo ""
echo "🏥 Testing Status Endpoint..."
echo "-----------------------------"

echo "16. Nansen API Status"
curl -s "${BASE_URL}/api/nansen/status" | jq -r '.success' && echo "✅ Status endpoint OK" || echo "❌ Status endpoint FAILED"

echo ""
echo "======================================"
echo "✅ NANSEN API ENDPOINT TESTING COMPLETE"
echo "======================================"
echo ""
echo "📊 All 16 endpoints have been tested"
echo "🔧 Check output above for any failures"
echo ""
