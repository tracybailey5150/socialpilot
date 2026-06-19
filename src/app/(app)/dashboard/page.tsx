'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

const platformIcons: Record<string, string> = {
  facebook: '📘', instagram: '📸', youtube: '▶️', twitter: '🐦',
};

const defaultPlatformStatus = [
  { id: 'facebook', icon: '📘', name: 'Facebook', connected: false },
  { id: 'instagram', icon: '📸', name: 'Instagram', connected: false },
  { id: 'youtube', icon: '▶️', name: 'YouTube', connected: false },
  { id: 'twitter', icon: '🐦', name: 'Twitter', connected: false },
];

const quickActions = [
  { icon: '📝', label: 'Create Post', href: '/posts', desc: 'Write & publish now' },
  { icon: '✨', label: 'AI Generator', href: '/generate', desc: 'Generate AI content', accent: true },
  { icon: '📅', label: 'Schedule', href: '/schedule', desc: 'Plan your calendar' },
  { icon: '📊', label: 'Analytics', href: '/analytics', desc: 'View performance' },
];

type Post = {
  id: string;
  content: string;
  platforms: string[];
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const [quickPost, setQuickPost] = useState('');
  const [platformStatus, setPlatformStatus] = useState(defaultPlatformStatus);
  const [userName, setUserName] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({ total: 0, published: 0, scheduled: 0 });
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get display name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '';
      setUserName(displayName.split(' ')[0]);

      // Get connected accounts
      const { data: accounts } = await supabase
        .from('social_accounts')
        .select('platform')
        .eq('user_id', user.id);
      const connectedIds = new Set((accounts ?? []).map((a: { platform: string }) => a.platform));
      setPlatformStatus(defaultPlatformStatus.map(p => ({ ...p, connected: connectedIds.has(p.id) })));

      // Get real posts
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          const allPosts = data.posts || [];
          setPosts(allPosts);
          setStats({
            total: allPosts.length,
            published: allPosts.filter((p: Post) => p.status === 'published').length,
            scheduled: allPosts.filter((p: Post) => p.status === 'scheduled').length,
          });
        }
      } catch { /* ignore */ }
    };
    load();
  }, []);

  const handleQuickPost = () => {
    if (quickPost.trim()) router.push('/posts');
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const recentPosts = posts.slice(0, 3);
  const upcomingPosts = posts.filter(p => p.status === 'scheduled').sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime()).slice(0, 3);

  const statCards = [
    { label: 'Total Posts', value: stats.total.toString(), icon: '📝' },
    { label: 'Published', value: stats.published.toString(), icon: '✅' },
    { label: 'Scheduled', value: stats.scheduled.toString(), icon: '📅' },
    { label: 'Platforms', value: platformStatus.filter(p => p.connected).length.toString(), icon: '🔗' },
  ];

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', color: text }}>{greeting()}, {userName || 'there'} 👋</h1>
        <p style={{ color: muted, fontSize: '0.9rem', margin: 0 }}>Here&apos;s what&apos;s happening with your social accounts.</p>
      </div>

      {/* Platform Connection Strip */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: muted, fontWeight: 600 }}>PLATFORMS:</span>
          {platformStatus.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.65rem', borderRadius: '20px', background: p.connected ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${p.connected ? 'rgba(16,185,129,0.3)' : border}`, fontSize: '0.8rem' }}>
              <span>{p.icon}</span>
              <span style={{ color: p.connected ? accent : muted }}>{p.name}</span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.connected ? accent : '#374151', display: 'inline-block' }} />
            </div>
          ))}
        </div>
        <Link href="/accounts" style={{ color: accent, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
          Connect Accounts →
        </Link>
      </div>

      {/* Stat Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map((s) => (
          <div key={s.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: accent }}>{s.value}</div>
            <div style={{ color: muted, fontSize: '0.82rem', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href} style={{ background: action.accent ? 'rgba(16,185,129,0.1)' : card, border: `1px solid ${action.accent ? 'rgba(16,185,129,0.3)' : border}`, borderRadius: '12px', padding: '1.25rem', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', transition: 'all 0.15s' }}>
            <span style={{ fontSize: '1.5rem' }}>{action.icon}</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: action.accent ? accent : text }}>{action.label}</span>
            <span style={{ fontSize: '0.8rem', color: muted }}>{action.desc}</span>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Quick Post */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Quick Post</h2>
          <textarea value={quickPost} onChange={(e) => setQuickPost(e.target.value)} placeholder="What's on your mind? Type to start composing..." style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem', color: text, fontSize: '0.9rem', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', outline: 'none' }} />
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleQuickPost} style={{ background: accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
              Open Composer →
            </button>
            <Link href="/generate" style={{ background: 'transparent', color: accent, border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '0.65rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              ✨ AI Generate
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Recent Posts</h2>
          {recentPosts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentPosts.map((post) => (
                <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: `1px solid ${border}` }}>
                  <span style={{ fontSize: '1.1rem' }}>{post.platforms.map(p => platformIcons[p] || '').join('')}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: text }}>{post.content.slice(0, 40)}...</div>
                    <div style={{ fontSize: '0.78rem', color: muted }}>
                      {post.status === 'published' ? 'Published' : post.status === 'scheduled' ? 'Scheduled' : post.status}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: muted, whiteSpace: 'nowrap' }}>
                    {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: muted, fontSize: '0.875rem' }}>
              No posts yet. <Link href="/posts" style={{ color: accent, textDecoration: 'none' }}>Create your first post →</Link>
            </div>
          )}
        </div>

        {/* Upcoming Schedule */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Upcoming Scheduled Posts</h2>
            <Link href="/schedule" style={{ color: accent, textDecoration: 'none', fontSize: '0.8rem' }}>View Calendar →</Link>
          </div>
          {upcomingPosts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {upcomingPosts.map((post) => (
                <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: bg, border: `1px solid ${border}`, borderRadius: '8px' }}>
                  <div style={{ textAlign: 'center', minWidth: '44px' }}>
                    <div style={{ fontSize: '0.65rem', color: muted, fontWeight: 600 }}>
                      {new Date(post.scheduled_at!).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: accent }}>
                      {new Date(post.scheduled_at!).getDate()}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: text }}>{post.content.slice(0, 50)}...</p>
                    <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.25rem' }}>
                      {post.platforms.map((p) => <span key={p} style={{ fontSize: '0.85rem' }}>{platformIcons[p]}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: muted, fontSize: '0.875rem' }}>
              No scheduled posts. <Link href="/posts" style={{ color: accent, textDecoration: 'none' }}>Schedule a post →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
