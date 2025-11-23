

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();

  useEffect(() => {
    // No authentication required - redirect to arena
    router.replace('/arena');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-[#0066ff] font-terminal">
        <p>Redirecting to platform...</p>
      </div>
    </div>
  );
}
