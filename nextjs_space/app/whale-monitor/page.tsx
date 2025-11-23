
import { Metadata } from 'next';
import { WhaleMonitorDashboard } from './components/whale-monitor-dashboard';

export const metadata: Metadata = {
  title: 'Whale Monitor & Social Sentiment | Intellitrade',
  description: 'AI-powered whale wallet tracking and social sentiment analysis for alpha generation',
};

export default function WhaleMonitorPage() {
  return (
    <div className="min-h-screen bg-black terminal-crt-screen">
      <WhaleMonitorDashboard />
    </div>
  );
}
