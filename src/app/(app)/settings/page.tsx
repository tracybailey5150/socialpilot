'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

const PLANS = [
  { key: 'free', name: 'Free', price: '$0', period: 'forever', features: ['2 accounts', '10 posts/month', 'Basic analytics', 'Comment inbox'] },
  { key: 'pro', name: 'Pro', price: '$29', period: '/month', features: ['Unlimited posts', 'AI content generator', '5 accounts', 'Smart AI replies', 'Advanced analytics', 'Scheduling calendar'], popular: true },
  { key: 'agency', name: 'Agency', price: '$149', period: '/month', features: ['15 accounts', 'Team collaboration', 'White-label reports', 'Priority support', 'Custom AI training', 'API access'] },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: muted },
  active: { label: 'Active', color: accent },
  trialing: { label: 'Trial', color: '#3B82F6' },
  past_due: { label: 'Past Due', color: '#F59E0B' },
  canceled: { label: 'Canceled', color: '#EF4444' },
};

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [hasStripeCustomer, setHasStripeCustomer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const billing = searchParams.get('billing');
    if (billing === 'success') {
      setMessage('Subscription activated! Welcome to your new plan.');
      window.history.replaceState({}, '', '/settings');
    } else if (billing === 'cancelled') {
      setMessage('Checkout cancelled.');
      window.history.replaceState({}, '', '/settings');
    }
  }, [searchParams]);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, plan, subscription_status, stripe_customer_id')
        .eq('id', user.id)
        .single();

      if (profile) {
        setName(profile.full_name ?? '');
        setPlan(profile.plan ?? 'free');
        setSubscriptionStatus(profile.subscription_status ?? 'free');
        setHasStripeCustomer(!!profile.stripe_customer_id);
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
    if (!user) { setMessage('Not authenticated.'); setSaving(false); return; }

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: name, updated_at: new Date().toISOString() });

    setMessage(error ? 'Error saving: ' + error.message : 'Profile saved.');
    setSaving(false);
  };

  const handleUpgrade = async (planKey: string) => {
    setUpgrading(planKey);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage(data.error || 'Failed to start checkout');
        setUpgrading(null);
      }
    } catch {
      setMessage('Network error');
      setUpgrading(null);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage(data.error || 'Failed to open billing portal');
      }
    } catch {
      setMessage('Network error');
    }
    setPortalLoading(false);
  };

  const isPaid = ['active', 'trialing'].includes(subscriptionStatus);
  const status = statusLabels[subscriptionStatus] || statusLabels.free;

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', color: text }}>Settings</h1>

      {message && (
        <div style={{ background: message.includes('Error') || message.includes('cancelled') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${message.includes('Error') || message.includes('cancelled') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '10px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', color: message.includes('Error') || message.includes('cancelled') ? '#EF4444' : accent, fontSize: '0.9rem', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Profile Section */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: text }}>Profile</h2>
        {loading ? (
          <div style={{ color: muted, fontSize: '0.9rem', padding: '1rem 0' }}>Loading profile...</div>
        ) : (
          <>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: muted }}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem 1rem', color: text, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: muted }}>Email Address</label>
              <input type="email" value={email} disabled style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem 1rem', color: muted, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', opacity: 0.7 }} />
            </div>
            <button onClick={handleSave} disabled={saving} style={{ background: saving ? '#065F46' : accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}
      </div>

      {/* Billing Section */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: text }}>Billing</h2>
          <span style={{ background: `${status.color}15`, color: status.color, padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${status.color}30` }}>
            {status.label}
          </span>
        </div>

        {/* Current Plan */}
        <div style={{ padding: '1rem 1.25rem', background: bg, borderRadius: '10px', border: `1px solid ${isPaid ? 'rgba(16,185,129,0.3)' : border}`, marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: text }}>{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</div>
              <div style={{ color: muted, fontSize: '0.85rem' }}>
                {plan === 'free' ? '2 accounts · 10 posts/mo' : plan === 'pro' ? 'Unlimited posts · 5 accounts' : '15 accounts · Team collaboration'}
              </div>
            </div>
            {isPaid && (
              <button onClick={handleManageBilling} disabled={portalLoading} style={{ background: 'transparent', border: `1px solid ${border}`, color: muted, borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: portalLoading ? 'not-allowed' : 'pointer' }}>
                {portalLoading ? 'Loading...' : 'Manage Billing'}
              </button>
            )}
          </div>
        </div>

        {/* Plan Cards */}
        {!isPaid && (
          <>
            <p style={{ color: muted, fontSize: '0.875rem', margin: '0 0 1rem' }}>
              Upgrade to unlock unlimited posts, AI replies, and more accounts. 7-day free trial on all paid plans.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {PLANS.filter(p => p.key !== 'free').map(p => (
                <div key={p.key} style={{ background: bg, border: `1px solid ${p.popular ? 'rgba(16,185,129,0.3)' : border}`, borderRadius: '12px', padding: '1.25rem', position: 'relative' }}>
                  {p.popular && (
                    <span style={{ position: 'absolute', top: '-8px', right: '12px', background: accent, color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px' }}>POPULAR</span>
                  )}
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: text, marginBottom: '0.25rem' }}>{p.name}</div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: accent }}>{p.price}</span>
                    <span style={{ fontSize: '0.8rem', color: muted }}>{p.period}</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem', fontSize: '0.8rem', color: muted }}>
                    {p.features.slice(0, 4).map(f => (
                      <li key={f} style={{ padding: '0.2rem 0' }}>✓ {f}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpgrade(p.key)}
                    disabled={upgrading === p.key}
                    style={{ width: '100%', background: p.popular ? accent : 'transparent', color: p.popular ? '#fff' : accent, border: p.popular ? 'none' : `1px solid ${accent}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.85rem', fontWeight: 700, cursor: upgrading === p.key ? 'not-allowed' : 'pointer', opacity: upgrading === p.key ? 0.6 : 1 }}
                  >
                    {upgrading === p.key ? 'Loading...' : 'Start Free Trial'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
