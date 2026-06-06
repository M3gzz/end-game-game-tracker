'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { PRELOADED_GAMES } from '@/data/preloadedGames';
import { X, Search, Plus, Check, Gamepad2, ArrowRight, RefreshCw } from 'lucide-react';

const getRandomDifficulty = () => Math.floor(Math.random() * 5) + 4; // 4-8 difficulty
const getRandomHours = () => Math.floor(Math.random() * 40) + 20;   // 20-60 hours
const generateCustomId = () => 'custom-' + Math.random().toString(36).substring(2, 9);

interface SteamSearchResultItem {
  id: number;
  name: string;
  tiny_image?: string;
}

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddGameModal({ isOpen, onClose }: AddGameModalProps) {
  const { progress, addGame, addCustomGame } = useTrackerStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'preloaded' | 'steam' | 'custom'>('preloaded');
  
  // Custom Game Form State
  const [customTitle, setCustomTitle] = React.useState('');
  const [customDev, setCustomDev] = React.useState('');
  const [customDiff, setCustomDiff] = React.useState(5);
  const [customHours, setCustomHours] = React.useState(30);

  // Steam Search State
  const [steamQuery, setSteamQuery] = React.useState('');
  const [steamResults, setSteamResults] = React.useState<SteamSearchResultItem[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // Non-blocking Toast notification state
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const filteredGames = React.useMemo(() => {
    return PRELOADED_GAMES.filter(game => 
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.developer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddGame = (gameId: string) => {
    addGame(gameId);
  };

  const handleSteamSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!steamQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/steam/search?q=${encodeURIComponent(steamQuery)}`);
      if (res.ok) {
        const data = await res.json();
        // Steam store search returns { items: [ { id: number, name: string, tiny_image: string }, ... ] }
        setSteamResults(data.items || []);
      } else {
        setSteamResults([]);
      }
    } catch (err) {
      console.error(err);
      setSteamResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddSteamGame = (item: SteamSearchResultItem) => {
    // If the synced game exists in the starter catalogue (like Cyberpunk 2077), map it directly
    const matchingPreloaded = PRELOADED_GAMES.find(
      g => g.steamAppId && String(g.steamAppId) === String(item.id)
    );

    const gameId = matchingPreloaded ? matchingPreloaded.id : `steam-${item.id}`;
    
    // Check if already added
    if (progress.ownedGames.includes(gameId)) {
      showToast(`"${item.name}" is already in your library!`, 'info');
      return;
    }

    if (matchingPreloaded) {
      addGame(matchingPreloaded.id);
      showToast(`Successfully synced "${item.name}" from Steam Store!`, 'success');
      setTimeout(() => {
        onClose();
      }, 1500);
      return;
    }

    // Generate some mock achievements for this game based on its title
    const mockAchievements = [
      {
        id: `${gameId}-ach-start`,
        gameId,
        title: 'New Beginnings',
        description: `Start playing ${item.name} for the first time.`,
        iconUrl: '🚀',
        rarityPercentage: 85.5,
        tier: 'bronze' as const
      },
      {
        id: `${gameId}-ach-half`,
        gameId,
        title: 'Midway Hunter',
        description: 'Complete 50% of the main storyline objectives.',
        iconUrl: '⭐',
        rarityPercentage: 45.2,
        tier: 'silver' as const
      },
      {
        id: `${gameId}-ach-master`,
        gameId,
        title: 'Apex Legend',
        description: 'Complete all side missions and collectibles.',
        iconUrl: '👑',
        rarityPercentage: 12.8,
        tier: 'gold' as const
      },
      {
        id: `${gameId}-ach-platinum`,
        gameId,
        title: 'The EndGame',
        description: `Achieve 100% completion in ${item.name}.`,
        iconUrl: '🏆',
        rarityPercentage: 3.4,
        tier: 'platinum' as const
      }
    ];

    const newGame = {
      id: gameId,
      title: item.name,
      coverUrl: item.tiny_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=300',
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200',
      developer: 'Steam Store',
      estimatedDifficulty: getRandomDifficulty(), // 4-8 difficulty
      estimatedHours: getRandomHours(),   // 20-60 hours
      platforms: ['Steam', 'PC'],
      description: `Synced steam library game: ${item.name}. Ready to forge your achievement legacy!`,
      releaseYear: 2025,
      dlcs: [],
      achievements: mockAchievements,
      steamAppId: item.id
    };

    addCustomGame(newGame);
    showToast(`Successfully synced "${item.name}" from Steam Store!`, 'success');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const gameId = generateCustomId();
    
    const mockAchievements = [
      {
        id: `${gameId}-ach-start`,
        gameId,
        title: 'Welcome to the Grid',
        description: `Unlock your very first trophy in ${customTitle}.`,
        iconUrl: '⚡',
        rarityPercentage: 90.0,
        tier: 'bronze' as const
      },
      {
        id: `${gameId}-ach-platinum`,
        gameId,
        title: 'Epic Hunter',
        description: `Perfect completionist achievement for ${customTitle}.`,
        iconUrl: '🏆',
        rarityPercentage: 5.0,
        tier: 'platinum' as const
      }
    ];

    const newGame = {
      id: gameId,
      title: customTitle,
      coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=300',
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200',
      developer: customDev || 'Unknown Developer',
      estimatedDifficulty: customDiff,
      estimatedHours: customHours,
      platforms: ['Custom'],
      description: 'Manually added custom title. Build your own completion journey!',
      releaseYear: 2026,
      dlcs: [],
      achievements: mockAchievements
    };

    addCustomGame(newGame);
    showToast(`Added custom game "${customTitle}" to library!`, 'success');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-3xl h-[85vh] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Floating Toast Notification */}
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-4 py-2.5 bg-zinc-950/90 border border-purple-500/30 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none select-none backdrop-blur-sm">
            <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : toast.type === 'error' ? 'bg-rose-500 shadow-[0_0_8px_#ef4444]' : 'bg-purple-500 shadow-[0_0_8px_#a855f7]'}`} />
            <span className="text-xs font-bold text-zinc-100">{toast.message}</span>
          </div>
        )}
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-purple-500" />
              Add Game to Hunter Library
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Select a game to start tracking achievements, difficulty, and playtime.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-full hover:scale-105 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-6 pt-4 border-b border-zinc-900/60 bg-zinc-950">
          <button 
            onClick={() => setActiveTab('preloaded')}
            className={`pb-3 text-sm font-semibold tracking-wide border-b-2 px-4 transition-all ${
              activeTab === 'preloaded' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Starter Catalog ({PRELOADED_GAMES.length})
          </button>
          <button 
            onClick={() => setActiveTab('steam')}
            className={`pb-3 text-sm font-semibold tracking-wide border-b-2 px-4 transition-all ${
              activeTab === 'steam' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            🌐 Sync from Steam
          </button>
          <button 
            onClick={() => setActiveTab('custom')}
            className={`pb-3 text-sm font-semibold tracking-wide border-b-2 px-4 transition-all ${
              activeTab === 'custom' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            + Register Custom Game
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0B0C0E]">
          {activeTab === 'preloaded' ? (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search catalog by title, developer..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>

              {/* Grid List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredGames.map((game) => {
                  const isAdded = progress.ownedGames.includes(game.id);
                  return (
                    <div 
                      key={game.id}
                      className="flex gap-4 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all group"
                    >
                      {/* Cover art mockup */}
                      <div className="w-16 h-20 rounded-xl bg-zinc-800 overflow-hidden shrink-0 shadow-lg relative border border-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={game.coverUrl} 
                          alt={game.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>

                      {/* Info & CTA */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="pr-2">
                          <h4 className="font-bold text-sm text-zinc-100 truncate group-hover:text-white transition-colors">
                            {game.title}
                          </h4>
                          <p className="text-xs text-zinc-500 truncate mt-0.5">{game.developer}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 px-1.5 py-0.5 rounded font-semibold">
                              Diff: {game.estimatedDifficulty}/10
                            </span>
                            <span className="text-[10px] bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 px-1.5 py-0.5 rounded font-semibold">
                              ~{game.estimatedHours}h
                            </span>
                          </div>
                        </div>

                        {/* Add Button */}
                        <div className="flex justify-end mt-2">
                          {isAdded ? (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                              <Check className="w-3.5 h-3.5" />
                              Added
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddGame(game.id)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-600 hover:text-white hover:border-purple-500 px-3 py-1.5 rounded-xl cursor-pointer transition-all hover:scale-[1.03]"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Game
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredGames.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-sm text-zinc-500">No games found matching your search query.</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'steam' ? (
            /* Steam Search Tab */
            <div className="space-y-6">
              <form onSubmit={handleSteamSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
                  <input 
                    type="text" 
                    required
                    placeholder="Search standard games in Steam Store database..." 
                    value={steamQuery}
                    onChange={(e) => setSteamQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="px-6 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/10"
                >
                  {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Search'}
                </button>
              </form>

              {/* Steam Results */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {steamResults.map((item) => {
                  const isAdded = progress.ownedGames.includes(`steam-${item.id}`);
                  return (
                    <div 
                      key={item.id}
                      className="flex gap-4 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all group"
                    >
                      <div className="w-24 h-12 rounded-lg bg-zinc-800 overflow-hidden shrink-0 shadow relative border border-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={item.tiny_image} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-zinc-100 truncate group-hover:text-white transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Steam App ID: {item.id}</p>
                        </div>

                        <div className="flex justify-end mt-2">
                          {isAdded ? (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                              <Check className="w-3.5 h-3.5" />
                              Synced
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddSteamGame(item)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-600 hover:text-white hover:border-purple-500 px-3 py-1.5 rounded-xl cursor-pointer transition-all hover:scale-[1.03]"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Sync & Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {!isSearching && steamResults.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-sm text-zinc-500">Search for games like &quot;Cyberpunk&quot;, &quot;Witcher&quot;, or &quot;Hades&quot; to sync them from Steam.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Custom Game Form */
            <form onSubmit={handleCreateCustom} className="max-w-md mx-auto space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Game Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Cyberpunk 2077"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Developer</label>
                <input 
                  type="text" 
                  placeholder="e.g. CD Projekt Red"
                  value={customDev}
                  onChange={(e) => setCustomDev(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Estimated Difficulty (1-10)</label>
                  <input 
                    type="number" 
                    min={1}
                    max={10}
                    value={customDiff}
                    onChange={(e) => setCustomDiff(parseInt(e.target.value) || 5)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Estimated Time (Hours)</label>
                  <input 
                    type="number" 
                    min={1}
                    value={customHours}
                    onChange={(e) => setCustomHours(parseInt(e.target.value) || 30)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                Register Custom Game
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
