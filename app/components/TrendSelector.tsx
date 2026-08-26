// app/components/TrendSelector.tsx
"use client";

import React, { useState } from "react";
import { Card, SectionHeader, Button, MonoLabel, Badge, Skeleton } from "./ui";
import type { TrendTopic } from "@/lib/types";

const FORMATS = ["YouTube Short", "TikTok", "Instagram Reel"];
const TONES   = ["Energetic", "Educational", "Funny", "Controversial", "Inspiring", "ASMR"];
const DURATIONS = [15, 30, 60];

interface TrendSelectorProps {
  trends: TrendTopic[];
  trendsLoading: boolean;
  lastUpdated?: string | null;
  trendSource?: string;
  onRefreshTrends?: () => void;
  onGenerate: (params: { trend: string; format: string; tone: string; duration: number }) => void;
  isLoading: boolean;
  error?: string | null;
}

export default function TrendSelector({
  trends, trendsLoading, lastUpdated, trendSource, onRefreshTrends,
  onGenerate, isLoading, error,
}: TrendSelectorProps) {
  const [customTrend, setCustomTrend] = useState("");
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
  const [format, setFormat]   = useState(FORMATS[0]);
  const [tone, setTone]       = useState(TONES[0]);
  const [duration, setDuration] = useState(30);

  const activeTrend = customTrend.trim() || selectedTrend || "";
  const canGenerate = !!activeTrend && !isLoading;

  function handleGenerate() {
    if (!activeTrend) return;
    onGenerate({ trend: activeTrend, format, tone, duration });
  }

  return (
    <div style={{ marginBottom: 28 }} className="animate-fade-in">
      <SectionHeader
        icon="🔥"
        title="Select a Trend"
        subtitle="Pick a trending topic or type your own"
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {lastUpdated && <span style={{ fontSize: 10, color: "var(--muted2)", fontFamily: "var(--font-mono)" }}>Updated {lastUpdated}</span>}
            <Button variant="ghost" size="sm" onClick={onRefreshTrends} disabled={trendsLoading}>
              {trendsLoading ? "..." : "↻ Refresh"}
            </Button>
          </div>
        }
      />

      <Card>
        {/* Trend chips */}
        <MonoLabel style={{ marginBottom: 10 }}>LIVE TRENDS</MonoLabel>
        {trendsLoading ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} width={120 + i * 20} height={30} />)}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {trends.slice(0, 12).map((t) => (
              <button
                key={t.id}
                onClick={() => { setSelectedTrend(t.text); setCustomTrend(""); }}
                title={t.text}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: 12,
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: selectedTrend === t.text ? "var(--accent)" : "var(--surface2)",
                  border: `1px solid ${selectedTrend === t.text ? "var(--accent)" : "var(--border2)"}`,
                  color: selectedTrend === t.text ? "#000" : "var(--text)",
                  maxWidth: 220,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 10, color: selectedTrend === t.text ? "rgba(0,0,0,0.7)" : "var(--muted2)" }}>
                  {t.source === "Hacker News" ? "HN" : "RD"}
                </span>
                {t.text.length > 50 ? t.text.slice(0, 50) + "…" : t.text}
              </button>
            ))}
          </div>
        )}

        {/* Custom input */}
        <div style={{ marginBottom: 16 }}>
          <MonoLabel style={{ marginBottom: 6 }}>OR TYPE YOUR OWN TREND</MonoLabel>
          <input
            type="text"
            placeholder="e.g. AI replacing software engineers by 2026…"
            value={customTrend}
            onChange={(e) => { setCustomTrend(e.target.value); setSelectedTrend(null); }}
            onKeyDown={(e) => { if (e.key === "Enter" && canGenerate) handleGenerate(); }}
          />
        </div>

        {/* Options row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <MonoLabel style={{ marginBottom: 6 }}>FORMAT</MonoLabel>
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              {FORMATS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <MonoLabel style={{ marginBottom: 6 }}>TONE</MonoLabel>
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              {TONES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <MonoLabel style={{ marginBottom: 6 }}>DURATION</MonoLabel>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              {DURATIONS.map((d) => <option key={d} value={d}>{d}s</option>)}
            </select>
          </div>
        </div>

        {/* Active trend preview */}
        {activeTrend && (
          <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--text)", marginBottom: 16, fontStyle: "italic" }}>
            📌 "{activeTrend}"
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "var(--radius-md)", fontSize: 12, color: "#FCA5A5", marginBottom: 16 }}>
            ⚠ {error}
          </div>
        )}

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate}
          loading={isLoading}
          size="lg"
          style={{ width: "100%", justifyContent: "center" }}
        >
          {isLoading ? "Generating 3 hooks…" : "⚡ Generate Script"}
        </Button>
      </Card>
    </div>
  );
}
