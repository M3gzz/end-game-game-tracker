import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const claimedId = searchParams.get('openid.claimed_id');
    
    if (!claimedId) {
      console.error('Steam OpenID Callback failed: No openid.claimed_id found in URL');
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
      return NextResponse.redirect(`${protocol}://${host}/account?error=no_claimed_id`);
    }

    // SteamID64 is the 17-digit number at the end of openid.claimed_id URL
    // e.g. https://steamcommunity.com/openid/id/76561198084924784 -> 76561198084924784
    const steamIdMatch = claimedId.match(/\/id\/(\d+)$/);
    const steamId = steamIdMatch ? steamIdMatch[1] : '';

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';

    if (!steamId || !/^\d{17}$/.test(steamId)) {
      console.error(`Steam OpenID Callback failed: Invalid steamId parsed: "${steamId}"`);
      return NextResponse.redirect(`${protocol}://${host}/account?error=invalid_steam_id`);
    }

    // Redirect user back to the client-side Account page with the steamId in the query string
    return NextResponse.redirect(`${protocol}://${host}/account?steamId=${steamId}`);
  } catch (error) {
    console.error('Steam OpenID Callback Error:', error);
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${host}/account?error=internal_callback_error`);
  }
}
