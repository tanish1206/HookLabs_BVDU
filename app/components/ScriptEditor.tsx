// app/components/ScriptEditor.tsx
"use client";

import React, { useState, useEffect } from "react";
import { MonoLabel } from "./ui";
import type { Hook } from "@/lib/types";

const FIELDS = [
  { key: "hook_line" as keyof Hook, label: "HOOK", rows: 2,  placeholder: "The opening line that stops the scroll…" },
  { key: "body"      as keyof Hook, label: "BODY", rows: 5,  placeholder: "The main content of your video…" },
  { key: "cta"       as keyof Hook, label: "CTA",  rows: 2,  placeholder: "What you want viewers to do next…" },
];

interface ScriptEditorProps {
  script: Hook;
  onChange?: (patch: Partial<Hook>) => void;
}

export default function ScriptEditor({ script, onChange }: ScriptEditorProps) {
  const [draft, setDraft]       = useState<Partial<Hook>>({});
  const [modified, setModified] = useState(new Set<string>());
  const [wordCounts, setWordCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setDraft({});
    setModified(new Set());
  }, [script?.label]);

  function getValue(key: keyof Hook): string {
    const val = key in draft ? draft[key] : script?.[key];
    return String(val ?? "");
  }

  function handleChange(key: keyof Hook, value: string) {
    const updated = { ...draft, [key]: value };
    setDraft(updated);
    const nm = new Set(modified);
    if (value !== String(script?.[key] ?? "")) nm.add(key); else nm.delete(key);
    setModified(nm);
    setWordCounts((prev) => ({ ...prev, [key]: value.trim().split(/\s+/).filter(Boolean).length }));
    onChange?.({ [key]: value } as Partial<Hook>);
  }

  function handleRevert(key: keyof Hook) {
    handleChange(key, String(script?.[key] ?? ""));
  }

  const totalWords = FIELDS.reduce((sum, f) => sum + (wordCounts[f.key] ?? getValue(f.key).trim().split(/\s+/).filter(Boolean).length), 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <MonoLabel>SCRIPT EDITOR</MonoLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {modified.size > 0 && (
            <span style={{ fontSize: 11, color: "var(--amber)", fontFamily: "var(--font-mono)" }}>
              {modified.size} field{modified.size > 1 ? "s" : ""} edited
            </span>
          )}
          <span style={{ fontSize: 11, color: "var(--muted2)", fontFamily: "var(--font-mono)" }}>{totalWords} words</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {FIELDS.map(({ key, label, rows, placeholder }) => {
          const isModified = modified.has(key);
          const wc = wordCounts[key] ?? getValue(key).trim().split(/\s+/).filter(Boolean).length;
          return (
            <div key={key}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <MonoLabel style={{ fontSize: 10 }}>{label}</MonoLabel>
                  {isModified && (
                    <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: "var(--radius-full)", background: "rgba(245,158,11,0.1)", color: "var(--amber)", border: "1px solid rgba(245,158,11,0.2)", fontFamily: "var(--font-mono)" }}>edited</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 10, color: "var(--muted2)", fontFamily: "var(--font-mono)" }}>{wc}w</span>
                  {isModified && (
                    <button onClick={() => handleRevert(key)} style={{ fontSize: 10, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontFamily: "var(--font-mono)", padding: 0 }}>↩ revert</button>
                  )}
                </div>
              </div>
              <textarea
                value={getValue(key)}
                onChange={(e) => handleChange(key, e.target.value)}
                rows={rows}
                placeholder={placeholder}
                style={{
                  width: "100%", background: isModified ? "rgba(245,158,11,0.04)" : "var(--surface2)",
                  border: `1px solid ${isModified ? "rgba(245,158,11,0.3)" : "var(--border2)"}`,
                  borderRadius: "var(--radius-md)", padding: "10px 12px", color: "var(--text)",
                  fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6,
                  resize: "vertical", outline: "none", transition: "border-color 0.15s, background 0.15s",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
