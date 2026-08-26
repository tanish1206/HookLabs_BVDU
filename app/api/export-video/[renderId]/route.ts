// app/api/export-video/[renderId]/route.ts
// GET → polls render status for a given renderId

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ renderId: string }> }
) {
  try {
    const { renderId } = await params;

    // Dynamic import to avoid circular deps
    const { renderStore } = await import("@/lib/store");
    const entry = renderStore.get(renderId);

    if (!entry) {
      return NextResponse.json({ error: "Render not found" }, { status: 404 });
    }

    return NextResponse.json({
      renderId,
      status:      entry.status,
      progress:    entry.progress,
      downloadUrl: entry.downloadUrl ?? null,
    });
  } catch (err) {
    console.error("[api/export-video/[renderId]]", err);
    return NextResponse.json(
      { error: "Status check failed" },
      { status: 500 }
    );
  }
}
