import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, accountId } = body;

    if (!message || !accountId) {
      return NextResponse.json(
        { error: 'message and accountId are required' },
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
      .select('id, access_token, platform_user_id, platform, display_name')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Facebook account not found or access denied' },
        { status: 404 }
      );
    }

    // Post to Facebook Page
    const postUrl = new URL(`https://graph.facebook.com/v21.0/${account.platform_user_id}/feed`);

    const postRes = await fetch(postUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        access_token: account.access_token,
      }),
    });

    const postData = await postRes.json();

    if (postData.error) {
      console.error('Facebook post error:', postData.error);
      return NextResponse.json(
        { error: postData.error.message || 'Failed to post to Facebook' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      postId: postData.id,
      pageName: account.display_name,
    });
  } catch (error) {
    console.error('Facebook post route error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while posting' },
      { status: 500 }
    );
  }
}
