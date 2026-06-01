'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { PRELOADED_GAMES } from '@/data/preloadedGames';
import { MOCK_USERS } from '@/data/mockUsers';
import CompletionRing from '@/components/ui/CompletionRing';
import { 
  Swords, ArrowLeft, MessageSquare, Timer, Check, X, MapPin, Shield, Star, BookOpen, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ChallengeDetailsPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const challengeId = resolvedParams.id;

  const { challenges, profile, progress } = useTrackerStore();
  const [mounted, setMounted] = React.useState(false);
  const [expandedAchievementId, setExpandedAchievementId] = React.useState<string | null>(null);

  // Live ticking clock state
  const [timeRemainingStr, setTimeRemainingStr] = React.useState('14h 28m 10s');

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    // Simulate real-time ticking
    const timer = setInterval(() => {
      const hours = 14;
      const mins = Math.floor(Math.random() * 60);
      const secs = Math.floor(Math.random() * 60);
      setTimeRemainingStr(`${hours}h ${mins}m ${secs}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 p-6 md:p-10 bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Find target challenge
  const challenge = challenges.find(c => c.id === challengeId) || challenges[0] || {
    id: 'c-1',
    challenger: 'peter_parker',
    target: 'hunter_megan',
    gameId: 'stray',
    gameTitle: 'Stray',
    type: 'platinum',
    timeLimitHours: 48,
    status: 'accepted',
    createdAt: '2026-05-22T20:00:00.000Z'
  };

  const game = PRELOADED_GAMES.find(g => g.id === challenge.gameId);
  
  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 animate-bounce" />
        <h2 className="text-xl font-bold text-white">Challenge details not found</h2>
        <p className="text-zinc-500 text-xs">The selected duel parameters could not be retrieved.</p>
        <Link href="/challenges" className="px-4 py-2 bg-zinc-900 text-white rounded-xl border border-zinc-800 text-xs">
          Back to Arena
        </Link>
      </div>
    );
  }

  const isChallengerSelf = challenge.challenger === profile.username;
  const opponentUsername = isChallengerSelf ? challenge.target : challenge.challenger;
  const opponent = MOCK_USERS[opponentUsername] || {
    name: 'Peter Parker',
    username: 'peter_parker',
    avatarUrl: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    stats: { level: 18, unlockedTrophiesCount: 84, completedGamesCount: 2 }
  };

  // Compile achievements
  const achievements = game.achievements || [];
  const totalTrophies = achievements.length || 1;

  // Unlocks
  const userUnlockedList = achievements.filter(ach => progress.unlockedAchievements[ach.id]);
  const userCount = userUnlockedList.length;
  
  // Opponent unlock count (seeding for realistic display)
  let opponentSeed = 0.35;
  if (opponentUsername === 'geralt_of_rivia') opponentSeed = 0.65;
  if (opponentUsername === 'peter_parker') opponentSeed = 0.45;
  if (opponentUsername === 'ellie_williams') opponentSeed = 0.55;

  const opponentCount = Math.min(totalTrophies - 1, Math.round(totalTrophies * opponentSeed));
  
  const userRatio = Math.round((userCount / totalTrophies) * 100);
  const opponentRatio = Math.round((opponentCount / totalTrophies) * 100);

  // Generate realistic unlocked states for comparison timeline
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getAchievementComparison = (ach: any, idx: number) => {
    const isUserUnlocked = !!progress.unlockedAchievements[ach.id];
    // Opponent unlock status seeded
    const isOpponentUnlocked = idx < opponentCount;
    return { isUserUnlocked, isOpponentUnlocked };
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header Back Button */}
      <div className="flex items-center gap-3">
        <Link href="/challenges" className="p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">Duel Room #{challenge.id.substring(0, 5)}</span>
          <h1 className="text-2xl font-black text-white leading-tight mt-1 flex items-center gap-2">
             Speedrun Duel: {game.title}
          </h1>
        </div>
      </div>

      {/* TIMERS AND DOCK ACTIONS */}
      <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/5 border border-orange-500/20 flex items-center justify-center text-orange-500 relative shrink-0">
            <Timer className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Speedrun Remaining Clock</p>
            <p className="text-2xl font-black text-white tracking-wider mt-0.5">{timeRemainingStr}</p>
          </div>
        </div>

        <div className="flex gap-3 shrink-0">
          <Link 
            href="/dms"
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
          >
            <MessageSquare className="w-4 h-4" /> Chat in DMs
          </Link>
          <div className="px-4 py-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black rounded-xl flex items-center gap-1.5">
            ⚔️ LIVE SYNC ACTIVE
          </div>
        </div>
      </div>

      {/* DUAL COMPARISON RADIAL GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Card */}
        <div className="bg-gradient-to-br from-zinc-900/40 to-purple-950/10 border border-zinc-800/80 rounded-3xl p-6 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center gap-6">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          
          {/* Radial Ring */}
          <div className="shrink-0 relative">
            <CompletionRing percentage={userRatio} size={110} strokeWidth={8} ringColor="#a855f7" showText={true} textSize="text-base" />
            <span className="absolute -top-1 -right-1 text-[9px] bg-purple-600 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase shadow">ME</span>
          </div>

          <div className="space-y-3 min-w-0 flex-1 text-center md:text-left">
            <div>
              <p className="text-[10px] text-purple-400 font-black uppercase tracking-wider">Challenger Standings</p>
              <h3 className="text-lg font-black text-white truncate mt-0.5">{profile.name}</h3>
              <p className="text-xs text-zinc-500 font-semibold truncate mt-0.5">@{profile.username}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center border-t border-zinc-900 pt-3">
              <div>
                <p className="text-[9px] text-zinc-500 font-bold uppercase">Trophies Unlocked</p>
                <p className="text-sm font-black text-purple-400 mt-0.5">{userCount} / {totalTrophies}</p>
              </div>
              <div>
                <p className="text-[9px] text-zinc-500 font-bold uppercase">Rank Score</p>
                <p className="text-sm font-black text-zinc-200 mt-0.5">Lvl {Math.floor(userCount/4) + 12}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Opponent Card */}
        <div className="bg-gradient-to-br from-zinc-900/40 to-indigo-950/10 border border-zinc-800/80 rounded-3xl p-6 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center gap-6">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          
          {/* Radial Ring */}
          <div className="shrink-0 relative">
            <CompletionRing percentage={opponentRatio} size={110} strokeWidth={8} ringColor="#6366f1" showText={true} textSize="text-base" />
            <span className="absolute -top-1 -right-1 text-[9px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase shadow">OPPONENT</span>
          </div>

          <div className="space-y-3 min-w-0 flex-1 text-center md:text-left">
            <div>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-wider">Duelist Rival</p>
              <h3 className="text-lg font-black text-white truncate mt-0.5">{opponent.name}</h3>
              <p className="text-xs text-zinc-500 font-semibold truncate mt-0.5">@{opponent.username}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center border-t border-zinc-900 pt-3">
              <div>
                <p className="text-[9px] text-zinc-500 font-bold uppercase">Trophies Unlocked</p>
                <p className="text-sm font-black text-indigo-400 mt-0.5">{opponentCount} / {totalTrophies}</p>
              </div>
              <div>
                <p className="text-[9px] text-zinc-500 font-bold uppercase">Rank Score</p>
                <p className="text-sm font-black text-zinc-200 mt-0.5">Lvl {opponent.stats.level}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COMPARATIVE TROPHY TIMELINE ACCORDION */}
      <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
        <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
          <Swords className="w-5 h-5 text-indigo-400" /> Duel Progress & Blueprint Comparison
        </h2>

        <div className="space-y-4">
          {achievements.map((ach, idx) => {
            const { isUserUnlocked, isOpponentUnlocked } = getAchievementComparison(ach, idx);
            const isExpanded = expandedAchievementId === ach.id;

            return (
              <div 
                key={ach.id}
                className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all"
              >
                {/* Accordion Row Trigger */}
                <div 
                  onClick={() => setExpandedAchievementId(isExpanded ? null : ach.id)}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/5 relative bg-zinc-900 shrink-0 select-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ach.iconUrl} alt={ach.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-extrabold text-white truncate">{ach.title}</h4>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">{ach.description}</p>
                    </div>
                  </div>

                  {/* Dual status timeline blocks */}
                  <div className="flex items-center gap-6 shrink-0 w-full sm:w-auto border-t sm:border-0 border-zinc-900 pt-3 sm:pt-0">
                    {/* User */}
                    <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase hidden sm:inline">You:</span>
                      {isUserUnlocked ? (
                        <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[10px] font-black flex items-center gap-1">
                          <Check className="w-3 h-3" /> Unlocked
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded text-[10px] font-semibold flex items-center gap-1">
                          <X className="w-3 h-3" /> Locked
                        </div>
                      )}
                    </div>

                    {/* Opponent */}
                    <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase hidden sm:inline">Rival:</span>
                      {isOpponentUnlocked ? (
                        <div className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-[10px] font-black flex items-center gap-1">
                          <Check className="w-3 h-3" /> Unlocked
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded text-[10px] font-semibold flex items-center gap-1">
                          <X className="w-3 h-3" /> Locked
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Strategy Guide Details Dropdown */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-zinc-900/60 bg-zinc-950/60 space-y-4">
                    <div className="flex items-center gap-2 text-xs text-purple-400 font-black uppercase">
                      <BookOpen className="w-4 h-4" /> Hunter blueprint & walkthrough
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left detailed tactics */}
                      <div className="space-y-2.5 text-xs">
                        <p className="text-zinc-300 leading-relaxed">
                          {ach.guide || "No explicit roadmap registered yet for this achievement. Search our dynamic guide channels or share screenshots with strategy markers."}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                          <span className="flex items-center gap-1 font-semibold"><Shield className="w-3.5 h-3.5" /> Est. Difficulty: 4/10</span>
                          <span className="flex items-center gap-1 font-semibold"><Star className="w-3.5 h-3.5 text-yellow-400" /> Rarity: {ach.rarityPercentage}%</span>
                        </div>
                      </div>

                      {/* Right recommended gear and notes */}
                      <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 space-y-2.5 text-xs">
                        <div className="flex items-center gap-1.5 text-zinc-400 font-extrabold text-[10px] uppercase">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Location markers & Gear loadouts
                        </div>
                        <ul className="space-y-1.5 text-zinc-400 leading-normal pl-4 list-disc">
                          <li>Recommended Gear: Level 20+ base stamina boost and mobility charms</li>
                          <li>Exact Coordinates: Slums - Chapter 3 high electrical grids, third level ledge</li>
                          <li>Missable Alert: Ensure you do NOT pass the security gates before collecting the sub-nodes!</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
