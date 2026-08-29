"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, DollarSign, PieChart, Layers } from "lucide-react";

export default function AttributionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttribution() {
      try {
        const res = await fetch("/api/attribution");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAttribution();
  }, []);

  const summary = data?.attribution_summary;
  const breakdown = data?.channel_breakdown || [];

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1400, margin: "0 auto", color: "var(--text)" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <BarChart3 size={28} style={{ color: "#34d399" }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", margin: 0 }}>
            Attribution & Performance Reports
          </h1>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
          Multi-channel revenue attribution, blended ROAS, and creative asset contribution breakdown.
        </p>
      </div>

      {/* Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <div style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>TOTAL ATTRIBUTED REVENUE</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#34d399" }}>
            ${summary?.total_attributed_revenue?.toLocaleString() || "26,880"}
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <div style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>BLENDED ROAS</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#a78bfa" }}>
            {summary?.blended_roas || "3.42"}x
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <div style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>TOP MARKETING CHANNEL</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {summary?.top_channel || "Meta Ads (3.85x ROAS)"}
          </div>
        </div>
      </div>

      {/* Channel Breakdown Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Channel Revenue Contribution</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
              <th style={{ padding: "10px 12px" }}>MARKETING PLATFORM</th>
              <th style={{ padding: "10px 12px" }}>TOTAL SPEND</th>
              <th style={{ padding: "10px 12px" }}>ATTRIBUTED REVENUE</th>
              <th style={{ padding: "10px 12px" }}>ROAS</th>
              <th style={{ padding: "10px 12px" }}>REVENUE SHARE</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((ch: any) => (
              <tr key={ch.platform} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "14px 12px", fontWeight: 600 }}>{ch.platform}</td>
                <td style={{ padding: "14px 12px" }}>${ch.spend.toLocaleString()}</td>
                <td style={{ padding: "14px 12px" }}>${ch.revenue.toLocaleString()}</td>
                <td style={{ padding: "14px 12px", color: ch.roas >= 2.8 ? "#34d399" : "#f87171", fontWeight: 700 }}>{ch.roas}x</td>
                <td style={{ padding: "14px 12px", fontWeight: 700, color: "#a78bfa" }}>{ch.share}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
