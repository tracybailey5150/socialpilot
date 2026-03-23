'use client';
import { useState } from 'react';
import Link from 'next/link';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

// March 2026 calendar
const YEAR = 2026;
const MONTH = 2; // 0-indexed: March

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

// Mock scheduled posts
const scheduledPosts: Record<number, { content: string; platform: string }[]> = {
  24: [{ content: 'Spring product launch announcement!', platform: '📘' }],
  25: [{ content: 'Behind the scenes content', platform: '📸' }, { content: 'Tech tip Tuesday', platform: '🐦' }],
  27: [{ content: 'Weekly wrap-up video', platform: '▶️' }],
  30: [{ content: 'March recap post', platform: '📘' }],
};

type ViewMode = 'month' | 'week';

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const daysInMonth = getDaysInMonth(YEAR, MONTH);
  const firstDay = getFirstDayOfMonth(YEAR, MONTH); // 0=Sun

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const today = 23; // March 23, 2026 (current date)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Week view: show current week (Mar 23-29)
  const weekDays = [23, 24, 25, 26, 27, 28, 29];

  const selectedPosts = selectedDay ? (scheduledPosts[selectedDay] || []) : [];

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: text }}>Schedule</h1>
          <p style={{ color: muted, fontSize: '0.9rem', margin: 0 }}>Plan and visualize your content calendar.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', background: card, border: `1px solid ${border}`, borderRadius: '8px', overflow: 'hidden' }}>
            {(['month', 'week'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{ padding: '0.5rem 1rem', border: 'none', background: viewMode === mode ? 'rgba(16,185,129,0.15)' : 'transparent', color: viewMode === mode ? accent : muted, fontSize: '0.85rem', fontWeight: viewMode === mode ? 700 : 400, cursor: 'pointer' }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <Link
            href="/posts"
            style={{ background: accent, color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700 }}
          >
            + New Post
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
        {/* Calendar */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
          {/* Month Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>March 2026</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ background: 'transparent', border: `1px solid ${border}`, color: muted, borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>‹</button>
              <button style={{ background: 'transparent', border: `1px solid ${border}`, color: muted, borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>›</button>
            </div>
          </div>

          {viewMode === 'month' ? (
            <>
              {/* Day Names */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '0.5rem' }}>
                {dayNames.map((d) => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', color: muted, fontWeight: 600, padding: '0.25rem 0' }}>{d}</div>
                ))}
              </div>
              {/* Weeks */}
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '2px' }}>
                  {week.map((day, di) => {
                    if (!day) return <div key={di} style={{ minHeight: '56px' }} />;
                    const posts = scheduledPosts[day] || [];
                    const isToday = day === today;
                    const isSelected = day === selectedDay;
                    return (
                      <div
                        key={di}
                        onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                        style={{
                          minHeight: '56px',
                          padding: '0.35rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(16,185,129,0.15)' : isToday ? 'rgba(16,185,129,0.07)' : bg,
                          border: `1px solid ${isSelected ? accent : isToday ? 'rgba(16,185,129,0.3)' : border}`,
                          transition: 'all 0.1s',
                        }}
                      >
                        <div style={{ fontSize: '0.8rem', fontWeight: isToday ? 700 : 400, color: isToday ? accent : text, marginBottom: '0.2rem' }}>
                          {day}
                        </div>
                        {posts.length > 0 && (
                          <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                            {posts.map((_, pi) => (
                              <div key={pi} style={{ width: '6px', height: '6px', borderRadius: '50%', background: accent }} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          ) : (
            // Week View
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                {weekDays.map((day, di) => {
                  const posts = scheduledPosts[day] || [];
                  const isToday = day === today;
                  return (
                    <div key={di} style={{ background: isToday ? 'rgba(16,185,129,0.08)' : bg, border: `1px solid ${isToday ? 'rgba(16,185,129,0.3)' : border}`, borderRadius: '10px', padding: '0.75rem 0.5rem', minHeight: '120px' }}>
                      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.7rem', color: muted }}>{dayNames[(di + 1) % 7]}</div>
                        <div style={{ fontSize: '1rem', fontWeight: isToday ? 700 : 400, color: isToday ? accent : text }}>{day}</div>
                      </div>
                      {posts.map((p, pi) => (
                        <div key={pi} style={{ background: 'rgba(16,185,129,0.1)', border: `1px solid rgba(16,185,129,0.2)`, borderRadius: '4px', padding: '0.25rem 0.35rem', fontSize: '0.7rem', color: text, marginBottom: '0.25rem' }}>
                          {p.platform} {p.content.slice(0, 20)}...
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Selected Day Posts */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
              {selectedDay ? `March ${selectedDay}` : 'Upcoming Posts'}
            </h3>
            {selectedDay ? (
              selectedPosts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedPosts.map((p, i) => (
                    <div key={i} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem' }}>
                      <div style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>{p.platform}</div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: text, lineHeight: 1.4 }}>{p.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: muted }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📭</div>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem' }}>No posts scheduled</p>
                  <Link href="/posts" style={{ color: accent, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>+ Add Post</Link>
                </div>
              )
            ) : (
              // Upcoming list
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(scheduledPosts)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([day, posts]) => (
                    <div key={day} onClick={() => setSelectedDay(parseInt(day))} style={{ cursor: 'pointer', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', color: accent, fontWeight: 600, marginBottom: '0.35rem' }}>March {day}</div>
                      {posts.map((p, i) => (
                        <div key={i} style={{ fontSize: '0.82rem', color: text }}>{p.platform} {p.content.slice(0, 30)}...</div>
                      ))}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Quick New Post */}
          <Link
            href="/posts"
            style={{ display: 'block', background: 'rgba(16,185,129,0.1)', border: `1px dashed rgba(16,185,129,0.3)`, borderRadius: '12px', padding: '1.25rem', textAlign: 'center', textDecoration: 'none', color: accent, fontSize: '0.9rem', fontWeight: 600 }}
          >
            + Schedule New Post
          </Link>
        </div>
      </div>
    </div>
  );
}
