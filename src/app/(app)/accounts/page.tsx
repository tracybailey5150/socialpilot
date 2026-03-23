'use client';
import { useState } from 'react';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

type ConnectedAccount = {
  name: string;
  followers: string;
};

type PlatformState = {
  connected: boolean;
  account: ConnectedAccount | null;
};

type PlatformsState = {
  [key: string]: PlatformState;
};

const tier1Platforms = [
  { id: 'facebook', icon: '📘', name: 'Facebook Pages', color: '#1877F2', desc: 'Share posts to your Facebook Pages' },
  { id: 'instagram', icon: '📸', name: 'Instagram', color: '#E1306C', desc: 'Post to Instagram via Meta API' },
  { id: 'youtube', icon: '▶️', name: 'YouTube', color: '#FF0000', desc: 'Publish videos to YouTube channels' },
  { id: 'twitter', icon: '🐦', name: 'X / Twitter', color: '#000000', desc: 'Tweet and engage on X / Twitter' },
];

const tier2Platforms = [
  { id: 'linkedin', icon: '💼', name: 'LinkedIn', color: '#0A66C2', desc: 'Post to LinkedIn profiles & company pages' },
  { id: 'tiktok', icon: '🎵', name: 'TikTok', color: '#010101', desc: 'Upload short videos to TikTok' },
  { id: 'pinterest', icon: '📌', name: 'Pinterest', color: '#E60023', desc: 'Create and share Pinterest pins' },
];

export default function AccountsPage() {
  const [platforms, setPlatforms] = useState<PlatformsState>({
    facebook: { connected: false, account: null },
    instagram: { connected: false, account: null },
    youtube: { connected: false, account: null },
    twitter: { connected: false, account: null },
  });

  const toggleConnect = (id: string) => {
    setPlatforms((prev) => {
      const current = prev[id];
      if (current.connected) {
        return { ...prev, [id]: { connected: false, account: null } };
      } else {
        const mockAccounts: Record<string, ConnectedAccount> = {
          facebook: { name: 'Tracy Bailey Business', followers: '2,341' },
          instagram: { name: '@tracybailey', followers: '5,812' },
          youtube: { name: 'Tracy Bailey Channel', followers: '1,094' },
          twitter: { name: '@tracybailey', followers: '3,287' },
        };
        return { ...prev, [id]: { connected: true, account: mockAccounts[id] } };
      }
    });
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: text }}>Connected Accounts</h1>
      <p style={{ color: muted, marginBottom: '2rem', fontSize: '0.9rem' }}>
        Link your social media accounts to start posting and monitoring across all platforms.
      </p>

      {/* Tier 1 */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: accent, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        ✅ Available Now
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
        {tier1Platforms.map((p) => {
          const state = platforms[p.id];
          return (
            <div key={p.id} style={{ background: card, border: `1px solid ${state?.connected ? 'rgba(16,185,129,0.3)' : border}`, borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  {p.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {p.name}
                    {state?.connected && (
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: accent }} />
                    )}
                  </div>
                  {state?.connected && state.account ? (
                    <div style={{ color: muted, fontSize: '0.85rem' }}>
                      <span style={{ color: text, fontWeight: 600 }}>{state.account.name}</span>
                      {' · '}
                      <span>{state.account.followers} followers</span>
                    </div>
                  ) : (
                    <div style={{ color: muted, fontSize: '0.85rem' }}>{p.desc}</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                {state?.connected ? (
                  <button
                    onClick={() => toggleConnect(p.id)}
                    style={{ background: 'transparent', border: `1px solid rgba(239,68,68,0.4)`, color: '#EF4444', borderRadius: '8px', padding: '0.55rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => toggleConnect(p.id)}
                    style={{ background: accent, border: 'none', color: '#fff', borderRadius: '8px', padding: '0.55rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tier 2 */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: muted, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        🚧 Coming Soon
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tier2Platforms.map((p) => (
          <div key={p.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                {p.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{p.name}</div>
                <div style={{ color: muted, fontSize: '0.85rem' }}>{p.desc}</div>
              </div>
            </div>
            <span style={{ background: 'rgba(148,163,184,0.15)', color: muted, borderRadius: '20px', padding: '0.35rem 0.9rem', fontSize: '0.8rem', fontWeight: 600 }}>
              Coming Soon
            </span>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div style={{ marginTop: '2rem', background: 'rgba(16,185,129,0.08)', border: `1px solid rgba(16,185,129,0.2)`, borderRadius: '12px', padding: '1rem 1.25rem', fontSize: '0.875rem', color: muted, lineHeight: 1.7 }}>
        <strong style={{ color: accent }}>ℹ️ Demo Mode</strong> — Connect buttons simulate OAuth for preview. In production, you&apos;ll be redirected to each platform&apos;s authorization page.
      </div>
    </div>
  );
}
