// lib/store.ts
// In-memory render store (in production, use Redis or Supabase)

export const renderStore = new Map<string, { status: string; progress: number; downloadUrl?: string }>();
