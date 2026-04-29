'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

type SocialAccount = {
  id: string;
  platform: string;
  display_name: string;
  platform_username: string;
  access_token: string;
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

const platformTokenInfo: Record<string, { label: string; fields: { key: string; label: string; placeholder: string }[]; help: string }> = {
  instagram: {
    label: 'Instagram',
    fields: [
      { key: 'access_token', label: 'Instagram Access Token', placeholder: 'IGQVxxxxxxx...' },
    ],
    help: 'Instagram uses the same Meta/Facebook API. Connect your Instagram Business account to a Facebook Page, then use the same Page Access Token.',
  },
  youtube: {
    label: 'YouTube',
    fields: [
      { key: 'access_token', label: 'YouTube OAuth Token', placeholder: 'ya29.xxxxxxx...' },
    ],
    help: 'Go to Google Cloud Console, enable the YouTube Data API v3, create OAuth 2.0 credentials, and generate an access token for your channel.',
  },
  twitter: {
    label: 'X / Twitter',
    fields: [
      { key: 'access_token', label: 'Bearer Token', placeholder: 'AAAAAAAAAAAAAAAAAAAAAxxxxxxx...' },
    ],
    help: 'Go to developer.x.com, create a project/app, and copy your Bearer Token. For posting, you also need API Key + Secret configured in your app settings.',
  },
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Record<string, SocialAccount | null>>({});
  const [loading, setLoading] = useState(true);
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [postingTest, setPostingTest] = useState<string | null>(null);
  const [testPostResult, setTestPostResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('social_accounts')
      .select('id, platform, display_name, platform_username, access_token')
      .eq('user_id', user.id);

    const mapped: Record<string, SocialAccount | null> = {};
    for (const p of tier1Platforms) {
      const found = (data ?? []).find((a: SocialAccount) => a.platform === p.id);
      mapped[p.id] = found ?? null;
    }
    setAccounts(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadAccounts();

    // Check URL params for success/error messages
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'facebook') {
      setSuccessMessage('Facebook Page connected successfully!');
      // Clean URL without reload
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
    const urlError = params.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setError(''), 8000);
    }
  }, []);

  const openConnect = (platformId: string) => {
    // Facebook uses OAuth flow instead of manual token entry
    if (platformId === 'facebook') {
      window.location.href = '/api/auth/facebook';
      return;
    }
    setConnectModal(platformId);
    setFormData({ display_name: '', platform_username: '', access_token: '' });
    setError('');
  };

  const handleSaveConnection = async () => {
    if (!connectModal) return;
    const { display_name, platform_username, access_token } = formData;
    if (!display_name.trim() || !access_token.trim()) {
      setError('Account name and access token are required.');
      return;
    }
    setSaving(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not authenticated.');
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from('social_accounts').insert({
      user_id: user.id,
      platform: connectModal,
      access_token: access_token.trim(),
      display_name: display_name.trim(),
      platform_username: platform_username.trim() || null,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setConnectModal(null);
    loadAccounts();
  };

  const handleDisconnect = async (platformId: string) => {
    const account = accounts[platformId];
    if (!account) return;
    setDisconnecting(platformId);

    const { error: delError } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', account.id);

    if (delError) {
      alert('Error disconnecting: ' + delError.message);
    }
    setDisconnecting(null);
    loadAccounts();
  };

  const handleTestPost = async (platformId: string) => {
    const account = accounts[platformId];
    if (!account) return;
    setPostingTest(platformId);
    setTestPostResult(null);

    try {
      const res = await fetch('/api/facebook/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Test post from SocialPilot - ${new Date().toLocaleString()}`,
          accountId: account.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setTestPostResult({ type: 'success', message: `Posted successfully! Post ID: ${data.postId}` });
      } else {
        setTestPostResult({ type: 'error', message: data.error || 'Post failed' });
      }
    } catch (err) {
      setTestPostResult({ type: 'error', message: 'Network error while posting' });
    }
    setPostingTest(null);
    setTimeout(() => setTestPostResult(null), 6000);
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: text }}>Connected Accounts</h1>
      <p style={{ color: muted, marginBottom: '2rem', fontSize: '0.9rem' }}>
        Link your social media accounts to start posting and monitoring across all platforms.
      </p>

      {/* Success Message */}
      {successMessage && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', color: accent, fontSize: '0.9rem', fontWeight: 600 }}>
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && !connectModal && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', color: '#EF4444', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Test Post Result */}
      {testPostResult && (
        <div style={{ background: testPostResult.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${testPostResult.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '10px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', color: testPostResult.type === 'success' ? accent : '#EF4444', fontSize: '0.9rem' }}>
          {testPostResult.message}
        </div>
      )}

      {/* Tier 1 */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: accent, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Available Now
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
        {tier1Platforms.map((p) => {
          const account = accounts[p.id];
          const isConnected = !!account;
          return (
            <div key={p.id} style={{ background: card, border: `1px solid ${isConnected ? 'rgba(16,185,129,0.3)' : border}`, borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  {p.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {p.name}
                    {isConnected && (
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: accent }} />
                    )}
                  </div>
                  {isConnected && account ? (
                    <div style={{ color: muted, fontSize: '0.85rem' }}>
                      <span style={{ color: text, fontWeight: 600 }}>{account.display_name}</span>
                      {account.platform_username && <span> · @{account.platform_username}</span>}
                    </div>
                  ) : (
                    <div style={{ color: muted, fontSize: '0.85rem' }}>
                      {loading ? 'Loading...' : p.desc}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                {isConnected ? (
                  <>
                    {p.id === 'facebook' && (
                      <button
                        onClick={() => handleTestPost(p.id)}
                        disabled={postingTest === p.id}
                        style={{ background: 'transparent', border: `1px solid rgba(24,119,242,0.4)`, color: '#1877F2', borderRadius: '8px', padding: '0.55rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: postingTest === p.id ? 'not-allowed' : 'pointer', opacity: postingTest === p.id ? 0.6 : 1 }}
                      >
                        {postingTest === p.id ? 'Posting...' : 'Post Test'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDisconnect(p.id)}
                      disabled={disconnecting === p.id}
                      style={{ background: 'transparent', border: `1px solid rgba(239,68,68,0.4)`, color: '#EF4444', borderRadius: '8px', padding: '0.55rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: disconnecting === p.id ? 'not-allowed' : 'pointer', opacity: disconnecting === p.id ? 0.6 : 1 }}
                    >
                      {disconnecting === p.id ? 'Removing...' : 'Disconnect'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => openConnect(p.id)}
                    disabled={loading}
                    style={p.id === 'facebook'
                      ? { background: '#1877F2', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.55rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }
                      : { background: accent, border: 'none', color: '#fff', borderRadius: '8px', padding: '0.55rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }
                    }
                  >
                    {p.id === 'facebook' ? 'Connect with Facebook' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tier 2 */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: muted, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Coming Soon
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

      {/* API Key Info Section */}
      <div style={{ marginTop: '2rem', background: 'rgba(16,185,129,0.06)', border: `1px solid rgba(16,185,129,0.15)`, borderRadius: '16px', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: accent, marginTop: 0, marginBottom: '1rem' }}>API Keys Guide</h3>
        <p style={{ color: muted, fontSize: '0.85rem', marginTop: 0, marginBottom: '1rem', lineHeight: 1.6 }}>
          Each platform requires specific API credentials to post on your behalf. Here is what you need:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>Facebook</div>
            <div style={{ color: muted, fontSize: '0.82rem', lineHeight: 1.6 }}>
              <strong style={{ color: accent }}>OAuth Connected</strong> — Click "Connect with Facebook" above to authorize SocialPilot to post to your Pages. No manual token entry needed.
            </div>
          </div>
          <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>Instagram</div>
            <div style={{ color: muted, fontSize: '0.82rem', lineHeight: 1.6 }}>
              <strong style={{ color: text }}>Connected via Facebook</strong> — Link your Instagram Business account to a Facebook Page, then use the same Page Access Token from the Meta API.
            </div>
          </div>
          <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>YouTube</div>
            <div style={{ color: muted, fontSize: '0.82rem', lineHeight: 1.6 }}>
              <strong style={{ color: text }}>YouTube Data API Key + OAuth Token</strong> — Enable YouTube Data API v3 in Google Cloud Console, create OAuth 2.0 credentials, and generate an access token for your channel.
            </div>
          </div>
          <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>X / Twitter</div>
            <div style={{ color: muted, fontSize: '0.82rem', lineHeight: 1.6 }}>
              <strong style={{ color: text }}>API Key + API Secret + Bearer Token</strong> — Go to developer.x.com, create a project and app, copy your Bearer Token. API Key and Secret are configured in app settings for OAuth.
            </div>
          </div>
        </div>
      </div>

      {/* Connect Modal (for non-Facebook platforms) */}
      {connectModal && platformTokenInfo[connectModal] && (
        <>
          <div onClick={() => setConnectModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 201, background: card, border: `1px solid ${border}`, borderRadius: '20px', padding: '2rem', width: '90%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem', color: text }}>
              Connect {platformTokenInfo[connectModal].label}
            </h3>
            <p style={{ color: muted, fontSize: '0.82rem', marginTop: '0.25rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              {platformTokenInfo[connectModal].help}
            </p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#EF4444', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: muted }}>Account Name</label>
              <input
                type="text"
                value={formData.display_name || ''}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="e.g. My Business Page"
                style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.7rem 0.9rem', color: text, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: muted }}>Username (optional)</label>
              <input
                type="text"
                value={formData.platform_username || ''}
                onChange={(e) => setFormData({ ...formData, platform_username: e.target.value })}
                placeholder="e.g. @yourbrand"
                style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.7rem 0.9rem', color: text, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {platformTokenInfo[connectModal].fields.map((field) => (
              <div key={field.key} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: muted }}>{field.label}</label>
                <input
                  type="password"
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.7rem 0.9rem', color: text, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                />
              </div>
            ))}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={handleSaveConnection}
                disabled={saving}
                style={{ flex: 1, background: saving ? '#065F46' : accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Connecting...' : 'Save Connection'}
              </button>
              <button
                onClick={() => setConnectModal(null)}
                style={{ background: 'transparent', border: `1px solid ${border}`, color: muted, borderRadius: '8px', padding: '0.75rem 1.25rem', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
