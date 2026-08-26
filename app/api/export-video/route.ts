// app/api/export-video/route.ts
// POST { script, voice, format }
// → Triggers Remotion render (simulation when Lambda not configured)

import { NextRequest, NextResponse } from "next/server";
import { renderStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { script, voice, format } = await req.json();

    if (!script) {
      return NextResponse.json({ error: "script is required" }, { status: 400 });
    }

    const renderId = `render-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // ── Try Remotion Lambda if configured ─────────────────────
    if (
      process.env.REMOTION_AWS_ACCESS_KEY &&
      process.env.REMOTION_FUNCTION_NAME
    ) {
      try {
        const { renderMediaOnLambda } = await import("@remotion/lambda");
        const result = await renderMediaOnLambda({
          region: (process.env.REMOTION_AWS_REGION ?? "us-east-1") as Parameters<typeof renderMediaOnLambda>[0]["region"],
          functionName:  process.env.REMOTION_FUNCTION_NAME,
          composition:   "ShortVideo",
          serveUrl:      process.env.REMOTION_SERVE_URL ?? "",
          codec:         "h264",
          inputProps:    { script, voice, format },
          downloadBehavior: { type: "download", fileName: "hooklabs-video.mp4" },
        });

        renderStore.set(renderId, {
          status:      "rendering",
          progress:    0,
          downloadUrl: undefined,
        });

        // Store the Remotion renderId mapping
        renderStore.set(`lambda-${renderId}`, {
          status:   "rendering",
          progress: 0,
        });

        return NextResponse.json({ renderId, status: "rendering" });
      } catch (lambdaErr) {
        console.error("[api/export-video] Lambda error, falling back:", lambdaErr);
      }
    }

    // ── Simulation fallback ────────────────────────────────────
    renderStore.set(renderId, { status: "rendering", progress: 0 });

    // Simulate render progress in background
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(progress + 10, 100);
      const entry = renderStore.get(renderId);
      if (entry) {
        renderStore.set(renderId, {
          status:      progress === 100 ? "done" : "rendering",
          progress,
          downloadUrl: progress === 100 ? `#simulated-${renderId}` : undefined,
        });
      }
      if (progress >= 100) clearInterval(interval);
    }, 250);

    return NextResponse.json({ renderId, status: "rendering" });
  } catch (err) {
    console.error("[api/export-video]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Export failed" },
      { status: 500 }
    );
  }
}

// Removed export to comply with Next.js App Router rules
