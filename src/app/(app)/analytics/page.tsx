'use client';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

const kpis = [
  { label: 'Total Reach', value: '24,381', change: '+12%', icon: '👁️' },
  { label: 'Engagement Rate', value: '4.7%', change: '+0.8%', icon: '💥' },
  { label: 'New Followers', value: '318', change: '+23%', icon: '👥' },
  { label: 'Posts This Month', value: '14', change: '+4', icon: '📝' },
];

const platformBreakdown = [
  { platform: 'Facebook', icon: '📘', posts: 5, reach: 9200, color: '#1877F2' },
  { platform: 'Instagram', icon: '📸', posts: 4, reach: 8700, color: '#E1306C' },
  { platform: 'X / Twitter', icon: '🐦', posts: 3, reach: 4100, color: '#1DA1F2' },
  { platform: 'YouTube', icon: '▶️', posts: 2, reach: 2381, color: '#FF0000' },
];

const maxReach = Math.max(...platformBreakdown.map((p) => p.reach));

const topPosts = [
  { rank: 1, content: 'Excited to announce our latest product update! 🚀 Check out all the new features...', platform: '📘', reach: '4,321', likes: '287', comments: '43' },
  { rank: 2, content: 'Behind the scenes look at how we build our content strategy for the week...', platform: '📸', reach: '3,812', likes: '219', comments: '31' },
  { rank: 3, content: 'Quick tip: The best time to post on Instagram is between 6-9 PM on weekdays. Save this!', platform: '🐦', reach: '2,943', likes: '156', comments: '22' },
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = ['6a', '9a', '12p', '3p', '6p', '9p'];

// Mock engagement heatmap data (0-10 intensity)
const heatmapData: number[][] = [
  [1, 3, 5, 4, 7, 4],
  [2, 4, 6, 5, 8, 6],
  [1, 3, 7, 6, 9, 5],
  [2, 5, 8, 7, 10, 7],
  [3, 6, 9, 8, 10, 8],
  [1, 2, 3, 2, 5, 3],
  [1, 1, 2, 1, 4, 2],
];

function heatColor(intensity: number): string {
  if (intensity >= 9) return 'rgba(16,185,129,0.85)';
  if (intensity >= 7) return 'rgba(16,185,129,0.6)';
  if (intensity >= 5) return 'rgba(16,185,129,0.35)';
  if (intensity >= 3) return 'rgba(16,185,129,0.18)';
  return 'rgba(16,185,129,0.06)';
}

export default function AnalyticsPage() {
  return (
    <div style={{ maxWidth: '1000px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: text }}>Analytics</h1>
      <p style={{ color: muted, marginBottom: '2rem', fontSize: '0.9rem' }}>Performance overview across all connected platforms.</p>

      {/* Demo Banner */}
      <div style={{ background: 'rgba(16,185,129,0.07)', border: `1px solid rgba(16,185,129,0.2)`, borderRadius: '10px', padding: '0.875rem 1.25rem', marginBottom: '2rem', fontSize: '0.875rem', color: muted, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span>📊</span>
        <span>Connect your accounts to see real-time analytics. Showing demo data below.</span>
        <a href="/accounts" style={{ color: accent, textDecoration: 'none', fontWeight: 600, marginLeft: 'auto' }}>Connect Accounts →</a>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{k.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: accent, marginBottom: '0.25rem' }}>{k.value}</div>
            <div style={{ color: muted, fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{k.label}</span>
              <span style={{ color: '#4ADE80', fontWeight: 600, fontSize: '0.78rem' }}>{k.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Platform Breakdown */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Platform Breakdown</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {platformBreakdown.map((p) => {
              const barWidth = Math.round((p.reach / maxReach) * 100);
              return (
                <div key={p.platform}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <span>{p.icon}</span>
                      <span>{p.platform}</span>
                    </div>
                    <span style={{ color: muted, fontSize: '0.8rem' }}>{p.reach.toLocaleString()} reach</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${barWidth}%`, background: p.color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Posts */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Top Posts</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {topPosts.map((p) => (
              <div key={p.rank} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: p.rank === 1 ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: p.rank === 1 ? '#FBB924' : muted, flexShrink: 0 }}>
                  {p.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 0.35rem', fontSize: '0.82rem', lineHeight: 1.4, color: text }}>{p.content.slice(0, 70)}...</p>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: muted }}>
                    <span>{p.platform}</span>
                    <span>👁 {p.reach}</span>
                    <span>❤️ {p.likes}</span>
                    <span>💬 {p.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best Time to Post Heatmap */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Best Time to Post</h2>
        <p style={{ color: muted, fontSize: '0.82rem', marginBottom: '1.25rem' }}>Engagement intensity by day and hour (darker = more engagement)</p>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '400px' }}>
            {/* Hours header */}
            <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(6, 1fr)', gap: '3px', marginBottom: '3px' }}>
              <div />
              {hours.map((h) => (
                <div key={h} style={{ textAlign: 'center', fontSize: '0.7rem', color: muted }}>{h}</div>
              ))}
            </div>
            {/* Rows */}
            {days.map((day, di) => (
              <div key={day} style={{ display: 'grid', gridTemplateColumns: '50px repeat(6, 1fr)', gap: '3px', marginBottom: '3px' }}>
                <div style={{ fontSize: '0.7rem', color: muted, display: 'flex', alignItems: 'center' }}>{day}</div>
                {hours.map((_, hi) => {
                  const intensity = heatmapData[di][hi];
                  return (
                    <div
                      key={hi}
                      title={`${day} ${hours[hi]}: ${intensity}/10 engagement`}
                      style={{ height: '28px', borderRadius: '4px', background: heatColor(intensity), cursor: 'default' }}
                    />
                  );
                })}
              </div>
            ))}
            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.7rem', color: muted }}>Low</span>
              {[0.06, 0.18, 0.35, 0.6, 0.85].map((o) => (
                <div key={o} style={{ width: '18px', height: '18px', borderRadius: '3px', background: `rgba(16,185,129,${o})` }} />
              ))}
              <span style={{ fontSize: '0.7rem', color: muted }}>High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
