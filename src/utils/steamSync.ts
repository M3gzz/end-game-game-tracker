import { PRELOADED_GAMES } from '@/data/preloadedGames';
import { Game, Achievement } from '@/types';

// Helper to match a Steam App ID to a preloaded game
export const findPreloadedGameBySteamId = (steamId: string | number): typeof PRELOADED_GAMES[0] | undefined => {
  const idStr = String(steamId);
  return PRELOADED_GAMES.find(g => {
    if (g.steamAppId && String(g.steamAppId) === idStr) return true;
    const coverMatch = g.coverUrl?.match(/\/apps\/(\d+)\//)?.[1];
    if (coverMatch === idStr) return true;
    const bannerMatch = g.bannerUrl?.match(/\/apps\/(\d+)\//)?.[1];
    if (bannerMatch === idStr) return true;
    return false;
  });
};

interface SyncStore {
  addGame: (id: string) => void;
  addCustomGame: (game: Game) => void;
  updatePlaytime: (id: string, hours: number) => void;
  syncAchievements: (id: string, achievements: Achievement[]) => void;
  syncUserAchievements: (id: string, unlockedApiNames: string[]) => void;
  progress: {
    customGames?: Record<string, Game>;
    ownedGames: string[];
  };
}

export async function performSteamLibrarySync(
  steamId: string,
  apiKey: string,
  store: SyncStore
): Promise<{ gamesSyncedCount: number; achievementsUnlockedCount: number }> {
  const response = await fetch(`/api/steam/owned-games?steamId=${steamId}&apiKey=${encodeURIComponent(apiKey)}`);
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

  // Perform sync in parallel
  await Promise.all(
    ownedGamesFromSteam.map(async (gameOnSteam) => {
      const appId = String(gameOnSteam.appId);
      const matchingGame = findPreloadedGameBySteamId(appId);
      
      const gameId = matchingGame ? matchingGame.id : `steam-${appId}`;
      const isPreloaded = !!matchingGame;

      // 1. Add game to library if not already owned
      if (isPreloaded) {
        store.addGame(gameId);
      } else {
        const existingCustom = store.progress.customGames?.[gameId];
        if (!existingCustom) {
          // Generate mock achievements first, which will be overwritten if we fetch real ones
          const mockAchievements = [
            {
              id: `${gameId}-ach-start`,
              gameId,
              title: 'New Beginnings',
              description: `Start playing ${gameOnSteam.name} for the first time.`,
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
              description: `Achieve 100% completion in ${gameOnSteam.name}.`,
              iconUrl: '🏆',
              rarityPercentage: 3.4,
              tier: 'platinum' as const
            }
          ];

          const newGame: Game = {
            id: gameId,
            title: gameOnSteam.name,
            coverUrl: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`,
            bannerUrl: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/library_hero.jpg`,
            developer: 'Steam Store',
            estimatedDifficulty: 5,
            estimatedHours: 40,
            platforms: ['Steam', 'PC'],
            description: `Synced steam library game: ${gameOnSteam.name}. Ready to forge your S-rank legacy!`,
            releaseYear: 2025,
            dlcs: [],
            achievements: mockAchievements,
            steamAppId: appId
          };
          store.addCustomGame(newGame);
        } else {
          store.addGame(gameId);
        }
      }

      // 2. Update playtime hours
      store.updatePlaytime(gameId, gameOnSteam.playtimeHours);

      // 3. Fetch achievements schema from Steam
      try {
        const achResponse = await fetch(`/api/steam/achievements?appId=${appId}&apiKey=${encodeURIComponent(apiKey)}`);
        if (achResponse.ok) {
          const achData = await achResponse.json();
          if (achData.achievements && Array.isArray(achData.achievements)) {
            store.syncAchievements(gameId, achData.achievements);

            // If it's a custom game, keep the custom Game object achievements synced
            if (!isPreloaded) {
              const existingCustom = store.progress.customGames?.[gameId];
              if (existingCustom) {
                store.addCustomGame({
                  ...existingCustom,
                  achievements: achData.achievements
                });
              }
            }

            // 4. Fetch and sync personal achievements unlock progress
            try {
              const userAchResponse = await fetch(`/api/steam/user-achievements?appId=${appId}&steamId=${steamId}&apiKey=${encodeURIComponent(apiKey)}`);
              if (userAchResponse.ok) {
                const userAchData = await userAchResponse.json();
                if (userAchData.unlockedApiNames && Array.isArray(userAchData.unlockedApiNames)) {
                  store.syncUserAchievements(gameId, userAchData.unlockedApiNames);
                  achievementsUnlockedCount += userAchData.unlockedApiNames.length;
                }
              }
            } catch (userAchErr) {
              console.error(`Failed to sync user achievements progress for app ${appId}:`, userAchErr);
            }
          }
        }
      } catch (achErr) {
        console.error(`Failed to sync achievements schema for app ${appId}:`, achErr);
      }
      gamesSyncedCount++;
    })
  );

  return { gamesSyncedCount, achievementsUnlockedCount };
}
