import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const steamId = searchParams.get('steamId');
    const userApiKey = searchParams.get('apiKey');
    const apiKey = (userApiKey && userApiKey.trim() !== '') ? userApiKey : process.env.STEAM_API_KEY;

    if (!appId) {
      return NextResponse.json({ error: 'Missing appId parameter' }, { status: 400 });
    }
    if (!steamId) {
      return NextResponse.json({ error: 'Missing steamId parameter' }, { status: 400 });
    }

    // 1. If an API key is available, use the official JSON Steam Web API
    if (apiKey && apiKey.trim() !== '') {
      try {
        const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${apiKey}&steamid=${steamId}&appid=${appId}`;
        const res = await fetch(url, { next: { revalidate: 30 } });

        if (res.ok) {
          const data = await res.json();
          const achievements = data.playerstats?.achievements || [];
          
          // Map to standard unlocked list: list of achievement IDs that are unlocked
          const unlockedApiNames: string[] = achievements
            .filter((ach: { apiname: string; achieved: number }) => ach.achieved === 1)
            .map((ach: { apiname: string }) => ach.apiname.toLowerCase());

          return NextResponse.json({ unlockedApiNames });
        } else if (res.status === 403) {
          console.warn('Steam Player Achievements API returned 403 (Profile might be private), trying XML fallback...');
        } else {
          console.warn(`Steam Player Achievements API returned status ${res.status}, trying XML fallback...`);
        }
      } catch (apiErr) {
        console.error('Steam Player Achievements API error, trying XML fallback...', apiErr);
      }
    }

    // 2. Fallback: Keyless XML scrape from steamcommunity.com profiles
    // Works beautifully for public profiles without requiring any API keys!
    try {
      const isNumeric = /^\d+$/.test(steamId);
      const xmlUrl = isNumeric
        ? `https://steamcommunity.com/profiles/${steamId}/stats/${appId}/?xml=1`
        : `https://steamcommunity.com/id/${steamId}/stats/${appId}/?xml=1`;
      const xmlRes = await fetch(xmlUrl, { next: { revalidate: 30 } });

      if (xmlRes.ok) {
        const xmlText = await xmlRes.text();
        const unlockedApiNames: string[] = [];

        // Parse unlocked achievements (<achievement closed="1">)
        const achievementRegex = /<achievement\s+[^>]*closed="1"[\s\S]*?>([\s\S]*?)<\/achievement>/g;
        let match;

        while ((match = achievementRegex.exec(xmlText)) !== null) {
          const block = match[1];
          const apinameMatch = block.match(/<apiname><!\[CDATA\[([\s\S]*?)\]\]><\/apiname>/) || block.match(/<apiname>([\s\S]*?)<\/apiname>/);
          if (apinameMatch) {
            unlockedApiNames.push(apinameMatch[1].trim().toLowerCase());
          }
        }

        if (unlockedApiNames.length > 0 || xmlText.includes('<achievements>')) {
          return NextResponse.json({ unlockedApiNames });
        }

        // Check if profile/game is private in XML
        if (xmlText.includes('private') || xmlText.includes('Access Denied')) {
          return NextResponse.json({ 
            error: 'Your Steam Game Details are set to Private or Friends Only. Please log in to Steam, go to Edit Profile -> Privacy Settings, and set your "Game Details" to PUBLIC to enable syncing.' 
          }, { status: 403 });
        }
      }
    } catch (xmlErr) {
      console.error('Steam Player Achievements XML fallback error:', xmlErr);
    }

    // Default if both methods failed or profile is private
    return NextResponse.json({ 
      error: 'Unable to retrieve your Steam achievements. Please ensure your Steam Profile is active, and that your "Game details" are set to PUBLIC in your Steam Privacy Settings.' 
    }, { status: 403 });

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Steam player achievements sync error:', error);
    return NextResponse.json({ error: `Internal Server Error: ${errMsg}` }, { status: 500 });
  }
}
