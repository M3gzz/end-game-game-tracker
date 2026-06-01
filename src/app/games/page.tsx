/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { PRELOADED_GAMES } from '@/data/preloadedGames';
import { Game } from '@/types';
import { Search, Plus, ArrowUpDown } from 'lucide-react';
import GameCard from '@/components/library/GameCard';
import AddGameModal from '@/components/library/AddGameModal';

export default function GameLibrary() {
  const { progress } = useTrackerStore();
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  
  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'hunting' | 'backlog' | 'completed' | 'in_progress' | 'not_started'>('all');
  const [sortBy, setSortBy] = React.useState<'title' | 'difficulty' | 'completion' | 'hours'>('title');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 space-y-8 animate-pulse pt-8">
        <div className="h-10 w-48 bg-zinc-900 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-zinc-900 rounded-3xl" />
          <div className="h-64 bg-zinc-900 rounded-3xl" />
          <div className="h-64 bg-zinc-900 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Load owned games
  const ownedGames = PRELOADED_GAMES.filter(game => progress.ownedGames.includes(game.id));

  // Compute metrics and filter/sort games
  const processedGames = ownedGames
    .filter((game) => {
      // 1. Text Search Filter
      const matchesSearch = 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.developer.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      const baseAchievements = game.achievements.filter(ach => !ach.dlcId);
      const baseUnlocked = baseAchievements.filter(ach => !!progress.unlockedAchievements[ach.id]).length;

      // 2. Tab Category Filter
      if (activeFilter === 'hunting') return progress.activeHunting.includes(game.id);
      if (activeFilter === 'backlog') return progress.backlogGames.includes(game.id);
      if (activeFilter === 'completed') return baseAchievements.length > 0 && baseUnlocked === baseAchievements.length;
      if (activeFilter === 'not_started') return baseUnlocked === 0;
      if (activeFilter === 'in_progress') return baseUnlocked > 0 && baseUnlocked < baseAchievements.length;
      
      return true; // 'all'
    })
    .sort((a, b) => {
      // 3. Sorting logic
      if (sortBy === 'title') {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        if (sortOrder === 'asc') return titleA.localeCompare(titleB);
        return titleB.localeCompare(titleA);
      }
      
      if (sortBy === 'difficulty') {
        if (sortOrder === 'asc') return a.estimatedDifficulty - b.estimatedDifficulty;
        return b.estimatedDifficulty - a.estimatedDifficulty;
      }
      
      if (sortBy === 'hours') {
        if (sortOrder === 'asc') return a.estimatedHours - b.estimatedHours;
        return b.estimatedHours - a.estimatedHours;
      }

      if (sortBy === 'completion') {
        const getPct = (game: Game) => {
          const base = game.achievements.filter(ach => !ach.dlcId);
          const unlocked = base.filter(ach => !!progress.unlockedAchievements[ach.id]).length;
          return base.length > 0 ? unlocked / base.length : 0;
        };
        const pctA = getPct(a);
        const pctB = getPct(b);
        if (sortOrder === 'asc') return pctA - pctB;
        return pctB - pctA;
      }

      return 0;
    });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none relative z-10 pt-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            My Game Library
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Manage your gaming achievements progress and trophy lists ({ownedGames.length} Games Registered).
          </p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black tracking-wider uppercase rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] cursor-pointer transition-all duration-300 select-none self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Game to Library
        </button>
      </header>

      {/* Filter and Search Panel */}
      <div className="glass-panel border-zinc-800/80 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search bar widget */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search library by title or developer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800/80 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Sort Menu controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto select-none justify-end">
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-2.5 rounded-2xl text-xs text-zinc-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
              <span>Sort:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'title' | 'difficulty' | 'completion' | 'hours')}
                className="bg-transparent text-zinc-200 font-bold border-none focus:outline-none cursor-pointer"
              >
                <option value="title">Alphabetical</option>
                <option value="completion">Completion %</option>
                <option value="difficulty">Difficulty Rating</option>
                <option value="hours">Hours to 100%</option>
              </select>
            </div>
            
            <button 
              onClick={toggleSortOrder}
              className="p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white rounded-2xl cursor-pointer hover:scale-105 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1"
              title="Toggle sorting direction"
            >
              {sortOrder === 'asc' ? 'ASC ▲' : 'DESC ▼'}
            </button>
          </div>
        </div>

        {/* Tab Selection Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-900/60 select-none">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
              activeFilter === 'all' 
                ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-extrabold shadow-inner' 
                : 'bg-transparent border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            All Games ({ownedGames.length})
          </button>
          <button 
            onClick={() => setActiveFilter('hunting')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
              activeFilter === 'hunting' 
                ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-extrabold shadow-inner' 
                : 'bg-transparent border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            Currently Hunting ({progress.activeHunting.length})
          </button>
          <button 
            onClick={() => setActiveFilter('backlog')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
              activeFilter === 'backlog' 
                ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-extrabold shadow-inner' 
                : 'bg-transparent border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            Backlog ({progress.backlogGames.length})
          </button>
          <button 
            onClick={() => setActiveFilter('in_progress')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
              activeFilter === 'in_progress' 
                ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-extrabold shadow-inner' 
                : 'bg-transparent border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            In Progress
          </button>
          <button 
            onClick={() => setActiveFilter('completed')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
              activeFilter === 'completed' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-extrabold shadow-inner' 
                : 'bg-transparent border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            100% Completed
          </button>
        </div>
      </div>

      {/* Grid Display */}
      {processedGames.length === 0 ? (
        <div className="glass-panel border-zinc-800/80 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-5 select-none">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800/60 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner">
            🔍
          </div>
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-base text-zinc-100">No games matched your filters</h3>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
              {ownedGames.length === 0 
                ? 'Your library is empty. Click "+ Add Game" above to add games from the preloaded library catalog!'
                : 'Try adjusting your search queries or category filters to find registered games.'}
            </p>
          </div>
          {ownedGames.length === 0 && (
            <button 
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/10"
            >
              Browse Games
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}

      {/* Add Game Modal overlay */}
      <AddGameModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
