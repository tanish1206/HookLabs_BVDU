// app/api/videos/route.ts
// GET /api/videos — returns the authenticated user's video history from Supabase.
// Called by lib/utils/storage.ts when a user is logged in.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { getVideoHistory } = await import("@/lib/supabase/videos");
    const videos = await getVideoHistory(user.id);
    return NextResponse.json({ videos });
  } catch (err) {
    console.error("[api/videos GET]", err);
    return NextResponse.json({ error: "Failed to load videos" }, { status: 500 });
  }
}
