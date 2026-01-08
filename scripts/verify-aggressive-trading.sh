#!/bin/bash

echo "=============================================="
echo "🚀 AGGRESSIVE TRADING VERIFICATION"
echo "=============================================="
echo ""

cd /home/ubuntu/ipool_swarms/nextjs_space

echo "📊 Checking confidence thresholds..."
echo "---"
grep -A2 "confidenceThreshold" lib/aster-autonomous-trading.ts | head -4
echo ""

echo "💰 Checking profit-taking levels..."
echo "---"
grep "TIER.*PROFIT\|pnlPercent >=" lib/aster-autonomous-trading.ts | grep -v "//" | head -10
echo ""

echo "⏱️  Checking trading interval..."
echo "---"
grep "cycleIntervalMs.*=" lib/trading-scheduler.ts | head -1
echo ""

echo "🎯 Checking entry thresholds..."
echo "---"
grep "entryThreshold.*=" lib/ultra-profitable-trading.ts | head -1
echo ""

echo "📈 Checking position sizing..."
echo "---"
grep "riskPercentage.*=" lib/ultra-profitable-trading.ts | head -1
grep "leverage.*=" lib/ultra-profitable-trading.ts | head -1
echo ""

echo "✅ VERIFICATION COMPLETE"
echo ""
echo "Expected values:"
echo "  - Confidence: 0.35, 0.45, 0.60"
echo "  - Profit taking: 2%, 3%, 5%, 8%"
echo "  - Interval: 10 minutes"
echo "  - Entry: 0.35 (35%)"
echo "  - Risk: 20-40%"
echo "  - Leverage: 3-7x"
echo ""
echo "=============================================="
