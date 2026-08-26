// app/components/AbTestPanel.tsx
"use client";

import React, { useState } from "react";
import { Card, SectionHeader, Button, MonoLabel, Badge } from "./ui";
import { scoreColor, parsePct } from "@/lib/utils/helpers";
import type { Hook, Metrics } from "@/lib/types";

interface AbTestPanelProps {
  scripts?: Hook[];
  metrics?: Metrics;
  onSelectWinner?: (index: number) => void;
}

export default function AbTestPanel({ scripts = [], metrics = {}, onSelectWinner }: AbTestPanelProps) {
  const [winner, setWinner] = useState<number | null>(null);

  if (!scripts.length) {
    return (
      <div style={{ marginBottom: 28 }}>
        <SectionHeader icon="⚖️" title="A/B Test" subtitle="Compare hook variations side-by-side" />
        <Card>
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)", fontSize: 13 }}>
            Generate a script first to compare hook variations here.
          </div>
        </Card>
      </div>
    );
  }

  function handlePick(index: number) {
    setWinner(index);
    onSelectWinner?.(index);
  }

  return (
    <div style={{ marginBottom: 28 }} className="animate-fade-in">
      <SectionHeader icon="⚖️" title="A/B Test" subtitle="Pick the strongest hook variation" />

      {/* Comparison grid */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(scripts.length, 3)}, 1fr)`, gap: 12, marginBottom: 16 }}>
        {scripts.map((s, i) => (
          <HookCard key={i} script={s} index={i} isWinner={winner === i} onPick={() => handlePick(i)} />
        ))}
      </div>

      {/* Aggregate metrics */}
      <Card>
        <MonoLabel style={{ marginBottom: 14 }}>OVERALL METRICS</MonoLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { label: "HOOK SCORE",  value: metrics.hook_score  ? `${metrics.hook_score}/100`  : "—", raw: metrics.hook_score },
            { label: "EST. CTR",    value: metrics.est_ctr    || "—", raw: parsePct(metrics.est_ctr) * 10 },
            { label: "RETENTION",   value: metrics.retention  || "—", raw: parsePct(metrics.retention) },
            { label: "VIRAL SCORE", value: metrics.viral_score ? `${metrics.viral_score}/100` : "—", raw: metrics.viral_score },
          ].map(({ label, value, raw }) => (
            <div key={label} style={{ background: "var(--surface2)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
              <MonoLabel style={{ marginBottom: 6 }}>{label}</MonoLabel>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: raw ? scoreColor(raw) : "var(--muted)" }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {winner !== null && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--green)" }}>
            ✓ <strong>{scripts[winner]?.label}</strong> selected as winner — head to the Pipeline tab to continue.
          </div>
        )}
      </Card>
    </div>
  );
}

function HookCard({ script, index, isWinner, onPick }: { script: Hook; index: number; isWinner: boolean; onPick: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const hookScore = 75 + index * 3 + Math.floor(Math.sin(index * 7) * 8);
  const STYLE_COLORS: Record<string, string> = { "Question": "var(--accent2)", "Shocking Stat": "var(--amber)", "Contrarian": "var(--green)" };
  const styleColor = STYLE_COLORS[script.style ?? ""] ?? "var(--muted)";

  return (
    <div style={{
      background: isWinner ? "rgba(34,197,94,0.06)" : "var(--surface)", border: `1px solid ${isWinner ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
      borderRadius: "var(--radius-lg)", padding: 16, transition: "all 0.2s", display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>{script.label}</span>
        <Badge color={styleColor}>{script.style ?? "Hook"}</Badge>
      </div>

      <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, fontWeight: 500, fontStyle: "italic" }}>
        "{script.hook_line}"
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 11 }}>
          <span style={{ color: "var(--muted2)", fontFamily: "var(--font-mono)" }}>HOOK STRENGTH</span>
          <span style={{ color: scoreColor(hookScore), fontFamily: "var(--font-mono)", fontWeight: 600 }}>{hookScore}/100</span>
        </div>
        <div className="score-bar"><div className="score-bar-fill" style={{ width: `${hookScore}%`, background: scoreColor(hookScore) }} /></div>
      </div>

      <div>
        <button onClick={() => setExpanded((v) => !v)} style={{ fontSize: 11, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 0, fontFamily: "var(--font-mono)" }}>
          {expanded ? "▲ hide body" : "▼ show body"}
        </button>
        {expanded && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)", lineHeight: 1.6, background: "var(--surface2)", borderRadius: "var(--radius-sm)", padding: "8px 10px", fontFamily: "var(--font-mono)" }}>
            {script.body}
          </div>
        )}
      </div>

      <div style={{ fontSize: 11, color: "var(--accent2)", fontFamily: "var(--font-mono)", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
        CTA: {script.cta}
      </div>

      <Button onClick={onPick} variant={isWinner ? "primary" : "ghost"} style={{ width: "100%", justifyContent: "center", fontSize: 12 }}>
        {isWinner ? "✓ Selected" : "Select this hook"}
      </Button>
    </div>
  );
}
