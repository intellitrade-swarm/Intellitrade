
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SportsPrediction {
  id: string;
  sport: 'NBA' | 'NFL' | 'MMA';
  matchup: string;
  team1: string;
  team2: string;
  prediction: string;
  confidence: number;
  odds: {
    team1: string;
    team2: string;
  };
  analysis: string;
  keyFactors: string[];
  date: string;
  aiProvider: string;
}

// Sample upcoming matchups (in production, these would come from a sports API)
const UPCOMING_MATCHES = {
  NBA: [
    { team1: 'Los Angeles Lakers', team2: 'Golden State Warriors', date: '2025-11-20' },
    { team1: 'Boston Celtics', team2: 'Miami Heat', date: '2025-11-21' },
    { team1: 'Milwaukee Bucks', team2: 'Philadelphia 76ers', date: '2025-11-21' },
  ],
  NFL: [
    { team1: 'Kansas City Chiefs', team2: 'Buffalo Bills', date: '2025-11-24' },
    { team1: 'San Francisco 49ers', team2: 'Dallas Cowboys', date: '2025-11-24' },
    { team1: 'Baltimore Ravens', team2: 'Cincinnati Bengals', date: '2025-11-25' },
  ],
  MMA: [
    { team1: 'Alex Pereira', team2: 'Jamahal Hill', date: '2025-11-23' },
    { team1: 'Islam Makhachev', team2: 'Charles Oliveira', date: '2025-11-30' },
    { team1: 'Jon Jones', team2: 'Stipe Miocic', date: '2025-12-07' },
  ],
};

async function generatePredictionWithAI(
  sport: 'NBA' | 'NFL' | 'MMA',
  team1: string,
  team2: string
): Promise<Omit<SportsPrediction, 'id' | 'sport' | 'matchup' | 'team1' | 'team2' | 'date'>> {
  const sportContext = {
    NBA: 'an NBA basketball game',
    NFL: 'an NFL football game',
    MMA: 'an MMA mixed martial arts fight',
  };

  const prompt = `Analyze this upcoming ${sportContext[sport]} between ${team1} and ${team2}. 
Provide:
1. A prediction (winner and score/outcome)
2. Confidence level (0-100)
3. Realistic betting odds for both (e.g., -150, +120)
4. Brief analysis (2-3 sentences)
5. 3-4 key factors influencing the prediction

Format as JSON:
{
  "prediction": "Team Name wins (score/outcome)",
  "confidence": 75,
  "odds": {"team1": "-150", "team2": "+120"},
  "analysis": "Brief analysis...",
  "keyFactors": ["Factor 1", "Factor 2", "Factor 3"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert sports analyst with deep knowledge of ${sport}. Provide realistic, data-driven predictions based on current team/fighter form, head-to-head records, injuries, and other relevant factors.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      prediction: result.prediction || `${team1} to win`,
      confidence: result.confidence || 65,
      odds: result.odds || { team1: '-150', team2: '+120' },
      analysis: result.analysis || 'Analysis unavailable',
      keyFactors: result.keyFactors || ['Recent form', 'Head-to-head record', 'Home advantage'],
      aiProvider: 'OpenAI GPT-4o-mini',
    };
  } catch (error) {
    console.error('Error generating AI prediction:', error);
    // Fallback prediction
    return {
      prediction: `${team1} has the edge`,
      confidence: 60,
      odds: { team1: '-140', team2: '+110' },
      analysis: `Based on current form and historical performance, ${team1} appears to have a slight advantage in this matchup.`,
      keyFactors: ['Recent performance', 'Team statistics', 'Historical matchups'],
      aiProvider: 'Fallback Analysis',
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = (searchParams.get('sport') || 'NBA').toUpperCase() as 'NBA' | 'NFL' | 'MMA';

    if (!['NBA', 'NFL', 'MMA'].includes(sport)) {
      return NextResponse.json({ error: 'Invalid sport. Must be NBA, NFL, or MMA' }, { status: 400 });
    }

    const matches = UPCOMING_MATCHES[sport];
    const predictions: SportsPrediction[] = [];

    // Generate predictions for each match (limit to 3 for performance)
    for (const match of matches.slice(0, 3)) {
      const aiPrediction = await generatePredictionWithAI(sport, match.team1, match.team2);

      predictions.push({
        id: `${sport.toLowerCase()}-${match.team1.toLowerCase().replace(/\s+/g, '-')}-vs-${match.team2.toLowerCase().replace(/\s+/g, '-')}`,
        sport,
        matchup: `${match.team1} vs ${match.team2}`,
        team1: match.team1,
        team2: match.team2,
        date: match.date,
        ...aiPrediction,
      });
    }

    return NextResponse.json({
      success: true,
      sport,
      count: predictions.length,
      predictions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in sports-predictions API:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate sports predictions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
