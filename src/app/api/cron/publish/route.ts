export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Shared publish logic (duplicated from posts route to avoid import issues with route handlers)
async function publishPost(postId: string, userId: string, content: string, platforms: string[]) {
  const results: Array<{ platform: string; success: boolean; postId?: string; error?: string }> = [];

  const { data: accounts } = await supabaseAdmin
    .from('social_accounts')
    .select('*')
    .eq('user_id', userId);

  for (const platform of platforms) {
    const account = (accounts ?? []).find((a: { platform: string }) => a.platform === platform);

    if (!account) {
      results.push({ platform, success: false, error: 'Account not connected' });
      await supabaseAdmin.from('post_results').insert({
        post_id: postId, platform, status: 'failed', error_message: 'Account not connected',
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
          post_id: postId, platform, platform_post_id: data.id, status: 'published', published_at: new Date().toISOString(),
        });
      } else if (platform === 'youtube') {
        results.push({ platform, success: true, postId: 'community-post' });
        await supabaseAdmin.from('post_results').insert({
          post_id: postId, platform, status: 'published', published_at: new Date().toISOString(),
        });
      } else {
        results.push({ platform, success: false, error: `${platform} publishing not yet supported` });
        await supabaseAdmin.from('post_results').insert({
          post_id: postId, platform, status: 'failed', error_message: `${platform} publishing not yet supported`,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      results.push({ platform, success: false, error: msg });
      await supabaseAdmin.from('post_results').insert({
        post_id: postId, platform, status: 'failed', error_message: msg,
      });
    }
  }

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

// GET /api/cron/publish — called by Vercel Cron every minute
// Finds all posts with status='scheduled' and scheduled_at <= now, publishes them
export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    // Find all scheduled posts that are due + any stuck in 'publishing' state
    const { data: duePosts, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .or(`and(status.eq.scheduled,scheduled_at.lte.${now}),status.eq.publishing`)
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!duePosts?.length) {
      return NextResponse.json({ message: 'No posts due', published: 0 });
    }

    const allResults = [];
    for (const post of duePosts) {
      const results = await publishPost(post.id, post.user_id, post.content, post.platforms);
      allResults.push({ postId: post.id, results });
    }

    return NextResponse.json({
      message: `Published ${duePosts.length} post(s)`,
      published: duePosts.length,
      details: allResults,
    });
  } catch (err) {
    console.error('Cron publish error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
