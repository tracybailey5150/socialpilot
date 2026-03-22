'use client';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

export default function SchedulePage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleString('default', { month: 'long' });
  const days = getCalendarDays(year, month);
  const today = now.getDate();

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: text, margin: 0 }}>Schedule</h1>
        <button style={{ background: accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
          + New Scheduled Post
        </button>
      </div>

      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: text }}>
          {monthName} {year}
        </h2>

        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
          {weekdays.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: muted, padding: '0.5rem 0' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {days.map((day, idx) => (
            <div
              key={idx}
              style={{
                minHeight: '72px',
                borderRadius: '8px',
                background: day ? bg : 'transparent',
                border: day ? `1px solid ${border}` : 'none',
                padding: '0.5rem',
                position: 'relative',
              }}
            >
              {day && (
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: day === today ? 700 : 400,
                  color: day === today ? accent : muted,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: day === today ? 'rgba(16,185,129,0.15)' : 'transparent',
                }}>
                  {day}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
