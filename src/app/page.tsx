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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', border: `1px solid rgba(16,185,129,0.25)`, borderRadius: '20px', padding: '0.35rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: accent, fontWeight: 600 }}>
          ✨ Now with AI Content Generation
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>
          Your AI-powered social media manager.
        </h1>
        <p style={{ fontSize: '1.2rem', color: muted, maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Post, reply, schedule, and generate content across Facebook, Instagram, YouTube, Twitter &amp; more — on autopilot.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/signup" style={{ background: accent, color: '#fff', padding: '0.9rem 2.5rem', borderRadius: '10px', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 700, display: 'inline-block' }}>
            Get Early Access →
          </a>
          <a href="/dashboard" style={{ background: 'transparent', color: text, border: `1px solid ${border}`, padding: '0.9rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, display: 'inline-block' }}>
            View Demo
          </a>
        </div>
      </section>

      {/* All Major Platforms */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 2rem 4rem', textAlign: 'center' }}>
        <p style={{ color: muted, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', fontWeight: 600 }}>All major platforms</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { icon: '📘', name: 'Facebook', color: '#1877F2' },
            { icon: '📸', name: 'Instagram', color: '#E1306C' },
            { icon: '▶️', name: 'YouTube', color: '#FF0000' },
            { icon: '🐦', name: 'X / Twitter', color: '#1DA1F2' },
            { icon: '💼', name: 'LinkedIn', color: '#0A66C2', soon: true },
            { icon: '🎵', name: 'TikTok', color: '#010101', soon: true },
            { icon: '📌', name: 'Pinterest', color: '#E60023', soon: true },
          ].map((p) => (
            <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: p.soon ? 0.5 : 1 }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                {p.icon}
              </div>
              <span style={{ fontSize: '0.75rem', color: muted }}>{p.name}</span>
              {p.soon && <span style={{ fontSize: '0.65rem', color: muted, background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '10px' }}>Soon</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 2rem 5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}>Everything you need</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '📤', title: 'Post Everywhere', desc: 'Share to Facebook, Instagram, YouTube, and Twitter in one click. Manage character limits per platform automatically.' },
            { icon: '✨', title: 'AI Content Generator', desc: 'Generate 5 tailored post variations instantly. Professional, casual, humorous, or inspirational — AI writes it all.' },
            { icon: '💬', title: 'Smart Comment Inbox', desc: 'AI monitors and drafts replies to comments 24/7. Reply, flag, or hide from a single unified inbox.' },
            { icon: '📅', title: 'Visual Calendar', desc: 'Plan your content calendar weeks in advance. Month and week views with one-click scheduling.' },
            { icon: '📊', title: 'Analytics & Insights', desc: 'Track reach, engagement, and follower growth. See what time to post with the engagement heatmap.' },
            { icon: '🔗', title: 'All Major Platforms', desc: 'Facebook, Instagram, YouTube, Twitter supported now. LinkedIn, TikTok, and Pinterest coming soon.' },
          ].map((f) => (
            <div key={f.title} style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: muted, lineHeight: 1.6, margin: 0, fontSize: '0.9rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 2rem 5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '3rem' }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          {[
            { step: '1', label: 'Connect your accounts', desc: 'Link Facebook, Instagram, YouTube and Twitter in minutes' },
            { step: '2', label: 'Generate or write content', desc: 'Use AI to create posts or write your own with the composer' },
            { step: '3', label: 'Post or schedule', desc: 'Publish immediately or schedule to your content calendar' },
            { step: '4', label: 'AI handles replies', desc: 'Our AI monitors comments and suggests smart responses' },
          ].map((s) => (
            <div key={s.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                {s.step}
              </div>
              <p style={{ color: text, fontWeight: 700, margin: '0 0 0.25rem', fontSize: '0.95rem' }}>{s.label}</p>
              <p style={{ color: muted, margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 2rem 6rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Simple pricing</h2>
        <p style={{ color: muted, marginBottom: '3rem', fontSize: '1rem' }}>7-day free trial on paid plans. No credit card required.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              name: 'Free',
              price: '$0',
              period: 'forever',
              features: ['2 connected accounts', '10 posts/month', 'Basic analytics', 'Comment inbox'],
              highlight: false,
            },
            {
              name: 'Pro',
              price: '$29',
              period: '/month',
              features: ['Unlimited posts', 'AI content generator', '5 connected accounts', 'Smart comment replies', 'Advanced analytics', 'Content calendar'],
              highlight: true,
            },
            {
              name: 'Agency',
              price: '$149',
              period: '/month',
              features: ['15 connected accounts', 'Team collaboration', 'White-label reports', 'Priority support', 'Custom AI training', 'API access'],
              highlight: false,
            },
          ].map((plan) => (
            <div key={plan.name} style={{ background: plan.highlight ? accent : card, border: `1px solid ${plan.highlight ? accent : border}`, borderRadius: '16px', padding: '2rem', position: 'relative' }}>
              {plan.highlight && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#fff', color: accent, padding: '2px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>POPULAR</div>}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: plan.highlight ? '#fff' : text }}>{plan.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem', marginBottom: '1.75rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: plan.highlight ? '#fff' : accent }}>{plan.price}</span>
                <span style={{ fontSize: '0.9rem', color: plan.highlight ? 'rgba(255,255,255,0.7)' : muted }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ color: plan.highlight ? 'rgba(255,255,255,0.9)' : muted, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: plan.highlight ? '#fff' : accent }}>✓</span> {f}
                  </li>
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
        <div style={{ marginBottom: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>📱 Social<span style={{ color: accent }}>Pilot</span></div>
        <div>© {new Date().getFullYear()} SocialPilot. All rights reserved.</div>
      </footer>
    </div>
  );
}
