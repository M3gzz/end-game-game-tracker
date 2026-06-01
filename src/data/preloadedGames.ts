import { Game } from '../types';

// Helper to generate typical placeholder icons
const getTrophyIcon = (tier: 'bronze' | 'silver' | 'gold' | 'platinum') => {
  switch (tier) {
    case 'platinum': return '🏆';
    case 'gold': return '🥇';
    case 'silver': return '🥈';
    default: return '🥉';
  }
};

export const PRELOADED_GAMES: Game[] = [
  {
    id: 'avatar-frontiers',
    title: 'Avatar: Frontiers of Pandora',
    developer: 'Massive Entertainment',
    estimatedDifficulty: 4,
    estimatedHours: 50,
    platforms: ['Steam', 'PlayStation 5', 'Xbox Series X/S'],
    releaseYear: 2023,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2840770/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2840770/library_hero.jpg',
    description: 'Explore the western frontier of Pandora, connect with your Na\'vi heritage, and protect the world from the RDA.',
    dlcs: [
      { id: 'avatar-sky-breaker', gameId: 'avatar-frontiers', title: 'The Sky Breaker', achievementsCount: 3 }
    ],
    achievements: [
      {
        id: 'av-first-flight',
        gameId: 'avatar-frontiers',
        title: 'First Flight',
        description: 'Bond with your Ikran and take to the skies of Pandora.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 75.4,
        tier: 'bronze'
      ,
        guide: 'Unlocked automatically during the main campaign mission "Take Flight" in the Kinglor Forest. Clamber up the Ikran Rookery and bond with your beast.'
      },
      {
        id: 'av-rda-cleanup',
        gameId: 'avatar-frontiers',
        title: 'Healer of the Land',
        description: 'Decontaminate 10 RDA facilities.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 34.2,
        tier: 'silver',
        isCollectible: true
      ,
        guide: 'Locate RDA Outposts on your map. Clear out the security forces, shut down the main power core, and let the Na\'vi flora reclaim the base.',},
      {
        id: 'av-song-weaver',
        gameId: 'avatar-frontiers',
        title: 'Song Weaver',
        description: 'Collect all Na\'vi lore recordings in the Western Frontier.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 8.5,
        tier: 'gold',
        isCollectible: true
      ,
        guide: 'There are 30 Na\'vi lore recordings scattered in campsites and tree-canopy locations. Keep an eye out for glowing blue data slates.',},
      {
        id: 'av-unmissable-hunter',
        gameId: 'avatar-frontiers',
        title: 'Our Land, Our Way',
        description: 'Complete the main campaign and defeat the RDA forces.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 19.8,
        tier: 'gold',
        isMissable: false
      ,
        guide: 'Story-related, unmissable. Defeat RDA leader John Mercer in the final stronghold during the mission "Singing Sisterhood".'
      },
      {
        id: 'av-sky-1',
        gameId: 'avatar-frontiers',
        dlcId: 'avatar-sky-breaker',
        title: 'Champion of the Clans',
        description: 'Complete the Sky Breaker main storyline.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 22.4,
        tier: 'silver'
      ,
        guide: 'Complete all 5 story quests in the "Sky Breaker" DLC expansion. Unlocked after the final boss encounter.'
      },
      {
        id: 'av-sky-2',
        gameId: 'avatar-frontiers',
        dlcId: 'avatar-sky-breaker',
        title: 'Apex Hunter',
        description: 'Defeat the mutated wildlife in the newly discovered plains.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 6.8,
        tier: 'gold'
      ,
        guide: 'Mutated wildlife spawns in the Great Plains at night. Use heavy bow attacks on their glowing weakpoints to defeat them.'
      },
    ]
  },
  {
    id: 'death-stranding',
    title: 'Death Stranding Director\'s Cut',
    developer: 'Kojima Productions',
    estimatedDifficulty: 5,
    estimatedHours: 80,
    platforms: ['Steam', 'PlayStation 5', 'PC'],
    releaseYear: 2021,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1850570/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1850570/library_hero.jpg',
    description: 'In the future, a mysterious event known as the Death Stranding has opened a doorway between the living and the dead. Reconnect a fractured America.',
    dlcs: [
      { id: 'ds-ruined-factory', gameId: 'death-stranding', title: 'Ruined Factory Expansion', achievementsCount: 2 }
    ],
    achievements: [
      {
        id: 'ds-first-delivery',
        gameId: 'death-stranding',
        title: 'Delivering the Future',
        description: 'Complete your first delivery via the Chiral Network.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 92.1,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'ds-great-deliverer',
        gameId: 'death-stranding',
        title: 'The Great Deliverer',
        description: 'Reach delivery level 60 in all categories.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 11.2,
        tier: 'gold'
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'ds-bb-bond',
        gameId: 'death-stranding',
        title: 'A Child\'s Blessing',
        description: 'Reach maximum connection level with BB.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 44.5,
        tier: 'silver'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'ds-zipline-king',
        gameId: 'death-stranding',
        title: 'Trail Blazer',
        description: 'Upgrade all structure types to maximum level.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 21.3,
        tier: 'silver',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'ds-factory-1',
        gameId: 'death-stranding',
        dlcId: 'ds-ruined-factory',
        title: 'Infiltrator',
        description: 'Complete all reconnaissance missions in the underground Ruined Factory.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 18.7,
        tier: 'silver'
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'ds-factory-2',
        gameId: 'death-stranding',
        dlcId: 'ds-ruined-factory',
        title: 'The Full Picture',
        description: 'Find all lost memory chips inside the Ruined Factory complexes.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 5.3,
        tier: 'gold',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
    ]
  },
  {
    id: 'detroit-human',
    title: 'Detroit: Become Human',
    developer: 'Quantic Dream',
    estimatedDifficulty: 3,
    estimatedHours: 35,
    platforms: ['Steam', 'PlayStation 4', 'PC'],
    releaseYear: 2018,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222140/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222140/library_hero.jpg',
    description: 'Detroit, 2038. Technology has evolved to a point where human-like androids are everywhere. They speak, move and behave like humans, but they are only machines serving humans.',
    dlcs: [],
    achievements: [
      {
        id: 'det-thank-you',
        gameId: 'detroit-human',
        title: 'Thank You',
        description: 'Complete the first chapter of the game as Connor.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 98.4,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'det-deviant',
        gameId: 'detroit-human',
        title: 'Deviant Located',
        description: 'Find the deviant android in the attic.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 81.2,
        tier: 'bronze',
        isMissable: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'det-survivors',
        gameId: 'detroit-human',
        title: 'Survivors',
        description: 'Keep Kara, Alice, Connor, and Markus alive until the final credits.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 6.2,
        tier: 'gold',
        isMissable: true
      ,
        guide: 'Keep Connor, Markus, Kara, Alice, Luther, Hank, North, Josh, and Simon alive. Avoid aggressive, lethal dialogue options.'
      },
      {
        id: 'det-all-paths',
        gameId: 'detroit-human',
        title: 'These Are Our Stories',
        description: 'Unlock 100% of all branching nodes in the flowcharts.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 1.5,
        tier: 'gold',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
    ]
  },
  {
    id: 'hogwarts-legacy',
    title: 'Hogwarts Legacy',
    developer: 'Avalanche Software',
    estimatedDifficulty: 4,
    estimatedHours: 70,
    platforms: ['Steam', 'PlayStation 5', 'Xbox Series X/S', 'Nintendo Switch'],
    releaseYear: 2023,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/library_hero.jpg',
    description: 'Experience Hogwarts in the 1800s. Your character is a student who holds the key to an ancient secret that threatens to tear the wizarding world apart.',
    dlcs: [
      { id: 'hogwarts-arena', gameId: 'hogwarts-legacy', title: 'Dark Arts Battle Arena', achievementsCount: 1 }
    ],
    achievements: [
      {
        id: 'hw-sorting',
        gameId: 'hogwarts-legacy',
        title: 'The Sort of Greatness',
        description: 'Complete the introduction and be sorted into a House.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 96.5,
        tier: 'bronze'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'hw-demiguise',
        gameId: 'hogwarts-legacy',
        title: 'Demiguise Dread',
        description: 'Find all Demiguise statues scattered around the Highlands.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 24.1,
        tier: 'silver',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'hw-spells',
        gameId: 'hogwarts-legacy',
        title: 'Spell Master',
        description: 'Learn every spell in the game, including the Unforgivable Curses.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 15.3,
        tier: 'gold'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'hw-merlin',
        gameId: 'hogwarts-legacy',
        title: 'Merlin\'s Beard!',
        description: 'Solve all Merlin Trials across the map.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 9.8,
        tier: 'gold',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'hw-dark-arts',
        gameId: 'hogwarts-legacy',
        dlcId: 'hogwarts-arena',
        title: 'Dark Magic Mastery',
        description: 'Defeat all waves in the Dark Arts Battle Arena.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 42.1,
        tier: 'silver'
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
    ]
  },
  {
    id: 'resident-evil-requiem',
    title: 'Resident Evil Requiem',
    developer: 'Capcom',
    estimatedDifficulty: 8,
    estimatedHours: 40,
    platforms: ['Steam', 'PlayStation 5', 'Xbox Series X/S'],
    releaseYear: 2025,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/library_hero.jpg',
    description: 'Survival horror returns in RE Requiem. Navigate infected city sectors, manage scarce ammunition, and escape the nightmare.',
    dlcs: [
      { id: 're-merc', gameId: 'resident-evil-requiem', title: 'The Mercenaries Extra Mode', achievementsCount: 2 }
    ],
    achievements: [
      {
        id: 're-escape',
        gameId: 'resident-evil-requiem',
        title: 'Escaped the Nightmare',
        description: 'Complete the prologue and escape the police station.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 88.3,
        tier: 'bronze'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 're-s-rank',
        gameId: 'resident-evil-requiem',
        title: 'S-Rank Survivor',
        description: 'Complete the game on Hardcore difficulty with an S Rank.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 3.1,
        tier: 'gold',
        isMissable: true
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 're-knife-only',
        gameId: 'resident-evil-requiem',
        title: 'CQC Master',
        description: 'Complete the entire story using only knife and melee attacks.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 1.2,
        tier: 'gold',
        isMissable: true
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 're-merc-s',
        gameId: 'resident-evil-requiem',
        dlcId: 're-merc',
        title: 'Mercenary Legend',
        description: 'Achieve S Rank on all Mercenary stages.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 12.8,
        tier: 'silver'
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 're-merc-no-damage',
        gameId: 'resident-evil-requiem',
        dlcId: 're-merc',
        title: 'Untouchable',
        description: 'Clear a Mercenaries stage without taking any damage.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 2.3,
        tier: 'gold'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
    ]
  },
  {
    id: 'subnautica',
    title: 'Subnautica',
    developer: 'Unknown Worlds Entertainment',
    estimatedDifficulty: 3,
    estimatedHours: 45,
    platforms: ['Steam', 'PlayStation 5', 'Nintendo Switch', 'Xbox'],
    releaseYear: 2018,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/264710/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/264710/library_hero.jpg',
    description: 'Descend into the depths of an alien underwater world. Craft equipment, pilot submarines and outsmart predators to survive.',
    dlcs: [],
    achievements: [
      {
        id: 'sub-splash',
        gameId: 'subnautica',
        title: 'Getting Your Feet Wet',
        description: 'Deploy your first Survival Lifepod.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 95.1,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'sub-cyclops',
        gameId: 'subnautica',
        title: '40,000 Leagues Under the Sea',
        description: 'Build a Cyclops submarine.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 35.8,
        tier: 'silver'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'sub-cured',
        gameId: 'subnautica',
        title: 'Thermal Activity',
        description: 'Find the thermal active containment facility.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 22.4,
        tier: 'silver'
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'sub-escape',
        gameId: 'subnautica',
        title: 'Go Among the Stars',
        description: 'Launch the Neptune Rocket and escape Planet 4546B.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 18.2,
        tier: 'gold'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
    ]
  },
  {
    id: 'subnautica-2',
    title: 'Subnautica 2',
    developer: 'Unknown Worlds Entertainment',
    estimatedDifficulty: 4,
    estimatedHours: 50,
    platforms: ['Steam', 'PlayStation 5', 'Xbox Series X/S'],
    releaseYear: 2025,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1962700/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1962700/library_hero.jpg',
    description: 'Return to Planet 4546B in Subnautica 2. Explore entirely new deep-sea biomes and unearth ancient secrets.',
    dlcs: [],
    achievements: [
      {
        id: 'sub2-dive',
        gameId: 'subnautica-2',
        title: 'Deep Diver',
        description: 'Dive below 500 meters for the first time.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 78.4,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'sub2-leviathan',
        gameId: 'subnautica-2',
        title: 'Leviathan Researcher',
        description: 'Scan all deep-sea leviathan species.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 5.9,
        tier: 'gold',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'sub2-outpost',
        gameId: 'subnautica-2',
        title: 'Underwater Metropolis',
        description: 'Build a deep-sea outpost with 15 linked chambers.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 24.5,
        tier: 'silver'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
    ]
  },
  {
    id: 'dying-light',
    title: 'Dying Light',
    developer: 'Techland',
    estimatedDifficulty: 6,
    estimatedHours: 65,
    platforms: ['Steam', 'PlayStation 4', 'Xbox One'],
    releaseYear: 2015,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/239140/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/239140/library_hero.jpg',
    description: 'First-person action survival game set in a vast open world. Roam a city devastated by a mysterious epidemic.',
    dlcs: [
      { id: 'dl-following', gameId: 'dying-light', title: 'The Following Expansion', achievementsCount: 2 }
    ],
    achievements: [
      {
        id: 'dl-parkour',
        gameId: 'dying-light',
        title: 'Flight of the Crane',
        description: 'Jump from a height of over 100 meters without dying.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 74.2,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'dl-night',
        gameId: 'dying-light',
        title: 'Survivor of the Night',
        description: 'Survive your first night outside the safe zones.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 86.1,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'dl-legend',
        gameId: 'dying-light',
        title: 'Legendary Status',
        description: 'Reach maximum rank in any of your active skill trees.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 10.4,
        tier: 'gold'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'dl-following-buggy',
        gameId: 'dying-light',
        dlcId: 'dl-following',
        title: 'Speed Demon',
        description: 'Fully upgrade the buggy vehicle in The Following.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 29.5,
        tier: 'silver'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'dl-following-story',
        gameId: 'dying-light',
        dlcId: 'dl-following',
        title: 'The Sacred Mother',
        description: 'Complete the main storyline of The Following.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 14.8,
        tier: 'gold'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
    ]
  },
  {
    id: 'dying-light-beast',
    title: 'Dying Light: The Beast',
    developer: 'Techland',
    estimatedDifficulty: 7,
    estimatedHours: 40,
    platforms: ['Steam', 'PlayStation 5', 'Xbox Series X/S'],
    releaseYear: 2025,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3008130/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3008130/library_hero.jpg',
    description: 'Play as Kyle Crane once again in Dying Light: The Beast, returning to a dense, infected rural zone with brand new survival capabilities.',
    dlcs: [],
    achievements: [
      {
        id: 'dlb-crane-returns',
        gameId: 'dying-light-beast',
        title: 'Beast Unleashed',
        description: 'Unlock Kyle Crane\'s beast mode abilities.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 81.3,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'dlb-hunted',
        gameId: 'dying-light-beast',
        title: 'Apex Predator',
        description: 'Defeat the lead RDA hunter stalking the valley.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 4.8,
        tier: 'gold'
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
    ]
  },
  {
    id: 'ghost-tsushima',
    title: 'Ghost of Tsushima',
    developer: 'Sucker Punch Productions',
    estimatedDifficulty: 4,
    estimatedHours: 60,
    platforms: ['Steam', 'PlayStation 5', 'PlayStation 4'],
    releaseYear: 2020,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2215430/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2215430/library_hero.jpg',
    description: 'In the late 13th century, the Mongol empire has laid waste to entire nations. Samurai warrior Jin Sakai must sacrifice everything to protect his home.',
    dlcs: [
      { id: 'tsushima-iki-island', gameId: 'ghost-tsushima', title: 'Iki Island Expansion', achievementsCount: 2 }
    ],
    achievements: [
      {
        id: 'got-way-of-samurai',
        gameId: 'ghost-tsushima',
        title: 'Stoking the Flame',
        description: 'Rescue Lord Shimura from Castle Kaneda.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 92.4,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'got-honor',
        gameId: 'ghost-tsushima',
        title: 'Have a Nice Fall',
        description: 'Kill an enemy by kicking them off a cliff.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 48.7,
        tier: 'bronze',
        isMissable: true
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'got-legend',
        gameId: 'ghost-tsushima',
        title: 'The Ghost of Legend',
        description: 'Build your legend to earn the title "The Ghost of Tsushima".',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 54.3,
        tier: 'silver'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'got-liberator',
        gameId: 'ghost-tsushima',
        title: 'Master Liberator',
        description: 'Liberate all occupied Mongol camps in Tsushima.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 15.6,
        tier: 'gold',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'got-iki-shrine',
        gameId: 'ghost-tsushima',
        dlcId: 'tsushima-iki-island',
        title: 'Monkey See, Monkey Do',
        description: 'Solve all wind shrines on Iki Island.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 28.3,
        tier: 'silver',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'got-iki-story',
        gameId: 'ghost-tsushima',
        dlcId: 'tsushima-iki-island',
        title: 'Redeemed Past',
        description: 'Complete the Iki Island campaign and conquer the Eagle\'s forces.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 18.5,
        tier: 'gold'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
    ]
  },
  {
    id: 'horizon-zero-dawn',
    title: 'Horizon Zero Dawn',
    developer: 'Guerrilla Games',
    estimatedDifficulty: 4,
    estimatedHours: 55,
    platforms: ['Steam', 'PlayStation 4', 'PC'],
    releaseYear: 2017,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1151640/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1151640/library_hero.jpg',
    description: 'Experience Aloy\'s legendary quest to unravel the mysteries of a future Earth ruled by lethal machines.',
    dlcs: [
      { id: 'horizon-frozen-wilds', gameId: 'horizon-zero-dawn', title: 'The Frozen Wilds', achievementsCount: 2 }
    ],
    achievements: [
      {
        id: 'hzd-first-focus',
        gameId: 'horizon-zero-dawn',
        title: 'Saved the Outcast',
        description: 'Earned the Focus and discovered your destiny.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 96.1,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'hzd-tallneck',
        gameId: 'horizon-zero-dawn',
        title: 'All Tallnecks Overridden',
        description: 'Scale all Tallnecks to map the entire wilderness.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 38.4,
        tier: 'silver',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'hzd-all-hunting',
        gameId: 'horizon-zero-dawn',
        title: 'Blazing Suns',
        description: 'Earn a Blazing Sun mark in every trial at all Hunting Grounds.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 9.3,
        tier: 'gold'
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'hzd-wilds-story',
        gameId: 'horizon-zero-dawn',
        dlcId: 'horizon-frozen-wilds',
        title: 'Conquered the Cut',
        description: 'Defeat the Daemon machine threat in the Frozen Wilds.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 21.4,
        tier: 'gold'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'hzd-wilds-weapons',
        gameId: 'horizon-zero-dawn',
        dlcId: 'horizon-frozen-wilds',
        title: 'Shaman\'s Arsenal',
        description: 'Acquire and fully upgrade all 3 elemental weapons of the Banuk.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 15.6,
        tier: 'silver'
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
    ]
  },
  {
    id: 'last-of-us-1',
    title: 'The Last of Us Part I',
    developer: 'Naughty Dog',
    estimatedDifficulty: 5,
    estimatedHours: 30,
    platforms: ['Steam', 'PlayStation 5'],
    releaseYear: 2022,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888930/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888930/library_hero.jpg',
    description: 'In a ravaged civilization, where infected and hardened survivors run wild, Joel, a weary protagonist, is hired to smuggle 14-year-old Ellie out of a military quarantine zone.',
    dlcs: [
      { id: 'tlou-left-behind', gameId: 'last-of-us-1', title: 'Left Behind', achievementsCount: 2 }
    ],
    achievements: [
      {
        id: 'tlou-firefly',
        gameId: 'last-of-us-1',
        title: 'Look for the Light',
        description: 'Find all 30 Firefly pendants hidden throughout the sectors.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 14.2,
        tier: 'silver',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'tlou-scavenger',
        gameId: 'last-of-us-1',
        title: 'Scavenger Master',
        description: 'Open all locked shiv doors across the campaign.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 8.9,
        tier: 'gold',
        isMissable: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'tlou-story-completed',
        gameId: 'last-of-us-1',
        title: 'No Matter What',
        description: 'Complete the main story on any difficulty setting.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 62.4,
        tier: 'silver'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'tlou-lb-mall',
        gameId: 'last-of-us-1',
        dlcId: 'tlou-left-behind',
        title: 'Don\'t Go',
        description: 'Complete the Left Behind story.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 48.3,
        tier: 'silver'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'tlou-lb-brick',
        gameId: 'last-of-us-1',
        dlcId: 'tlou-left-behind',
        title: 'Brick Master',
        description: 'Win the brick throwing competition against Riley without getting hit.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 29.4,
        tier: 'bronze',
        isMissable: true
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
    ]
  },
  {
    id: 'last-of-us-2',
    title: 'The Last of Us Part II',
    developer: 'Naughty Dog',
    estimatedDifficulty: 5,
    estimatedHours: 45,
    platforms: ['PlayStation 5', 'PlayStation 4'],
    releaseYear: 2020,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2531310/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2531310/library_hero.jpg',
    description: 'Ellie embarks on a relentless pursuit of vengeance after a traumatic event disrupts her peaceful life in Jackson.',
    dlcs: [
      { id: 'tlou2-grounded', gameId: 'last-of-us-2', title: 'Grounded Mode Update', achievementsCount: 2 }
    ],
    achievements: [
      {
        id: 'tlou2-upgrade',
        gameId: 'last-of-us-2',
        title: 'Survivalist',
        description: 'Learn all player upgrades in a single playthrough.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 28.5,
        tier: 'silver'
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'tlou2-cards',
        gameId: 'last-of-us-2',
        title: 'Master Scavenger',
        description: 'Find all collectible trading cards as Ellie.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 7.6,
        tier: 'gold',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'tlou2-grounded-story',
        gameId: 'last-of-us-2',
        dlcId: 'tlou2-grounded',
        title: 'Dig Two Graves',
        description: 'Complete the campaign on Grounded difficulty.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 1.1,
        tier: 'gold'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'tlou2-grounded-permadeath',
        gameId: 'last-of-us-2',
        dlcId: 'tlou2-grounded',
        title: 'You Can\'t Stop This',
        description: 'Complete the campaign with any Permadeath setting active.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 2.3,
        tier: 'gold',
        isMissable: true
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
    ]
  },
  {
    id: 'life-is-strange',
    title: 'Life is Strange',
    developer: 'DONTNOD Entertainment',
    estimatedDifficulty: 2,
    estimatedHours: 15,
    platforms: ['Steam', 'PlayStation 4', 'Xbox One'],
    releaseYear: 2015,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/319630/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/319630/library_hero.jpg',
    description: 'Rewind time and alter the course of events in the story of Max Caulfield, a photography senior who discovers she can reverse time to save her best friend.',
    dlcs: [],
    achievements: [
      {
        id: 'lis-ch1',
        gameId: 'life-is-strange',
        title: 'Chrysalis',
        description: 'Complete Episode 1: Chrysalis.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 94.2,
        tier: 'bronze'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'lis-photos',
        gameId: 'life-is-strange',
        title: 'Shutter Bug',
        description: 'Take all optional photos in Episode 1.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 35.6,
        tier: 'silver',
        isCollectible: true,
        isMissable: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'lis-master',
        gameId: 'life-is-strange',
        title: 'Visionary',
        description: 'Take all optional photos across all 5 episodes.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 15.3,
        tier: 'gold',
        isCollectible: true,
        isMissable: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
    ]
  },
  {
    id: 'red-dead-2',
    title: 'Red Dead Redemption 2',
    developer: 'Rockstar Games',
    estimatedDifficulty: 6,
    estimatedHours: 150,
    platforms: ['Steam', 'PlayStation 4', 'Xbox One'],
    releaseYear: 2018,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/library_hero.jpg',
    description: 'America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best bounty hunters massing, they must rob, steal and fight.',
    dlcs: [],
    achievements: [
      {
        id: 'rdr-outlaw',
        gameId: 'red-dead-2',
        title: 'Back in the Mud',
        description: 'Complete Chapter 1.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 91.2,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'rdr-gold',
        gameId: 'red-dead-2',
        title: 'Gold Rush',
        description: 'Earn 70 Gold Medals in story missions.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 2.1,
        tier: 'gold',
        isMissable: true
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'rdr-zoologist',
        gameId: 'red-dead-2',
        title: 'Zoologist',
        description: 'Study every animal species across all states.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 1.5,
        tier: 'gold',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'rdr-bears',
        gameId: 'red-dead-2',
        title: 'Grin and Bear It',
        description: 'Survive 18 bear attacks and kill the bear each time in story mode.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 6.4,
        tier: 'silver'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
    ]
  },
  {
    id: 'resident-evil-village',
    title: 'Resident Evil Village',
    developer: 'Capcom',
    estimatedDifficulty: 6,
    estimatedHours: 35,
    platforms: ['Steam', 'PlayStation 5', 'Xbox Series X/S'],
    releaseYear: 2021,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1196590/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1196590/library_hero.jpg',
    description: 'Set a few years after the horrifying events in Resident Evil 7, the all-new storyline begins with Ethan Winters and his wife Mia living peacefully in a new location.',
    dlcs: [
      { id: 'rev-shadow-rose', gameId: 'resident-evil-village', title: 'Shadows of Rose DLC', achievementsCount: 2 }
    ],
    achievements: [
      {
        id: 'rev-survivor',
        gameId: 'resident-evil-village',
        title: 'Not Lycan This',
        description: 'Survive the Lycan attack during the introduction.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 94.5,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'rev-speedrun',
        gameId: 'resident-evil-village',
        title: 'Dashing Dad',
        description: 'Finish the story mode within 3 hours.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 8.7,
        tier: 'gold',
        isMissable: true
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'rev-rose-completed',
        gameId: 'resident-evil-village',
        dlcId: 'rev-shadow-rose',
        title: 'Green Teen',
        description: 'Finish Shadows of Rose on any difficulty.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 35.4,
        tier: 'silver'
      ,
        guide: 'Requires high mechanical skill. Fully upgrade your primary weapon loadout, memorize boss attack telegraphs, and utilize active parries or dodges.'
      },
      {
        id: 'rev-rose-hardcore',
        gameId: 'resident-evil-village',
        dlcId: 'rev-shadow-rose',
        title: 'Supreme Rose',
        description: 'Finish Shadows of Rose on Hardcore difficulty.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 5.1,
        tier: 'gold'
      ,
        guide: 'Requires high mechanical skill. Fully upgrade your primary weapon loadout, memorize boss attack telegraphs, and utilize active parries or dodges.'
      },
    ]
  },
  {
    id: 'sekiro',
    title: 'Sekiro: Shadows Die Twice',
    developer: 'FromSoftware',
    estimatedDifficulty: 9,
    estimatedHours: 60,
    platforms: ['Steam', 'PlayStation 4', 'Xbox One'],
    releaseYear: 2019,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/library_hero.jpg',
    description: 'Explore late 1500s Sengoku Japan, a brutal period of constant life and death conflict, as you come face-to-face with larger-than-life foes.',
    dlcs: [],
    achievements: [
      {
        id: 'sek-gyobu',
        gameId: 'sekiro',
        title: 'Gyoubu Masataka Oniwa',
        description: 'Defeat the horseman gatekeeper Gyoubu.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 71.3,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'sek-isshin',
        gameId: 'sekiro',
        title: 'Sword Saint Isshin Ashina',
        description: 'Defeat the Sword Saint Isshin Ashina in the flower field.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 23.4,
        tier: 'gold'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'sek-all-bosses',
        gameId: 'sekiro',
        title: 'Man Without Equal',
        description: 'Defeat all bosses in a single save file (requires NG+).',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 8.9,
        tier: 'gold',
        isMissable: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'sek-prosthetic',
        gameId: 'sekiro',
        title: 'Master of the Prosthetic',
        description: 'Fully upgrade all Prosthetic Tools.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 15.2,
        tier: 'silver',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
    ]
  },
  {
    id: 'stray',
    title: 'Stray',
    developer: 'BlueTwelve Studio',
    estimatedDifficulty: 3,
    estimatedHours: 12,
    platforms: ['Steam', 'PlayStation 5', 'PlayStation 4', 'Xbox'],
    releaseYear: 2022,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1332010/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1332010/library_hero.jpg',
    description: 'Lost, alone and separated from family, a stray cat must untangle an ancient mystery to escape a long-forgotten cybercity.',
    dlcs: [],
    achievements: [
      {
        id: 'str-meow',
        gameId: 'stray',
        title: 'A Little Chat',
        description: 'Meow 100 times.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 96.8,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'str-nap',
        gameId: 'stray',
        title: 'Productive Day',
        description: 'Sleep for more than one hour in real time.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 42.1,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'str-speedrun',
        gameId: 'stray',
        title: 'I am Speed',
        description: 'Complete the entire game in under 2 hours.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 6.4,
        tier: 'gold',
        isMissable: true
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'str-badges',
        gameId: 'stray',
        title: 'Badges',
        description: 'Find and collect all decorative badges.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 24.3,
        tier: 'silver',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
    ]
  },
  {
    id: 'baldurs-gate-3',
    title: 'Baldur\'s Gate 3',
    developer: 'Larian Studios',
    estimatedDifficulty: 6,
    estimatedHours: 120,
    platforms: ['Steam', 'PlayStation 5', 'Xbox Series X/S'],
    releaseYear: 2023,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/library_hero.jpg',
    description: 'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power.',
    dlcs: [],
    achievements: [
      {
        id: 'bg3-escape',
        gameId: 'baldurs-gate-3',
        title: 'Descent from Avernus',
        description: 'Take control of the Nautiloid and escape the Hells.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 94.3,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'bg3-tactician',
        gameId: 'baldurs-gate-3',
        title: 'Critical Hit',
        description: 'Complete the game on Tactician difficulty.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 4.8,
        tier: 'gold'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'bg3-honor',
        gameId: 'baldurs-gate-3',
        title: 'Foehammer',
        description: 'Complete the game on Honor Mode.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 1.2,
        tier: 'gold',
        isMissable: true
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'bg3-romance',
        gameId: 'baldurs-gate-3',
        title: 'Roleplayer',
        description: 'Successfully complete a romance storyline with a companion.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 45.6,
        tier: 'silver',
        isMissable: true
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
    ]
  },
  {
    id: 'dark-souls-3',
    title: 'Dark Souls 3',
    developer: 'FromSoftware',
    estimatedDifficulty: 8,
    estimatedHours: 80,
    platforms: ['Steam', 'PlayStation 4', 'Xbox One'],
    releaseYear: 2016,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/374320/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/374320/library_hero.jpg',
    description: 'As fires fade and the world falls into ruin, journey into a universe filled with more colossal enemies and environments.',
    dlcs: [
      { id: 'ds3-ringed-city', gameId: 'dark-souls-3', title: 'The Ringed City DLC', achievementsCount: 1 }
    ],
    achievements: [
      {
        id: 'ds3-gundyr',
        gameId: 'dark-souls-3',
        title: 'Iudex Gundyr',
        description: 'Defeat the gatekeeper Iudex Gundyr in the cemetery.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 88.4,
        tier: 'bronze'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'ds3-covenants',
        gameId: 'dark-souls-3',
        title: 'Master of Expression',
        description: 'Learn all gestures from characters.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 14.3,
        tier: 'silver',
        isCollectible: true,
        isMissable: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'ds3-all-rings',
        gameId: 'dark-souls-3',
        title: 'Master of Rings',
        description: 'Acquire all rings across New Game cycles.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 4.5,
        tier: 'gold',
        isCollectible: true,
        isMissable: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'ds3-ringed-story',
        gameId: 'dark-souls-3',
        dlcId: 'ds3-ringed-city',
        title: 'The Dark Soul of Man',
        description: 'Defeat Slave Knight Gael at the end of the world.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 19.8,
        tier: 'gold'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
    ]
  },
  {
    id: 'dune-awakening',
    title: 'Dune Awakening',
    developer: 'Funcom',
    estimatedDifficulty: 6,
    estimatedHours: 100,
    platforms: ['Steam', 'PlayStation 5', 'Xbox Series X/S'],
    releaseYear: 2025,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172710/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172710/library_hero.jpg',
    description: 'Rise from survival to dominance in Arrakis. A massive multiplayer online open-world survival game set on the desert planet.',
    dlcs: [],
    achievements: [
      {
        id: 'dune-spice',
        gameId: 'dune-awakening',
        title: 'First Harvest',
        description: 'Successfully harvest spice blow deposits.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 64.2,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'dune-worm',
        gameId: 'dune-awakening',
        title: 'Shai-Hulud Witness',
        description: 'Survive a giant sandworm encounter in the deep desert.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 35.1,
        tier: 'silver'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'dune-guild',
        gameId: 'dune-awakening',
        title: 'Arrakeen Emperor',
        description: 'Capture and control a major base in the deep desert for 24 hours.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 2.4,
        tier: 'gold'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
    ]
  },
  {
    id: 'elden-ring-nightreign',
    title: 'Elden Ring Nightreign',
    developer: 'FromSoftware',
    estimatedDifficulty: 8,
    estimatedHours: 50,
    platforms: ['Steam', 'PlayStation 5', 'Xbox Series X/S'],
    releaseYear: 2026,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2622380/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2622380/library_hero.jpg',
    description: 'A spin-off focused coop-survival game set in the Lands Between, battling endless waves of monsters in the darkest nights.',
    dlcs: [],
    achievements: [
      {
        id: 'ern-night-1',
        gameId: 'elden-ring-nightreign',
        title: 'Survive the Eclipse',
        description: 'Clear wave 20 during the blood red eclipse.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 54.2,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'ern-god',
        gameId: 'elden-ring-nightreign',
        title: 'Reign of the Crucible',
        description: 'Defeat the Night Crucible Knight without losing any teammates.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 3.4,
        tier: 'gold'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
    ]
  },
  {
    id: 'elden-ring',
    title: 'Elden Ring',
    developer: 'FromSoftware',
    estimatedDifficulty: 7,
    estimatedHours: 100,
    platforms: ['Steam', 'PlayStation 5', 'Xbox Series X/S'],
    releaseYear: 2022,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_hero.jpg',
    description: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
    dlcs: [
      { id: 'er-shadow-erdtree', gameId: 'elden-ring', title: 'Shadow of the Erdtree', achievementsCount: 2 }
    ],
    achievements: [
      {
        id: 'er-margit',
        gameId: 'elden-ring',
        title: 'Margit, the Fell Omen',
        description: 'Defeat Margit, the Fell Omen at Stormveil gates.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 84.6,
        tier: 'bronze'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'er-malenia',
        gameId: 'elden-ring',
        title: 'Shardbearer Malenia',
        description: 'Defeat Shardbearer Malenia, Blade of Miquella in the Haligtree.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 18.3,
        tier: 'gold',
        isMissable: true
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'er-elden-lord',
        gameId: 'elden-ring',
        title: 'Elden Lord',
        description: 'Achieve the "Elden Lord" ending campaign.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 24.5,
        tier: 'gold',
        isMissable: true
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'er-shadow-messmer',
        gameId: 'elden-ring',
        dlcId: 'er-shadow-erdtree',
        title: 'Messmer the Impaler',
        description: 'Defeat Messmer the Impaler in the Shadow Realm.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 22.1,
        tier: 'gold'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'er-shadow-radahn',
        gameId: 'elden-ring',
        dlcId: 'er-shadow-erdtree',
        title: 'Consort Radahn Conqueror',
        description: 'Defeat Promised Consort Radahn in the Enir-Ilim temple.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 9.8,
        tier: 'gold'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
    ]
  },
  {
    id: 'fallout-4',
    title: 'Fallout 4',
    developer: 'Bethesda Game Studios',
    estimatedDifficulty: 4,
    estimatedHours: 90,
    platforms: ['Steam', 'PlayStation 4', 'Xbox One'],
    releaseYear: 2015,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/377160/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/377160/library_hero.jpg',
    description: 'As the sole survivor of Vault 111, you enter a world destroyed by nuclear war. Only you can rebuild and determine the fate of the Wasteland.',
    dlcs: [
      { id: 'fo4-far-harbor', gameId: 'fallout-4', title: 'Far Harbor Expansion', achievementsCount: 2 }
    ],
    achievements: [
      {
        id: 'fo4-war-never-changes',
        gameId: 'fallout-4',
        title: 'War Never Changes',
        description: 'Enter the Wasteland from Vault 111.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 98.2,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'fo4-bobblehead',
        gameId: 'fallout-4',
        title: 'They\'re Action Figures',
        description: 'Find all 20 Vault-Tec Bobbleheads.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 6.8,
        tier: 'gold',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'fo4-far-fog',
        gameId: 'fallout-4',
        dlcId: 'fo4-far-harbor',
        title: 'Far Harbor Wanderer',
        description: 'Discover 20 locations in the foggy Far Harbor island.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 24.3,
        tier: 'silver',
        isCollectible: true
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'fo4-far-story',
        gameId: 'fallout-4',
        dlcId: 'fo4-far-harbor',
        title: 'Close to Home',
        description: 'Complete the main quest line in Far Harbor.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 15.6,
        tier: 'gold'
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
    ]
  },
  {
    id: 'god-of-war',
    title: 'God of War',
    developer: 'Santa Monica Studio',
    estimatedDifficulty: 5,
    estimatedHours: 50,
    platforms: ['Steam', 'PlayStation 4', 'PC'],
    releaseYear: 2018,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/library_hero.jpg',
    description: 'His vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse Gods and monsters.',
    dlcs: [],
    achievements: [
      {
        id: 'gow-journey',
        gameId: 'god-of-war',
        title: 'The Journey Begins',
        description: 'Defend your home from the Stranger.',
        iconUrl: getTrophyIcon('bronze'),
        rarityPercentage: 97.4,
        tier: 'bronze'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'gow-valkyrie',
        gameId: 'god-of-war',
        title: 'Chooser of the Slain',
        description: 'Defeat the 9 Valkyries scattered around the realms.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 7.2,
        tier: 'gold',
        isCollectible: true
      ,
        guide: 'Story-related, unmissable. Focus on the main campaign quest markers. Upgrade your skills and gear regularly as you progress.'
      },
      {
        id: 'gow-treasures',
        gameId: 'god-of-war',
        title: 'Curator',
        description: 'Find all artifacts hidden across Midgard.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 15.4,
        tier: 'silver',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
    ]
  },
  {
    id: 'star-trucker',
    title: 'Star Trucker',
    developer: 'Monster and Monster',
    estimatedDifficulty: 4,
    estimatedHours: 40,
    platforms: ['Steam', 'PC'],
    releaseYear: 2024,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2380050/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2380050/library_hero.jpg',
    description: 'Haul cargo through space, salvage debris, and converse with eccentric drivers in this retro-inspired celestial trucking game.',
    dlcs: [],
    achievements: [
      {
        id: 'st-miles',
        gameId: 'star-trucker',
        title: 'Cosmic Hauler',
        description: 'Drive a total of 10,000 light-years.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 25.1,
        tier: 'silver'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'st-perfect',
        gameId: 'star-trucker',
        title: 'Flawless Delivery',
        description: 'Complete a long-distance cargo delivery without damaging your load.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 8.9,
        tier: 'gold'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
    ]
  },
  {
    id: 'batman-arkham-asylum',
    title: 'Batman Arkham Asylum GOTY',
    developer: 'Rocksteady Studios',
    estimatedDifficulty: 5,
    estimatedHours: 25,
    platforms: ['Steam', 'PlayStation 3', 'Xbox 360'],
    releaseYear: 2009,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/35140/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/35140/library_hero.jpg',
    description: 'Navigate Arkham Asylum as the Dark Knight. Battle inmate breakouts, uncover Joker\'s plot, and solve Riddler\'s clues.',
    dlcs: [],
    achievements: [
      {
        id: 'aa-comboking',
        gameId: 'batman-arkham-asylum',
        title: 'Freeflow Combo 40',
        description: 'Complete a combo of 40 moves in any combat arena.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 18.5,
        tier: 'silver'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'aa-riddler',
        gameId: 'batman-arkham-asylum',
        title: 'Crack the Riddler\'s Code',
        description: 'Find all 240 Riddler trophies and solve every riddle.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 9.2,
        tier: 'gold',
        isCollectible: true
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
    ]
  },
  {
    id: 'batman-arkham-city',
    title: 'Batman Arkham City GOTY',
    developer: 'Rocksteady Studios',
    estimatedDifficulty: 6,
    estimatedHours: 40,
    platforms: ['Steam', 'PlayStation 3', 'Xbox 360'],
    releaseYear: 2011,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/200260/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/200260/library_hero.jpg',
    description: 'Explore the heavily fortified walled district in the heart of Gotham City, home to the city\'s most dangerous thugs.',
    dlcs: [
      { id: 'ac-harley-revenge', gameId: 'batman-arkham-city', title: 'Harley Quinn\'s Revenge', achievementsCount: 1 }
    ],
    achievements: [
      {
        id: 'ac-story',
        gameId: 'batman-arkham-city',
        title: 'Perfect Knight Part 2',
        description: 'Complete all side missions, riddles, campaigns, and challenge campaigns.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 2.1,
        tier: 'gold'
      ,
        guide: 'Best completed using an interactive collectibles guide map. Keep track of your regional checklists and look out for glowing highlights in the environment.'
      },
      {
        id: 'ac-harley-dlc',
        gameId: 'batman-arkham-city',
        dlcId: 'ac-harley-revenge',
        title: 'Lost Property',
        description: 'Defeat Harley Quinn\'s new thugs in the shipyard complex.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 35.4,
        tier: 'silver'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
    ]
  },
  {
    id: 'batman-arkham-knight',
    title: 'Batman Arkham Knight',
    developer: 'Rocksteady Studios',
    estimatedDifficulty: 6,
    estimatedHours: 50,
    platforms: ['Steam', 'PlayStation 4', 'Xbox One'],
    releaseYear: 2015,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/208650/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/208650/library_hero.jpg',
    description: 'Batman faces the ultimate threat against the city that he is sworn to protect, as Scarecrow returns to unite the super criminals of Gotham.',
    dlcs: [],
    achievements: [
      {
        id: 'ak-batmobile',
        gameId: 'batman-arkham-knight',
        title: 'Brutality 101',
        description: 'Perform 15 different combat moves in one Freeflow Combo.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 3.4,
        tier: 'gold'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
    ]
  },
  {
    id: 'days-gone',
    title: 'Days Gone',
    developer: 'Bend Studio',
    estimatedDifficulty: 4,
    estimatedHours: 60,
    platforms: ['Steam', 'PlayStation 4', 'PC'],
    releaseYear: 2019,
    coverUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1030840/library_600x900.jpg',
    bannerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1030840/library_hero.jpg',
    description: 'Ride and fight into a deadly, post-pandemic America. Play as Deacon St. John, a bounty hunter and drifter who roams the broken road.',
    dlcs: [],
    achievements: [
      {
        id: 'dg-horde',
        gameId: 'days-gone',
        title: 'One Down',
        description: 'Defeat your first Freaker Horde in the wilderness.',
        iconUrl: getTrophyIcon('silver'),
        rarityPercentage: 38.6,
        tier: 'silver'
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
      {
        id: 'dg-camp',
        gameId: 'days-gone',
        title: 'Best Friends Forever',
        description: 'Reach maximum Trust level with three different survivor camps.',
        iconUrl: getTrophyIcon('gold'),
        rarityPercentage: 12.1,
        tier: 'gold',
        isCollectible: true
      ,
        guide: 'Can be completed in free-roam post-game. Focus on leveling up your secondary capabilities and farm resources in designated high-yield zones.'
      },
    ]
  }
];
