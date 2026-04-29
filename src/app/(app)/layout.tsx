'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/posts', icon: '📝', label: 'Create Post' },
  { href: '/generate', icon: '✨', label: 'AI Generator' },
  { href: '/comments', icon: '💬', label: 'Comments' },
  { href: '/schedule', icon: '📅', label: 'Schedule' },
  { href: '/analytics', icon: '📊', label: 'Analytics' },
  { href: '/accounts', icon: '🔗', label: 'Accounts' },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login');
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: muted, fontSize: '1rem', fontWeight: 600 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: card, borderBottom: `1px solid ${border}`, height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', fontSize: '1.1rem', fontWeight: 700, color: text }}>
          📱 Social<span style={{ color: accent }}>Pilot</span>
        </Link>
        <button onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px', zIndex: 101 }}>
          <span style={{ display: 'block', width: '24px', height: '2px', background: text, borderRadius: '2px', transition: 'all 0.2s', transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
          <span style={{ display: 'block', width: '24px', height: '2px', background: text, borderRadius: '2px', transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
          <span style={{ display: 'block', width: '24px', height: '2px', background: text, borderRadius: '2px', transition: 'all 0.2s', transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
        </button>
      </div>

      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 98 }} />
          <div style={{ position: 'fixed', top: '56px', left: 0, right: 0, bottom: 0, zIndex: 99, background: card, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <nav style={{ flex: 1, padding: '8px 0' }}>
              {navItems.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', fontSize: '16px', fontWeight: active ? 600 : 400, color: active ? accent : muted, background: active ? 'rgba(16,185,129,0.1)' : 'transparent', textDecoration: 'none', borderBottom: `1px solid ${border}` }}>
                    <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.href === '/generate' && <span style={{ marginLeft: 'auto', background: 'rgba(16,185,129,0.2)', color: accent, fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>NEW</span>}
                  </Link>
                );
              })}
            </nav>
            <div style={{ borderTop: `1px solid ${border}`, padding: '20px' }}>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                style={{ display: 'block', width: '100%', background: 'transparent', border: `1px solid ${border}`, borderRadius: '8px', color: muted, padding: '12px', fontSize: '14px', textAlign: 'center', cursor: signingOut ? 'not-allowed' : 'pointer' }}
              >
                {signingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </>
      )}

      <main style={{ paddingTop: '56px', minHeight: '100vh', width: '100%', boxSizing: 'border-box', background: bg }}>
        {children}
      </main>
    </div>
  );
}
