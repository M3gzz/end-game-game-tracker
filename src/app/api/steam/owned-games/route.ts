import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get('steamId');
    const userApiKey = searchParams.get('apiKey');
    const apiKey = (userApiKey && userApiKey.trim() !== '') ? userApiKey : process.env.STEAM_API_KEY;

    if (!steamId) {
      return NextResponse.json({ error: 'Missing steamId parameter' }, { status: 400 });
    }

    // 1. If an API key is available, use the official JSON Steam Web API
    if (apiKey && apiKey.trim() !== '') {
      try {
        const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`;
        const res = await fetch(url, { next: { revalidate: 30 } });

        if (res.ok) {
          const data = await res.json();
          const rawGames = data.response?.games || [];

          const games = rawGames.map((g: { appid: number; name?: string; playtime_forever?: number }) => ({
            appId: String(g.appid),
            name: g.name || `Steam Game ${g.appid}`,
            playtimeHours: g.playtime_forever ? parseFloat((g.playtime_forever / 60).toFixed(1)) : 0,
          }));

          return NextResponse.json({ games });
        } else if (res.status === 403) {
          console.warn('Steam GetOwnedGames API returned 403 (Profile might be private), trying XML scraper...');
        } else {
          console.warn(`Steam GetOwnedGames API returned status ${res.status}, trying XML scraper...`);
        }
      } catch (apiErr) {
        console.error('Steam GetOwnedGames API error, trying XML scraper fallback...', apiErr);
      }
    }

    // 2. Fallback: Keyless XML scrape from steamcommunity.com profiles
    // Highly reliable for public profiles without requiring developer credentials!
    try {
      const isNumeric = /^\d+$/.test(steamId);
      const xmlUrl = isNumeric
        ? `https://steamcommunity.com/profiles/${steamId}/games/?xml=1`
        : `https://steamcommunity.com/id/${steamId}/games/?xml=1`;
      const xmlRes = await fetch(xmlUrl, { next: { revalidate: 30 } });

      if (xmlRes.ok) {
        const xmlText = await xmlRes.text();
        const games: Array<{ appId: string; name: string; playtimeHours: number }> = [];

        // Parse games from XML
        const gameBlockRegex = /<game>([\s\S]*?)<\/game>/g;
        let match;

        while ((match = gameBlockRegex.exec(xmlText)) !== null) {
          const block = match[1];
          const appIdMatch = block.match(/<appID>(\d+)<\/appID>/);
          const nameMatch = block.match(/<name><!\[CDATA\[([\s\S]*?)\]\]><\/name>/) || block.match(/<name>([\s\S]*?)<\/name>/);
          const hoursMatch = block.match(/<hoursOnRecord>([\d.,]+)<\/hoursOnRecord>/);

          if (appIdMatch) {
            const appId = appIdMatch[1];
            const name = nameMatch ? nameMatch[1].trim() : `Steam Game ${appId}`;
            // Scraping can contain commas in hours (e.g. 1,234.5), strip them
            const playtimeStr = hoursMatch ? hoursMatch[1].replace(/,/g, '') : '0';
            const playtimeHours = parseFloat(playtimeStr) || 0;

            games.push({
              appId,
              name,
              playtimeHours: parseFloat(playtimeHours.toFixed(1)),
            });
          }
        }

        if (games.length > 0 || xmlText.includes('<gamesList>')) {
          return NextResponse.json({ games });
        }

        // Check if profile/inventory is private in XML
        if (xmlText.includes('private') || xmlText.includes('Access Denied')) {
          return NextResponse.json({
            error: 'Your Steam Game Details are set to Private or Friends Only. Please log in to Steam, go to Edit Profile -> Privacy Settings, and set your "Game Details" to PUBLIC to enable syncing.'
          }, { status: 403 });
        }
      }
    } catch (xmlErr) {
      console.error('Steam Owned Games XML fallback error:', xmlErr);
    }

    // Default if both methods failed
    return NextResponse.json({
      error: 'Unable to retrieve your Steam library. Please ensure your Steam Profile is active, and that your "Game details" are set to PUBLIC in your Steam Privacy Settings.'
    }, { status: 403 });

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Steam owned games sync error:', error);
    return NextResponse.json({ error: `Internal Server Error: ${errMsg}` }, { status: 500 });
  }
}
