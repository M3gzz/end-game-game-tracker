/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { Trophy } from 'lucide-react';

export default function UnlockToast() {
  const { activities } = useTrackerStore();
  const [currentUnlock, setCurrentUnlock] = React.useState<{
    id: string;
    gameTitle: string;
    achievementTitle: string;
    achievementIcon: string;
  } | null>(null);
  
  const lastIdRef = React.useRef<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted || activities.length === 0) return;

    const latest = activities[0];
    
    // Only trigger toast for 'unlock' activities that haven't been shown yet
    if (latest.type === 'unlock' && latest.id !== lastIdRef.current) {
      lastIdRef.current = latest.id;
      
      // Calculate if the activity occurred within the last 10 seconds to avoid backlog trigger
      const ageMs = Date.now() - new Date(latest.timestamp).getTime();
      if (ageMs < 8000) {
        setCurrentUnlock({
          id: latest.id,
          gameTitle: latest.gameTitle,
          achievementTitle: latest.achievementTitle || '',
          achievementIcon: latest.achievementIcon || '🥉',
        });

        // Auto-dismiss after 4.5 seconds (leaving time for the slide-out animation)
        const timer = setTimeout(() => {
          setCurrentUnlock(null);
        }, 4500);

        return () => clearTimeout(timer);
      }
    }
  }, [activities, mounted]);

  if (!mounted || !currentUnlock) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 pointer-events-none select-none">
      {/* Sliding and glowing card container */}
      <div className="bg-zinc-950/90 border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.25)] rounded-2xl p-4 flex items-center gap-4 max-w-sm w-80 backdrop-blur-md animate-in slide-in-from-bottom-24 fade-in duration-300 ease-out">
        
        {/* Glowing Trophy Circular Ring */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-blue-500/20 animate-pulse border border-blue-400/30">
          {currentUnlock.achievementIcon}
        </div>

        {/* Text Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Trophy className="w-3.5 h-3.5 text-blue-400 drop-shadow-[0_0_4px_rgba(59,130,246,0.5)] animate-bounce" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Trophy Unlocked!</span>
          </div>
          <h5 className="font-extrabold text-sm text-white truncate leading-tight">
            {currentUnlock.achievementTitle}
          </h5>
          <p className="text-[10px] text-zinc-400 truncate mt-0.5">
            {currentUnlock.gameTitle}
          </p>
        </div>
      </div>
    </div>
  );
}
