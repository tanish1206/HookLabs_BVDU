"use client";

import { useState, useEffect } from "react";
import { Brain, Sparkles, TrendingUp, ShieldCheck, ArrowUpRight } from "lucide-react";

export default function CreativeMemoryPage() {
  const [memory, setMemory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemory() {
      try {
        const res = await fetch("/api/intelligence");
        if (res.ok) {
          const json = await res.json();
          setMemory(json.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMemory();
  }, []);

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1400, margin: "0 auto", color: "var(--text)" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <Brain size={28} style={{ color: "#a78bfa" }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", margin: 0 }}>
            Compounding Creative Memory
          </h1>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
          Repository of winning message hooks, format types, CTR lifts, and AI insights preserved across campaigns.
        </p>
      </div>

      {/* Memory Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 32 }}>
        {memory.length === 0 ? (
          <div style={{ gridColumn: "span 3", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 32, textAlign: "center", color: "var(--muted)" }}>
            No compounding memory entries yet. Run batch ingestion or campaigns to populate creative intelligence.
          </div>
        ) : (
          memory.map((item, idx) => (
            <div key={item.id || idx} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", background: "rgba(124,92,252,0.15)", color: "#a78bfa", padding: "3px 8px", borderRadius: 4 }}>
                  {item.format_type}
                </span>
                <span style={{ color: "#34d399", fontWeight: 700, fontSize: 12 }}>
                  +{item.ctr_lift}x CTR Lift
                </span>
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, margin: "0 0 16px 0" }}>
                "{item.message_hook}"
              </h3>

              <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, padding: 12, fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
                💡 <strong>AI Insight:</strong> {item.insights}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                <span>Audience: <strong>{item.audience_segment}</strong></span>
                <span>Confidence: <strong style={{ color: "#a78bfa" }}>{(item.confidence_score * 100).toFixed(0)}%</strong></span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
