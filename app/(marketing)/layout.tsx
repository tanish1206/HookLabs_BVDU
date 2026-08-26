// app/(marketing)/layout.tsx
import MarketingHeader from "@/app/components/MarketingHeader";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MarketingHeader />
      <main style={{ flex: 1, paddingTop: 72 }}>
        {children}
      </main>
      
      {/* Universal Footer for Marketing Pages */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "48px 24px", marginTop: 80, background: "var(--background)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 32 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              HookLabs AI
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, maxWidth: 300 }}>
              The next generation of video content production. Data-driven, AI-accelerated, creator-focused.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--accent)", marginBottom: 16 }}>PLATFORM</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "var(--muted)" }}>
              <span>Pipeline</span>
              <span>Pricing</span>
              <span>Gallery</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--accent)", marginBottom: 16 }}>RESOURCES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "var(--muted)" }}>
              <span>Docs</span>
              <span>Blog</span>
              <span>GitHub</span>
            </div>
          </div>
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 16, justifyContent: "flex-end", color: "var(--muted)" }}>
              <span>🌐</span><span>✉</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              © 2026 HookLabs AI<br/>Privacy · Terms
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
