
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, BarChart3, PieChartIcon } from 'lucide-react';

interface ChartData {
  pnlOverTime: Array<{ date: string; [key: string]: any }>;
  winRateComparison: Array<{ name: string; winRate: number; totalTrades: number }>;
  tradesDistribution: Array<{ name: string; value: number; color: string }>;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export function PerformanceCharts() {
  const [chartData, setChartData] = useState<ChartData>({
    pnlOverTime: [],
    winRateComparison: [],
    tradesDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
    const interval = setInterval(fetchChartData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchChartData = async () => {
    try {
      const [statsRes, agentsRes] = await Promise.all([
        fetch('/api/dashboard/real-stats'),
        fetch('/api/agents')
      ]);

      if (statsRes.ok && agentsRes.ok) {
        const stats = await statsRes.json();
        const agents = await agentsRes.json();

        // Process PnL over time data
        const pnlData = stats.agentPerformance?.slice(0, 3).map((agent: any, index: number) => {
          const data: any = { date: `Agent ${index + 1}` };
          data[agent.agentName || 'Agent'] = agent.totalPnL || 0;
          return data;
        }) || [];

        // Process win rate comparison
        const winRateData = stats.agentPerformance?.map((agent: any) => ({
          name: agent.agentName?.substring(0, 12) || 'Unknown',
          winRate: agent.winRate || 0,
          totalTrades: agent.totalTrades || 0
        })) || [];

        // Process trades distribution
        const tradesData = agents.slice(0, 5).map((agent: any, index: number) => ({
          name: agent.name?.substring(0, 15) || 'Agent',
          value: agent.totalTrades || 0,
          color: COLORS[index % COLORS.length]
        }));

        setChartData({
          pnlOverTime: pnlData,
          winRateComparison: winRateData,
          tradesDistribution: tradesData
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-blue-500/30 rounded-xl p-3 backdrop-blur">
          <p className="text-sm font-bold text-blue-100 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: ${entry.value?.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-black/40 border-blue-500/20 backdrop-blur">
          <CardContent className="p-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-blue-400 animate-pulse mx-auto mb-4" />
              <p className="text-blue-300/60">Loading performance charts...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PnL Over Time Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-black/40 border-blue-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-100 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Profit & Loss Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData.pnlOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(59, 130, 246, 0.4)"
                  tick={{ fill: 'rgba(59, 130, 246, 0.6)', fontSize: 12 }}
                />
                <YAxis 
                  stroke="rgba(59, 130, 246, 0.4)"
                  tick={{ fill: 'rgba(59, 130, 246, 0.6)', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                {chartData.pnlOverTime.length > 0 && 
                  Object.keys(chartData.pnlOverTime[0])
                    .filter(key => key !== 'date')
                    .map((key, index) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        dot={{ fill: COLORS[index % COLORS.length], r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))
                }
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win Rate Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-black/40 border-blue-500/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-blue-100 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Win Rate Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData.winRateComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(59, 130, 246, 0.4)"
                    tick={{ fill: 'rgba(59, 130, 246, 0.6)', fontSize: 11 }}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="rgba(59, 130, 246, 0.4)"
                    tick={{ fill: 'rgba(59, 130, 246, 0.6)', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '12px'
                    }}
                  />
                  <Bar dataKey="winRate" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trades Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-black/40 border-blue-500/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-blue-100 flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-purple-400" />
                Trades Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.tradesDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.tradesDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
