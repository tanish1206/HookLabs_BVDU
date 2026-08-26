// lib/utils/storage.ts
// Thin wrapper around localStorage + Supabase for video history.
// When user IS logged in: mirrors saves/deletes to Supabase (fire-and-forget).
// When user is NOT logged in: localStorage only, capped at 3 generations.

import type { VideoRecord } from "@/lib/types";
import type { SaveVideoParams } from "@/types/database";

const STORAGE_KEY = "hooklabs_history";
const ANON_LIMIT = 3;

// ── Internal localStorage helpers ─────────────────────────────────────
function readLocal(): VideoRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as VideoRecord[];
  } catch {
    return [];
  }
}

function writeLocal(records: VideoRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// ── Check if user has a session ────────────────────────────────────────
async function isLoggedIn(): Promise<string | null> {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Save a video record.
 * - Always writes to localStorage.
 * - If logged in: also POSTs to /api/save-video (fire and forget).
 * - If anonymous: enforces a 3-generation limit.
 */
export async function saveVideoRecord(record: Omit<VideoRecord, "id" | "createdAt">, supabaseParams?: SaveVideoParams): Promise<void> {
  const userId = await isLoggedIn();

  const local = readLocal();
  if (!userId && local.length >= ANON_LIMIT) {
    // Anonymous user hit the limit — just update in place
    return;
  }

  const newRecord: VideoRecord = {
    ...record,
    id:        crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  writeLocal([newRecord, ...local].slice(0, 100));

  // Mirror to Supabase in the background
  if (userId && supabaseParams) {
    fetch("/api/save-video", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(supabaseParams),
    }).catch(e => console.warn("[storage] Supabase mirror failed:", e));
  }
}

/**
 * Get video history.
 * Logged-in: fetches from Supabase, falls back to localStorage.
 * Anonymous: localStorage only.
 */
export async function getVideoHistory(): Promise<VideoRecord[]> {
  const userId = await isLoggedIn();

  if (userId) {
    try {
      const res = await fetch("/api/videos");
      if (res.ok) {
        const data = await res.json();
        return (data.videos ?? []) as VideoRecord[];
      }
    } catch {
      // Supabase unavailable — fall through to localStorage
    }
  }

  return readLocal();
}

/**
 * Delete a video record.
 * Logged-in: deletes from Supabase. Also removes from localStorage.
 * Anonymous: localStorage only.
 */
export async function deleteVideoRecord(id: string): Promise<void> {
  // Remove from localStorage
  writeLocal(readLocal().filter(r => r.id !== id));

  const userId = await isLoggedIn();
  if (userId) {
    fetch(`/api/videos/${id}`, { method: "DELETE" })
      .catch(e => console.warn("[storage] Supabase delete failed:", e));
  }
}

/** How many anonymous generations remain. */
export function getRemainingAnonymousGenerations(): number {
  const used = readLocal().length;
  return Math.max(0, ANON_LIMIT - used);
}
