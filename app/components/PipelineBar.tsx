// app/components/PipelineBar.tsx
"use client";

import { STEPS } from "@/lib/constants";

interface PipelineBarProps { currentStep: number; }

const PIPELINE_STEPS = [
  { id: STEPS.TREND,     label: "Trend",     icon: "🔥" },
  { id: STEPS.SCRIPT,    label: "Script",    icon: "✍️" },
  { id: STEPS.VOICEOVER, label: "Voiceover", icon: "🎙️" },
  { id: STEPS.PREVIEW,   label: "Preview",   icon: "🎬" },
];

export default function PipelineBar({ currentStep }: PipelineBarProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28, gap: 0 }}>
      {PIPELINE_STEPS.map((step, i) => {
        const done    = currentStep > step.id;
        const active  = currentStep === step.id;
        const future  = currentStep < step.id;

        return (
          <div key={step.id} style={{ display: "flex", alignItems: "center", flex: i < PIPELINE_STEPS.length - 1 ? 1 : 0 }}>
            {/* Step node */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14,
                background:  done    ? "var(--accent)" : active ? "rgba(124,92,252,0.2)" : "var(--surface2)",
                border:      active  ? "2px solid var(--accent)" : done ? "2px solid var(--accent)" : "2px solid var(--border2)",
                boxShadow:   active  ? "var(--shadow-accent)" : "none",
                transition:  "all 0.3s",
              }}>
                {done ? "✓" : step.icon}
              </div>
              <span style={{
                fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.06em",
                color: active ? "var(--text)" : done ? "var(--accent)" : "var(--muted2)",
                transition: "color 0.3s",
              }}>
                {step.label.toUpperCase()}
              </span>
            </div>

            {/* Connector line */}
            {i < PIPELINE_STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: "0 8px",
                marginBottom: 22,
                background: done ? "var(--accent)" : "var(--surface3)",
                transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
