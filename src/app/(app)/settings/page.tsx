'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        setName(profile.full_name ?? '');
      } else {
        setName(user.user_metadata?.full_name ?? '');
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('Not authenticated.');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: name, updated_at: new Date().toISOString() });

    if (error) {
      setMessage('Error saving: ' + error.message);
    } else {
      setMessage('Profile saved.');
    }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', color: text }}>Settings</h1>

      {/* Profile Section */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: text }}>Profile</h2>

        {loading ? (
          <div style={{ color: muted, fontSize: '0.9rem', padding: '1rem 0' }}>Loading profile...</div>
        ) : (
          <>
            {message && (
              <div style={{ background: message.startsWith('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${message.startsWith('Error') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: message.startsWith('Error') ? '#EF4444' : accent, fontSize: '0.875rem' }}>
                {message}
              </div>
            )}

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
                disabled
                style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem 1rem', color: muted, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', opacity: 0.7 }}
              />
              <p style={{ color: muted, fontSize: '0.75rem', marginTop: '0.4rem', marginBottom: 0 }}>Email is managed through your auth account and cannot be changed here.</p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{ background: saving ? '#065F46' : accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}
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
