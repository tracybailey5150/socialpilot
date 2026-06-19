'use client';
import { useState, useEffect } from 'react';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

const platformIcons: Record<string, string> = {
  facebook: '📘', instagram: '📸', youtube: '▶️', twitter: '🐦',
};
const platformNames: Record<string, string> = {
  facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', twitter: 'X / Twitter',
};

type Comment = {
  id: string;
  platform: string;
  author: string;
  text: string;
  createdAt: string;
  postContent?: string;
  // Client state
  replyText: string;
  showReply: boolean;
  aiLoading: boolean;
  replySent: boolean;
  replySending: boolean;
};

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/comments');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setComments(
          (data.comments || []).map((c: Omit<Comment, 'replyText' | 'showReply' | 'aiLoading' | 'replySent' | 'replySending'>) => ({
            ...c,
            replyText: '',
            showReply: false,
            aiLoading: false,
            replySent: false,
            replySending: false,
          }))
        );
      } catch {
        setError('No comments found. Connect your accounts and start engaging!');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleReply = (id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, showReply: !c.showReply } : c));
  };

  const setReplyText = (id: string, val: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, replyText: val } : c));
  };

  const generateAIReply = async (id: string) => {
    const comment = comments.find(c => c.id === id);
    if (!comment) return;

    setComments(prev => prev.map(c => c.id === id ? { ...c, aiLoading: true, showReply: true } : c));

    try {
      const res = await fetch('/api/comments/ai-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentText: comment.text,
          authorName: comment.author,
          platform: comment.platform,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setComments(prev => prev.map(c => c.id === id ? { ...c, replyText: data.reply, aiLoading: false } : c));
      } else {
        setComments(prev => prev.map(c => c.id === id ? { ...c, aiLoading: false } : c));
      }
    } catch {
      setComments(prev => prev.map(c => c.id === id ? { ...c, aiLoading: false } : c));
    }
  };

  const sendReply = async (id: string) => {
    const comment = comments.find(c => c.id === id);
    if (!comment || !comment.replyText.trim()) return;

    setComments(prev => prev.map(c => c.id === id ? { ...c, replySending: true } : c));

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: comment.id,
          platform: comment.platform,
          replyText: comment.replyText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => prev.map(c => c.id === id ? { ...c, replySent: true, replySending: false, showReply: false } : c));
      } else {
        alert(data.error || 'Failed to send reply');
        setComments(prev => prev.map(c => c.id === id ? { ...c, replySending: false } : c));
      }
    } catch {
      alert('Network error');
      setComments(prev => prev.map(c => c.id === id ? { ...c, replySending: false } : c));
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const total = comments.length;
  const replied = comments.filter(c => c.replySent).length;
  const unreplied = total - replied;

  const stats = [
    { label: 'Total Comments', value: total, icon: '💬' },
    { label: 'Unreplied', value: unreplied, icon: '📬', highlight: unreplied > 0 },
    { label: 'Replied', value: replied, icon: '✅' },
  ];

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: text }}>Comment Inbox</h1>
      <p style={{ color: muted, marginBottom: '2rem', fontSize: '0.9rem' }}>Manage and reply to comments across all platforms.</p>

      {/* Stat Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: (s as { highlight?: boolean }).highlight ? '#F59E0B' : accent }}>{s.value}</div>
            <div style={{ color: muted, fontSize: '0.8rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: muted }}>Loading comments...</div>
      ) : error && comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: muted, background: card, border: `1px solid ${border}`, borderRadius: '16px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{error}</p>
          <a href="/accounts" style={{ color: accent, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Connect Accounts →</a>
        </div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: muted, background: card, border: `1px solid ${border}`, borderRadius: '16px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>All caught up!</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>No new comments to reply to.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {comments.map((comment) => (
            <div key={comment.id} style={{ background: card, border: `1px solid ${comment.replySent ? 'rgba(16,185,129,0.3)' : border}`, borderRadius: '12px', padding: '1.25rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                    {comment.author.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{comment.author}</div>
                    <div style={{ color: muted, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{platformIcons[comment.platform]}</span>
                      <span>{platformNames[comment.platform]}</span>
                      <span>·</span>
                      <span>{timeAgo(comment.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {comment.replySent && (
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(16,185,129,0.12)', color: accent }}>
                    Replied
                  </span>
                )}
              </div>

              {/* Comment Text */}
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', lineHeight: 1.5, color: text }}>{comment.text}</p>

              {comment.postContent && (
                <div style={{ fontSize: '0.75rem', color: muted, marginBottom: '0.75rem' }}>
                  On: {comment.postContent}
                </div>
              )}

              {/* Reply Section */}
              {comment.showReply && (
                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '0.875rem', marginBottom: '0.875rem' }}>
                  {comment.aiLoading ? (
                    <div style={{ color: accent, fontSize: '0.85rem', padding: '0.5rem 0' }}>✨ Generating AI reply...</div>
                  ) : (
                    <>
                      <textarea
                        value={comment.replyText}
                        onChange={(e) => setReplyText(comment.id, e.target.value)}
                        placeholder="Type your reply..."
                        style={{ width: '100%', background: 'transparent', border: 'none', color: text, fontSize: '0.875rem', lineHeight: 1.5, resize: 'vertical', minHeight: '60px', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          onClick={() => sendReply(comment.id)}
                          disabled={!comment.replyText.trim() || comment.replySending}
                          style={{ background: accent, border: 'none', color: '#fff', borderRadius: '6px', padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: comment.replyText.trim() && !comment.replySending ? 'pointer' : 'not-allowed', opacity: comment.replyText.trim() && !comment.replySending ? 1 : 0.5 }}
                        >
                          {comment.replySending ? 'Sending...' : 'Send Reply'}
                        </button>
                        <button
                          onClick={() => toggleReply(comment.id)}
                          style={{ background: 'transparent', border: `1px solid ${border}`, color: muted, borderRadius: '6px', padding: '0.45rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Actions */}
              {!comment.replySent && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => toggleReply(comment.id)}
                    style={{ background: 'transparent', border: `1px solid ${comment.showReply ? accent : border}`, color: comment.showReply ? accent : muted, borderRadius: '6px', padding: '0.4rem 0.875rem', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    💬 Reply
                  </button>
                  <button
                    onClick={() => generateAIReply(comment.id)}
                    disabled={comment.aiLoading}
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: accent, borderRadius: '6px', padding: '0.4rem 0.875rem', fontSize: '0.8rem', cursor: comment.aiLoading ? 'not-allowed' : 'pointer' }}
                  >
                    {comment.aiLoading ? '⏳ Generating...' : '✨ AI Reply'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
