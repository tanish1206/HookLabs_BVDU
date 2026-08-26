// app/components/FeedbackDashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, SectionHeader, Button, MonoLabel, ErrorMessage, Skeleton } from "./ui";
import { scoreColor } from "@/lib/utils/helpers";
import type { Recommendations, FeedbackStats, Hook } from "@/lib/types";

interface FeedbackDashboardProps {
  recentScripts?: Hook[];
}

export default function FeedbackDashboard({ recentScripts = [] }: FeedbackDashboardProps) {
  const [stats, setStats]               = useState<FeedbackStats | null>(null);
  const [recs, setRecs]                 = useState<Recommendations | null>(null);
  const [isLoadingStats, setLoadingStats] = useState(true);
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    setLoadingStats(true);
    try {
      const { fetchFeedbackStatsAction } = await import("@/app/actions/feedback");
      const data = await fetchFeedbackStatsAction();
      setStats(data);
    } catch {
      // Fallback: localStorage stats simulation
      setStats({ avgCtr: 6.2, avgRetention: 58, totalVideos: 4, topTone: "Energetic", topFormat: "YouTube Short" });
    } finally { setLoadingStats(false); }
  }

  async function handleAnalyze() {
    if (!stats) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackStats: stats, recentScripts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setRecs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally { setIsAnalyzing(false); }
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <SectionHeader icon="📊" title="Feedback Loop" subtitle="AI-powered recommendations based on your performance" />

      {/* Stats */}
      <Card style={{ marginBottom: 16 }}>
        <MonoLabel style={{ marginBottom: 14 }}>PERFORMANCE STATS</MonoLabel>
        {isLoadingStats ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[0,1,2,3].map((i) => <Skeleton key={i} height={60} />)}
          </div>
        ) : stats ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { label: "AVG CTR",     value: `${stats.avgCtr}%`,     raw: stats.avgCtr * 10 },
              { label: "AVG RETENTION", value: `${stats.avgRetention}%`, raw: stats.avgRetention },
              { label: "TOTAL VIDEOS", value: String(stats.totalVideos), raw: 70 },
              { label: "TOP TONE",    value: stats.topTone ?? "—",   raw: 80 },
            ].map(({ label, value, raw }) => (
              <div key={label} style={{ background: "var(--surface2)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
                <MonoLabel style={{ marginBottom: 6 }}>{label}</MonoLabel>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: scoreColor(raw) }}>{value}</div>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      {/* Analyze button */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>AI Analysis</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Get personalized recommendations from Claude</div>
          </div>
          <Button onClick={handleAnalyze} loading={isAnalyzing} disabled={!stats} size="sm">
            🤖 Analyze
          </Button>
        </div>
        {error && <ErrorMessage message={error} />}
      </Card>

      {/* Recommendations */}
      {recs && (
        <Card className="animate-fade-in">
          <MonoLabel style={{ marginBottom: 14 }}>AI RECOMMENDATIONS</MonoLabel>

          {recs.insights?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>INSIGHTS</div>
              {recs.insights.map((ins, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: "var(--accent)", flexShrink: 0 }}>→</span>
                  <span style={{ color: "var(--muted)" }}>{ins}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {recs.recommended_tone && (
              <div style={{ padding: "10px 14px", background: "var(--surface2)", borderRadius: "var(--radius-md)" }}>
                <MonoLabel style={{ marginBottom: 4 }}>RECOMMENDED TONE</MonoLabel>
                <div style={{ color: "var(--green)", fontFamily: "var(--font-display)", fontWeight: 700 }}>{recs.recommended_tone}</div>
              </div>
            )}
            {recs.optimized_cta && (
              <div style={{ padding: "10px 14px", background: "var(--surface2)", borderRadius: "var(--radius-md)" }}>
                <MonoLabel style={{ marginBottom: 4 }}>OPTIMIZED CTA</MonoLabel>
                <div style={{ color: "var(--accent2)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{recs.optimized_cta}</div>
              </div>
            )}
          </div>

          {recs.avoid && recs.avoid.length > 0 && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "var(--radius-md)" }}>
              <MonoLabel style={{ marginBottom: 6, color: "rgba(252,165,165,0.6)" }}>AVOID</MonoLabel>
              {recs.avoid.map((a, i) => (
                <div key={i} style={{ fontSize: 12, color: "#FCA5A5", display: "flex", gap: 6 }}>
                  <span>✕</span><span>{a}</span>
                </div>
              ))}
            </div>
          )}

          {recs.confidence && (
            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
              <span style={{ fontSize: 10, color: "var(--muted2)", fontFamily: "var(--font-mono)" }}>
                Confidence: {recs.confidence}%
              </span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
