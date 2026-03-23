'use client';
import { useState } from 'react';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

const CHAR_LIMITS: Record<string, number> = {
  twitter: 280,
  instagram: 2200,
  facebook: 63206,
  youtube: 5000,
};

const platforms = [
  { id: 'facebook', icon: '📘', name: 'Facebook' },
  { id: 'instagram', icon: '📸', name: 'Instagram' },
  { id: 'youtube', icon: '▶️', name: 'YouTube' },
  { id: 'twitter', icon: '🐦', name: 'X / Twitter' },
];

type TabType = 'all' | 'scheduled' | 'published' | 'drafts';

const mockPosts = [
  {
    id: 1,
    content: 'Excited to announce our latest product update! 🚀 Check out all the new features we\'ve been working on.',
    platforms: ['facebook', 'twitter', 'instagram'],
    status: 'published',
    time: '2h ago',
    reach: '1,234',
    likes: '87',
  },
  {
    id: 2,
    content: 'Behind the scenes look at how we build our content strategy for the week. Planning is everything!',
    platforms: ['instagram', 'facebook'],
    status: 'scheduled',
    time: 'Mar 25, 10:00 AM',
    reach: '—',
    likes: '—',
  },
  {
    id: 3,
    content: 'Quick tip: The best time to post on Instagram is between 6-9 PM on weekdays. Save this post!',
    platforms: ['twitter'],
    status: 'drafts',
    time: 'Draft',
    reach: '—',
    likes: '—',
  },
];

export default function PostsPage() {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram', 'youtube', 'twitter']);
  const [hashtags, setHashtags] = useState('');
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const minLimit = selectedPlatforms.length > 0
    ? Math.min(...selectedPlatforms.map((p) => CHAR_LIMITS[p] ?? 5000))
    : 5000;

  const charCount = content.length;
  const overLimit = charCount > minLimit;

  const filteredPosts = activeTab === 'all'
    ? mockPosts
    : mockPosts.filter((p) => p.status === activeTab);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'published', label: 'Published' },
    { key: 'drafts', label: 'Drafts' },
  ];

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: text }}>Create Post</h1>
      <p style={{ color: muted, marginBottom: '2rem', fontSize: '0.9rem' }}>Compose and publish to all your connected platforms at once.</p>

      {/* Composer Card */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem' }}>
        {/* Platform Selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: muted, marginBottom: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Post to</div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {platforms.map((p) => {
              const sel = selectedPlatforms.includes(p.id);
              return (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.45rem 0.9rem', borderRadius: '8px', background: sel ? 'rgba(16,185,129,0.12)' : bg, border: `1px solid ${sel ? 'rgba(16,185,129,0.4)' : border}`, fontSize: '0.85rem', color: sel ? accent : muted, userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={sel}
                    onChange={() => togglePlatform(p.id)}
                    style={{ accentColor: accent, cursor: 'pointer' }}
                  />
                  <span>{p.icon}</span>
                  <span>{p.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Textarea */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What would you like to share today?"
            style={{ width: '100%', background: bg, border: `1px solid ${overLimit ? '#EF4444' : border}`, borderRadius: '10px', padding: '1rem', color: text, fontSize: '0.95rem', resize: 'vertical', minHeight: '120px', boxSizing: 'border-box', outline: 'none', lineHeight: 1.6 }}
          />
          <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', fontSize: '0.75rem', color: overLimit ? '#EF4444' : muted }}>
            {charCount}/{minLimit}
          </div>
        </div>

        {/* Hashtags */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#hashtag1 #hashtag2 #hashtag3"
            style={{ flex: 1, background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.65rem 1rem', color: text, fontSize: '0.875rem', outline: 'none' }}
          />
          <button style={{ background: 'rgba(16,185,129,0.12)', border: `1px solid rgba(16,185,129,0.3)`, color: accent, borderRadius: '8px', padding: '0.65rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            ✨ AI Hashtags
          </button>
        </div>

        {/* Media Upload */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: bg, border: `1px dashed rgba(255,255,255,0.15)`, borderRadius: '8px', padding: '0.65rem 1.25rem', color: muted, fontSize: '0.875rem', cursor: 'pointer' }}>
            <span>📎</span>
            <span>Add Image / Video</span>
          </button>
        </div>

        {/* Schedule Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {(['now', 'schedule'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setScheduleMode(mode)}
              style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: `1px solid ${scheduleMode === mode ? accent : border}`, background: scheduleMode === mode ? 'rgba(16,185,129,0.12)' : 'transparent', color: scheduleMode === mode ? accent : muted, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {mode === 'now' ? '⚡ Post Now' : '🕐 Schedule'}
            </button>
          ))}
        </div>

        {scheduleMode === 'schedule' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              style={{ background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.65rem 1rem', color: text, fontSize: '0.875rem', outline: 'none', colorScheme: 'dark' }}
            />
          </div>
        )}

        {/* Submit */}
        <button
          disabled={!content.trim() || selectedPlatforms.length === 0 || overLimit}
          style={{ background: content.trim() && selectedPlatforms.length > 0 && !overLimit ? accent : 'rgba(16,185,129,0.3)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.75rem 2rem', fontSize: '0.95rem', fontWeight: 700, cursor: content.trim() && selectedPlatforms.length > 0 && !overLimit ? 'pointer' : 'not-allowed' }}
        >
          {scheduleMode === 'now' ? `Post to ${selectedPlatforms.length} platform${selectedPlatforms.length !== 1 ? 's' : ''}` : `Schedule to ${selectedPlatforms.length} platform${selectedPlatforms.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Posts List */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Your Posts</h2>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: `1px solid ${border}`, paddingBottom: '0' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{ padding: '0.55rem 1rem', borderRadius: '6px 6px 0 0', border: 'none', background: 'transparent', color: activeTab === tab.key ? accent : muted, fontSize: '0.875rem', fontWeight: activeTab === tab.key ? 700 : 400, cursor: 'pointer', borderBottom: `2px solid ${activeTab === tab.key ? accent : 'transparent'}` }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Post Cards */}
        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: muted }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>No {activeTab === 'all' ? '' : activeTab} posts yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {filteredPosts.map((post) => (
              <div key={post.id} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, flex: 1, color: text }}>{post.content}</p>
                  <span style={{
                    flexShrink: 0,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: post.status === 'published' ? 'rgba(16,185,129,0.15)' : post.status === 'scheduled' ? 'rgba(59,130,246,0.15)' : 'rgba(148,163,184,0.12)',
                    color: post.status === 'published' ? accent : post.status === 'scheduled' ? '#60A5FA' : muted,
                  }}>
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </span>
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {post.platforms.map((pid) => {
                      const pl = platforms.find((p) => p.id === pid);
                      return pl ? <span key={pid} title={pl.name} style={{ fontSize: '1rem' }}>{pl.icon}</span> : null;
                    })}
                  </div>
                  <span style={{ color: muted, fontSize: '0.8rem' }}>🕐 {post.time}</span>
                  {post.status === 'published' && (
                    <>
                      <span style={{ color: muted, fontSize: '0.8rem' }}>👁 {post.reach}</span>
                      <span style={{ color: muted, fontSize: '0.8rem' }}>❤️ {post.likes}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
