export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/server';

async function getAuthUser() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { cookie: allCookies.map(c => `${c.name}=${c.value}`).join('; ') } },
  });
  const { data: { user } } = await client.auth.getUser();
  return user;
}

// POST /api/instagram/post — Post to Instagram via Facebook Graph API
// Instagram requires an image URL for feed posts (no text-only posts)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { caption, imageUrl, accountId } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Instagram requires an image URL' }, { status: 400 });
    }

    // Get the Facebook account (Instagram posts go through the FB page's IG account)
    const { data: account, error: accountError } = await supabaseAdmin
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Facebook account not found. Instagram posts require a connected Facebook Page with Instagram Business account.' }, { status: 404 });
    }

    // Step 1: Get the Instagram Business Account ID from the Facebook Page
    const igAccountRes = await fetch(
      `https://graph.facebook.com/v21.0/${account.platform_user_id}?fields=instagram_business_account&access_token=${account.access_token}`
    );
    const igAccountData = await igAccountRes.json();

    if (igAccountData.error || !igAccountData.instagram_business_account?.id) {
      return NextResponse.json({
        error: 'No Instagram Business account linked to this Facebook Page. Link one in Facebook Page Settings > Instagram.',
      }, { status: 400 });
    }

    const igAccountId = igAccountData.instagram_business_account.id;

    // Step 2: Create a media container
    const containerRes = await fetch(
      `https://graph.facebook.com/v21.0/${igAccountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption || '',
          access_token: account.access_token,
        }),
      }
    );
    const containerData = await containerRes.json();

    if (containerData.error) {
      return NextResponse.json({ error: containerData.error.message }, { status: 400 });
    }

    // Step 3: Publish the container
    const publishRes = await fetch(
      `https://graph.facebook.com/v21.0/${igAccountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: account.access_token,
        }),
      }
    );
    const publishData = await publishRes.json();

    if (publishData.error) {
      return NextResponse.json({ error: publishData.error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      postId: publishData.id,
      igAccountId,
    });
  } catch (error) {
    console.error('Instagram post error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
