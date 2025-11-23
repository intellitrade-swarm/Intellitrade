
'use client';

import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PerformanceChartProps {
  agents: any[];
  timeframe: string;
  metric: string;
}

export function PerformanceChart({ agents, timeframe, metric }: PerformanceChartProps) {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSynthetic, setIsSynthetic] = useState(false);

  // Fetch historical performance data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true);
      try {
        const agentIds = agents.map(a => a.id).join(',');
        const response = await fetch(`/api/performance/history?timeframe=${timeframe}&metric=${metric}${agentIds ? `&agentIds=${agentIds}` : ''}`);
        
        if (response.ok) {
          const data = await response.json();
          setHistoricalData(data.metrics || []);
          setIsSynthetic(data.isSynthetic || false);
        } else {
          console.error('Failed to fetch historical data');
          setHistoricalData([]);
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
        setHistoricalData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchHistoricalData, 30000);
    return () => clearInterval(interval);
  }, [agents, timeframe, metric]);

  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) {
      return [];
    }

    // Group data by timestamp
    const timeGroups: Record<string, any> = {};
    
    historicalData.forEach((dataPoint) => {
      const time = new Date(dataPoint.timestamp);
      const timeKey = timeframe === '24h' 
        ? time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!timeGroups[timeKey]) {
        timeGroups[timeKey] = { time: timeKey };
      }
      
      const agentName = dataPoint.agent?.name || 'Unknown';
      let value = 0;
      
      switch (metric) {
        case 'profitLoss':
          value = dataPoint.profitLoss || 0;
          break;
        case 'sharpeRatio':
          value = dataPoint.sharpeRatio || 0;
          break;
        case 'winRate':
          value = (dataPoint.winRate || 0) * 100;
          break;
        default:
          value = dataPoint.profitLoss || 0;
      }
      
      timeGroups[timeKey][agentName] = parseFloat(value.toFixed(2));
    });
    
    return Object.values(timeGroups);
  }, [historicalData, timeframe, metric]);

  const colors = [
    '#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#FF6363', '#80D8C3'
  ];

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-gray-400">Loading performance data...</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-2">No performance data available</div>
          <div className="text-gray-500 text-sm">Data will appear once agents start trading</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isSynthetic && (
        <div className="text-xs text-blue-400/80 italic">
          ⓘ Showing estimated data. Real metrics will appear after agents complete trades.
        </div>
      )}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.3)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(156, 163, 175, 1)"
              tick={{ fontSize: 10 }}
              tickLine={false}
            />
            <YAxis 
              stroke="rgba(156, 163, 175, 1)"
              tick={{ fontSize: 10 }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid rgba(75, 85, 99, 1)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: 11 }}
            />
            {agents.map((agent, index) => (
              <Line
                key={agent.id}
                type="monotone"
                dataKey={agent.name}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: colors[index % colors.length] }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
