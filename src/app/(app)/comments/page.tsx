'use client';
import { useState } from 'react';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

type CommentStatus = 'unanswered' | 'replied' | 'flagged';

type Comment = {
  id: number;
  platform: string;
  platformIcon: string;
  account: string;
  author: string;
  text: string;
  timeAgo: string;
  status: CommentStatus;
  aiReply: string;
  showAI: boolean;
  replyText: string;
};

const initialComments: Comment[] = [
  {
    id: 1,
    platform: 'Facebook',
    platformIcon: '📘',
    account: 'Tracy Bailey Business',
    author: 'Sarah Mitchell',
    text: 'This is exactly what I needed! How long does the onboarding process usually take?',
    timeAgo: '12 min ago',
    status: 'unanswered',
    aiReply: 'Hi Sarah! The onboarding process typically takes 15–30 minutes. Our team will walk you through every step. Feel free to reach out if you have any questions!',
    showAI: false,
    replyText: '',
  },
  {
    id: 2,
    platform: 'Instagram',
    platformIcon: '📸',
    account: '@tracybailey',
    author: 'Jake Torres',
    text: 'Love the new content! The behind-the-scenes posts are my favorite 🔥',
    timeAgo: '34 min ago',
    status: 'unanswered',
    aiReply: 'Thank you so much, Jake! 🙌 We love sharing the behind-the-scenes moments. Stay tuned — more coming soon!',
    showAI: false,
    replyText: '',
  },
  {
    id: 3,
    platform: 'YouTube',
    platformIcon: '▶️',
    account: 'Tracy Bailey Channel',
    author: 'Maria Chen',
    text: 'Great video! Could you make a follow-up on the analytics part? I felt it was a bit rushed.',
    timeAgo: '1h ago',
    status: 'unanswered',
    aiReply: 'Thanks for the feedback, Maria! You\'re absolutely right — we\'ll do a deep-dive analytics video next week. Subscribe so you don\'t miss it! 📊',
    showAI: false,
    replyText: '',
  },
  {
    id: 4,
    platform: 'X / Twitter',
    platformIcon: '🐦',
    account: '@tracybailey',
    author: 'DevMike99',
    text: 'Tried your SaaS tool and it crashed on first use lol. Not a good look.',
    timeAgo: '2h ago',
    status: 'flagged',
    aiReply: 'Hi! Really sorry to hear that. Please DM us your details and we\'ll get this sorted for you right away. We take every report seriously!',
    showAI: false,
    replyText: '',
  },
  {
    id: 5,
    platform: 'Facebook',
    platformIcon: '📘',
    account: 'Tracy Bailey Business',
    author: 'Linda Park',
    text: 'Do you offer a free trial? Would love to test it before committing.',
    timeAgo: '3h ago',
    status: 'replied',
    aiReply: 'Yes, Linda! We offer a 14-day free trial with no credit card required. Sign up at socialpilot.app to get started today!',
    showAI: false,
    replyText: '',
  },
  {
    id: 6,
    platform: 'Instagram',
    platformIcon: '📸',
    account: '@tracybailey',
    author: 'Chris Webb',
    text: 'This changed my workflow completely. 10/10 recommend to everyone in my network.',
    timeAgo: '5h ago',
    status: 'replied',
    aiReply: 'That means the world to us, Chris! 🙏 We work hard to make it the best experience possible.',
    showAI: false,
    replyText: '',
  },
];

