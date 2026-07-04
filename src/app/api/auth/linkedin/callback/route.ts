import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const linkedInError = searchParams.get('error');
  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  // User denied permissions or LinkedIn returned an error
  if (linkedInError) {
    const errorDesc = searchParams.get('error_description') || 'LinkedIn authorization denied';
    console.error('LinkedIn OAuth error:', linkedInError, errorDesc);
    return NextResponse.redirect(
      new URL(`/accounts?error=${encodeURIComponent(errorDesc)}`, origin)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/accounts?error=Missing+authorization+code+or+state', origin)
    );
  }

  // Validate state against cookie
  const cookieStore = await cookies();
  const savedState = cookieStore.get('linkedin_oauth_state')?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      new URL('/accounts?error=Invalid+state+parameter.+Please+try+again.', origin)
    );
  }

  // Clear the state cookie
  cookieStore.delete('linkedin_oauth_state');

  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID!;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
    const redirectUri = `${origin}/api/auth/linkedin/callback`;

    // Step 1: Exchange code for access token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('LinkedIn token exchange error:', tokenData.error);
      return NextResponse.redirect(
        new URL(`/accounts?error=${encodeURIComponent(tokenData.error_description || 'Token exchange failed')}`, origin)
      );
    }

    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in; // seconds

    // Step 2: Get user profile via OpenID Connect userinfo endpoint
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const profileData = await profileRes.json();

    if (!profileData.sub) {
      console.error('LinkedIn profile error: no sub field', profileData);
      return NextResponse.redirect(
        new URL('/accounts?error=Failed+to+retrieve+LinkedIn+profile', origin)
      );
    }

    // Step 3: Get the current Supabase user from the request cookies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const allCookies = cookieStore.getAll();

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          cookie: allCookies.map(c => `${c.name}=${c.value}`).join('; '),
        },
      },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('Supabase user error:', userError);
      return NextResponse.redirect(
        new URL('/accounts?error=Not+authenticated.+Please+log+in+and+try+again.', origin)
      );
    }

    // Step 4: Calculate token expiration timestamp
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Step 5: Upsert LinkedIn account to social_accounts
    const displayName = profileData.name || `${profileData.given_name || ''} ${profileData.family_name || ''}`.trim();

    const { error: upsertError } = await supabaseAdmin
      .from('social_accounts')
      .upsert(
        {
          user_id: user.id,
          platform: 'linkedin',
          platform_user_id: profileData.sub,
          platform_username: displayName,
          display_name: displayName,
          avatar_url: profileData.picture || null,
          access_token: accessToken,
          token_expires_at: tokenExpiresAt,
        },
        {
          onConflict: 'user_id,platform,platform_user_id',
        }
      );

    if (upsertError) {
      console.error('Error saving LinkedIn account:', upsertError);
      // Fallback: try insert/update approach
      const { data: existing } = await supabaseAdmin
        .from('social_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', 'linkedin')
        .eq('platform_user_id', profileData.sub)
        .single();

      if (existing) {
        await supabaseAdmin
          .from('social_accounts')
          .update({
            platform_username: displayName,
            display_name: displayName,
            avatar_url: profileData.picture || null,
            access_token: accessToken,
            token_expires_at: tokenExpiresAt,
          })
          .eq('id', existing.id);
      } else {
        await supabaseAdmin
          .from('social_accounts')
          .insert({
            user_id: user.id,
            platform: 'linkedin',
            platform_user_id: profileData.sub,
            platform_username: displayName,
            display_name: displayName,
            avatar_url: profileData.picture || null,
            access_token: accessToken,
            token_expires_at: tokenExpiresAt,
          });
      }
    }

    return NextResponse.redirect(new URL('/accounts?connected=linkedin', origin));
  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/accounts?error=An+unexpected+error+occurred+during+LinkedIn+connection.', origin)
    );
  }
}
