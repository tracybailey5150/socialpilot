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

type Comment = {
  id: string;
  platform: string;
  author: string;
  text: string;
  createdAt: string;
  postId?: string;
  postContent?: string;
};

// GET /api/comments — fetch real comments from connected platforms
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: accounts } = await supabaseAdmin
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (!accounts?.length) {
      return NextResponse.json({ comments: [] });
    }

    const allComments: Comment[] = [];

    for (const account of accounts) {
      if (account.platform === 'facebook') {
        try {
          // Get recent posts
          const postsRes = await fetch(
            `https://graph.facebook.com/v21.0/${account.platform_user_id}/posts?fields=id,message&limit=10&access_token=${account.access_token}`
          );
          const postsData = await postsRes.json();

          for (const post of (postsData.data || []).slice(0, 5)) {
            // Get comments on each post
            const commentsRes = await fetch(
              `https://graph.facebook.com/v21.0/${post.id}/comments?fields=id,message,from,created_time&limit=10&access_token=${account.access_token}`
            );
            const commentsData = await commentsRes.json();

            for (const c of (commentsData.data || [])) {
              allComments.push({
                id: c.id,
                platform: 'facebook',
                author: c.from?.name || 'Unknown',
                text: c.message || '',
                createdAt: c.created_time,
                postId: post.id,
                postContent: post.message?.slice(0, 50) || 'Post',
              });
            }
          }
        } catch { /* ignore FB errors */ }
      }

      if (account.platform === 'youtube') {
        try {
          const token = await getValidYouTubeToken(account);

          // Get recent videos
          const channelRes = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true&access_token=${token}`
          );
          const channelData = await channelRes.json();
          const uploadsPlaylist = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

          if (uploadsPlaylist) {
            const videosRes = await fetch(
              `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylist}&maxResults=5&access_token=${token}`
            );
            const videosData = await videosRes.json();

            for (const video of (videosData.items || [])) {
              const videoId = video.snippet?.resourceId?.videoId;
              if (!videoId) continue;

              const commentsRes = await fetch(
                `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=10&access_token=${token}`
              );
              const commentsData = await commentsRes.json();

              for (const thread of (commentsData.items || [])) {
                const c = thread.snippet?.topLevelComment?.snippet;
                if (!c) continue;
                allComments.push({
                  id: thread.id,
                  platform: 'youtube',
                  author: c.authorDisplayName || 'Unknown',
                  text: c.textDisplay || '',
                  createdAt: c.publishedAt,
                  postId: videoId,
                  postContent: video.snippet?.title?.slice(0, 50) || 'Video',
                });
              }
            }
          }
        } catch { /* ignore YT errors */ }
      }
    }

    // Sort by most recent
    allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ comments: allComments.slice(0, 50) });
  } catch (err) {
    console.error('Comments fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/comments — reply to a comment
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { commentId, platform, replyText } = await req.json();

    if (!commentId || !platform || !replyText?.trim()) {
      return NextResponse.json({ error: 'commentId, platform, and replyText are required' }, { status: 400 });
    }

    const { data: accounts } = await supabaseAdmin
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', platform);

    const account = accounts?.[0];
    if (!account) {
      return NextResponse.json({ error: `No ${platform} account connected` }, { status: 404 });
    }

    if (platform === 'facebook') {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${commentId}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: replyText.trim(),
            access_token: account.access_token,
          }),
        }
      );
      const data = await res.json();
      if (data.error) {
        return NextResponse.json({ error: data.error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, replyId: data.id });
    }

    if (platform === 'youtube') {
      const token = await getValidYouTubeToken(account);
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/comments?part=snippet`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            snippet: {
              parentId: commentId,
              textOriginal: replyText.trim(),
            },
          }),
        }
      );
      const data = await res.json();
      if (data.error) {
        return NextResponse.json({ error: data.error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, replyId: data.id });
    }

    return NextResponse.json({ error: `Replying on ${platform} is not supported yet` }, { status: 400 });
  } catch (err) {
    console.error('Comment reply error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
