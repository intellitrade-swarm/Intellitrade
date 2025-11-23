
# 📌 Sports Predictions Quick Reference

**Feature:** AI-powered sports predictions in Oracle dashboard  
**Sports:** NBA 🏀, NFL 🏈, MMA 🥊  
**Status:** ✅ Live at intellitrade.xyz/oracle

---

## Quick Access

1. Visit **https://intellitrade.xyz**
2. Click **Oracle** in navigation
3. Click **Sports** tab
4. Select sport: **NBA** | **NFL** | **MMA**
5. View AI predictions

---

## API Endpoints

```bash
# NBA Predictions
GET /api/oracle/sports-predictions?sport=NBA

# NFL Predictions
GET /api/oracle/sports-predictions?sport=NFL

# MMA Predictions
GET /api/oracle/sports-predictions?sport=MMA
```

---

## Prediction Data

Each prediction includes:
- ✅ **Matchup:** Team1 vs Team2
- ✅ **Prediction:** Winner and score/outcome
- ✅ **Confidence:** 0-100% with color coding
- ✅ **Odds:** Betting lines for both sides
- ✅ **AI Analysis:** Detailed reasoning
- ✅ **Key Factors:** 3-4 influencing factors
- ✅ **Date:** Upcoming match date

---

## Confidence Colors

- 🟢 **75%+:** High confidence (Green)
- 🟡 **60-74%:** Medium confidence (Yellow)
- 🟠 **<60%:** Lower confidence (Orange)

---

## Sample Matchups

### NBA 🏀
- Lakers vs Warriors
- Celtics vs Heat
- Bucks vs 76ers

### NFL 🏈
- Chiefs vs Bills
- 49ers vs Cowboys
- Ravens vs Bengals

### MMA 🥊
- Pereira vs Hill
- Makhachev vs Oliveira
- Jones vs Miocic

---

## Files

**Component:** `/app/oracle/components/sports-predictions.tsx`  
**API:** `/app/api/oracle/sports-predictions/route.ts`  
**Dashboard:** `/app/oracle/components/enhanced-oracle-dashboard.tsx`

---

## Tech Stack

- **AI Engine:** OpenAI GPT-4o-mini
- **Framework:** Next.js 14 + React
- **UI:** Tailwind CSS + Framer Motion
- **Build:** ✅ Successful (exit_code=0)

---

## Quick Test

```bash
# Test API
curl https://intellitrade.xyz/api/oracle/sports-predictions?sport=NBA

# Expected: JSON with 3 predictions
{
  "success": true,
  "sport": "NBA",
  "count": 3,
  "predictions": [...]
}
```

---

**Status:** ✅ Deployed and Operational  
**Docs:** `SPORTS_PREDICTIONS_ORACLE_COMPLETE.md`  
**URL:** https://intellitrade.xyz/oracle
