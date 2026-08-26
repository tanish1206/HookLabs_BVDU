// lib/supabase/videos.ts
// Supabase query module for the videos table.
// Uses server client (RLS-respecting) or admin client for public gallery queries.

import { createClient } from "./server";
import { getAdminClient } from "./admin";
import type { SaveVideoParams, GalleryVideo } from "@/types/database";
import type { VideoRecord, Hook, Metrics } from "@/lib/types";

// ── Row mapper ───────────────────────────────────────────────────
function rowToRecord(row: Record<string, unknown>): VideoRecord {
  // hook_data stores the full Hook object as JSONB
  const hookData = (row.hook_data ?? {}) as Partial<Hook>;
  return {
    id:        row.id as string,
    trend:     row.trend as string,
    hook: {
      label:     hookData.label     ?? "Hook",
      style:     hookData.style     ?? "",
      hook_line: hookData.hook_line ?? (row.hook_line as string) ?? "",
      body:      hookData.body      ?? (row.body      as string) ?? "",
      cta:       hookData.cta       ?? (row.cta       as string) ?? "",
      word_count:hookData.word_count ?? 0,
      tone_tag:  hookData.tone_tag  ?? "",
    } as Hook,
    metrics: {
      hook_score:  (row.hook_score  ?? 0) as number,
      est_ctr:     (row.est_ctr     ?? "0%") as string,
      retention:   (row.retention   ?? "0%") as string,
      viral_score: (row.viral_score ?? 0) as number,
    } as Metrics,
    voice:     (row.voice     ?? "") as string,
    format:    (row.format    ?? "") as string,
    tone:      (row.tone      ?? "") as string,
    is_public: (row.is_public ?? false) as boolean,
    createdAt: (row.created_at ?? new Date().toISOString()) as string,
  };
}

/**
 * Save a new video to Supabase.
 * Stores the full hook object as JSONB so we don't need extra columns.
 */
export async function saveVideo(params: SaveVideoParams): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("videos")
    .insert({
      user_id:      user.id,
      trend:        params.trendText,
      hook_line:    params.hookLine    ?? "",
      body:         params.body        ?? "",
      cta:          params.cta         ?? "",
      // Store the full hook as JSONB for richer data access
      hook_data: {
        label:      params.hookLabel   ?? "Hook",
        style:      params.hookStyle   ?? "",
        hook_line:  params.hookLine    ?? "",
        body:       params.body        ?? "",
        cta:        params.cta         ?? "",
        word_count: params.wordCount   ?? 0,
        tone_tag:   params.toneTag     ?? "",
      },
      hook_score:   params.hookScore   ?? null,
      est_ctr:      params.estCtr      ?? null,
      retention:    params.retention   ?? null,
      viral_score:  params.viralScore  ?? null,
      format:       params.format      ?? null,
      tone:         params.tone        ?? null,
      duration:     params.duration    ?? null,
      voice:        params.voice       ?? null,
      is_public:    false,
      render_status:"pending",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return (data as Record<string, string>).id;
}

/** Fetch all videos for the authenticated user, newest first. */
export async function getVideoHistory(userId: string, limit = 50): Promise<VideoRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[supabase/videos] getVideoHistory:", error.message);
    return [];
  }
  return (data ?? []).map((r) => rowToRecord(r as Record<string, unknown>));
}

/** Fetch a single video by ID. */
export async function getVideoById(id: string): Promise<VideoRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("videos").select("*").eq("id", id).single();
  if (error || !data) return null;
  return rowToRecord(data as Record<string, unknown>);
}

/** Update the render status (called by export-video polling). */
export async function updateVideoRenderStatus(
  id: string,
  status: "pending" | "rendering" | "done" | "failed",
  videoUrl?: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("videos")
    .update({ render_status: status, video_url: videoUrl ?? null })
    .eq("id", id);
  if (error) console.error("[supabase/videos] updateVideoRenderStatus:", error.message);
}

/** Hard-delete a video. */
export async function deleteVideo(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) console.error("[supabase/videos] deleteVideo:", error.message);
}

/** Toggle is_public flag for gallery sharing. */
export async function setVideoPublic(id: string, isPublic: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("videos").update({ is_public: isPublic }).eq("id", id);
  if (error) console.error("[supabase/videos] setVideoPublic:", error.message);
}

/** Alias — fetches auth user then calls getVideoHistory. */
export async function getUserVideos(): Promise<VideoRecord[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  return getVideoHistory(user.id);
}

/**
 * Fetch public gallery videos. Uses admin client to bypass RLS for is_public rows.
 */
export async function getGalleryVideos(params: {
  format?:  string;
  sortBy?:  "latest" | "score" | "views";
  limit?:   number;
  offset?:  number;
}): Promise<GalleryVideo[]> {
  const admin = getAdminClient();

  let query = admin
    .from("videos")
    .select("id, trend, hook_line, format, hook_score, viral_score, video_url, created_at")
    .eq("is_public", true);

  if (params.format) query = query.eq("format", params.format);

  const orderCol = params.sortBy === "score" ? "hook_score"
                 : params.sortBy === "views" ? "viral_score"
                 : "created_at";
  query = query.order(orderCol, { ascending: false });
  query = query.range(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 24) - 1);

  const { data, error } = await query;
  if (error) {
    console.error("[supabase/videos] getGalleryVideos:", error.message);
    return [];
  }
  return (data ?? []) as GalleryVideo[];
}
