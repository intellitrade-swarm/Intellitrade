
import { Metadata } from 'next';
import { PerpsDashboard } from './components/perps-dashboard';

export const metadata: Metadata = {
  title: 'Perpetuals Trading Intelligence | Intellitrade',
  description: 'Real-time perps data, smart money tracking, and AI-powered alpha generation for perpetual futures trading',
};

export default function PerpsPage() {
  return <PerpsDashboard />;
}
