/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { PRELOADED_GAMES } from '@/data/preloadedGames';
import { 
  Award, 
  Settings, 
  X, 
  Plus, 
  Edit3, 
  Heart, 
  MessageSquare, 
  Sparkles,
  Upload,
  Palette,
  Check,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const getBaseId = (id: string) => id.replace(/^\d+-/, '');

const THEME_PRESETS = [
  { name: 'Nebula Purple', primary: '#a855f7', secondary: '#6366f1', gradient: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' },
  { name: 'PlayStation Blue', primary: '#00439c', secondary: '#00b2ff', gradient: 'linear-gradient(135deg, #00439c 0%, #00b2ff 100%)' },
  { name: 'Xbox Green', primary: '#107c10', secondary: '#5dc21e', gradient: 'linear-gradient(135deg, #107c10 0%, #5dc21e 100%)' },
  { name: 'Nintendo Red', primary: '#e60012', secondary: '#ff4b5c', gradient: 'linear-gradient(135deg, #e60012 0%, #ff4b5c 100%)' },
  { name: 'Cyberpunk Gold', primary: '#fcee0a', secondary: '#00f0ff', gradient: 'linear-gradient(135deg, #fcee0a 0%, #00f0ff 100%)' },
  { name: 'Spider Red', primary: '#dc2626', secondary: '#2563eb', gradient: 'linear-gradient(135deg, #dc2626 0%, #2563eb 100%)' },
  { name: 'Abyssal Teal', primary: '#0d9488', secondary: '#10b981', gradient: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)' },
  { name: 'Solar Flare', primary: '#d946ef', secondary: '#f97316', gradient: 'linear-gradient(135deg, #d946ef 0%, #f97316 100%)' },
  { name: 'Kaer Morhen Slate', primary: '#64748b', secondary: '#334155', gradient: 'linear-gradient(135deg, #64748b 0%, #334155 100%)' }
];

export default function AccountProfile() {
  const { 
    progress, 
    profile, 
    posts, 
    updateProfile, 
    toggleShowcase, 
    pruneShowcase,
    updateSteamApiKey, 
    updateSteamId,
    addGame,
    updatePlaytime,
    syncAchievements,
    syncUserAchievements,
    setAvatarFrame
  } = useTrackerStore();
  const [mounted, setMounted] = React.useState(false);
  
  // Tab control
  const [activeTab, setActiveTab] = React.useState<'showcase' | 'cabinet' | 'posts'>('showcase');

  // Modals
  const [showEditProfileModal, setShowEditProfileModal] = React.useState(false);
  const [showShowcaseEditor, setShowShowcaseEditor] = React.useState(false);

  // Edit Profile Fields
  const [editName, setEditName] = React.useState(profile.name);
  const [editBio, setEditBio] = React.useState(profile.bio);
  const [editAvatar, setEditAvatar] = React.useState(profile.avatarUrl);
  const [editSteamApiKey, setEditSteamApiKey] = React.useState(profile.steamApiKey || '');
  const [editBanner, setEditBanner] = React.useState(profile.bannerUrl || '');
  const [editPrimaryColor, setEditPrimaryColor] = React.useState(profile.primaryColor || '#a855f7');
  const [editSecondaryColor, setEditSecondaryColor] = React.useState(profile.secondaryColor || '#6366f1');
  const [editThemePreset, setEditThemePreset] = React.useState(profile.themePreset || 'Nebula Purple');
  const [editClanTag, setEditClanTag] = React.useState(profile.clanTag || '');
  const [editBgPattern, setEditBgPattern] = React.useState(profile.bgPattern || 'clean');
  const [editSpotlightGameId, setEditSpotlightGameId] = React.useState(profile.spotlightGameId || '');
  
  // Custom legacy title state
  const [editCustomTitle, setEditCustomTitle] = React.useState(profile.customTitle || '');
  const [editAvatarFrame, setEditAvatarFrame] = React.useState(profile.avatarFrame || 'none');

  // State for profile syncing from Steam
  const [isProfileSyncing, setIsProfileSyncing] = React.useState(false);
  const [profileSyncSuccess, setProfileSyncSuccess] = React.useState(false);
  const [profileSyncError, setProfileSyncError] = React.useState<string | null>(null);

  // State for library syncing from Steam
  const [isLibrarySyncing, setIsLibrarySyncing] = React.useState(false);
  const [librarySyncError, setLibrarySyncError] = React.useState<string | null>(null);
  const [librarySyncMessage, setLibrarySyncMessage] = React.useState<string | null>(null);

  // File Input References
  const avatarFileInputRef = React.useRef<HTMLInputElement>(null);
  const bannerFileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setMounted(true);
    setEditName(profile.name);
    setEditBio(profile.bio);
    setEditAvatar(profile.avatarUrl);
    setEditSteamApiKey(profile.steamApiKey || '');
    setEditBanner(profile.bannerUrl || '');
    setEditPrimaryColor(profile.primaryColor || '#a855f7');
    setEditSecondaryColor(profile.secondaryColor || '#6366f1');
    setEditThemePreset(profile.themePreset || 'Nebula Purple');
    setEditClanTag(profile.clanTag || '');
    setEditBgPattern(profile.bgPattern || 'clean');
    setEditSpotlightGameId(profile.spotlightGameId || '');
    setEditCustomTitle(profile.customTitle || '');
    setEditAvatarFrame(profile.avatarFrame || 'none');

    // Proactive atomic cleanup of stale showcased achievements
    pruneShowcase();

    // Check if returning from Steam OpenID redirect
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const steamIdParam = urlParams.get('steamId');
      const errorParam = urlParams.get('error');
      
      if (errorParam) {
        setProfileSyncError(`Steam Sign-In failed: ${errorParam}. Please try again.`);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (steamIdParam && /^\d{17}$/.test(steamIdParam)) {
        updateSteamId(steamIdParam);
        
        const autoSync = async () => {
          setIsProfileSyncing(true);
          setProfileSyncError(null);
          try {
            const res = await fetch(`/api/steam/profile?steamId=${steamIdParam}&apiKey=${encodeURIComponent(profile.steamApiKey || '')}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to sync Steam profile');
            
            updateProfile(data.name, data.bio, data.avatarUrl);
            setProfileSyncSuccess(true);
            setTimeout(() => setProfileSyncSuccess(false), 5000);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setProfileSyncError(msg);
          } finally {
            setIsProfileSyncing(false);
          }
        };

        autoSync();
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [pruneShowcase, updateSteamId, profile.steamApiKey, updateProfile]);

  if (!mounted) {
    return (
      <div className="flex-1 p-6 md:p-10 bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Relational lookups
  const allAchievements = PRELOADED_GAMES.flatMap(g => {
    const custom = progress.customAchievements?.[g.id] || [];
    return custom.length > 0 ? custom : g.achievements;
  });
  const unlockedAchievementsList = allAchievements.filter(ach => !!progress.unlockedAchievements[ach.id]);
  
  const bronzeCount = unlockedAchievementsList.filter(ach => ach.tier === 'bronze').length;
  const silverCount = unlockedAchievementsList.filter(ach => ach.tier === 'silver').length;
  const goldCount = unlockedAchievementsList.filter(ach => ach.tier === 'gold').length;
  const platinumCount = unlockedAchievementsList.filter(ach => ach.tier === 'platinum').length;
  const totalUnlocked = unlockedAchievementsList.length;

  // Level Widget Math
  const level = Math.floor(totalUnlocked / 5) + 1;
  const trophiesInCurrentLevel = totalUnlocked % 5;
  const xpPercentage = (trophiesInCurrentLevel / 5) * 100;
  const trophiesNeededForNext = 5 - trophiesInCurrentLevel;

  // Completed Games list
  const completedGames = PRELOADED_GAMES.filter(game => {
    if (!progress.ownedGames.includes(game.id)) return false;
    const custom = progress.customAchievements?.[game.id] || [];
    const achievements = custom.length > 0 ? custom : game.achievements;
    if (achievements.length === 0) return false;
    return achievements.every(ach => !!progress.unlockedAchievements[ach.id]);
  });

  // User's own posts
  const userPosts = posts.filter(p => p.authorUsername === profile.username);

  // Showcase Achievements list
  const showcasedAchievements = (profile.showcasedAchievements || [])
    .map(id => allAchievements.find(ach => getBaseId(ach.id) === getBaseId(id)))
    .filter((ach): ach is NonNullable<typeof ach> => !!ach);

  const spotlightGame = profile.spotlightGameId
    ? PRELOADED_GAMES.find(g => g.id === profile.spotlightGameId)
    : undefined;

  // Submission handler
  const handleEditProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(
      editName, 
      editBio, 
      editAvatar, 
      editBanner, 
      editPrimaryColor, 
      editSecondaryColor, 
      editThemePreset,
      editClanTag,
      editBgPattern,
      editSpotlightGameId,
      editCustomTitle
    );
    updateSteamApiKey(editSteamApiKey);
    setAvatarFrame(editAvatarFrame as 'neon-blue' | 'ember-glow' | 'cyber-pulsar' | 'gold-particle' | 'none');
    setShowEditProfileModal(false);
  };

  const handleManualSyncProfile = async () => {
    if (!profile.steamId) return;
    setIsProfileSyncing(true);
    setProfileSyncError(null);
    setProfileSyncSuccess(false);
    try {
      const res = await fetch(`/api/steam/profile?steamId=${profile.steamId}&apiKey=${encodeURIComponent(profile.steamApiKey || '')}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sync Steam profile');
      
      updateProfile(data.name, data.bio, data.avatarUrl);
      setProfileSyncSuccess(true);
      setTimeout(() => setProfileSyncSuccess(false), 5000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setProfileSyncError(msg);
    } finally {
      setIsProfileSyncing(false);
    }
  };

  const handleDisconnectSteam = () => {
    updateSteamId(undefined);
  };

  const handleSteamLibrarySync = async () => {
    if (!profile.steamId) return;
    setIsLibrarySyncing(true);
    setLibrarySyncError(null);
    setLibrarySyncMessage(null);

    try {
      const apiKey = profile.steamApiKey || '';
      const response = await fetch(`/api/steam/owned-games?steamId=${profile.steamId}&apiKey=${encodeURIComponent(apiKey)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Sync failed with status ${response.status}`);
      }

      const ownedGamesFromSteam = data.games || [];
      if (!Array.isArray(ownedGamesFromSteam) || ownedGamesFromSteam.length === 0) {
        throw new Error('No games found in your public Steam library. Please double check your Steam privacy settings.');
      }

      let gamesSyncedCount = 0;
      let achievementsUnlockedCount = 0;

      const getSteamAppId = (g: typeof PRELOADED_GAMES[0]) => {
        return g.steamAppId ? String(g.steamAppId) : g.coverUrl?.match(/\/apps\/(\d+)\//)?.[1];
      };

      // Perform sync for all matching games in parallel using Promise.all
      await Promise.all(
        ownedGamesFromSteam.map(async (gameOnSteam) => {
          const matchingGame = PRELOADED_GAMES.find(g => getSteamAppId(g) === String(gameOnSteam.appId));
          if (matchingGame) {
            // 1. Add game to library if not already owned
            addGame(matchingGame.id);

            // 2. Update playtime hours
            updatePlaytime(matchingGame.id, gameOnSteam.playtimeHours);

            // 3. Fetch and sync achievements schema
            try {
              const achResponse = await fetch(`/api/steam/achievements?appId=${gameOnSteam.appId}&apiKey=${encodeURIComponent(apiKey)}`);
              if (achResponse.ok) {
                const achData = await achResponse.json();
                if (achData.achievements && Array.isArray(achData.achievements)) {
                  syncAchievements(matchingGame.id, achData.achievements);

                  // 4. Fetch and sync personal achievements unlock progress
                  try {
                    const userAchResponse = await fetch(`/api/steam/user-achievements?appId=${gameOnSteam.appId}&steamId=${profile.steamId}&apiKey=${encodeURIComponent(apiKey)}`);
                    if (userAchResponse.ok) {
                      const userAchData = await userAchResponse.json();
                      if (userAchData.unlockedApiNames && Array.isArray(userAchData.unlockedApiNames)) {
                        syncUserAchievements(matchingGame.id, userAchData.unlockedApiNames);
                        achievementsUnlockedCount += userAchData.unlockedApiNames.length;
                      }
                    }
                  } catch (userAchErr) {
                    console.error(`Failed to sync user achievements progress for ${matchingGame.title}:`, userAchErr);
                  }
                }
              }
            } catch (achErr) {
              console.error(`Failed to sync achievements schema for ${matchingGame.title}:`, achErr);
            }
            gamesSyncedCount++;
          }
        })
      );

      if (gamesSyncedCount === 0) {
        setLibrarySyncMessage('Scan complete! No matching games from your Steam library exist in our starter database of 30 S-tier titles.');
      } else {
        setLibrarySyncMessage(`Successfully synchronized ${gamesSyncedCount} games from your Steam library! Updated playtime records and unlocked ${achievementsUnlockedCount} trophies automatically.`);
      }

      // Hide success message after 10 seconds
      setTimeout(() => {
        setLibrarySyncMessage(null);
      }, 10000);

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLibrarySyncError(msg || 'An unknown error occurred during library synchronization.');
    } finally {
      setIsLibrarySyncing(false);
    }
  };

  // Image Upload / Base64 Conversion
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: up to 5MB for profile avatar and banner picture
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File is too large! Maximum size allowed is 5MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'avatar') {
        setEditAvatar(base64String);
      } else {
        setEditBanner(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  // Initials generator
  const initials = profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Dynamic values supporting LIVE PREVIEW
  const currentPrimary = showEditProfileModal ? editPrimaryColor : (profile.primaryColor || '#a855f7');
  const currentSecondary = showEditProfileModal ? editSecondaryColor : (profile.secondaryColor || '#6366f1');
  const currentBanner = showEditProfileModal ? editBanner : (profile.bannerUrl || '');

  return (
    <div 
      className="flex-1 p-6 md:p-10 bg-zinc-950 min-h-screen text-zinc-100 pb-24 md:pb-10 overflow-x-hidden transition-all duration-300 relative"
      style={{
        '--profile-primary': currentPrimary,
        '--profile-secondary': currentSecondary,
        '--profile-primary-glow': currentPrimary + '2c',
        '--profile-secondary-glow': currentSecondary + '1a',
      } as React.CSSProperties}
    >
      
      {/* Dynamic Ambient Background Atmosphere Patterns */}
      {profile.bgPattern === 'cyber-grid' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,var(--profile-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--profile-primary)_1px,transparent_1px)] bg-[size:4rem_4rem] [perspective:1000px] [transform:rotateX(60deg)] [transform-origin:top_center]" 
            style={{
              backgroundImage: `linear-gradient(to right, var(--profile-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--profile-primary) 1px, transparent 1px)`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950" />
        </div>
      )}
      {profile.bgPattern === 'scanlines' && (
        <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%]" />
      )}
      {profile.bgPattern === 'constellations' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_20%_30%,var(--profile-primary)_1.5px,transparent_1.5px),radial-gradient(circle_at_75%_40%,var(--profile-secondary)_1.5px,transparent_1.5px),radial-gradient(circle_at_40%_80%,var(--profile-primary)_2px,transparent_2px)] bg-[size:160px_160px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/40 to-zinc-950" />
        </div>
      )}
      {profile.bgPattern === 'hex-grid' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ color: 'var(--profile-primary)' }}>
            <svg width="100%" height="100%">
              <defs>
                <pattern id="hex-pattern" width="56" height="98" patternUnits="userSpaceOnUse">
                  <path d="M28 21 L0 5 v32.4 l28 16.2 l28 -16.2 V5 L28 21zm0 48.6 L0 53.6 v32.4 l28 16.2 l28 -16.2 V53.6 l-28 8.1z" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hex-pattern)" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950" />
        </div>
      )}
      {profile.bgPattern === 'neon-circuit' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05]" style={{ color: 'var(--profile-primary)' }}>
            <svg width="100%" height="100%">
              <defs>
                <pattern id="circuit-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M 0 40 L 80 40 M 40 0 L 40 80" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
                  <path d="M 10 10 L 30 10 L 40 20 L 40 40 M 40 40 L 50 50 L 70 50" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M 70 10 L 60 20 L 20 20 L 10 30" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M 10 70 L 30 70 L 50 50" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="10" cy="10" r="3" fill="currentColor" />
                  <circle cx="70" cy="50" r="3" fill="currentColor" />
                  <circle cx="70" cy="10" r="3" fill="currentColor" />
                  <circle cx="10" cy="30" r="3" fill="currentColor" />
                  <circle cx="10" cy="70" r="3" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950" />
        </div>
      )}

      {/* Cinematic Profile Header */}
      <div 
        className="relative rounded-3xl overflow-hidden mb-8 border border-zinc-800 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-[0_0_50px_var(--profile-primary-glow)] bg-cover bg-center transition-all duration-500"
        style={{
          backgroundImage: currentBanner 
            ? `linear-gradient(to bottom, rgba(9, 9, 11, 0.45) 0%, rgba(9, 9, 11, 0.9) 100%), url(${currentBanner})` 
            : `linear-gradient(to right, rgba(9, 9, 11, 0.6) 0%, rgba(9, 9, 11, 0.95) 100%), linear-gradient(135deg, ${currentPrimary}22 0%, ${currentSecondary}11 100%)`
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-30%,var(--profile-primary-glow),transparent_60%)] pointer-events-none" />
        
        {/* Dynamic Avatar Container */}
        <div className="relative shrink-0 select-none">
          {/* Pulsing Avatar Frame Glow Ring */}
          {profile.avatarFrame && profile.avatarFrame !== 'none' && (
            <div 
              className="absolute -inset-1.5 rounded-[28px] blur-sm animate-pulse z-0 transition-all duration-500"
              style={{
                background: profile.avatarFrame === 'neon-blue' 
                  ? 'linear-gradient(to right, #22d3ee, #06b6d4)'
                  : profile.avatarFrame === 'ember-glow'
                  ? 'linear-gradient(to right, #f97316, #ea580c)'
                  : profile.avatarFrame === 'cyber-pulsar'
                  ? 'linear-gradient(to right, #d946ef, #a21caf)'
                  : 'linear-gradient(to right, #eab308, #ca8a04)'
              }}
            />
          )}
          
          <div 
            className="w-24 h-24 md:w-28 md:h-28 rounded-3xl flex items-center justify-center font-extrabold text-3xl md:text-4xl text-white shadow-2xl relative group transition-all duration-350 overflow-hidden border-2 z-10"
            style={{ 
              boxShadow: profile.avatarFrame && profile.avatarFrame !== 'none' ? 'none' : `0 0 25px ${currentPrimary}40`,
              borderColor: profile.avatarFrame === 'neon-blue'
                ? '#22d3ee'
                : profile.avatarFrame === 'ember-glow'
                ? '#f97316'
                : profile.avatarFrame === 'cyber-pulsar'
                ? '#d946ef'
                : profile.avatarFrame === 'gold-particle'
                ? '#eab308'
                : `${currentPrimary}50`
            }}
          >
            {showEditProfileModal ? (
              editAvatar && editAvatar.startsWith('linear-gradient') ? (
                <div 
                  className="w-full h-full flex items-center justify-center font-bold text-white text-3xl select-none"
                  style={{ background: editAvatar }}
                >
                  {initials}
                </div>
              ) : (
                <img src={editAvatar} alt="" className="w-full h-full object-cover" />
              )
            ) : (
              profile.avatarUrl && profile.avatarUrl.startsWith('linear-gradient') ? (
                <div 
                  className="w-full h-full flex items-center justify-center font-bold text-white text-3xl select-none"
                  style={{ background: profile.avatarUrl }}
                >
                  {initials}
                </div>
              ) : (
                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              )
            )}
          </div>
        </div>

        {/* Profile Info Details */}
        <div className="flex-1 text-center md:text-left space-y-3 min-w-0 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              {profile.clanTag && (
                <span 
                  className="text-[10px] px-2 py-0.5 rounded border font-black uppercase tracking-wider select-none shrink-0"
                  style={{
                    borderColor: 'var(--profile-primary)',
                    color: 'var(--profile-primary)',
                    textShadow: '0 0 10px var(--profile-primary)',
                    boxShadow: '0 0 10px var(--profile-primary-glow)',
                    backgroundColor: 'var(--profile-primary)08'
                  }}
                >
                  [{profile.clanTag}]
                </span>
              )}
              {profile.name}
              <button 
                onClick={() => setShowEditProfileModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer select-none"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </h1>
            <span className="text-zinc-500 font-semibold text-sm">@{profile.username}</span>
          </div>

          {profile.customTitle && (
            <div 
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-xl w-max border select-none transition-all shadow-[0_0_15px_var(--profile-primary-glow)]"
              style={{
                borderColor: 'var(--profile-primary)',
                color: 'var(--profile-primary)',
                backgroundColor: 'var(--profile-primary)0a',
                textShadow: '0 0 8px var(--profile-primary)'
              }}
            >
              🛡️ {profile.customTitle}
            </div>
          )}

          <p className="text-zinc-400 text-xs md:text-sm max-w-xl leading-relaxed">
            {profile.bio}
          </p>

          {/* Social Stats Row */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 select-none">
            <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1.5 rounded-xl font-bold">
              🎮 {progress.ownedGames.length} Games Owned
            </span>
            <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1.5 rounded-xl font-bold">
              🏆 {totalUnlocked} Trophies Unlocked
            </span>
            <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl font-bold">
              🥇 {completedGames.length} Perfect Completions
            </span>
            {profile.steamId ? (
              <button
                onClick={handleSteamLibrarySync}
                disabled={isLibrarySyncing}
                className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3.5 py-1.5 rounded-xl font-black shadow-lg shadow-blue-500/20 flex items-center gap-1.5 transition-all hover:scale-102 hover:shadow-blue-500/35 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/20"
              >
                {isLibrarySyncing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    🔄 Sync with Steam
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="text-xs bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
              >
                🎮 Link Steam
              </button>
            )}
          </div>
        </div>

        {/* Level Widget Circle Card */}
        <div 
          className="glass-panel border border-zinc-800 rounded-3xl p-5 w-full md:w-64 flex flex-col items-center justify-center text-center shrink-0 shadow-inner select-none relative bg-zinc-900/30 transition-all duration-350"
          style={{
            borderColor: `${currentPrimary}20`,
            boxShadow: `inset 0 0 20px ${currentPrimary}08`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--profile-primary)]/5 to-[var(--profile-secondary)]/5 pointer-events-none" />
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
                className="transition-all duration-500"
                style={{ 
                  stroke: 'var(--profile-primary)',
                  filter: 'drop-shadow(0 0 4px var(--profile-primary))'
                }}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 - (213.6 * xpPercentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-black text-white">{level}</span>
              <span className="text-[8px] text-zinc-500 font-extrabold uppercase">Level</span>
            </div>
          </div>
          <h3 className="font-extrabold text-xs text-zinc-200">Hunter Rating</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            {trophiesNeededForNext} {trophiesNeededForNext === 1 ? 'trophy' : 'trophies'} to Level {level + 1} ({xpPercentage.toFixed(0)}% XP)
          </p>
        </div>

      </div>



      {/* Library Sync Alerts / Banners */}
      <AnimatePresence>
        {(librarySyncMessage || librarySyncError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 select-none"
          >
            {librarySyncMessage && (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4.5 rounded-3xl text-xs md:text-sm leading-relaxed shadow-[0_0_40px_rgba(16,185,129,0.08)]">
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0">✅</span>
                  <p className="font-extrabold">{librarySyncMessage}</p>
                </div>
                <button
                  onClick={() => setLibrarySyncMessage(null)}
                  className="p-1.5 hover:bg-emerald-500/15 rounded-xl transition-all text-emerald-400/70 hover:text-emerald-400 cursor-pointer shrink-0 ml-4"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {librarySyncError && (
              <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 text-red-400 p-4.5 rounded-3xl text-xs md:text-sm leading-relaxed shadow-[0_0_40px_rgba(239,68,68,0.08)]">
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0">⚠️</span>
                  <p className="font-extrabold">{librarySyncError}</p>
                </div>
                <button
                  onClick={() => setLibrarySyncError(null)}
                  className="p-1.5 hover:bg-red-500/15 rounded-xl transition-all text-red-400/70 hover:text-red-400 cursor-pointer shrink-0 ml-4"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs Menu Navigation */}
      <div className="flex border-b border-zinc-900 mb-8 select-none">
        {[
          { id: 'showcase', label: 'Showcase Shelf', count: showcasedAchievements.length },
          { id: 'cabinet', label: 'Trophy Cabinet', count: totalUnlocked },
          { id: 'posts', label: 'My Reviews & Posts', count: userPosts.length }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'showcase' | 'cabinet' | 'posts')}
              className={`px-5 py-3.5 text-xs font-extrabold tracking-wide uppercase border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'text-[var(--profile-primary)] font-black'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
              style={isActive ? { borderBottomColor: 'var(--profile-primary)' } : {}}
            >
              {tab.label} <span className="text-[10px] ml-1 bg-zinc-900 px-1.5 py-0.5 rounded-md font-semibold text-zinc-400">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Tabs Content Drawer */}
      <div>
        
        {/* Tab 1: Showcase Shelf */}
        {activeTab === 'showcase' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 
                  className="text-lg font-extrabold text-white flex items-center gap-2 select-none tracking-widest uppercase"
                  style={{
                    textShadow: '0 0 12px var(--profile-primary)',
                  }}
                >
                  <Award className="w-5 h-5" style={{ color: 'var(--profile-primary)', filter: 'drop-shadow(0 0 4px var(--profile-primary))' }} /> Proudest Achievements
                </h2>
                <p className="text-xs text-zinc-500 mt-1 select-none">Pin up to 4 achievements from your cabinet to show off on your public profile.</p>
              </div>
              <button
                onClick={() => setShowShowcaseEditor(true)}
                className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                style={{
                  color: 'var(--profile-primary)',
                  borderColor: 'var(--profile-primary)20',
                  backgroundColor: 'var(--profile-primary)08'
                }}
              >
                <Settings className="w-3.5 h-3.5" />
                Customize Shelf
              </button>
            </div>

            {/* Immersive Glass Shelf Container - Rebuilt into 3D Ledge with realistic SVG trophy cups */}
            <div 
              className="relative pt-8 pb-16 px-6 bg-zinc-950/40 border border-zinc-900 rounded-3xl flex flex-col justify-center items-center select-none overflow-hidden min-h-[220px] transition-all duration-500"
              style={{
                boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.6)',
                '--trophy-glow-platinum': 'rgba(56, 189, 248, 0.35)',
                '--trophy-border-platinum': '#0284c7',
                '--trophy-text-platinum': '#38bdf8',
                '--trophy-glow-gold': 'rgba(234, 179, 8, 0.35)',
                '--trophy-border-gold': '#ca8a04',
                '--trophy-text-gold': '#facc15',
                '--trophy-glow-silver': 'rgba(148, 163, 184, 0.25)',
                '--trophy-border-silver': '#94a3b8',
                '--trophy-text-silver': '#cbd5e1',
                '--trophy-glow-bronze': 'rgba(249, 115, 22, 0.25)',
                '--trophy-border-bronze': '#c2410c',
                '--trophy-text-bronze': '#fb923c'
              } as React.CSSProperties}
            >
              {/* LED Underglow at the back of the shelf */}
              <div 
                className="absolute bottom-[36px] left-8 right-8 h-8 blur-2xl opacity-35 rounded-full pointer-events-none transition-all duration-500"
                style={{
                  background: 'linear-gradient(to right, var(--profile-primary), var(--profile-secondary))'
                }}
              />
              
              {/* Thick 3D Glass Ledge / Slab */}
              {/* Ledge reflection */}
              <div 
                className="absolute bottom-[28px] left-6 right-6 h-[18px] rounded-lg border-t border-b border-white/10 backdrop-blur-md z-10"
                style={{
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
              />
              {/* Ledge front face (thick bezel) */}
              <div 
                className="absolute bottom-[20px] left-[26px] right-[26px] h-[8px] rounded-b-lg border-t border-zinc-850/80 z-10"
                style={{
                  background: 'linear-gradient(to bottom, rgba(9,9,11,0.9) 0%, rgba(24,24,27,0.95) 100%)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                }}
              />
              {/* Ledge active light strip (neon line on the ledge) */}
              <div 
                className="absolute bottom-[26px] left-8 right-8 h-[2px] blur-[1px] opacity-80 z-20"
                style={{
                  background: 'linear-gradient(to right, var(--profile-primary), var(--profile-secondary))'
                }}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl relative z-20">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const ach = showcasedAchievements[slotIdx];
                  if (!ach) {
                    return (
                      <div 
                        key={slotIdx}
                        onClick={() => setShowShowcaseEditor(true)}
                        className="relative flex flex-col items-center select-none group cursor-pointer"
                      >
                        <div className="relative flex flex-col items-center">
                          {/* Bobbing Motion for holographic placeholder */}
                          <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{
                              duration: 3.5,
                              repeat: Infinity,
                              repeatType: 'reverse',
                              ease: 'easeInOut',
                              delay: slotIdx * 0.3
                            }}
                            className="relative flex flex-col items-center"
                          >
                            {/* Dotted Wireframe SVG Pedestal */}
                            <svg viewBox="0 0 100 120" className="w-28 h-28 opacity-25 group-hover:opacity-50 transition-opacity duration-300">
                              <ellipse cx="50" cy="22" rx="20" ry="6" fill="none" stroke="var(--profile-primary)" strokeWidth="1" strokeDasharray="3 3" />
                              <ellipse cx="50" cy="90" rx="28" ry="8" fill="none" stroke="var(--profile-primary)" strokeWidth="1" strokeDasharray="3 3" />
                              <line x1="30" y1="22" x2="22" y2="90" stroke="var(--profile-primary)" strokeWidth="1" strokeDasharray="3 3" />
                              <line x1="70" y1="22" x2="78" y2="90" stroke="var(--profile-primary)" strokeWidth="1" strokeDasharray="3 3" />
                              <line x1="50" y1="28" x2="50" y2="82" stroke="var(--profile-primary)" strokeWidth="0.5" strokeDasharray="2 2" />
                              <rect x="22" y="90" width="56" height="10" rx="2" fill="none" stroke="var(--profile-primary)" strokeWidth="1" strokeDasharray="3 3" />
                            </svg>
                            
                            {/* Floating Neon Plus sign above the pedestal */}
                            <div 
                              className="absolute top-[28px] w-9 h-9 rounded-full border border-dashed border-[var(--profile-primary)] flex items-center justify-center bg-zinc-950/80 group-hover:scale-110 transition-transform duration-300"
                              style={{
                                boxShadow: '0 0 10px var(--profile-primary-glow)',
                                borderColor: 'var(--profile-primary)'
                              }}
                            >
                              <Plus className="w-4 h-4" style={{ color: 'var(--profile-primary)' }} />
                            </div>
                            
                            <div className="mt-2 text-center select-none">
                              <h4 className="font-extrabold text-[10px] text-zinc-550 group-hover:text-zinc-400 transition-colors uppercase tracking-wider">Empty Slot</h4>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={ach.id}
                      className="relative flex flex-col items-center select-none group cursor-pointer"
                      onClick={() => setShowShowcaseEditor(true)}
                    >
                      <div className="relative flex flex-col items-center">
                        {/* Bobbing Motion Container */}
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            ease: 'easeInOut',
                            delay: slotIdx * 0.4
                          }}
                          className="relative flex flex-col items-center"
                        >
                          {/* Glow Behind the Trophy */}
                          <div 
                            className="absolute -top-4 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none transition-all duration-300 group-hover:opacity-40" 
                            style={{
                              background: `var(--trophy-glow-${ach.tier})`
                            }}
                          />
                          
                          {/* 3D SVG Trophy Cup */}
                          <svg viewBox="0 0 100 120" className="w-28 h-28 drop-shadow-[0_12px_20px_rgba(0,0,0,0.65)] hover:scale-105 transition-transform duration-350 cursor-pointer">
                            <defs>
                              <linearGradient id="platinum-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#e2e8f0" />
                                <stop offset="30%" stopColor="#cbd5e1" />
                                <stop offset="65%" stopColor="#38bdf8" />
                                <stop offset="100%" stopColor="#0284c7" />
                              </linearGradient>
                              <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fef08a" />
                                <stop offset="30%" stopColor="#facc15" />
                                <stop offset="65%" stopColor="#ca8a04" />
                                <stop offset="100%" stopColor="#854d0e" />
                              </linearGradient>
                              <linearGradient id="silver-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f8fafc" />
                                <stop offset="30%" stopColor="#e2e8f0" />
                                <stop offset="65%" stopColor="#94a3b8" />
                                <stop offset="100%" stopColor="#475569" />
                              </linearGradient>
                              <linearGradient id="bronze-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#ffedd5" />
                                <stop offset="30%" stopColor="#fb923c" />
                                <stop offset="65%" stopColor="#c2410c" />
                                <stop offset="100%" stopColor="#7c2d12" />
                              </linearGradient>
                              
                              <linearGradient id="obsidian-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#27272a" />
                                <stop offset="40%" stopColor="#09090b" />
                                <stop offset="100%" stopColor="#18181b" />
                              </linearGradient>
                            </defs>
                            
                            {/* Handles */}
                            <path d="M 28 32 C 10 32, 10 62, 28 62 L 28 56 C 16 56, 16 38, 28 38 Z" fill={`url(#${ach.tier}-grad)`} filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))" />
                            <path d="M 72 32 C 90 32, 90 62, 72 62 L 72 56 C 84 56, 84 38, 72 38 Z" fill={`url(#${ach.tier}-grad)`} filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))" />
                            
                            {/* Stem / Stand */}
                            <path d="M 46 68 L 54 68 L 57 84 L 43 84 Z" fill={`url(#${ach.tier}-grad)`} />
                            
                            {/* Trophy base pedestal (layered obsidian block) */}
                            <rect x="22" y="92" width="56" height="16" rx="3" fill="#09090b" />
                            <rect x="22" y="84" width="56" height="10" rx="3" fill="url(#obsidian-grad)" stroke="#3f3f46" strokeWidth="0.5" />
                            
                            {/* Metal Plaque */}
                            <rect x="30" y="87" width="40" height="5" rx="1.5" fill={`url(#${ach.tier}-grad)`} />
                            
                            {/* Plaque text simulation */}
                            <rect x="34" y="89" width="32" height="1" rx="0.5" fill="rgba(0,0,0,0.5)" />
                            
                            {/* Cup Bowl */}
                            <path d="M 30 22 L 70 22 C 70 52, 62 68, 50 68 C 38 68, 30 52, 30 22 Z" fill={`url(#${ach.tier}-grad)`} />
                            <path d="M 32 24 L 68 24 C 68 48, 61 63, 50 63 C 39 63, 32 48, 32 24 Z" fill="rgba(0,0,0,0.18)" />
                          </svg>
                          
                          {/* Nested Achievement Icon in the Cup Bowl */}
                          <div 
                            className="absolute top-[22px] w-9 h-9 rounded-full overflow-hidden border border-zinc-950 shadow-[0_3px_6px_rgba(0,0,0,0.5)] flex items-center justify-center bg-zinc-900 group-hover:scale-110 transition-transform duration-300"
                            style={{
                              boxShadow: `0 0 12px var(--trophy-glow-${ach.tier})`
                            }}
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
                                      className="w-full h-full object-cover" 
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

                          {/* Label and Info under the pedestal */}
                          <div className="mt-2 text-center max-w-[130px] select-text">
                            <h4 className="font-extrabold text-[11px] text-zinc-100 truncate w-full" title={ach.title}>{ach.title}</h4>
                            <div className="flex items-center justify-center gap-1 mt-0.5 select-none">
                              <span 
                                className="text-[8px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded border leading-none bg-zinc-950/60"
                                style={{
                                  borderColor: `var(--trophy-border-${ach.tier})`,
                                  color: `var(--trophy-text-${ach.tier})`
                                }}
                              >
                                {ach.tier}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Favorite Game Spotlight Widget */}
            {profile.spotlightGameId && spotlightGame && (() => {
              const gameCustom = progress.customAchievements?.[spotlightGame.id] || [];
              const gameAchievements = gameCustom.length > 0 ? gameCustom : spotlightGame.achievements;
              const totalGameAchievements = gameAchievements.length;
              const unlockedGameAchievements = gameAchievements.filter(ach => !!progress.unlockedAchievements[ach.id]);
              const unlockedGameCount = unlockedGameAchievements.length;
              const completionRate = totalGameAchievements > 0 ? (unlockedGameCount / totalGameAchievements) * 100 : 0;
              const playtimeHours = progress.playtimes[spotlightGame.id] || 0;

              return (
                <div className="mt-12 space-y-6">
                  <div>
                    <h2 
                      className="text-lg font-extrabold text-white flex items-center gap-2 select-none tracking-widest uppercase"
                      style={{
                        textShadow: '0 0 12px var(--profile-primary)',
                      }}
                    >
                      <Sparkles className="w-5 h-5" style={{ color: 'var(--profile-primary)', filter: 'drop-shadow(0 0 4px var(--profile-primary))' }} /> Favorite Game Spotlight
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1 select-none">Your absolute favorite title spotlighted with cinematic stats and completion progress.</p>
                  </div>

                  <div 
                    className="relative rounded-3xl overflow-hidden border border-zinc-800 p-6 md:p-8 flex flex-col lg:flex-row items-center lg:items-stretch gap-8 shadow-[0_0_50px_rgba(0,0,0,0.55)] transition-all duration-500"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(9, 9, 11, 0.96) 0%, rgba(9, 9, 11, 0.8) 50%, rgba(9, 9, 11, 0.96) 100%), url(${spotlightGame.bannerUrl || spotlightGame.coverUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* Subtle theme overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-30%,var(--profile-primary-glow),transparent_70%)] pointer-events-none" />

                    {/* Left side: Cover & Circular gauge */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0 z-10 select-none">
                      <img 
                        src={spotlightGame.coverUrl} 
                        alt={spotlightGame.title} 
                        className="w-28 h-40 object-cover rounded-2xl border border-zinc-800 shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                      />
                      
                      {/* Circular Playtime / Completion Gauge */}
                      <div className="relative w-36 h-36 flex items-center justify-center bg-zinc-950/70 rounded-full border border-zinc-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                          <circle
                            cx="72"
                            cy="72"
                            r="62"
                            className="stroke-zinc-900"
                            strokeWidth="6"
                            fill="transparent"
                          />
                          <circle
                            cx="72"
                            cy="72"
                            r="62"
                            className="transition-all duration-1000"
                            style={{ 
                              stroke: 'var(--profile-primary)',
                              filter: 'drop-shadow(0 0 5px var(--profile-primary))'
                            }}
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray="389.55"
                            strokeDashoffset={389.55 - (389.55 * completionRate) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                        
                        <div className="flex flex-col items-center justify-center text-center">
                          <span className="text-2xl font-black text-white tracking-tight">{playtimeHours.toFixed(1)}h</span>
                          <span className="text-[8px] text-zinc-500 font-extrabold uppercase tracking-wider mt-0.5">Playtime</span>
                          <span className="text-[10px] text-emerald-400 font-black mt-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">{completionRate.toFixed(0)}% Clear</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Game Details & Achievement Grid */}
                    <div className="flex-1 flex flex-col justify-between text-left z-10 w-full">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 
                            className="text-xl md:text-2xl font-black text-white tracking-tight leading-none"
                            style={{ textShadow: '0 0 20px var(--profile-primary-glow)' }}
                          >
                            {spotlightGame.title}
                          </h3>
                          <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider select-none">
                            🎮 {spotlightGame.platforms.join(', ')}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs font-semibold select-none">
                          Developer: <span className="text-zinc-200">{spotlightGame.developer}</span> &bull; Released: <span className="text-zinc-200">{spotlightGame.releaseYear}</span>
                        </p>
                        <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">
                          {spotlightGame.description}
                        </p>
                      </div>

                      {/* Achievement locked/unlocked grid */}
                      <div className="mt-5 space-y-2">
                        <div className="flex items-center justify-between select-none">
                          <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider">
                            🏆 Trophies Unlocked ({unlockedGameCount} / {totalGameAchievements})
                          </span>
                          <span className="text-[8px] text-zinc-500 font-bold uppercase">
                            Showing first 8 achievements
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          {gameAchievements.slice(0, 8).map(ach => {
                            const isUnlocked = !!progress.unlockedAchievements[ach.id];
                            return (
                              <div 
                                key={ach.id}
                                className={`w-11 h-11 rounded-xl border flex items-center justify-center relative group transition-all duration-200 ${
                                  isUnlocked 
                                    ? 'border-zinc-800 bg-zinc-950/80 shadow-[0_4px_10px_rgba(0,0,0,0.6)] opacity-100 hover:scale-105' 
                                    : 'border-zinc-900 bg-zinc-950/20 opacity-30 hover:opacity-50'
                                }`}
                                title={`${ach.title} (${ach.tier}) - ${isUnlocked ? 'Unlocked' : 'Locked'}: ${ach.description}`}
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
                                          alt="" 
                                          className="w-full h-full object-cover rounded-lg" 
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
                                {isUnlocked && (
                                  <span 
                                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-zinc-950 flex items-center justify-center text-[7px] font-black font-sans`}
                                    style={{
                                      backgroundColor: ach.tier === 'platinum' ? '#00f0ff' : ach.tier === 'gold' ? '#ca8a04' : ach.tier === 'silver' ? '#94a3b8' : '#7c2d12'
                                    }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab 2: Trophy Cabinet */}
        {activeTab === 'cabinet' && (
          <div className="space-y-6">
            
            {/* Stat Counters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
              {[
                { label: 'Platinum Trophies', value: platinumCount, color: 'text-cyan-400 bg-cyan-950/20 border-cyan-800/40', icon: '🏆' },
                { label: 'Gold Trophies', value: goldCount, color: 'text-yellow-400 bg-yellow-950/20 border-yellow-800/40', icon: '🥇' },
                { label: 'Silver Trophies', value: silverCount, color: 'text-slate-300 bg-slate-850/40 border-slate-700/40', icon: '🥈' },
                { label: 'Bronze Trophies', value: bronzeCount, color: 'text-amber-500 bg-amber-950/20 border-amber-900/40', icon: '🥉' }
              ].map(stat => (
                <div key={stat.label} className={`glass-panel border rounded-3xl p-5 flex items-center gap-4 ${stat.color}`}>
                  <span className="text-3xl">{stat.icon}</span>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-black text-white mt-0.5">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Perfect completions grid */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-wider flex items-center gap-2 select-none">
                🏅 Perfect Completions ({completedGames.length})
              </h3>
              {completedGames.length === 0 ? (
                <p className="text-xs text-zinc-500 italic select-none">Unlock all achievements in any added game to achieve 100% completion!</p>
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
                          <p className="text-[10px] text-zinc-500 font-semibold mt-1">
                            Developer: {game.developer}
                          </p>
                          {(() => {
                            const custom = progress.customAchievements?.[game.id] || [];
                            const achievements = custom.length > 0 ? custom : game.achievements;
                            return (
                              <span className="inline-block text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black mt-2 uppercase">
                                💯 100% Achievements ({achievements.length}/{achievements.length})
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: My Reviews & Posts */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {userPosts.length === 0 ? (
              <div className="glass-panel border border-zinc-900 rounded-3xl p-12 text-center select-none">
                <p className="text-zinc-500 text-xs italic">You haven&apos;t written any community reviews or guides yet.</p>
                <Link href="/social" className="inline-block text-xs text-blue-400 font-extrabold hover:underline mt-2" style={{ color: 'var(--profile-primary)' }}>
                  Visit Social Hub to publish first post →
                </Link>
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
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-zinc-600" /> {post.likes} Likes</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-zinc-600" /> {post.comments.length} Comments</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Edit Profile Dialog Modal */}
      <AnimatePresence>
        {showEditProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditProfileModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl z-10 flex flex-col gap-6 text-zinc-100 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 select-none">
                <h2 className="text-lg font-black text-white flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5" style={{ color: 'var(--profile-primary)' }} /> Customize Hunter Identity
                </h2>
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditProfileSubmit} className="space-y-6 text-left">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  
                  {/* Left Column: Persona & Identity */}
                  <div className="space-y-5">
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-850 pb-2 flex items-center gap-2 select-none">
                      👤 Hunter Persona
                    </h3>

                    {/* Avatar & Banner Uploaders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Avatar Upload */}
                      <div className="bg-zinc-950/40 p-4 border border-zinc-850 rounded-2xl flex flex-col gap-3">
                        <label className="block text-[10px] text-zinc-500 font-extrabold uppercase select-none">Avatar Picture</label>
                        <div className="flex gap-4 items-center">
                          <div className="relative group w-20 h-20 rounded-2xl overflow-hidden border border-zinc-800 shrink-0 bg-zinc-950 flex items-center justify-center shadow-lg">
                            {editAvatar && editAvatar.startsWith('linear-gradient') ? (
                              <div className="w-full h-full flex items-center justify-center font-extrabold text-white text-xl" style={{ background: editAvatar }}>
                                {initials}
                              </div>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={editAvatar} className="w-full h-full object-cover" alt="" />
                            )}
                            <button
                              type="button"
                              onClick={() => avatarFileInputRef.current?.click()}
                              className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-extrabold transition-all cursor-pointer select-none"
                            >
                              <Upload className="w-4 h-4 mb-0.5" /> Replace
                            </button>
                          </div>
                          <input 
                            type="file" 
                            ref={avatarFileInputRef} 
                            onChange={(e) => handleFileChange(e, 'avatar')} 
                            accept="image/*" 
                            className="hidden" 
                          />
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => avatarFileInputRef.current?.click()}
                              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 font-bold rounded-lg cursor-pointer flex items-center gap-1 select-none transition-all hover:scale-102"
                            >
                              <Upload className="w-3.5 h-3.5 text-zinc-450" /> Upload
                            </button>
                            {!(editAvatar && editAvatar.startsWith('linear-gradient')) && (
                              <button
                                type="button"
                                onClick={() => {
                                  const activePreset = THEME_PRESETS.find(p => p.name === editThemePreset) || THEME_PRESETS[0];
                                  setEditAvatar(activePreset.gradient);
                                }}
                                className="px-3 py-1.5 border border-red-950 bg-red-950/20 hover:bg-red-650 hover:text-white border-red-500/20 text-red-400 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 select-none transition-all hover:scale-102"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Gradient
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[8px] text-zinc-500">Max size 1MB. Base64 encoded.</p>
                      </div>

                      {/* Banner Upload */}
                      <div className="bg-zinc-950/40 p-4 border border-zinc-850 rounded-2xl flex flex-col gap-3">
                        <label className="block text-[10px] text-zinc-500 font-extrabold uppercase select-none">Profile Banner</label>
                        <div className="flex flex-col gap-2.5">
                          <div className="relative group w-full h-20 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center shadow-lg">
                            {editBanner ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={editBanner} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 text-[10px] font-bold bg-gradient-to-tr from-zinc-900 to-zinc-950 gap-1 select-none">
                                <ImageIcon className="w-4 h-4 text-zinc-550" /> Default Banner
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => bannerFileInputRef.current?.click()}
                              className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-extrabold transition-all cursor-pointer select-none"
                            >
                              <Upload className="w-4 h-4 mb-0.5" /> Upload Banner
                            </button>
                          </div>
                          <input 
                            type="file" 
                            ref={bannerFileInputRef} 
                            onChange={(e) => handleFileChange(e, 'banner')} 
                            accept="image/*" 
                            className="hidden" 
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => bannerFileInputRef.current?.click()}
                              className="flex-1 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1 select-none transition-all hover:scale-102"
                            >
                              <Upload className="w-3.5 h-3.5 text-zinc-450" /> Upload
                            </button>
                            {editBanner && (
                              <button
                                type="button"
                                onClick={() => setEditBanner('')}
                                className="px-2.5 py-1.5 border border-red-950 bg-red-950/20 hover:bg-red-650 hover:text-white border-red-500/20 text-red-400 text-[10px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1 select-none transition-all hover:scale-102"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[8px] text-zinc-500">Max size 1.5MB. Base64 encoded.</p>
                      </div>
                    </div>

                    {/* Hunter Name & Clan Tag side-by-side */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-1.5">
                        <label className="block text-[10px] text-zinc-500 font-extrabold uppercase select-none">Hunter Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3.5 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                          maxLength={30}
                          required
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-zinc-500 font-extrabold uppercase select-none">Clan Tag</label>
                        <input
                          type="text"
                          value={editClanTag}
                          onChange={(e) => setEditClanTag(e.target.value.toUpperCase())}
                          placeholder="e.g. M3GZ"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3.5 text-sm text-white placeholder-zinc-750 focus:outline-none focus:border-blue-500 transition-all font-semibold uppercase font-mono"
                          maxLength={8}
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-zinc-500 font-extrabold uppercase select-none">Custom Bio</label>
                      <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3.5 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-blue-500 resize-none h-24 transition-all leading-relaxed"
                        maxLength={150}
                        required
                      />
                    </div>

                    {/* Avatar Frame Glow Customizer */}
                    <div className="space-y-3">
                      <label className="block text-[10px] text-zinc-550 font-extrabold uppercase flex items-center gap-1.5 select-none">
                        ✨ Avatar Frame Glow
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 select-none">
                        {[
                          { id: 'none', label: 'None', glow: 'none', requiredStreak: 0 },
                          { id: 'neon-blue', label: 'Neon Blue', glow: '#22d3ee', requiredStreak: 3 },
                          { id: 'ember-glow', label: 'Ember Glow', glow: '#f97316', requiredStreak: 7 },
                          { id: 'cyber-pulsar', label: 'Cyber Pulsar', glow: '#d946ef', requiredStreak: 15 },
                          { id: 'gold-particle', label: 'Gold Particles', glow: '#eab308', requiredStreak: 15 }
                        ].map(frame => {
                          const isUnlocked = progress.streakCount >= frame.requiredStreak;
                          const isActive = editAvatarFrame === frame.id;
                          return (
                            <div key={frame.id} className="relative group/tooltip">
                              <button
                                type="button"
                                disabled={!isUnlocked}
                                onClick={() => isUnlocked && setEditAvatarFrame(frame.id as 'neon-blue' | 'ember-glow' | 'cyber-pulsar' | 'gold-particle' | 'none')}
                                className={`w-full relative py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-2 hover:scale-102 hover:shadow-md transition-all cursor-pointer h-16 ${
                                  !isUnlocked 
                                    ? 'border-zinc-900 bg-zinc-950/20 text-zinc-650 opacity-40 cursor-not-allowed'
                                    : isActive
                                      ? 'border-white bg-zinc-950 shadow-md ring-2 ring-blue-500/30'
                                      : 'border-zinc-850 bg-zinc-950/40 text-zinc-400 hover:border-zinc-800'
                                }`}
                              >
                                <div 
                                  className="w-4 h-4 rounded-full border border-zinc-850"
                                  style={{
                                    backgroundColor: frame.glow === 'none' ? '#18181b' : frame.glow,
                                    boxShadow: frame.glow === 'none' ? 'none' : `0 0 10px ${frame.glow}`
                                  }}
                                />
                                <span className="text-[10px] font-black tracking-wide leading-none flex items-center gap-0.5">
                                  {frame.label} {!isUnlocked && '🔒'}
                                </span>
                                {isActive && isUnlocked && (
                                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-md">
                                    <Check className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </button>
                              
                              {!isUnlocked && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-zinc-950 border border-zinc-800 text-zinc-400 p-2 rounded-lg shadow-xl text-[9px] font-bold text-center pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50 leading-relaxed">
                                  🔒 Locked: Requires a {frame.requiredStreak}-day streak. (Current: {progress.streakCount} days)
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Favorite Game Spotlight Dropdown Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-zinc-500 font-extrabold uppercase select-none">Favorite Game Spotlight</label>
                      {progress.ownedGames.length === 0 ? (
                        <div className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-500 select-none">
                          Add games to your library first to select a spotlight game!
                        </div>
                      ) : (
                        <select
                          value={editSpotlightGameId}
                          onChange={(e) => setEditSpotlightGameId(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                        >
                          <option value="">None (Hide Spotlight Widget)</option>
                          {PRELOADED_GAMES
                            .filter(game => progress.ownedGames.includes(game.id))
                            .map(game => (
                              <option key={game.id} value={game.id}>
                                {game.title}
                              </option>
                            ))
                          }
                        </select>
                      )}
                    </div>

                    {/* Hunter Legacy Title */}
                    <div className="bg-zinc-950/40 p-5 border border-zinc-850 rounded-2xl space-y-4">
                      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 select-none">
                        🛡️ Hunter Title
                      </h4>
                      
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-zinc-500 font-extrabold uppercase select-none">Hunter Legacy Title</label>
                        <input
                          type="text"
                          value={editCustomTitle}
                          onChange={(e) => setEditCustomTitle(e.target.value)}
                          placeholder="e.g. Grandmaster Completionist"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                          maxLength={35}
                        />
                      </div>
                    </div>

                    {/* Steam Connection */}
                    <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 space-y-3 relative overflow-hidden select-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                          🎮 Steam Account Link
                        </span>
                        {profile.steamId ? (
                          <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black uppercase">
                            Connected
                          </span>
                        ) : (
                          <span className="text-[8px] bg-zinc-900 border border-zinc-850 text-zinc-500 px-2 py-0.5 rounded font-bold uppercase">
                            Not Linked
                          </span>
                        )}
                      </div>

                      {profileSyncError && (
                        <div className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl leading-relaxed">
                          ⚠️ {profileSyncError}
                        </div>
                      )}
                      {profileSyncSuccess && (
                        <div className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl leading-relaxed">
                          ✅ Steam profile details synchronized!
                        </div>
                      )}

                      {profile.steamId ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="text-[9px] text-zinc-500 font-semibold uppercase">Connected Steam ID</p>
                              <p className="text-xs font-mono text-zinc-300 truncate tracking-wide">
                                {profile.steamId.substring(0, 5)}*****{profile.steamId.substring(12)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleDisconnectSteam}
                              className="px-3 py-2 border border-red-500/20 hover:border-red-500 bg-red-950/10 hover:bg-red-600 hover:text-white text-red-400 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer select-none"
                            >
                              Disconnect
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3.5">
                            <button
                              type="button"
                              disabled={isProfileSyncing}
                              onClick={handleManualSyncProfile}
                              className={`py-2.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                isProfileSyncing ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {isProfileSyncing ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                  Syncing Profile...
                                </>
                              ) : (
                                <>
                                  🔄 Sync Profile
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={isLibrarySyncing}
                              onClick={handleSteamLibrarySync}
                              className={`py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                isLibrarySyncing ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {isLibrarySyncing ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Syncing Games...
                                </>
                              ) : (
                                <>
                                  🎮 Sync Games
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-[10px] text-zinc-500 leading-relaxed">
                            Sign in through Steam to automatically synchronize your Steam name, avatar picture, and enable automated achievements tracking!
                          </p>
                          
                          <a
                            href="/api/steam/auth"
                            className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white rounded-xl text-xs font-bold transition-all hover:scale-102 flex items-center justify-center gap-2 select-none shadow cursor-pointer bg-gradient-to-r from-zinc-900 to-zinc-950"
                          >
                            <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                              <path d="M12 0C5.372 0 0 5.372 0 12c0 5.86 4.21 10.74 9.73 11.82l-1.39-3.79c-.19-.53-.01-1.12.42-1.47l2.84-2.31c.36-.29.47-.79.25-1.2l-.76-1.42c-.22-.41-.7-.64-1.16-.54l-3.32.74c-.46.1-.92-.12-1.12-.54l-.45-.96c-.2-.42-.06-.93.31-1.19l3.52-2.5c.37-.26.5-.76.31-1.18l-.51-1.11a.986.986 0 0 0-1.18-.53l-3.32.96c-.46.13-.94-.13-1.07-.6l-.14-.49c-.13-.46.13-.94.6-1.07l3.32-.96c.46-.13.78-.58.74-1.05v-.19c-.04-.47.26-.9.71-1.02l2.36-.62c.45-.12.92.14 1.04.59l.52 1.93c.12.45.58.73 1.04.6l3.32-.96c.46-.13.94.13 1.07.6l.14.49c.13.46-.13.94-.6 1.07l-3.32.96a.986.986 0 0 0-.74 1.05v.19c.04.47-.26.9-.71 1.02l-2.36.62a.98.98 0 0 0-1.04-.59l-.52-1.93c-.12-.45-.58-.73-1.04-.6l-3.32.96c-.46.13-.94-.13-1.07-.6l-.14-.49c-.13-.46.13-.94.6-1.07l3.32-.96c.46-.13.78-.58.74-1.05v-.19c-.04-.47.26-.9.71-1.02l-2.36.62c-.11.03-.23.05-.34.05zm.18 11.23c1.19 0 2.15.96 2.15 2.15S13.37 15.53 12.18 15.53s-2.15-.96-2.15-2.15 1.15-2.15 2.15-2.15z"/>
                            </svg>
                            Sign in through Steam
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Theme Settings & Pickers */}
                  <div className="space-y-5">
                    <h3 className="text-[10px] font-black text-zinc-450 uppercase tracking-widest border-b border-zinc-850 pb-2 flex items-center gap-2 select-none">
                      🎨 Color Theme & Presets
                    </h3>

                    {/* Presets Theme Selector */}
                    <div className="space-y-3">
                      <label className="block text-[10px] text-zinc-550 font-extrabold uppercase flex items-center gap-1.5 select-none">
                        <Palette className="w-4 h-4 text-zinc-450" /> Choose Gaming Preset Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {THEME_PRESETS.map((preset) => {
                          const isActive = editThemePreset === preset.name;
                          
                          const handlePresetClick = () => {
                            setEditThemePreset(preset.name);
                            setEditPrimaryColor(preset.primary);
                            setEditSecondaryColor(preset.secondary);
                            if (editAvatar && editAvatar.startsWith('linear-gradient')) {
                              setEditAvatar(preset.gradient);
                            }
                          };

                          return (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={handlePresetClick}
                              className={`relative py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-2 hover:scale-102 hover:shadow-md transition-all cursor-pointer h-16 ${
                                isActive
                                  ? 'border-white bg-zinc-950 shadow-md ring-2 ring-blue-500/30'
                                  : 'border-zinc-850 bg-zinc-950/40 text-zinc-400 hover:border-zinc-800'
                              }`}
                            >
                              <div className="w-full h-3 rounded-md shadow-inner" style={{ background: preset.gradient }} />
                              <span className="text-[10px] font-black tracking-wide leading-none">{preset.name}</span>
                              {isActive && (
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-md">
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Theme Color Pickers */}
                    <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4.5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-450 font-black uppercase tracking-wider flex items-center gap-1.5 select-none">
                          🎨 Custom Theme Color Pickers
                        </span>
                        {editThemePreset === 'Custom' ? (
                          <span className="text-[8px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-black uppercase select-none">
                            Active Custom Mode
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditThemePreset('Custom');
                              if (editAvatar && editAvatar.startsWith('linear-gradient')) {
                                setEditAvatar(`linear-gradient(135deg, ${editPrimaryColor} 0%, ${editSecondaryColor} 100%)`);
                              }
                            }}
                            className="px-2 py-1 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:text-white text-zinc-450 text-[9px] font-extrabold rounded-lg cursor-pointer select-none transition-all hover:scale-102"
                          >
                            Enable Customizer
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] text-zinc-500 font-bold uppercase select-none">Primary Color</label>
                          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2">
                            <input 
                              type="color" 
                              value={editPrimaryColor} 
                              onChange={(e) => {
                                const newPrimary = e.target.value;
                                setEditPrimaryColor(newPrimary);
                                setEditThemePreset('Custom');
                                if (editAvatar && editAvatar.startsWith('linear-gradient')) {
                                  setEditAvatar(`linear-gradient(135deg, ${newPrimary} 0%, ${editSecondaryColor} 100%)`);
                                }
                              }}
                              className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                            />
                            <span className="text-xs font-mono text-zinc-300 font-black uppercase tracking-wider">{editPrimaryColor}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] text-zinc-500 font-bold uppercase select-none">Secondary Color</label>
                          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2">
                            <input 
                              type="color" 
                              value={editSecondaryColor} 
                              onChange={(e) => {
                                const newSecondary = e.target.value;
                                setEditSecondaryColor(newSecondary);
                                setEditThemePreset('Custom');
                                if (editAvatar && editAvatar.startsWith('linear-gradient')) {
                                  setEditAvatar(`linear-gradient(135deg, ${editPrimaryColor} 0%, ${newSecondary} 100%)`);
                                }
                              }}
                              className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                            />
                            <span className="text-xs font-mono text-zinc-300 font-black uppercase tracking-wider">{editSecondaryColor}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Page Background Atmosphere Selector */}
                    <div className="space-y-3">
                      <label className="block text-[10px] text-zinc-550 font-extrabold uppercase flex items-center gap-1.5 select-none">
                        ✨ Page Background Atmosphere
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 select-none">
                        {[
                          { id: 'clean', label: 'Clean Dark', icon: '⬛', requiredStreak: 0 },
                          { id: 'cyber-grid', label: 'Cyber Grid', icon: '🌐', requiredStreak: 0 },
                          { id: 'scanlines', label: 'CRT Scanlines', icon: '📺', requiredStreak: 0 },
                          { id: 'constellations', label: 'Star Dust', icon: '✨', requiredStreak: 0 },
                          { id: 'hex-grid', label: 'Hex Grid', icon: '⬢', requiredStreak: 15 },
                          { id: 'neon-circuit', label: 'Neon Circuit', icon: '🔌', requiredStreak: 15 }
                        ].map(pattern => {
                          const isUnlocked = progress.streakCount >= pattern.requiredStreak;
                          const isActive = editBgPattern === pattern.id;
                          return (
                            <div key={pattern.id} className="relative group/tooltip">
                              <button
                                type="button"
                                disabled={!isUnlocked}
                                onClick={() => isUnlocked && setEditBgPattern(pattern.id as 'clean' | 'cyber-grid' | 'scanlines' | 'constellations' | 'hex-grid' | 'neon-circuit')}
                                className={`w-full relative py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-2 hover:scale-102 hover:shadow-md transition-all cursor-pointer h-16 ${
                                  !isUnlocked 
                                    ? 'border-zinc-900 bg-zinc-950/20 text-zinc-650 opacity-40 cursor-not-allowed'
                                    : isActive
                                      ? 'border-white bg-zinc-950 shadow-md ring-2 ring-blue-500/30'
                                      : 'border-zinc-850 bg-zinc-950/40 text-zinc-400 hover:border-zinc-800'
                                }`}
                              >
                                <span className="text-lg">{pattern.icon}</span>
                                <span className="text-[10px] font-black tracking-wide leading-none flex items-center gap-0.5">
                                  {pattern.label} {!isUnlocked && '🔒'}
                                </span>
                                {isActive && isUnlocked && (
                                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-md">
                                    <Check className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </button>
                              
                              {!isUnlocked && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-zinc-950 border border-zinc-800 text-zinc-400 p-2 rounded-lg shadow-xl text-[9px] font-bold text-center pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50 leading-relaxed">
                                  🔒 Locked: Requires a 15-day achievement streak to unlock this circuit skin! (Current streak: {progress.streakCount} days)
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>


                  </div>

                </div>

                {/* Modal Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 select-none">
                  <button
                    type="button"
                    onClick={() => setShowEditProfileModal(false)}
                    className="px-5 py-2.5 bg-zinc-950 border border-zinc-850 text-zinc-450 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer hover:bg-zinc-900 hover:scale-102"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-900/10 hover:shadow-blue-900/25 transition-all cursor-pointer hover:scale-102"
                    style={{ backgroundColor: 'var(--profile-primary)', borderColor: 'var(--profile-primary)' }}
                  >
                    Save Identity Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Showcase shelf Customizer Editor Modal */}
      <AnimatePresence>
        {showShowcaseEditor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShowcaseEditor(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl z-10 flex flex-col gap-4 text-zinc-100 max-h-[80vh]"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-500 animate-pulse" /> Edit Showcase Shelf
                </h2>
                <button
                  onClick={() => setShowShowcaseEditor(false)}
                  className="p-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-zinc-400 bg-zinc-950/40 p-3 rounded-2xl border border-zinc-850/60 select-none">
                Select or unselect unlocked achievements below. Pinned achievements are capped at **4 slots**.
              </div>

              {/* Grid of locked vs unlocked, focus on unlocked */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[250px]">
                <h3 className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider select-none">Your Unlocked Achievements ({unlockedAchievementsList.length})</h3>
                {unlockedAchievementsList.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-zinc-850 rounded-2xl select-none">
                    <p className="text-xs text-zinc-500 italic">You haven&apos;t unlocked any trophies to showcase yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {unlockedAchievementsList.map(ach => {
                      const isPinned = profile.showcasedAchievements?.some(id => getBaseId(id) === getBaseId(ach.id));
                      
                      const handleToggleShowcase = () => {
                        toggleShowcase(ach.id);
                      };

                      return (
                        <div 
                          key={ach.id}
                          onClick={handleToggleShowcase}
                          className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer select-none transition-all ${
                            isPinned
                              ? 'bg-blue-600/10 border-blue-500 text-blue-300'
                              : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {(() => {
                              const icon = ach.iconUrl?.trim() || '';
                              const isUrl = icon.startsWith('http') || icon.startsWith('//') || icon.includes('/') || icon.includes('.');
                              if (isUrl) {
                                return (
                                  <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                      src={icon.startsWith('//') ? `https:${icon}` : icon} 
                                      alt="" 
                                      className="w-8 h-8 object-contain rounded-lg shrink-0" 
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                                        if (fallback) fallback.classList.remove('hidden');
                                      }}
                                    />
                                    <span className="fallback-icon hidden text-2xl">🏆</span>
                                  </>
                                );
                              }
                              return <span className="text-2xl">{icon || '🏆'}</span>;
                            })()}
                            <div>
                              <h4 className="text-xs font-bold text-zinc-200">{ach.title}</h4>
                              <p className="text-[10px] text-zinc-500 line-clamp-1">{ach.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800/80">
                              {ach.tier}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                              isPinned
                                ? 'bg-blue-600 text-white font-extrabold'
                                : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-white'
                            }`}>
                              {isPinned ? 'Pinned' : 'Pin'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-zinc-800 select-none">
                <button
                  onClick={() => setShowShowcaseEditor(false)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Done Editing
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
