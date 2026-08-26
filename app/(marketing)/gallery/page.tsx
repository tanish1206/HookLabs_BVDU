// app/gallery/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, Badge, Skeleton, Button } from "@/app/components/ui";
import { timeAgo, scoreColor } from "@/lib/utils/helpers";
import Link from "next/link";
import type { VideoRecord } from "@/lib/types";

export default function GalleryPage() {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        const res = await fetch("/api/gallery?page=1");
        const data = await res.json();
        setVideos(data.videos || []);
      } catch (err) {
        console.error("Gallery failed", err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 40, marginTop: 20 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
          Community Gallery
        </h1>
        <p style={{ fontSize: 15, color: "var(--muted)" }}>
          See what other creators are building using HookLabs AI.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={200} />)
        ) : videos.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
            No public videos in the gallery yet. Be the first to share one!
          </div>
        ) : (
          videos.map((v) => (
            <Card key={v.id} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <Badge color={v.format === "TikTok" ? "var(--accent2)" : "var(--red)"}>{v.format}</Badge>
                <div style={{ fontSize: 11, color: "var(--muted2)", fontFamily: "var(--font-mono)" }}>{timeAgo(v.createdAt)}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.4, marginBottom: 16, flex: 1 }}>
                "{v.hook?.hook_line ?? v.trend}"
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: scoreColor(v.metrics?.hook_score ?? 0) }}>
                  Score: {v.metrics?.hook_score || "?"}/100
                </div>
                <Link href={`/?trend=${encodeURIComponent(v.trend)}`} passHref legacyBehavior>
                  <Button variant="ghost" size="sm" style={{ padding: "4px 8px", fontSize: 11 }}>
                    Use Trend →
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
