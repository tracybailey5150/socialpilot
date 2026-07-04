import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const appId = process.env.PINTEREST_APP_ID;
    if (!appId) {
      return NextResponse.json({ error: 'Pinterest App ID not configured' }, { status: 500 });
    }

    // Generate a random state parameter for CSRF protection
    const state = crypto.randomUUID();

    // Store state in a cookie for validation in the callback
    const cookieStore = await cookies();
    cookieStore.set('pinterest_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Build the redirect URI
    const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const redirectUri = `${origin}/api/auth/pinterest/callback`;

    // Build Pinterest OAuth URL
    const pinterestOAuthUrl = new URL('https://www.pinterest.com/oauth/');
    pinterestOAuthUrl.searchParams.set('client_id', appId);
    pinterestOAuthUrl.searchParams.set('redirect_uri', redirectUri);
    pinterestOAuthUrl.searchParams.set('response_type', 'code');
    pinterestOAuthUrl.searchParams.set('scope', 'boards:read,pins:read,pins:write,boards:write');
    pinterestOAuthUrl.searchParams.set('state', state);

    return NextResponse.redirect(pinterestOAuthUrl.toString());
  } catch (error) {
    console.error('Pinterest OAuth init error:', error);
    return NextResponse.redirect(
      new URL('/accounts?error=oauth_init_failed', request.nextUrl.origin)
    );
  }
}
