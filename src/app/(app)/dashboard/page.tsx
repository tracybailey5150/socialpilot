'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

const stats = [
  { label: 'Total Posts', value: '14', change: '+4 this month', icon: '📝' },
  { label: 'Comments Replied', value: '43', change: '+12 today', icon: '💬' },
  { label: 'Scheduled', value: '5', change: 'next 7 days', icon: '📅' },
  { label: 'Total Reach', value: '24.3k', change: '+12% this week', icon: '👁️' },
];

const platformStatus = [
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

export default function DashboardPage() {
  const [quickPost, setQuickPost] = useState('');
  const router = useRouter();

  const handleQuickPost = () => {
    if (quickPost.trim()) {
      router.push('/posts');
    }
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', color: text }}>Good morning, Tracy 👋</h1>
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
        {stats.map((s) => (
          <div key={s.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: accent }}>{s.value}</div>
            <div style={{ color: muted, fontSize: '0.82rem', marginTop: '0.2rem' }}>{s.label}</div>
            <div style={{ color: '#4ADE80', fontSize: '0.75rem', marginTop: '0.2rem' }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            style={{
              background: action.accent ? 'rgba(16,185,129,0.1)' : card,
              border: `1px solid ${action.accent ? 'rgba(16,185,129,0.3)' : border}`,
              borderRadius: '12px',
              padding: '1.25rem',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              transition: 'all 0.15s',
            }}
          >
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
          <textarea
            value={quickPost}
            onChange={(e) => setQuickPost(e.target.value)}
            placeholder="What's on your mind? Type to start composing..."
            style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem', color: text, fontSize: '0.9rem', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', outline: 'none' }}
          />
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleQuickPost}
              style={{ background: accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Open Composer →
            </button>
            <Link
              href="/generate"
              style={{ background: 'transparent', color: accent, border: `1px solid rgba(16,185,129,0.3)`, borderRadius: '8px', padding: '0.65rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              ✨ AI Generate
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { icon: '📘', action: 'Post published', time: '2h ago', detail: 'Facebook · 1.2k reach' },
              { icon: '💬', action: 'Comment replied', time: '4h ago', detail: 'Instagram · Sarah M.' },
              { icon: '📅', action: 'Post scheduled', time: '6h ago', detail: 'Mar 25 · 3 platforms' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: i < 2 ? `1px solid ${border}` : 'none' }}>
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.action}</div>
                  <div style={{ fontSize: '0.78rem', color: muted }}>{item.detail}</div>
                </div>
                <span style={{ fontSize: '0.75rem', color: muted, whiteSpace: 'nowrap' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Unanswered Comments */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Comment Inbox</h2>
            <span style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px' }}>3 unanswered</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { author: 'Sarah M.', text: 'How long does onboarding take?', platform: '📘', time: '12m' },
              { author: 'Jake T.', text: 'Love the new content! 🔥', platform: '📸', time: '34m' },
            ].map((c, i) => (
              <div key={i} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.platform} {c.author}</span>
                  <span style={{ fontSize: '0.75rem', color: muted }}>{c.time} ago</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: muted }}>{c.text}</p>
              </div>
            ))}
          </div>
          <Link href="/comments" style={{ display: 'block', marginTop: '1rem', textAlign: 'center', color: accent, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
            View All Comments →
          </Link>
        </div>

        {/* Upcoming Schedule */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Upcoming</h2>
            <Link href="/schedule" style={{ color: accent, textDecoration: 'none', fontSize: '0.8rem' }}>View Calendar →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { date: 'Mar 24', content: 'Spring product launch announcement!', platforms: ['📘'] },
              { date: 'Mar 25', content: 'Behind the scenes content', platforms: ['📸', '🐦'] },
              { date: 'Mar 27', content: 'Weekly wrap-up video', platforms: ['▶️'] },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', background: bg, border: `1px solid ${border}`, borderRadius: '8px' }}>
                <div style={{ textAlign: 'center', minWidth: '44px' }}>
                  <div style={{ fontSize: '0.65rem', color: muted, fontWeight: 600 }}>{item.date.split(' ')[0].toUpperCase()}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: accent }}>{item.date.split(' ')[1]}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: text }}>{item.content}</p>
                  <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.25rem' }}>
                    {item.platforms.map((p, pi) => <span key={pi} style={{ fontSize: '0.85rem' }}>{p}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
