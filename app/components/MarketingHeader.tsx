"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui";
import { useAuth } from '@/app/components/providers/SupabaseProvider';

const NAV_LINKS = [
  { label: "Pipeline", href: "/pipeline" },
  { label: "Features", href: "/#features" },
  { label: "Pricing",  href: "/pricing" },
  { label: "Gallery",  href: "/gallery" },
];

export default function MarketingHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(10, 10, 15, 0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        height: 64,
      }}>
        <div style={{
          width: "100%", maxWidth: 1200, margin: "0 auto",
          padding: "0 20px", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "var(--radius-sm)",
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, boxShadow: "var(--shadow-accent)", flexShrink: 0,
            }}>⚡</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", gap: 4 }}>
              HookLabs <span style={{ color: "var(--accent)", fontSize: 16 }}>AI</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hide-mobile" style={{ alignItems: "center", gap: 28 }}>
            {NAV_LINKS.map(link => (
              <Link key={link.label} href={!user ? '/login' : link.href} style={{
                fontSize: 13, fontWeight: 500, fontFamily: "var(--font-body)",
                color: pathname === link.href ? "var(--text)" : "var(--muted)",
                textDecoration: "none",
                borderBottom: pathname === link.href ? "2px solid var(--accent)" : "2px solid transparent",
                paddingBottom: 2, transition: "color 0.2s",
              }}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hide-mobile" style={{ alignItems: "center", gap: 14 }}>
            {loading ? (
              <div style={{ width: 140, height: 36 }} />
            ) : user ? (
              <Button size="sm" style={{ padding: "8px 18px" }} onClick={() => router.push('/dashboard')}>
                Go to Dashboard →
              </Button>
            ) : (
              <>
                <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)", textDecoration: "none" }}>
                  Sign in
                </Link>
                <Link href="/signup" style={{ textDecoration: "none" }}>
                  <Button size="sm" style={{ padding: "8px 18px" }}>Start free →</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="show-mobile"
            onClick={() => setMenuOpen(o => !o)}
            style={{
              background: "var(--surface2)", border: "1px solid var(--border2)",
              borderRadius: "var(--radius-sm)", padding: "8px 10px",
              color: "var(--text)", fontSize: 18, lineHeight: 1, cursor: "pointer",
              alignItems: "center", justifyContent: "center",
            }}
            aria-label="Menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0, zIndex: 49,
          background: "rgba(10,10,15,0.97)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
          display: "flex", flexDirection: "column", padding: "12px 0 20px",
        }}>
          {NAV_LINKS.map(link => (
            <Link key={link.label} href={!user ? '/login' : link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "13px 24px", fontSize: 15, fontWeight: 500,
                color: pathname === link.href ? "var(--text)" : "var(--muted)",
                textDecoration: "none", borderLeft: pathname === link.href ? "3px solid var(--accent)" : "3px solid transparent",
              }}>
              {link.label}
            </Link>
          ))}
          <div style={{ display: "flex", gap: 12, padding: "16px 24px 0", borderTop: "1px solid var(--border)", marginTop: 8 }}>
            {loading ? (
              <div style={{ width: "100%", height: 36 }} />
            ) : user ? (
              <Button style={{ width: "100%", justifyContent: "center" }} onClick={() => { setMenuOpen(false); router.push('/dashboard'); }}>
                Go to Dashboard →
              </Button>
            ) : (
              <>
                <Link href="/login" style={{ flex: 1, textDecoration: "none" }} onClick={() => setMenuOpen(false)}>
                  <Button variant="secondary" style={{ width: "100%", justifyContent: "center" }}>Sign in</Button>
                </Link>
                <Link href="/signup" style={{ flex: 1, textDecoration: "none" }} onClick={() => setMenuOpen(false)}>
                  <Button style={{ width: "100%", justifyContent: "center" }}>Start free →</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
