import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    if (!clientKey) {
      return NextResponse.json({ error: 'TikTok Client Key not configured' }, { status: 500 });
    }

    // Generate a random state parameter for CSRF protection
    const state = crypto.randomUUID();

    // Store state in a cookie for validation in the callback
    const cookieStore = await cookies();
    cookieStore.set('tiktok_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Build the redirect URI
    const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const redirectUri = `${origin}/api/auth/tiktok/callback`;

    // Build TikTok OAuth URL
    const tiktokOAuthUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    tiktokOAuthUrl.searchParams.set('client_key', clientKey);
    tiktokOAuthUrl.searchParams.set('redirect_uri', redirectUri);
    tiktokOAuthUrl.searchParams.set('scope', 'user.info.basic,video.publish,video.upload');
    tiktokOAuthUrl.searchParams.set('response_type', 'code');
    tiktokOAuthUrl.searchParams.set('state', state);

    return NextResponse.redirect(tiktokOAuthUrl.toString());
  } catch (error) {
    console.error('TikTok OAuth init error:', error);
    return NextResponse.redirect(
      new URL('/accounts?error=oauth_init_failed', request.nextUrl.origin)
    );
  }
}
