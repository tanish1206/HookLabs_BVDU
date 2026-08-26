// app/components/ScriptPanel.tsx
"use client";

import React, { useState } from "react";
import { Card, SectionHeader, Button, MonoLabel, Badge } from "./ui";
import ScriptEditor from "./ScriptEditor";
import type { Hook } from "@/lib/types";

interface ScriptPanelProps {
  scripts: Hook[];
  onContinue: (hookIndex: number, edits: Partial<Hook>) => void;
  onRegenerate: () => void;
}

export default function ScriptPanel({ scripts, onContinue, onRegenerate }: ScriptPanelProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  const [edits, setEdits]           = useState<Partial<Hook>>({});

  if (!scripts.length) return null;

  function handleTabChange(i: number) {
    setActiveTab(i);
    setShowEditor(false);
    setEdits({});
  }

  const current = scripts[activeTab];
  const STYLE_COLORS: Record<string, string> = {
    "Question": "var(--accent2)", "Shocking Stat": "var(--amber)", "Contrarian": "var(--green)",
  };

  const actualWordCount = [current.hook_line, current.body, current.cta]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const spokenSeconds = Math.round((actualWordCount / 150) * 60);
  const mins = Math.floor(spokenSeconds / 60);
  const secs = spokenSeconds % 60;
  const durationStr = mins > 0 ? `~${mins}m ${secs}s` : `~${secs}s`;

  return (
    <div style={{ marginBottom: 28 }} className="animate-fade-in">
      <SectionHeader icon="✍️" title="Generated Scripts" subtitle="3 hook variations — pick the strongest one" />

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid var(--border)" }}>
        {scripts.map((s, i) => (
          <button
            key={i}
            onClick={() => handleTabChange(i)}
            style={{
              padding: "8px 16px", fontSize: 13, fontFamily: "var(--font-body)", fontWeight: 500,
              background: "transparent", border: "none", cursor: "pointer", transition: "all 0.15s",
              borderBottom: activeTab === i ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeTab === i ? "var(--text)" : "var(--muted)",
              marginBottom: -1,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {s.label}
            {s.style && <Badge color={STYLE_COLORS[s.style] ?? "var(--muted)"}>{s.style}</Badge>}
          </button>
        ))}
      </div>

      {/* Script Card */}
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
          {/* Hook */}
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted2)", marginBottom: 6 }}>🪝 HOOK</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--accent2)", lineHeight: 1.5, fontFamily: "var(--font-display)" }}>
              {current.hook_line}
            </p>
          </div>

          {/* Body */}
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted2)", marginBottom: 6 }}>📝 BODY</div>
            <div style={{ fontSize: 13, lineHeight: 1.8, color: "var(--text)" }}>
              {current.body.split('\n').filter(Boolean).map((para, i) => (
                <p key={i} style={{ marginBottom: 10 }}>{para}</p>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted2)", marginBottom: 6 }}>📣 CTA</div>
            <p style={{ fontSize: 13, color: "var(--green)", lineHeight: 1.6 }}>{current.cta}</p>
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
          <Badge color="var(--muted)">~{actualWordCount} words spoken</Badge>
          <Badge color="var(--amber)">{durationStr}</Badge>
          {current.tone_tag && <Badge color="var(--accent)">{current.tone_tag}</Badge>}
        </div>

        {/* Edit toggle */}
        <div style={{ marginBottom: 16 }}>
          <Button variant="ghost" size="sm" onClick={() => setShowEditor((v) => !v)}>
            {showEditor ? "✕ Close Editor" : "✏ Edit Script"}
          </Button>
        </div>

        {showEditor && (
          <div style={{ marginBottom: 16, padding: 16, background: "var(--surface2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <ScriptEditor script={{ ...current, ...edits } as Hook} onChange={(patch) => setEdits((prev) => ({ ...prev, ...patch }))} />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={onRegenerate}>↺ Regenerate</Button>
          <Button size="md" onClick={() => onContinue(activeTab, edits)} style={{ flex: 1, justifyContent: "center" }}>
            Continue to Voiceover →
          </Button>
        </div>
      </Card>
    </div>
  );
}
