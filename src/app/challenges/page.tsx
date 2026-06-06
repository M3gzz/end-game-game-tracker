'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { PRELOADED_GAMES } from '@/data/preloadedGames';
import { MOCK_USERS } from '@/data/mockUsers';
import { Swords, Trophy, Timer, Check, X, Plus, Gamepad2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ChallengesPage() {
  const { 
    challenges, profile, progress, respondToChallenge, sendChallenge, sendMessage 
  } = useTrackerStore();

  const [mounted, setMounted] = React.useState(false);
  const [showDuelModal, setShowDuelModal] = React.useState(false);

  // Form states for new challenge
  const [duelFriend, setDuelFriend] = React.useState('peter_parker');
  const [duelGameId, setDuelGameId] = React.useState(PRELOADED_GAMES[0].id);
  const [duelType, setDuelType] = React.useState<'platinum' | 'trophy-count'>('platinum');
  const [duelHours, setDuelHours] = React.useState(48);

  // Toast state
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

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

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    sendChallenge(duelFriend, duelGameId, duelType, duelHours);
    setShowDuelModal(false);
    
    const game = PRELOADED_GAMES.find(g => g.id === duelGameId);
    sendMessage(
      duelFriend,
      `⚔️ DUEL INVITATION: I challenged you to a speedrun duel in ${game ? game.title : 'the game'}! Check your Challenges tab to Accept/Decline.`
    );
    
    showToast(`Challenge sent to @${duelFriend}! They accepted it instantly in your chat thread.`, 'success');
  };

  // Helper to compute achievement progress
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getProgressStats = (challenge: any) => {
    const game = PRELOADED_GAMES.find(g => g.id === challenge.gameId);
    if (!game) return { userCount: 0, opponentCount: 0, total: 10 };

    const total = game.achievements.length || 10;
    
    // User progress
    const userCount = game.achievements.filter(ach => progress.unlockedAchievements[ach.id]).length;
    
    // Opponent progress (dynamic mock based on opponent name seed)
    let seed = 0.3;
    if (challenge.challenger === 'geralt_of_rivia' || challenge.target === 'geralt_of_rivia') seed = 0.7;
    if (challenge.challenger === 'peter_parker' || challenge.target === 'peter_parker') seed = 0.45;
    if (challenge.challenger === 'arthur_morgan' || challenge.target === 'arthur_morgan') seed = 0.35;
    if (challenge.challenger === 'ellie_williams' || challenge.target === 'ellie_williams') seed = 0.55;

    const opponentCount = Math.min(total - 1, Math.round(total * seed));

    return { userCount, opponentCount, total };
  };

  // Filter challenges into lists
  const pendingChallenges = challenges.filter(c => c.status === 'pending');
  const activeChallenges = challenges.filter(c => c.status === 'accepted');
  const pastChallenges = challenges.filter(c => c.status === 'completed' || c.status === 'declined' || c.status === 'failed');

  return (
    <div className="space-y-8 select-none">
      {/* Header section */}
      <div className="relative rounded-3xl overflow-hidden mb-8 border border-zinc-800 bg-gradient-to-r from-zinc-900/60 to-indigo-950/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_50px_rgba(99,102,241,0.05)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(99,102,241,0.1),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Swords className="w-3.5 h-3.5" /> Duel Arena
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            EndGame Speedrun Duels
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm max-w-xl">
            Challenge followed friends to dynamic real-time speedruns or trophy hunting races. Verify standings, stream achievements, and claim badges.
          </p>
        </div>

        <button
          onClick={() => setShowDuelModal(true)}
          className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all hover:scale-103 cursor-pointer relative z-10"
        >
          <Plus className="w-5 h-5" /> Issue New Duel
        </button>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Duels', value: activeChallenges.length, sub: 'In progress', color: 'text-indigo-400 bg-indigo-500/5 border-indigo-500/20' },
          { label: 'Pending Invites', value: pendingChallenges.length, sub: 'Waiting reply', color: 'text-purple-400 bg-purple-500/5 border-purple-500/20' },
          { label: 'Streak Rewards', value: `${progress.streakCount}d`, sub: 'Daily multipliers', color: 'text-orange-500 bg-orange-500/5 border-orange-500/20' },
          { label: 'Win Rate', value: '75%', sub: 'Based on 4 past duels', color: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20' }
        ].map((card, idx) => (
          <div key={idx} className={`p-4 border rounded-2xl backdrop-blur-sm flex flex-col justify-between h-24 ${card.color}`}>
            <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wide">{card.label}</p>
            <div>
              <p className="text-2xl font-black text-white">{card.value}</p>
              <p className="text-[9px] text-zinc-500 font-semibold">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* PENDING CHALLENGES SECTION */}
      {pendingChallenges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <Timer className="w-5 h-5 text-purple-400 animate-pulse" /> Pending Invitations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingChallenges.map((c) => {
              const isReceived = c.target === profile.username;
              const opponentUsername = isReceived ? c.challenger : c.target;
              const opponent = MOCK_USERS[opponentUsername] || { name: 'Arthur Morgan', avatarUrl: '' };

              return (
                <div key={c.id} className="bg-zinc-900/20 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden backdrop-blur-sm shadow-xl">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/5 relative shrink-0">
                        {opponent.avatarUrl.startsWith('linear-gradient') ? (
                          <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs" style={{ background: opponent.avatarUrl }}>
                            {opponent.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={opponent.avatarUrl} alt={opponent.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black text-zinc-300">
                          {isReceived ? `${opponent.name} challenged you!` : `You challenged ${opponent.name}`}
                        </p>
                        <p className="text-[9px] text-zinc-500 font-medium">Link Game: {c.gameTitle}</p>
                      </div>
                    </div>

                    <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded font-black uppercase">
                      PENDING
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-900/60 pt-3">
                    <span>Win condition: {c.type === 'platinum' ? '💍 First to Platinum' : `📊 Most trophies in ${c.timeLimitHours}h`}</span>
                    <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> {c.timeLimitHours} Hours</span>
                  </div>

                  {isReceived ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          respondToChallenge(c.id, true);
                          showToast("Duel accepted! Head over to your Active Duels Arena to track live progress.", "success");
                        }}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Check className="w-4 h-4" /> Accept Duel
                      </button>
                      <button
                        onClick={() => {
                          respondToChallenge(c.id, false);
                          showToast("Duel invitation declined.", "info");
                        }}
                        className="py-2 px-3.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-2 bg-zinc-900/40 text-zinc-500 border border-zinc-900 text-[10px] font-bold rounded-xl">
                      Waiting for opponent to accept...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTIVE DUELS arena */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-wider">
          <Swords className="w-5 h-5 text-indigo-400" /> Active Duels Arena
        </h2>

        {activeChallenges.length === 0 ? (
          <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8 text-center text-zinc-500 font-semibold italic">
            No active speedrun duels at the moment. Pick a friend from DMs or click &quot;Issue New Duel&quot; to launch a battle!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {activeChallenges.map((c) => {
              const isChallengerSelf = c.challenger === profile.username;
              const opponentUsername = isChallengerSelf ? c.target : c.challenger;
              const opponent = MOCK_USERS[opponentUsername] || { name: 'Arthur Morgan', avatarUrl: '' };

              const { userCount, opponentCount, total } = getProgressStats(c);

              const userRatio = Math.round((userCount / total) * 100);
              const opponentRatio = Math.round((opponentCount / total) * 100);

              return (
                <div key={c.id} className="bg-zinc-900/25 border border-zinc-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm hover:border-zinc-700/60 transition-all flex flex-col md:flex-row justify-between gap-6">
                  {/* Left challenge meta */}
                  <div className="md:w-1/3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-purple-400 shrink-0" />
                        <span className="text-xs font-black text-zinc-300 leading-snug">{c.gameTitle}</span>
                      </div>
                      <h3 className="text-lg font-black text-white tracking-tight uppercase">
                        {c.type === 'platinum' ? '💍 Platinum Speedrun' : '📊 Trophy Hunt Duel'}
                      </h3>
                      <p className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5 text-orange-500" /> Time limit: {c.timeLimitHours}h • 14 Hours Remaining
                      </p>
                    </div>

                    <div className="pt-4 md:pt-0">
                      <Link href={`/challenges/${c.id}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-102 cursor-pointer">
                        Enter Live Arena <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Right comparison progress bars */}
                  <div className="flex-1 flex flex-col justify-center space-y-4">
                    {/* User bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-extrabold text-zinc-300">
                        <span className="flex items-center gap-1">👤 You ({profile.name})</span>
                        <span className="text-purple-400">{userCount} / {total} unlocked ({userRatio}%)</span>
                      </div>
                      <div className="h-3 bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden relative">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all duration-500"
                          style={{ width: `${userRatio}%` }}
                        />
                      </div>
                    </div>

                    {/* Divider visual */}
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-zinc-900" />
                      </div>
                      <span className="relative px-3 bg-[#0B0C0E]/20 text-[9px] font-black text-zinc-500 tracking-wider uppercase border border-zinc-900 rounded bg-zinc-950">VS</span>
                    </div>

                    {/* Opponent bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-extrabold text-zinc-300">
                        <span className="flex items-center gap-1">👤 @{opponent.username} ({opponent.name})</span>
                        <span className="text-indigo-400">{opponentCount} / {total} unlocked ({opponentRatio}%)</span>
                      </div>
                      <div className="h-3 bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden relative">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-500"
                          style={{ width: `${opponentRatio}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PAST LEGENDS SECTION */}
      {pastChallenges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
            <Trophy className="w-5 h-5 text-zinc-500" /> Completed Legends
          </h2>

          <div className="bg-zinc-900/20 border border-zinc-800 rounded-3xl p-5 shadow-xl backdrop-blur-sm overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-500 font-extrabold uppercase pb-3 tracking-wider">
                  <th className="py-3 px-4">Duelist Partner</th>
                  <th className="py-3 px-4">Battleground Game</th>
                  <th className="py-3 px-4">Goal Details</th>
                  <th className="py-3 px-4">Result Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-400">
                {pastChallenges.map((c) => {
                  const isChallengerSelf = c.challenger === profile.username;
                  const opponentUsername = isChallengerSelf ? c.target : c.challenger;
                  const opponent = MOCK_USERS[opponentUsername] || { name: 'Arthur Morgan' };

                  let result = 'Declined';
                  let resultClass = 'text-zinc-500 bg-zinc-900/30';
                  if (c.status === 'completed') {
                    const isWinnerMe = c.winner === profile.username;
                    result = isWinnerMe ? '👑 VICTORIOUS' : '💔 DEFEATED';
                    resultClass = isWinnerMe ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20';
                  }

                  return (
                    <tr key={c.id} className="hover:bg-zinc-900/10 transition-colors">
                      <td className="py-4 px-4 font-bold text-zinc-200">@{opponentUsername} ({opponent.name})</td>
                      <td className="py-4 px-4 font-semibold">{c.gameTitle}</td>
                      <td className="py-4 px-4">{c.type === 'platinum' ? 'First to Platinum' : `Most trophies in ${c.timeLimitHours}h`}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${resultClass}`}>
                          {result}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Speedrun Challenge invitation overlay modal */}
      {showDuelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowDuelModal(false)} />
          
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl z-10 flex flex-col gap-5 text-zinc-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Swords className="w-5 h-5 text-purple-500" /> Challenge speedrun duel
              </h2>
              <button onClick={() => setShowDuelModal(false)} className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="block text-[10px] text-zinc-500 font-extrabold uppercase mb-2">Challenge Target Friend</label>
                <select
                  value={duelFriend}
                  onChange={(e) => setDuelFriend(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold rounded-xl p-3 text-zinc-300 focus:outline-none"
                >
                  {Object.keys(MOCK_USERS).map(username => (
                    <option key={username} value={username}>👤 @{username} ({MOCK_USERS[username].name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 font-extrabold uppercase mb-2">Link Game Battleground</label>
                <select
                  value={duelGameId}
                  onChange={(e) => setDuelGameId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold rounded-xl p-3 text-zinc-300 focus:outline-none"
                >
                  {PRELOADED_GAMES.map(game => (
                    <option key={game.id} value={game.id}>🏆 {game.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 font-extrabold uppercase mb-2">Duel Win Condition</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDuelType('platinum')}
                      className={`px-3 py-2.5 rounded-xl text-xs font-extrabold border transition-all text-center uppercase ${
                        duelType === 'platinum' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                      }`}
                    >
                      💍 Platinum Speedrun
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuelType('trophy-count')}
                      className={`px-3 py-2.5 rounded-xl text-xs font-extrabold border transition-all text-center uppercase ${
                        duelType === 'trophy-count' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                      }`}
                    >
                      📊 Trophy Count
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-500 font-extrabold uppercase mb-2">Active Duel Time limit</label>
                  <div className="flex gap-2">
                    {[24, 48, 72, 168].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setDuelHours(h)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold border transition-all text-center ${
                          duelHours === h ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                        }`}
                      >
                        {h === 168 ? '7 Days' : `${h}h`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDuelModal(false)}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 cursor-pointer"
                >
                  <Swords className="w-4 h-4" /> Issue Speedrun Duel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 right-8 z-[100] flex items-center gap-3 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`w-2.5 h-2.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : toast.type === 'error' ? 'bg-rose-500 shadow-[0_0_8px_#ef4444]' : 'bg-purple-500 shadow-[0_0_8px_#a855f7]'}`} />
          <span className="text-xs font-bold text-zinc-100">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
