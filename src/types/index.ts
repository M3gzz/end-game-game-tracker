export type TrophyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface DLC {
  id: string;
  gameId: string;
  title: string;
  achievementsCount: number;
}

export interface Achievement {
  id: string;
  gameId: string;
  dlcId?: string; // If undefined, it is a base game achievement
  title: string;
  description: string;
  iconUrl: string;
  rarityPercentage: number;
  tier: TrophyTier;
  isMissable?: boolean;
  isCollectible?: boolean;
  isHidden?: boolean;
  guide?: string; // Detailed guide text on how to earn this trophy
}

export interface Game {
  id: string;
  title: string;
  coverUrl: string;
  bannerUrl: string;
  developer: string;
  estimatedDifficulty: number; // 1-10 rating
  estimatedHours: number; // hours to 100%
  platforms: string[];
  description: string;
  releaseYear: number;
  dlcs: DLC[];
  achievements: Achievement[];
  steamAppId?: string | number; // Steam App ID for dynamic sync
}

export interface Activity {
  id: string;
  gameId: string;
  gameTitle: string;
  type: 'unlock' | 'lock' | 'note' | 'add' | 'remove' | 'favorite' | 'pin' | 'goal';
  description: string;
  timestamp: string;
  achievementTitle?: string;
  achievementIcon?: string;
}

export interface UserProfile {
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  showcasedAchievements: string[]; // List of achievement IDs (max 4)
  following: string[]; // List of usernames followed
  steamApiKey?: string; // Optional Steam Web API Key
  steamId?: string; // Optional 17-digit connected Steam ID
  bannerUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  themePreset?: string;
  clanTag?: string;
  bgPattern?: 'clean' | 'cyber-grid' | 'scanlines' | 'constellations' | 'hex-grid' | 'neon-circuit';
  spotlightGameId?: string;
  customTitle?: string;
  avatarFrame?: 'neon-blue' | 'ember-glow' | 'cyber-pulsar' | 'gold-particle' | 'none';
  streakRewards?: string[]; // Array of unlocked badge titles/customizations
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    steam?: string;
    xbox?: string;
    psn?: string;
  };
}

export interface Comment {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
}

export interface CommunityPost {
  id: string;
  gameId?: string;
  gameTitle?: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  title: string;
  content: string;
  type: 'review' | 'guide' | 'general';
  rating?: number; // 1 to 5 stars (required for 'review' type)
  likes: number;
  likedBy: string[]; // List of usernames who liked it
  comments: Comment[];
  timestamp: string;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  challengeId?: string;
}

export interface Screenshot {
  id: string;
  url: string;
  caption: string;
  gameId?: string;
  gameTitle?: string;
  authorUsername: string;
  authorName: string;
  authorAvatar: string;
  likes: number;
  likedBy: string[];
  timestamp: string;
}

export interface SpeedrunChallenge {
  id: string;
  challenger: string;
  target: string;
  gameId: string;
  gameTitle: string;
  type: 'platinum' | 'trophy-count';
  timeLimitHours: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'failed';
  winner?: string;
  createdAt: string;
}

export interface UserProgress {
  ownedGames: string[]; // List of game IDs added to library
  unlockedAchievements: Record<string, string>; // achievementId -> unlockedAt (ISO string)
  achievementNotes: Record<string, string>; // achievementId -> text note
  favoriteGames: string[]; // List of game IDs
  pinnedGames: string[]; // List of game IDs
  backlogGames: string[]; // List of game IDs
  wishlistGames: string[]; // List of game IDs
  playtimes: Record<string, number>; // gameId -> hours played
  activeHunting: string[]; // List of game IDs
  completionGoals: Record<string, string>; // gameId -> target date string
  streakCount: number;
  lastActivityDate?: string;
  customAchievements?: Record<string, Achievement[]>; // gameId -> dynamic Achievements loaded from Steam
  customGames?: Record<string, Game>; // gameId -> full custom Game metadata
}

