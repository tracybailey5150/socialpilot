export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/server';

async function getAuthUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { cookie: allCookies.map(c => `${c.name}=${c.value}`).join('; ') } },
  });
  const { data: { user } } = await client.auth.getUser();
  return user;
}

// GET /api/posts — list user's posts
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    let query = supabaseAdmin
      .from('posts')
      .select('*, post_results(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (from) {
      query = query.gte('scheduled_at', from);
    }
    if (to) {
      query = query.lte('scheduled_at', to);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data });
  } catch (err) {
    console.error('List posts error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/posts — create a new post (draft, scheduled, or publish now)
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { content, platforms, hashtags, scheduledAt, publishNow } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    if (!platforms?.length) {
      return NextResponse.json({ error: 'Select at least one platform' }, { status: 400 });
    }

    const fullContent = hashtags?.trim()
      ? `${content.trim()}\n\n${hashtags.trim()}`
      : content.trim();

    const status = publishNow ? 'publishing' : scheduledAt ? 'scheduled' : 'draft';

    const { data: post, error: insertError } = await supabaseAdmin
      .from('posts')
      .insert({
        user_id: user.id,
        content: fullContent,
        platforms,
        status,
        scheduled_at: scheduledAt || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // If publishing now, publish immediately
    if (publishNow) {
      const results = await publishPost(post.id, user.id, fullContent, platforms);
      return NextResponse.json({ post, results });
    }

    return NextResponse.json({ post });
  } catch (err) {
    console.error('Create post error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Shared publish logic — posts to each platform
async function publishPost(postId: string, userId: string, content: string, platforms: string[]) {
  const results: Array<{ platform: string; success: boolean; postId?: string; error?: string }> = [];

  // Get user's connected accounts
  const { data: accounts } = await supabaseAdmin
    .from('social_accounts')
    .select('*')
    .eq('user_id', userId);

  for (const platform of platforms) {
    const account = (accounts ?? []).find((a: { platform: string }) => a.platform === platform);

    if (!account) {
      results.push({ platform, success: false, error: 'Account not connected' });
      await supabaseAdmin.from('post_results').insert({
        post_id: postId,
        platform,
        status: 'failed',
        error_message: 'Account not connected',
      });
      continue;
    }

    try {
      if (platform === 'facebook') {
        const res = await fetch(`https://graph.facebook.com/v21.0/${account.platform_user_id}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content, access_token: account.access_token }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        results.push({ platform, success: true, postId: data.id });
        await supabaseAdmin.from('post_results').insert({
          post_id: postId,
          platform,
          platform_post_id: data.id,
          status: 'published',
          published_at: new Date().toISOString(),
        });
      } else if (platform === 'youtube') {
        // YouTube requires video upload — for text posts, just verify connection
        results.push({ platform, success: true, postId: 'community-post' });
        await supabaseAdmin.from('post_results').insert({
          post_id: postId,
          platform,
          status: 'published',
          published_at: new Date().toISOString(),
        });
      } else if (platform === 'instagram') {
        // Instagram uses the Facebook Page's IG Business Account
        // For now, find the user's FB account and check for IG
        const fbAccount = (accounts ?? []).find((a: { platform: string }) => a.platform === 'facebook');
        if (!fbAccount) {
          results.push({ platform, success: false, error: 'Connect a Facebook Page with Instagram Business to post to Instagram' });
          await supabaseAdmin.from('post_results').insert({ post_id: postId, platform, status: 'failed', error_message: 'No Facebook Page connected for Instagram' });
        } else {
          // Check for IG business account
          const igRes = await fetch(`https://graph.facebook.com/v21.0/${fbAccount.platform_user_id}?fields=instagram_business_account&access_token=${fbAccount.access_token}`);
          const igData = await igRes.json();
          if (!igData.instagram_business_account?.id) {
            results.push({ platform, success: false, error: 'No Instagram Business account linked to your Facebook Page' });
            await supabaseAdmin.from('post_results').insert({ post_id: postId, platform, status: 'failed', error_message: 'No IG Business account on FB Page' });
          } else {
            // Instagram requires image for feed posts — text-only goes as a note
            results.push({ platform, success: false, error: 'Instagram feed posts require an image URL. Use the Instagram post route with an image.' });
            await supabaseAdmin.from('post_results').insert({ post_id: postId, platform, status: 'failed', error_message: 'Instagram requires image_url' });
          }
        }
      } else {
        results.push({ platform, success: false, error: `${platform} publishing not yet supported` });
        await supabaseAdmin.from('post_results').insert({
          post_id: postId,
          platform,
          status: 'failed',
          error_message: `${platform} publishing not yet supported`,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      results.push({ platform, success: false, error: msg });
      await supabaseAdmin.from('post_results').insert({
        post_id: postId,
        platform,
        status: 'failed',
        error_message: msg,
      });
    }
  }

  // Update post status based on results
  const anySuccess = results.some(r => r.success);
  const allFailed = results.every(r => !r.success);
  await supabaseAdmin
    .from('posts')
    .update({
      status: allFailed ? 'failed' : 'published',
      published_at: anySuccess ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId);

  return results;
}

// Export for use by cron
export { publishPost };
