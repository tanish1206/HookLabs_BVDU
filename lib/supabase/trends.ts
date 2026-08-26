// lib/supabase/trends.ts
// Supabase query module for the trends_cache table.
// Called by /api/trends — never called directly from the browser.

import { getAdminClient } from "./admin";
import type { TrendTopic } from "@/types/database";

// ── Map DB row → TrendTopic shape ─────────────────────────────────
function rowToTrend(row: Record<string, unknown>): TrendTopic {
  return {
    id:       row.id as string,
    text:     (row.title ?? row.text) as string,
    source:   (row.source ?? "manual") as TrendTopic["source"],
    score:    (row.virality_score ?? row.score ?? 0) as number,
    url:      (row.url ?? null) as string | null,
    category: (row.category ?? null) as string | null,
    region:   (row.region ?? "global") as string,
  };
}

/** Fetch the currently active (non-expired) trends, ordered by score. */
export async function getActiveTrends(limit = 12): Promise<TrendTopic[]> {
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("trends_cache")
    .select("*")
    .eq("is_active", true)
    .order("virality_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[supabase/trends] getActiveTrends:", error.message);
    return [];
  }
  return (data ?? []).map((r) => rowToTrend(r as Record<string, unknown>));
}

/** Get a single trend by ID. */
export async function getTrendById(id: string): Promise<TrendTopic | null> {
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("trends_cache")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return rowToTrend(data as Record<string, unknown>);
}

/**
 * Fuzzy-search trends by title.
 * Note: requires pg_trgm extension in Supabase. Falls back to ILIKE if needed.
 */
export async function searchTrends(query: string, limit = 8): Promise<TrendTopic[]> {
  const admin = getAdminClient();
  // Supabase JS uses .ilike() for basic pattern matching
  const { data, error } = await admin
    .from("trends_cache")
    .select("*")
    .ilike("title", `%${query}%`)
    .eq("is_active", true)
    .order("virality_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[supabase/trends] searchTrends:", error.message);
    return [];
  }
  return (data ?? []).map((r) => rowToTrend(r as Record<string, unknown>));
}

/** Upsert an array of new trends (called by cron job / Python ingest webhook). */
export async function upsertTrends(
  trends: Array<{ title: string; source: string; virality_score: number; url?: string; category?: string; region?: string }>
): Promise<void> {
  const admin = getAdminClient();
  const { error } = await (admin as any).from("trends_cache").upsert(
    trends.map((t) => ({
      title:          t.title,
      source:         t.source,
      virality_score: t.virality_score,
      url:            t.url ?? null,
      category:       t.category ?? null,
      region:         t.region ?? "global",
      is_active:      true,
      expires_at:     new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    })),
    { onConflict: "title,source", ignoreDuplicates: false }
  );
  if (error) console.error("[supabase/trends] upsertTrends:", error.message);
}

/** Mark all trends older than maxAgeMs as inactive (called by webhook). */
export async function expireOldTrends(maxAgeMinutes = 30): Promise<number> {
  const admin = getAdminClient();
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000).toISOString();
  const { data, error } = await (admin as any)
    .from("trends_cache")
    .update({ is_active: false })
    .eq("is_active", true)
    .lt("fetched_at", cutoff)
    .select("id");

  if (error) {
    console.error("[supabase/trends] expireOldTrends:", error.message);
    return 0;
  }
  return (data ?? []).length;
}
