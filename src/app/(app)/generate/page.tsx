'use client';
import { useState } from 'react';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

type GeneratedPost = {
  text: string;
  hashtags: string[];
};

const tones = ['Professional', 'Casual', 'Humorous', 'Inspirational'];
const platforms = ['All', 'Facebook', 'Instagram', 'Twitter', 'LinkedIn'];
const contentTypes = ['Announcement', 'Educational', 'Promotional', 'Question', 'Story'];

export default function GeneratePage() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Casual');
  const [platform, setPlatform] = useState('All');
  const [contentType, setContentType] = useState('Announcement');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // Hashtag generator
  const [hashTopic, setHashTopic] = useState('');
  const [hashLoading, setHashLoading] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setPosts([]);
    try {
      const res = await fetch('/api/generate/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone, platform, contentType }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setError('Failed to generate content. Please check your API key or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (idx: number, t: string) => {
    navigator.clipboard.writeText(t);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleEdit = (idx: number, t: string) => {
    setEditIdx(idx);
    setEditText(t);
  };

  const saveEdit = (idx: number) => {
    setPosts((prev) => prev.map((p, i) => i === idx ? { ...p, text: editText } : p));
    setEditIdx(null);
  };

  const handleGenerateHashtags = async () => {
    if (!hashTopic.trim()) return;
    setHashLoading(true);
    setHashtags([]);
    try {
      const res = await fetch('/api/generate/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: hashTopic, tone: 'Casual', platform: 'All', contentType: 'Announcement' }),
      });
      const data = await res.json();
      const allTags = (data.posts || []).flatMap((p: GeneratedPost) => p.hashtags || []);
      const unique = [...new Set(allTags)].slice(0, 15) as string[];
      setHashtags(unique);
    } catch {
      setHashtags(['#socialmedia', '#content', '#marketing', '#digital', '#growth']);
    } finally {
      setHashLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: text }}>
          ✨ AI Content Generator
        </h1>
        <p style={{ color: muted, fontSize: '0.9rem', margin: 0 }}>
          Generate 5 tailored post variations instantly using AI.
        </p>
      </div>

      {/* Generator Card */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem' }}>
        {/* Topic */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            What do you want to post about?
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Our new product launch, a tips post about social media marketing, behind the scenes of our team..."
            style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '0.875rem', color: text, fontSize: '0.9rem', resize: 'vertical', minHeight: '90px', boxSizing: 'border-box', outline: 'none', lineHeight: 1.6 }}
          />
        </div>

        {/* Options Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Tone */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Tone</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {tones.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  style={{ padding: '0.35rem 0.75rem', borderRadius: '20px', border: `1px solid ${tone === t ? accent : border}`, background: tone === t ? 'rgba(16,185,129,0.12)' : 'transparent', color: tone === t ? accent : muted, fontSize: '0.8rem', fontWeight: tone === t ? 700 : 400, cursor: 'pointer' }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Platform Focus</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  style={{ padding: '0.35rem 0.75rem', borderRadius: '20px', border: `1px solid ${platform === p ? accent : border}`, background: platform === p ? 'rgba(16,185,129,0.12)' : 'transparent', color: platform === p ? accent : muted, fontSize: '0.8rem', fontWeight: platform === p ? 700 : 400, cursor: 'pointer' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Content Type */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Content Type</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {contentTypes.map((ct) => (
                <button
                  key={ct}
                  onClick={() => setContentType(ct)}
                  style={{ padding: '0.35rem 0.75rem', borderRadius: '20px', border: `1px solid ${contentType === ct ? accent : border}`, background: contentType === ct ? 'rgba(16,185,129,0.12)' : 'transparent', color: contentType === ct ? accent : muted, fontSize: '0.8rem', fontWeight: contentType === ct ? 700 : 400, cursor: 'pointer' }}
                >
                  {ct}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          style={{ background: topic.trim() && !loading ? accent : 'rgba(16,185,129,0.3)', border: 'none', color: '#fff', borderRadius: '10px', padding: '0.8rem 2rem', fontSize: '0.95rem', fontWeight: 700, cursor: topic.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {loading ? '⏳ Generating...' : '✨ Generate Ideas'}
        </button>

        {error && (
          <div style={{ marginTop: '1rem', color: '#EF4444', fontSize: '0.875rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {posts.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: text }}>
            Generated Variations ({posts.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {posts.map((post, idx) => (
              <div key={idx} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: muted, fontWeight: 600 }}>Variation {idx + 1}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleCopy(idx, post.text)}
                      style={{ background: 'transparent', border: `1px solid ${border}`, color: muted, borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      {copiedIdx === idx ? '✅ Copied' : '📋 Copy'}
                    </button>
                    <button
                      onClick={() => handleEdit(idx, post.text)}
                      style={{ background: 'transparent', border: `1px solid ${border}`, color: muted, borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={{ background: accent, border: 'none', color: '#fff', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Use This →
                    </button>
                  </div>
                </div>
                {editIdx === idx ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{ width: '100%', background: bg, border: `1px solid ${accent}`, borderRadius: '8px', padding: '0.75rem', color: text, fontSize: '0.9rem', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', outline: 'none' }}
                    />
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => saveEdit(idx)} style={{ background: accent, border: 'none', color: '#fff', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                      <button onClick={() => setEditIdx(null)} style={{ background: 'transparent', border: `1px solid ${border}`, color: muted, borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', lineHeight: 1.6, color: text }}>{post.text}</p>
                )}
                {post.hashtags && post.hashtags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {post.hashtags.map((tag, ti) => (
                      <span key={ti} style={{ background: 'rgba(16,185,129,0.08)', color: accent, padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem' }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hashtag Generator Section */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: text }}>🏷️ Generate Hashtags</h2>
        <p style={{ color: muted, fontSize: '0.875rem', marginBottom: '1.25rem' }}>Enter a topic to get relevant hashtag suggestions.</p>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={hashTopic}
            onChange={(e) => setHashTopic(e.target.value)}
            placeholder="e.g. real estate marketing, small business tips..."
            style={{ flex: 1, background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.65rem 1rem', color: text, fontSize: '0.875rem', outline: 'none' }}
          />
          <button
            onClick={handleGenerateHashtags}
            disabled={hashLoading || !hashTopic.trim()}
            style={{ background: hashTopic.trim() && !hashLoading ? accent : 'rgba(16,185,129,0.3)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.65rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: hashTopic.trim() && !hashLoading ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}
          >
            {hashLoading ? '⏳...' : 'Get Hashtags'}
          </button>
        </div>
        {hashtags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {hashtags.map((tag, i) => (
              <span
                key={i}
                onClick={() => navigator.clipboard.writeText(tag)}
                title="Click to copy"
                style={{ background: 'rgba(16,185,129,0.1)', color: accent, padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', border: `1px solid rgba(16,185,129,0.2)` }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
