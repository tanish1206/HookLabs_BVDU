// lib/supabase/client.ts
// Browser-side Supabase client — safe to import in Client Components

import { createBrowserClient } from "@supabase/ssr";

const FALLBACK_URL = "https://qsvwdksghrjdeorctqzj.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdndka3NnaHJqZGVvcmN0cXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNzA5NTksImV4cCI6MjA1NTc0Njk1OX0.d1JzQ8m_J1w8vX7_mZ3m_J1w8vX7_mZ3m_J1w8vX7";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;
  
  return createBrowserClient(url, key);
}
