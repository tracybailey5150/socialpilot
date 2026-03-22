'use client';
import { useState } from 'react';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

export default function SettingsPage() {
  const [name, setName] = useState('Tracy Bailey');
  const [email, setEmail] = useState('tracy@example.com');

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', color: text }}>Settings</h1>

      {/* Profile Section */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: text }}>Profile</h2>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: muted }}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem 1rem', color: text, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: muted }}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem 1rem', color: text, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <button style={{ background: accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
          Save Changes
        </button>
      </div>

      {/* Plan Section */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: text }}>Plan</h2>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: bg, borderRadius: '10px', border: `1px solid ${border}`, marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Free Plan</div>
            <div style={{ color: muted, fontSize: '0.85rem' }}>1 account · 5 posts/mo</div>
          </div>
          <span style={{ background: 'rgba(16,185,129,0.1)', color: accent, padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
            Current
          </span>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: muted, fontSize: '0.875rem', margin: '0 0 1rem' }}>
            Upgrade to unlock unlimited posts, AI replies, and more accounts.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button style={{ background: accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
              Upgrade to Pro — $19/mo
            </button>
            <button style={{ background: 'transparent', color: muted, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.65rem 1.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
              View Agency Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
