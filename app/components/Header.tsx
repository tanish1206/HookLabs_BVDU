// app/components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/components/providers/SupabaseProvider";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const isHome = pathname === "/";

  function handlePipelineClick(e?: React.MouseEvent) {
    if (e) e.preventDefault();
    if (user) {
      router.push('/pipeline');
    } else {
      router.push('/signin?redirectTo=/pipeline');
    }
  }

  async function handleSignOut(e?: React.MouseEvent) {
    if (e) e.preventDefault();
    await signOut();
    router.push('/');
  }

  const navLinks = [
    { href: "/pipeline", label: "Pipeline", onClick: handlePipelineClick },
    { href: "/gallery", label: "Gallery" },
    { href: "/pricing", label: "Pricing" }
  ];

  if (user) {
    navLinks.push({ href: "/dashboard", label: "Dashboard", onClick: undefined });
  }

  return (
    <header style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, boxShadow: "var(--shadow-accent)",
            }}>
              ⚡
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
                HookLabs <span style={{ color: "var(--accent)" }}>AI</span>
              </div>
              <div style={{ fontSize: 10, color: "var(--muted2)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
                VIRAL CONTENT PIPELINE
              </div>
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {navLinks.map(({ href, label, onClick }) => (
            <Link
              key={label}
              href={href}
              onClick={onClick || undefined}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                color: pathname === href ? "var(--text)" : "var(--muted)",
                background: pathname === href ? "var(--surface2)" : "transparent",
                border: pathname === href ? "1px solid var(--border2)" : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              {label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleSignOut}
              style={{
                padding: "6px 14px", borderRadius: "var(--radius-md)", fontSize: 13,
                fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--red)",
                background: "transparent", border: "1px solid transparent", cursor: "pointer"
              }}
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/login?redirectTo=/pipeline"
              style={{
                padding: "6px 14px", borderRadius: "var(--radius-md)", fontSize: 13,
                fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--accent)",
                background: "rgba(124,92,252,0.15)", border: "1px solid rgba(124,92,252,0.3)",
                textDecoration: "none", transition: "all 0.15s",
              }}
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
