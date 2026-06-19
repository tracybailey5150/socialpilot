'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

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

type TabType = 'all' | 'scheduled' | 'published' | 'draft';

type Post = {
  id: string;
  content: string;
  platforms: string[];
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  post_results?: Array<{ platform: string; reach: number; likes: number; status: string }>;
};

export default function PostsPage() {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook']);
  const [hashtags, setHashtags] = useState('');
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

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

  const handleSubmit = async () => {
    if (!content.trim() || selectedPlatforms.length === 0 || overLimit) return;
    setPublishing(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          platforms: selectedPlatforms,
          hashtags: hashtags.trim(),
          scheduledAt: scheduleMode === 'schedule' && scheduleDate ? new Date(scheduleDate).toISOString() : null,
          publishNow: scheduleMode === 'now',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to create post' });
      } else {
        const action = scheduleMode === 'now' ? 'Published' : 'Scheduled';
        setStatusMessage({ type: 'success', text: `${action} successfully!` });
        setContent('');
        setHashtags('');
        setScheduleDate('');
        loadPosts();
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error' });
    } finally {
      setPublishing(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const filteredPosts = activeTab === 'all'
    ? posts
    : posts.filter((p) => p.status === activeTab);

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: posts.length },
    { key: 'scheduled', label: 'Scheduled', count: posts.filter(p => p.status === 'scheduled').length },
    { key: 'published', label: 'Published', count: posts.filter(p => p.status === 'published').length },
    { key: 'draft', label: 'Drafts', count: posts.filter(p => p.status === 'draft').length },
  ];

  const formatTime = (post: Post) => {
    if (post.status === 'published' && post.published_at) {
      const diff = Date.now() - new Date(post.published_at).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      return new Date(post.published_at).toLocaleDateString();
    }
    if (post.status === 'scheduled' && post.scheduled_at) {
      return new Date(post.scheduled_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }
    return 'Draft';
  };

  const getTotalMetrics = (post: Post) => {
    const results = post.post_results || [];
    return {
      reach: results.reduce((sum, r) => sum + (r.reach || 0), 0),
      likes: results.reduce((sum, r) => sum + (r.likes || 0), 0),
    };
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: text }}>Create Post</h1>
      <p style={{ color: muted, marginBottom: '2rem', fontSize: '0.9rem' }}>Compose and publish to all your connected platforms at once.</p>

      {statusMessage && (
        <div style={{ background: statusMessage.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${statusMessage.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '10px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', color: statusMessage.type === 'success' ? accent : '#EF4444', fontSize: '0.9rem', fontWeight: 600 }}>
          {statusMessage.text}
        </div>
      )}

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
                  <input type="checkbox" checked={sel} onChange={() => togglePlatform(p.id)} style={{ accentColor: accent, cursor: 'pointer' }} />
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
          onClick={handleSubmit}
          disabled={!content.trim() || selectedPlatforms.length === 0 || overLimit || publishing}
          style={{ background: content.trim() && selectedPlatforms.length > 0 && !overLimit && !publishing ? accent : 'rgba(16,185,129,0.3)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.75rem 2rem', fontSize: '0.95rem', fontWeight: 700, cursor: content.trim() && selectedPlatforms.length > 0 && !overLimit && !publishing ? 'pointer' : 'not-allowed' }}
        >
          {publishing ? '⏳ Publishing...' : scheduleMode === 'now' ? `Post to ${selectedPlatforms.length} platform${selectedPlatforms.length !== 1 ? 's' : ''}` : `Schedule to ${selectedPlatforms.length} platform${selectedPlatforms.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Posts List */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Your Posts</h2>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: `1px solid ${border}` }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{ padding: '0.55rem 1rem', borderRadius: '6px 6px 0 0', border: 'none', background: 'transparent', color: activeTab === tab.key ? accent : muted, fontSize: '0.875rem', fontWeight: activeTab === tab.key ? 700 : 400, cursor: 'pointer', borderBottom: `2px solid ${activeTab === tab.key ? accent : 'transparent'}` }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: muted }}>Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: muted }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>No {activeTab === 'all' ? '' : activeTab} posts yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {filteredPosts.map((post) => {
              const metrics = getTotalMetrics(post);
              return (
                <div key={post.id} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, flex: 1, color: text }}>{post.content.length > 120 ? post.content.slice(0, 120) + '...' : post.content}</p>
                    <span style={{
                      flexShrink: 0,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: post.status === 'published' ? 'rgba(16,185,129,0.15)' : post.status === 'scheduled' ? 'rgba(59,130,246,0.15)' : post.status === 'failed' ? 'rgba(239,68,68,0.15)' : 'rgba(148,163,184,0.12)',
                      color: post.status === 'published' ? accent : post.status === 'scheduled' ? '#60A5FA' : post.status === 'failed' ? '#EF4444' : muted,
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
                    <span style={{ color: muted, fontSize: '0.8rem' }}>🕐 {formatTime(post)}</span>
                    {post.status === 'published' && metrics.reach > 0 && (
                      <>
                        <span style={{ color: muted, fontSize: '0.8rem' }}>👁 {metrics.reach.toLocaleString()}</span>
                        <span style={{ color: muted, fontSize: '0.8rem' }}>❤️ {metrics.likes.toLocaleString()}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
