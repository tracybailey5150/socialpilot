import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const appId = process.env.FACEBOOK_APP_ID;
    if (!appId) {
      return NextResponse.json({ error: 'Facebook App ID not configured' }, { status: 500 });
    }

    // Generate a random state parameter for CSRF protection
    const state = crypto.randomUUID();

    // Store state in a cookie for validation in the callback
    const cookieStore = await cookies();
    cookieStore.set('fb_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Build the redirect URI
    const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const redirectUri = `${origin}/api/auth/facebook/callback`;

    // Build Facebook OAuth URL
    const fbOAuthUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth');
    fbOAuthUrl.searchParams.set('client_id', appId);
    fbOAuthUrl.searchParams.set('redirect_uri', redirectUri);
    fbOAuthUrl.searchParams.set('scope', 'pages_manage_posts,pages_read_engagement,pages_show_list');
    fbOAuthUrl.searchParams.set('state', state);

    return NextResponse.redirect(fbOAuthUrl.toString());
  } catch (error) {
    console.error('Facebook OAuth init error:', error);
    return NextResponse.redirect(
      new URL('/accounts?error=oauth_init_failed', request.nextUrl.origin)
    );
  }
}
