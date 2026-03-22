const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

export default function AccountsPage() {
  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: text }}>Connected Accounts</h1>
      <p style={{ color: muted, marginBottom: '2rem', fontSize: '0.9rem' }}>
        Link your social media accounts to start posting and monitoring.
      </p>

      {/* Info banner */}
      <div style={{ background: 'rgba(16,185,129,0.08)', border: `1px solid rgba(16,185,129,0.25)`, borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '2rem', fontSize: '0.875rem', color: accent }}>
        ℹ️ To connect, you&apos;ll need to provide API credentials. Contact your administrator or check the documentation.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Facebook Card */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              📘
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Facebook</div>
              <div style={{ color: muted, fontSize: '0.85rem' }}>Connect your Facebook Pages</div>
            </div>
          </div>
          <button style={{ background: 'transparent', border: `1px solid ${accent}`, color: accent, borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
            Connect Facebook Page
          </button>
        </div>

        {/* YouTube Card */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              🎬
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>YouTube</div>
              <div style={{ color: muted, fontSize: '0.85rem' }}>Connect your YouTube Channels</div>
            </div>
          </div>
          <button style={{ background: 'transparent', border: `1px solid ${accent}`, color: accent, borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
            Connect YouTube Channel
          </button>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.25rem', background: card, border: `1px solid ${border}`, borderRadius: '12px', fontSize: '0.875rem', color: muted, lineHeight: 1.7 }}>
        <strong style={{ color: text }}>How to connect:</strong><br />
        1. Click the connect button for your platform<br />
        2. You&apos;ll be redirected to authorize SocialPilot<br />
        3. Grant the required permissions<br />
        4. Your account will appear here once connected
      </div>
    </div>
  );
}
