
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Activity, Target, Shield, Sparkles } from 'lucide-react';

interface AIAnalysisResult {
  requestId: string;
  result: {
    analysis: string;
    provider: string;
    confidence: number;
  };
  timestamp: string;
  processingTime: number;
}

export default function AIAnalysisPage() {
  const router = useRouter();
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiProvider, setAiProvider] = useState('openai');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAIAnalysis = async () => {
    if (!aiPrompt.trim()) return;
    
    setAiLoading(true);
    try {
      const response = await fetch('/api/oracle/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, provider: aiProvider }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 via-blue-950/10 to-black">
      {/* Background Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 102, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 102, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="text-white hover:text-blue-400 hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              AI Analysis
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get AI-powered market analysis and insights from multiple AI providers
          </p>
        </div>

        {/* AI Analysis Card */}
        <Card className="terminal-crt-screen bg-gradient-to-br from-blue-900/20 via-blue-950/10 to-black backdrop-blur border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="h-5 w-5 text-blue-400" />
              AI Analysis
            </CardTitle>
            <CardDescription className="text-gray-400">
              Ask AI to analyze market conditions, trends, or specific tokens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">AI Provider</label>
              <Select value={aiProvider} onValueChange={setAiProvider}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white hover:border-blue-500 transition-colors">
                  <SelectValue placeholder="Select AI Provider" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="openai" className="text-white hover:bg-blue-600/20 cursor-pointer">
                    OpenAI GPT-4
                  </SelectItem>
                  <SelectItem value="gemini" className="text-white hover:bg-blue-600/20 cursor-pointer">
                    Google Gemini
                  </SelectItem>
                  <SelectItem value="nvidia" className="text-white hover:bg-blue-600/20 cursor-pointer">
                    NVIDIA AI
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Your Question</label>
              <textarea
                className="w-full p-4 rounded-2xl border bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[120px] resize-none"
                placeholder="Example: Analyze the current market sentiment for BTC and provide trading insights..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={aiLoading}
              />
            </div>

            {/* Analyze Button */}
            <Button
              onClick={fetchAIAnalysis}
              disabled={aiLoading || !aiPrompt.trim()}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {aiLoading ? (
                <>
                  <Activity className="h-4 w-4 terminal-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  Get AI Analysis
                </>
              )}
            </Button>

            {/* Analysis Result */}
            {aiAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border bg-gradient-to-br from-blue-950/40 to-blue-950/20 border-blue-500/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="gap-2 text-blue-400 border-blue-500/30">
                    <Shield className="h-3 w-3" />
                    {aiAnalysis.result.provider.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-500/30">
                    Confidence: {(aiAnalysis.result.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {aiAnalysis.result.analysis}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-500/20 text-xs text-gray-400">
                  <span>Request ID: {aiAnalysis.requestId}</span>
                  <span>Processing: {aiAnalysis.processingTime}ms</span>
                </div>
              </motion.div>
            )}

            {/* Helpful Tips */}
            {!aiAnalysis && (
              <div className="p-4 rounded-2xl bg-blue-900/20 border border-blue-500/30">
                <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 Tips for Better Analysis</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Be specific about the token or market you want analyzed</li>
                  <li>• Ask for particular insights (sentiment, trends, technical analysis)</li>
                  <li>• Try different AI providers for varied perspectives</li>
                  <li>• Include timeframes (24h, 7d, 30d) for more accurate analysis</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
