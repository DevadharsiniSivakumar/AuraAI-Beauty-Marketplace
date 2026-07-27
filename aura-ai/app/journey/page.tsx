'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JourneyPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/advisor?tab=planner');
  }, [router]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-plum border-t-transparent animate-spin"></div>
        <p className="text-xs text-mutedtext">Loading your custom Beauty Planner...</p>
      </div>
    </div>
  );
}
