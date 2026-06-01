import { UserProfile } from '../types';

export interface MockUserProgress {
  level: number;
  xpPercentage: number; // 0-100 progress to next level
  ownedGamesCount: number;
  unlockedTrophiesCount: number;
  completedGamesCount: number;
  totalPlaytimeHours: number;
  showcasedAchievements: string[]; // up to 4 achievement IDs
  completedGameIds: string[]; // Game IDs that are 100% completed
  recentTrophies: {
    achievementId: string;
    gameId: string;
    gameTitle: string;
    title: string;
    iconUrl: string;
    unlockedAt: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  }[];
}

export interface MockUserProfile extends UserProfile {
  followersCount: number;
  followingCount: number;
  stats: MockUserProgress;
}

export const MOCK_USERS: Record<string, MockUserProfile> = {
  arthur_morgan: {
    name: 'Arthur Morgan',
    username: 'arthur_morgan',
    avatarUrl: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)', // Amber/Brown theme
    bio: 'Outlaws for life. Just trying to catch the legendary fish and explore the wild frontier. 100% completion is a long trail, but I am riding it to the end.',
    showcasedAchievements: ['rdr-outlaw', 'rdr-zoologist', 'got-way-of-samurai', 'er-elden-lord'],
    following: ['ellie_williams', 'geralt_of_rivia'],
    followersCount: 1542,
    followingCount: 2,
    stats: {
      level: 42,
      xpPercentage: 75,
      ownedGamesCount: 12,
      unlockedTrophiesCount: 210,
      completedGamesCount: 4,
      totalPlaytimeHours: 642,
      showcasedAchievements: ['rdr-outlaw', 'rdr-zoologist', 'got-way-of-samurai', 'er-elden-lord'],
      completedGameIds: ['red-dead-2', 'ghost-tsushima', 'stray', 'god-of-war'],
      recentTrophies: [
        {
          achievementId: 'rdr-outlaw',
          gameId: 'red-dead-2',
          gameTitle: 'Red Dead Redemption 2',
          title: 'Legend of the West',
          iconUrl: '🏆',
          unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          tier: 'platinum'
        },
        {
          achievementId: 'rdr-zoologist',
          gameId: 'red-dead-2',
          gameTitle: 'Red Dead Redemption 2',
          title: 'Zoologist',
          iconUrl: '🦁',
          unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          tier: 'gold'
        },
        {
          achievementId: 'got-way-of-samurai',
          gameId: 'ghost-tsushima',
          gameTitle: 'Ghost of Tsushima',
          title: 'Straying Paths',
          iconUrl: '⚔️',
          unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
          tier: 'bronze'
        }
      ]
    }
  },
  ellie_williams: {
    name: 'Ellie Williams',
    username: 'ellie_williams',
    avatarUrl: 'linear-gradient(135deg, #15803d 0%, #166534 100%)', // Green theme
    bio: 'Endure and survive. Life is short, but achievements are forever. Pinned some cool badges. Music, drawing, and slaying infected are my usual pastimes.',
    showcasedAchievements: ['tlou-story-completed', 'tlou2-grounded-story', 'tlou-lb-mall', 'str-meow'],
    following: ['arthur_morgan', 'peter_parker'],
    followersCount: 2311,
    followingCount: 2,
    stats: {
      level: 38,
      xpPercentage: 40,
      ownedGamesCount: 9,
      unlockedTrophiesCount: 190,
      completedGamesCount: 3,
      totalPlaytimeHours: 412,
      showcasedAchievements: ['tlou-story-completed', 'tlou2-grounded-story', 'tlou-lb-mall', 'str-meow'],
      completedGameIds: ['last-of-us-1', 'last-of-us-2', 'life-is-strange'],
      recentTrophies: [
        {
          achievementId: 'tlou2-grounded-story',
          gameId: 'last-of-us-2',
          gameTitle: 'The Last of Us Part II',
          title: 'Dig Two Graves',
          iconUrl: '☠️',
          unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          tier: 'platinum'
        },
        {
          achievementId: 'tlou-story-completed',
          gameId: 'last-of-us-1',
          gameTitle: 'The Last of Us Remastered',
          title: 'It Can\'t Be For Nothing',
          iconUrl: '🦒',
          unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
          tier: 'gold'
        },
        {
          achievementId: 'str-meow',
          gameId: 'stray',
          gameTitle: 'Stray',
          title: 'A Little Chatty',
          iconUrl: '🐱',
          unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          tier: 'bronze'
        }
      ]
    }
  },
  geralt_of_rivia: {
    name: 'Geralt of Rivia',
    username: 'geralt_of_rivia',
    avatarUrl: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', // Slate Gray theme
    bio: 'Witcher for hire. Slaying monsters, collecting Gwent cards, and hunting Platinum trophies across the Continent. HMU if you have a contract or want to play Gwent.',
    showcasedAchievements: ['er-malenia', 'sek-isshin', 'bg3-honor', 'ds3-all-rings'],
    following: ['arthur_morgan'],
    followersCount: 4210,
    followingCount: 1,
    stats: {
      level: 56,
      xpPercentage: 15,
      ownedGamesCount: 15,
      unlockedTrophiesCount: 280,
      completedGamesCount: 6,
      totalPlaytimeHours: 980,
      showcasedAchievements: ['er-malenia', 'sek-isshin', 'bg3-honor', 'ds3-all-rings'],
      completedGameIds: ['sekiro', 'baldurs-gate-3', 'dark-souls-3', 'elden-ring'],
      recentTrophies: [
        {
          achievementId: 'bg3-honor',
          gameId: 'baldurs-gate-3',
          gameTitle: 'Baldur\'s Gate 3',
          title: 'Foehammer',
          iconUrl: '🔨',
          unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
          tier: 'platinum'
        },
        {
          achievementId: 'er-malenia',
          gameId: 'elden-ring',
          gameTitle: 'Elden Ring',
          title: 'Shardbearer Malenia',
          iconUrl: '🌸',
          unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          tier: 'gold'
        },
        {
          achievementId: 'sek-isshin',
          gameId: 'sekiro',
          gameTitle: 'Sekiro: Shadows Die Twice',
          title: 'Sword Saint, Isshin Ashina',
          iconUrl: '🌸',
          unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
          tier: 'gold'
        }
      ]
    }
  },
  peter_parker: {
    name: 'Peter Parker',
    username: 'peter_parker',
    avatarUrl: 'linear-gradient(135deg, #dc2626 0%, #2563eb 100%)', // Red/Blue theme
    bio: 'Your friendly neighborhood Spider-Man! Just balancing college, photography, crime-fighting, and 100% completion in my favorite action games. Speedruns are my specialty.',
    showcasedAchievements: ['aa-comboking', 'ac-story', 'str-speedrun', 'dl-parkour'],
    following: ['ellie_williams', 'geralt_of_rivia'],
    followersCount: 3105,
    followingCount: 2,
    stats: {
      level: 35,
      xpPercentage: 90,
      ownedGamesCount: 8,
      unlockedTrophiesCount: 165,
      completedGamesCount: 2,
      totalPlaytimeHours: 290,
      showcasedAchievements: ['aa-comboking', 'ac-story', 'str-speedrun', 'dl-parkour'],
      completedGameIds: ['stray', 'batman-arkham-asylum'],
      recentTrophies: [
        {
          achievementId: 'str-speedrun',
          gameId: 'stray',
          gameTitle: 'Stray',
          title: 'I am Speed',
          iconUrl: '⚡',
          unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
          tier: 'gold'
        },
        {
          achievementId: 'aa-comboking',
          gameId: 'batman-arkham-asylum',
          gameTitle: 'Batman: Arkham Asylum',
          title: 'Freeflow Combo 40',
          iconUrl: '🦇',
          unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
          tier: 'bronze'
        },
        {
          achievementId: 'dl-parkour',
          gameId: 'dying-light',
          gameTitle: 'Dying Light',
          title: 'Flight of the Crane',
          iconUrl: '🏃‍♂️',
          unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
          tier: 'bronze'
        }
      ]
    }
  }
};
