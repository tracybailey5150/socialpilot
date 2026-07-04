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
      .eq('platform', 'linkedin')
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'LinkedIn account not found or access denied' },
        { status: 404 }
      );
    }

    // Post to LinkedIn
    const postRes = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202401',
      },
      body: JSON.stringify({
        author: `urn:li:person:${account.platform_user_id}`,
        lifecycleState: 'PUBLISHED',
        visibility: 'PUBLIC',
        commentary: message,
        distribution: {
          feedDistribution: 'MAIN_FEED',
        },
      }),
    });

    // LinkedIn returns 201 with x-restli-id header on success
    if (!postRes.ok) {
      const errorData = await postRes.json().catch(() => ({}));
      console.error('LinkedIn post error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to post to LinkedIn' },
        { status: 400 }
      );
    }

    const postUrn = postRes.headers.get('x-restli-id') || '';

    return NextResponse.json({
      success: true,
      postId: postUrn,
      accountName: account.display_name,
    });
  } catch (error) {
    console.error('LinkedIn post route error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while posting' },
      { status: 500 }
    );
  }
}
