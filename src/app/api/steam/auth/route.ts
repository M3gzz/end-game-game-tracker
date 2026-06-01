import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    const returnTo = `${protocol}://${host}/api/steam/auth/callback`;
    const realm = `${protocol}://${host}`;

    const steamOpenIdUrl = 'https://steamcommunity.com/openid/login';
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': returnTo,
      'openid.realm': realm,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    });

    const redirectUrl = `${steamOpenIdUrl}?${params.toString()}`;
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Steam OpenID Redirect Error:', error);
    return NextResponse.json({ error: `Steam OpenID Redirect failed: ${errMsg}` }, { status: 500 });
  }
}
