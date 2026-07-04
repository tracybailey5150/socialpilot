import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const tiktokError = searchParams.get('error');
  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  // User denied permissions or TikTok returned an error
  if (tiktokError) {
    const errorDesc = searchParams.get('error_description') || 'TikTok authorization denied';
    console.error('TikTok OAuth error:', tiktokError, errorDesc);
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
  const savedState = cookieStore.get('tiktok_oauth_state')?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      new URL('/accounts?error=Invalid+state+parameter.+Please+try+again.', origin)
    );
  }

  // Clear the state cookie
  cookieStore.delete('tiktok_oauth_state');

  try {
    const clientKey = process.env.TIKTOK_CLIENT_KEY!;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET!;
    const redirectUri = `${origin}/api/auth/tiktok/callback`;

    // Step 1: Exchange code for access token
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error('TikTok token exchange error:', tokenData);
      const errorMsg = tokenData.error_description || tokenData.error || 'Token exchange failed';
      return NextResponse.redirect(
        new URL(`/accounts?error=${encodeURIComponent(errorMsg)}`, origin)
      );
    }

    const { access_token, refresh_token, expires_in, open_id } = tokenData;

    // Calculate token expiration timestamp
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    // Step 2: Get user info
    const userInfoRes = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const userInfoData = await userInfoRes.json();

    if (userInfoData.error?.code) {
      console.error('TikTok user info error:', userInfoData.error);
      return NextResponse.redirect(
        new URL(`/accounts?error=${encodeURIComponent(userInfoData.error.message || 'Failed to retrieve user info')}`, origin)
      );
    }

    const tiktokUser = userInfoData.data?.user;
    const displayName = tiktokUser?.display_name || 'TikTok User';
    const avatarUrl = tiktokUser?.avatar_url || null;
    const platformUserId = tiktokUser?.open_id || open_id;

    // Step 3: Get the current Supabase user from the request cookies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Create a Supabase client using the user's cookies for auth
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
    const { error: upsertError } = await supabaseAdmin
      .from('social_accounts')
      .upsert(
        {
          user_id: user.id,
          platform: 'tiktok',
          platform_user_id: platformUserId,
          platform_username: displayName,
          display_name: displayName,
          avatar_url: avatarUrl,
          access_token,
          refresh_token: refresh_token || null,
          token_expires_at: tokenExpiresAt,
        },
        {
          onConflict: 'user_id,platform,platform_user_id',
        }
      );

    if (upsertError) {
      console.error('Error saving TikTok account:', upsertError);
      // Fallback: try insert/update approach
      const { data: existing } = await supabaseAdmin
        .from('social_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', 'tiktok')
        .eq('platform_user_id', platformUserId)
        .single();

      if (existing) {
        await supabaseAdmin
          .from('social_accounts')
          .update({
            platform_username: displayName,
            display_name: displayName,
            avatar_url: avatarUrl,
            access_token,
            refresh_token: refresh_token || null,
            token_expires_at: tokenExpiresAt,
          })
          .eq('id', existing.id);
      } else {
        await supabaseAdmin
          .from('social_accounts')
          .insert({
            user_id: user.id,
            platform: 'tiktok',
            platform_user_id: platformUserId,
            platform_username: displayName,
            display_name: displayName,
            avatar_url: avatarUrl,
            access_token,
            refresh_token: refresh_token || null,
            token_expires_at: tokenExpiresAt,
          });
      }
    }

    return NextResponse.redirect(new URL('/accounts?connected=tiktok', origin));
  } catch (error) {
    console.error('TikTok OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/accounts?error=An+unexpected+error+occurred+during+TikTok+connection.', origin)
    );
  }
}
