import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const pinterestError = searchParams.get('error');
  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  // User denied permissions or Pinterest returned an error
  if (pinterestError) {
    const errorDesc = searchParams.get('error_description') || 'Pinterest authorization denied';
    console.error('Pinterest OAuth error:', pinterestError, errorDesc);
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
  const savedState = cookieStore.get('pinterest_oauth_state')?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      new URL('/accounts?error=Invalid+state+parameter.+Please+try+again.', origin)
    );
  }

  // Clear the state cookie
  cookieStore.delete('pinterest_oauth_state');

  try {
    const appId = process.env.PINTEREST_APP_ID!;
    const appSecret = process.env.PINTEREST_APP_SECRET!;
    const redirectUri = `${origin}/api/auth/pinterest/callback`;

    // Step 1: Exchange code for tokens (Basic auth with base64 client_id:client_secret)
    const basicAuth = Buffer.from(`${appId}:${appSecret}`).toString('base64');

    const tokenRes = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error('Pinterest token exchange error:', tokenData);
      return NextResponse.redirect(
        new URL(`/accounts?error=${encodeURIComponent(tokenData.error_description || tokenData.message || 'Token exchange failed')}`, origin)
      );
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    // Pinterest access tokens last 30 days
    const tokenExpiresAt = new Date(Date.now() + (tokenData.expires_in || 2592000) * 1000).toISOString();

    // Step 2: Get user info from Pinterest
    const userRes = await fetch('https://api.pinterest.com/v5/user_account', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const userData = await userRes.json();

    if (userData.code || userData.message) {
      console.error('Pinterest user info error:', userData);
      return NextResponse.redirect(
        new URL(`/accounts?error=${encodeURIComponent(userData.message || 'Failed to retrieve user info')}`, origin)
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

    // Step 4: Upsert to social_accounts
    const platformUserId = userData.username;
    const displayName = userData.business_name || userData.username;
    const avatarUrl = userData.profile_image || null;

    const { error: upsertError } = await supabaseAdmin
      .from('social_accounts')
      .upsert(
        {
          user_id: user.id,
          platform: 'pinterest',
          platform_user_id: platformUserId,
          platform_username: userData.username,
          display_name: displayName,
          avatar_url: avatarUrl,
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: tokenExpiresAt,
          scopes: 'boards:read,pins:read,pins:write,boards:write',
        },
        {
          onConflict: 'user_id,platform,platform_user_id',
        }
      );

    if (upsertError) {
      console.error('Error saving Pinterest account:', upsertError);
      // Fallback: try insert/update approach
      const { data: existing } = await supabaseAdmin
        .from('social_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', 'pinterest')
        .eq('platform_user_id', platformUserId)
        .single();

      if (existing) {
        await supabaseAdmin
          .from('social_accounts')
          .update({
            platform_username: userData.username,
            display_name: displayName,
            avatar_url: avatarUrl,
            access_token: accessToken,
            refresh_token: refreshToken,
            token_expires_at: tokenExpiresAt,
            scopes: 'boards:read,pins:read,pins:write,boards:write',
          })
          .eq('id', existing.id);
      } else {
        await supabaseAdmin
          .from('social_accounts')
          .insert({
            user_id: user.id,
            platform: 'pinterest',
            platform_user_id: platformUserId,
            platform_username: userData.username,
            display_name: displayName,
            avatar_url: avatarUrl,
            access_token: accessToken,
            refresh_token: refreshToken,
            token_expires_at: tokenExpiresAt,
            scopes: 'boards:read,pins:read,pins:write,boards:write',
          });
      }
    }

    return NextResponse.redirect(new URL('/accounts?connected=pinterest', origin));
  } catch (error) {
    console.error('Pinterest OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/accounts?error=An+unexpected+error+occurred+during+Pinterest+connection.', origin)
    );
  }
}
