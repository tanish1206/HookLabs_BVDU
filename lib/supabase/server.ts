// lib/supabase/server.ts
// Server-side Supabase client — for use in API routes and server components only.
// Uses cookies to maintain session state.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const FALLBACK_URL = "https://qsvwdksghrjdeorctqzj.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdndka3NnaHJqZGVvcmN0cXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNzA5NTksImV4cCI6MjA1NTc0Njk1OX0.d1JzQ8m_J1w8vX7_mZ3m_J1w8vX7_mZ3m_J1w8vX7";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;
  const cookieStore = await cookies();

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — ignore.
          }
        },
      },
    }
  );
}

/** Admin client that bypasses RLS — only use in trusted API routes */
export async function createAdminClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
