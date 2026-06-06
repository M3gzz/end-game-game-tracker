/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { PRELOADED_GAMES } from '@/data/preloadedGames';
import { Game, Achievement } from '@/types';
import { 
  Trophy, 
  Gamepad2, 
  Flame, 
  Compass, 
  Calendar,
  Activity as ActivityIcon,
  Sparkles,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import CompletionRing from '@/components/ui/CompletionRing';
import AddGameModal from '@/components/library/AddGameModal';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

export default function Dashboard() {
  const { progress, activities, addGame, toggleActiveHunting } = useTrackerStore();
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);



  // Resolve user games from preloaded list + custom/synced games
  const ownedGames = React.useMemo(() => {
    const allGames = [...PRELOADED_GAMES, ...Object.values(progress.customGames || {})];
    return allGames.filter(game => progress.ownedGames.includes(game.id));
  }, [progress.ownedGames, progress.customGames]);

  // Overall Achievement Math
  let totalAchievementsInLibrary = 0;
  let totalUnlockedAchievements = 0;
  let bronzeUnlocked = 0;
  let silverUnlocked = 0;
  let goldUnlocked = 0;
  let platinumUnlocked = 0;

  ownedGames.forEach((game) => {
    const custom = progress.customAchievements?.[game.id] || [];
    const achievements = custom.length > 0 ? custom : game.achievements;
    const baseAchievements = achievements.filter(ach => !ach.dlcId);
    totalAchievementsInLibrary += achievements.length;
    
    // Tally by category
    achievements.forEach((ach) => {
      const unlocked = !!progress.unlockedAchievements[ach.id];
      if (unlocked) {
        totalUnlockedAchievements++;
        if (ach.tier === 'bronze') bronzeUnlocked++;
        else if (ach.tier === 'silver') silverUnlocked++;
        else if (ach.tier === 'gold') goldUnlocked++;
      }
    });

    // Check if base game is 100% complete -> Platinum
    const baseUnlockedCount = baseAchievements.filter(ach => !!progress.unlockedAchievements[ach.id]).length;
    if (baseAchievements.length > 0 && baseUnlockedCount === baseAchievements.length) {
      platinumUnlocked++;
    }
  });

  const overallCompletionPercentage = totalAchievementsInLibrary > 0 
    ? (totalUnlockedAchievements / totalAchievementsInLibrary) * 100 
    : 0;

  // Games 100% completed
  const completedGamesCount = ownedGames.filter(game => {
    const custom = progress.customAchievements?.[game.id] || [];
    const achievements = custom.length > 0 ? custom : game.achievements;
    const baseAchievements = achievements.filter(ach => !ach.dlcId);
    const baseUnlocked = baseAchievements.filter(ach => !!progress.unlockedAchievements[ach.id]).length;
    return baseAchievements.length > 0 && baseUnlocked === baseAchievements.length;
  }).length;

  // Active Hunting Games
  const activeHuntingGames = ownedGames.filter(game => progress.activeHunting.includes(game.id));

  // Chart Data preparation
  const chartData = ownedGames.map(game => {
    const custom = progress.customAchievements?.[game.id] || [];
    const achievements = custom.length > 0 ? custom : game.achievements;
    const unlocked = achievements.filter(ach => !!progress.unlockedAchievements[ach.id]).length;
    const total = achievements.length;
    const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;
    return {
      name: game.title.length > 15 ? game.title.substring(0, 15) + '...' : game.title,
      percentage: pct,
    };
  }).filter(item => item.percentage > 0).slice(0, 8); // Top 8 games with progress

  // Daily Hunt Selection Logic
  const dailyHuntAchievement = React.useMemo(() => {
    // Get all locked achievements in owned games first
    const candidates: { achievement: Achievement; game: Game }[] = [];
    
    ownedGames.forEach(game => {
      const custom = progress.customAchievements?.[game.id] || [];
      const achievements = custom.length > 0 ? custom : game.achievements;
      achievements.forEach(ach => {
        if (!progress.unlockedAchievements[ach.id]) {
          candidates.push({ achievement: ach, game });
        }
      });
    });

    // If no candidate in owned games, search all preloaded games for locked ones (or any achievement)
    if (candidates.length === 0) {
      PRELOADED_GAMES.forEach(game => {
        const custom = progress.customAchievements?.[game.id] || [];
        const achievements = custom.length > 0 ? custom : game.achievements;
        achievements.forEach(ach => {
          candidates.push({ achievement: ach, game });
        });
      });
    }

    if (candidates.length === 0) return null;

    // Use date seed for consistent daily recommendation
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    // Simple LCG pseudo-random generator with the seed
    const lcg = (s: number) => {
      return (s * 1664525 + 1013904223) % 4294967296;
    };
    const randomIdx = lcg(seed) % candidates.length;
    return candidates[randomIdx];
  }, [ownedGames, progress.unlockedAchievements, progress.customAchievements]);

  const isCurrentlyHunting = dailyHuntAchievement
    ? progress.activeHunting.includes(dailyHuntAchievement.game.id)
    : false;

  const handleEmbarkOnHunt = () => {
    if (!dailyHuntAchievement) return;
    const { game } = dailyHuntAchievement;
    if (!progress.ownedGames.includes(game.id)) {
      addGame(game.id);
    }
    toggleActiveHunting(game.id);
  };

  if (!mounted) {
    return (
      <div className="flex-1 space-y-8 animate-pulse pt-8">
        <div className="h-10 w-64 bg-zinc-900 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-zinc-900 rounded-3xl" />
          <div className="h-44 bg-zinc-900 rounded-3xl" />
          <div className="h-44 bg-zinc-900 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 relative min-h-screen">
      {/* Dynamic Gaming Atmosphere Backlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[60%] h-[50%] rounded-full bg-purple-500/[0.02] blur-[120px] pointer-events-none" />
      
      {/* Cyber Esports Grid Overlay */}
      <div 
        className="absolute top-0 left-0 right-0 h-[450px] pointer-events-none select-none opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.15), transparent 70%), linear-gradient(rgba(9, 9, 11, 0) 70%, rgba(9, 9, 11, 1)), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Crect x=\'0\' y=\'0\' width=\'24\' height=\'24\' fill=\'none\'/%3E%3Crect x=\'0\' y=\'0\' width=\'23\' height=\'23\' fill=\'none\' stroke=\'rgba(255,255,255,0.06)\' stroke-width=\'1\'/%3E%3C/svg%3E")',
          backgroundSize: '100% 100%, 100% 100%, 24px 24px'
        }}
      />
      {/* Header Banner */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none relative z-10 pt-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
            <Sparkles className="w-4 h-4 animate-spin text-blue-400" />
            Gaming Command Center
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Welcome Back, Hunter
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">Track your achievements, beat difficulties, and unlock gold trophies.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black tracking-wider uppercase rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] cursor-pointer transition-all duration-300"
          >
            <Gamepad2 className="w-4 h-4" />
            Add Game
          </button>
          <Link 
            href="/games"
            className="flex items-center gap-2 px-5 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-black tracking-wider uppercase rounded-2xl cursor-pointer hover:scale-[1.02] transition-all duration-300"
          >
            <Compass className="w-4 h-4" />
            Library
          </Link>
        </div>
      </header>

      {/* Empty State Banner if no games added */}
      {ownedGames.length === 0 ? (
        <div className="glass-panel border-zinc-800/80 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-6 select-none mt-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-4xl shadow-inner">
            🏆
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-white">Your Trophy Library is Empty</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Register some games from our preloaded catalog to calculate your aggregate stats, unlock trophies, and track completion goals.
            </p>
          </div>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-black tracking-wider uppercase rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-102 cursor-pointer transition-all"
          >
            Add Your First Game
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Actual Dashboard Contents */
        <div className="space-y-8">
          
          {/* Top Panel: Aggregate Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat 1: Overall completion ring */}
            <div className="glass-panel border-zinc-800/80 rounded-3xl p-6 flex items-center justify-between select-none">
              <div className="space-y-2">
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Overall Completion</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{Math.round(overallCompletionPercentage)}%</span>
                </div>
                <p className="text-[10px] text-zinc-500">Across {ownedGames.length} games in library</p>
              </div>
              <div className="shrink-0 drop-shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <CompletionRing 
                  percentage={overallCompletionPercentage} 
                  size={96} 
                  strokeWidth={7} 
                  ringColor="#3b82f6" 
                  textSize="text-base font-black"
                />
              </div>
            </div>

            {/* Stat 2: Trophy Cabinet */}
            <div className="glass-panel border-zinc-800/80 rounded-3xl p-6 flex flex-col justify-between select-none">
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-3">Trophy Cabinet</p>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-2" title="Platinum (100% Base game)">
                  <span className="text-xl">🏆</span>
                  <p className="text-xs font-black text-white mt-1">{platinumUnlocked}</p>
                </div>
                <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-2" title="Gold achievements unlocked">
                  <span className="text-xl">🥇</span>
                  <p className="text-xs font-black text-white mt-1">{goldUnlocked}</p>
                </div>
                <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-2" title="Silver achievements unlocked">
                  <span className="text-xl">🥈</span>
                  <p className="text-xs font-black text-white mt-1">{silverUnlocked}</p>
                </div>
                <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-2" title="Bronze achievements unlocked">
                  <span className="text-xl">🥉</span>
                  <p className="text-xs font-black text-white mt-1">{bronzeUnlocked}</p>
                </div>
              </div>
            </div>

            {/* Stat 3: Goals and Achievements metrics */}
            <div className="glass-panel border-zinc-800/80 rounded-3xl p-6 flex flex-col justify-between select-none">
              <div>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-2">Unlocked Ratios</p>
                <div className="flex items-center justify-between text-sm py-1 border-b border-zinc-900/60">
                  <span className="text-zinc-400 text-xs">Total achievements:</span>
                  <span className="font-bold text-zinc-200">{totalUnlockedAchievements} / {totalAchievementsInLibrary}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-1 border-b border-zinc-900/60 mt-1">
                  <span className="text-zinc-400 text-xs">Completed games (100%):</span>
                  <span className="font-bold text-emerald-400">{completedGamesCount} / {ownedGames.length}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-zinc-500 font-semibold">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />
                <span>Active Streak: {progress.streakCount} days active</span>
              </div>
            </div>
          </div>

          {/* Daily Hunt & Milestone boards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
            {/* Daily Hunt Recommended Card */}
            <div className="lg:col-span-7 glass-panel border-zinc-800/80 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[300px]">
              {/* Glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-indigo-500/5 pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Compass className="w-4.5 h-4.5 text-blue-400" /> Daily Hunt Recommendation
                  </h3>
                  <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                    DAILY TARGET
                  </span>
                </div>

                {dailyHuntAchievement ? (
                  <div className="flex gap-5 items-start">
                    {/* Achievement Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center relative shrink-0 shadow-lg group">
                      {(() => {
                        const icon = dailyHuntAchievement.achievement.iconUrl?.trim() || '';
                        const isUrl = icon.startsWith('http') || icon.startsWith('//') || icon.includes('/') || icon.includes('.');
                        if (isUrl) {
                          return (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={icon.startsWith('//') ? `https:${icon}` : icon} 
                                alt="" 
                                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-all duration-300"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                              <span className="fallback-icon hidden text-3xl leading-none">🏆</span>
                            </>
                          );
                        }
                        return <span className="text-3xl leading-none">{icon || '🏆'}</span>;
                      })()}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm text-zinc-100 truncate">{dailyHuntAchievement.achievement.title}</h4>
                        <span 
                          className="text-[8px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded border leading-none bg-zinc-950/60"
                          style={{
                            borderColor: `var(--trophy-border-${dailyHuntAchievement.achievement.tier})`,
                            color: `var(--trophy-text-${dailyHuntAchievement.achievement.tier})`
                          }}
                        >
                          {dailyHuntAchievement.achievement.tier}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                        {dailyHuntAchievement.achievement.description || 'No description available.'}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-1">
                        From: <span className="text-zinc-300 font-extrabold">{dailyHuntAchievement.game.title}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No recommendations available today.</p>
                )}
              </div>

              {dailyHuntAchievement && (
                <div className="relative z-10 pt-4 border-t border-zinc-850 flex items-center justify-between gap-4 mt-6">
                  <div className="text-[10px] text-zinc-500 leading-normal max-w-[60%]">
                    {progress.ownedGames.includes(dailyHuntAchievement.game.id) ? (
                      <span>Embarking on the hunt will tag the game in your library as **Currently Hunting**!</span>
                    ) : (
                      <span>This game is not in your library yet. Embarking will add it automatically!</span>
                    )}
                  </div>
                  <button
                    onClick={handleEmbarkOnHunt}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer hover:scale-102 flex items-center gap-1.5 shrink-0 ${
                      isCurrentlyHunting
                        ? 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
                    }`}
                  >
                    {isCurrentlyHunting ? (
                      <>
                        <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" /> Hunting Active
                      </>
                    ) : (
                      <>
                        🎯 Embark on Hunt
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Milestones Boards */}
            <div className="lg:col-span-5 glass-panel border-zinc-800/80 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[300px]">
              {/* Glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 pointer-events-none" />
              
              <div className="relative z-10 space-y-4 w-full">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Trophy className="w-4.5 h-4.5 text-purple-400" /> Legacy Milestones
                  </h3>
                  <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                    ACHIEVEMENTS
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: 'Novice Hunter',
                      description: 'Unlock at least 1 achievement',
                      icon: '🛡️',
                      completed: totalUnlockedAchievements >= 1,
                      progressText: `${Math.min(totalUnlockedAchievements, 1)} / 1`,
                      pct: Math.min(totalUnlockedAchievements / 1, 1) * 100,
                      color: 'from-blue-500 to-indigo-500'
                    },
                    {
                      title: 'Cabinet Curator',
                      description: 'Unlock 15 achievements',
                      icon: '👑',
                      completed: totalUnlockedAchievements >= 15,
                      progressText: `${Math.min(totalUnlockedAchievements, 15)} / 15`,
                      pct: Math.min(totalUnlockedAchievements / 15, 1) * 100,
                      color: 'from-purple-500 to-pink-500'
                    },
                    {
                      title: 'Streak Master',
                      description: '3-day active streak',
                      icon: '⚡',
                      completed: progress.streakCount >= 3,
                      progressText: `${Math.min(progress.streakCount, 3)} / 3 days`,
                      pct: Math.min(progress.streakCount / 3, 1) * 100,
                      color: 'from-orange-500 to-yellow-500'
                    },
                    {
                      title: 'Platinum Overlord',
                      description: '100% complete any game',
                      icon: '☄️',
                      completed: completedGamesCount >= 1,
                      progressText: `${Math.min(completedGamesCount, 1)} / 1 game`,
                      pct: Math.min(completedGamesCount / 1, 1) * 100,
                      color: 'from-emerald-500 to-teal-500'
                    }
                  ].map((milestone) => (
                    <div key={milestone.title} className="flex items-center gap-3.5">
                      <div 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all ${
                          milestone.completed
                            ? 'bg-zinc-950 border-purple-500/30 text-white shadow-md'
                            : 'bg-zinc-950/20 border-zinc-900 text-zinc-650 opacity-40'
                        }`}
                        title={milestone.completed ? 'Unlocked!' : 'Locked'}
                      >
                        {milestone.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center select-text">
                          <span className={`text-xs font-black truncate ${milestone.completed ? 'text-zinc-100' : 'text-zinc-500'}`}>
                            {milestone.title}
                          </span>
                          <span className={`text-[10px] font-bold ${milestone.completed ? 'text-purple-400 font-extrabold' : 'text-zinc-600'}`}>
                            {milestone.progressText}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 truncate">{milestone.description}</p>
                        <div className="w-full bg-zinc-950 border border-zinc-900 rounded-full h-1 mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${milestone.color} rounded-full transition-all duration-500`}
                            style={{ width: `${milestone.pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Currently Hunting Row */}
          {activeHuntingGames.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2 select-none">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                Currently Hunting
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeHuntingGames.map((game) => {
                  const custom = progress.customAchievements?.[game.id] || [];
                  const achievements = custom.length > 0 ? custom : game.achievements;
                  const baseTotal = achievements.filter(ach => !ach.dlcId).length;
                  const baseUnlocked = achievements.filter(ach => !ach.dlcId && !!progress.unlockedAchievements[ach.id]).length;
                  const basePct = baseTotal > 0 ? Math.round((baseUnlocked / baseTotal) * 100) : 0;
                  const targetGoal = progress.completionGoals[game.id];
                  
                  return (
                    <div 
                      key={game.id}
                      className="glass-panel border-zinc-800/80 rounded-3xl p-5 hover:border-zinc-700/80 transition-all flex gap-4"
                    >
                      <div className="w-14 h-18 bg-zinc-800 rounded-xl overflow-hidden shrink-0 border border-zinc-800 shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={game.coverUrl} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="font-extrabold text-sm text-zinc-100 truncate hover:text-blue-400 transition-colors">
                            <Link href={`/games/${game.id}`}>{game.title}</Link>
                          </h4>
                          <div className="flex justify-between items-center text-[10px] text-zinc-400 font-semibold mt-1.5">
                            <span>Base Progress</span>
                            <span>{baseUnlocked}/{baseTotal} ({basePct}%)</span>
                          </div>
                          <div className="w-full bg-zinc-950 border border-zinc-900 rounded-full h-1 mt-1 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                              style={{ width: `${basePct}%` }}
                            />
                          </div>
                        </div>

                        {targetGoal && (
                          <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-900/50 px-2 py-0.5 rounded-lg w-max select-none mt-2">
                            <Calendar className="w-3 h-3" />
                            Target: {new Date(targetGoal).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Core Analytics: Charts & Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Middle Columns: Graphs & Rarest Achievements */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Analytics Graph */}
              {chartData.length > 0 && (
                <section className="glass-panel border-zinc-800/80 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between select-none">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      Completion Ratios by Game
                    </h3>
                  </div>
                  <div className="h-56 w-full select-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis 
                          dataKey="name" 
                          stroke="#71717a" 
                          fontSize={10} 
                          tickLine={false} 
                        />
                        <YAxis 
                          stroke="#71717a" 
                          fontSize={10} 
                          tickLine={false} 
                          domain={[0, 100]} 
                          unit="%"
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(9, 9, 11, 0.95)', 
                            border: '1px solid rgba(63, 63, 70, 0.8)',
                            borderRadius: '12px',
                            fontSize: '11px',
                            color: '#f4f4f5'
                          }}
                          cursor={{ fill: 'rgba(63, 63, 70, 0.1)' }}
                        />
                        <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#3b82f6" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              {/* Rarest achievements unlocked */}
              <section className="space-y-4">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2 select-none">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Rarest Unlocked Trophies
                </h3>
                
                {/* Rarest Grid */}
                {Object.keys(progress.unlockedAchievements).length === 0 ? (
                  <div className="glass-panel border-zinc-800/40 rounded-3xl p-8 text-center text-zinc-500 text-xs italic select-none">
                    No achievements unlocked yet. Click on games in your library to start ticking achievements!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(() => {
                      // Collect all unlocked achievements
                      const unlocked: { ach: Achievement; game: Game }[] = [];
                      PRELOADED_GAMES.forEach(game => {
                        const custom = progress.customAchievements?.[game.id] || [];
                        const achievements = custom.length > 0 ? custom : game.achievements;
                        achievements.forEach(ach => {
                          if (progress.unlockedAchievements[ach.id]) {
                            unlocked.push({ ach, game });
                          }
                        });
                      });

                      // Sort by rarity percentage (lower is rarer)
                      const rarest = unlocked
                        .sort((a, b) => a.ach.rarityPercentage - b.ach.rarityPercentage)
                        .slice(0, 4);

                      if (rarest.length === 0) return null;

                      return rarest.map(({ ach, game }) => (
                        <div 
                          key={ach.id}
                          className="glass-panel border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3 hover:border-zinc-700/80 transition-all group cursor-pointer overflow-hidden w-full min-w-0"
                        >
                          <div 
                            className={`w-12 h-12 rounded-xl bg-zinc-950 border flex items-center justify-center text-xl shrink-0 shadow-inner overflow-hidden relative group-hover:scale-105 transition-transform duration-300 ${
                              ach.tier === 'platinum' 
                                ? 'border-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.25)]' 
                                : ach.tier === 'gold' 
                                ? 'border-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.25)]' 
                                : ach.tier === 'silver' 
                                ? 'border-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.15)]' 
                                : 'border-amber-700 shadow-[0_0_10px_rgba(249,115,22,0.15)]'
                            }`}
                          >
                            {(() => {
                              const icon = ach.iconUrl?.trim() || '';
                              const isUrl = icon.startsWith('http') || icon.startsWith('//') || icon.includes('/') || icon.includes('.');
                              if (isUrl) {
                                return (
                                  <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                      src={icon.startsWith('//') ? `https:${icon}` : icon} 
                                      alt={ach.title} 
                                      className="w-full h-full object-cover rounded-lg" 
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                                        if (fallback) fallback.classList.remove('hidden');
                                      }}
                                    />
                                    <span className="fallback-icon hidden text-xl leading-none">🏆</span>
                                  </>
                                );
                              }
                              return <span className="text-xl leading-none">{icon || '🏆'}</span>;
                            })()}
                          </div>
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex items-center justify-between gap-2 w-full min-w-0">
                              <h4 className="font-bold text-xs text-zinc-100 truncate flex-1 min-w-0" title={ach.title}>{ach.title}</h4>
                              <span className="text-[9px] text-cyan-400 font-bold shrink-0 bg-cyan-950/40 border border-cyan-800/50 px-1.5 py-0.5 rounded uppercase">
                                {ach.rarityPercentage}%
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500 truncate mt-0.5">{game.title}</p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Activity Timeline log */}
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2 select-none">
                <ActivityIcon className="w-5 h-5 text-purple-500" />
                Live Tracking Activity
              </h3>
              <div className="glass-panel border-zinc-800/80 rounded-3xl p-6 min-h-[400px] flex flex-col justify-between">
                
                {/* Scrollable list */}
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {activities.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 text-xs italic select-none">
                      No tracking actions recorded yet. Unlocks, additions, and notes will stream here in real-time.
                    </div>
                  ) : (
                    activities.map((act) => (
                      <div 
                        key={act.id}
                        className="flex gap-3 text-xs leading-relaxed border-b border-zinc-900/60 pb-3 last:border-0"
                      >
                        {/* Type Icon indicator */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border text-base select-none ${
                          act.type === 'unlock' 
                            ? 'bg-blue-950/40 border-blue-900/50 text-blue-400' 
                            : act.type === 'add' 
                            ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400'
                            : act.type === 'note' 
                            ? 'bg-yellow-950/40 border-yellow-900/50 text-yellow-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}>
                          {act.type === 'unlock' ? '🥇' : act.type === 'add' ? '🎮' : act.type === 'note' ? '📝' : '⚡'}
                        </div>

                        {/* Description */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-zinc-200">
                            {act.type === 'unlock' ? 'Unlocked Trophy' : act.type === 'add' ? 'Game Added' : act.description}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                            {act.gameTitle || 'Library'} {act.achievementTitle ? ` - ${act.achievementTitle}` : ''}
                          </p>
                          <span className="text-[9px] text-zinc-600 font-semibold block mt-1">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(act.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Clear progress Button */}
                {activities.length > 0 && (
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to reset your hunter progress? This clears all local achievements, playtimes, goals, and notes.')) {
                        useTrackerStore.getState().resetProgress();
                      }
                    }}
                    className="w-full text-center py-2 text-[10px] text-red-500 font-bold hover:underline cursor-pointer border-t border-zinc-900/80 pt-4"
                  >
                    Reset Library Progress
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Re-usable Add Game Modal overlay */}
      <AddGameModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
