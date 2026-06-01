/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PRELOADED_GAMES } from '@/data/preloadedGames';
import { useTrackerStore } from '@/store/trackerStore';
import { 
  Trophy, 
  Clock, 
  Star, 
  ArrowLeft, 
  Heart, 
  Pin, 
  Archive, 
  Calendar, 
  Layers,
  Flame,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import CompletionRing from '@/components/ui/CompletionRing';
import AchievementCard from '@/components/game/AchievementCard';

export default function GameDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const { 
    progress, 
    profile,
    addGame,
    removeGame,
    toggleFavorite, 
    togglePin, 
    toggleBacklog, 
    toggleActiveHunting,
    updatePlaytime,
    setCompletionGoal,
    clearGoal,
    syncAchievements,
    syncUserAchievements
  } = useTrackerStore();

  const [mounted, setMounted] = React.useState(false);
  const [achQuery, setAchQuery] = React.useState('');
  const [achFilter, setAchFilter] = React.useState<'all' | 'unlocked' | 'locked'>('all');
  const [collapsedDlcs, setCollapsedDlcs] = React.useState<Record<string, boolean>>({});

  // Input states for interactive side widgets
  const [playtimeInput, setPlaytimeInput] = React.useState('');
  const [goalInput, setGoalInput] = React.useState('');

  // Syncing states
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncError, setSyncError] = React.useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = React.useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Locate current game
  const game = PRELOADED_GAMES.find(g => g.id === gameId);
  const steamAppId = game?.steamAppId || game?.coverUrl?.match(/\/apps\/(\d+)\//)?.[1];

  // Auto-sync achievements with Steam on mount if a Steam ID is connected
  const autoSyncedRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (mounted && game && profile.steamId && steamAppId && autoSyncedRef.current !== game.id) {
      autoSyncedRef.current = game.id;
      handleSteamSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, game, profile.steamId, steamAppId, gameId]);

  // Sync state values with inputs on mount or progress change
  React.useEffect(() => {
    if (mounted && game) {
      setPlaytimeInput((progress.playtimes[game.id] || 0).toString());
      setGoalInput(progress.completionGoals[game.id] || '');
    }
  }, [mounted, game, progress.playtimes, progress.completionGoals]);

  if (!mounted) {
    return (
      <div className="flex-1 space-y-8 animate-pulse pt-8">
        <div className="h-64 bg-zinc-900 rounded-3xl" />
        <div className="h-44 bg-zinc-900 rounded-3xl" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center py-24 select-none">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800/80 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg mb-4">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-white">Game Not Found</h2>
        <p className="text-xs text-zinc-500 mt-1">The requested game ID could not be loaded from our starter database.</p>
        <button 
          onClick={() => router.push('/games')}
          className="mt-6 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl transition-all hover:scale-105"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const isAdded = progress.ownedGames.includes(game.id);
  const isFavorite = progress.favoriteGames.includes(game.id);
  const isPinned = progress.pinnedGames.includes(game.id);
  const isBacklog = progress.backlogGames.includes(game.id);
  const isHunting = progress.activeHunting.includes(game.id);



  const customAchievements = progress.customAchievements?.[game.id] || [];
  const achievements = customAchievements.length > 0 ? customAchievements : game.achievements;

  // Filter achievements
  const baseAchievements = achievements.filter(ach => !ach.dlcId);
  const dlcAchievements = achievements.filter(ach => !!ach.dlcId);

  // Math totals
  const baseTotal = baseAchievements.length;
  const baseUnlocked = baseAchievements.filter(ach => !!progress.unlockedAchievements[ach.id]).length;
  const basePercentage = baseTotal > 0 ? (baseUnlocked / baseTotal) * 100 : 0;
  
  const dlcTotal = dlcAchievements.length;
  const dlcUnlocked = dlcAchievements.filter(ach => !!progress.unlockedAchievements[ach.id]).length;
  const dlcPercentage = dlcTotal > 0 ? (dlcUnlocked / dlcTotal) * 100 : 0;

  const combinedTotal = achievements.length;
  const combinedUnlocked = achievements.filter(ach => !!progress.unlockedAchievements[ach.id]).length;

  const isPlatinumEarned = baseTotal > 0 && baseUnlocked === baseTotal;

  // Handles updating playtime state
  const handlePlaytimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPlaytimeInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      updatePlaytime(game.id, num);
    }
  };

  // Handles updating completion goals
  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGoalInput(val);
    if (val) {
      setCompletionGoal(game.id, val);
    } else {
      clearGoal(game.id);
    }
  };

  async function handleSteamSync() {
    if (!steamAppId) return;
    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccess(false);
    setSyncSuccessMsg(null);

    try {
      const apiKey = profile.steamApiKey || '';
      const response = await fetch(`/api/steam/achievements?appId=${steamAppId}&apiKey=${encodeURIComponent(apiKey)}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch (Status: ${response.status})`);
      }
      
      if (!data.achievements || !Array.isArray(data.achievements)) {
        throw new Error('Invalid data returned from Steam synchronization endpoint.');
      }
      
      syncAchievements(game.id, data.achievements);
      
      let successMsg = 'Achievements synced successfully with Steam! Full checklist is now loaded.';
      
      if (profile.steamId) {
        try {
          const userRes = await fetch(`/api/steam/user-achievements?appId=${steamAppId}&steamId=${profile.steamId}&apiKey=${encodeURIComponent(apiKey)}`);
          const userData = await userRes.json();
          
          if (userRes.ok && userData.unlockedApiNames && Array.isArray(userData.unlockedApiNames)) {
            syncUserAchievements(game.id, userData.unlockedApiNames);
            const unlockedCount = userData.unlockedApiNames.length;
            successMsg = `Achievements synced! Successfully imported and unlocked ${unlockedCount} trophies from your Steam profile.`;
          } else if (!userRes.ok) {
            console.warn('Personal achievement sync failed:', userData.error);
            successMsg = `Achievements schema synced, but personal progress could not be loaded: ${userData.error || 'Private profile'}`;
          }
        } catch (userErr) {
          console.error('Personal achievements fetch error:', userErr);
          successMsg = 'Achievements schema synced, but failed to retrieve personal progress due to a network error.';
        }
      }
      
      setSyncSuccessMsg(successMsg);
      setSyncSuccess(true);
      
      // Auto-hide success message after 7 seconds
      setTimeout(() => {
        setSyncSuccess(false);
        setSyncSuccessMsg(null);
      }, 7000);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setSyncError(errMsg || 'An unknown error occurred during sync.');
    } finally {
      setIsSyncing(false);
    }
  };



  const toggleDlcCollapse = (dlcId: string) => {
    setCollapsedDlcs(prev => ({
      ...prev,
      [dlcId]: !prev[dlcId]
    }));
  };

  // Filter lists by Search and Dropdown Filter
  const filterAchievementsList = (achList: typeof achievements) => {
    return achList.filter(ach => {
      const matchesSearch = ach.title.toLowerCase().includes(achQuery.toLowerCase()) || 
                            ach.description.toLowerCase().includes(achQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      const unlocked = !!progress.unlockedAchievements[ach.id];
      if (achFilter === 'unlocked') return unlocked;
      if (achFilter === 'locked') return !unlocked;
      
      return true;
    });
  };

  return (
    <div className="space-y-8 pb-20 select-none">
      
      {/* 1. Cinematic Hero Banner */}
      <div className="relative rounded-3xl min-h-[350px] md:h-[45vh] flex flex-col justify-end p-6 md:p-8 overflow-hidden border border-zinc-900 shadow-2xl">
        {/* Banner blur background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={game.bannerUrl} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover blur-[0.5px] brightness-[0.3] z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent z-0" />

        {/* Floating Top Nav */}
        <div className="absolute top-6 left-6 z-10">
          <button 
            onClick={() => router.push('/games')}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-white rounded-xl hover:scale-103 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </button>
        </div>

        {/* Title Details Card Bottom Left and Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 z-10 w-full">
          <div className="flex gap-6 items-end">
            {/* Cover art mockup */}
            <div className="hidden sm:block w-20 h-28 md:w-24 md:h-32 rounded-2xl bg-zinc-800 overflow-hidden shadow-2xl border border-zinc-700 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={game.coverUrl} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 pr-4">
              <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {game.platforms[0]}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mt-2 drop-shadow-md truncate">
                {game.title}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 drop-shadow-sm font-semibold">
                By {game.developer} • {game.releaseYear}
              </p>
            </div>
          </div>

          {/* Quick Library Management CTA Buttons */}
          <div className="flex flex-wrap gap-2 select-none shrink-0 items-center">
            {isAdded ? (
              <>
                <button 
                  onClick={() => toggleActiveHunting(game.id)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all hover:scale-103 cursor-pointer flex items-center gap-1.5 ${
                    isHunting 
                      ? 'bg-orange-600/20 border-orange-500 text-orange-400 glow-bronze' 
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  {isHunting ? 'Currently Hunting' : 'Pin to Hunting'}
                </button>
                <button 
                  onClick={() => toggleBacklog(game.id)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all hover:scale-103 cursor-pointer flex items-center gap-1.5 ${
                    isBacklog 
                      ? 'bg-purple-600/20 border-purple-500 text-purple-400' 
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  {isBacklog ? 'In Backlog' : 'Move to Backlog'}
                </button>
                <button 
                  onClick={() => toggleFavorite(game.id)}
                  className={`p-2.5 rounded-xl border transition-all hover:scale-[1.07] cursor-pointer ${
                    isFavorite 
                      ? 'bg-rose-600/20 border-rose-500 text-rose-400' 
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Favorite game"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
                </button>
                <button 
                  onClick={() => togglePin(game.id)}
                  className={`p-2.5 rounded-xl border transition-all hover:scale-[1.07] cursor-pointer ${
                    isPinned 
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Pin to top"
                >
                  <Pin className={`w-4 h-4 ${isPinned ? 'fill-blue-500' : ''}`} />
                </button>
                {steamAppId && (
                  <button 
                    onClick={handleSteamSync}
                    disabled={isSyncing}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all hover:scale-103 cursor-pointer flex items-center gap-1.5 ${
                      isSyncing
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 cursor-not-allowed animate-pulse'
                        : 'bg-blue-600 hover:bg-blue-500 text-white border-transparent shadow-lg shadow-blue-500/20'
                    }`}
                  >
                    <svg
                      className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isSyncing ? 'Syncing...' : 'Sync with Steam'}
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to remove this game and ALL its achievement data from your library?')) {
                      removeGame(game.id);
                    }
                  }}
                  className="px-4 py-2.5 bg-red-950/40 border border-red-900/30 hover:bg-red-900 text-red-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Remove Game
                </button>
              </>
            ) : (
              <button 
                onClick={() => addGame(game.id)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg shadow-blue-500/25 cursor-pointer hover:scale-102 transition-all flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4" />
                Register Game in Library
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sync Status Notifications */}
      {syncSuccess && (
        <div className="glass-panel border-emerald-500/40 bg-emerald-950/20 text-emerald-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300 select-none">
          <span>✨</span>
          <span>{syncSuccessMsg || 'Achievements synced successfully with Steam! Full checklist is now loaded.'}</span>
        </div>
      )}

      {syncError && (
        <div className="glass-panel border-red-500/40 bg-red-950/20 text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300 select-none">
          <span>⚠️</span>
          <span>Sync Alert: {syncError}</span>
          <button 
            onClick={() => setSyncError(null)}
            className="ml-auto text-[10px] uppercase text-zinc-500 hover:text-white font-extrabold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Core Layout: Left Stats Column / Right Achievements Cabinet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Custom Widgets & Progress Rings */}
        <div className="space-y-6">
          
          {/* Progress Ring Box */}
          <div className="glass-panel border-zinc-800/80 rounded-3xl p-6 space-y-4 select-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
            <h3 className="text-xs text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center justify-between">
              <span>Achievement Progress</span>
              {isPlatinumEarned && <span className="text-[10px] text-blue-400 font-bold uppercase glow-platinum">PLATINUM 🏆</span>}
            </h3>
            
            <div className="flex items-center gap-6">
              <div className="shrink-0 drop-shadow-[0_0_12px_rgba(59,130,246,0.1)]">
                <CompletionRing 
                  percentage={basePercentage} 
                  size={84} 
                  strokeWidth={6.5} 
                  ringColor={isPlatinumEarned ? '#a0b2c6' : '#3b82f6'}
                  textSize="text-sm font-extrabold"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-xs text-zinc-400 font-semibold">Base Game Completion</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">{baseUnlocked}</span>
                  <span className="text-zinc-500 text-xs">/ {baseTotal} unlocked</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${isPlatinumEarned ? 'bg-slate-400 glow-platinum' : 'bg-blue-500'}`}
                    style={{ width: `${basePercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {dlcTotal > 0 && (
              <div className="border-t border-zinc-900/60 pt-4 flex items-center gap-6">
                <div className="shrink-0">
                  <CompletionRing 
                    percentage={dlcPercentage} 
                    size={56} 
                    strokeWidth={4.5} 
                    ringColor="#a855f7"
                    textSize="text-[9px]"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    DLC Progress
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-extrabold text-white">{dlcUnlocked}</span>
                    <span className="text-zinc-500 text-[10px]">/ {dlcTotal} unlocked</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Playtime & Goal Target Widget */}
          {isAdded && (
            <div className="glass-panel border-zinc-800/80 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-900 pb-2">
                Hunting Metrics
              </h3>
              
              {/* Playtime Updater */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Playtime Tracked (Hours)</label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  <input 
                    type="number" 
                    step="0.5"
                    min="0"
                    value={playtimeInput}
                    onChange={handlePlaytimeChange}
                    className="w-full bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Goal Target Picker */}
              <div className="space-y-1 pt-2">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Target 100% Date</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <input 
                    type="date" 
                    value={goalInput}
                    onChange={handleGoalChange}
                    className="w-full bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Meta specs (Difficulty, duration) */}
          <div className="glass-panel border-zinc-800/80 rounded-3xl p-6 space-y-4 select-none">
            <h3 className="text-xs text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-900 pb-2">
              Hunter Analysis
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Difficulty</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                  <span className="text-lg font-black text-white">{game.estimatedDifficulty}/10</span>
                </div>
              </div>
              <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Hours Required</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <Clock className="w-5 h-5 text-zinc-500" />
                  <span className="text-lg font-black text-white">~{game.estimatedHours}h</span>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-zinc-400 italic leading-relaxed border-t border-zinc-900/60 pt-3">
              &quot;{game.description}&quot;
            </p>
          </div>
        </div>

        {/* Right Column - Achievements cabinet */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Filtering Drawer */}
          <div className="glass-panel border-zinc-800/80 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search text query */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Filter achievements..." 
                  value={achQuery}
                  onChange={(e) => setAchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1.5 select-none shrink-0 w-full sm:w-auto justify-end">
                <button 
                  onClick={() => setAchFilter('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    achFilter === 'all' 
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                      : 'bg-transparent border-zinc-900 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  All ({combinedTotal})
                </button>
                <button 
                  onClick={() => setAchFilter('unlocked')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    achFilter === 'unlocked' 
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                      : 'bg-transparent border-zinc-900 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Unlocked ({combinedUnlocked})
                </button>
                <button 
                  onClick={() => setAchFilter('locked')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    achFilter === 'locked' 
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                      : 'bg-transparent border-zinc-900 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Locked ({combinedTotal - combinedUnlocked})
                </button>
              </div>
            </div>
          </div>

          {/* Section: Base game achievements */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 select-none">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-500" />
                Base Game Achievements
              </h3>
              <span className="text-xs text-zinc-500 font-semibold">{baseUnlocked}/{baseTotal}</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {(() => {
                const list = filterAchievementsList(baseAchievements);
                if (list.length === 0) {
                  return (
                    <div className="glass-panel border-zinc-800/40 rounded-3xl p-8 text-center text-zinc-500 text-xs italic select-none">
                      No matching achievements found in this section.
                    </div>
                  );
                }
                return list.map((ach) => (
                  <AchievementCard key={ach.id} achievement={ach} gameTitle={game.title} />
                ));
              })()}
            </div>
          </section>

          {/* Section: DLC Achievements (separated!) */}
          {game.dlcs.map((dlc) => {
            const dlcAchList = dlcAchievements.filter(ach => ach.dlcId === dlc.id);
            const totalDlc = dlcAchList.length;
            const unlockedDlc = dlcAchList.filter(ach => !!progress.unlockedAchievements[ach.id]).length;
            const isCollapsed = !!collapsedDlcs[dlc.id];

            return (
              <section key={dlc.id} className="space-y-4">
                {/* DLC Header Toggle */}
                <div 
                  onClick={() => toggleDlcCollapse(dlc.id)}
                  className="flex items-center justify-between border-b border-zinc-900 pb-2 select-none cursor-pointer group"
                >
                  <h3 className="text-base font-extrabold text-zinc-200 group-hover:text-purple-400 transition-colors flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-400" />
                    DLC: {dlc.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500">
                    <span>{unlockedDlc}/{totalDlc}</span>
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4 text-purple-400" />}
                  </div>
                </div>

                {/* DLC Achievements list */}
                {!isCollapsed && (
                  <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-top-4 duration-300">
                    {(() => {
                      const list = filterAchievementsList(dlcAchList);
                      if (list.length === 0) {
                        return (
                          <div className="glass-panel border-zinc-800/40 rounded-3xl p-8 text-center text-zinc-500 text-xs italic select-none">
                            No matching achievements found in this DLC section.
                          </div>
                        );
                      }
                      return list.map((ach) => (
                        <AchievementCard key={ach.id} achievement={ach} gameTitle={game.title} />
                      ));
                    })()}
                  </div>
                )}
              </section>
            );
          })}

        </div>
      </div>
    </div>
  );
}
