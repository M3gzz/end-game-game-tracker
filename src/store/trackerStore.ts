/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProgress, Activity, UserProfile, CommunityPost, Comment, Achievement, Message, Screenshot, SpeedrunChallenge, Game } from '../types';
import { INITIAL_POSTS } from '../data/mockPosts';
import { PRELOADED_GAMES } from '../data/preloadedGames';

const getBaseId = (id: string) => id.replace(/^\d+-/, '');

interface TrackerState {
  progress: UserProgress;
  activities: Activity[];
  profile: UserProfile;
  posts: CommunityPost[];
  messages: Record<string, Message[]>;
  screenshots: Screenshot[];
  challenges: SpeedrunChallenge[];
  
  // Auth State
  currentUsername: string | null;
  accounts: Record<string, { profile: UserProfile; progress: UserProgress; password?: string }>;
  hasCompletedOnboarding: Record<string, boolean>;
  hasReadUpdates: Record<string, boolean>;

  // Actions
  login: (username: string, password?: string) => { success: boolean; error?: string };
  register: (username: string, name: string, email: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  completeOnboarding: () => void;
  markUpdatesAsRead: () => void;
  checkMigration: () => void;

  addGame: (gameId: string) => void;
  removeGame: (gameId: string) => void;
  toggleAchievement: (achievementId: string, gameId: string, gameTitle: string, achievementTitle: string, achievementIcon: string) => void;
  setAchievementNote: (achievementId: string, note: string) => void;
  toggleFavorite: (gameId: string) => void;
  togglePin: (gameId: string) => void;
  toggleBacklog: (gameId: string) => void;
  toggleWishlist: (gameId: string) => void;
  updatePlaytime: (gameId: string, hours: number) => void;
  toggleActiveHunting: (gameId: string) => void;
  setCompletionGoal: (gameId: string, dateStr: string) => void;
  clearGoal: (gameId: string) => void;
  resetProgress: () => void;
  
  // Social & Profile Actions
  updateProfile: (
    name: string,
    bio: string,
    avatarUrl: string,
    bannerUrl?: string,
    primaryColor?: string,
    secondaryColor?: string,
    themePreset?: string,
    clanTag?: string,
    bgPattern?: 'clean' | 'cyber-grid' | 'scanlines' | 'constellations' | 'hex-grid' | 'neon-circuit',
    spotlightGameId?: string,
    customTitle?: string
  ) => void;
  updateSteamApiKey: (apiKey: string) => void;
  updateSteamId: (steamId: string | undefined) => void;
  syncAchievements: (gameId: string, achievements: Achievement[]) => void;
  syncUserAchievements: (gameId: string, unlockedIds: string[]) => void;
  toggleShowcase: (achievementId: string) => void;
  pruneShowcase: () => void;
  toggleFollowUser: (username: string) => void;
  createPost: (gameId: string | undefined, gameTitle: string | undefined, title: string, content: string, type: 'review' | 'guide' | 'general', rating?: number) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, commentText: string) => void;

  // New Actions
  addCustomGame: (game: Game) => void;
  sendMessage: (toUsername: string, text: string, challengeId?: string) => void;
  addScreenshot: (caption: string, gameId: string | undefined, base64Url: string) => void;
  likeScreenshot: (id: string) => void;
  sendChallenge: (friendUsername: string, gameId: string, type: 'platinum' | 'trophy-count', hours: number) => void;
  respondToChallenge: (id: string, accept: boolean) => void;
  setAvatarFrame: (frame: 'neon-blue' | 'ember-glow' | 'cyber-pulsar' | 'gold-particle' | 'none') => void;
  setBgPattern: (pattern: 'clean' | 'cyber-grid' | 'scanlines' | 'constellations' | 'hex-grid' | 'neon-circuit') => void;
}

const DEFAULT_PROGRESS: UserProgress = {
  ownedGames: [],
  unlockedAchievements: {},
  achievementNotes: {},
  favoriteGames: [],
  pinnedGames: [],
  backlogGames: [],
  wishlistGames: [],
  playtimes: {},
  activeHunting: [],
  completionGoals: {},
  streakCount: 0,
  customAchievements: {},
  customGames: {},
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Megan Hunter',
  username: 'hunter_megan',
  avatarUrl: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', // Purple-Indigo theme
  bio: 'Platinum hunter. Currently trying to 100% Elden Ring! Completionist at heart.',
  showcasedAchievements: [],
  following: [],
  bannerUrl: '',
  primaryColor: '#a855f7',
  secondaryColor: '#6366f1',
  themePreset: 'Nebula Purple',
  clanTag: 'M3GZ',
  bgPattern: 'cyber-grid',
  spotlightGameId: '', // Default empty, can select Elden Ring in customizer
  customTitle: 'Grandmaster Completionist',
  avatarFrame: 'none',
  streakRewards: [],
  socialLinks: {},
};

