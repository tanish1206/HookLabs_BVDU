export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 24px', background: 'var(--background)' }}>
      <div
        className="grid-3"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: 40,
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 12 }}>
            HookLabs AI
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 320 }}>
            The next generation of video content production. Data-driven, AI-accelerated, creator-focused.
          </p>
        </div>

        {[
          { title: 'PLATFORM', links: ['Pipeline', 'Pricing', 'Gallery'] },
          { title: 'RESOURCES', links: ['Docs', 'Blog', 'GitHub'] },
        ].map((col) => (
          <div key={col.title}>
            <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 16 }}>
              {col.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--muted)' }}>
              {col.links.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: '32px auto 0',
          borderTop: '1px solid var(--border)',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--muted2)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span>© 2026 HookLabs AI</span>
        <span>Privacy · Terms</span>
      </div>
      <div
        style={{
          maxWidth: 1200,
          margin: '10px auto 0',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--muted)',
          textAlign: 'left',
        }}
      >
        Footage provided by Pexels
      </div>
    </footer>
  )
}

