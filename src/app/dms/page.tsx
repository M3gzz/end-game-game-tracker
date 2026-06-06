'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { PRELOADED_GAMES } from '@/data/preloadedGames';
import { MOCK_USERS } from '@/data/mockUsers';
import { 
  SendHorizontal, MessageSquare, Swords, Flame, X, Search
} from 'lucide-react';

export default function DMsPage() {
  const { 
    profile, messages, sendMessage, sendChallenge 
  } = useTrackerStore();

  const [mounted, setMounted] = React.useState(false);
  const [selectedDMUser, setSelectedDMUser] = React.useState<string>('arthur_morgan');
  const [chatInput, setChatInput] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');


  // Duel Challenge Form State
  const [duelGameId, setDuelGameId] = React.useState(PRELOADED_GAMES[0].id);
  const [duelType, setDuelType] = React.useState<'platinum' | 'trophy-count'>('platinum');
  const [duelHours, setDuelHours] = React.useState(48);
  const [showDuelModal, setShowDuelModal] = React.useState(false);

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

  // Helper to retrieve user details from Mock users or Local accounts
  const getUserDetails = React.useCallback((username: string) => {
    const mock = MOCK_USERS[username];
    if (mock) {
      return {
        username,
        name: mock.name,
        avatarUrl: mock.avatarUrl,
        level: mock.stats.level,
        isOnline: true,
        stats: {
          level: mock.stats.level,
          unlockedTrophiesCount: mock.stats.unlockedTrophiesCount,
          completedGamesCount: mock.stats.completedGamesCount
        }
      };
    }
    const local = useTrackerStore.getState().accounts[username];
    if (local) {
      const unlockedCount = Object.keys(local.progress.unlockedAchievements || {}).length;
      return {
        username,
        name: local.profile.name,
        avatarUrl: local.profile.avatarUrl,
        level: Math.floor(unlockedCount / 5) + 1,
        isOnline: false,
        stats: {
          level: Math.floor(unlockedCount / 5) + 1,
          unlockedTrophiesCount: unlockedCount,
          completedGamesCount: local.progress.ownedGames.filter(gId => {
            const custom = local.progress.customAchievements?.[gId] || [];
            const game = PRELOADED_GAMES.find(g => g.id === gId);
            const achievements = custom.length > 0 ? custom : (game?.achievements || []);
            if (achievements.length === 0) return false;
            return achievements.every(ach => !!local.progress.unlockedAchievements[ach.id]);
          }).length
        }
      };
    }
    return {
      username,
      name: username,
      avatarUrl: 'linear-gradient(135deg, #71717a 0%, #3f3f46 100%)',
      level: 1,
      isOnline: false,
      stats: {
        level: 1,
        unlockedTrophiesCount: 0,
        completedGamesCount: 0
      }
    };
  }, []);

  // Compute all usernames in active DM channel list
  const channelUsernames = React.useMemo(() => {
    const set = new Set<string>();
    // default mock users
    Object.keys(MOCK_USERS).forEach(un => set.add(un));
    // users we have messages with
    Object.keys(messages).forEach(un => {
      if (un !== profile.username) {
        set.add(un);
      }
    });
    // any selected DM user
    if (selectedDMUser && selectedDMUser !== profile.username) {
      set.add(selectedDMUser);
    }
    return Array.from(set);
  }, [messages, profile.username, selectedDMUser]);

  // Compute search results across mock users and local accounts
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    
    const allUsernames = new Set<string>();
    Object.keys(MOCK_USERS).forEach(un => allUsernames.add(un));
    
    const localAccounts = useTrackerStore.getState().accounts || {};
    Object.keys(localAccounts).forEach(un => allUsernames.add(un));
    
    // Remove active user
    allUsernames.delete(profile.username);
    
    const results: Array<{ username: string; name: string; avatarUrl: string; alreadyInChannels: boolean }> = [];
    
    allUsernames.forEach(un => {
      const details = getUserDetails(un);
      if (details.name.toLowerCase().includes(query) || un.toLowerCase().includes(query)) {
        results.push({
          username: un,
          name: details.name,
          avatarUrl: details.avatarUrl,
          alreadyInChannels: channelUsernames.includes(un)
        });
      }
    });
    
    return results;
  }, [searchQuery, channelUsernames, profile.username, getUserDetails]);

  const handleSelectUserFromSearch = (username: string) => {
    setSelectedDMUser(username);
    setSearchQuery('');
    showToast(`Conversation with @${username} started!`, 'success');
  };

  if (!mounted) {
    return (
      <div className="flex-1 p-6 md:p-10 bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSendDM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sendMessage(selectedDMUser, chatInput.trim());
    setChatInput('');
  };

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    sendChallenge(selectedDMUser, duelGameId, duelType, duelHours);
    setShowDuelModal(false);
    
    // Send a message notification in chat
    const game = PRELOADED_GAMES.find(g => g.id === duelGameId);
    sendMessage(
      selectedDMUser, 
      `⚔️ DUEL INVITATION: I challenged you to a speedrun duel in ${game ? game.title : 'the game'}! Check your Challenges tab to Accept/Decline.`
    );
    
    showToast(`Challenge sent to @${selectedDMUser}! They accepted it instantly in your chat thread.`, 'success');
  };

  const activeUser = getUserDetails(selectedDMUser);

  const initials = activeUser.name
    ? activeUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AM';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" /> Direct Messages
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Coordinate speedrun challenges, talk strategy, and check your duel standings.
          </p>
        </div>
      </div>

      {/* Main DMs Grid Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl min-h-[65vh]">
        {/* Left Side Pane (Users thread select list) */}
        <div className="lg:col-span-4 border-r border-zinc-900 p-4 flex flex-col gap-4 bg-zinc-950/60">
          <div className="space-y-2.5">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest px-2">Hunter Channels</h3>
            
            {/* Search Bar Input */}
            <div className="relative px-1">
              <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or add friend by name..."
                className="w-full bg-zinc-900/80 border border-zinc-850 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-2 text-zinc-400 hover:text-zinc-250 cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-1 overflow-y-auto flex-1 custom-scrollbar pr-0.5">
            {searchQuery.trim() ? (
              <div className="space-y-2">
                <div className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider px-2">Search Results</div>
                {searchResults.length === 0 ? (
                  <div className="text-xs text-zinc-500 italic px-2 py-4">No match found.</div>
                ) : (
                  searchResults.map(res => {
                    const isSelected = selectedDMUser === res.username;
                    const initialsLabel = res.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase();
                    return (
                      <button
                        key={res.username}
                        onClick={() => handleSelectUserFromSearch(res.username)}
                        className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer hover:scale-[1.01] ${
                          isSelected
                            ? 'bg-purple-600/10 border border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.05)]'
                            : 'border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/5 relative shrink-0">
                            {res.avatarUrl.startsWith('linear-gradient') ? (
                              <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs" style={{ background: res.avatarUrl }}>
                                {initialsLabel}
                              </div>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={res.avatarUrl} alt={res.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-zinc-100 truncate leading-snug">{res.name}</h4>
                            <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">@{res.username}</p>
                          </div>
                        </div>
                        <div className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-1 rounded-lg font-black uppercase tracking-wider">
                          {res.alreadyInChannels ? 'Open' : 'Add'}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            ) : (
              channelUsernames.map(username => {
                const user = getUserDetails(username);
                const isSelected = selectedDMUser === username;
                const userInitials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                
                return (
                  <button
                    key={username}
                    onClick={() => setSelectedDMUser(username)}
                    className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer hover:scale-[1.01] ${
                      isSelected 
                        ? 'bg-purple-600/10 border border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.05)]' 
                        : 'border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/5 relative shrink-0">
                        {user.avatarUrl.startsWith('linear-gradient') ? (
                          <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs" style={{ background: user.avatarUrl }}>
                            {userInitials}
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-zinc-100 truncate leading-snug">{user.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">
                          {user.isOnline ? 'Online' : 'Offline'} • Lvl {user.level}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 shrink-0">
                      <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                      <span className="text-[10px] font-bold text-zinc-300">5d</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Conversation thread console */}
        <div className="lg:col-span-8 flex flex-col justify-between min-h-[60vh] bg-[#0E0F12]">
          {/* Header */}
          <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/60 backdrop-blur-sm z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/5 relative shrink-0">
                {activeUser.avatarUrl.startsWith('linear-gradient') ? (
                  <div className="w-full h-full flex items-center justify-center font-bold text-white text-sm" style={{ background: activeUser.avatarUrl }}>
                    {initials}
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activeUser.avatarUrl} alt={activeUser.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-black text-zinc-100 leading-snug">{activeUser.name}</h4>
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Channel Duel Lobby</p>
              </div>
            </div>

            {/* Duel Button */}
            <button
              onClick={() => setShowDuelModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/25 cursor-pointer transition-all hover:scale-103 shrink-0 active:scale-97"
            >
              <Swords className="w-4 h-4 animate-bounce" /> Challenge Duel
            </button>
          </div>

          {/* Thread messages logs */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {(messages[selectedDMUser] || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 p-8">
                <MessageSquare className="w-10 h-10 text-zinc-700 animate-pulse" />
                <p className="text-zinc-500 text-xs font-semibold">No messages yet. Send a direct message to coordinate speedruns or trade guides!</p>
              </div>
            ) : (
              (messages[selectedDMUser] || []).map((msg) => {
                const isMe = msg.sender === profile.username;
                const hasChallenge = !!msg.challengeId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      hasChallenge
                        ? 'bg-purple-950/20 border border-purple-500/40 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.05)]'
                        : isMe 
                        ? 'bg-purple-600 text-white rounded-br-none shadow-md' 
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-250 rounded-bl-none'
                    }`}>
                      <p className="font-semibold whitespace-pre-wrap">{msg.text}</p>
                      
                      {hasChallenge && (
                        <div className="bg-zinc-950/80 border border-zinc-900 p-3 rounded-xl mt-2.5 space-y-2">
                          <div className="flex items-center gap-2 text-[10px] text-purple-400 font-black uppercase tracking-wider">
                            <Swords className="w-3.5 h-3.5 animate-pulse" /> Speedrun Duel
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-normal">
                            Rules: First hunter to Platinum, or earn the most trophies within the limits! Duel tracking is dynamic.
                          </p>
                          <div className="flex gap-2">
                            <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-black uppercase">
                              ⚔️ ACTIVE DUEL
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <span className="block text-[8px] text-zinc-500/80 text-right mt-1.5">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Form Send Input */}
          <form onSubmit={handleSendDM} className="p-4 border-t border-zinc-900 flex gap-2 bg-zinc-950/60 backdrop-blur-sm">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Send message to @${activeUser.username}...`}
              className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
            />
            <button type="submit" className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl cursor-pointer transition-all active:scale-95 shrink-0 flex items-center justify-center">
              <SendHorizontal className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

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
                <label className="block text-[10px] text-zinc-500 font-extrabold uppercase mb-2">Challenge Target</label>
                <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl overflow-hidden relative border border-white/5">
                    {activeUser.avatarUrl.startsWith('linear-gradient') ? (
                      <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs" style={{ background: activeUser.avatarUrl }}>
                        {initials}
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={activeUser.avatarUrl} alt={activeUser.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">@{activeUser.username}</p>
                    <p className="text-[10px] text-zinc-500 font-medium">Lvl {activeUser.stats.level} • {activeUser.stats.unlockedTrophiesCount} Trophies</p>
                  </div>
                </div>
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
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-500/25 cursor-pointer"
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
