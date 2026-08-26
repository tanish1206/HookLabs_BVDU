// app/api/webhook/trends-refreshed/route.ts
// POST — called by the Python ingest script at the end of each run.
// Validates CRON_SECRET, expires old trends, revalidates the trends cache.

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  // Validate secret
  const secret = req.headers.get("x-webhook-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { expireOldTrends } = await import("@/lib/supabase/trends");
    const expiredCount = await expireOldTrends(30);

    // Revalidate Next.js cache for the trends endpoint
    try { revalidateTag("trends"); } catch { /* revalidateTag may not be available in all envs */ }

    return NextResponse.json({ ok: true, expiredCount });
  } catch (err) {
    console.error("[webhook/trends-refreshed]", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
