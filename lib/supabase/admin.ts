// lib/supabase/admin.ts
// Admin client using SERVICE_ROLE_KEY — bypasses all RLS.
// ONLY use server-side (API routes, webhooks, cron jobs). Never expose to browser.

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const FALLBACK_URL = "https://qsvwdksghrjdeorctqzj.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdndka3NnaHJqZGVvcmN0cXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNzA5NTksImV4cCI6MjA1NTc0Njk1OX0.d1JzQ8m_J1w8vX7_mZ3m_J1w8vX7_mZ3m_J1w8vX7";

let _admin: SupabaseClient<any> | null = null;

export function getAdminClient(): SupabaseClient<any> {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;
  
  _admin = createClient<any>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _admin;
}

export const createAdminClient = getAdminClient;
