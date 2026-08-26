// app/dashboard/page.tsx
"use client";

import Header from "@/app/components/Header";
import { Card, SectionHeader, Button, MetaPill, Skeleton } from "@/app/components/ui";
import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardStats {
  videosUsed: number;
  plan: string;
  avgCtr: number;
  topTone: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch for dashboard stats
    setTimeout(() => {
      setStats({
        videosUsed: 12,
        plan: "pro",
        avgCtr: 5.8,
        topTone: "Energetic",
      });
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      <Header />
      
      <SectionHeader 
        icon="📊" 
        title="Dashboard" 
        subtitle="Manage your account and view pipeline performance"
        action={
          <Link href="/pipeline" passHref legacyBehavior>
            <Button size="sm">⚡ New Video</Button>
          </Link>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
        <Card>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Current Plan</div>
          {loading ? <Skeleton height={80} /> : (
            <div>
              <MetaPill 
                label="PLAN" 
                value={stats?.plan === "pro" ? "Pro Plan" : "Free Plan"} 
                color="var(--accent2)" 
              />
              <div style={{ marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
                {stats?.videosUsed} / {stats?.plan === "pro" ? "100" : "5"} videos used this month
              </div>
              <div className="score-bar" style={{ marginTop: 8 }}>
                <div 
                  className="score-bar-fill" 
                  style={{ width: `${((stats?.videosUsed || 0) / (stats?.plan === "pro" ? 100 : 5)) * 100}%`, background: "var(--accent)" }} 
                />
              </div>
            </div>
          )}
        </Card>

        <Card>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Performance Summary</div>
          {loading ? <Skeleton height={80} /> : (
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <MetaPill label="AVG CTR" value={`${stats?.avgCtr}%`} color="var(--green)" />
              </div>
              <div style={{ flex: 1 }}>
                <MetaPill label="BEST TONE" value={stats?.topTone || "—"} />
              </div>
            </div>
          )}
          <Link href="/feedback" passHref legacyBehavior>
            <Button variant="ghost" size="sm" style={{ marginTop: 16, width: "100%", justifyContent: "center" }}>
              View full feedback loop →
            </Button>
          </Link>
        </Card>
      </div>

      <Card>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Recent Generations</div>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 13, textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  <th style={{ padding: "12px 8px", fontWeight: "normal" }}>TOPIC</th>
                  <th style={{ padding: "12px 8px", fontWeight: "normal" }}>FORMAT</th>
                  <th style={{ padding: "12px 8px", fontWeight: "normal" }}>DATE</th>
                  <th style={{ padding: "12px 8px", fontWeight: "normal" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 1, topic: "AI replacing SWEs", format: "YouTube Short", date: "Today", status: "Published" },
                  { id: 2, topic: "10x Developer Habits", format: "TikTok", date: "Yesterday", status: "Draft" },
                  { id: 3, topic: "React 19 RC", format: "YouTube Short", date: "Mar 22", status: "Published" },
                ].map(row => (
                  <tr key={row.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} className="hover:bg-surface2">
                    <td style={{ padding: "12px 8px", fontWeight: 500 }}>{row.topic}</td>
                    <td style={{ padding: "12px 8px", color: "var(--muted)" }}>{row.format}</td>
                    <td style={{ padding: "12px 8px", color: "var(--muted)" }}>{row.date}</td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={{ 
                        fontSize: 11, padding: "3px 8px", borderRadius: "100px",
                        background: row.status === "Published" ? "rgba(34,197,94,0.1)" : "rgba(124,92,252,0.1)",
                        color: row.status === "Published" ? "var(--green)" : "var(--accent)"
                      }}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
