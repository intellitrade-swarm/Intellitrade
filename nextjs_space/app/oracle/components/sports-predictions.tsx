
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Target, Flame, Zap, Activity, Award, DollarSign } from 'lucide-react';
import Image from 'next/image';

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

export function SportsPredictions() {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<SportsPrediction[]>([]);
  const [selectedSport, setSelectedSport] = useState<'NBA' | 'NFL' | 'MMA'>('NBA');

  useEffect(() => {
    fetchPredictions(selectedSport);
  }, [selectedSport]);

  const fetchPredictions = async (sport: 'NBA' | 'NFL' | 'MMA') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/oracle/sports-predictions?sport=${sport}`);
      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);
      }
    } catch (error) {
      console.error('Error fetching sports predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'text-green-400';
    if (confidence >= 60) return 'text-blue-300';
    return 'text-blue-400';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 75) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (confidence >= 60) return 'bg-blue-400/20 text-blue-300 border-blue-400/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const sportIcons = {
    NFL: '🏈',
    MMA: '🥊'
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sports Selection */}
      <div className="flex flex-wrap gap-2">
        {(['NBA', 'NFL', 'MMA'] as const).map((sport) => (
          <Button
            key={sport}
            variant={selectedSport === sport ? 'default' : 'outline'}
            onClick={() => setSelectedSport(sport)}
            className="gap-2 text-xs sm:text-sm flex-shrink-0"
            size="sm"
          >
            {sport === 'NBA' ? (
              <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
                <Image 
                  src="/nba-logo.png" 
                  alt="NBA Logo" 
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <span className="text-base sm:text-lg flex-shrink-0">{sportIcons[sport]}</span>
            )}
            <span>{sport}</span>
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#3385ff]/20 border-t-[#3385ff] rounded-full terminal-pulse"></div>
              <Trophy className="absolute inset-0 m-auto h-6 w-6 text-[#3385ff]" />
            </div>
            <p className="text-sm text-gray-400">Analyzing {selectedSport} matchups...</p>
          </div>
        </motion.div>
      ) : predictions.length === 0 ? (
        <Card className="bg-black/50 border-gray-800">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Trophy className="h-12 w-12 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">No Predictions Available</h3>
                <p className="text-sm text-gray-400">
                  AI-powered {selectedSport} predictions will appear here. Check back soon for upcoming matchups!
                </p>
              </div>
              <Button onClick={() => fetchPredictions(selectedSport)} variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Generate Predictions
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {predictions.map((prediction) => (
            <motion.div
              key={prediction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-black/80 to-gray-900/50 border-gray-800 hover:border-[#3385ff]/30 transition-all">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-[#3385ff]/20 text-[#3385ff] border-[#3385ff]/30 text-xs">
                          {prediction.sport}
                        </Badge>
                        <span className="text-xs text-gray-500">{prediction.date}</span>
                      </div>
                      <CardTitle className="text-lg sm:text-xl text-white break-words">
                        {prediction.matchup}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-400 break-words">
                        {prediction.team1} vs {prediction.team2}
                      </CardDescription>
                    </div>
                    <div className="text-left sm:text-right self-start">
                      <Badge className={`${getConfidenceBadge(prediction.confidence)} font-mono text-xs whitespace-nowrap`}>
                        {prediction.confidence}% 
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  {/* Prediction */}
                  <div className="p-3 sm:p-4 rounded-2xl bg-[#3385ff]/5 border border-[#3385ff]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 text-[#3385ff] flex-shrink-0" />
                      <h4 className="text-xs sm:text-sm font-semibold text-white">AI Prediction</h4>
                    </div>
                    <p className="text-white font-semibold text-base sm:text-lg break-words">{prediction.prediction}</p>
                  </div>

                  {/* Odds */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 flex-shrink-0" />
                        <span className="text-xs text-gray-400 truncate">{prediction.team1}</span>
                      </div>
                      <p className="text-blue-400 font-mono font-semibold text-sm sm:text-base">{prediction.odds.team1}</p>
                    </div>
                    <div className="p-2 sm:p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 flex-shrink-0" />
                        <span className="text-xs text-gray-400 truncate">{prediction.team2}</span>
                      </div>
                      <p className="text-blue-400 font-mono font-semibold text-sm sm:text-base">{prediction.odds.team2}</p>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Zap className="h-4 w-4 text-blue-300 flex-shrink-0" />
                      <h4 className="text-xs sm:text-sm font-semibold text-white">AI Analysis</h4>
                      <Badge variant="outline" className="text-xs">{prediction.aiProvider}</Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed break-words">{prediction.analysis}</p>
                  </div>

                  {/* Key Factors */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <h4 className="text-xs sm:text-sm font-semibold text-white">Key Factors</h4>
                    </div>
                    <div className="space-y-1">
                      {prediction.keyFactors.map((factor, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-300">
                          <span className="text-[#3385ff] mt-1 flex-shrink-0">•</span>
                          <span className="break-words">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <Card className="bg-blue-400/5 border-blue-400/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Activity className="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-300">Disclaimer</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                These predictions are generated by AI algorithms analyzing historical data, current team statistics, and market sentiment. 
                They are for informational purposes only and should not be considered as financial or betting advice. 
                Always conduct your own research and gamble responsibly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