export const useTrackerStore = create<TrackerState>()(
  persist(
    (setRaw, get) => {
      const set = (
        updater:
          | Partial<TrackerState>
          | ((state: TrackerState) => Partial<TrackerState> | { [key: string]: any })
      ) => {
        setRaw((state: TrackerState) => {
          const next = typeof updater === 'function' ? updater(state) : updater;
          
          const currentUsername = next.currentUsername !== undefined ? next.currentUsername : state.currentUsername;
          const profile = next.profile !== undefined ? next.profile : state.profile;
          const progress = next.progress !== undefined ? next.progress : state.progress;
          let accounts = next.accounts !== undefined ? next.accounts : state.accounts;
          
          if (currentUsername && currentUsername !== 'guest') {
            const existingAccount = accounts[currentUsername] || {};
            accounts = {
              ...accounts,
              [currentUsername]: {
                ...existingAccount,
                profile,
                progress,
                password: next.accounts?.[currentUsername]?.password ?? existingAccount.password
              }
            };
          }
          
          return {
            ...next,
            accounts
          };
        });
      };

      const PRESET_COLORS = ['#a855f7', '#6366f1', '#107c10', '#5dc21e', '#e60012', '#ff4b5c', '#fcee0a', '#00f0ff', '#0d9488', '#10b981', '#d946ef', '#f97316'];
      const getRandomColor = () => PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];

      return {
        // Auth State
        currentUsername: null,
        accounts: {},
        hasCompletedOnboarding: {},
        hasReadUpdates: {},

        progress: { ...DEFAULT_PROGRESS },
        activities: [],
        profile: { ...DEFAULT_PROFILE },
        posts: [...INITIAL_POSTS],

        // Auth Actions
        login: (username, password) => {
          const sanitizedUsername = username.trim().toLowerCase();
          const accounts = get().accounts;
          
          let activeAccounts = { ...accounts };
          if (Object.keys(activeAccounts).length === 0 && get().profile?.username) {
            activeAccounts = {
              [get().profile.username]: {
                profile: get().profile,
                progress: get().progress,
                password: 'Meganvdw01'
              }
            };
          }

          const account = activeAccounts[sanitizedUsername];
          if (!account) {
            return { success: false, error: 'Account not found. Please register.' };
          }
          if (account.password && account.password !== password) {
            return { success: false, error: 'Incorrect password.' };
          }
          
          set({
            currentUsername: sanitizedUsername,
            profile: account.profile,
            progress: account.progress,
            accounts: activeAccounts
          });
          return { success: true };
        },

        register: (username, name, email, password) => {
          const sanitizedUsername = username.trim().toLowerCase();
          const accounts = get().accounts;
          if (accounts[sanitizedUsername]) {
            return { success: false, error: 'Username is already taken.' };
          }
          
          const newProfile: UserProfile = {
            ...DEFAULT_PROFILE,
            name,
            username: sanitizedUsername,
            avatarUrl: `linear-gradient(135deg, ${getRandomColor()} 0%, ${getRandomColor()} 100%)`,
            bio: 'New hunter in the EndGame community!',
            primaryColor: '#a855f7',
            secondaryColor: '#6366f1',
            themePreset: 'Nebula Purple',
            clanTag: '',
            bgPattern: 'clean',
            avatarFrame: 'none',
            streakRewards: [],
            showcasedAchievements: [],
          };
          
          const newProgress: UserProgress = {
            ...DEFAULT_PROGRESS,
            ownedGames: [],
            unlockedAchievements: {},
            achievementNotes: {},
            favoriteGames: [],
            pinnedGames: [],
            backlogGames: [],
            wishlistGames: [],
            playtimes: {},
            activeHunting: [],
            completionGoals: {},
            streakCount: 0,
          };

          set((state: any) => ({
            accounts: {
              ...state.accounts,
              [sanitizedUsername]: {
                profile: newProfile,
                progress: newProgress,
                password
              }
            },
            currentUsername: sanitizedUsername,
            profile: newProfile,
            progress: newProgress,
            hasCompletedOnboarding: {
              ...(state.hasCompletedOnboarding || {}),
              [sanitizedUsername]: false
            }
          }));

          return { success: true };
        },

        logout: () => {
          set({
            currentUsername: null,
            profile: {
              ...DEFAULT_PROFILE,
              name: 'Guest Player',
              username: 'guest',
              avatarUrl: 'linear-gradient(135deg, #71717a 0%, #3f3f46 100%)',
              bio: 'Sign in to customize your profile, sync with Steam, and save achievements.',
              avatarFrame: 'none',
            },
            progress: {
              ...DEFAULT_PROGRESS,
              ownedGames: [],
              unlockedAchievements: {},
            }
          });
        },

        completeOnboarding: () => {
          const username = get().currentUsername;
          if (!username) return;
          set((state: any) => ({
            hasCompletedOnboarding: {
              ...(state.hasCompletedOnboarding || {}),
              [username]: true
            }
          }));
        },

        markUpdatesAsRead: () => {
          const username = get().currentUsername || 'guest';
          set((state: any) => ({
            hasReadUpdates: {
              ...(state.hasReadUpdates || {}),
              [username]: true
            }
          }));
        },

        checkMigration: () => {
          const accounts = get().accounts;
          if (Object.keys(accounts || {}).length === 0 && get().profile?.username) {
            const defaultUsername = get().profile.username;
            set((state: any) => ({
              accounts: {
                [defaultUsername]: {
                  profile: state.profile,
                  progress: state.progress,
                  password: 'Meganvdw01'
                }
              }
            }));
          }
        },
      messages: {
        'arthur_morgan': [
          { id: 'm1', sender: 'arthur_morgan', text: 'Hey Megan, heard you were trying to 100% Elden Ring. Need any help with Malenia?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
          { id: 'm2', sender: 'hunter_megan', text: 'Hey Arthur! Yes, she is tough. Any advice on dodging her Waterfowl Dance?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9).toISOString() },
          { id: 'm3', sender: 'arthur_morgan', text: 'Roll forward and through the first flurry, then run away. Or use a shield or freezing pots! You got this.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.8).toISOString() }
        ],
        'ellie_williams': [
          { id: 'e1', sender: 'ellie_williams', text: 'Nice profile layout! The purple nebula theme looks so clean.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }
        ],
        'geralt_of_rivia': [
          { id: 'g1', sender: 'geralt_of_rivia', text: 'If you ever want to challenge me to a speedrun duel in Witcher 3 or Cyberpunk, I am always ready.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString() }
        ]
      },
      screenshots: [
        {
          id: 's1',
          url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
          caption: 'Neon lights and chrome dreams in Cyberpunk 2077!',
          gameId: 'cyberpunk-2077',
          gameTitle: 'Cyberpunk 2077',
          authorUsername: 'hunter_megan',
          authorName: 'Megan Hunter',
          authorAvatar: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
          likes: 24,
          likedBy: ['arthur_morgan', 'peter_parker'],
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
        },
        {
          id: 's2',
          url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800',
          caption: 'Finally achieved Platinum in Elden Ring! What a ride.',
          gameId: 'elden-ring',
          gameTitle: 'Elden Ring',
          authorUsername: 'geralt_of_rivia',
          authorName: 'Geralt of Rivia',
          authorAvatar: 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
          likes: 42,
          likedBy: ['hunter_megan'],
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
        }
      ],
      challenges: [
        {
          id: 'c-1',
          challenger: 'peter_parker',
          target: 'hunter_megan',
          gameId: 'stray',
          gameTitle: 'Stray',
          type: 'platinum',
          timeLimitHours: 48,
          status: 'pending',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
        }
      ],

      addGame: (gameId) => set((state) => {
        if (state.progress.ownedGames.includes(gameId)) return {};
        
        const newOwned = [...state.progress.ownedGames, gameId];
        const updatedProgress = {
          ...state.progress,
          ownedGames: newOwned,
          // Move from wishlist/backlog to owned games if needed
          wishlistGames: state.progress.wishlistGames.filter(id => id !== gameId),
        };

        const newActivity: Activity = {
          id: Math.random().toString(36).substring(2),
          gameId,
          gameTitle: '', // Resolves at display time or updated below
          type: 'add',
          description: `Added to Library`,
          timestamp: new Date().toISOString(),
        };

        return {
          progress: updatedProgress,
          activities: [newActivity, ...state.activities].slice(0, 50),
        };
      }),

      removeGame: (gameId) => set((state) => {
        // Remove all unlocked achievements for this game
        const updatedUnlocked = { ...state.progress.unlockedAchievements };
        Object.keys(updatedUnlocked).forEach(achId => {
          if (achId.startsWith(gameId)) {
            delete updatedUnlocked[achId];
          }
        });

        // Remove all notes for this game
        const updatedNotes = { ...state.progress.achievementNotes };
        Object.keys(updatedNotes).forEach(achId => {
          if (achId.startsWith(gameId)) {
            delete updatedNotes[achId];
          }
        });

        const newPlaytimes = { ...state.progress.playtimes };
        delete newPlaytimes[gameId];

        const newGoals = { ...state.progress.completionGoals };
        delete newGoals[gameId];

        const updatedProgress = {
          ...state.progress,
          ownedGames: state.progress.ownedGames.filter(id => id !== gameId),
          favoriteGames: state.progress.favoriteGames.filter(id => id !== gameId),
          pinnedGames: state.progress.pinnedGames.filter(id => id !== gameId),
          backlogGames: state.progress.backlogGames.filter(id => id !== gameId),
          activeHunting: state.progress.activeHunting.filter(id => id !== gameId),
          unlockedAchievements: updatedUnlocked,
          achievementNotes: updatedNotes,
          playtimes: newPlaytimes,
          completionGoals: newGoals,
        };

        const newActivity: Activity = {
          id: Math.random().toString(36).substring(2),
          gameId,
          gameTitle: '',
          type: 'remove',
          description: `Removed from Library`,
          timestamp: new Date().toISOString(),
        };

        const newShowcase = (state.profile.showcasedAchievements || []).filter(
          achId => !achId.startsWith(gameId + '-')
        );

        return {
          progress: updatedProgress,
          profile: {
            ...state.profile,
            showcasedAchievements: newShowcase,
          },
          activities: [newActivity, ...state.activities].slice(0, 50),
        };
      }),

      toggleAchievement: (achievementId, gameId, gameTitle, achievementTitle, achievementIcon) => set((state) => {
        const isUnlocked = !!state.progress.unlockedAchievements[achievementId];
        const updatedUnlocked = { ...state.progress.unlockedAchievements };
        
        let type: 'unlock' | 'lock';
        let description: string;

        if (isUnlocked) {
          delete updatedUnlocked[achievementId];
          type = 'lock';
          description = `Locked achievement: ${achievementTitle}`;
        } else {
          updatedUnlocked[achievementId] = new Date().toISOString();
          type = 'unlock';
          description = `Unlocked achievement: ${achievementTitle}`;
        }

        // Calculate streaks (every unlock increments the streak for easy interactive testing!)
        let streak = state.progress.streakCount;
        const todayStr = new Date().toISOString().split('T')[0];

        if (type === 'unlock') {
          streak += 1;
        }

        const rewards = [...(state.profile.streakRewards || [])];
        if (streak >= 3) {
          if (!rewards.includes('Neon Blue Frame')) rewards.push('Neon Blue Frame');
          if (!rewards.includes('Speed Demon')) rewards.push('Speed Demon');
        }
        if (streak >= 7) {
          if (!rewards.includes('Ember Glow Frame')) rewards.push('Ember Glow Frame');
          if (!rewards.includes('Iron Will')) rewards.push('Iron Will');
          if (!rewards.includes('cyber-grid')) rewards.push('cyber-grid');
        }
        if (streak >= 15) {
          if (!rewards.includes('Cyber Pulsar Frame')) rewards.push('Cyber Pulsar Frame');
          if (!rewards.includes('Platinum Legend')) rewards.push('Platinum Legend');
          if (!rewards.includes('neon-circuit')) rewards.push('neon-circuit');
          if (!rewards.includes('hex-grid')) rewards.push('hex-grid');
        }

        const updatedProgress = {
          ...state.progress,
          unlockedAchievements: updatedUnlocked,
          streakCount: streak,
          lastActivityDate: todayStr,
        };

        const newActivity: Activity = {
          id: Math.random().toString(36).substring(2),
          gameId,
          gameTitle,
          type,
          description,
          timestamp: new Date().toISOString(),
          achievementTitle,
          achievementIcon,
        };

        const showcased = state.profile.showcasedAchievements || [];
        const newShowcase = type === 'lock' 
          ? showcased.filter(id => id !== achievementId)
          : showcased;

        return {
          progress: updatedProgress,
          profile: {
            ...state.profile,
            showcasedAchievements: newShowcase,
            streakRewards: rewards,
          },
          activities: [newActivity, ...state.activities].slice(0, 50),
        };
      }),

      setAchievementNote: (achievementId, note) => set((state) => {
        const updatedNotes = {
          ...state.progress.achievementNotes,
          [achievementId]: note,
        };
        return {
          progress: {
            ...state.progress,
            achievementNotes: updatedNotes,
          },
        };
      }),

      toggleFavorite: (gameId) => set((state) => {
        const isFav = state.progress.favoriteGames.includes(gameId);
        const newFavs = isFav
          ? state.progress.favoriteGames.filter(id => id !== gameId)
          : [...state.progress.favoriteGames, gameId];

        const updatedProgress = {
          ...state.progress,
          favoriteGames: newFavs,
        };

        const newActivity: Activity = {
          id: Math.random().toString(36).substring(2),
          gameId,
          gameTitle: '',
          type: 'favorite',
          description: isFav ? `Removed from Favorites` : `Added to Favorites`,
          timestamp: new Date().toISOString(),
        };

        return {
          progress: updatedProgress,
          activities: [newActivity, ...state.activities].slice(0, 50),
        };
      }),

      togglePin: (gameId) => set((state) => {
        const isPinned = state.progress.pinnedGames.includes(gameId);
        const newPins = isPinned
          ? state.progress.pinnedGames.filter(id => id !== gameId)
          : [...state.progress.pinnedGames, gameId];

        return {
          progress: {
            ...state.progress,
            pinnedGames: newPins,
          },
        };
      }),

      toggleBacklog: (gameId) => set((state) => {
        const isBacklog = state.progress.backlogGames.includes(gameId);
        const newBacklog = isBacklog
          ? state.progress.backlogGames.filter(id => id !== gameId)
          : [...state.progress.backlogGames, gameId];

        return {
          progress: {
            ...state.progress,
            backlogGames: newBacklog,
          },
        };
      }),

      toggleWishlist: (gameId) => set((state) => {
        const isWish = state.progress.wishlistGames.includes(gameId);
        const newWish = isWish
          ? state.progress.wishlistGames.filter(id => id !== gameId)
          : [...state.progress.wishlistGames, gameId];

        return {
          progress: {
            ...state.progress,
            wishlistGames: newWish,
            // Cannot own a game that is in wishlist, so remove if owned
            ownedGames: state.progress.ownedGames.filter(id => id !== gameId),
          },
        };
      }),

      updatePlaytime: (gameId, hours) => set((state) => {
        const newPlaytimes = {
          ...state.progress.playtimes,
          [gameId]: Math.max(0, hours),
        };
        return {
          progress: {
            ...state.progress,
            playtimes: newPlaytimes,
          },
        };
      }),

      toggleActiveHunting: (gameId) => set((state) => {
        const isHunting = state.progress.activeHunting.includes(gameId);
        const newHunting = isHunting
          ? state.progress.activeHunting.filter(id => id !== gameId)
          : [...state.progress.activeHunting, gameId];

        return {
          progress: {
            ...state.progress,
            activeHunting: newHunting,
          },
        };
      }),

      setCompletionGoal: (gameId, dateStr) => set((state) => {
        const newGoals = {
          ...state.progress.completionGoals,
          [gameId]: dateStr,
        };

        const newActivity: Activity = {
          id: Math.random().toString(36).substring(2),
          gameId,
          gameTitle: '',
          type: 'goal',
          description: `Set target completion date: ${dateStr}`,
          timestamp: new Date().toISOString(),
        };

        return {
          progress: {
            ...state.progress,
            completionGoals: newGoals,
          },
          activities: [newActivity, ...state.activities].slice(0, 50),
        };
      }),

      clearGoal: (gameId) => set((state) => {
        const newGoals = { ...state.progress.completionGoals };
        delete newGoals[gameId];

        return {
          progress: {
            ...state.progress,
            completionGoals: newGoals,
          },
        };
      }),

      resetProgress: () => set({
        progress: { ...DEFAULT_PROGRESS },
        activities: [],
        profile: { ...DEFAULT_PROFILE },
        posts: [...INITIAL_POSTS],
      }),

      // Social & Profile Actions Implementation
      updateProfile: (name, bio, avatarUrl, bannerUrl, primaryColor, secondaryColor, themePreset, clanTag, bgPattern, spotlightGameId, customTitle) => set((state) => ({
        profile: {
          ...state.profile,
          name,
          bio,
          avatarUrl,
          bannerUrl: bannerUrl !== undefined ? bannerUrl : state.profile.bannerUrl,
          primaryColor: primaryColor !== undefined ? primaryColor : state.profile.primaryColor,
          secondaryColor: secondaryColor !== undefined ? secondaryColor : state.profile.secondaryColor,
          themePreset: themePreset !== undefined ? themePreset : state.profile.themePreset,
          clanTag: clanTag !== undefined ? clanTag : state.profile.clanTag,
          bgPattern: bgPattern !== undefined ? bgPattern : state.profile.bgPattern,
          spotlightGameId: spotlightGameId !== undefined ? spotlightGameId : state.profile.spotlightGameId,
          customTitle: customTitle !== undefined ? customTitle : state.profile.customTitle,
        }
      })),

      updateSteamApiKey: (apiKey) => set((state) => ({
        profile: {
          ...state.profile,
          steamApiKey: apiKey,
        }
      })),

      updateSteamId: (steamId) => set((state) => ({
        profile: {
          ...state.profile,
          steamId,
        }
      })),

      syncAchievements: (gameId, achievements) => set((state) => {
        const updatedCustom = {
          ...(state.progress.customAchievements || {}),
          [gameId]: achievements,
        };

        const preloadedGame = PRELOADED_GAMES.find(g => g.id === gameId);

        const newActivity: Activity = {
          id: Math.random().toString(36).substring(2),
          gameId,
          gameTitle: preloadedGame?.title || '',
          type: 'add',
          description: `Synced ${achievements.length} achievements with Steam`,
          timestamp: new Date().toISOString(),
        };

        return {
          progress: {
            ...state.progress,
            customAchievements: updatedCustom,
          },
          activities: [newActivity, ...state.activities].slice(0, 50),
        };
      }),

      syncUserAchievements: (gameId, unlockedIds) => set((state) => {
        const updatedUnlocked = { ...state.progress.unlockedAchievements };
        let newlyUnlockedCount = 0;

        const custom = state.progress.customAchievements?.[gameId] || [];
        const preloadedGame = PRELOADED_GAMES.find(g => g.id === gameId);
        const achievements = custom.length > 0 ? custom : (preloadedGame?.achievements || []);

        achievements.forEach(ach => {
          // Extract the API name from the achievement ID
          // Achievement IDs look like "appId-apiName" (e.g. "1222140-ach_thank_you")
          const parts = ach.id.split('-');
          const apiName = parts.slice(1).join('-').toLowerCase();

          if (unlockedIds.includes(apiName)) {
            if (!updatedUnlocked[ach.id]) {
              updatedUnlocked[ach.id] = new Date().toISOString();
              newlyUnlockedCount++;
            }
          }
        });

        if (newlyUnlockedCount === 0) return {};

        const newActivity: Activity = {
          id: Math.random().toString(36).substring(2),
          gameId,
          gameTitle: preloadedGame?.title || '',
          type: 'unlock',
          description: `Automatically synced & unlocked ${newlyUnlockedCount} achievements from Steam`,
          timestamp: new Date().toISOString(),
        };

        return {
          progress: {
            ...state.progress,
            unlockedAchievements: updatedUnlocked,
          },
          activities: [newActivity, ...state.activities].slice(0, 50),
        };
      }),

      toggleShowcase: (achievementId) => set((state) => {
        // Collect all currently unlocked achievement base IDs
        const unlockedBaseIds = new Set<string>();
        Object.keys(state.progress.unlockedAchievements).forEach(id => {
          unlockedBaseIds.add(getBaseId(id));
        });

        const baseIdToToggle = getBaseId(achievementId);
        const isUnlocked = unlockedBaseIds.has(baseIdToToggle);

        // Deduplicate and filter current showcased achievements
        const showcasedList = (state.profile.showcasedAchievements || []) as string[];
        const current = showcasedList.filter(
          (id, index, self) => self.indexOf(id) === index && unlockedBaseIds.has(getBaseId(id))
        );

        // If the achievement being toggled is not unlocked, we cannot showcase it.
        if (!isUnlocked) {
          const newShowcase = current.filter(id => getBaseId(id) !== baseIdToToggle);
          return {
            profile: {
              ...state.profile,
              showcasedAchievements: newShowcase,
            }
          };
        }

        const isAlreadyShowcased = current.some(id => getBaseId(id) === baseIdToToggle);
        let newShowcase: string[];
        
        if (isAlreadyShowcased) {
          newShowcase = current.filter(id => getBaseId(id) !== baseIdToToggle);
        } else {
          if (current.length >= 4) {
            // FIFO Queue: Remove the oldest pinned (first item) and add the new one at the end
            newShowcase = [...current.slice(1), achievementId];
          } else {
            newShowcase = [...current, achievementId];
          }
        }
        
        return {
          profile: {
            ...state.profile,
            showcasedAchievements: newShowcase,
          }
        };
      }),

      pruneShowcase: () => set((state) => {
        const unlockedBaseIds = new Set<string>();
        Object.keys(state.progress.unlockedAchievements).forEach(id => {
          unlockedBaseIds.add(getBaseId(id));
        });

        const showcasedList = (state.profile.showcasedAchievements || []) as string[];
        const validShowcase = showcasedList.filter(
          (id, index, self) => self.indexOf(id) === index && unlockedBaseIds.has(getBaseId(id))
        );

        if (validShowcase.length !== showcasedList.length) {
          return {
            profile: {
              ...state.profile,
              showcasedAchievements: validShowcase,
            }
          };
        }
        return {};
      }),

      toggleFollowUser: (username) => set((state) => {
        const current = state.profile.following || [];
        const isFollowing = current.includes(username);
        const newFollowing = isFollowing
          ? current.filter(un => un !== username)
          : [...current, username];
          
        return {
          profile: {
            ...state.profile,
            following: newFollowing,
          }
        };
      }),

      createPost: (gameId, gameTitle, title, content, type, rating) => set((state) => {
        const newPost: CommunityPost = {
          id: `post-${Math.random().toString(36).substring(2)}`,
          gameId,
          gameTitle,
          authorName: state.profile.name,
          authorUsername: state.profile.username,
          authorAvatar: state.profile.avatarUrl,
          title,
          content,
          type,
          rating,
          likes: 0,
          likedBy: [],
          comments: [],
          timestamp: new Date().toISOString(),
        };
        
        return {
          posts: [newPost, ...state.posts],
        };
      }),

      likePost: (postId) => set((state) => {
        const username = state.profile.username;
        const updatedPosts = state.posts.map(post => {
          if (post.id === postId) {
            const isLiked = post.likedBy.includes(username);
            const newLikedBy = isLiked
              ? post.likedBy.filter(un => un !== username)
              : [...post.likedBy, username];
            const newLikes = isLiked ? post.likes - 1 : post.likes + 1;
            
            return {
              ...post,
              likes: Math.max(0, newLikes),
              likedBy: newLikedBy,
            };
          }
          return post;
        });
        
        return {
          posts: updatedPosts,
        };
      }),

      addComment: (postId, commentText) => set((state) => {
        const updatedPosts = state.posts.map(post => {
          if (post.id === postId) {
            const newComment: Comment = {
              id: `comment-${Math.random().toString(36).substring(2)}`,
              authorName: state.profile.name,
              authorUsername: state.profile.username,
              authorAvatar: state.profile.avatarUrl,
              content: commentText,
              timestamp: new Date().toISOString(),
            };
            
            return {
              ...post,
              comments: [...post.comments, newComment],
            };
          }
          return post;
        });
        
        return {
          posts: updatedPosts,
        };
      }),

      addCustomGame: (game) => set((state) => {
        const updatedCustom = {
          ...(state.progress.customGames || {}),
          [game.id]: game
        };
        const newOwned = state.progress.ownedGames.includes(game.id)
          ? state.progress.ownedGames
          : [...state.progress.ownedGames, game.id];
        return {
          progress: {
            ...state.progress,
            customGames: updatedCustom,
            ownedGames: newOwned,
            wishlistGames: state.progress.wishlistGames.filter(id => id !== game.id),
          }
        };
      }),

      sendMessage: (toUsername, text, challengeId) => set((state) => {
        const conversationId = toUsername;
        const currentMsgs = state.messages[conversationId] || [];
        const newMsg: Message = {
          id: `msg-${Math.random().toString(36).substring(2)}`,
          sender: state.profile.username,
          text,
          timestamp: new Date().toISOString(),
          challengeId,
        };
        
        let automaticReply: Message | null = null;
        if (text.toLowerCase().includes('challenge') || challengeId) {
          automaticReply = {
            id: `msg-reply-${Math.random().toString(36).substring(2)}`,
            sender: toUsername,
            text: `Challenge accepted! Let's see who can achieve the best time or trophy count! May the best speedrunner win. 🎮`,
            timestamp: new Date(Date.now() + 1000).toISOString(),
          };
        } else if (toUsername === 'arthur_morgan') {
          automaticReply = {
            id: `msg-reply-${Math.random().toString(36).substring(2)}`,
            sender: toUsername,
            text: `Sure thing, partner. I'll get back to you once I'm off the trail. Keep hunting!`,
            timestamp: new Date(Date.now() + 1500).toISOString(),
          };
        } else if (toUsername === 'ellie_williams') {
          automaticReply = {
            id: `msg-reply-${Math.random().toString(36).substring(2)}`,
            sender: toUsername,
            text: `Sounds like a plan. Let's make it happen.`,
            timestamp: new Date(Date.now() + 1500).toISOString(),
          };
        } else if (toUsername === 'geralt_of_rivia') {
          automaticReply = {
            id: `msg-reply-${Math.random().toString(36).substring(2)}`,
            sender: toUsername,
            text: `Hmm. Intriguing. Let's see how this plays out.`,
            timestamp: new Date(Date.now() + 1500).toISOString(),
          };
        } else if (toUsername === 'peter_parker') {
          automaticReply = {
            id: `msg-reply-${Math.random().toString(36).substring(2)}`,
            sender: toUsername,
            text: `Awesome! Can't wait to test my speedrunning skills against you!`,
            timestamp: new Date(Date.now() + 1500).toISOString(),
          };
        }

        const updatedMessages = {
          ...state.messages,
          [conversationId]: [...currentMsgs, newMsg]
        };

        if (automaticReply) {
          updatedMessages[conversationId].push(automaticReply);
        }
        
        return {
          messages: updatedMessages
        };
      }),

      addScreenshot: (caption, gameId, base64Url) => set((state) => {
        const preloaded = PRELOADED_GAMES.find(g => g.id === gameId);
        const gameTitle = preloaded ? preloaded.title : (gameId ? gameId : undefined);
        const newScreenshot: Screenshot = {
          id: `screenshot-${Math.random().toString(36).substring(2)}`,
          url: base64Url,
          caption,
          gameId,
          gameTitle,
          authorUsername: state.profile.username,
          authorName: state.profile.name,
          authorAvatar: state.profile.avatarUrl,
          likes: 0,
          likedBy: [],
          timestamp: new Date().toISOString()
        };
        return {
          screenshots: [newScreenshot, ...state.screenshots]
        };
      }),

      likeScreenshot: (id) => set((state) => {
        const username = state.profile.username;
        const updated = state.screenshots.map(s => {
          if (s.id === id) {
            const isLiked = s.likedBy.includes(username);
            const newLikedBy = isLiked
              ? s.likedBy.filter(un => un !== username)
              : [...s.likedBy, username];
            const newLikes = isLiked ? s.likes - 1 : s.likes + 1;
            return {
              ...s,
              likes: Math.max(0, newLikes),
              likedBy: newLikedBy
            };
          }
          return s;
        });
        return { screenshots: updated };
      }),

      sendChallenge: (friendUsername, gameId, type, hours) => set((state) => {
        const preloaded = PRELOADED_GAMES.find(g => g.id === gameId);
        const gameTitle = preloaded ? preloaded.title : (state.progress.customGames?.[gameId]?.title || 'Custom Game');
        const newChallenge: SpeedrunChallenge = {
          id: `challenge-${Math.random().toString(36).substring(2)}`,
          challenger: state.profile.username,
          target: friendUsername,
          gameId,
          gameTitle,
          type,
          timeLimitHours: hours,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        const conversationId = friendUsername;
        const currentMsgs = state.messages[conversationId] || [];
        const challengeMsg: Message = {
          id: `msg-${Math.random().toString(36).substring(2)}`,
          sender: state.profile.username,
          text: `🎮 CHALLENGE DUEL: I challenge you to a speedrun duel in ${gameTitle} (${type === 'platinum' ? 'First to Platinum' : `Most trophies in ${hours} hours`})!`,
          timestamp: new Date().toISOString(),
          challengeId: newChallenge.id
        };
        
        const autoReply: Message = {
          id: `msg-reply-${Math.random().toString(36).substring(2)}`,
          sender: friendUsername,
          text: `Whoa, a challenge! You're on! Let's see who's faster. I have accepted the challenge in my dashboard.`,
          timestamp: new Date(Date.now() + 1000).toISOString(),
        };

        const updatedChallenges = [...state.challenges, newChallenge];
        newChallenge.status = 'accepted';

        return {
          challenges: updatedChallenges,
          messages: {
            ...state.messages,
            [conversationId]: [...currentMsgs, challengeMsg, autoReply]
          }
        };
      }),

      respondToChallenge: (id, accept) => set((state) => {
        const updated = state.challenges.map(c => {
          if (c.id === id) {
            return {
              ...c,
              status: accept ? 'accepted' as const : 'declined' as const
            };
          }
          return c;
        });
        return { challenges: updated };
      }),

      setAvatarFrame: (frame) => set((state) => ({
        profile: {
          ...state.profile,
          avatarFrame: frame
        }
      })),

      setBgPattern: (pattern) => set((state) => ({
        profile: {
          ...state.profile,
          bgPattern: pattern
        }
      })),
    };
  },
  {
    name: 'steam-achievement-hunter-storage',
  }
)
);
