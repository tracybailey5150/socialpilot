import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const googleError = searchParams.get('error');
  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  // User denied permissions or Google returned an error
  if (googleError) {
    const errorDesc = searchParams.get('error_description') || 'Google authorization denied';
    console.error('YouTube OAuth error:', googleError, errorDesc);
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
  const savedState = cookieStore.get('yt_oauth_state')?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      new URL('/accounts?error=Invalid+state+parameter.+Please+try+again.', origin)
    );
  }

  // Clear the state cookie
  cookieStore.delete('yt_oauth_state');

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${origin}/api/auth/youtube/callback`;

    // Step 1: Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('Google token exchange error:', tokenData.error, tokenData.error_description);
      return NextResponse.redirect(
        new URL(`/accounts?error=${encodeURIComponent(tokenData.error_description || 'Token exchange failed')}`, origin)
      );
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    // Step 2: Get the YouTube channel info
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&access_token=${access_token}`
    );
    const channelData = await channelRes.json();

    if (channelData.error) {
      console.error('YouTube channel info error:', channelData.error);
      return NextResponse.redirect(
        new URL(`/accounts?error=${encodeURIComponent(channelData.error.message || 'Failed to retrieve channel info')}`, origin)
      );
    }

    const channels = channelData.items || [];

    if (channels.length === 0) {
      return NextResponse.redirect(
        new URL('/accounts?error=No+YouTube+channel+found+for+this+Google+account.', origin)
      );
    }

    const channel = channels[0];

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

    // Step 4: Calculate token expiration
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    // Step 5: Save to social_accounts using service role client
    const platformUsername = channel.snippet.customUrl || channel.snippet.title;

    const { error: upsertError } = await supabaseAdmin
      .from('social_accounts')
      .upsert(
        {
          user_id: user.id,
          platform: 'youtube',
          platform_user_id: channel.id,
          platform_username: platformUsername,
          display_name: channel.snippet.title,
          access_token: access_token,
          refresh_token: refresh_token,
          token_expires_at: tokenExpiresAt,
          metadata: {
            channel_id: channel.id,
            thumbnail: channel.snippet.thumbnails?.default?.url,
          },
        },
        {
          onConflict: 'user_id,platform,platform_user_id',
        }
      );

    if (upsertError) {
      console.error('Error saving YouTube account:', upsertError);
      // Fallback: try select then insert/update
      const { data: existing } = await supabaseAdmin
        .from('social_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', 'youtube')
        .eq('platform_user_id', channel.id)
        .single();

      if (existing) {
        await supabaseAdmin
          .from('social_accounts')
          .update({
            platform_username: platformUsername,
            display_name: channel.snippet.title,
            access_token: access_token,
            refresh_token: refresh_token,
            token_expires_at: tokenExpiresAt,
            metadata: {
              channel_id: channel.id,
              thumbnail: channel.snippet.thumbnails?.default?.url,
            },
          })
          .eq('id', existing.id);
      } else {
        await supabaseAdmin
          .from('social_accounts')
          .insert({
            user_id: user.id,
            platform: 'youtube',
            platform_user_id: channel.id,
            platform_username: platformUsername,
            display_name: channel.snippet.title,
            access_token: access_token,
            refresh_token: refresh_token,
            token_expires_at: tokenExpiresAt,
            metadata: {
              channel_id: channel.id,
              thumbnail: channel.snippet.thumbnails?.default?.url,
            },
          });
      }
    }

    return NextResponse.redirect(new URL('/accounts?connected=youtube', origin));
  } catch (error) {
    console.error('YouTube OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/accounts?error=An+unexpected+error+occurred+during+YouTube+connection.', origin)
    );
  }
}
