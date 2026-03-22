export default function LandingPage() {
  const bg = '#070C18';
  const card = '#0C1220';
  const border = 'rgba(255,255,255,0.07)';
  const text = '#F1F5F9';
  const accent = '#10B981';
  const muted = '#94A3B8';

  return (
    <div style={{ background: bg, color: text, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${border}`, padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', position: 'sticky', top: 0, background: bg, zIndex: 10 }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          📱 Social<span style={{ color: accent }}>Pilot</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="/login" style={{ color: muted, textDecoration: 'none', fontSize: '0.9rem' }}>Log in</a>
          <a href="/signup" style={{ background: accent, color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Get Early Access</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '6rem 2rem 4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>
          Your AI social media manager.
        </h1>
        <p style={{ fontSize: '1.2rem', color: muted, maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Post, reply, and schedule across Facebook &amp; YouTube — on autopilot.
        </p>
        <a href="/signup" style={{ background: accent, color: '#fff', padding: '0.9rem 2.5rem', borderRadius: '10px', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 700, display: 'inline-block' }}>
          Get Early Access →
        </a>
      </section>

      {/* Feature Cards */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 2rem 5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '📤', title: 'Post Anywhere', desc: 'Share to Facebook pages and YouTube channels in one click' },
            { icon: '💬', title: 'Auto-Reply', desc: 'AI monitors and drafts replies to comments 24/7' },
            { icon: '📅', title: 'Smart Schedule', desc: 'Plan your content calendar weeks in advance' },
          ].map((f) => (
            <div key={f.title} style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: muted, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 2rem 5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '3rem' }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          {[
            { step: '1', label: 'Connect your accounts' },
            { step: '2', label: 'Create or schedule content' },
            { step: '3', label: 'AI handles replies and engagement' },
          ].map((s) => (
            <div key={s.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                {s.step}
              </div>
              <p style={{ color: muted, fontWeight: 600, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 2rem 6rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '3rem' }}>Simple pricing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {[
            { name: 'Free', price: '$0', features: ['1 account', '5 posts/mo', 'Basic analytics'], highlight: false },
            { name: 'Pro', price: '$19/mo', features: ['Unlimited posts', 'AI replies', '3 accounts'], highlight: true },
            { name: 'Agency', price: '$79/mo', features: ['10 accounts', 'Team access', 'Advanced analytics'], highlight: false },
          ].map((plan) => (
            <div key={plan.name} style={{ background: plan.highlight ? accent : card, border: `1px solid ${plan.highlight ? accent : border}`, borderRadius: '16px', padding: '2rem', position: 'relative' }}>
              {plan.highlight && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#fff', color: accent, padding: '2px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>POPULAR</div>}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: plan.highlight ? '#fff' : text }}>{plan.name}</h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', color: plan.highlight ? '#fff' : accent }}>{plan.price}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ color: plan.highlight ? 'rgba(255,255,255,0.9)' : muted, fontSize: '0.95rem' }}>✓ {f}</li>
                ))}
              </ul>
              <a href="/signup" style={{ display: 'block', background: plan.highlight ? '#fff' : accent, color: plan.highlight ? accent : '#fff', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}>
                Get Started
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${border}`, padding: '2rem', textAlign: 'center', color: muted, fontSize: '0.875rem' }}>
        <div style={{ marginBottom: '0.5rem', fontWeight: 700 }}>📱 Social<span style={{ color: accent }}>Pilot</span></div>
        <div>© {new Date().getFullYear()} SocialPilot. All rights reserved.</div>
      </footer>
    </div>
  );
}
