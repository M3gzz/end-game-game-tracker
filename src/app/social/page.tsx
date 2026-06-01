'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { PRELOADED_GAMES } from '@/data/preloadedGames';
import { MOCK_USERS } from '@/data/mockUsers';
import { 
  Star, MessageSquare, Plus, X, Send, Award, Compass, Heart, 
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

export default function SocialHub() {
  const { 
    posts, profile, progress, screenshots,
    likePost, addComment, createPost, toggleFollowUser, 
    addScreenshot, likeScreenshot
  } = useTrackerStore();

  const [mounted, setMounted] = React.useState(false);
  const [activeSubTab, setActiveSubTab] = React.useState<'feed' | 'screenshots'>('feed');
  
  // Feed Filters
  const [selectedGameFilter, setSelectedGameFilter] = React.useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = React.useState<string>('all');
  
  // Post Modal States
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [postTitle, setPostTitle] = React.useState('');
  const [postContent, setPostContent] = React.useState('');
  const [postType, setPostType] = React.useState<'review' | 'guide' | 'general'>('review');
  const [postGameId, setPostGameId] = React.useState<string>('');
  const [postRating, setPostRating] = React.useState<number>(5);

  // Active Comment Input States (postId -> text)
  const [commentInputs, setCommentInputs] = React.useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = React.useState<Record<string, boolean>>({});

  // Screenshot Uploader State
  const [screenshotFile, setScreenshotFile] = React.useState<string | null>(null);
  const [screenshotCaption, setScreenshotCaption] = React.useState('');
  const [screenshotGameId, setScreenshotGameId] = React.useState('');
  const [showScreenshotModal, setShowScreenshotModal] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Filter posts
  const filteredPosts = React.useMemo(() => {
    return posts.filter(post => {
      const gameMatch = selectedGameFilter === 'all' || post.gameId === selectedGameFilter;
      const typeMatch = selectedTypeFilter === 'all' || post.type === selectedTypeFilter;
      return gameMatch && typeMatch;
    });
  }, [posts, selectedGameFilter, selectedTypeFilter]);

  if (!mounted) {
    return (
      <div className="flex-1 p-6 md:p-10 bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const game = PRELOADED_GAMES.find(g => g.id === postGameId);
    
    createPost(
      postGameId ? postGameId : undefined,
      game ? game.title : undefined,
      postTitle,
      postContent,
      postType,
      postType === 'review' ? postRating : undefined
    );

    // Reset fields
    setPostTitle('');
    setPostContent('');
    setPostType('review');
    setPostGameId('');
    setPostRating(5);
    setShowCreateModal(false);
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    addComment(postId, text.trim());
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    setExpandedComments(prev => ({ ...prev, [postId]: true }));
  };

  // Base64 file reader for up to 5MB screenshots
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large! Maximum limit is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePublishScreenshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotFile || !screenshotCaption.trim()) return;

    addScreenshot(screenshotCaption, screenshotGameId || undefined, screenshotFile);
    setScreenshotFile(null);
    setScreenshotCaption('');
    setScreenshotGameId('');
    setShowScreenshotModal(false);
    alert("Screenshot published successfully!");
  };

  return (
    <div className="space-y-8 select-none">
      {/* Banner Hero */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-r from-zinc-900/60 to-purple-950/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_50px_rgba(168,85,247,0.05)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(168,85,247,0.1),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" /> Social Hub
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            EndGame Hunters Network
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm max-w-xl font-medium">
            Share screenshots, post detailed gaming guides, write reviews, and connect with followed platinum hunters in our streamlined network.
          </p>
        </div>

        <div className="flex gap-3 shrink-0 z-10">
          {activeSubTab === 'screenshots' ? (
            <button
              onClick={() => setShowScreenshotModal(true)}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              Upload Screenshot
            </button>
          ) : (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Write Post / Guide
            </button>
          )}
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex gap-2 border-b border-zinc-900 pb-3 overflow-x-auto custom-scrollbar">
        {[
          { id: 'feed', label: '💬 Activity Feed' },
          { id: 'screenshots', label: '🖼️ Screenshots Feed' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as 'feed' | 'screenshots')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wide border transition-all shrink-0 cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-purple-600/10 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.05)]'
                : 'bg-zinc-900/40 border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeSubTab === 'feed' && (
            <>
              {/* Feed Filters */}
              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-4 flex flex-wrap gap-3 items-center justify-between backdrop-blur-sm shadow-xl">
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'All Activities', value: 'all' },
                    { label: 'Reviews', value: 'review' },
                    { label: 'Guides', value: 'guide' },
                    { label: 'General', value: 'general' }
                  ].map(type => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedTypeFilter(type.value)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedTypeFilter === type.value
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                <select
                  value={selectedGameFilter}
                  onChange={(e) => setSelectedGameFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-850 text-xs font-semibold rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer min-w-[160px]"
                >
                  <option value="all">All Games</option>
                  {PRELOADED_GAMES.map(game => (
                    <option key={game.id} value={game.id}>{game.title}</option>
                  ))}
                </select>
              </div>

              {/* Posts Feed */}
              <div className="space-y-6">
                {filteredPosts.map((post) => {
                  const isLiked = post.likedBy.includes(profile.username);
                  const isAuthorSelf = post.authorUsername === profile.username;

                  return (
                    <article
                      key={post.id}
                      className="bg-zinc-900/20 border border-zinc-800/80 rounded-3xl p-6 flex flex-col gap-4 shadow-xl hover:border-zinc-700/60 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Link href={isAuthorSelf ? '/account' : `/user/${post.authorUsername}`}>
                            <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:scale-105 transition-transform shrink-0 relative">
                              {post.authorAvatar && post.authorAvatar.startsWith('linear-gradient') ? (
                                <div className="w-full h-full flex items-center justify-center font-bold text-white text-sm" style={{ background: post.authorAvatar }}>
                                  {post.authorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                              )}
                            </div>
                          </Link>
                          <div>
                            <Link href={isAuthorSelf ? '/account' : `/user/${post.authorUsername}`}>
                              <h3 className="text-sm font-extrabold text-zinc-100 hover:text-purple-400 transition-colors cursor-pointer flex items-center gap-1.5">
                                {post.authorName}
                                <span className="text-[10px] text-zinc-500 font-normal">@{post.authorUsername}</span>
                              </h3>
                            </Link>
                            <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                              {new Date(post.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 select-none">
                          {post.gameTitle && (
                            <span className="text-[10px] bg-zinc-950 border border-zinc-850 text-zinc-400 px-2.5 py-1 rounded-lg font-bold">
                              🎮 {post.gameTitle}
                            </span>
                          )}
                          <span className="text-[10px] px-2.5 py-1 rounded-lg font-extrabold uppercase border border-purple-500/20 text-purple-400 bg-purple-500/5">
                            {post.type}
                          </span>
                        </div>
                      </div>

                      {post.type === 'review' && post.rating && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-4 h-4 ${star <= post.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-800'}`} />
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <h2 className="text-base font-bold text-white leading-snug">{post.title}</h2>
                        <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      </div>

                      {/* Comments / Likes */}
                      <div className="flex items-center gap-6 border-y border-zinc-900/60 py-3.5 mt-2">
                        <button
                          onClick={() => likePost(post.id)}
                          className={`flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${isLiked ? 'text-red-500' : 'text-zinc-500'}`}
                        >
                          <Heart className={`w-4.5 h-4.5 ${isLiked ? 'fill-red-500' : ''}`} />
                          <span>{post.likes}</span>
                        </button>
                        <button
                          onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                          className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-purple-400 cursor-pointer"
                        >
                          <MessageSquare className="w-4.5 h-4.5" />
                          <span>{post.comments.length} Comments</span>
                        </button>
                      </div>

                      {expandedComments[post.id] && (
                        <div className="space-y-4 pt-2 animate-in slide-in-from-top-1 duration-150">
                          <div className="flex gap-3 items-center">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                              placeholder="Add your feedback..."
                              className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-purple-500"
                            />
                            <button onClick={() => handleCommentSubmit(post.id)} className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 cursor-pointer">
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-3 pl-4 border-l-2 border-zinc-900">
                            {post.comments.map((comment) => (
                              <div key={comment.id} className="flex gap-2.5 items-start text-xs bg-zinc-950/20 border border-zinc-950 p-2.5 rounded-xl">
                                <div className="flex-1">
                                  <span className="font-extrabold text-zinc-200">@{comment.authorUsername}</span>
                                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {activeSubTab === 'screenshots' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {screenshots.map((s) => {
                const isLiked = s.likedBy.includes(profile.username);
                return (
                  <div key={s.id} className="bg-zinc-900/20 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-xl hover:border-zinc-700/60 transition-all group">
                    <div className="aspect-video bg-zinc-950 relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.url} alt={s.caption} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                      {s.gameTitle && (
                        <span className="absolute top-3 left-3 text-[10px] font-black bg-zinc-950/90 border border-zinc-850 text-purple-400 px-2 py-0.5 rounded-md backdrop-blur-md">
                          🎮 {s.gameTitle}
                        </span>
                      )}
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <p className="text-xs text-zinc-300 leading-relaxed font-semibold">{s.caption}</p>
                      
                      <div className="flex items-center justify-between border-t border-zinc-900/60 pt-3 text-[11px] text-zinc-500">
                        <span className="font-bold">@{s.authorUsername}</span>
                        <button
                          onClick={() => likeScreenshot(s.id)}
                          className={`flex items-center gap-1.5 font-bold transition-all cursor-pointer ${isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                          <span>{s.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {screenshots.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-500 italic bg-zinc-900/10 border border-dashed border-zinc-850 rounded-3xl">
                  No screenshots shared yet. Be the first to share your glorious gaming memories!
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Recommended Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* User cabinet stats summary */}
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 relative overflow-hidden backdrop-blur-sm shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex gap-4 items-center mb-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border border-white/10 shrink-0 relative select-none">
                {profile.avatarUrl && profile.avatarUrl.startsWith('linear-gradient') ? (
                  <div className="w-full h-full flex items-center justify-center font-extrabold text-xl text-white" style={{ background: profile.avatarUrl }}>
                    {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                )}

                {profile.avatarFrame && profile.avatarFrame !== 'none' && (
                  <div className={`absolute inset-0 border-2 rounded-xl pointer-events-none ${
                    profile.avatarFrame === 'neon-blue' ? 'border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' :
                    profile.avatarFrame === 'ember-glow' ? 'border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' :
                    profile.avatarFrame === 'cyber-pulsar' ? 'border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' :
                    profile.avatarFrame === 'gold-particle' ? 'border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : ''
                  }`} />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-white truncate text-base leading-snug">{profile.name}</h3>
                <p className="text-xs text-zinc-500 font-semibold truncate">@{profile.username}</p>
                <span className="inline-block text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-black uppercase mt-1">
                  Streak Count: {progress.streakCount}d
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center mt-4 border-t border-zinc-900 pt-4">
              <div>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Following</p>
                <p className="text-base font-extrabold text-zinc-200">{profile.following?.length || 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Followers</p>
                <p className="text-base font-extrabold text-zinc-200">1,240</p>
              </div>
            </div>
          </div>

          {/* Followed Hunters Tray */}
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 space-y-4 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
              <h3 className="font-bold text-sm text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" /> Followed Hunters
              </h3>
            </div>

            <div className="space-y-4">
              {Object.keys(MOCK_USERS).map((username) => {
                const user = MOCK_USERS[username];
                const isFollowing = profile.following?.includes(username);
                
                return (
                  <div 
                    key={username}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/30 border border-zinc-900/60 hover:border-zinc-800 transition-all animate-in fade-in-20 duration-150"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/5 relative shrink-0">
                        {user.avatarUrl.startsWith('linear-gradient') ? (
                          <div className="w-full h-full flex items-center justify-center font-bold text-sm text-white" style={{ background: user.avatarUrl }}>
                            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-zinc-100 truncate">{user.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">@{user.username}</p>
                        <span className="inline-block text-[9px] bg-zinc-900 text-purple-400 px-1.5 py-0.5 rounded font-black mt-1 uppercase">
                          Lvl {user.stats.level}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFollowUser(username)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        isFollowing
                          ? 'bg-zinc-800 border border-zinc-700 text-zinc-400 animate-in fade-in duration-200'
                          : 'bg-purple-600/10 border border-purple-500/20 text-purple-400 hover:bg-purple-600 hover:text-white'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Write Post Slideup Overlay Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
          
          <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl z-10 flex flex-col gap-5 text-zinc-100 max-h-[90vh] overflow-y-auto animate-in scale-in duration-200">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-purple-500" /> Write Review / Guide
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-[10px] text-zinc-500 font-extrabold uppercase mb-2">Activity Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['review', 'guide', 'general'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPostType(type as 'review' | 'guide' | 'general')}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center uppercase cursor-pointer ${
                        postType === type ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 font-extrabold uppercase mb-1.5">Link Game</label>
                  <select
                    value={postGameId}
                    onChange={(e) => setPostGameId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs font-semibold rounded-xl p-3 text-zinc-300 focus:outline-none cursor-pointer"
                  >
                    <option value="">No Game Linked</option>
                    {PRELOADED_GAMES.map(game => (
                      <option key={game.id} value={game.id}>{game.title}</option>
                    ))}
                  </select>
                </div>

                {postType === 'review' && (
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-extrabold uppercase mb-1.5">Rating (Stars)</label>
                    <div className="flex items-center h-11 gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-3 select-none">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setPostRating(star)} className="cursor-pointer">
                          <Star className={`w-5 h-5 ${star <= postRating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-700'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 font-extrabold uppercase mb-1.5">Title</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Review / Guide Title..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 font-extrabold uppercase mb-1.5">Content</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share details, solutions, or overall thoughts here..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 h-32 leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-900">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer">
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Screenshot Modal */}
      {showScreenshotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowScreenshotModal(false)} />
          
          <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl z-10 flex flex-col gap-5 text-zinc-100 animate-in scale-in duration-200">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-400" /> Share Screenshot (Max 5MB)
              </h2>
              <button onClick={() => setShowScreenshotModal(false)} className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handlePublishScreenshot} className="space-y-4">
              {/* File Uploader */}
              <div className="border-2 border-dashed border-zinc-800/80 hover:border-purple-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-zinc-900/10 relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required
                />
                
                {screenshotFile ? (
                  <div className="w-full max-h-[200px] overflow-hidden rounded-xl border border-zinc-800 relative select-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={screenshotFile} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto animate-bounce" />
                    <p className="text-xs text-zinc-400 font-extrabold">Drag & Drop or Click to choose a PNG/JPG file</p>
                    <p className="text-[10px] text-zinc-500">Supports standard resolutions up to 5 megabytes.</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 font-extrabold uppercase mb-1.5">Caption</label>
                <input
                  type="text"
                  value={screenshotCaption}
                  onChange={(e) => setScreenshotCaption(e.target.value)}
                  placeholder="Describe your epic screenshot moment..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 font-extrabold uppercase mb-1.5">Game Tag</label>
                <select
                  value={screenshotGameId}
                  onChange={(e) => setScreenshotGameId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs font-semibold rounded-xl p-3 text-zinc-300 focus:outline-none cursor-pointer"
                  required
                >
                  <option value="">Link a game...</option>
                  {PRELOADED_GAMES.map(game => (
                    <option key={game.id} value={game.id}>{game.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-900">
                <button type="button" onClick={() => setShowScreenshotModal(false)} className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer">
                  Publish Screenshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
