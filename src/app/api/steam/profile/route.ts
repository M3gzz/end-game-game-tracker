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

    // 1. If an API key is available, try the official JSON Steam Web API first
    if (apiKey && apiKey.trim() !== '') {
      try {
        const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
        const res = await fetch(url, { next: { revalidate: 60 } });

        if (res.ok) {
          const data = await res.json();
          const player = data.response?.players?.[0];

          if (player) {
            return NextResponse.json({
              name: player.personaname || 'Steam Hunter',
              avatarUrl: player.avatarfull || player.avatarmedium || player.avatar || '',
              bio: `Steam gamer. Account connected to Steam. Loc: ${player.loccountrycode || 'Global'}.`,
              username: `steam_${player.steamid}`,
            });
          }
        }
      } catch (apiErr) {
        console.error('Steam Profile Web API error, trying XML scraper fallback...', apiErr);
      }
    }

    // 2. Fallback: Keyless XML scrape from steamcommunity.com
    // Extremely powerful because it works without any API key and returns the actual Steam Bio (summary)!
    try {
      const isNumeric = /^\d+$/.test(steamId);
      const xmlUrl = isNumeric
        ? `https://steamcommunity.com/profiles/${steamId}/?xml=1`
        : `https://steamcommunity.com/id/${steamId}/?xml=1`;
      const xmlRes = await fetch(xmlUrl, { next: { revalidate: 60 } });

      if (xmlRes.ok) {
        const xmlText = await xmlRes.text();

        const nameMatch = xmlText.match(/<steamID><!\[CDATA\[([\s\S]*?)\]\]><\/steamID>/) || xmlText.match(/<steamID>([\s\S]*?)<\/steamID>/);
        const avatarMatch = xmlText.match(/<avatarFull><!\[CDATA\[([\s\S]*?)\]\]><\/avatarFull>/) || xmlText.match(/<avatarFull>([\s\S]*?)<\/avatarFull>/);
        const summaryMatch = xmlText.match(/<summary><!\[CDATA\[([\s\S]*?)\]\]><\/summary>/) || xmlText.match(/<summary>([\s\S]*?)<\/summary>/);

        const name = nameMatch ? nameMatch[1].trim() : 'Steam Hunter';
        const avatarUrl = avatarMatch ? avatarMatch[1].trim() : '';
        let bio = summaryMatch ? summaryMatch[1].trim() : '';

        // Clean HTML tags from scraped summary/bio
        if (bio) {
          bio = bio.replace(/<[^>]*>/g, '').trim();
          if (bio.length > 150) {
            bio = bio.substring(0, 147) + '...';
          }
        } else {
          bio = 'Steam completionist. Level tracking and achievements synced in real-time!';
        }

        if (name || avatarUrl) {
          return NextResponse.json({
            name,
            avatarUrl,
            bio,
            username: `steam_${steamId}`,
          });
        }
      }
    } catch (xmlErr) {
      console.error('Steam Profile XML scraper error:', xmlErr);
    }

    // Default response if both sync methods failed
    return NextResponse.json({
      name: 'Steam Hunter',
      avatarUrl: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
      bio: 'Steam profile connected. (Public details restricted by Steam Privacy Settings).',
      username: `steam_${steamId}`,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Steam profile sync error:', error);
    return NextResponse.json({ error: `Internal Server Error: ${errMsg}` }, { status: 500 });
  }
}
