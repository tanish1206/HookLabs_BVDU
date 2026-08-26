// app/components/VideoHistoryPanel.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, SectionHeader, Button, MonoLabel, Badge, Skeleton } from "./ui";
import { timeAgo, scoreColor } from "@/lib/utils/helpers";
import type { VideoRecord } from "@/lib/types";

interface VideoHistoryPanelProps {
  onReuse: (record: VideoRecord) => void;
}

export default function VideoHistoryPanel({ onReuse }: VideoHistoryPanelProps) {
  const [records, setRecords]   = useState<VideoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setIsLoading(true);
    try {
      // Try Supabase first
      const { getUserVideosAction } = await import("@/app/actions/videos");
      const data = await getUserVideosAction();
      if (data.length > 0) { setRecords(data); return; }
    } catch { /* fall through */ }

    // Fallback: localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("hl_videos") ?? "[]");
      setRecords(stored);
    } catch { setRecords([]); }
    finally { setIsLoading(false); }
  }

  async function handleDelete(id: string) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    try {
      const { deleteVideoAction } = await import("@/app/actions/videos");
      await deleteVideoAction(id);
    } catch {
      // Fallback: update localStorage
      const stored = JSON.parse(localStorage.getItem("hl_videos") ?? "[]");
      localStorage.setItem("hl_videos", JSON.stringify(stored.filter((r: VideoRecord) => r.id !== id)));
    }
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <SectionHeader icon="📜" title="Video History" subtitle={`${records.length} video${records.length !== 1 ? "s" : ""} generated`} />

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[0,1,2].map((i) => <Skeleton key={i} height={88} />)}
        </div>
      ) : records.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)", fontSize: 13 }}>
            No videos generated yet. Complete the pipeline to see your history.
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {records.map((r) => (
            <Card key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              {/* Color swatch */}
              <div style={{ width: 40, height: 56, borderRadius: "var(--radius-md)", flexShrink: 0, background: "linear-gradient(135deg, var(--accent), var(--accent2))", opacity: 0.8 }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.hook?.hook_line ?? r.trend}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                  {r.format && <Badge color="var(--muted)">{r.format}</Badge>}
                  {r.tone   && <Badge color="var(--accent2)">{r.tone}</Badge>}
                  {r.voice  && <Badge color="var(--green)">{r.voice}</Badge>}
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {r.metrics?.hook_score && (
                    <span style={{ fontSize: 11, color: scoreColor(r.metrics.hook_score), fontFamily: "var(--font-mono)" }}>
                      Hook {r.metrics.hook_score}/100
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: "var(--muted2)", fontFamily: "var(--font-mono)" }}>
                    {timeAgo(r.createdAt)}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                <Button variant="ghost" size="sm" onClick={() => onReuse(r)}>Reuse</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(r.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
