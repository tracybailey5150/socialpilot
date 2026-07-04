import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: 'LinkedIn Client ID not configured' }, { status: 500 });
    }

    // Generate a random state parameter for CSRF protection
    const state = crypto.randomUUID();

    // Store state in a cookie for validation in the callback
    const cookieStore = await cookies();
    cookieStore.set('linkedin_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Build the redirect URI
    const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const redirectUri = `${origin}/api/auth/linkedin/callback`;

    // Build LinkedIn OAuth URL
    const linkedInOAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    linkedInOAuthUrl.searchParams.set('response_type', 'code');
    linkedInOAuthUrl.searchParams.set('client_id', clientId);
    linkedInOAuthUrl.searchParams.set('redirect_uri', redirectUri);
    linkedInOAuthUrl.searchParams.set('scope', 'openid profile email w_member_social');
    linkedInOAuthUrl.searchParams.set('state', state);

    return NextResponse.redirect(linkedInOAuthUrl.toString());
  } catch (error) {
    console.error('LinkedIn OAuth init error:', error);
    return NextResponse.redirect(
      new URL('/accounts?error=oauth_init_failed', request.nextUrl.origin)
    );
  }
}
