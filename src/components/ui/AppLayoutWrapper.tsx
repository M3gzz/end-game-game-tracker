/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import Sidebar from '@/components/ui/Sidebar';
import AuthGateway from '@/components/auth/AuthGateway';
import OnboardingWizard from '@/components/profile/OnboardingWizard';
import { Trophy } from 'lucide-react';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { currentUsername, checkMigration } = useTrackerStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Proactively check legacy profile migration
    checkMigration();
    setMounted(true);
  }, [checkMigration]);

  if (!mounted) {
    // Elegant loading splash to prevent hydration flash
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white z-[999] font-sans">
        <div className="w-16 h-16 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-4 animate-bounce">
          <Trophy className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-xl font-bold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
          EndGame
        </h1>
        <p className="text-xs text-zinc-500 mt-2">Loading achievement matrix...</p>
      </div>
    );
  }

  if (currentUsername === null) {
    return <AuthGateway />;
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 min-h-screen flex flex-col overflow-y-auto pt-16 md:pt-0 pb-16 md:pb-0">
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto relative">
          {children}
        </div>
      </main>
      <OnboardingWizard />
    </>
  );
}
