// lib/supabase/admin.ts
// Admin client using SERVICE_ROLE_KEY — bypasses all RLS.
// ONLY use server-side (API routes, webhooks, cron jobs). Never expose to browser.

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let _admin: SupabaseClient<any> | null = null;

export function getAdminClient(): SupabaseClient<any> {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase admin env vars");
  _admin = createClient<any>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _admin;
}

export const createAdminClient = getAdminClient;

