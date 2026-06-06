'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { PRELOADED_GAMES } from '@/data/preloadedGames';
import { MOCK_USERS } from '@/data/mockUsers';
import { Trophy, Award, Calendar, ChevronLeft, UserPlus, UserMinus, MessageSquare, Heart } from 'lucide-react';
import Link from 'next/link';
import { Achievement, Game } from '@/types';
import CreatorBackdrop from '@/components/profile/CreatorBackdrop';



interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function PublicHunterProfile({ params }: UserProfilePageProps) {
  const resolvedParams = React.use(params);
  const username = resolvedParams.username;
  
  const { profile, progress, posts, toggleFollowUser, likePost } = useTrackerStore();
  const [mounted, setMounted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'showcase' | 'cabinet' | 'posts'>('showcase');

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);



  // Relational lookups
  const allGames = React.useMemo(() => {
    const customList = progress.customGames ? Object.values(progress.customGames) : [];
    return [...PRELOADED_GAMES, ...customList];
  }, [progress.customGames]);

  const allAchievements = React.useMemo(() => {
    return allGames.flatMap((g: Game) => {
      const custom = progress.customAchievements?.[g.id] || [];
      return (custom.length > 0 ? custom : g.achievements) as Achievement[];
    });
  }, [allGames, progress.customAchievements]);

  // Load the mock user profile, fallback to the logged in user profile if viewing self
  const user = React.useMemo(() => {
    if (username === profile.username) {
      const ownedGames = allGames.filter(g => progress.ownedGames.includes(g.id));
      
      let totalUnlockedAchievements = 0;
      ownedGames.forEach((game) => {
        const custom = progress.customAchievements?.[game.id] || [];
        const achievements = custom.length > 0 ? custom : game.achievements;
        achievements.forEach((ach) => {
          if (progress.unlockedAchievements[ach.id]) {
            totalUnlockedAchievements++;
          }
        });
      });

      const completedGameIds = ownedGames.filter(game => {
        const custom = progress.customAchievements?.[game.id] || [];
        const achievements = custom.length > 0 ? custom : game.achievements;
        const baseAchievements = achievements.filter(ach => !ach.dlcId);
        const baseUnlocked = baseAchievements.filter(ach => !!progress.unlockedAchievements[ach.id]).length;
        return baseAchievements.length > 0 && baseUnlocked === baseAchievements.length;
      }).map(g => g.id);

      const level = Math.floor(totalUnlockedAchievements / 5) + 1;
      const totalForCurrentLevel = (level - 1) * 5;
      const currentLevelXP = totalUnlockedAchievements - totalForCurrentLevel;
      const xpPercentage = Math.round((currentLevelXP / 5) * 100);

      // Compute recent achievements
      const unlockedList = allAchievements.filter(ach => !!progress.unlockedAchievements[ach.id]);
      const recentTrophies = unlockedList
        .map(ach => {
          const game = allGames.find(g => g.id === ach.gameId);
          return {
            achievementId: ach.id,
            title: ach.title,
            gameTitle: game ? game.title : 'Unknown Game',
            iconUrl: ach.iconUrl,
            unlockedAt: progress.unlockedAchievements[ach.id]
          };
        })
        .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
        .slice(0, 3); // Take top 3 recent ones

      return {
        name: profile.name,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        followersCount: 142, // default mock values
        followingCount: profile.following?.length || 0,
        stats: {
          ownedGamesCount: progress.ownedGames.length,
          showcasedAchievements: profile.showcasedAchievements || [],
          completedGameIds: completedGameIds,
          level: level,
          xpPercentage: xpPercentage,
          recentTrophies: recentTrophies
        }
      };
    }
    
    const mockUser = MOCK_USERS[username];
    if (mockUser) {
      return mockUser;
    }
    return undefined;
  }, [username, profile, progress, allAchievements, allGames]);

  if (!user) {
    return (
      <div className="flex-1 p-6 md:p-10 bg-zinc-950 min-h-screen text-zinc-100 flex flex-col items-center justify-center gap-4">
        <div className="glass-panel border border-zinc-900 rounded-3xl p-10 text-center max-w-md">
          <Trophy className="w-12 h-12 text-zinc-650 mx-auto mb-4" />
          <h2 className="text-xl font-extrabold text-white">Hunter Not Found</h2>
          <p className="text-xs text-zinc-500 mt-2">
            The profile for username <span className="text-blue-400">@{username}</span> could not be found in our achievement database.
          </p>
          <Link href="/social" className="inline-block px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold rounded-xl text-xs mt-6 transition-all">
            Back to Social Hub
          </Link>
        </div>
      </div>
    );
  }

  const isFollowing = profile.following?.includes(username);
  const followerCount = isFollowing ? user.followersCount + 1 : user.followersCount;

  // Showcase Achievements list
  const preloadedAchievements = allGames.flatMap(g => {
    const custom = progress.customAchievements?.[g.id] || [];
    return custom.length > 0 ? custom : g.achievements;
  });
  const showcasedAchievements = (user.stats.showcasedAchievements || [])
    .map(id => preloadedAchievements.find(ach => ach.id === id))
    .filter((ach): ach is NonNullable<typeof ach> => !!ach);

  // Completed Games
  const completedGames = allGames.filter(game => 
    user.stats.completedGameIds.includes(game.id)
  );

  // Posts authored by this user
  const userPosts = posts.filter(p => p.authorUsername === username);

  // Initials generator
  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const isDeveloper = username?.toLowerCase() === 'hunter_megan' || username?.toLowerCase() === 'm3gzz' || username?.toLowerCase() === 'megs_za';

  if (!mounted) {
    return (
      <div className="flex-1 p-6 md:p-10 bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-10 bg-zinc-950 min-h-screen text-zinc-100 pb-24 md:pb-10 overflow-x-hidden relative">
      {/* Developer Backdrop */}
      {isDeveloper && <CreatorBackdrop />}
      
      {/* Back button */}
      <Link 
        href="/social" 
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors mb-6 group select-none cursor-pointer relative z-10"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Social Hub
      </Link>

      {/* Cinematic Profile Header */}
      <div className={`relative rounded-3xl overflow-hidden mb-8 border p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 transition-all duration-500 z-10 ${isDeveloper ? 'border-purple-500/50 bg-gradient-to-r from-zinc-900/60 via-zinc-950/80 to-purple-950/20 shadow-[0_0_50px_rgba(168,85,247,0.25)]' : 'border-zinc-800 bg-gradient-to-r from-zinc-900/60 via-zinc-950/80 to-blue-950/20 shadow-[0_0_50px_rgba(59,130,246,0.03)]'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-30%,rgba(59,130,246,0.08),transparent_60%)] pointer-events-none" />
        
        {/* Dynamic Avatar Container */}
        <div className="relative shrink-0 select-none">
          {isDeveloper && (
            <div className="absolute -inset-1.5 rounded-[28px] blur-sm animate-rotate-conic bg-[conic-gradient(from_0deg,#ff007f,#7f00ff,#00f0ff,#ff007f)] z-0 transition-all duration-500" />
          )}
          <div className={`w-24 h-24 md:w-28 md:h-28 rounded-3xl overflow-hidden shadow-2xl border-2 shrink-0 select-none relative z-10 ${isDeveloper ? 'border-transparent' : 'border-white/25'}`}>
            {user.avatarUrl && user.avatarUrl.startsWith('linear-gradient') ? (
              <div 
                className="w-full h-full flex items-center justify-center font-extrabold text-3xl md:text-4xl text-white"
                style={{ background: user.avatarUrl }}
              >
                {initials}
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="w-full h-full object-cover" 
              />
            )}
          </div>
        </div>

        {/* Profile Info Details */}
        <div className="flex-1 text-center md:text-left space-y-3.5 min-w-0 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none flex items-center justify-center md:justify-start gap-2">
              <span>{user.name}</span>
              {isDeveloper && (
                <span 
                  className="text-[9px] px-2 py-0.5 rounded border border-purple-500 bg-purple-950/20 text-purple-300 font-black uppercase tracking-wider select-none shrink-0 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                  style={{ textShadow: '0 0 8px #a855f7' }}
                >
                  👑 Founder
                </span>
              )}
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="text-zinc-500 font-semibold text-sm">@{user.username}</span>
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider select-none">
                Follows you
              </span>
            </div>
          </div>

          <p className="text-zinc-450 text-xs md:text-sm max-w-xl leading-relaxed">
            {user.bio}
          </p>

          {/* Social Stats Row */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 select-none">
            <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1.5 rounded-xl font-bold">
              🎮 {user.stats.ownedGamesCount} Games Owned
            </span>
            <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1.5 rounded-xl font-bold">
              👥 {followerCount} Followers
            </span>
            <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1.5 rounded-xl font-bold">
              👤 {user.followingCount} Following
            </span>
          </div>

          {/* Follow Call to Action Button */}
          <div className="pt-1.5 select-none">
            <button
              onClick={() => toggleFollowUser(username)}
              className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
                isFollowing
                  ? 'bg-zinc-800 hover:bg-red-950/20 border border-zinc-700 hover:border-red-900/40 text-zinc-400 hover:text-red-400 shadow-zinc-950/10'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 border border-blue-500'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4" />
                  <span>Unfollow Hunter</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Follow Hunter</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Level Widget Circle Card */}
        <div className="glass-panel border border-zinc-800 rounded-3xl p-5 w-full md:w-64 flex flex-col items-center justify-center text-center shrink-0 shadow-inner select-none relative bg-zinc-900/30">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 pointer-events-none" />
          <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-zinc-850"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-blue-500 transition-all duration-500"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 - (213.6 * user.stats.xpPercentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-black text-white">{user.stats.level}</span>
              <span className="text-[8px] text-zinc-500 font-extrabold uppercase">Level</span>
            </div>
          </div>
          <h3 className="font-extrabold text-xs text-zinc-200">Hunter Rating</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Progressing to Level {user.stats.level + 1} ({user.stats.xpPercentage}% XP)
          </p>
        </div>

      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex border-b border-zinc-900 mb-8 select-none">
        {[
          { id: 'showcase', label: 'Showcase Shelf', count: showcasedAchievements.length },
          { id: 'cabinet', label: 'Completed Games', count: completedGames.length },
          { id: 'posts', label: 'Community Posts', count: userPosts.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'showcase' | 'cabinet' | 'posts')}
            className={`px-5 py-3.5 text-xs font-extrabold tracking-wide uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400 font-black'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label} <span className="text-[10px] ml-1 bg-zinc-900 px-1.5 py-0.5 rounded-md font-semibold text-zinc-400">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Tabs Content Drawer */}
      <div>
        
        {/* Tab 1: Showcase Shelf */}
        {activeTab === 'showcase' && (
          <div className="space-y-6">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-500" /> showcased Cabinet
            </h2>

            {/* Immersive Glass Shelf Container */}
            <div className="relative py-8 px-6 bg-zinc-900/10 border border-zinc-900 rounded-3xl flex justify-center items-center select-none overflow-hidden min-h-[160px]">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent pointer-events-none" />
              
              {/* Horizontal shelf */}
              <div className="absolute bottom-4 left-6 right-6 h-3 bg-zinc-800/60 border-t border-zinc-700/40 rounded-full shadow-2xl backdrop-blur-sm" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl relative z-10">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const ach = showcasedAchievements[slotIdx];
                  if (!ach) {
                    return (
                      <div 
                        key={slotIdx}
                        className="aspect-square rounded-2xl border-2 border-dashed border-zinc-850 bg-zinc-950/10 flex flex-col items-center justify-center gap-2 text-zinc-750"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider">Empty Slot</span>
                      </div>
                    );
                  }

                  const tierStyles = {
                    platinum: 'border-cyan-500 bg-cyan-950/20 shadow-cyan-500/20 text-cyan-400',
                    gold: 'border-yellow-500 bg-yellow-950/20 shadow-yellow-500/20 text-yellow-400',
                    silver: 'border-slate-500 bg-slate-800/40 shadow-slate-400/20 text-slate-300',
                    bronze: 'border-amber-600 bg-amber-950/20 shadow-amber-700/20 text-amber-500'
                  };

                    return (
                      <div 
                        key={ach.id}
                        className={`aspect-square rounded-2xl border-2 p-4 flex flex-col items-center justify-center text-center gap-1.5 shadow-lg relative ${tierStyles[ach.tier]}`}
                        title={ach.description}
                      >
                        <div className="w-10 h-10 flex items-center justify-center shrink-0">
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
                                    className="w-full h-full object-contain rounded-lg" 
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                                      if (fallback) fallback.classList.remove('hidden');
                                    }}
                                  />
                                  <span className="fallback-icon hidden text-2xl leading-none">🏆</span>
                                </>
                              );
                            }
                            return <span className="text-2xl leading-none">{icon || '🏆'}</span>;
                          })()}
                        </div>
                        <h4 className="font-extrabold text-[11px] truncate w-full text-zinc-200 mt-1">{ach.title}</h4>
                        <span className="text-[8px] uppercase tracking-wider font-black opacity-80">{ach.tier}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Trophies History */}
              <div className="space-y-4 pt-4">
                <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-wider flex items-center gap-2 select-none">
                  ⏳ Unlocking Timeline (Recent Achievements)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {user.stats.recentTrophies.map(trophy => (
                    <div 
                      key={trophy.achievementId}
                      className="glass-panel border border-zinc-850 rounded-2xl p-4 flex items-center gap-3 bg-zinc-900/10"
                    >
                      <div className="w-10 h-10 flex items-center justify-center shrink-0">
                        {(() => {
                          const icon = trophy.iconUrl?.trim() || '';
                          const isUrl = icon.startsWith('http') || icon.startsWith('//') || icon.includes('/') || icon.includes('.');
                          if (isUrl) {
                            return (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                  src={icon.startsWith('//') ? `https:${icon}` : icon} 
                                  alt={trophy.title} 
                                  className="w-full h-full object-contain rounded-lg" 
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                                    if (fallback) fallback.classList.remove('hidden');
                                  }}
                                />
                                <span className="fallback-icon hidden text-2xl leading-none">🏆</span>
                              </>
                            );
                          }
                          return <span className="text-2xl leading-none">{icon || '🏆'}</span>;
                        })()}
                      </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-white truncate">{trophy.title}</h4>
                      <p className="text-[9px] text-zinc-500 font-semibold truncate mt-0.5">🎮 {trophy.gameTitle}</p>
                      <span className="text-[8px] text-zinc-600 font-semibold block mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-650" />
                        Unlocked {new Date(trophy.unlockedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Cabinet (Completed Games) */}
        {activeTab === 'cabinet' && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-wider flex items-center gap-2 select-none">
              🥇 100% Completions ({completedGames.length})
            </h3>
            {completedGames.length === 0 ? (
              <p className="text-xs text-zinc-550 italic select-none">This hunter hasn&apos;t 100% completed any games yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedGames.map(game => (
                  <Link key={game.id} href={`/games/${game.id}`} className="block">
                    <div className="glass-panel border border-zinc-800 hover:border-zinc-700/60 rounded-3xl p-4 flex gap-4 items-center transition-all hover:scale-102 cursor-pointer bg-zinc-900/20">
                      <img 
                        src={game.coverUrl} 
                        alt={game.title} 
                        className="w-12 h-16 object-cover rounded-xl border border-zinc-800 shadow"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-white truncate max-w-[200px]">{game.title}</h4>
                        <p className="text-[10px] text-zinc-550 font-semibold mt-1">
                          Developer: {game.developer}
                        </p>
                        <span className="inline-block text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black mt-2 uppercase">
                          💯 100% Achievements Completed
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Community Posts */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {userPosts.length === 0 ? (
              <div className="glass-panel border border-zinc-900 rounded-3xl p-12 text-center select-none">
                <p className="text-zinc-550 text-xs italic">@{user.username} hasn&apos;t written any community reviews or guides yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {userPosts.map(post => (
                  <article 
                    key={post.id}
                    className="glass-panel border border-zinc-800 rounded-3xl p-5 flex flex-col gap-3.5 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-extrabold ${
                          post.type === 'review' 
                            ? 'text-yellow-400 bg-yellow-950/20 border-yellow-800/40' 
                            : post.type === 'guide'
                            ? 'text-cyan-400 bg-cyan-950/20 border-cyan-800/40'
                            : 'text-zinc-300 bg-zinc-900 border-zinc-800'
                        }`}>
                          {post.type}
                        </span>
                        {post.gameTitle && (
                          <span className="text-[9px] text-zinc-500 font-semibold ml-2">🎮 {post.gameTitle}</span>
                        )}
                      </div>
                      <span className="text-[9px] text-zinc-500 font-semibold">
                        {new Date(post.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-sm text-white">{post.title}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed max-w-4xl line-clamp-3">{post.content}</p>
                    </div>

                    <div className="flex gap-4 border-t border-zinc-900 pt-3 text-[10px] font-bold text-zinc-500 select-none">
                      <button 
                        onClick={() => likePost(post.id)}
                        className={`flex items-center gap-1 transition-all cursor-pointer ${
                          post.likedBy.includes(profile.username) ? 'text-red-500 font-extrabold' : 'hover:text-zinc-300'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5" /> {post.likes} Likes
                      </button>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-zinc-600" /> {post.comments.length} Comments</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
