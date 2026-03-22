'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/posts', icon: '📝', label: 'Posts' },
  { href: '/comments', icon: '💬', label: 'Comments' },
  { href: '/schedule', icon: '📅', label: 'Schedule' },
  { href: '/accounts', icon: '🔗', label: 'Accounts' },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: bg, color: text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '240px', borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', top: 0, left: 0, height: '100vh', background: card }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${border}`, fontSize: '1.15rem', fontWeight: 700 }}>
          📱 Social<span style={{ color: accent }}>Pilot</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.875rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? accent : muted,
                  background: active ? 'rgba(16,185,129,0.1)' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user + sign out */}
        <div style={{ borderTop: `1px solid ${border}`, padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: muted, marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            tracy@example.com
          </div>
          <button
            style={{ width: '100%', background: 'transparent', border: `1px solid ${border}`, borderRadius: '6px', color: muted, padding: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '2rem', minHeight: '100vh', background: bg }}>
        {children}
      </main>
    </div>
  );
}
