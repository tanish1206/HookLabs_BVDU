// lib/supabase/feedback.ts
// Supabase query module for the feedback table.

import { createClient } from "./server";
import type { SaveFeedbackParams, FeedbackLoopContext } from "@/types/database";
import type { FeedbackEntry, FeedbackStats } from "@/lib/types";

// ── Row mapper ──────────────────────────────────────────────────
function rowToEntry(row: Record<string, unknown>): FeedbackEntry {
  return {
    id:                row.id as string,
    user_id:           row.user_id as string,
    video_id:          row.video_id as string,
    actual_ctr:        row.actual_ctr as number,
    actual_retention:  row.actual_retention as number,
    views:             row.actual_views as number,
    tone:              (row.tone ?? "") as string,
    format:            (row.format ?? "") as string,
    createdAt:         row.created_at as string,
  };
}

/** Save a new feedback entry after the user manually enters their real analytics. */
export async function saveFeedback(params: SaveFeedbackParams): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      user_id:           user.id,
      video_id:          params.videoId,
      platform:          params.platform,
      actual_views:      params.actualViews ?? null,
      actual_ctr:        params.actualCtr ?? null,
      actual_retention:  params.actualRetention ?? null,
      actual_shares:     params.actualShares ?? null,
      platform_video_id: params.platformVideoId ?? null,
      data_source:       params.dataSource ?? "manual",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return (data as Record<string, string>).id;
}

/** Fetch all feedback entries for a user, joined with video metadata. */
export async function getFeedbackForUser(userId: string): Promise<FeedbackEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback")
    .select("*, videos(hook_line, hook_style, tone, format)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[supabase/feedback] getFeedbackForUser:", error.message);
    return [];
  }
  return (data ?? []).map((r) => rowToEntry(r as Record<string, unknown>));
}

/**
 * Build the FeedbackLoopContext used by Claude for analysis.
 * If the user has fewer than 3 videos, returns minimal context.
 */
export async function getFeedbackLoopContext(userId: string): Promise<FeedbackLoopContext> {
  const supabase = await createClient();

  // Aggregate stats
  const { data: feedback } = await supabase
    .from("feedback")
    .select("actual_ctr, actual_retention, actual_views, actual_shares, videos(tone, format, hook_style, hook_line, hook_score)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  const entries = (feedback ?? []) as Array<Record<string, unknown>>;

  if (entries.length === 0) {
    return {
      stats: {
        total_videos: 0, avg_ctr: 0, avg_retention: 0,
        total_views: 0, top_tone: "", top_format: "", top_hook_style: "",
      },
      recent_scripts: [],
      ctr_by_tone: {},
    };
  }

  const totalViews = entries.reduce((s, e) => s + ((e.actual_views as number) ?? 0), 0);
  const avgCtr = entries.reduce((s, e) => s + ((e.actual_ctr as number) ?? 0), 0) / entries.length;
  const avgRet = entries.reduce((s, e) => s + ((e.actual_retention as number) ?? 0), 0) / entries.length;

  // Count tones / formats for top-N
  const toneCounts: Record<string, number> = {};
  const formatCounts: Record<string, number> = {};
  const styleCounts: Record<string, number> = {};
  const ctrByTone: Record<string, { sum: number; count: number }> = {};

  entries.forEach((e) => {
    const vid = (e.videos ?? {}) as Record<string, unknown>;
    const tone   = (vid.tone ?? "") as string;
    const format = (vid.format ?? "") as string;
    const style  = (vid.hook_style ?? "") as string;
    const ctr    = (e.actual_ctr ?? 0) as number;

    if (tone)   { toneCounts[tone]     = (toneCounts[tone] ?? 0) + 1; }
    if (format) { formatCounts[format] = (formatCounts[format] ?? 0) + 1; }
    if (style)  { styleCounts[style]   = (styleCounts[style] ?? 0) + 1; }
    if (tone) {
      if (!ctrByTone[tone]) ctrByTone[tone] = { sum: 0, count: 0 };
      ctrByTone[tone].sum += ctr;
      ctrByTone[tone].count++;
    }
  });

  const topOf = (obj: Record<string, number>) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

  const ctrByToneMapped: Record<string, number> = {};
  Object.entries(ctrByTone).forEach(([tone, val]) => {
    ctrByToneMapped[tone] = Math.round((val.sum / val.count) * 100) / 100;
  });

  const recentScripts = entries.slice(0, 10).map((e) => {
    const vid = (e.videos ?? {}) as Record<string, unknown>;
    return {
      hook_line:   (vid.hook_line ?? "") as string,
      hook_style:  (vid.hook_style ?? "") as string,
      tone:        (vid.tone ?? "") as string,
      hook_score:  (vid.hook_score ?? 0) as number,
      actual_ctr:  (e.actual_ctr ?? 0) as number,
      actual_ret:  (e.actual_retention ?? 0) as number,
    };
  });

  return {
    stats: {
      total_videos:   entries.length,
      avg_ctr:        Math.round(avgCtr * 100) / 100,
      avg_retention:  Math.round(avgRet * 100) / 100,
      total_views:    totalViews,
      top_tone:       topOf(toneCounts),
      top_format:     topOf(formatCounts),
      top_hook_style: topOf(styleCounts),
    },
    recent_scripts: recentScripts,
    ctr_by_tone: ctrByToneMapped,
  };
}

/** Convenience alias — returns FeedbackStats for dashboard display. */
export async function getFeedbackStats(): Promise<FeedbackStats> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { avgCtr: 0, avgRetention: 0, totalVideos: 0 };

  const ctx = await getFeedbackLoopContext(user.id);
  return {
    avgCtr:       ctx.stats.avg_ctr,
    avgRetention: ctx.stats.avg_retention,
    totalVideos:  ctx.stats.total_videos,
    topTone:      ctx.stats.top_tone,
    topFormat:    ctx.stats.top_format,
  };
}
