import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, videoUrl, accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required' },
        { status: 400 }
      );
    }

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'TikTok requires video content. Please provide a videoUrl.' },
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
      .eq('platform', 'tiktok')
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'TikTok account not found or access denied' },
        { status: 404 }
      );
    }

    // Initialize video publish via TikTok API
    const publishRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        post_info: {
          title: title || '',
          privacy_level: 'SELF_ONLY',
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: videoUrl,
        },
      }),
    });

    const publishData = await publishRes.json();

    if (publishData.error?.code) {
      console.error('TikTok publish error:', publishData.error);
      return NextResponse.json(
        { error: publishData.error.message || 'Failed to publish video to TikTok' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      publish_id: publishData.data?.publish_id,
      displayName: account.display_name,
    });
  } catch (error) {
    console.error('TikTok post route error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
