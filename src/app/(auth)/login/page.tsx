'use client';
import { useState } from 'react';

export default function LoginPage() {
  const bg = '#070C18';
  const card = '#0C1220';
  const border = 'rgba(255,255,255,0.07)';
  const text = '#F1F5F9';
  const accent = '#10B981';
  const muted = '#94A3B8';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div style={{ background: bg, color: text, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>📱 Social<span style={{ color: accent }}>Pilot</span></div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Welcome back</h1>
          <p style={{ color: muted, margin: 0, fontSize: '0.9rem' }}>Sign in to your account</p>
        </div>

        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '2rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: muted }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem 1rem', color: text, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: muted }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem 1rem', color: text, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button
            style={{ width: '100%', background: accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.875rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Sign In
          </button>
        </div>

        <p style={{ textAlign: 'center', color: muted, fontSize: '0.875rem', marginTop: '1.5rem' }}>
          Don&apos;t have an account?{' '}
          <a href="/signup" style={{ color: accent, textDecoration: 'none', fontWeight: 600 }}>Sign up free</a>
        </p>
      </div>
    </div>
  );
}
