
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Icons } from '../../../components/ui/icons';

interface CompetitionStatusProps {
  competition: any;
}

export function CompetitionStatus({ competition }: CompetitionStatusProps) {
  if (!competition) {
    return (
      <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-gray-800">
        <CardContent className="text-center py-8">
          <Icons.trophy className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <div className="text-gray-400">No active competition</div>
        </CardContent>
      </Card>
    );
  }

  const currentRound = competition.rounds?.find((r: any) => r.status === 'ACTIVE');
  const daysRemaining = currentRound ? 
    Math.ceil((new Date(currentRound.endTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Icons.trophy className="h-5 w-5 mr-2 text-blue-300" />
            {competition.name}
          </div>
          <Badge className="bg-green-600">ACTIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-gray-300 text-sm">{competition.description}</div>
        
        {currentRound && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-900/40 rounded-2xl border border-blue-800">
              <div>
                <div className="text-white font-medium">{currentRound.name}</div>
                <div className="text-gray-400 text-sm">Current Round</div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">{daysRemaining} days</div>
                <div className="text-gray-400 text-sm">remaining</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gray-900/40 rounded-2xl">
                <div className="text-white text-lg font-bold">{competition.entries?.length || 0}</div>
                <div className="text-gray-400 text-xs">Participants</div>
              </div>
              <div className="text-center p-3 bg-gray-900/40 rounded-2xl">
                <div className="text-blue-300 text-lg font-bold">${competition.prizePool?.toLocaleString() || 0}</div>
                <div className="text-gray-400 text-xs">Prize Pool</div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Preview */}
        {competition.entries && competition.entries.length > 0 && (
          <div className="space-y-2">
            <div className="text-white font-medium">Current Rankings</div>
            {competition.entries.slice(0, 5).map((entry: any, index: number) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 bg-gray-900/40 rounded border border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <div className="text-white text-sm">{entry.agent?.name}</div>
                </div>
                <div className="text-gray-400 text-sm">
                  {entry.isEliminated ? 'Eliminated' : 'Active'}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
