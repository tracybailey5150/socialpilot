import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: 'Google Client ID not configured' }, { status: 500 });
    }

    // Generate a random state parameter for CSRF protection
    const state = crypto.randomUUID();

    // Store state in a cookie for validation in the callback
    const cookieStore = await cookies();
    cookieStore.set('yt_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Build the redirect URI
    const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const redirectUri = `${origin}/api/auth/youtube/callback`;

    // Build Google OAuth URL
    const googleOAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleOAuthUrl.searchParams.set('client_id', clientId);
    googleOAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleOAuthUrl.searchParams.set('response_type', 'code');
    googleOAuthUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly');
    googleOAuthUrl.searchParams.set('access_type', 'offline');
    googleOAuthUrl.searchParams.set('prompt', 'consent');
    googleOAuthUrl.searchParams.set('state', state);

    return NextResponse.redirect(googleOAuthUrl.toString());
  } catch (error) {
    console.error('YouTube OAuth init error:', error);
    return NextResponse.redirect(
      new URL('/accounts?error=oauth_init_failed', request.nextUrl.origin)
    );
  }
}
