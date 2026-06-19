export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getValidYouTubeToken } from '@/lib/token-refresh';

async function getAuthUser() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { cookie: allCookies.map(c => `${c.name}=${c.value}`).join('; ') } },
  });
  const { data: { user } } = await client.auth.getUser();
  return user;
}

async function getFacebookAnalytics(account: { access_token: string; platform_user_id: string }) {
  try {
    // Get page posts with insights
    const postsRes = await fetch(
      `https://graph.facebook.com/v21.0/${account.platform_user_id}/posts?fields=id,message,created_time,likes.summary(true),comments.summary(true),shares&limit=25&access_token=${account.access_token}`
    );
    const postsData = await postsRes.json();

    if (postsData.error) return null;

    const posts = (postsData.data || []).map((p: { id: string; message?: string; created_time: string; likes?: { summary: { total_count: number } }; comments?: { summary: { total_count: number } }; shares?: { count: number } }) => ({
      id: p.id,
      content: p.message || '',
      created: p.created_time,
      likes: p.likes?.summary?.total_count || 0,
      comments: p.comments?.summary?.total_count || 0,
      shares: p.shares?.count || 0,
    }));

    const totalLikes = posts.reduce((s: number, p: { likes: number }) => s + p.likes, 0);
    const totalComments = posts.reduce((s: number, p: { comments: number }) => s + p.comments, 0);
    const totalShares = posts.reduce((s: number, p: { shares: number }) => s + p.shares, 0);

    // Get page insights for reach
    let totalReach = 0;
    try {
      const insightsRes = await fetch(
        `https://graph.facebook.com/v21.0/${account.platform_user_id}/insights?metric=page_impressions&period=days_28&access_token=${account.access_token}`
      );
      const insightsData = await insightsRes.json();
      const values = insightsData.data?.[0]?.values || [];
      totalReach = values.reduce((s: number, v: { value: number }) => s + (v.value || 0), 0);
    } catch { /* insights may not be available */ }

    return {
      platform: 'facebook',
      posts: posts.length,
      reach: totalReach,
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      topPosts: posts
        .sort((a: { likes: number; comments: number }, b: { likes: number; comments: number }) => (b.likes + b.comments) - (a.likes + a.comments))
        .slice(0, 3),
    };
  } catch {
    return null;
  }
}

async function getYouTubeAnalytics(account: { id: string; access_token: string; refresh_token: string | null; token_expires_at: string | null }) {
  try {
    const token = await getValidYouTubeToken(account);

    // Get channel stats
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&mine=true&access_token=${token}`
    );
    const channelData = await channelRes.json();
    if (channelData.error) return null;

    const channel = channelData.items?.[0];
    if (!channel) return null;

    const stats = channel.statistics;

    // Get recent videos
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.id}&type=video&order=date&maxResults=10&access_token=${token}`
    );
    const videosData = await videosRes.json();
    const videoIds = (videosData.items || []).map((v: { id: { videoId: string } }) => v.id.videoId).join(',');

    let videos: Array<{ id: string; content: string; created: string; likes: number; comments: number; views: number }> = [];
    if (videoIds) {
      const statsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&access_token=${token}`
      );
      const statsData = await statsRes.json();
      videos = (statsData.items || []).map((v: { id: string; snippet: { title: string; publishedAt: string }; statistics: { viewCount?: string; likeCount?: string; commentCount?: string } }) => ({
        id: v.id,
        content: v.snippet.title,
        created: v.snippet.publishedAt,
        likes: parseInt(v.statistics.likeCount || '0'),
        comments: parseInt(v.statistics.commentCount || '0'),
        views: parseInt(v.statistics.viewCount || '0'),
      }));
    }

    return {
      platform: 'youtube',
      posts: parseInt(stats.videoCount || '0'),
      reach: parseInt(stats.viewCount || '0'),
      likes: videos.reduce((s, v) => s + v.likes, 0),
      comments: videos.reduce((s, v) => s + v.comments, 0),
      shares: 0,
      subscribers: parseInt(stats.subscriberCount || '0'),
      topPosts: videos
        .sort((a, b) => b.views - a.views)
        .slice(0, 3)
        .map(v => ({ ...v, reach: v.views })),
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: accounts } = await supabaseAdmin
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (!accounts?.length) {
      return NextResponse.json({ platforms: [], totals: { reach: 0, likes: 0, comments: 0, posts: 0 } });
    }

    const platformResults = [];

    for (const account of accounts) {
      if (account.platform === 'facebook') {
        const data = await getFacebookAnalytics(account);
        if (data) platformResults.push(data);
      } else if (account.platform === 'youtube') {
        const data = await getYouTubeAnalytics(account);
        if (data) platformResults.push(data);
      }
    }

    // Get post counts from DB
    const { count: totalPosts } = await supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: scheduledPosts } = await supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'scheduled');

    const totals = {
      reach: platformResults.reduce((s, p) => s + p.reach, 0),
      likes: platformResults.reduce((s, p) => s + p.likes, 0),
      comments: platformResults.reduce((s, p) => s + p.comments, 0),
      posts: totalPosts || 0,
      scheduled: scheduledPosts || 0,
    };

    return NextResponse.json({ platforms: platformResults, totals });
  } catch (err) {
    console.error('Analytics error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
