'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { PRELOADED_GAMES } from '@/data/preloadedGames';
import { 
  Trophy, Search, Clock, ShieldAlert, BookOpen, ChevronRight, 
  CheckCircle2, Star, Sparkles, Compass, AlertTriangle, 
  MapPin, Check, Sliders, Award, BrainCircuit, Wrench
} from 'lucide-react';

// Custom rich detailed 4-stage roadmaps for the primary preloaded games
const GAME_ROADMAPS: Record<string, Array<{ title: string; subtitle: string; hours: string; targets: string; desc: string }>> = {
  'elden-ring': [
    {
      title: 'Stage 1: Main Story Campaign & Unmissable Demigods',
      subtitle: 'Establish your build, defeat core bosses, and reach the Ashen Capital path.',
      hours: '0-40 Hours',
      targets: 'Margit, Godrick, Rennala, Rykard, Morgott, Fire Giant, Maliketh',
      desc: 'Play through the gorgeous open world at your own pace. Locate golden seeds and sacred tears to upgrade your healing flasks. Defeat at least two Shardbearers (Godrick and Rennala are recommended) to gain access to Leyndell, Royal Capital. Defeat Morgott and advance to the Mountaintops of the Giants to light the Forge. WARNING: Do not trigger the final point of no return at the Capital until you have secured Leyndell collectibles!'
    },
    {
      title: 'Stage 2: Legendary Armaments, Spells & Missable Quests',
      subtitle: 'Complete character storylines and gather missable gold achievements.',
      hours: '40-70 Hours',
      targets: 'Bolt of Gransax, Dark Moon Greatsword, Ranni the Witch, Fia, Goldmask',
      desc: 'Embark on detailed questlines. Crucially, complete Ranni\'s questline to secure the Dark Moon Greatsword and Fia\'s questline for the Lichdragon Fortissax fight. IMPORTANT: Make sure you pick up the Bolt of Gransax from the giant spear in Leyndell BEFORE defeating Maliketh, Black Blade; once the capital is covered in ash, this legendary weapon becomes permanently locked out for the current playthrough!'
    },
    {
      title: 'Stage 3: Secret Regions & Hard Optional Demigods',
      subtitle: 'Navigate secret portals, brave the Haligtree, and slay Malenia.',
      hours: '70-90 Hours',
      targets: 'Shardbearer Malenia, Lord of Blood Mohg, Haligtree Canopy, Consecrated Snowfield',
      desc: 'Collect the Haligtree Secret Medallion halves (from Albus in Liurnia and Castle Sol in the Mountaintops) to access the Consecrated Snowfield. Use the teleporter to enter Mohgwyn Palace and defeat Mohg, Lord of Blood. Solve the light puzzle in Ordina, Liturgical Town to unlock Miquella\'s Haligtree. Reach the deepest chamber to face Malenia, Blade of Miquella.'
    },
    {
      title: 'Stage 4: Ending Cleanups & Platinum Unlocking',
      subtitle: 'Backup saves, complete miscellaneous achievements, and claim your Platinum.',
      hours: '90-100 Hours',
      targets: 'Elden Lord, Age of the Stars, Lord of Frenzied Flame, Remaining Bosses',
      desc: 'Clear out any remaining minor dungeon bosses (e.g. Astel, Dragonkin Soldier). Before interacting with the fractured Elden Ring in the final arena, upload your save file to the cloud or backup local saves. This allows you to reload and trigger all three key ending achievements (Elden Lord, Age of the Stars, Lord of Frenzied Flame) in a single playthrough, avoiding the need for two additional Full New Game+ cycles!'
    }
  ],
  'stray': [
    {
      title: 'Stage 1: Casual Blind Story Run',
      subtitle: 'Enjoy the atmosphere, explore the neon cybercity, and build basic muscle memory.',
      hours: '0-6 Hours',
      targets: 'Main Story, A Little Chat, Productive Day, Boom Chat Kalaka',
      desc: 'Complete the main campaign. Take your time exploring the cozy alleys of the Slums, Antvillage, and Midtown. Interact with the robotic residents, scratch carpets, sleep in warm corners, and meow at security cameras. Most traversal and story-locked trophies will unlock naturally during this run.'
    },
    {
      title: 'Stage 2: Collectibles Cleanup & Badges',
      subtitle: 'Replay chapters to secure all B-12 memories, sheet music, and pins.',
      hours: '6-9 Hours',
      targets: 'Badges, I Remember!, Meow, Territory, Cat-a-pult',
      desc: 'Use Chapter Select to find any missed B-12 Memories (27 in total) and collect all 6 decorative Cat Badges. Additionally, scratch an item in every single chapter to unlock the "Territory" silver trophy, and ensure you meow 100 times for the "A Little Chat" bronze trophy.'
    },
    {
      title: 'Stage 3: Challenge Actions & Pacifist Runs',
      subtitle: 'Execute specific action-based achievements in high-danger sections.',
      hours: '9-11 Hours',
      targets: 'Can\'t Cat-ch Me, Pacifist, Sneakitty, Curious Cat',
      desc: 'Target specific combat and stealth challenges. Complete the first Zurk escape sequence in Chapter 2 without getting touched once ("Can\'t Cat-ch Me" - extremely frustrating, requires rapid zigzag running). Complete the entire Sewers chapter without killing a single Zurk ("Pacifist"). Complete Midtown Factory stealth sections without being spotted by Sentinels ("Sneakitty").'
    },
    {
      title: 'Stage 4: "I am Speed" Speedrun Run',
      subtitle: 'Start a fresh profile and beat the entire game under 2 hours.',
      hours: '11-12 Hours',
      targets: 'I am Speed, Platinum Trophy',
      desc: 'Start a new save file. Skip all cutscenes, avoid talking to optional NPCs, and run straight to key objectives. Memorize puzzle codes: Slums Flat door (3748), Slums safe (code: binary sheet), Midtown shop safe (8542). Complete the game in under 2 hours to earn the Gold Speedrun trophy and lock in your gorgeous Platinum!'
    }
  ],
  'detroit-human': [
    {
      title: 'Stage 1: "Everyone Survives" Pacifist Campaign',
      subtitle: 'Keep all primary characters alive and make moral choices.',
      hours: '0-15 Hours',
      targets: 'Survivors, Thank You, Deviant Located, Happy Family, Moral Victory',
      desc: 'Complete your first playthrough aiming for the absolute best outcome. Markus must choose exclusively peaceful protests; Connor must choose deviant dialogue choices, build a close friendship with Hank, and locate Jericho; Kara must successfully escape Zlatko\'s estate and avoid resetting. Luther, Simon, Josh, and North must all survive. Avoid any violent options.'
    },
    {
      title: 'Stage 2: "I\'ll Be Back" Connor Deaths & Violent Revolution',
      subtitle: 'Connor must die and return at every opportunity, while Markus leads a violent war.',
      hours: '15-25 Hours',
      targets: 'I\'ll Be Back, Liberation, Burn the Capital, Nothing to See Here',
      desc: 'Start a new run or replay from Chapter "Partners". Make Connor cold, machine-like, and hostile to Hank. Intentionally fail QTE sequences or choose fatal paths for Connor in every chapter possible (8 total deaths required) to unlock the infamous "I\'ll Be Back" trophy. Meanwhile, lead a bloody violent revolution with Markus, and make tragic decisions for Kara.'
    },
    {
      title: 'Stage 3: Collectibles & Magazine Hunter',
      subtitle: 'Locate and read all 46 digital magazines across the chapters.',
      hours: '25-32 Hours',
      targets: 'Bookworm, These Are Our Stories, Partners',
      desc: 'Use chapter select to find all 46 digital magazines. Note: The magazines that appear in chapters depend heavily on the decisions made in prior chapters! For example, some articles only spawn if Markus chose a violent path, while others require him to be peaceful. You must navigate these branching timelines carefully.'
    },
    {
      title: 'Stage 4: Flowchart 100% Cleanup',
      subtitle: 'Clean up specific chapter achievements and complete branching nodes.',
      hours: '32-35 Hours',
      targets: 'Compliant, Just a Machine, Undefeated, Escapee, Platinum',
      desc: 'Replay specific sections to earn quick action-based trophies (e.g. escaping the highway with Kara without being spotted, or sparing Chloe at Kamski\'s house). Fill outstanding flowchart lines to earn enough points to buy all gallery artwork and models, completing your 100% Trophy list!'
    }
  ],
  'resident-evil-requiem': [
    {
      title: 'Stage 1: Standard Campaign & Story Familiarization',
      subtitle: 'Complete the main horror campaign, locate puzzles, and unlock infinite weapon recipes.',
      hours: '0-10 Hours',
      targets: 'Escaped the Nightmare, Secret Passage, Arsenal Collector, Herbs & Ammo',
      desc: 'Play through the survival horror campaign at your own pace. Memorize puzzle codes, safe combinations, and shortcut layouts. Manage your inventory slots carefully, upgrade your handgun and shotgun, and defeat the central police department bosses.'
    },
    {
      title: 'Stage 2: Hardcore S-Rank Speedrun',
      subtitle: 'Complete the game on Hardcore under 4 hours with minimal saves.',
      hours: '10-25 Hours',
      targets: 'S-Rank Survivor, Speed Runner, Safe Haven, Frugal Hunter',
      desc: 'Start a fresh run on Hardcore difficulty. Skip cutscenes, ignore optional enemy groups to conserve ammo, and aim to complete the game in under 4 hours. Save your progress less than 5 times to secure the prestigious S-Rank, which unlocks the infinite ammunition combat knife!'
    },
    {
      title: 'Stage 3: Knife-Only "CQC Master" & No-Heal Challenge',
      subtitle: 'Assisted difficulty playthrough restricting weapon usage and health sprays.',
      hours: '25-35 Hours',
      targets: 'CQC Master, Untouchable, Minimalist, Eco-Friendly',
      desc: 'Play through on Assisted difficulty. Restrict yourself entirely to your combat knife and melee prompts (no firearms allowed!). Combine this with the "Minimalist" (no inventory box opened) or "Eco-Friendly" (no healing items used) trophies to highly optimize your pathing.'
    },
    {
      title: 'Stage 4: Mercenaries Extra Mode S-Ranks',
      subtitle: 'Clear all combat stages with maximum rank to unlock the Platinum.',
      hours: '35-40 Hours',
      targets: 'Mercenary Legend, Perfect Combo, Platinum Trophy',
      desc: 'Dive into the Mercenaries extra game mode. Learn character abilities, optimize spawn combos, and secure S-Ranks on all 6 maps. This completes your mastery over the infected quarantine sector, awarding you the coveted Platinum trophy!'
    }
  ]
};