type TabType = 'all' | CommentStatus;

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const toggleAI = (id: number) => {
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, showAI: !c.showAI, replyText: c.showAI ? c.replyText : c.aiReply } : c));
  };

  const setReplyText = (id: number, val: string) => {
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, replyText: val } : c));
  };

  const sendReply = (id: number) => {
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, status: 'replied', showAI: false } : c));
  };

  const flagComment = (id: number) => {
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, status: c.status === 'flagged' ? 'unanswered' : 'flagged' } : c));
  };

  const deleteComment = (id: number) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const filtered = activeTab === 'all' ? comments : comments.filter((c) => c.status === activeTab);

  const total = comments.length;
  const unanswered = comments.filter((c) => c.status === 'unanswered').length;
  const repliedToday = comments.filter((c) => c.status === 'replied').length;

  const stats = [
    { label: 'Total Comments', value: total, icon: '💬' },
    { label: 'Unanswered', value: unanswered, icon: '📬', highlight: unanswered > 0 },
    { label: 'Replied Today', value: repliedToday, icon: '✅' },
    { label: 'Avg Response Time', value: '18m', icon: '⏱️' },
  ];

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unanswered', label: 'Unanswered' },
    { key: 'replied', label: 'Replied' },
    { key: 'flagged', label: 'Flagged' },
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: `1px solid ${border}` }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{ padding: '0.55rem 1rem', border: 'none', background: 'transparent', color: activeTab === tab.key ? accent : muted, fontSize: '0.875rem', fontWeight: activeTab === tab.key ? 700 : 400, cursor: 'pointer', borderBottom: `2px solid ${activeTab === tab.key ? accent : 'transparent'}` }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Comment Cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: muted, background: card, border: `1px solid ${border}`, borderRadius: '16px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>All caught up!</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>No comments in this category.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((comment) => (
            <div key={comment.id} style={{ background: card, border: `1px solid ${comment.status === 'flagged' ? 'rgba(245,158,11,0.3)' : border}`, borderRadius: '12px', padding: '1.25rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                    {comment.author.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{comment.author}</div>
                    <div style={{ color: muted, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{comment.platformIcon}</span>
                      <span>{comment.account}</span>
                      <span>·</span>
                      <span>{comment.timeAgo}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {/* Post thumbnail placeholder */}
                  <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: muted }}>
                    📷
                  </div>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: comment.status === 'replied' ? 'rgba(16,185,129,0.12)' : comment.status === 'flagged' ? 'rgba(245,158,11,0.12)' : 'rgba(148,163,184,0.1)',
                    color: comment.status === 'replied' ? accent : comment.status === 'flagged' ? '#F59E0B' : muted,
                  }}>
                    {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Comment Text */}
              <p style={{ margin: '0 0 0.875rem', fontSize: '0.9rem', lineHeight: 1.5, color: text }}>{comment.text}</p>

              {/* AI Reply (collapsible) */}
              {comment.showAI && (
                <div style={{ background: 'rgba(16,185,129,0.06)', border: `1px solid rgba(16,185,129,0.2)`, borderRadius: '8px', padding: '0.875rem', marginBottom: '0.875rem' }}>
                  <div style={{ fontSize: '0.75rem', color: accent, fontWeight: 700, marginBottom: '0.5rem' }}>✨ AI Suggested Reply</div>
                  <textarea
                    value={comment.replyText}
                    onChange={(e) => setReplyText(comment.id, e.target.value)}
                    style={{ width: '100%', background: 'transparent', border: 'none', color: text, fontSize: '0.875rem', lineHeight: 1.5, resize: 'vertical', minHeight: '60px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button
                    onClick={() => sendReply(comment.id)}
                    style={{ marginTop: '0.5rem', background: accent, border: 'none', color: '#fff', borderRadius: '6px', padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Send Reply
                  </button>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => toggleAI(comment.id)}
                  style={{ background: 'transparent', border: `1px solid ${comment.showAI ? accent : border}`, color: comment.showAI ? accent : muted, borderRadius: '6px', padding: '0.4rem 0.875rem', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  {comment.showAI ? 'Hide Reply' : '💬 Reply'}
                </button>
                <button
                  onClick={() => flagComment(comment.id)}
                  style={{ background: 'transparent', border: `1px solid ${border}`, color: comment.status === 'flagged' ? '#F59E0B' : muted, borderRadius: '6px', padding: '0.4rem 0.875rem', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  🚩 {comment.status === 'flagged' ? 'Unflag' : 'Flag'}
                </button>
                <button
                  style={{ background: 'transparent', border: `1px solid ${border}`, color: muted, borderRadius: '6px', padding: '0.4rem 0.875rem', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  🙈 Hide
                </button>
                <button
                  onClick={() => deleteComment(comment.id)}
                  style={{ background: 'transparent', border: `1px solid rgba(239,68,68,0.2)`, color: '#EF4444', borderRadius: '6px', padding: '0.4rem 0.875rem', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
