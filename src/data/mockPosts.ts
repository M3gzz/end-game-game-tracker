import { CommunityPost } from '../types';

export const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    gameId: 'red-dead-2',
    gameTitle: 'Red Dead Redemption 2',
    authorName: 'Arthur Morgan',
    authorUsername: 'arthur_morgan',
    authorAvatar: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
    title: 'A masterpiece of the American frontier',
    content: 'This game is something else. The story of Van der Linde gang, the endless skies, the horses, and the details in the wilderness. Hunting down all the zoology targets for that gold trophy was a real chore, but catching those legendary fish made it worthwhile. If you have not played this yet, pack your saddle bag and get to it. 5 stars easily.',
    type: 'review',
    rating: 5,
    likes: 342,
    likedBy: ['peter_parker', 'ellie_williams'],
    comments: [
      {
        id: 'c-1-1',
        authorName: 'Ellie Williams',
        authorUsername: 'ellie_williams',
        authorAvatar: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
        content: 'I love riding horses in this game too. Reminds me of Jackson. That ending though... broke me.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
      },
      {
        id: 'c-1-2',
        authorName: 'Geralt of Rivia',
        authorUsername: 'geralt_of_rivia',
        authorAvatar: 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
        content: 'Good horses are rare. Roach would probably get stuck on a fence in New Austin, but I agree. The hunt is very authentic.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
      }
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days ago
  },
  {
    id: 'post-2',
    gameId: 'elden-ring',
    gameTitle: 'Elden Ring',
    authorName: 'Geralt of Rivia',
    authorUsername: 'geralt_of_rivia',
    authorAvatar: 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
    title: 'How to defeat Shardbearer Malenia, Blade of Miquella',
    content: 'Malenia is the toughest boss in the Lands Between. Her Waterfowl Dance is a nightmare. Here is a quick guide to earning this gold trophy:\n\n1. **Dodging Waterfowl Dance**: Run away immediately for the first two salvos. For the third, dodge *towards* and through her right as she leaps. It takes practice but works 100% of the time.\n2. **Freezing Pots**: Throwing a Freezing Pot when she rises to start her Waterfowl Dance will interrupt her instantly! Keep at least 5 in your inventory.\n3. **Phase 2 Scarlet Aeonia**: When she plunges at the start of phase 2, roll away, wait for the flower explosion to subside, and then hit her with ranged spells or jump attacks. Good luck, hunters.',
    type: 'guide',
    likes: 512,
    likedBy: ['peter_parker', 'arthur_morgan', 'ellie_williams'],
    comments: [
      {
        id: 'c-2-1',
        authorName: 'Peter Parker',
        authorUsername: 'peter_parker',
        authorAvatar: 'linear-gradient(135deg, #dc2626 0%, #2563eb 100%)',
        content: 'Wow, those freezing pots are a life saver! I was struggling for hours on my S-Rank run. Thanks Geralt!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString()
      }
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() // 12 hours ago
  },
  {
    id: 'post-3',
    gameId: 'last-of-us-2',
    gameTitle: 'The Last of Us Part II',
    authorName: 'Ellie Williams',
    authorUsername: 'ellie_williams',
    authorAvatar: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
    title: 'Grounded Mode Permadeath Run - Complete!',
    content: 'Finally got the "You Can\'t Stop This" and "Dig Two Graves" trophies! Grounded Permadeath (Per Chapter) was absolute hell, especially the Hillcrest escape and the final resort segment. Tips: Stealth is your absolute best friend, do not waste ammo on runners, save shotgun shells for clickers/shamblers, and remember that bricks are actually overpowered. Ready to answer any questions in the comments if you are struggling!',
    type: 'guide',
    likes: 218,
    likedBy: ['geralt_of_rivia', 'arthur_morgan'],
    comments: [
      {
        id: 'c-3-1',
        authorName: 'Arthur Morgan',
        authorUsername: 'arthur_morgan',
        authorAvatar: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
        content: 'You got some real grit, kid. Grounded permadeath sounds like a quick way to get an ulcer. Outstanding work.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
      }
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() // 8 hours ago
  },
  {
    id: 'post-4',
    gameId: 'stray',
    gameTitle: 'Stray',
    authorName: 'Peter Parker',
    authorUsername: 'peter_parker',
    authorAvatar: 'linear-gradient(135deg, #dc2626 0%, #2563eb 100%)',
    title: 'Cutest post-apocalypse ever',
    content: 'Perfect mix of gorgeous neon cyber-aesthetics and pure feline bliss. Running through the slums under 2 hours for the "I am Speed" trophy was a blast! You just have to skip all the optional memories and ignore the urge to scratch every couch you see (it is hard, I know). The animations are incredibly lifelike and the music is phenomenal. A solid 4.5/5!',
    type: 'review',
    rating: 5,
    likes: 184,
    likedBy: ['ellie_williams'],
    comments: [
      {
        id: 'c-4-1',
        authorName: 'Ellie Williams',
        authorUsername: 'ellie_williams',
        authorAvatar: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
        content: 'The meow button is the best feature in gaming history. I spent like 30 minutes just meowing in front of the cameras.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString()
      }
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
  }
];
