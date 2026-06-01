'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { PRELOADED_GAMES } from '@/data/preloadedGames';
import { MOCK_USERS } from '@/data/mockUsers';
import { Trophy, Award, Search, Sparkles } from 'lucide-react';

export default function LeaderboardPage() {
  const { profile, progress } = useTrackerStore();
  const [mounted, setMounted] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 p-6 md:p-10 bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Compile full leaderboards dynamically
  const leaderboardData = [
    {
      username: profile.username,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      level: Math.floor(Object.keys(progress.unlockedAchievements).length / 4) + 12,
      trophies: Object.keys(progress.unlockedAchievements).length + 35,
      completedCount: progress.ownedGames.filter(gid => {
        const game = PRELOADED_GAMES.find(g => g.id === gid);
        if (!game) return false;
        const total = game.achievements.length;
        const unlocked = game.achievements.filter(ach => progress.unlockedAchievements[ach.id]).length;
        return total > 0 && unlocked === total;
      }).length + 1,
      isSelf: true
    },
    ...Object.keys(MOCK_USERS).map(un => {
      const user = MOCK_USERS[un];
      return {
        username: user.username,
        name: user.name,
        avatarUrl: user.avatarUrl,
        level: user.stats.level,
        trophies: user.stats.unlockedTrophiesCount,
        completedCount: user.stats.completedGamesCount,
        isSelf: false
      };
    })
  ].sort((a, b) => b.trophies - a.trophies); // Sort by total trophies

  // Filtered standings
  const filteredStandings = leaderboardData.filter(hunter => 
    hunter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hunter.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split out top 3 for the beautiful podium display
  const topThree = leaderboardData.slice(0, 3);
  const remainingStandings = filteredStandings;

  return (
    <div className="space-y-8 select-none">
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-8 h-8 text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" /> Leaderboard Standing
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Global standing of hunters. Unlock trophies and complete libraries to conquer the ranks.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hunters..."
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* TOP 3 PODIUM DISPLAY */}
      {searchQuery === '' && topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4 pb-2">
          {/* 2nd Place */}
          <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative order-2 md:order-1 h-[220px] shadow-xl hover:border-zinc-700/60 transition-all">
            <span className="absolute top-4 left-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Rank #2</span>
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-zinc-500 relative shadow-lg mb-3 shrink-0">
              {topThree[1].avatarUrl.startsWith('linear-gradient') ? (
                <div className="w-full h-full flex items-center justify-center font-bold text-white text-lg" style={{ background: topThree[1].avatarUrl }}>
                  {topThree[1].name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={topThree[1].avatarUrl} alt={topThree[1].name} className="w-full h-full object-cover" />
              )}
            </div>
            <h3 className="font-extrabold text-sm text-zinc-100">{topThree[1].name}</h3>
            <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">@{topThree[1].username}</p>
            <div className="mt-4 flex gap-3 text-center border-t border-zinc-900/60 w-full pt-3">
              <div className="flex-1">
                <p className="text-[9px] text-zinc-500 font-bold uppercase">Trophies</p>
                <p className="text-xs font-black text-purple-400 mt-0.5">{topThree[1].trophies}</p>
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-zinc-500 font-bold uppercase">Level</p>
                <p className="text-xs font-black text-zinc-300 mt-0.5">Lvl {topThree[1].level}</p>
              </div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="bg-purple-950/15 border-2 border-purple-500/35 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative order-1 md:order-2 h-[250px] shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:border-purple-500/50 transition-all">
            <span className="absolute top-4 left-4 text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> Champion
            </span>
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-yellow-500 shadow-2xl shadow-yellow-500/10 mb-3 shrink-0 relative animate-pulse">
              {topThree[0].avatarUrl.startsWith('linear-gradient') ? (
                <div className="w-full h-full flex items-center justify-center font-bold text-white text-xl" style={{ background: topThree[0].avatarUrl }}>
                  {topThree[0].name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={topThree[0].avatarUrl} alt={topThree[0].name} className="w-full h-full object-cover" />
              )}
            </div>
            <h3 className="font-black text-base text-white">{topThree[0].name}</h3>
            <p className="text-xs text-zinc-400 font-bold mt-0.5">@{topThree[0].username}</p>
            <div className="mt-4 flex gap-3 text-center border-t border-zinc-900 w-full pt-3">
              <div className="flex-1">
                <p className="text-[9px] text-zinc-500 font-bold uppercase">Trophies</p>
                <p className="text-sm font-black text-yellow-500 mt-0.5">{topThree[0].trophies}</p>
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-zinc-500 font-bold uppercase">Level</p>
                <p className="text-sm font-black text-zinc-200 mt-0.5">Lvl {topThree[0].level}</p>
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative order-3 h-[200px] shadow-xl hover:border-zinc-700/60 transition-all">
            <span className="absolute top-4 left-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Rank #3</span>
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-700 relative shadow-lg mb-3 shrink-0">
              {topThree[2].avatarUrl.startsWith('linear-gradient') ? (
                <div className="w-full h-full flex items-center justify-center font-bold text-white text-sm" style={{ background: topThree[2].avatarUrl }}>
                  {topThree[2].name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={topThree[2].avatarUrl} alt={topThree[2].name} className="w-full h-full object-cover" />
              )}
            </div>
            <h3 className="font-extrabold text-sm text-zinc-150">{topThree[2].name}</h3>
            <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">@{topThree[2].username}</p>
            <div className="mt-4 flex gap-3 text-center border-t border-zinc-900/60 w-full pt-3">
              <div className="flex-1">
                <p className="text-[9px] text-zinc-500 font-bold uppercase">Trophies</p>
                <p className="text-xs font-black text-purple-400 mt-0.5">{topThree[2].trophies}</p>
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-zinc-500 font-bold uppercase">Level</p>
                <p className="text-xs font-black text-zinc-350 mt-0.5">Lvl {topThree[2].level}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLE SCORES */}
      <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
        <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" /> Hunters Scoreboard
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-500 uppercase font-black tracking-wider pb-3">
                <th className="py-3.5 px-4 w-20">Rank</th>
                <th className="py-3.5 px-4">Hunter</th>
                <th className="py-3.5 px-4 text-center">Level</th>
                <th className="py-3.5 px-4 text-center">Completed Games</th>
                <th className="py-3.5 px-4 text-right">Total Trophies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {remainingStandings.map((hunter) => {
                const originalRank = leaderboardData.findIndex(h => h.username === hunter.username) + 1;
                
                return (
                  <tr 
                    key={hunter.username}
                    className={`hover:bg-zinc-900/30 transition-all ${
                      hunter.isSelf 
                        ? 'bg-purple-600/10 border-l-4 border-l-purple-500 shadow-[inset_0_0_20px_rgba(168,85,247,0.05)]' 
                        : ''
                    }`}
                  >
                    <td className="py-4 px-4 font-black">
                      {originalRank === 1 ? '🥇' : originalRank === 2 ? '🥈' : originalRank === 3 ? '🥉' : `#${originalRank}`}
                    </td>
                    <td className="py-4 px-4 font-bold">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/5 relative shrink-0">
                          {hunter.avatarUrl && hunter.avatarUrl.startsWith('linear-gradient') ? (
                            <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs" style={{ background: hunter.avatarUrl }}>
                              {hunter.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={hunter.avatarUrl} alt={hunter.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className={`text-zinc-150 font-bold ${hunter.isSelf ? 'text-purple-400' : ''}`}>
                            {hunter.name}
                            {hunter.isSelf && <span className="text-[9px] bg-purple-600/20 text-purple-400 font-extrabold px-1.5 py-0.5 rounded ml-2 uppercase">You</span>}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-normal">@{hunter.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-extrabold text-zinc-300">Lvl {hunter.level}</td>
                    <td className="py-4 px-4 text-center font-black text-purple-400">{hunter.completedCount} ⭐</td>
                    <td className="py-4 px-4 text-right font-black text-yellow-500">{hunter.trophies} 🏆</td>
                  </tr>
                );
              })}

              {remainingStandings.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500 font-semibold italic">
                    No hunter match found!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
