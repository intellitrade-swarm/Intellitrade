
import { Metadata } from 'next';
import { ProfileDashboard } from './components/profile-dashboard';

export const metadata: Metadata = {
  title: 'Profile & Settings | Intellitrade',
  description: 'Manage your profile, notification preferences, and platform settings',
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black">
      <ProfileDashboard />
    </div>
  );
}
