// app/hooks/useLiveTrends.ts
// Reads trends from /api/trends (Supabase cache), with Realtime subscription for live updates.

import { useState, useEffect, useCallback } from "react";
import type { TrendTopic } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function useLiveTrends() {
  const [trends, setTrends] = useState<TrendTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [source, setSource] = useState<"live" | "mock" | "error">("mock");

  const fetchTrends = useCallback(async (forceRefresh?: boolean | React.MouseEvent) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = !!forceRefresh ? "/api/trends?limit=12&refresh=true" : "/api/trends?limit=12";
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const trendList: TrendTopic[] = data.trends ?? [];
      setTrends(trendList);
      setSource(
        trendList.some(t => t.source === "reddit" || t.source === "google_trends" || t.source === "hacker_news")
          ? "live"
          : "mock"
      );

      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.error("[useLiveTrends]", err);
      setError("Could not load trends");
      setSource("error");
      // Fallback demo data
      setTrends([
        { id: "1", text: "AI agents are writing their own languages", source: "hacker_news", score: 98, url: null, category: null, region: "global" },
        { id: "2", text: "Local-first database over sound waves", source: "hacker_news", score: 92, url: null, category: null, region: "global" },
        { id: "3", text: "The Dopamine-First approach to deep work", source: "reddit", score: 84, url: null, category: "productivity", region: "global" },
        { id: "4", text: "Vibe coding is replacing pair programming", source: "reddit", score: 79, url: null, category: "programming", region: "global" },
        { id: "5", text: "How Anthropic trained Claude 3.5 Sonnet", source: "hacker_news", score: 77, url: null, category: null, region: "global" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => { fetchTrends(); }, [fetchTrends]);

  // ── Supabase Realtime subscription ─────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("trends_live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trends_cache",
          filter: "is_active=eq.true",
        },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new;
          // Map the new DB row to TrendTopic
          const newTrend: TrendTopic = {
            id:       row.id as string,
            text:     row.title as string,
            source:   (row.source ?? "manual") as TrendTopic["source"],
            score:    (row.virality_score ?? 0) as number,
            url:      (row.url ?? null) as string | null,
            category: (row.category ?? null) as string | null,
            region:   (row.region ?? "global") as string,
          };

          setTrends(prev => {
            // Add to top, remove lowest scored if over 12
            const updated = [newTrend, ...prev.filter(t => t.id !== newTrend.id)];
            return updated.sort((a, b) => b.score - a.score).slice(0, 12);
          });

          // Update lastUpdated badge to "just now"
          setLastUpdated("just now");
          setSource("live");
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { trends, isLoading, error, lastUpdated, source, refresh: fetchTrends };
}