// Rich custom detailed walkthrough guides for specific trophies
const RICH_TROPHY_GUIDES: Record<string, {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  diffColor: string;
  location: string;
  category: string;
  walkthrough: string;
  loadout: string;
}> = {
  'av-first-flight': {
    difficulty: 'Easy',
    diffColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    location: 'Ikran Rookery, Kinglor Forest',
    category: '⚔️ Main Progression',
    walkthrough: 'This is a story-related achievement that unlocks automatically as you progress. During the main campaign mission "Take Flight", you will scale the soaring cliffs of the Ikran Rookery. Feed and calm your flying beast, and bond with it at the peak. Learn basic flight controls to trigger the trophy.',
    loadout: 'None required. Follow the glowing nectar trails and blue-painted ledge markings to scale the nesting cliffs.'
  },
  'av-rda-cleanup': {
    difficulty: 'Medium',
    diffColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    location: 'RDA Outposts, Western Frontier',
    category: '🔍 Combat Cleanup',
    walkthrough: 'Locate and completely dismantle 10 RDA processing facilities. Stealth is highly recommended: use your Na\'vi senses to locate the base commander, disable alarms first, and then sabotage the glowing yellow fuel pipes and pressure valves. Once cleared, wait for the cutscene of the toxic haze clearing and Na\'vi flowers reclaiming the outpost.',
    loadout: 'Heavy Bow (equipped with Fire/Explosive arrows) to destroy armored vents, and a Shotgun for close-range base interior security forces.'
  },
  'av-song-weaver': {
    difficulty: 'Medium',
    diffColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    location: 'Highland Camps & Tree Canopies',
    category: '🔍 Collectible Hunt',
    walkthrough: 'Locate all 30 glowing blue data slates containing ancient Na\'vi song-lore. They are usually found inside hollowed-out massive tree trunks, abandoned research tents, and hidden cliffside alcoves. Use your map markers and listen for a subtle wind-chime audio cue when you get close.',
    loadout: 'Unlock the Ikran Flight speed boost capability to fly rapidly between remote highland arches and high-altitude tree nests.'
  },
  'av-unmissable-hunter': {
    difficulty: 'Medium',
    diffColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    location: 'RDA Headquarters, Final Sector',
    category: '🏆 Final Boss Story',
    walkthrough: 'Story-related, unmissable. Defeat the RDA commander John Mercer in the final heavily fortified stronghold. Phase 1 requires you to sabotage the air-filtering pillars while dodging rocket fire. Phase 2 pits you against Mercer\'s custom armored mech. Target the exposed wiring on the mech\'s back joints to stagger him.',
    loadout: 'Staff Sling (equipped with sticky remote-detonating mines) and Short Bow with Acid arrows to shred Mercer\'s high-tech mech armor.'
  },
  'det-survivors': {
    difficulty: 'Hard',
    diffColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    location: 'Detroit Metro & Chapters',
    category: '⚠️ Missable Campaign',
    walkthrough: 'Keep Kara, Alice, Connor, Markus, Luther, Hank, North, Josh, and Simon alive. Crucial decisions:\n1. Hank: Connor must be friendly, spare the Tracis, and spare Chloe at Kamski\'s house to build high friendship.\n2. Simon: During the Stratford Tower raid, spare the fleeing human. When Simon gets wounded, leave him in the rooftop bunker but DO NOT investigate him with Connor later.\n3. Markus: Choose exclusively peaceful actions. During the final demonstration, choose "Kiss North" or "Sing" to turn public opinion, sparing the group.\n4. Luther: Rescue him at Rose\'s house, in Jericho, and at the bus station.',
    loadout: 'Requires 100% QTE accuracy. Go to settings and reduce QTE difficulty to "Casual" if you struggle with reflex prompts.'
  },
  'det-deviant': {
    difficulty: 'Easy',
    diffColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    location: 'Ortiz Residence, Chapter: Partners',
    category: '💡 Investigation',
    walkthrough: 'Investigate the crime scene. Find the bat by the doorway, the kitchen knife, and reconstruct the struggle in the living room. Follow the blue blood drippings leading into the hallway. Grab the attic ladder from the closet, prop it up, climb into the dark crawlspace, and walk to the end to locate the deviant hiding behind the crates.',
    loadout: 'Scan using Connor\'s analytical mode (R2) to instantly highlight all clues and trace the path of the blue blood.'
  },
  'det-all-paths': {
    difficulty: 'Hard',
    diffColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    location: 'Narrative Flowcharts',
    category: '🔍 100% Flowcharts',
    walkthrough: 'This is the most time-consuming achievement. You must complete every branch of the flowchart in key chapters. You CANNOT skip chapters; if you change a decision in Chapter 3, you must play through Chapters 4, 5, and 6 sequentially for the new timeline variables to carry over and save!',
    loadout: 'Flowchart tracker tool in the main menu to see exactly which branch lines are still faded out.'
  },
  'er-margit': {
    difficulty: 'Easy',
    diffColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    location: 'Castle Stormveil Entrance, Limgrave',
    category: '⚔️ Mandatory Boss',
    walkthrough: 'Defeat Margit. He is highly aggressive and punishes panic-healing with fast gold-light daggers. Keep a medium distance to bait his giant jump slam. Dodge into the slam, execute a heavy jump attack, and retreat. During Phase 2, he summons a giant hammer. Watch his delayed swings—dodge at the absolute last second.',
    loadout: 'Spirit Jellyfish Ashes +3 (for poison tanking) and Margit\'s Shackle (purchasable from Patches in Murkwater Cave to lock him down twice in Phase 1).'
  },
  'er-malenia': {
    difficulty: 'Hard',
    diffColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    location: 'Roots of the Haligtree, Secret Zone',
    category: '💀 Ultimate Boss',
    walkthrough: 'Malenia is the ultimate challenge in Elden Ring. She heals on every strike, even if blocked. \n- Phase 1: Beware her "Waterfowl Dance". When she hovers, sprint backward for the first two flurries, then dodge INTO the third flurry. \n- Phase 2: She begins with Scarlet Aeonia (glowing flower). Dodge the initial dive, sprint away from the blooming petals, and strike her during the long recovery phase.',
    loadout: 'Rivers of Blood +10 (for blood loss buildups) or Blasphemous Blade +10 (for high stagger knockdown). Summon Mimic Tear +10 and equip Dragoncrest Greatshield Talisman.'
  },
  'er-elden-lord': {
    difficulty: 'Medium',
    diffColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    location: 'Elden Throne, Leyndell Capital',
    category: '🏆 Story Ending',
    walkthrough: 'Defeat the final boss duo: Radagon and the Elden Beast. Radagon uses sweeping holy hammers—dodge behind him and strike. Elden Beast has massive health and constantly swims away. Chase its stomach and stay behind it. Dodge the glowing tracking spheres (Elden Stars) by sprinting in a continuous circle.',
    loadout: 'Haligdrake Talisman +2 (holy damage negation is crucial!). Use Black Flame spells or massive strike weapons to break Radagon\'s posture.'
  },
  'er-shadow-messmer': {
    difficulty: 'Hard',
    diffColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    location: 'Shadow Keep, Realm of Shadow',
    category: '⚔️ DLC Main Boss',
    walkthrough: 'Defeat Messmer. He utilizes rapid, fire-infused spear thrusts. In Phase 1, wait out his spinning fire dive, dodge the final ground spear burst, and counter-strike. In Phase 2, he transforms into giant snakes. Dodge the sweeping snake strikes and punish his recovery windows when he reverts to human form.',
    loadout: 'Flamedrake Talisman +3, Scadutree Blessing Level 10+, and heavy bleed weapons like Mohgwyn\'s Sacred Spear.'
  },
  'er-shadow-radahn': {
    difficulty: 'Hard',
    diffColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    location: 'Enir-Ilim Temple, DLC Final Zone',
    category: '💀 God Boss',
    walkthrough: 'The hardest boss in Souls history. Phase 1 requires you to dodge his massive gravity sword sweeps. Phase 2 introduces Miquella. Holy light beams will cascade down after EVERY single sword swing. You must dodge forward and slightly left to stay behind him, avoiding the holy columns. Block with a shield if the tracking is too intense.',
    loadout: 'Verdigris Greatshield +10 (with high holy block), Spear (equipped with Blood infusion), Golden Vow spell, and Crimson Seed Talisman +1.'
  },
  'str-speedrun': {
    difficulty: 'Medium',
    diffColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    location: 'Entire Game Path',
    category: '⏱️ Speedrun Trial',
    walkthrough: 'Complete the entire game in under 2 hours. This is highly doable but leaves no time for side paths. Do not collect B-12 memories or badges. In the Slums, focus strictly on finding the notebooks. In the Sewers, run past Zurks in a zigzag rather than stopping to vaporize them. In Midtown, skip the detective investigation steps by heading straight to the clothing shop.',
    loadout: 'Memorize puzzle codes: Slums Flat (3748), Slums Safe (binary code), Midtown Shop Safe (8542), Midtown factory room (symmetrical buttons).'
  },
  're-escape': {
    difficulty: 'Easy',
    diffColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    location: 'Police Station RPD, Chapter 1',
    category: '⚔️ Main Progression',
    walkthrough: 'Unlocks automatically. Solve the three medallion statues (Lion, Unicorn, Maiden) in the main hall of the RPD to unlock the secret exit beneath the goddess statue. Fight off the mutated creatures in the basement to escape into the sewers.',
    loadout: 'RPD Handgun with laser sight, Combat Knife (aim for zombie knees to trigger critical stagger strikes).'
  },
  're-s-rank': {
    difficulty: 'Hard',
    diffColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    location: 'All Sectors, Campaign',
    category: '⏱️ Hardcore Trial',
    walkthrough: 'Complete the campaign on Hardcore in under 4 hours. You must memorize enemy placements, boss puzzle phases, and carry key items only when needed to prevent backtracking. Save your progress less than 5 times total (save before major boss fights). Save ammunition by shooting zombies once in the leg and running past.',
    loadout: 'Infinite Ammo Combat Knife (unlocked by destroying all Mr. Raccoon toys in your first playthrough).'
  },
  're-knife-only': {
    difficulty: 'Hard',
    diffColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    location: 'Campaign Run',
    category: '⚙️ Combat Mastery',
    walkthrough: 'Complete the story using strictly knife/melee attacks. You may not fire a single gun bullet! The only exceptions are specific story-mandatory scripted events (e.g. shooting the explosive barrel to escape the sewer monster). Play on Assisted difficulty so your health regenerates automatically to 30%.',
    loadout: 'Unlock the Infinite Combat Knife first. Pack multiple backup normal knives as their durability will drain rapidly during parries!'
  }
};

