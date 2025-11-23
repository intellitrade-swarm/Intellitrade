
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AIControlsProps {
  onEvolutionComplete?: () => void;
  onTradeExecuted?: () => void;
}

export function AIControls({ onEvolutionComplete, onTradeExecuted }: AIControlsProps) {
  const [isEvolving, setIsEvolving] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [lastEvolution, setLastEvolution] = useState<any>(null);

  const triggerEvolution = async () => {
    setIsEvolving(true);
    try {
      const response = await fetch('/api/ai/evolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to trigger evolution');
      }

      const data = await response.json();
      setLastEvolution(data);
      
      toast.success('Evolution Complete!', {
        description: data.message || 'AI agents have evolved based on performance analysis'
      });

      if (onEvolutionComplete) {
        onEvolutionComplete();
      }
    } catch (error) {
      toast.error('Evolution Failed', {
        description: 'Unable to complete evolution process'
      });
    } finally {
      setIsEvolving(false);
    }
  };

  const triggerAITrade = async (agentId: string) => {
    setIsTrading(true);
    setSelectedAgentId(agentId);
    
    try {
      const response = await fetch('/api/ai/trade-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      });

      if (!response.ok) {
        throw new Error('Failed to execute AI trade');
      }

      const data = await response.json();
      
      if (data.decision.action === 'HOLD') {
        toast.info('AI Decision: HOLD', {
          description: data.decision.reasoning
        });
      } else {
        toast.success(`AI Trade: ${data.decision.action} ${data.decision.symbol}`, {
          description: `Confidence: ${(data.decision.confidence * 100).toFixed(0)}% - ${data.decision.reasoning}`
        });
      }

      if (onTradeExecuted) {
        onTradeExecuted();
      }
    } catch (error) {
      toast.error('Trade Failed', {
        description: 'Unable to execute AI trading decision'
      });
    } finally {
      setIsTrading(false);
      setSelectedAgentId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="terminal-crt-screen border-green-600/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-green-600" />
            <CardTitle>AI-Powered Controls</CardTitle>
          </div>
          <CardDescription>
            Use GPT-4 to analyze strategies, evolve agents, and make trading decisions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Evolution Control */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-blue-950 border border-green-200 dark:border-green-800">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold text-sm">AI Evolution</h3>
                <Badge variant="outline" className="text-xs">GPT-4</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Analyze performance and evolve agent strategies using AI
              </p>
              {lastEvolution && (
                <div className="mt-2 text-xs">
                  <p className="text-green-600 font-medium">
                    Last: {lastEvolution.mutations?.length || 0} mutations, {lastEvolution.crossovers?.length || 0} crossovers
                  </p>
                </div>
              )}
            </div>
            <Button
              onClick={triggerEvolution}
              disabled={isEvolving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isEvolving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Evolving...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Evolve Agents
                </>
              )}
            </Button>
          </div>

          {/* AI Trading Info */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-blue-950 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-sm">GPT Trading Decisions</h3>
              <Badge variant="outline" className="text-xs">GPT-4</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Each agent can use GPT-4 to analyze market conditions and make informed trading decisions
            </p>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Click on any agent card below to trigger an AI-powered trade decision
            </div>
          </div>

          {/* Evolution Insights */}
          {lastEvolution?.insights && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-blue-950 dark:to-pink-950 border border-purple-200 dark:border-blue-800">
              <h3 className="font-semibold text-sm mb-2 text-blue-700 dark:text-purple-300">
                AI Insights
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {lastEvolution.insights}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
