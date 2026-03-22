'use client';
import { useState } from 'react';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

export default function PostsPage() {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('facebook');
  const [scheduled, setScheduled] = useState(false);

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: text, margin: 0 }}>Posts</h1>
        <button style={{ background: accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
          + New Post
        </button>
      </div>

      {/* Composer */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Compose Post</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content here..."
          style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.875rem', color: text, fontSize: '0.95rem', resize: 'vertical', minHeight: '120px', boxSizing: 'border-box', outline: 'none' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {/* Platform selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: muted, marginBottom: '0.4rem' }}>Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              style={{ background: bg, border: `1px solid ${border}`, borderRadius: '6px', color: text, padding: '0.5rem 0.75rem', fontSize: '0.9rem', cursor: 'pointer', outline: 'none' }}
            >
              <option value="facebook">📘 Facebook</option>
              <option value="youtube">🎬 YouTube</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Schedule toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: muted }}>Schedule</label>
            <div
              onClick={() => setScheduled(!scheduled)}
              style={{ width: '44px', height: '24px', borderRadius: '12px', background: scheduled ? accent : border, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
            >
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: scheduled ? '23px' : '3px', transition: 'left 0.2s' }} />
            </div>
          </div>

          {scheduled && (
            <input
              type="datetime-local"
              style={{ background: bg, border: `1px solid ${border}`, borderRadius: '6px', color: text, padding: '0.5rem 0.75rem', fontSize: '0.9rem', outline: 'none' }}
            />
          )}

          <button style={{ background: accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}>
            {scheduled ? 'Schedule Post' : 'Post Now'}
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
        <h3 style={{ color: text, marginBottom: '0.5rem' }}>No posts yet</h3>
        <p style={{ color: muted, margin: 0, fontSize: '0.9rem' }}>Create your first post using the composer above.</p>
      </div>
    </div>
  );
}
