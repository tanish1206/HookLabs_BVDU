// app/api/feedback/route.ts
// GET — returns the full FeedbackLoopContext for the authenticated user
// POST — saves a new feedback entry (actual analytics from TikTok/YouTube)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SaveFeedbackParams } from "@/types/database";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { getFeedbackLoopContext } = await import("@/lib/supabase/feedback");
    const context = await getFeedbackLoopContext(user.id);
    return NextResponse.json(context);
  } catch (err) {
    console.error("[api/feedback GET]", err);
    return NextResponse.json({ error: "Failed to load feedback context" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let params: SaveFeedbackParams;
  try {
    params = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!params.videoId || !params.platform) {
    return NextResponse.json({ error: "videoId and platform are required" }, { status: 400 });
  }

  try {
    const { saveFeedback } = await import("@/lib/supabase/feedback");
    const feedbackId = await saveFeedback(params);
    return NextResponse.json({ feedbackId });
  } catch (err) {
    console.error("[api/feedback POST]", err);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}
