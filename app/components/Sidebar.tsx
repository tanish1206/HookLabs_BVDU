// app/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileDiff, History, LineChart, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/app/components/providers/SupabaseProvider";

const NAV_ITEMS = [
  { href: "/pipeline", label: "Pipeline", icon: LayoutDashboard },
  { href: "/abtest", label: "A/B Test", icon: FileDiff },
  { href: "/history", label: "History", icon: History },
  { href: "/feedback", label: "Feedback Loop", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div style={{
      width: 260,
      height: "100vh",
      background: "var(--background)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      left: 0,
      top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "32px 24px" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "var(--radius-sm)",
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, boxShadow: "var(--shadow-accent)",
          }}>
            ⚡
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: 1 }}>HookLabs</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: 1 }}>AI</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: "var(--radius-md)",
                fontSize: 13, fontFamily: "var(--font-body)", fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--text)" : "var(--muted)",
                background: isActive ? "var(--surface2)" : "transparent",
                textDecoration: "none", transition: "all 0.15s",
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User profile snippet */}
      <div style={{ padding: "24px 16px" }}>
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)", padding: "12px 14px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--surface3)", overflow: "hidden" }}>
              {/* Actual OR Placeholder avatar */}
              <img src={user?.user_metadata?.avatar_url || "https://avatars.githubusercontent.com/u/1?v=4"} alt="Avatar" style={{ width: "100%", height: "100%" }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)" }}>
                {user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Creator"}
              </div>
              <div style={{ fontSize: 10, color: "var(--green)", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 4 }}>
                <span className="animate-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
                PRO USER
              </div>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            style={{
              width: "100%", padding: "8px 0", display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "none", border: "none", borderTop: "1px solid var(--border)",
              color: "var(--muted)", fontSize: 11, fontFamily: "var(--font-mono)", cursor: "pointer",
            }}
          >
            SIGN OUT <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
