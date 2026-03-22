const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

const stats = [
  { label: 'Total Posts', value: '0', icon: '📝' },
  { label: 'Comments Replied', value: '0', icon: '💬' },
  { label: 'Scheduled', value: '0', icon: '📅' },
  { label: 'Connected Accounts', value: '0', icon: '🔗' },
];

export default function DashboardPage() {
  return (
    <div style={{ maxWidth: '1100px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', color: text }}>Dashboard</h1>

      {/* Stat Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: accent }}>{s.value}</div>
            <div style={{ color: muted, fontSize: '0.85rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Connected Accounts */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Connected Accounts</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button style={{ background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem 1rem', color: text, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
              <span>📘</span> Connect Facebook Page
            </button>
            <button style={{ background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem 1rem', color: text, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
              <span>🎬</span> Connect YouTube Channel
            </button>
          </div>
        </div>

        {/* Quick Post */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Quick Post</h2>
          <textarea
            placeholder="What's on your mind?"
            style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem', color: text, fontSize: '0.9rem', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', outline: 'none' }}
          />
          <button style={{ marginTop: '0.75rem', background: accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
            Post Now
          </button>
        </div>

        {/* Recent Posts */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Recent Posts</h2>
          <div style={{ textAlign: 'center', padding: '2rem 0', color: muted }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>No posts yet</p>
          </div>
        </div>

        {/* Comment Inbox */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Comment Inbox</h2>
          <div style={{ textAlign: 'center', padding: '2rem 0', color: muted }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>No unanswered comments</p>
          </div>
        </div>
      </div>
    </div>
  );
}
