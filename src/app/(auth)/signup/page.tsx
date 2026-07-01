'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function SignupPage() {
  const bg = '#070C18';
  const card = '#0C1220';
  const border = 'rgba(255,255,255,0.07)';
  const text = '#F1F5F9';
  const accent = '#10B981';
  const muted = '#94A3B8';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => {
      if (turnstileRef.current && (window as any).turnstile) {
        (window as any).turnstile.render(turnstileRef.current, {
          sitekey: '0x4AAAAAADnbosqdyYsmdWMd',
          callback: (token: string) => setCaptchaToken(token),
          theme: 'dark',
        });
      }
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          captchaToken: captchaToken ?? undefined,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      setConfirmationSent(true);
      setLoading(false);
    } catch {
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  if (confirmationSent) {
    return (
      <div style={{ background: bg, color: text, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '1rem' }}>
        <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>📱 Social<span style={{ color: accent }}>Pilot</span></div>
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '2.5rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Check your email</h2>
            <p style={{ color: muted, fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              We sent a confirmation link to<br />
              <strong style={{ color: text }}>{email}</strong>
            </p>
            <p style={{ color: muted, fontSize: '0.8rem', lineHeight: 1.6 }}>
              Click the link in your email to verify your account, then you can sign in.
            </p>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: `1px solid ${border}` }}>
              <a href="/login" style={{ color: accent, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Go to Sign In</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: bg, color: text, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>📱 Social<span style={{ color: accent }}>Pilot</span></div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Get early access</h1>
          <p style={{ color: muted, margin: 0, fontSize: '0.9rem' }}>Start managing your social media on autopilot</p>
        </div>

        <form onSubmit={handleSignup} style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '2rem' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#EF4444', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: muted }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tracy Bailey"
              required
              style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem 1rem', color: text, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: muted }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
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
              required
              style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.75rem 1rem', color: text, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div ref={turnstileRef} style={{ marginBottom: '16px' }} />
          <button
            type="submit"
            disabled={loading || !captchaToken}
            style={{ width: '100%', background: loading ? '#065F46' : accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.875rem', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p style={{ color: muted, fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem', marginBottom: 0 }}>
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>

        <p style={{ textAlign: 'center', color: muted, fontSize: '0.875rem', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: accent, textDecoration: 'none', fontWeight: 600 }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}
