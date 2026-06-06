/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { PRELOADED_GAMES } from '@/data/preloadedGames';
import { Game } from '@/types';
import { Trophy, Clock, Sparkles, Shuffle, ChevronRight, X, Play } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function BacklogRandomizerPage() {
  const { progress, toggleActiveHunting } = useTrackerStore();
  const [mounted, setMounted] = React.useState(false);
  const [showRandomizer, setShowRandomizer] = React.useState(false);
  
  // Randomizer Wheel State
  const [isSpinning, setIsSpinning] = React.useState(false);
  const [randomList, setRandomList] = React.useState<Game[]>([]);
  const [winnerGame, setWinnerGame] = React.useState<Game | null>(null);
  const [spinX, setSpinX] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Compute backlog games list
  const ownedGames = React.useMemo(() => {
    const preloadedOwned = PRELOADED_GAMES.filter(g => progress.ownedGames.includes(g.id));
    const customOwned = Object.values(progress.customGames || {}).filter(g => progress.ownedGames.includes(g.id));
    return [...preloadedOwned, ...customOwned];
  }, [progress.ownedGames, progress.customGames]);

  const backlogGames = React.useMemo(() => {
    return ownedGames.filter(game => {
      const custom = progress.customAchievements?.[game.id] || [];
      const achievements = custom.length > 0 ? custom : game.achievements;
      
      const unlockedCount = achievements.filter(ach => !!progress.unlockedAchievements[ach.id]).length;
      const totalCount = achievements.length;
      
      const isCompleted = totalCount > 0 && unlockedCount === totalCount;
      if (isCompleted) return false;

      const isExplicitBacklog = progress.backlogGames.includes(game.id);
      const playtime = progress.playtimes[game.id] || 0;
      const isUnplayed = playtime === 0;
      const isInProgress = playtime > 0 && unlockedCount < totalCount;

      return isExplicitBacklog || isUnplayed || isInProgress;
    });
  }, [ownedGames, progress.backlogGames, progress.playtimes, progress.unlockedAchievements, progress.customAchievements]);

  // Sub-categorize backlog
  const unplayedBacklog = React.useMemo(() => {
    return backlogGames.filter(g => (progress.playtimes[g.id] || 0) === 0);
  }, [backlogGames, progress.playtimes]);

  const inProgressBacklog = React.useMemo(() => {
    return backlogGames.filter(g => (progress.playtimes[g.id] || 0) > 0);
  }, [backlogGames, progress.playtimes]);

  // Time to S-Rank all backlog
  const totalBacklogHours = React.useMemo(() => {
    return backlogGames.reduce((acc, g) => acc + (g.estimatedHours || 0), 0);
  }, [backlogGames]);

  if (!mounted) {
    return (
      <div className="flex-1 space-y-8 animate-pulse pt-8">
        <div className="h-10 w-48 bg-zinc-900 rounded-xl" />
        <div className="h-44 bg-zinc-900 rounded-3xl" />
      </div>
    );
  }

  // Trigger the randomizer spin animation
  const startRandomizer = () => {
    if (backlogGames.length === 0) return;
    setIsSpinning(true);
    setWinnerGame(null);
    setSpinX(0);

    // Build a sequence of 50 items. The winner will be at index 40.
    const list: Game[] = [];
    for (let i = 0; i < 45; i++) {
      const randomGame = backlogGames[Math.floor(Math.random() * backlogGames.length)];
      list.push(randomGame);
    }

    const chosenWinner = backlogGames[Math.floor(Math.random() * backlogGames.length)];
    list[40] = chosenWinner; // Pin the winner at index 40
    setRandomList(list);
    setShowRandomizer(true);

    // Run the slide translation animation
    // Card width is 110px, gap is 12px. Total item width is 122px.
    const cardWidth = 110;
    const gap = 12;
    const itemWidth = cardWidth + gap;
    
    // Target coordinate: align the center of the winner card with the center of the viewport (which is 256px wide for a 512px container)
    const targetOffset = - (40 * itemWidth - 256 + cardWidth / 2);

    setTimeout(() => {
      setSpinX(targetOffset);
    }, 100);

    // Settle animation duration is 5.5 seconds
    setTimeout(() => {
      setWinnerGame(chosenWinner);
      setIsSpinning(false);
    }, 5600);
  };

  const handleAcceptChallenge = (gameId: string) => {
    const isHunting = progress.activeHunting.includes(gameId);
    if (!isHunting) {
      toggleActiveHunting(gameId);
    }
    setShowRandomizer(false);
  };

  return (
    <div className="flex-1 space-y-8 pt-4 md:pt-8 font-sans pb-24 md:pb-8">
      {/* Title Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase select-none flex items-center gap-3">
            <Clock className="w-8 h-8 text-purple-500 animate-pulse" />
            The Backlog Vault
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5">
            Your S-Rank clearing desk. Gamify your backlog and S-Rank your forgotten S-Tier titles.
          </p>
        </div>

        {backlogGames.length > 0 && (
          <button
            onClick={startRandomizer}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all cursor-pointer hover:scale-102 active:scale-98"
          >
            <Shuffle className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
            Spin the Randomizer
          </button>
        )}
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
        <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-center shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Backlog Games</span>
          <span className="text-2xl font-black text-white mt-1">{backlogGames.length}</span>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-center shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Unplayed Shelf</span>
          <span className="text-2xl font-black text-purple-400 mt-1">{unplayedBacklog.length}</span>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-center shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">In Progress</span>
          <span className="text-2xl font-black text-indigo-400 mt-1">{inProgressBacklog.length}</span>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-center shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Hours to Clear</span>
          <span className="text-2xl font-black text-amber-500 mt-1">{totalBacklogHours}h</span>
        </div>
      </div>

      {/* Main Backlog View */}
      {backlogGames.length === 0 ? (
        <div className="glass-panel border border-zinc-900 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-5 mx-auto">
            <Trophy className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight uppercase">Backlog Empty!</h2>
          <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
            Congratulations S-Rank hunter! You have no unfinished or unplayed games left in your active cabinet. Go to the Library to add new conquests.
          </p>
          <Link
            href="/games"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            Go to S-Rank Library
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section 1: Unplayed Vault */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-purple-400 tracking-wider uppercase flex items-center gap-2 select-none">
              <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              Unplayed S-Rank Catalog ({unplayedBacklog.length})
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {unplayedBacklog.map(game => {
                const custom = progress.customAchievements?.[game.id] || [];
                const achievements = custom.length > 0 ? custom : game.achievements;
                return (
                  <div key={game.id} className="bg-zinc-900/40 border border-zinc-850/80 rounded-2xl p-4.5 flex gap-4 hover:border-zinc-700 transition-colors shadow-md relative group select-none overflow-hidden">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 relative shadow-inner">
                      <img src={game.coverUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-extrabold text-white truncate group-hover:text-purple-400 transition-colors" title={game.title}>
                          {game.title}
                        </h3>
                        <p className="text-[10px] text-zinc-500 truncate mt-0.5">{game.developer}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-md font-semibold">
                          0h played
                        </span>
                        <span className="text-[8px] bg-zinc-950 border border-zinc-800 text-zinc-500 px-2 py-0.5 rounded-md font-semibold">
                          {achievements.length} trophies
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {unplayedBacklog.length === 0 && (
                <div className="col-span-full bg-zinc-900/10 border border-zinc-850/40 border-dashed rounded-2xl p-8 text-center text-xs text-zinc-500">
                  No completely unplayed games left!
                </div>
              )}
            </div>
          </div>

          {/* Section 2: In-Progress Cabinet */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-indigo-400 tracking-wider uppercase flex items-center gap-2 select-none">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              In Progress S-Rank Hunts ({inProgressBacklog.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inProgressBacklog.map(game => {
                const custom = progress.customAchievements?.[game.id] || [];
                const achievements = custom.length > 0 ? custom : game.achievements;
                
                const unlockedCount = achievements.filter(ach => !!progress.unlockedAchievements[ach.id]).length;
                const totalCount = achievements.length;
                const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
                
                return (
                  <div key={game.id} className="bg-zinc-900/40 border border-zinc-850/80 rounded-2xl p-4.5 flex gap-4 hover:border-zinc-700 transition-colors shadow-md relative group select-none overflow-hidden">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 relative shadow-inner">
                      <img src={game.coverUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-extrabold text-white truncate group-hover:text-indigo-400 transition-colors" title={game.title}>
                          {game.title}
                        </h3>
                        {/* Progress bar */}
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-[8px] font-bold text-zinc-400">
                            <span>Progress</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${progressPct}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[8px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md font-semibold">
                          {progress.playtimes[game.id] || 0}h played
                        </span>
                        <span className="text-[8px] bg-zinc-950 border border-zinc-800 text-zinc-500 px-2 py-0.5 rounded-md font-semibold">
                          {unlockedCount}/{totalCount} unlocked
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {inProgressBacklog.length === 0 && (
                <div className="col-span-full bg-zinc-900/10 border border-zinc-850/40 border-dashed rounded-2xl p-8 text-center text-xs text-zinc-500">
                  No in-progress hunts left. Time to pick an unplayed game!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* S-Rank Backlog Randomizer Wheel Modal */}
      <AnimatePresence>
        {showRandomizer && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 font-sans select-none">
            <div className="relative w-full max-w-lg">
              
              {/* Pulsing neon backing glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500 rounded-3xl blur opacity-35 animate-pulse" />

              {/* Glass Card */}
              <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center">
                {/* Header */}
                <div className="flex justify-between items-center w-full mb-6">
                  <div className="flex items-center gap-2">
                    <Shuffle className="w-5 h-5 text-purple-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                      S-Rank Roulette
                    </span>
                  </div>
                  {!isSpinning && (
                    <button
                      onClick={() => setShowRandomizer(false)}
                      className="p-1.5 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Spinning Area Viewport */}
                <div className="relative border border-zinc-800 rounded-2xl h-40 bg-zinc-950/60 w-full overflow-hidden flex items-center shadow-inner">
                  
                  {/* Central Indicator Line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-[3px] bg-purple-500 shadow-[0_0_12px_#a855f7] z-30 -translate-x-1/2 pointer-events-none" />
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-purple-400 z-30 pointer-events-none" />
                  <div className="absolute left-1/2 bottom-0 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-purple-400 z-30 pointer-events-none" />

                  {/* Horizontal Sliding Cover Track */}
                  <motion.div
                    className="flex gap-3 px-4 items-center"
                    animate={{ x: spinX }}
                    transition={{
                      type: 'spring',
                      stiffness: 8,
                      damping: 10,
                      mass: 0.8,
                    }}
                  >
                    {randomList.map((game, idx) => (
                      <div
                        key={`${game.id}-${idx}`}
                        className="w-[110px] h-[130px] rounded-xl border border-zinc-850 bg-zinc-900 shrink-0 overflow-hidden relative shadow-md transition-all duration-300"
                        style={{
                          transform: winnerGame === game && idx === 40 ? 'scale(1.03)' : 'scale(1)'
                        }}
                      >
                        <img src={game.coverUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60" />
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Settle / Result Block */}
                <div className="h-44 flex flex-col items-center justify-center mt-6 w-full text-center relative">
                  <AnimatePresence mode="wait">
                    {isSpinning ? (
                      <motion.div
                        key="spinning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider animate-pulse">
                          Rolling achievement matrix...
                        </p>
                      </motion.div>
                    ) : (
                      winnerGame && (
                        <motion.div
                          key="result"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center"
                        >
                          <div className="inline-flex items-center gap-1.5 text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-black uppercase tracking-widest mb-3 animate-bounce shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                            <Sparkles className="w-3.5 h-3.5" /> Target Identified
                          </div>
                          <h3 className="text-lg font-black text-white px-4">
                            {winnerGame.title}
                          </h3>
                          <p className="text-[10px] text-zinc-500 mt-1 max-w-[280px]">
                            {winnerGame.developer} • Estimated S-Rank time: {winnerGame.estimatedHours}h
                          </p>

                          <div className="flex gap-3 mt-6">
                            <button
                              onClick={() => handleAcceptChallenge(winnerGame.id)}
                              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              Launch Quest
                            </button>
                            <button
                              onClick={startRandomizer}
                              className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-300 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Spin Again
                            </button>
                          </div>
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