export default function GuidesPage() {
  const { progress, toggleAchievement } = useTrackerStore();
  const [selectedGameId, setSelectedGameId] = React.useState<string>(PRELOADED_GAMES[0].id);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedTrophyId, setExpandedTrophyId] = React.useState<string | null>(null);
  
  // Custom filter tags for trophies
  const [categoryFilter, setCategoryFilter] = React.useState<'all' | 'missable' | 'collectible' | 'progression'>('all');
  const [tierFilter, setTierFilter] = React.useState<'all' | 'platinum' | 'gold' | 'silver' | 'bronze'>('all');

  const selectedGame = React.useMemo(() => {
    const preloaded = PRELOADED_GAMES.find(g => g.id === selectedGameId);
    if (preloaded) return preloaded;
    return progress.customGames?.[selectedGameId] || PRELOADED_GAMES[0];
  }, [selectedGameId, progress.customGames]);

  // Combine preloaded and custom games that have guides
  const availableGames = React.useMemo(() => {
    const list = [...PRELOADED_GAMES];
    if (progress.customGames) {
      Object.values(progress.customGames).forEach(game => {
        if (!list.some(g => g.id === game.id)) {
          list.push(game);
        }
      });
    }
    return list;
  }, [progress.customGames]);

  const filteredTrophies = React.useMemo(() => {
    if (!selectedGame) return [];
    return selectedGame.achievements.filter(ach => {
      const matchSearch = ach.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ach.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      let matchCat = true;
      if (categoryFilter === 'missable') matchCat = !!ach.isMissable;
      else if (categoryFilter === 'collectible') matchCat = !!ach.isCollectible;
      else if (categoryFilter === 'progression') matchCat = !ach.isMissable && !ach.isCollectible;

      // Tier filter
      let matchTier = true;
      if (tierFilter !== 'all') matchTier = ach.tier === tierFilter;

      return matchSearch && matchCat && matchTier;
    });
  }, [selectedGame, searchQuery, categoryFilter, tierFilter]);

  // Fetch or generate high-fidelity 4-Stage Roadmap steps
  const roadmapSteps = React.useMemo(() => {
    if (!selectedGame) return [];
    
    // Check if we have a custom curated roadmap
    if (GAME_ROADMAPS[selectedGame.id]) {
      return GAME_ROADMAPS[selectedGame.id];
    }
    
    // Generate fallback detailed 4-stage roadmap based on difficulty
    const hours = selectedGame.estimatedHours;
    return [
      {
        title: 'Stage 1: Main Story Campaign & Mechanics',
        subtitle: 'Familiarize yourself with controls and beat the core game.',
        hours: `${Math.floor(hours * 0.4)} Hours`,
        targets: 'Story missions, base weapons, level grinding',
        desc: 'Focus entirely on completing the core campaign narrative. Do not spend time backtracking for collectibles or difficult optional tasks yet. Build your stats and lock in unmissable progression trophies.'
      },
      {
        title: 'Stage 2: Faction Side Quests & Critical Missables',
        subtitle: 'Brave regional side quests and secure branching story choices.',
        hours: `${Math.floor(hours * 0.25)} Hours`,
        targets: 'Branching nodes, secret optional factions, companion bonds',
        desc: 'Tackle major regional side-quests and optional characters. Refer to individual guides for critical "missable" points that lock out permanently after completing major plot points.'
      },
      {
        title: 'Stage 3: Collectibles & Interactive Mapping',
        subtitle: 'Clean up regional maps, find chests, and sweep minor notes.',
        hours: `${Math.floor(hours * 0.20)} Hours`,
        targets: 'Data slates, weapons, hidden chests, chests',
        desc: 'Consult high-performance collectibles guides to track down hidden packages, chest spots, data nodes, or weapons scattered across the game world.'
      },
      {
        title: 'Stage 4: Platinum Cleanup & Master Challenges',
        subtitle: 'Surmount elite difficulty modifiers and secure your ultimate award.',
        hours: `${Math.floor(hours * 0.15)} Hours`,
        targets: 'Hardcore difficulty runs, speed trials, remaining achievements',
        desc: 'Conquer the hardest challenges: speedruns, hardcore difficulty sweeps, and remaining combat achievements. Back up your save file if needed, then trigger your glowing Platinum!'
      }
    ];
  }, [selectedGame]);

  return (
    <div className="space-y-8 select-none">
      {/* Banner Hero */}
      <div 
        className="relative rounded-3xl overflow-hidden min-h-[260px] border border-zinc-800 shadow-[0_0_50px_rgba(168,85,247,0.05)] flex flex-col justify-end p-6 md:p-8 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(to top, rgba(9, 9, 11, 0.98) 20%, rgba(9, 9, 11, 0.6) 60%, rgba(9, 9, 11, 0.2) 100%), url(${selectedGame.bannerUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 mb-1 text-purple-400 font-extrabold text-[10px] tracking-widest uppercase bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full w-max">
              <Compass className="w-3.5 h-3.5" />
              Ultra-Premium Trophy Walkthrough
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              {selectedGame.title}
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {selectedGame.description}
            </p>
          </div>
          
          {/* Stats Pills */}
          <div className="flex flex-wrap gap-3 shrink-0">
            <div className="flex items-center gap-3 bg-zinc-950/90 border border-zinc-850 px-4 py-2.5 rounded-2xl backdrop-blur-md">
              <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                <Star className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Difficulty</p>
                <p className="text-sm font-black text-white">{selectedGame.estimatedDifficulty}/10</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-zinc-950/90 border border-zinc-850 px-4 py-2.5 rounded-2xl backdrop-blur-md">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Est. Time</p>
                <p className="text-sm font-black text-white">{selectedGame.estimatedHours} Hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-zinc-950/90 border border-zinc-850 px-4 py-2.5 rounded-2xl backdrop-blur-md">
              <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-400">
                <Trophy className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Total Trophies</p>
                <p className="text-sm font-black text-white">{selectedGame.achievements.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual-Pane Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Pane: Game Selection & Filters */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-3xl p-4 space-y-3 backdrop-blur-sm shadow-xl">
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 flex items-center gap-2 border-b border-zinc-900 pb-2">
              <BookOpen className="w-4 h-4 text-purple-500" />
              Available Guides
            </h3>
            
            <div className="flex flex-col gap-2 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
              {availableGames.map((game) => (
                <button
                  key={game.id}
                  onClick={() => {
                    setSelectedGameId(game.id);
                    setExpandedTrophyId(null);
                  }}
                  className={`w-full text-left p-2.5 rounded-2xl border text-xs font-extrabold transition-all flex items-center gap-3 hover:scale-[1.01] cursor-pointer ${
                    selectedGameId === game.id
                      ? 'bg-purple-600/10 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.05)]'
                      : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="w-8 h-11 rounded-lg bg-zinc-900 overflow-hidden shrink-0 border border-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="truncate min-w-0">
                    <p className="truncate text-zinc-200 font-bold">{game.title}</p>
                    <p className="text-[9px] text-zinc-500 font-semibold truncate mt-0.5">{game.developer}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Trophy Explorer Filters */}
          <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-3xl p-4 space-y-4 backdrop-blur-sm shadow-xl">
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 flex items-center gap-2 border-b border-zinc-900 pb-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Explorer Filters
            </h4>
            
            {/* Category Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-extrabold uppercase">Trophy Category</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { value: 'all', label: 'All Types' },
                  { value: 'missable', label: '⚠️ Missable' },
                  { value: 'collectible', label: '🔍 Collectibles' },
                  { value: 'progression', label: '🎮 Progression' }
                ].map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategoryFilter(cat.value as 'all' | 'missable' | 'collectible' | 'progression')}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border cursor-pointer text-center ${
                      categoryFilter === cat.value
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                        : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tier Filter */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] text-zinc-500 font-extrabold uppercase">Trophy Tier</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: 'all', label: 'All Tiers' },
                  { value: 'platinum', label: '🏆 Platinum' },
                  { value: 'gold', label: '🥇 Gold' },
                  { value: 'silver', label: '🥈 Silver' },
                  { value: 'bronze', label: '🥉 Bronze' }
                ].map(tier => (
                  <button
                    key={tier.value}
                    onClick={() => setTierFilter(tier.value as 'all' | 'platinum' | 'gold' | 'silver' | 'bronze')}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border cursor-pointer ${
                      tierFilter === tier.value
                        ? 'bg-purple-600/10 border-purple-500 text-purple-400'
                        : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Roadmap & Achievements list */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* CURATED 4-STAGE ROADMAP */}
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-base font-black text-white mb-6 flex items-center gap-2 select-none">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Gamer 4-Stage Hunter Roadmap
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {roadmapSteps.map((step, idx) => (
                <div 
                  key={idx} 
                  className="bg-zinc-950/60 border border-zinc-900 p-4.5 rounded-2xl relative group hover:border-zinc-800 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md">
                        Stage {idx + 1}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-extrabold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-600" /> {step.hours}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="font-extrabold text-sm text-zinc-200 group-hover:text-purple-400 transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-bold mt-0.5 leading-snug">
                        {step.subtitle}
                      </p>
                    </div>
                    
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-zinc-900/60 text-[10px] text-zinc-500 flex flex-wrap gap-1 items-center">
                    <span className="font-extrabold text-zinc-400">Key Targets:</span>
                    <span className="truncate max-w-[200px] italic font-semibold">{step.targets}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INDIVIDUAL TROPHY GUIDES EXPLORER */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Curated Trophy Solution walkthroughs ({filteredTrophies.length})
              </h3>
              
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search specific trophies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Accordion list */}
            <div className="space-y-3.5">
              {filteredTrophies.map((ach) => {
                const isExpanded = expandedTrophyId === ach.id;
                const isUnlocked = !!progress.unlockedAchievements[ach.id];
                
                // Rich custom guide details
                const customGuide = RICH_TROPHY_GUIDES[ach.id] || {
                  difficulty: ach.tier === 'platinum' ? 'Hard' : ach.tier === 'gold' ? 'Medium' : 'Easy',
                  diffColor: ach.tier === 'platinum' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : ach.tier === 'gold' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                  location: 'Global Exploration Area',
                  category: ach.isMissable ? '⚠️ Missable Campaign' : ach.isCollectible ? '🔍 Collectible Hunt' : '🎮 Story Progression',
                  walkthrough: ach.guide || 'This trophy requires you to execute standard completion parameters. Review prior stages in the roadmap and follow core gameplay loops to trigger the unlock.',
                  loadout: 'No specific weapon or loadout modifier required. Keep standard character levels upgraded.'
                };

                const tierBorderGlow = {
                  bronze: 'border-amber-800/40 hover:border-amber-700/60 shadow-[0_0_15px_rgba(217,119,6,0.01)]',
                  silver: 'border-slate-700/60 hover:border-slate-650 shadow-[0_0_15px_rgba(148,163,184,0.01)]',
                  gold: 'border-yellow-700/40 hover:border-yellow-600/60 shadow-[0_0_15px_rgba(234,179,8,0.03)]',
                  platinum: 'border-purple-500/40 hover:border-purple-400/60 shadow-[0_0_15px_rgba(168,85,247,0.05)] bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.03),transparent_40%)]'
                };

                const tierTextClass = {
                  bronze: 'text-amber-500 bg-amber-500/5 border-amber-500/20',
                  silver: 'text-slate-400 bg-slate-500/5 border-slate-500/20',
                  gold: 'text-yellow-500 bg-yellow-500/5 border-yellow-500/20',
                  platinum: 'text-purple-400 bg-purple-500/5 border-purple-500/20'
                };

                const tierBadgeEmoji = {
                  bronze: '🥉',
                  silver: '🥈',
                  gold: '🥇',
                  platinum: '🏆'
                };

                return (
                  <div 
                    key={ach.id}
                    className={`bg-zinc-950/60 border rounded-3xl overflow-hidden transition-all duration-300 select-none ${
                      isExpanded ? 'border-zinc-700 shadow-[0_0_20px_rgba(0,0,0,0.5)]' : tierBorderGlow[ach.tier]
                    }`}
                  >
                    {/* Header trigger */}
                    <div className="w-full text-left p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Left: Info */}
                      <button 
                        onClick={() => setExpandedTrophyId(isExpanded ? null : ach.id)}
                        className="flex items-center gap-4 text-left min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                          {tierBadgeEmoji[ach.tier]}
                        </div>
                        
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-extrabold text-sm text-zinc-100 hover:text-purple-400 transition-colors">
                              {ach.title}
                            </h4>
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${tierTextClass[ach.tier]}`}>
                              {ach.tier}
                            </span>
                            
                            {ach.isMissable && (
                              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-rose-500/20 bg-rose-500/5 text-rose-400">
                                Missable
                              </span>
                            )}
                            {ach.isCollectible && (
                              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                                Collectible
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 truncate max-w-xl">{ach.description}</p>
                        </div>
                      </button>

                      {/* Right: Sync Check & Expand */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-zinc-900 pt-3 sm:pt-0 shrink-0">
                        {/* Direct progress tracking check! */}
                        <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-900 px-3 py-1.5 rounded-xl">
                          <label className="text-[9px] text-zinc-500 font-extrabold uppercase select-none tracking-wider cursor-pointer">
                            Earned
                          </label>
                          <button
                            onClick={() => toggleAchievement(ach.id, selectedGame.id, selectedGame.title, ach.title, ach.iconUrl || '🏆')}
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                              isUnlocked 
                                ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                                : 'bg-zinc-950 border-zinc-800 text-transparent hover:border-zinc-650'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>

                        <span className="text-[9px] text-zinc-500 font-extrabold bg-zinc-900/80 border border-zinc-850 px-2.5 py-1.5 rounded-xl shrink-0">
                          {ach.rarityPercentage}% Rare
                        </span>

                        <button 
                          onClick={() => setExpandedTrophyId(isExpanded ? null : ach.id)}
                          className="p-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 rounded-xl cursor-pointer"
                        >
                          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-purple-400' : ''}`} />
                        </button>
                      </div>

                    </div>

                    {/* Collapsible content details */}
                    {isExpanded && (
                      <div className="border-t border-zinc-900 bg-zinc-950/40 p-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
                        
                        {/* Summary Deck */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-zinc-900/40 border border-zinc-900 p-3 rounded-2xl flex items-center gap-3">
                            <div className="p-2 bg-zinc-950 rounded-xl">
                              <BrainCircuit className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-[9px] text-zinc-500 font-extrabold uppercase">Difficulty Rating</p>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded inline-block mt-0.5 ${customGuide.diffColor}`}>
                                {customGuide.difficulty}
                              </span>
                            </div>
                          </div>

                          <div className="bg-zinc-900/40 border border-zinc-800/40 p-3 rounded-2xl flex items-center gap-3">
                            <div className="p-2 bg-zinc-950 rounded-xl">
                              <MapPin className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] text-zinc-500 font-extrabold uppercase">Target Location</p>
                              <p className="text-xs font-bold text-zinc-200 truncate mt-0.5">{customGuide.location}</p>
                            </div>
                          </div>

                          <div className="bg-zinc-900/40 border border-zinc-850 p-3 rounded-2xl flex items-center gap-3">
                            <div className="p-2 bg-zinc-950 rounded-xl">
                              <Award className="w-4 h-4 text-yellow-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] text-zinc-500 font-extrabold uppercase">Category Mode</p>
                              <p className="text-xs font-bold text-zinc-200 truncate mt-0.5">{customGuide.category}</p>
                            </div>
                          </div>
                        </div>

                        {/* Walkthrough Guide Body */}
                        <div className="bg-purple-950/10 border border-purple-500/10 rounded-2xl p-4.5 flex gap-3.5">
                          <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h5 className="text-xs font-black text-purple-400 uppercase tracking-widest">
                              Gamer Walkthrough Strategy
                            </h5>
                            <p className="text-xs text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
                              {customGuide.walkthrough}
                            </p>
                          </div>
                        </div>

                        {/* Pro loadout recommendation */}
                        <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                          <div className="flex gap-3 items-center">
                            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                              <Wrench className="w-4 h-4" />
                            </div>
                            <div>
                              <h6 className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
                                Recommended Loadout / Strategy Tip
                              </h6>
                              <p className="text-xs text-zinc-300 italic mt-0.5 font-medium">
                                {customGuide.loadout}
                              </p>
                            </div>
                          </div>

                          <div className="text-[10px] text-zinc-500 font-extrabold shrink-0 flex items-center gap-1.5 bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-xl self-end sm:self-auto">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            EndGame Guide Checked
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}

              {filteredTrophies.length === 0 && (
                <div className="py-12 text-center bg-zinc-900/10 border border-dashed border-zinc-800 rounded-3xl">
                  <AlertTriangle className="w-8 h-8 text-zinc-650 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">No matching guides found</p>
                  <p className="text-[10px] text-zinc-600 mt-1">Try resetting the Explorer Filters or searching another game.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
