'use client';
import { useState, useEffect } from 'react';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

const platformColors: Record<string, string> = {
  facebook: '#1877F2', instagram: '#E1306C', twitter: '#1DA1F2', youtube: '#FF0000',
};
const platformIcons: Record<string, string> = {
  facebook: '📘', instagram: '📸', twitter: '🐦', youtube: '▶️',
};
const platformNames: Record<string, string> = {
  facebook: 'Facebook', instagram: 'Instagram', twitter: 'X / Twitter', youtube: 'YouTube',
};

type PlatformData = {
  platform: string;
  posts: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  subscribers?: number;
  topPosts: Array<{ id: string; content: string; likes: number; comments: number; reach?: number; views?: number }>;
};

type AnalyticsData = {
  platforms: PlatformData[];
  totals: { reach: number; likes: number; comments: number; posts: number; scheduled: number };
};

function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/analytics');
        if (!res.ok) throw new Error('Failed to load');
        setData(await res.json());
      } catch {
        setError('Failed to load analytics. Connect your accounts to see data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: text }}>Analytics</h1>
        <div style={{ textAlign: 'center', padding: '4rem 0', color: muted }}>Loading analytics...</div>
      </div>
    );
  }

  const totals = data?.totals || { reach: 0, likes: 0, comments: 0, posts: 0, scheduled: 0 };
  const platforms = data?.platforms || [];
  const hasData = platforms.length > 0;

  const engagementRate = totals.reach > 0 ? ((totals.likes + totals.comments) / totals.reach * 100).toFixed(1) : '0';

  const kpis = [
    { label: 'Total Reach', value: formatNum(totals.reach), icon: '👁️' },
    { label: 'Engagement Rate', value: `${engagementRate}%`, icon: '💥' },
    { label: 'Total Likes', value: formatNum(totals.likes), icon: '❤️' },
    { label: 'Posts Created', value: totals.posts.toString(), icon: '📝' },
  ];

  const maxReach = Math.max(...platforms.map(p => p.reach), 1);

  // Collect all top posts across platforms
  const allTopPosts = platforms.flatMap(p =>
    p.topPosts.map(post => ({
      ...post,
      platform: p.platform,
      reach: post.reach || post.views || 0,
    }))
  ).sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments)).slice(0, 5);

  return (
    <div style={{ maxWidth: '1000px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: text }}>Analytics</h1>
      <p style={{ color: muted, marginBottom: '2rem', fontSize: '0.9rem' }}>Performance overview across all connected platforms.</p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '0.875rem 1.25rem', marginBottom: '2rem', fontSize: '0.875rem', color: '#EF4444' }}>
          {error}
        </div>
      )}

      {!hasData && (
        <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '0.875rem 1.25rem', marginBottom: '2rem', fontSize: '0.875rem', color: muted, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>📊</span>
          <span>Connect your accounts to see real-time analytics.</span>
          <a href="/accounts" style={{ color: accent, textDecoration: 'none', fontWeight: 600, marginLeft: 'auto' }}>Connect Accounts →</a>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{k.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: accent, marginBottom: '0.25rem' }}>{k.value}</div>
            <div style={{ color: muted, fontSize: '0.82rem' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {hasData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Platform Breakdown */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Platform Breakdown</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {platforms.map((p) => {
                const barWidth = Math.round((p.reach / maxReach) * 100);
                return (
                  <div key={p.platform}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <span>{platformIcons[p.platform]}</span>
                        <span>{platformNames[p.platform]}</span>
                      </div>
                      <span style={{ color: muted, fontSize: '0.8rem' }}>{formatNum(p.reach)} reach</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${barWidth}%`, background: platformColors[p.platform] || accent, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.75rem', color: muted }}>
                      <span>❤️ {formatNum(p.likes)}</span>
                      <span>💬 {formatNum(p.comments)}</span>
                      {p.shares > 0 && <span>🔄 {formatNum(p.shares)}</span>}
                      {p.subscribers && <span>👥 {formatNum(p.subscribers)} subs</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Posts */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Top Posts</h2>
            {allTopPosts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {allTopPosts.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: i === 0 ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: i === 0 ? '#FBB924' : muted, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 0.35rem', fontSize: '0.82rem', lineHeight: 1.4, color: text }}>{p.content.slice(0, 70)}...</p>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: muted }}>
                        <span>{platformIcons[p.platform]}</span>
                        <span>👁 {formatNum(p.reach)}</span>
                        <span>❤️ {formatNum(p.likes)}</span>
                        <span>💬 {formatNum(p.comments)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: muted, fontSize: '0.875rem' }}>
                No posts yet. Start posting to see your top content!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post Stats from DB */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Content Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div style={{ background: bg, borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: accent }}>{totals.posts}</div>
            <div style={{ color: muted, fontSize: '0.82rem', marginTop: '0.25rem' }}>Total Posts</div>
          </div>
          <div style={{ background: bg, borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60A5FA' }}>{totals.scheduled}</div>
            <div style={{ color: muted, fontSize: '0.82rem', marginTop: '0.25rem' }}>Scheduled</div>
          </div>
          <div style={{ background: bg, borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: accent }}>{platforms.length}</div>
            <div style={{ color: muted, fontSize: '0.82rem', marginTop: '0.25rem' }}>Platforms Connected</div>
          </div>
          <div style={{ background: bg, borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FBB924' }}>{formatNum(totals.likes + totals.comments)}</div>
            <div style={{ color: muted, fontSize: '0.82rem', marginTop: '0.25rem' }}>Total Engagement</div>
          </div>
        </div>
      </div>
    </div>
  );
}
