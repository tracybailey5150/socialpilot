import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required' },
        { status: 400 }
      );
    }

    // Authenticate the current user
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const cookieStore = await cookies();
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
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Look up the social account by ID, ensuring it belongs to the current user
    const { data: account, error: accountError } = await supabaseAdmin
      .from('social_accounts')
      .select('id, access_token, refresh_token, token_expires_at, platform_user_id, platform, display_name')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .eq('platform', 'youtube')
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'YouTube account not found or access denied' },
        { status: 404 }
      );
    }

    // Check if token is expired and refresh if needed
    let accessToken = account.access_token;

    if (account.token_expires_at) {
      const expiresAt = new Date(account.token_expires_at).getTime();
      const now = Date.now();
      // Refresh if token expires within 5 minutes
      if (now >= expiresAt - 5 * 60 * 1000) {
        if (!account.refresh_token) {
          return NextResponse.json(
            { error: 'Token expired and no refresh token available. Please reconnect your YouTube account.' },
            { status: 401 }
          );
        }

        const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: account.refresh_token,
            grant_type: 'refresh_token',
          }),
        });

        const refreshData = await refreshRes.json();

        if (refreshData.error) {
          console.error('YouTube token refresh error:', refreshData.error);
          return NextResponse.json(
            { error: 'Failed to refresh YouTube token. Please reconnect your account.' },
            { status: 401 }
          );
        }

        accessToken = refreshData.access_token;
        const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();

        // Update the stored token
        await supabaseAdmin
          .from('social_accounts')
          .update({
            access_token: accessToken,
            token_expires_at: newExpiresAt,
          })
          .eq('id', account.id);
      }
    }

    // Verify connection by fetching channel info
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true&access_token=${accessToken}`
    );
    const channelData = await channelRes.json();

    if (channelData.error) {
      console.error('YouTube channel verify error:', channelData.error);
      return NextResponse.json(
        { error: channelData.error.message || 'Failed to verify YouTube connection' },
        { status: 400 }
      );
    }

    const channel = channelData.items?.[0];

    if (!channel) {
      return NextResponse.json(
        { error: 'No YouTube channel found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      channelId: channel.id,
      channelTitle: channel.snippet.title,
      subscriberCount: channel.statistics?.subscriberCount,
      videoCount: channel.statistics?.videoCount,
      displayName: account.display_name,
    });
  } catch (error) {
    console.error('YouTube post route error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
