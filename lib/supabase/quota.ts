// lib/supabase/quota.ts
// Quota checking and user profile management.

import { createClient } from "./server";
import type { QuotaStatus, UserProfile } from "@/types/database";

const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  pro:  100,
  team: -1,   // unlimited
};

/** Check if the authenticated user is allowed to generate another script. */
export async function checkGenerationQuota(userId: string): Promise<QuotaStatus> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users_metadata")
    .select("plan, videos_used_this_month, reset_date")
    .eq("user_id", userId)
    .single();

  // If no row yet, user is on free plan with 0 uses
  if (error || !data) {
    return { allowed: true, used: 0, limit: PLAN_LIMITS.free, plan: "free", month: new Date().toISOString().slice(0, 7) };
  }

  const row = data as Record<string, unknown>;
  const plan  = (row.plan ?? "free") as "free" | "pro" | "team";
  const used  = (row.videos_used_this_month ?? 0) as number;
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

  // Auto-reset if reset_date has passed
  if (row.reset_date && new Date(row.reset_date as string) <= new Date()) {
    await supabase.from("users_metadata").update({
      videos_used_this_month: 0,
      reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
    }).eq("user_id", userId);
    return { allowed: true, used: 0, limit, plan, month: new Date().toISOString().slice(0, 7) };
  }

  return {
    allowed: limit === -1 || used < limit,
    used,
    limit,
    plan,
    month: (row.reset_date as string)?.slice(0, 7) ?? new Date().toISOString().slice(0, 7),
  };
}

/** Increment the video count after a successful save. */
export async function incrementVideoUsage(userId: string): Promise<void> {
  const supabase = await createClient();
  // Use Postgres increment via RPC-like update
  const { data } = await supabase
    .from("users_metadata")
    .select("videos_used_this_month")
    .eq("user_id", userId)
    .single();
  const current = ((data as Record<string, unknown>)?.videos_used_this_month ?? 0) as number;
  await supabase.from("users_metadata")
    .update({ videos_used_this_month: current + 1, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
}

/** Check if the user is under their 2000 words limit. */
export async function checkWordQuota(userId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const limit = 2000;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users_metadata")
    .select("words_used_this_month")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return { allowed: true, used: 0, limit };
  }
  const used = ((data as Record<string, unknown>)?.words_used_this_month ?? 0) as number;
  return { allowed: used < limit, used, limit };
}

/** Increment the words used after a successful generation. */
export async function incrementWordUsage(userId: string, words: number): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users_metadata")
    .select("words_used_this_month")
    .eq("user_id", userId)
    .single();
  const current = ((data as Record<string, unknown>)?.words_used_this_month ?? 0) as number;
  await supabase.from("users_metadata")
    .update({ words_used_this_month: current + words, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
}

/** Get the full user profile including plan and usage. */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users_metadata")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  const plan  = (row.plan ?? "free") as "free" | "pro" | "team";
  return {
    user_id:               row.user_id as string,
    plan,
    videos_used_this_month:(row.videos_used_this_month ?? 0) as number,
    videos_limit:          PLAN_LIMITS[plan],
    stripe_customer_id:    (row.stripe_customer_id ?? null) as string | null,
    stripe_subscription_id:(row.stripe_subscription_id ?? null) as string | null,
    reset_date:            row.reset_date as string,
  };
}

/** Update the user's profile (e.g., after plan change). */
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("users_metadata")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) console.error("[supabase/quota] updateUserProfile:", error.message);
}
