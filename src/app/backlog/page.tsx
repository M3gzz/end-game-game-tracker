/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { PRELOADED_GAMES } from '@/data/preloadedGames';
import { Game } from '@/types';
import { Trophy, Clock, Sparkles, Shuffle, ChevronRight, Play } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Built-in retro arcade sound synthesis using Web Audio API
const playTickSound = (freq: number) => {
  if (typeof window === 'undefined') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.06);
  } catch {
    // Error is ignored silently
  }
};

const playTriumphSound = () => {
  if (typeof window === 'undefined') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;
    
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Triumph arpeggio: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    playNote(523.25, now, 0.2);
    playNote(659.25, now + 0.1, 0.2);
    playNote(783.99, now + 0.2, 0.2);
    playNote(1046.50, now + 0.3, 0.5);
  } catch {
    // Error is ignored silently
  }
};

export default function BacklogRandomizerPage() {
  const { progress, toggleActiveHunting } = useTrackerStore();
  const [mounted, setMounted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'unplayed' | 'in_progress'>('unplayed');
  
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

  // Set default active tab based on contents on mount
  React.useEffect(() => {
    if (mounted) {
      if (unplayedBacklog.length === 0 && inProgressBacklog.length > 0) {
        setActiveTab('in_progress');
      }
    }
  }, [mounted, unplayedBacklog.length, inProgressBacklog.length]);

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

    // Build a sequence of 45 items. The winner will be at index 40.
    const list: Game[] = [];
    for (let i = 0; i < 45; i++) {
      const randomGame = backlogGames[Math.floor(Math.random() * backlogGames.length)];
      list.push(randomGame);
    }

    const chosenWinner = backlogGames[Math.floor(Math.random() * backlogGames.length)];
    list[40] = chosenWinner; // Pin the winner at index 40
    setRandomList(list);

    // Run the slide translation animation
    // Card width is 110px, gap is 12px. Total item width is 122px.
    const cardWidth = 110;
    const gap = 12;
    const itemWidth = cardWidth + gap;
    
    // Target offset to center card 40 in a 512px width container
    const targetOffset = - (40 * itemWidth - 256 + cardWidth / 2);

    setTimeout(() => {
      setSpinX(targetOffset);
    }, 100);

    // Trigger tick sounds at slowing intervals
    let soundIndex = 0;
    const playNextTick = () => {
      if (soundIndex >= 32) return;
      const delay = 60 + Math.pow(soundIndex, 2) * 5;
      playTickSound(700 - soundIndex * 15);
      soundIndex++;
      setTimeout(playNextTick, delay);
    };
    playNextTick();

    // Settle animation duration is 5.5 seconds
    setTimeout(() => {
      setWinnerGame(chosenWinner);
      setIsSpinning(false);
      playTriumphSound();
    }, 5600);
  };

  const handleAcceptChallenge = (gameId: string) => {
    const isHunting = progress.activeHunting.includes(gameId);
    if (!isHunting) {
      toggleActiveHunting(gameId);
    }
  };

  return (
    <div className="flex-1 space-y-8 pt-4 md:pt-8 font-sans pb-24 md:pb-8 relative">
      {/* Title Hero */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase select-none flex items-center gap-3">
          <Clock className="w-8 h-8 text-purple-500 animate-pulse" />
          The Backlog Vault
        </h1>
        <p className="text-xs text-zinc-400 mt-1.5">
          Your S-Rank clearing desk. Gamify your backlog selection and S-Rank your forgotten titles.
        </p>
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
        <div className="space-y-8">
          {/* CENTERPIECE: The Roulette Randomizer Console */}
          <div className="relative w-full max-w-2xl mx-auto">
            {/* Glowing ambient ring */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500 rounded-3xl blur opacity-35 animate-pulse" />
            
            {/* Console Body */}
            <div className="relative bg-zinc-900/95 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center">
              {/* Header inside centerpiece */}
              <div className="flex justify-between items-center w-full mb-6 select-none">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                    S-Rank Backlog Roulette
                  </span>
                </div>
                {!isSpinning && (
                  <button
                    onClick={startRandomizer}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-purple-500/25"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    Quick Spin
                  </button>
                )}
              </div>

              {/* Viewport Track (Sliding game cards) */}
              <div className="relative border border-zinc-800/80 rounded-2xl h-40 bg-zinc-950/80 w-full overflow-hidden flex items-center shadow-inner">
                {/* Central Target Line indicator */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[3px] bg-purple-500 shadow-[0_0_12px_#a855f7] z-30 -translate-x-1/2 pointer-events-none" />
                <div className="absolute left-1/2 top-0 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-purple-400 z-30 pointer-events-none" />
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-purple-400 z-30 pointer-events-none" />

                {/* Horizontal slider list */}
                {randomList.length > 0 ? (
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
                          transform: winnerGame === game && idx === 40 ? 'scale(1.05)' : 'scale(1)',
                          borderColor: winnerGame === game && idx === 40 ? '#a855f7' : ''
                        }}
                      >
                        <img src={game.coverUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60" />
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full text-zinc-500 p-6 text-center select-none">
                    <Shuffle className="w-8 h-8 mb-2 text-zinc-650" />
                    <p className="text-xs font-semibold">Roulette offline. Press Spin below to boot the randomizer matrix.</p>
                  </div>
                )}
              </div>

              {/* Settle result area */}
              <div className="h-40 flex flex-col items-center justify-center mt-6 w-full text-center relative border-t border-zinc-800/40 pt-4">
                <AnimatePresence mode="wait">
                  {isSpinning ? (
                    <motion.div
                      key="spinning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider animate-pulse">
                        Sifting unplayed conquests...
                      </p>
                    </motion.div>
                  ) : winnerGame ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="inline-flex items-center gap-1.5 text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-black uppercase tracking-widest mb-2 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                        🎯 Target Locked
                      </div>
                      <h3 className="text-lg font-black text-white px-4 leading-none truncate max-w-md">
                        {winnerGame.title}
                      </h3>
                      <p className="text-[10px] text-zinc-500 mt-1 max-w-[280px]">
                        {winnerGame.developer} &bull; S-Rank Duration: {winnerGame.estimatedHours}h
                      </p>

                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={() => handleAcceptChallenge(winnerGame.id)}
                          className={`bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer transition-all ${
                            progress.activeHunting.includes(winnerGame.id) ? 'opacity-60 cursor-default' : 'hover:scale-105 active:scale-95'
                          }`}
                          disabled={progress.activeHunting.includes(winnerGame.id)}
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          {progress.activeHunting.includes(winnerGame.id) ? 'Quest Active' : 'Launch Quest'}
                        </button>
                        <button
                          onClick={startRandomizer}
                          className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-300 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer hover:scale-105 active:scale-95"
                        >
                          Spin Again
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center select-none">
                      <button
                        onClick={startRandomizer}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 border border-purple-500/20"
                      >
                        <Shuffle className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                        Spin the Randomizer Wheel
                      </button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-900/60 pt-8 space-y-6">
            {/* Tab Controllers */}
            <div className="flex border-b border-zinc-900 select-none">
              <button
                onClick={() => setActiveTab('unplayed')}
                className={`px-5 py-3.5 text-xs font-extrabold tracking-widest uppercase border-b-2 transition-all cursor-pointer ${
                  activeTab === 'unplayed'
                    ? 'text-purple-400 font-black border-purple-500'
                    : 'border-transparent text-zinc-550 hover:text-zinc-300'
                }`}
                style={activeTab === 'unplayed' ? { textShadow: '0 0 10px rgba(168,85,247,0.3)' } : {}}
              >
                Unplayed Shelf <span className="text-[10px] ml-1 bg-zinc-900 px-1.5 py-0.5 rounded font-semibold text-zinc-400">{unplayedBacklog.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('in_progress')}
                className={`px-5 py-3.5 text-xs font-extrabold tracking-widest uppercase border-b-2 transition-all cursor-pointer ${
                  activeTab === 'in_progress'
                    ? 'text-indigo-400 font-black border-indigo-500'
                    : 'border-transparent text-zinc-550 hover:text-zinc-300'
                }`}
                style={activeTab === 'in_progress' ? { textShadow: '0 0 10px rgba(99,102,241,0.3)' } : {}}
              >
                In Progress Shelf <span className="text-[10px] ml-1 bg-zinc-900 px-1.5 py-0.5 rounded font-semibold text-zinc-400">{inProgressBacklog.length}</span>
              </button>
            </div>

            {/* Tab Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'unplayed' ? (
                unplayedBacklog.map(game => {
                  const custom = progress.customAchievements?.[game.id] || [];
                  const achievements = custom.length > 0 ? custom : game.achievements;
                  const isHunting = progress.activeHunting.includes(game.id);

                  return (
                    <div key={game.id} className="bg-zinc-900/40 border border-zinc-850/80 rounded-3xl p-4 flex gap-4 hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all shadow-md relative group select-none overflow-hidden">
                      <div className="w-14 h-18 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 relative shadow-inner">
                        <img src={game.coverUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xs font-extrabold text-white truncate group-hover:text-purple-400 transition-colors" title={game.title}>
                            {game.title}
                          </h3>
                          <p className="text-[9px] text-zinc-500 truncate mt-0.5">{game.developer}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 select-none">
                          <Link 
                            href={`/games/${game.id}`} 
                            className="text-[9px] bg-zinc-950 border border-zinc-850 hover:border-zinc-750 text-zinc-450 hover:text-white px-2.5 py-1 rounded-lg font-bold transition-all"
                          >
                            Trophies ({achievements.length})
                          </Link>
                          <button
                            onClick={() => toggleActiveHunting(game.id)}
                            className={`text-[9px] px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                              isHunting
                                ? 'bg-orange-500/10 border-orange-500 text-orange-400 font-extrabold'
                                : 'bg-zinc-950 border-zinc-850 text-zinc-450 hover:text-white'
                            }`}
                          >
                            {isHunting ? 'Hunting 🔥' : 'Hunt'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                inProgressBacklog.map(game => {
                  const custom = progress.customAchievements?.[game.id] || [];
                  const achievements = custom.length > 0 ? custom : game.achievements;
                  
                  const unlockedCount = achievements.filter(ach => !!progress.unlockedAchievements[ach.id]).length;
                  const totalCount = achievements.length;
                  const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
                  const isHunting = progress.activeHunting.includes(game.id);

                  return (
                    <div key={game.id} className="bg-zinc-900/40 border border-zinc-850/80 rounded-3xl p-4 flex gap-4 hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all shadow-md relative group select-none overflow-hidden">
                      <div className="w-14 h-18 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 relative shadow-inner">
                        <img src={game.coverUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xs font-extrabold text-white truncate group-hover:text-indigo-400 transition-colors" title={game.title}>
                            {game.title}
                          </h3>
                          {/* Progress bar */}
                          <div className="mt-1.5 space-y-1">
                            <div className="flex justify-between text-[8px] font-bold text-zinc-450">
                              <span>Clear Rate</span>
                              <span>{progressPct}%</span>
                            </div>
                            <div className="h-1 bg-zinc-950 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{ width: `${progressPct}%` }} />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 select-none">
                          <Link 
                            href={`/games/${game.id}`} 
                            className="text-[9px] bg-zinc-950 border border-zinc-850 hover:border-zinc-750 text-zinc-450 hover:text-white px-2.5 py-1 rounded-lg font-bold transition-all"
                          >
                            Unlocks ({unlockedCount}/{totalCount})
                          </Link>
                          <button
                            onClick={() => toggleActiveHunting(game.id)}
                            className={`text-[9px] px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                              isHunting
                                ? 'bg-orange-500/10 border-orange-500 text-orange-400 font-extrabold'
                                : 'bg-zinc-950 border-zinc-850 text-zinc-450 hover:text-white'
                            }`}
                          >
                            {isHunting ? 'Hunting 🔥' : 'Hunt'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {activeTab === 'unplayed' && unplayedBacklog.length === 0 && (
                <div className="col-span-full py-12 text-center border border-dashed border-zinc-800 rounded-3xl text-xs text-zinc-500 italic select-none">
                  No completely unplayed games left in your backlog!
                </div>
              )}
              {activeTab === 'in_progress' && inProgressBacklog.length === 0 && (
                <div className="col-span-full py-12 text-center border border-dashed border-zinc-800 rounded-3xl text-xs text-zinc-500 italic select-none">
                  No in-progress games left in your backlog!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
