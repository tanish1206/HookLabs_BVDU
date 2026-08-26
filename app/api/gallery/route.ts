// app/api/gallery/route.ts
// GET /api/gallery?format=&sortBy=&limit=24&offset=0
// Public endpoint — no auth required.

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const format = searchParams.get("format") ?? undefined;
  const sortBy = (searchParams.get("sortBy") ?? "latest") as "latest" | "score" | "views";
  const limit  = Math.min(parseInt(searchParams.get("limit") ?? "24"), 48);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  try {
    const { getGalleryVideos } = await import("@/lib/supabase/videos");
    const videos = await getGalleryVideos({ format, sortBy, limit, offset });
    return NextResponse.json(
      { videos, total: videos.length, hasMore: videos.length === limit },
      { headers: { "Cache-Control": "public, s-maxage=60" } }
    );
  } catch (err) {
    console.error("[api/gallery]", err);
    return NextResponse.json({ videos: [], total: 0, hasMore: false }, { status: 500 });
  }
}
